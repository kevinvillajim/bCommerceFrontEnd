// src/presentation/contexts/AuthContext.tsx (VERSIÓN UNIFICADA Y OPTIMIZADA - MANTENIENDO REDIRECCIÓN ORIGINAL)

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
import {OptimizedRoleService} from "../../infrastructure/services/OptimizedRoleService";
import {CacheService} from "../../infrastructure/services/CacheService";
import axiosInstance, {setGlobalClearSessionData} from "../../infrastructure/api/axiosConfig";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

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

// Cache keys
const CACHE_KEYS = {
	ROLE_INFO: "auth_role_info",
	USER_DATA: "auth_user_data",
};

// Tiempos de cache (en milisegundos)
const CACHE_TIMES = {
	ROLE_INFO: 5 * 60 * 1000, // 5 minutos
	USER_DATA: 10 * 60 * 1000, // 10 minutos
};

// Definir interfaz para el contexto
interface AuthContextProps {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	isAuthenticated: boolean;
	setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
	logout: () => Promise<void>;
	clearSessionData: () => void;
	roleInfo: UserRoleInfo;
	isLoadingRole: boolean;
	refreshRoleInfo: () => Promise<void>;
	isInitialized: boolean;
	getDefaultRouteForRole: () => string;
	updateUser?: (userData: Partial<User>) => void;
	// Funciones optimizadas de roles
	isAdmin: (critical?: boolean) => Promise<boolean>;
	isSeller: (critical?: boolean) => Promise<boolean>;
}

// Crear el contexto con valores por defecto
export const AuthContext = createContext<AuthContextProps>({
	user: null,
	setUser: () => {},
	isAuthenticated: false,
	setIsAuthenticated: () => {},
	logout: async () => {},
	clearSessionData: () => {},
	roleInfo: {
		role: null,
		isAdmin: false,
		isSeller: false,
		sellerInfo: null,
		adminInfo: null,
	},
	isLoadingRole: false,
	refreshRoleInfo: async () => {},
	isInitialized: false,
	getDefaultRouteForRole: () => "/",
	isAdmin: async () => false,
	isSeller: async () => false,
});

// Props para el proveedor
interface AuthProviderProps {
	children: ReactNode;
}

