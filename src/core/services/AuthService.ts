import axios, { AxiosError } from 'axios';
import type { 
  User, 
  UserLoginData, 
  UserRegistrationData, 
  AuthResponse,
  UserProfileUpdateData
} from '../domain/entities/User';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';
import appConfig from '../../config/appConfig';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

// Importamos axiosInstance (no como ApiClient/apiClient)
import axiosInstance from '../../infrastructure/api/axiosConfig';

// Instancia del servicio de almacenamiento local
const storageService = new LocalStorageService();

/**
 * Servicio de autenticación
 */
export class AuthService {
  /**
   * Inicia sesión de usuario
   */
  async login(credentials: UserLoginData): Promise<AuthResponse> {
    try {
      // Realizar la solicitud de login
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      // Verificar si hay datos en la respuesta
      if (!response) {
        throw new Error('Respuesta del servidor vacía');
      }
      
      let authData: AuthResponse;
      
      // Asignamos authData directamente de la respuesta
      authData = response.data;
      
      // Validar token de acceso
      if (!authData.access_token) {
        throw new Error('Token de acceso no encontrado en la respuesta');
      }
      
      // Almacenar token en localStorage
      storageService.setItem(appConfig.storage.authTokenKey, authData.access_token);
      
      // Almacenar información de usuario si existe
      if (authData.user) {
        storageService.setItem(appConfig.storage.userKey, authData.user);
      }
      
      return authData;
    } catch (error) {
      console.error('Error de login:', error);
      
      // Manejo detallado de errores
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        // Errores específicos según el código HTTP
        if (axiosError.response?.status === 401) {
          throw new Error('Credenciales incorrectas');
        } else if (axiosError.response?.status === 422) {
          // Error de validación
          const validationErrors = axiosError.response.data?.errors;
          if (validationErrors) {
            // Convertir errores de validación a mensaje legible
            const messages = Object.values(validationErrors).flat();
            throw new Error(messages.join('. '));
          }
          throw new Error('Datos de formulario inválidos');
        } else if (axiosError.response?.data?.message) {
          // Usar mensaje del servidor si existe
          throw new Error(axiosError.response.data.message);
        } else if (axiosError.message) {
          throw new Error(axiosError.message);
        }
      }
      
      throw new Error('Error desconocido al iniciar sesión');
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async register(userData: UserRegistrationData): Promise<AuthResponse> {
    try {
      // Realizar la solicitud de registro
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      // Verificar si hay datos en la respuesta
      if (!response) {
        throw new Error('Respuesta del servidor vacía');
      }
      
      // Asignamos authData directamente de la respuesta
      const authData: AuthResponse = response.data;
      
      // Validar token de acceso
      if (!authData.access_token) {
        throw new Error('Token de acceso no encontrado en la respuesta');
      }
      
      // Almacenar token en localStorage
      storageService.setItem(appConfig.storage.authTokenKey, authData.access_token);
      
      // Almacenar información de usuario si existe
      if (authData.user) {
        storageService.setItem(appConfig.storage.userKey, authData.user);
      }
      
      return authData;
    } catch (error) {
      console.error('Error de registro:', error);
      
      // Manejo detallado de errores
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        // Errores específicos según el código HTTP
        if (axiosError.response?.status === 422) {
          // Error de validación
          const validationErrors = axiosError.response.data?.errors;
          if (validationErrors) {
            // Convertir errores de validación a mensaje legible
            const messages = Object.values(validationErrors).flat();
            throw new Error(messages.join('. '));
          }
          throw new Error('Datos de registro inválidos');
        } else if (axiosError.response?.data?.message) {
          // Usar mensaje del servidor si existe
          throw new Error(axiosError.response.data.message);
        } else if (axiosError.message) {
          throw new Error(axiosError.message);
        }
      }
      
      throw new Error('Error desconocido al registrar usuario');
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  async logout(): Promise<boolean> {
    try {
      // Verificar si hay token para intentar logout en servidor
      const token = storageService.getItem(appConfig.storage.authTokenKey);
      
      if (token) {
        try {
          await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
          console.warn('Error al hacer logout en servidor, continuando con logout local');
        }
      }
      
      // Eliminar token y datos de usuario del almacenamiento local
      storageService.removeItem(appConfig.storage.authTokenKey);
      storageService.removeItem(appConfig.storage.userKey);
      
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      
      // A pesar del error, limpiar almacenamiento local de todas formas
      storageService.removeItem(appConfig.storage.authTokenKey);
      storageService.removeItem(appConfig.storage.userKey);
      
      throw new Error('Error al cerrar sesión');
    }
  }

  /**
   * Obtiene los datos del usuario actual
   */
  async getCurrentUser(): Promise<User> {
    try {
      // Verificar si hay token
      const token = storageService.getItem(appConfig.storage.authTokenKey);
      if (!token) {
        throw new Error('No hay sesión activa');
      }
      
      // Primero intentamos obtener desde el almacenamiento local
      const cachedUser = storageService.getItem(appConfig.storage.userKey);
      if (cachedUser) {
        return cachedUser;
      }
      
      // Si no está en caché, solicitamos al servidor
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      
      // Verificar si hay datos en la respuesta
      if (!response) {
        throw new Error('Respuesta del servidor vacía');
      }
      
      // Asignamos userData directamente de la respuesta
      const userData: User = response.data;
      
      // Validar usuario
      if (!userData) {
        throw new Error('Información de usuario no encontrada en la respuesta');
      }
      
      // Almacenar en caché
      storageService.setItem(appConfig.storage.userKey, userData);
      
      return userData;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token inválido o expirado, limpiar almacenamiento
        storageService.removeItem(appConfig.storage.authTokenKey);
        storageService.removeItem(appConfig.storage.userKey);
      }
      
      throw new Error('No se pudo obtener la información del usuario');
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(data: UserProfileUpdateData): Promise<User> {
    try {
      const response = await axiosInstance.put('/user/profile', data);
      
      // Verificar si hay datos en la respuesta
      if (!response) {
        throw new Error('Respuesta del servidor vacía');
      }
      
      // Asignamos userData directamente de la respuesta
      const userData: User = response.data;
      
      // Validar usuario
      if (!userData) {
        throw new Error('Información de usuario no encontrada en la respuesta');
      }
      
      // Actualizar en caché
      storageService.setItem(appConfig.storage.userKey, userData);
      
      return userData;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      
      // Manejo detallado de errores
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        if (axiosError.response?.status === 401) {
          throw new Error('No autorizado para actualizar el perfil');
        } else if (axiosError.response?.status === 422) {
          // Error de validación
          const validationErrors = axiosError.response.data?.errors;
          if (validationErrors) {
            // Convertir errores de validación a mensaje legible
            const messages = Object.values(validationErrors).flat();
            throw new Error(messages.join('. '));
          }
          throw new Error('Datos de perfil inválidos');
        } else if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      
      throw new Error('No se pudo actualizar el perfil');
    }
  }

  /**
   * Solicita restablecimiento de contraseña
   */
  async forgotPassword(email: string): Promise<boolean> {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      
      // Verificar resultado
      const success = response.data?.success || response.data?.status === 'success' || false;
      return success;
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        if (axiosError.response?.status === 422) {
          // Error de validación (email inválido)
          throw new Error('Correo electrónico inválido');
        } else if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      
      throw new Error('No se pudo procesar la solicitud de recuperación de contraseña');
    }
  }

  /**
   * Restablece la contraseña del usuario
   */
  async resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Promise<boolean> {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      
      // Verificar resultado
      const success = response.data?.success || response.data?.status === 'success' || false;
      return success;
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<any>;
        
        if (axiosError.response?.status === 422) {
          // Error de validación
          const validationErrors = axiosError.response.data?.errors;
          if (validationErrors) {
            const messages = Object.values(validationErrors).flat();
            throw new Error(messages.join('. '));
          }
          throw new Error('Datos inválidos para restablecimiento de contraseña');
        } else if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      
      throw new Error('No se pudo restablecer la contraseña');
    }
  }

  /**
   * Verifica si el usuario está actualmente autenticado
   */
  isAuthenticated(): boolean {
    return !!storageService.getItem(appConfig.storage.authTokenKey);
  }

  /**
   * Actualiza el token de acceso usando el token de actualización
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH);
      
      // Verificar si hay datos en la respuesta
      if (!response) {
        throw new Error('Respuesta del servidor vacía');
      }
      
      // Acceder al token directamente
      const newToken = response.data?.access_token;
      
      if (!newToken) {
        throw new Error('Token no encontrado en la respuesta');
      }
      
      // Actualizar token en localStorage
      storageService.setItem(appConfig.storage.authTokenKey, newToken);
      
      return true;
    } catch (error) {
      console.error('Error al actualizar el token:', error);
      
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token de actualización expirado o inválido
        storageService.removeItem(appConfig.storage.authTokenKey);
        storageService.removeItem(appConfig.storage.userKey);
      }
      
      return false;
    }
  }

  /**
   * Verifica el correo electrónico del usuario
   */
  async verifyEmail(id: number, hash: string): Promise<boolean> {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL(id, hash));
      
      // Verificar resultado
      const success = response.data?.success || response.data?.status === 'success' || false;
      return success;
    } catch (error) {
      console.error('Error al verificar email:', error);
      
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('No se pudo verificar el correo electrónico');
    }
  }
}