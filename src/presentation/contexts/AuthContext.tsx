import React, {
	createContext,
	useState,
	useEffect,
	useCallback,
	useContext,
	useMemo,
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

	// Obtener información de rol del usuario
	const fetchRoleInfo = useCallback(async () => {
		if (!isAuthenticated) {
			setRoleInfo({
				role: null,
				isAdmin: false,
				isSeller: false,
				sellerInfo: null,
				adminInfo: null,
			});
			return;
		}

		setIsLoadingRole(true);
		try {
			const roleData = await RoleService.checkUserRole();

			if (roleData && roleData.success) {
				setRoleInfo({
					role: roleData.data.role,
					isAdmin: roleData.data.is_admin,
					isSeller: roleData.data.is_seller,
					sellerInfo: roleData.data.seller_info || null,
					adminInfo: roleData.data.admin_info || null,
				});

				// Si el usuario no tiene información de rol en el estado, actualizarlo
				if (user && !user.role) {
					setUser({
						...user,
						role: roleData.data.role,
					});
				}
			}
		} catch (error) {
			console.error("Error al obtener información de rol:", error);
		} finally {
			setIsLoadingRole(false);
		}
	}, [isAuthenticated, user]);

	// Método público para actualizar información de rol
	const refreshRoleInfo = useCallback(async () => {
		await fetchRoleInfo();
	}, [fetchRoleInfo]);

	// Verificar si hay un token guardado al cargar
	useEffect(() => {
		const checkAuth = async () => {
			const token = storageService.getItem(appConfig.storage.authTokenKey);

			if (token) {
				setIsAuthenticated(true);

				// También intentar obtener datos del usuario si están almacenados
				const userData = storageService.getItem(appConfig.storage.userKey);
				if (userData) {
					setUser(userData);
				}

				// Obtener información de rol
				await fetchRoleInfo();
			} else {
				// Si no hay token, asegurarnos de que el estado sea consistente
				setIsAuthenticated(false);
				setUser(null);

				// Limpiar caché de roles
				RoleService.clearRoleCache();
			}

			setInitialized(true);
		};

		checkAuth();
	}, [fetchRoleInfo]);

	// Guardar datos del usuario en localStorage cuando cambian
	useEffect(() => {
		if (user) {
			storageService.setItem(appConfig.storage.userKey, user);
		} else if (initialized) {
			// Solo limpiar si ya se inicializó y el usuario se estableció a null explícitamente
			storageService.removeItem(appConfig.storage.userKey);
		}
	}, [user, initialized]);

	// Mantener token y estado de autenticación sincronizados
	useEffect(() => {
		if (!isAuthenticated && initialized) {
			// Si se desautentica, limpiar el token y datos de usuario
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);

			// Limpiar caché de roles
			RoleService.clearRoleCache();

			if (user !== null) {
				setUser(null);
			}
		}
	}, [isAuthenticated, initialized, user]);

	// Implementación de la función de logout
	const logout = useCallback(async (): Promise<void> => {
		try {
			//Logout
			await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT) 
			
			// Limpiar datos de sesión locales
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);

			// Limpiar otras posibles claves relacionadas con la sesión
			storageService.removeItem(appConfig.storage.refreshTokenKey);
			storageService.removeItem(appConfig.storage.cartKey);

			// Limpiar caché de roles
			RoleService.clearRoleCache();

			// Actualizar el estado
			setIsAuthenticated(false);
			setUser(null);
			setRoleInfo({
				role: null,
				isAdmin: false,
				isSeller: false,
				sellerInfo: null,
				adminInfo: null,
			});

			console.log("Logout exitoso");
		} catch (error) {
			console.error("Error durante el logout:", error);

			// Incluso si hay un error en la API, limpiamos el estado local
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);
			RoleService.clearRoleCache();

			setIsAuthenticated(false);
			setUser(null);
			setRoleInfo({
				role: null,
				isAdmin: false,
				isSeller: false,
				sellerInfo: null,
				adminInfo: null,
			});
		}
	}, []);

	// Memorizar valor del contexto para evitar rerenderizaciones innecesarias
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
