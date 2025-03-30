import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AuthService } from '../../core/services/AuthService';
import LoginUseCase from '../../core/useCases/user/LoginUseCase';
import RegisterUseCase from '../../core/useCases/user/RegisterUseCase';
import UpdateProfileUseCase from '../../core/useCases/user/UpdateProfileUseCase';
import type { UserLoginData, UserRegistrationData, UserProfileUpdateData } from '../../core/domain/entities/User';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';
import appConfig from '../../config/appConfig';

// Crear instancias de servicios y casos de uso
const authService = new AuthService();
const storageService = new LocalStorageService();
const loginUseCase = new LoginUseCase();
const registerUseCase = new RegisterUseCase();
const updateProfileUseCase = new UpdateProfileUseCase();

/**
 * Hook para operaciones de autenticación
 */
export const useAuth = () => {
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Verificar si el usuario ya está logueado (al montar el componente)
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = storageService.getItem(appConfig.storage.authTokenKey);
      if (token) {
        try {
          const userData = storageService.getItem(appConfig.storage.userKey);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            try {
              // Si no hay usuario en caché, intenta obtenerlo del servidor
              const currentUser = await authService.getCurrentUser();
              setUser(currentUser);
              setIsAuthenticated(true);
            } catch (error) {
              // Si falla, limpia el token y estado
              storageService.removeItem(appConfig.storage.authTokenKey);
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch (err) {
          // Token inválido, limpia estado
          storageService.removeItem(appConfig.storage.authTokenKey);
          storageService.removeItem(appConfig.storage.userKey);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, [setUser, setIsAuthenticated]);

  /**
   * Iniciar sesión de usuario
   */
  const login = useCallback(async (credentials: UserLoginData) => {
    setLoading(true);
    setError(null);

    try {
      // Usar el caso de uso de login
      const response = await loginUseCase.execute(credentials);
      
      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error("No se recibió información de usuario válida");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      console.error("Login error:", errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser, setIsAuthenticated]);

  /**
   * Registrar nuevo usuario
   */
  const register = useCallback(async (userData: UserRegistrationData) => {
    setLoading(true);
    setError(null);

    try {
      // Usar el caso de uso de registro
      const response = await registerUseCase.execute(userData);
      
      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error("No se recibió información de usuario válida");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario';
      console.error("Register error:", errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser, setIsAuthenticated]);

  /**
   * Cerrar sesión de usuario
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Cerrar sesión con el servicio de autenticación
      await authService.logout();
      
      // Limpiar estado local
      setUser(null);
      setIsAuthenticated(false);
      
      // Limpiar almacenamiento local
      storageService.removeItem(appConfig.storage.authTokenKey);
      storageService.removeItem(appConfig.storage.userKey);
      storageService.removeItem(appConfig.storage.cartKey);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMessage);
      
      // Intentar limpiar almacenamiento local de todas formas
      storageService.removeItem(appConfig.storage.authTokenKey);
      storageService.removeItem(appConfig.storage.userKey);
      storageService.removeItem(appConfig.storage.cartKey);
      
      setUser(null);
      setIsAuthenticated(false);
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [setUser, setIsAuthenticated]);

  /**
   * Actualizar perfil de usuario
   */
  const updateProfile = useCallback(async (profileData: UserProfileUpdateData) => {
    setLoading(true);
    setError(null);

    try {
      // Usar el caso de uso de actualización de perfil
      const updatedUser = await updateProfileUseCase.execute(profileData);
      
      if (updatedUser) {
        setUser(updatedUser);
        return updatedUser;
      } else {
        throw new Error("No se recibió información de usuario actualizada");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  // Devolver estado y funciones del hook
  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  };
};

export default useAuth;