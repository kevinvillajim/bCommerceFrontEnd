// src/presentation/hooks/useAuth.ts (OPTIMIZADO)

import {useState, useCallback, useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";
import LoginUseCase from "../../core/useCases/user/LoginUseCase";
import RegisterUseCase from "../../core/useCases/user/RegisterUseCase";
import UpdateProfileUseCase from "../../core/useCases/user/UpdateProfileUseCase";
import GoogleLoginUseCase from "../../core/useCases/user/GoogleLoginUseCase";
import GoogleRegisterUseCase from "../../core/useCases/user/GoogleRegisterUseCase";
import type {
	UserLoginData,
	UserRegistrationData,
	UserProfileUpdateData,
} from "../../core/domain/entities/User";
import {CacheService} from "../../infrastructure/services/CacheService";

// Crear instancias de servicios y casos de uso
const loginUseCase = new LoginUseCase();
const registerUseCase = new RegisterUseCase();
const updateProfileUseCase = new UpdateProfileUseCase();
const googleLoginUseCase = new GoogleLoginUseCase();
const googleRegisterUseCase = new GoogleRegisterUseCase();

// Cache keys
const CACHE_KEYS = {
	USER_DATA: "auth_user_data",
	ROLE_INFO: "auth_role_info",
};

/**
 * Hook optimizado para operaciones de autenticación
 */
export const useAuth = () => {
	// Obtener todo del contexto unificado
	const {
		user,
		setUser,
		isAuthenticated,
		setIsAuthenticated,
		logout: contextLogout,
		roleInfo,
		isLoadingRole,
		refreshRoleInfo,
		isInitialized,
		getDefaultRouteForRole,
		isAdmin: contextIsAdmin,
		isSeller: contextIsSeller,
	} = useContext(AuthContext);

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	/**
	 * OPTIMIZADO: Iniciar sesión de usuario
	 */
	const login = useCallback(
		async (credentials: UserLoginData) => {
			setLoading(true);
			setError(null);

			try {
				console.log("🔑 Iniciando login...");
				const response = await loginUseCase.execute(credentials);

				if (response && response.user) {
					console.log("✅ Login exitoso");
					setUser(response.user);
					setIsAuthenticated(true);

					// Limpiar cache antes del refresh para obtener datos frescos
					CacheService.removeItem(CACHE_KEYS.ROLE_INFO);

					// Refrescar información de rol después del login
					await refreshRoleInfo();

					return response;
				} else {
					throw new Error("No se recibió información de usuario válida");
				}
			} catch (err: any) {
				let errorMessage = "Error al iniciar sesión";
				
				// Check if it's an email verification error
				if (err.response?.status === 409 && err.response?.data?.error_code === 'EMAIL_NOT_VERIFIED') {
					errorMessage = err.response.data.message || "Debes verificar tu email antes de iniciar sesión";
				} else if (err instanceof Error) {
					errorMessage = err.message;
				} else if (err.response?.data?.message) {
					errorMessage = err.response.data.message;
				}
				
				console.error("❌ Login error:", errorMessage);
				setError(errorMessage);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[setUser, setIsAuthenticated, refreshRoleInfo]
	);

	/**
	 * OPTIMIZADO: Registrar nuevo usuario
	 */
	const register = useCallback(
		async (userData: UserRegistrationData) => {
			setLoading(true);
			setError(null);

			try {
				console.log("📝 Iniciando registro...");
				const response = await registerUseCase.execute(userData);

				if (response && response.user) {
					console.log("✅ Registro exitoso - Usuario creado sin iniciar sesión automáticamente");
					
					// NO iniciar sesión automáticamente
					// El usuario debe verificar su email primero
					return response;
				} else {
					throw new Error("No se recibió información de usuario válida");
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al registrar usuario";
				console.error("❌ Register error:", errorMessage);
				setError(errorMessage);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[setUser, setIsAuthenticated, refreshRoleInfo]
	);

	/**
	 * OPTIMIZADO: Login with Google
	 */
	const loginWithGoogle = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			console.log("🔐 Iniciando login con Google...");
			const result = await googleLoginUseCase.execute();

			if (result) {
				console.log("✅ Login con Google exitoso");
				setUser(result.user);
				setIsAuthenticated(true);

				// Limpiar cache antes del refresh
				CacheService.removeItem(CACHE_KEYS.ROLE_INFO);

				// Refrescar información de rol
				await refreshRoleInfo();

				return result;
			}

			return null;
		} catch (error) {
			console.error("❌ Error en login con Google:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Error desconocido al iniciar sesión con Google";
			setError(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	}, [setUser, setIsAuthenticated, refreshRoleInfo]);

	/**
	 * OPTIMIZADO: Register with Google
	 */
	const registerWithGoogle = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			console.log("🔐 Iniciando registro con Google...");
			const result = await googleRegisterUseCase.execute();

			if (result) {
				console.log("✅ Registro con Google exitoso");
				setUser(result.user);
				setIsAuthenticated(true);

				// Limpiar cache antes del refresh
				CacheService.removeItem(CACHE_KEYS.ROLE_INFO);

				// Refrescar información de rol
				await refreshRoleInfo();

				return result;
			}

			return null;
		} catch (error) {
			console.error("❌ Error en registro con Google:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Error desconocido al registrarse con Google";
			setError(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	}, [setUser, setIsAuthenticated, refreshRoleInfo]);

	/**
	 * OPTIMIZADO: Cerrar sesión de usuario
	 */
	const logout = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			console.log("🚪 Cerrando sesión...");
			await contextLogout();
			console.log("✅ Sesión cerrada exitosamente");
			return true;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error al cerrar sesión";
			console.error("❌ Logout error:", errorMessage);
			setError(errorMessage);
			return false;
		} finally {
			setLoading(false);
			// Redirigir al inicio después de cerrar sesión
			setTimeout(() => {
				window.location.href = "/";
			}, 100);
		}
	}, [contextLogout]);

	/**
	 * OPTIMIZADO: Actualizar perfil de usuario
	 */
	const updateProfile = useCallback(
		async (profileData: UserProfileUpdateData) => {
			setLoading(true);
			setError(null);

			try {
				console.log("👤 Actualizando perfil...");
				const updatedUser = await updateProfileUseCase.execute(profileData);

				if (updatedUser) {
					console.log("✅ Perfil actualizado exitosamente");
					setUser(updatedUser);

					// Actualizar cache de usuario
					CacheService.setItem(
						CACHE_KEYS.USER_DATA,
						updatedUser,
						10 * 60 * 1000
					);

					return updatedUser;
				} else {
					throw new Error("No se recibió información de usuario actualizada");
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al actualizar perfil";
				console.error("❌ Update profile error:", errorMessage);
				setError(errorMessage);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[setUser]
	);

	/**
	 * OPTIMIZADO: Verificar si el usuario es administrador
	 */
	const isAdmin = useCallback(
		async (critical: boolean = false): Promise<boolean> => {
			try {
				return await contextIsAdmin(critical);
			} catch (error) {
				console.warn(
					"⚠️ Error en verificación de admin, usando fallback:",
					error
				);
				return roleInfo.isAdmin;
			}
		},
		[contextIsAdmin, roleInfo.isAdmin]
	);

	/**
	 * OPTIMIZADO: Verificar si el usuario es vendedor
	 */
	const isSeller = useCallback(
		async (critical: boolean = false): Promise<boolean> => {
			try {
				return await contextIsSeller(critical);
			} catch (error) {
				console.warn(
					"⚠️ Error en verificación de seller, usando fallback:",
					error
				);
				return roleInfo.isSeller;
			}
		},
		[contextIsSeller, roleInfo.isSeller]
	);

	// Función de utilidad para limpiar errores
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	// Devolver estado y funciones del hook
	return {
		// Estados básicos
		user,
		isAuthenticated,
		loading,
		error,

		// Funciones de autenticación
		login,
		register,
		logout,
		updateProfile,

		// Métodos de Google OAuth
		loginWithGoogle,
		registerWithGoogle,

		// Setters (para compatibilidad, pero se recomienda usar las funciones)
		setUser,
		setIsAuthenticated,

		// Propiedades del contexto
		roleInfo,
		isLoadingRole,
		refreshRoleInfo,
		isInitialized,
		getDefaultRouteForRole,

		// Funciones optimizadas de roles
		isAdmin,
		isSeller,

		// Utilidades
		clearError,
	};
};

// Re-exportar también como useSecureAuth para compatibilidad
export const useSecureAuth = useAuth;

export default useAuth;