// Proveedor del contexto UNIFICADO Y OPTIMIZADO
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

	// Función para obtener la ruta por defecto según el rol
	const getDefaultRouteForRole = useCallback(() => {
		if (roleInfo.isAdmin) {
			return "/admin/dashboard";
		} else if (roleInfo.isSeller) {
			return "/seller/dashboard";
		}
		return "/";
	}, [roleInfo]);

	const updateUser = useCallback((userData: Partial<User>) => {
  if (user) {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    // Opcionalmente, guardar en localStorage si usas persistencia
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }
}, [user]);

	// Función SOLO para redirección automática en inicialización
	const handleInitialRedirection = useCallback(() => {
		const currentPath = window.location.pathname;

		// SOLO redirigir automáticamente si estamos en páginas de autenticación Y es inicialización automática
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
		if (isAuthenticated && roleInfo.role && isInitializationComplete.current) {
			const targetPath = getDefaultRouteForRole();
			console.log(
				`🔄 Redirección automática desde ${currentPath} a ${targetPath}`
			);

			setTimeout(() => {
				window.location.replace(targetPath);
			}, 100);
		}
	}, [isAuthenticated, roleInfo, getDefaultRouteForRole]);

	// Función OPTIMIZADA para obtener información de rol (MANTENIENDO LÓGICA ORIGINAL)
	const fetchRoleInfo = useCallback(async () => {
		// Verificaciones de salida temprana (EXACTAMENTE COMO EN TU ORIGINAL)
		if (
			!isAuthenticatedRef.current ||
			isLoadingRole ||
			hasFetchedRole.current
		) {
			return;
		}

		setIsLoadingRole(true);
		try {
			console.log("Obteniendo información de rol del usuario...");

			// OPTIMIZACIÓN: Verificar cache solo si no es inicialización
			if (!isInitializationComplete.current) {
				const cachedRoleInfo = CacheService.getItem(CACHE_KEYS.ROLE_INFO);
				if (cachedRoleInfo) {
					console.log("🔐 Usando roleInfo desde cache (no-inicialización)");
					setRoleInfo(cachedRoleInfo);
					hasFetchedRole.current = true;
					return;
				}
			}

			// MEJORADO: Intentar OptimizedRoleService primero, fallback a RoleService
			let roleData = null;
			try {
				roleData = await OptimizedRoleService.checkUserRole(true, false);
				console.log("✅ Usando OptimizedRoleService en fetchRoleInfo");
			} catch (error) {
				console.log(
					"⚠️ OptimizedRoleService no disponible, usando RoleService:",
					error
				);
				roleData = await RoleService.checkUserRole(true);
			}

			if (roleData && roleData.success) {
				const newRoleInfo = {
					role: roleData.data.role,
					isAdmin: roleData.data.is_admin,
					isSeller: roleData.data.is_seller,
					sellerInfo: roleData.data.seller_info || null,
					adminInfo: roleData.data.admin_info || null,
				};

				console.log("Información de rol obtenida:", newRoleInfo);
				setRoleInfo(newRoleInfo);

				// Guardar en cache DESPUÉS de establecer el estado
				CacheService.setItem(
					CACHE_KEYS.ROLE_INFO,
					newRoleInfo,
					CACHE_TIMES.ROLE_INFO
				);

				// Actualizar el rol en usuario si es necesario (EXACTAMENTE COMO EN TU ORIGINAL)
				if (userRef.current && !userRef.current.role) {
					setUser((prevUser) => {
						if (!prevUser) return null;
						return {...prevUser, role: roleData.data.role};
					});
				}

				// Marcar que ya obtuvimos el rol (EXACTAMENTE COMO EN TU ORIGINAL)
				hasFetchedRole.current = true;

				// SOLO redirigir automáticamente si estamos en inicialización (EXACTAMENTE COMO EN TU ORIGINAL)
				if (isInitializationComplete.current) {
					setTimeout(() => {
						handleInitialRedirection();
					}, 300);
				}
			}
		} catch (error) {
			console.error("Error al obtener información de rol:", error);
		} finally {
			setIsLoadingRole(false);
		}
	}, [isLoadingRole, handleInitialRedirection]);

	// Método público para actualizar información de rol (MEJORADO PERO MANTENIENDO LÓGICA ORIGINAL)
	const refreshRoleInfo = useCallback(async () => {
		// Limpiar cache antes del refresh para forzar consulta fresca
		CacheService.removeItem(CACHE_KEYS.ROLE_INFO);
		hasFetchedRole.current = false;

		setIsLoadingRole(true);
		try {
			console.log("Refrescando información de rol del usuario...");

			// MEJORADO: Intentar OptimizedRoleService primero, fallback a RoleService
			let roleData = null;
			try {
				roleData = await OptimizedRoleService.checkUserRole(true, false);
				console.log("✅ Usando OptimizedRoleService en refreshRoleInfo");
			} catch (error) {
				console.log(
					"⚠️ OptimizedRoleService no disponible, usando RoleService:",
					error
				);
				roleData = await RoleService.checkUserRole(true);
			}

			if (roleData && roleData.success) {
				const newRoleInfo = {
					role: roleData.data.role,
					isAdmin: roleData.data.is_admin,
					isSeller: roleData.data.is_seller,
					sellerInfo: roleData.data.seller_info || null,
					adminInfo: roleData.data.admin_info || null,
				};

				console.log("Información de rol refrescada:", newRoleInfo);
				setRoleInfo(newRoleInfo);

				// Guardar en cache
				CacheService.setItem(
					CACHE_KEYS.ROLE_INFO,
					newRoleInfo,
					CACHE_TIMES.ROLE_INFO
				);

				// Actualizar el rol en usuario si es necesario (EXACTAMENTE COMO EN TU ORIGINAL)
				if (userRef.current && !userRef.current.role) {
					setUser((prevUser) => {
						if (!prevUser) return null;
						return {...prevUser, role: roleData.data.role};
					});
				}

				// Marcar que ya obtuvimos el rol (EXACTAMENTE COMO EN TU ORIGINAL)
				hasFetchedRole.current = true;
			}
		} catch (error) {
			console.error("Error al refrescar información de rol:", error);
		} finally {
			setIsLoadingRole(false);
		}
	}, []);

	// Funciones optimizadas de verificación de roles
	const isAdmin = useCallback(
		async (critical: boolean = false): Promise<boolean> => {
			try {
				if (critical) {
					return await OptimizedRoleService.isAdminCritical();
				} else {
					return await OptimizedRoleService.isAdmin();
				}
			} catch (error) {
				console.warn("⚠️ OptimizedRoleService falló, usando roleInfo:", error);
				return roleInfo.isAdmin;
			}
		},
		[roleInfo.isAdmin]
	);

	const isSeller = useCallback(
		async (critical: boolean = false): Promise<boolean> => {
			try {
				if (critical) {
					return await OptimizedRoleService.isSellerCritical();
				} else {
					return await OptimizedRoleService.isSeller();
				}
			} catch (error) {
				console.warn("⚠️ OptimizedRoleService falló, usando roleInfo:", error);
				return roleInfo.isSeller;
			}
		},
		[roleInfo.isSeller]
	);

	// Inicialización OPTIMIZADA - solo UNA VEZ
	useEffect(() => {
		if (isInitializationComplete.current) return;

		const initializeAuth = async () => {
			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token) {
					console.log("🔑 Token encontrado, inicializando autenticación...");
					setIsAuthenticated(true);
					isAuthenticatedRef.current = true;

					// Verificar cache de usuario primero
					let userData = CacheService.getItem(CACHE_KEYS.USER_DATA);
					if (!userData) {
						userData = storageService.getItem(appConfig.storage.userKey);
						if (userData) {
							// Guardar en cache para próximas consultas
							CacheService.setItem(
								CACHE_KEYS.USER_DATA,
								userData,
								CACHE_TIMES.USER_DATA
							);
						}
					}

					if (userData) {
						setUser(userData);
						userRef.current = userData;
						console.log("👤 Datos de usuario cargados (cache/localStorage)");
					}

					// Cargar información de rol de manera optimizada (LLAMADA SIN PARÁMETROS)
					await fetchRoleInfo();
				} else {
					console.log("❌ No hay token, usuario no autenticado");
					setIsAuthenticated(false);
					setUser(null);
					// Limpiar cache
					CacheService.removeItem(CACHE_KEYS.ROLE_INFO);
					CacheService.removeItem(CACHE_KEYS.USER_DATA);
					OptimizedRoleService.clearAllCache();
				}
			} catch (error) {
				console.error("❌ Error durante la inicialización:", error);
				setIsAuthenticated(false);
				setUser(null);
			} finally {
				setInitialized(true);
				isInitializationComplete.current = true;
			}
		};

		initializeAuth();
	}, [fetchRoleInfo]);

	// Sincronizar datos de usuario con localStorage Y cache
	useEffect(() => {
		if (!initialized) return;

		if (user) {
			const storedUser = storageService.getItem(appConfig.storage.userKey);
			const currentUserStr = JSON.stringify(user);
			const storedUserStr = storedUser ? JSON.stringify(storedUser) : "";

			if (currentUserStr !== storedUserStr) {
				storageService.setItem(appConfig.storage.userKey, user);
				CacheService.setItem(CACHE_KEYS.USER_DATA, user, CACHE_TIMES.USER_DATA);
			}
		} else if (initialized) {
			storageService.removeItem(appConfig.storage.userKey);
			CacheService.removeItem(CACHE_KEYS.USER_DATA);
		}
	}, [user, initialized]);

	// Función global para limpieza completa de datos de sesión
	const clearSessionData = useCallback(() => {
		console.log("🧹 Iniciando limpieza completa de datos de sesión...");

		// Limpiar datos locales específicos
		storageService.removeItem(appConfig.storage.authTokenKey);
		storageService.removeItem(appConfig.storage.userKey);
		storageService.removeItem(appConfig.storage.refreshTokenKey);
		storageService.removeItem(appConfig.storage.cartKey);

		// Limpiar cache
		CacheService.removeItem(CACHE_KEYS.ROLE_INFO);
		CacheService.removeItem(CACHE_KEYS.USER_DATA);
		OptimizedRoleService.clearAllCache();

		// Limpieza inteligente basada en análisis de datos reales
		// PRESERVAR: Configuraciones de usuario y sistema
		const preserveInLocalStorage = [
			'user_theme', // Tema del usuario - UX crítica
		];

		// PRESERVAR: Configuraciones técnicas que mejoran rendimiento
		const preserveInSessionStorage = [
			'bcommerce_shipping_config', // Config de envío - evita llamadas API
			'bcommerce_volume_discount_config', // Config de descuentos - evita llamadas API
		];

		// ELIMINAR de localStorage: Datos específicos del usuario
		const authRelatedKeys = [
			'user_data', // Datos del usuario - SEGURIDAD
			'cache_user_role_data', // Roles del usuario - SEGURIDAD
		];

		// ELIMINAR: Tokens y datos sensibles (pattern matching)
		const sensitivePatterns = [
			/^eyJ/, // JWT tokens (empiezan con eyJ)
			/^cache_header_counters/, // Contadores específicos del usuario
			/^cache_products_/, // Cache de productos - puede estar desactualizado
		];

		// Limpiar localStorage
		authRelatedKeys.forEach(key => localStorage.removeItem(key));

		// Limpiar por patrones
		const localStorageKeys = Object.keys(localStorage);
		localStorageKeys.forEach(key => {
			const shouldRemove = sensitivePatterns.some(pattern => pattern.test(key));
			if (shouldRemove && !preserveInLocalStorage.includes(key)) {
				localStorage.removeItem(key);
			}
		});

		// Limpiar sessionStorage selectivamente
		const sessionKeys = Object.keys(sessionStorage);
		sessionKeys.forEach(key => {
			// Solo mantener configs técnicas y flags de prefetch
			if (!preserveInSessionStorage.includes(key) &&
				!key.includes('_executed') && // prefetch flags
				!key.includes('autoprefetch')) {
				sessionStorage.removeItem(key);
			}
		});

		console.log("✅ Limpieza inteligente completada - Preservadas configs técnicas");

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
	}, []);

	// Implementación OPTIMIZADA de logout
	const logout = useCallback(async (): Promise<void> => {
		try {
			if (isAuthenticatedRef.current) {
				try {
					await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
				} catch (error) {
					console.error("❌ Error al hacer logout en el servidor:", error);
				}
			}

			// Usar la función de limpieza global
			clearSessionData();

			console.log("✅ Logout completado exitosamente");
		} catch (error) {
			console.error("❌ Error durante el proceso de logout:", error);
			// Asegurar limpieza local incluso en error
			clearSessionData();
		}
	}, [clearSessionData]);

	// Registrar clearSessionData en axiosConfig
	useEffect(() => {
		setGlobalClearSessionData(clearSessionData);
	}, [clearSessionData]);

	// Memorizar el contexto para evitar renderizaciones innecesarias
	const contextValue = useMemo(
		() => ({
			user,
			setUser,
			isAuthenticated,
			setIsAuthenticated,
			logout,
			clearSessionData,
			roleInfo,
			isLoadingRole,
			refreshRoleInfo,
			isInitialized: initialized,
			getDefaultRouteForRole,
			isAdmin,
			isSeller,
			updateUser,
		}),
		[
			user,
			isAuthenticated,
			logout,
			clearSessionData,
			roleInfo,
			isLoadingRole,
			refreshRoleInfo,
			initialized,
			getDefaultRouteForRole,
			isAdmin,
			isSeller,
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
