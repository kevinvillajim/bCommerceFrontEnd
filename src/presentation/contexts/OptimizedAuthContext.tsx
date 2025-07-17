// src/presentation/contexts/OptimizedAuthContext.tsx

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
import {
	useSecureAuth,
	type OptimizedUserRoleInfo,
} from "../hooks/useSecureAuth";
import axiosInstance from "../../infrastructure/api/axiosConfig";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

// Endpoint fallback en caso de que no esté definido
const LOGOUT_ENDPOINT = API_ENDPOINTS?.AUTH?.LOGOUT || "/api/auth/logout";

// Crear instancia del servicio de almacenamiento
const storageService = new LocalStorageService();

// Definir interfaz para el contexto optimizado
interface OptimizedAuthContextProps {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	isAuthenticated: boolean;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	logout: () => Promise<void>;
	roleInfo: OptimizedUserRoleInfo;
	isLoadingRole: boolean;
	roleError: string | null;
	refreshRoleInfo: (critical?: boolean) => Promise<void>;
	isInitialized: boolean;
	getDefaultRouteForRole: () => string;
	// Funciones de verificación rápida
	isAdmin: (critical?: boolean) => Promise<boolean>;
	isSeller: (critical?: boolean) => Promise<boolean>;
	// Utilidades
	clearRoleCache: () => void;
	hasRole: boolean;
	lastRoleUpdate: number;
}

// Crear el contexto con valores por defecto
export const OptimizedAuthContext = createContext<OptimizedAuthContextProps>({
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
		lastUpdated: 0,
	},
	isLoadingRole: false,
	roleError: null,
	refreshRoleInfo: async () => {},
	isInitialized: false,
	getDefaultRouteForRole: () => "/",
	isAdmin: async () => false,
	isSeller: async () => false,
	clearRoleCache: () => {},
	hasRole: false,
	lastRoleUpdate: 0,
});

// Props para el proveedor
interface OptimizedAuthProviderProps {
	children: ReactNode;
}

