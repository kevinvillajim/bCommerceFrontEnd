import React, {
	createContext,
	useState,
	useEffect,
	useCallback,
	useContext,
	useMemo,
	useRef,
} from "react";
import type {ReactNode} from "react";
import {LocalStorageService} from "../../infrastructure/services/LocalStorageService";
import type {User} from "../../core/domain/entities/User";
import appConfig from "../../config/appConfig";
import RoleService from "../../infrastructure/services/RoleService";
import axiosInstance from "../../infrastructure/api/axiosConfig";
import API_ENDPOINTS from "@/constants/apiEndpoints";

// Interfaz para información de rol
interface UserRoleInfo {
	role: string | null;
	isAdmin: boolean;
	isSeller: boolean;
	sellerInfo?: {
		id: number;
		store_name: string;
		status: string;
		verification_level: string;
	} | null;
	adminInfo?: {
		id: number;
		role: string;
		permissions: string[];
	} | null;
}

// Crear instancia del servicio de almacenamiento
const storageService = new LocalStorageService();

// Definir interfaz para el contexto
interface AuthContextProps {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	isAuthenticated: boolean;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	logout: () => Promise<void>;
	roleInfo: UserRoleInfo;
	isLoadingRole: boolean;
	refreshRoleInfo: () => Promise<void>;
}

// Crear el contexto con valores por defecto
export const AuthContext = createContext<AuthContextProps>({
	user: null,
	setUser: () => {},
	isAuthenticated: false,
	setIsAuthenticated: () => {},
	logout: async () => {},
	roleInfo: {
		role: null,
		isAdmin: false,
		isSeller: false,
		sellerInfo: null,
		adminInfo: null,
	},
	isLoadingRole: false,
	refreshRoleInfo: async () => {},
});

// Props para el proveedor
interface AuthProviderProps {
	children: ReactNode;
}

