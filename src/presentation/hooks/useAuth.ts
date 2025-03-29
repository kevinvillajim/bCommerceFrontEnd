import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AuthService } from '../../core/services/AuthService';
import type { User, UserLoginData, UserRegistrationData } from '../../core/domain/entities/User';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';

// Create instances of services
const authService = new AuthService();
const storageService = new LocalStorageService();

/**
 * Hook for authentication related operations
 */
export const useAuth = () => {
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user is already logged in (on mount)
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = storageService.getItem('auth_token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          // Token might be invalid or expired
          storageService.removeItem('auth_token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, [setUser, setIsAuthenticated]);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: UserLoginData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      // Save token and user data
      storageService.setItem('auth_token', response.access_token);
      setUser(response.user);
      setIsAuthenticated(true);
      return response.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser, setIsAuthenticated]);

  /**
   * Register new user
   */
  const register = useCallback(async (userData: UserRegistrationData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);
      // Save token and user data
      storageService.setItem('auth_token', response.access_token);
      setUser(response.user);
      setIsAuthenticated(true);
      return response.user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser, setIsAuthenticated]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
      // Clear local storage and context
      storageService.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setUser, setIsAuthenticated]);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

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