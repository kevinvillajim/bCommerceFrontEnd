import { AuthService } from '../../services/AuthService';
import { LocalStorageService } from '../../../infrastructure/services/LocalStorageService';
import type { UserLoginData, AuthResponse } from '../../domain/entities/User';
import appConfig from '../../../config/appConfig';

/**
 * Caso de uso para el inicio de sesión
 * Centraliza la lógica del proceso de login para mantener la
 * separación de responsabilidades
 */
export class LoginUseCase {
  private authService: AuthService;
  private storageService: LocalStorageService;

  constructor() {
    this.authService = new AuthService();
    this.storageService = new LocalStorageService();
  }

  /**
   * Ejecuta el proceso de inicio de sesión
   * @param credentials Credenciales del usuario
   * @returns Datos de autenticación o null si falla
   */
  async execute(credentials: UserLoginData): Promise<AuthResponse | null> {
    try {
      // Llamada al servicio de autenticación
      const authResponse = await this.authService.login(credentials);

      // Verificar que la respuesta sea válida
      if (!authResponse || !authResponse.access_token) {
        throw new Error('Respuesta de autenticación inválida');
      }

      // Guardar el token en el almacenamiento local
      this.storageService.setItem(appConfig.storage.authTokenKey, authResponse.access_token);
      
      // Si existe información del usuario, guardarla también
      if (authResponse.user) {
        this.storageService.setItem(appConfig.storage.userKey, authResponse.user);
      }

      return authResponse;
    } catch (error) {
      console.error('Error en LoginUseCase:', error);
      
      // Propagar el error para que pueda ser manejado en la capa superior
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Error desconocido en el inicio de sesión');
      }
    }
  }
}

export default LoginUseCase;