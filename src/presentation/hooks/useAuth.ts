// src/presentation/hooks/useAuth.ts
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
  // Obtener todo del contexto
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
    getDefaultRouteForRole
  } = useContext(AuthContext);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
        
        // Refrescar información de rol después del login
        await refreshRoleInfo();
        
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
  }, [setUser, setIsAuthenticated, refreshRoleInfo]);

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
        
        // Refrescar información de rol después del registro
        await refreshRoleInfo();
        
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
  }, [setUser, setIsAuthenticated, refreshRoleInfo]);

  /**
   * Cerrar sesión de usuario - usar la del contexto
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await contextLogout();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
      window.location.href = '/'; // Redirigir al inicio después de cerrar sesión
    }
  }, [contextLogout]);

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

  // Devolver estado y funciones del hook - INCLUYENDO las nuevas propiedades
  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    // Nuevas propiedades del contexto
    roleInfo,
    isLoadingRole,
    refreshRoleInfo,
    isInitialized,
    getDefaultRouteForRole
  };
};

export default useAuth;