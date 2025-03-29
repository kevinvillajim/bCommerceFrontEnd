import ApiClient from '../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type { AxiosResponse } from 'axios';
import type { 
  User, 
  UserLoginData, 
  UserRegistrationData, 
  AuthResponse,
  UserProfileUpdateData
} from '../domain/entities/User';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';

// Instancia del servicio de almacenamiento local
const storageService = new LocalStorageService();

/**
 * Interfaz para las respuestas de la API
 */
interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

/**
 * Servicio de autenticación
 */
export class AuthService {
  /**
   * Inicia sesión de usuario
   */
  async login(credentials: UserLoginData): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await ApiClient.post(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    
    // Almacenar el token en localStorage
    const authData = response.data.data;
    storageService.setItem('auth_token', authData.access_token);
    
    // El token se maneja automáticamente a través del interceptor en apiClient.ts
    
    return authData;
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData: UserRegistrationData): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> = await ApiClient.post(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    // Almacenar el token en localStorage
    const authData = response.data.data;
    storageService.setItem('auth_token', authData.access_token);
    
    // El token se maneja automáticamente a través del interceptor en apiClient.ts
    
    return authData;
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<boolean> {
    try {
      await ApiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      
      // Eliminar token del almacenamiento local
      storageService.removeItem('auth_token');
      
      // No necesitamos modificar los headers, se manejan en el interceptor
      
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
    }
  }

  /**
   * Obtiene los datos del usuario actual
   */
  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await ApiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data.data;
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(data: UserProfileUpdateData): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await ApiClient.put('/user/profile', data);
    return response.data.data;
  }

  /**
   * Solicita restablecimiento de contraseña
   */
  async forgotPassword(email: string): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<{ success: boolean }>> = await ApiClient.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data.data.success;
  }

  /**
   * Restablece la contraseña del usuario
   */
  async resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<{ success: boolean }>> = await ApiClient.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      }
    );
    return response.data.data.success;
  }

  /**
   * Verifica si el usuario está actualmente autenticado
   */
  isAuthenticated(): boolean {
    return !!storageService.getItem('auth_token');
  }

  /**
   * Actualiza el token de acceso usando el token de actualización
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response: AxiosResponse<ApiResponse<{ access_token: string }>> = await ApiClient.post(
        API_ENDPOINTS.AUTH.REFRESH
      );
      
      const newToken = response.data.data.access_token;
      
      // Actualizar token en localStorage
      storageService.setItem('auth_token', newToken);
      
      // El token se actualiza automáticamente en el siguiente request gracias al interceptor
      
      return true;
    } catch (error) {
      console.error('Error al actualizar el token:', error);
      return false;
    }
  }

  /**
   * Verifica el correo electrónico del usuario
   */
  async verifyEmail(id: number, hash: string): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<{ success: boolean }>> = await ApiClient.get(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL(id, hash)
    );
    return response.data.data.success;
  }
}