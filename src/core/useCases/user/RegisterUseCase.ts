import { AuthService } from '../../services/AuthService';
import { LocalStorageService } from '../../../infrastructure/services/LocalStorageService';
import type { UserRegistrationData, AuthResponse } from '../../domain/entities/User';
import appConfig from '../../../config/appConfig';

/**
 * Caso de uso para el registro de usuarios
 * Centraliza la lógica del proceso de registro para mantener la
 * separación de responsabilidades
 */
export class RegisterUseCase {
  private authService: AuthService;
  private storageService: LocalStorageService;

  constructor() {
    this.authService = new AuthService();
    this.storageService = new LocalStorageService();
  }

  /**
   * Ejecuta el proceso de registro de usuario
   * @param userData Datos de registro del usuario
   * @returns Datos de autenticación o null si falla
   */
  async execute(userData: UserRegistrationData): Promise<AuthResponse | null> {
    try {
      // Validación básica
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Datos de registro incompletos');
      }

      // Llamada al servicio de autenticación
      const authResponse = await this.authService.register(userData);

      // Verificar que la respuesta sea válida
      if (!authResponse || !authResponse.access_token) {
        throw new Error('Respuesta de registro inválida');
      }

      // Guardar el token en el almacenamiento local
      this.storageService.setItem(appConfig.storage.authTokenKey, authResponse.access_token);
      
      // Si existe información del usuario, guardarla también
      if (authResponse.user) {
        this.storageService.setItem(appConfig.storage.userKey, authResponse.user);
      }

      return authResponse;
    } catch (error) {
      console.error('Error en RegisterUseCase:', error);
      
      // Propagar el error para que pueda ser manejado en la capa superior
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Error desconocido en el registro');
      }
    }
  }
}

export default RegisterUseCase;