// Proveedor del contexto optimizado
export const OptimizedAuthProvider: React.FC<OptimizedAuthProviderProps> = ({
	children,
}) => {
	// Estados principales
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [initialized, setInitialized] = useState<boolean>(false);

	// Referencias para controlar flujos
	const isAuthenticatedRef = useRef(false);
	const userRef = useRef<User | null>(null);
	const isInitializationComplete = useRef(false);

	// Hook de autenticación segura
	const {
		roleInfo,
		isLoadingRole,
		roleError,
		fetchRoleInfo,
		refreshRoleInfo: refreshSecureRoleInfo,
		clearRoleCache,
		isAdmin: checkIsAdmin,
		isSeller: checkIsSeller,
		getDefaultRouteForRole: getSecureDefaultRoute,
		hasRole,
		lastUpdated: lastRoleUpdate,
	} = useSecureAuth();

	// Actualizar refs cuando cambian los estados
	useEffect(() => {
		isAuthenticatedRef.current = isAuthenticated;
	}, [isAuthenticated]);

	useEffect(() => {
		userRef.current = user;
	}, [user]);

	// Función para obtener la ruta por defecto según el rol
	const getDefaultRouteForRole = useCallback(() => {
		return getSecureDefaultRoute();
	}, [getSecureDefaultRoute]);

	// Función para redirección automática en inicialización
	const handleInitialRedirection = useCallback(() => {
		const currentPath = window.location.pathname;

		// SOLO redirigir automáticamente si estamos en páginas de autenticación
		const isAuthPage =
			["/login", "/register"].includes(currentPath) ||
			currentPath.startsWith("/auth");

		if (!isAuthPage) {
			console.log(
				"No estamos en página de auth, no redireccionar automáticamente"
			);
			return;
		}

		// Si estamos en una página de auth y el usuario ya está logueado automáticamente, redirigir
		if (isAuthenticated && hasRole && isInitializationComplete.current) {
			const targetPath = getDefaultRouteForRole();
			console.log(
				`Redirección automática desde ${currentPath} a ${targetPath}`
			);

			setTimeout(() => {
				window.location.replace(targetPath);
			}, 100);
		}
	}, [isAuthenticated, hasRole, getDefaultRouteForRole]);

	// Método público para actualizar información de rol
	const refreshRoleInfo = useCallback(
		async (critical: boolean = false) => {
			await refreshSecureRoleInfo(critical);
		},
		[refreshSecureRoleInfo]
	);

	// Verificar si hay un token guardado al cargar - UNA SOLA VEZ
	useEffect(() => {
		if (isInitializationComplete.current) return;

		const initializeAuth = async () => {
			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token) {
					console.log("Token encontrado, inicializando autenticación...");
					setIsAuthenticated(true);
					isAuthenticatedRef.current = true;

					// Obtener datos de usuario del localStorage
					const userData = storageService.getItem(appConfig.storage.userKey);
					if (userData) {
						setUser(userData);
						userRef.current = userData;
						console.log(
							"Datos de usuario cargados desde localStorage:",
							userData
						);
					}

					// Cargar información de rol usando el sistema seguro
					await fetchRoleInfo(false, false);
				} else {
					console.log("No hay token, usuario no autenticado");
					setIsAuthenticated(false);
					setUser(null);
					clearRoleCache();
				}
			} catch (error) {
				console.error(
					"Error durante la inicialización de autenticación:",
					error
				);
				setIsAuthenticated(false);
				setUser(null);
				clearRoleCache();
			} finally {
				setInitialized(true);
				isInitializationComplete.current = true;
			}
		};

		initializeAuth();
	}, [fetchRoleInfo, clearRoleCache]);

	// Efecto para redirección automática cuando se carga el rol
	useEffect(() => {
		if (isInitializationComplete.current && hasRole) {
			setTimeout(() => {
				handleInitialRedirection();
			}, 300);
		}
	}, [hasRole, handleInitialRedirection]);

	// Sincronizar datos de usuario con localStorage
	useEffect(() => {
		if (!initialized) return;

		if (user) {
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
					await axiosInstance.post(LOGOUT_ENDPOINT);
				} catch (error) {
					console.error("Error al hacer logout en el servidor:", error);
				}
			}

			// Limpiar datos locales (siempre, incluso si falla el servidor)
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);
			storageService.removeItem(appConfig.storage.refreshTokenKey);
			storageService.removeItem(appConfig.storage.cartKey);

			// Limpiar caché de roles usando el sistema seguro
			clearRoleCache();

			// Reiniciar flags
			isAuthenticatedRef.current = false;
			userRef.current = null;

			// Actualizar estados
			setIsAuthenticated(false);
			setUser(null);

			console.log("Logout completado exitosamente");
		} catch (error) {
			console.error("Error durante el proceso de logout:", error);

			// Incluso en caso de error, asegurar que se limpien datos locales
			storageService.removeItem(appConfig.storage.authTokenKey);
			storageService.removeItem(appConfig.storage.userKey);
			clearRoleCache();

			setIsAuthenticated(false);
			setUser(null);
		}
	}, [clearRoleCache]);

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
			roleError,
			refreshRoleInfo,
			isInitialized: initialized,
			getDefaultRouteForRole,
			isAdmin: checkIsAdmin,
			isSeller: checkIsSeller,
			clearRoleCache,
			hasRole,
			lastRoleUpdate,
		}),
		[
			user,
			setUser,
			isAuthenticated,
			setIsAuthenticated,
			logout,
			roleInfo,
			isLoadingRole,
			roleError,
			refreshRoleInfo,
			initialized,
			getDefaultRouteForRole,
			checkIsAdmin,
			checkIsSeller,
			clearRoleCache,
			hasRole,
			lastRoleUpdate,
		]
	);

	return (
		<OptimizedAuthContext.Provider value={contextValue}>
			{children}
		</OptimizedAuthContext.Provider>
	);
};

// Hook de utilidad para consumir el contexto optimizado
export const useOptimizedAuth = () => {
	const context = useContext(OptimizedAuthContext);
	if (!context) {
		throw new Error(
			"useOptimizedAuth debe usarse dentro de un OptimizedAuthProvider"
		);
	}
	return context;
};

export default OptimizedAuthProvider;
