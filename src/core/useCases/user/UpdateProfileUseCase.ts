import { AuthService } from '../../services/AuthService';
import { LocalStorageService } from '../../../infrastructure/services/LocalStorageService';
import type { User, UserProfileUpdateData } from '../../domain/entities/User';
import appConfig from '../../../config/appConfig';

/**
 * Caso de uso para la actualización del perfil de usuario
 * Centraliza la lógica del proceso de actualización para mantener la
 * separación de responsabilidades
 */
export class UpdateProfileUseCase {
  private authService: AuthService;
  private storageService: LocalStorageService;

  constructor() {
    this.authService = new AuthService();
    this.storageService = new LocalStorageService();
  }

  /**
   * Ejecuta el proceso de actualización de perfil
   * @param profileData Datos de perfil a actualizar
   * @returns Usuario actualizado o null si falla
   */
  async execute(profileData: UserProfileUpdateData): Promise<User | null> {
    try {
      // Llamada al servicio de autenticación para actualizar el perfil
      const updatedUser = await this.authService.updateProfile(profileData);
      
      // Verificar que la respuesta sea válida
      if (!updatedUser) {
        throw new Error('Respuesta de actualización inválida');
      }

      // Actualizar en localStorage
      this.storageService.setItem(appConfig.storage.userKey, updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('Error en UpdateProfileUseCase:', error);
      
      // Propagar el error para que pueda ser manejado en la capa superior
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Error desconocido en la actualización de perfil');
      }
    }
  }
}

export default UpdateProfileUseCase;