// Proveedor del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
	// Estados principales
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [initialized, setInitialized] = useState<boolean>(false);
	const [isLoadingRole, setIsLoadingRole] = useState<boolean>(false);
	const [roleInfo, setRoleInfo] = useState<UserRoleInfo>({
		role: null,
		isAdmin: false,
		isSeller: false,
		sellerInfo: null,
		adminInfo: null,
	});

	// Referencias para controlar flujos
	const hasFetchedRole = useRef(false);
	const isAuthenticatedRef = useRef(false);
	const userRef = useRef<User | null>(null);
	const isInitializationComplete = useRef(false);

	// Actualizar refs cuando cambian los estados
	useEffect(() => {
		isAuthenticatedRef.current = isAuthenticated;
	}, [isAuthenticated]);

	useEffect(() => {
		userRef.current = user;
	}, [user]);

	// Obtener información de rol del usuario
	const fetchRoleInfo = useCallback(async () => {
		// Verificaciones de salida temprana
		if (
			!isAuthenticatedRef.current ||
			isLoadingRole ||
			hasFetchedRole.current
		) {
			return;
		}

		setIsLoadingRole(true);
		try {
			const roleData = await RoleService.checkUserRole();

			if (roleData && roleData.success) {
				const newRoleInfo = {
					role: roleData.data.role,
					isAdmin: roleData.data.is_admin,
					isSeller: roleData.data.is_seller,
					sellerInfo: roleData.data.seller_info || null,
					adminInfo: roleData.data.admin_info || null,
				};

				setRoleInfo(newRoleInfo);

				// Actualizar el rol en usuario si es necesario
				if (userRef.current && !userRef.current.role) {
					setUser((prevUser) => {
						if (!prevUser) return null;
						return {...prevUser, role: roleData.data.role};
					});
				}

				// Marcar que ya obtuvimos el rol
				hasFetchedRole.current = true;
			}
		} catch (error) {
			console.error("Error al obtener información de rol:", error);
		} finally {
			setIsLoadingRole(false);
		}
	}, [isLoadingRole]);

	// Método público para actualizar información de rol
	const refreshRoleInfo = useCallback(async () => {
		hasFetchedRole.current = false;
		await fetchRoleInfo();
	}, [fetchRoleInfo]);

	// Verificar si hay un token guardado al cargar - UNA SOLA VEZ
	useEffect(() => {
		if (isInitializationComplete.current) return;

		const initializeAuth = async () => {
			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token) {
					// El usuario está autenticado
					setIsAuthenticated(true);
					isAuthenticatedRef.current = true;

					// Obtener datos de usuario del localStorage
					const userData = storageService.getItem(appConfig.storage.userKey);
					if (userData) {
						setUser(userData);
						userRef.current = userData;
					}

					// Cargar información de rol (solo si el usuario está autenticado)
					fetchRoleInfo();
				} else {
					// El usuario no está autenticado
					setIsAuthenticated(false);
					setUser(null);
					// Limpiar caché de roles
					RoleService.clearRoleCache();
				}
			} catch (error) {
				console.error(
					"Error durante la inicialización de autenticación:",
					error
				);
				// En caso de error, asegurar que el usuario está desconectado
				setIsAuthenticated(false);
				setUser(null);
			} finally {
				setInitialized(true);
				isInitializationComplete.current = true;
			}
		};

		initializeAuth();
		// Esta dependencia de fetchRoleInfo debe mantenerse para tener acceso a la versión actualizada
	}, [fetchRoleInfo]);

	// Sincronizar datos de usuario con localStorage
	useEffect(() => {
		// Solo ejecutar si la inicialización está completa
		if (!initialized) return;

		if (user) {
			// Verificar si el usuario ha cambiado antes de guardar
			const storedUser = storageService.getItem(appConfig.storage.userKey);
			const currentUserStr = JSON.stringify(user);
			const storedUserStr = storedUser ? JSON.stringify(storedUser) : "";

			if (currentUserStr !== storedUserStr) {
				storageService.setItem(appConfig.storage.userKey, user);
			}
		} else if (initialized) {
			storageService.removeItem(appConfig.storage.userKey);
		}
	}, [user, initialized]);

	// Implementación de la función de logout
	const logout = useCallback(async (): Promise<void> => {
		try {
			// Intentar logout en el servidor
			if (isAuthenticatedRef.current) {
				try {
					await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
				} catch (error) {
					console.error("Error al hacer logout en el servidor:", error);
				}
			}

			// Limpiar datos locales (siempre, incluso si falla el servidor)
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);
			storageService.removeItem(appConfig.storage.refreshTokenKey);
			storageService.removeItem(appConfig.storage.cartKey);

			// Limpiar caché de roles
			RoleService.clearRoleCache();

			// Reiniciar flags
			hasFetchedRole.current = false;
			isAuthenticatedRef.current = false;
			userRef.current = null;

			// Actualizar estados
			setIsAuthenticated(false);
			setUser(null);
			setRoleInfo({
				role: null,
				isAdmin: false,
				isSeller: false,
				sellerInfo: null,
				adminInfo: null,
			});

			console.log("Logout completado exitosamente");
		} catch (error) {
			console.error("Error durante el proceso de logout:", error);

			// Incluso en caso de error, asegurar que se limpien datos locales
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);
			RoleService.clearRoleCache();

			setIsAuthenticated(false);
			setUser(null);
		}
	}, []);

	// Memorizar el contexto para evitar renderizaciones innecesarias
	const contextValue = useMemo(
		() => ({
			user,
			setUser,
			isAuthenticated,
			setIsAuthenticated,
			logout,
			roleInfo,
			isLoadingRole,
			refreshRoleInfo,
		}),
		[
			user,
			setUser,
			isAuthenticated,
			setIsAuthenticated,
			logout,
			roleInfo,
			isLoadingRole,
			refreshRoleInfo,
		]
	);

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
};

// Hook de utilidad para consumir el contexto
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth debe usarse dentro de un AuthProvider");
	}
	return context;
};

export default AuthProvider;
