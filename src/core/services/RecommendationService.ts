import ApiClient from '../../infrastructure/api/apiClient';
import type { Product } from '../domain/entities/Product';

export interface RecommendationResponse {
  success: boolean;
  data: Product[];
  meta?: {
    total: number;
    count: number;
    [key: string]: any;
  };
}

/**
 * Servicio para manejar recomendaciones de productos - CORREGIDO
 */
export class RecommendationService {
  private static readonly BASE_PATH = '/recommendations';

  /**
   * Obtiene productos recomendados REALES para el usuario actual
   */
  public static async getRecommendations(limit = 10): Promise<RecommendationResponse> {
    try {
      console.log('🎯 RecommendationService: Llamando a /recommendations...', { limit });

      // CORREGIDO: Usar ApiClient correctamente  
      const response = await ApiClient.get<RecommendationResponse>(
        this.BASE_PATH,
        { limit }
      );

      console.log('🎯 RecommendationService: Respuesta recibida:', response);

      if (response.success && response.data && Array.isArray(response.data)) {
        console.log('✅ RecommendationService: Productos REALES obtenidos:', {
          count: response.data.length,
          productos: response.data.map(p => p.name).slice(0, 3),
          primer_producto: response.data[0]
        });

        return response;
      } else {
        console.warn('⚠️ RecommendationService: Respuesta sin éxito o datos válidos:', response);
        return {
          success: false,
          data: [],
          meta: { total: 0, count: 0, error: 'Respuesta sin datos válidos' }
        };
      }
    } catch (error: any) {
      console.error('❌ RecommendationService: ERROR COMPLETO:', error);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      
      return {
        success: false,
        data: [],
        meta: {
          total: 0,
          count: 0,
          error: `Error del servidor: ${error.response?.status || 'desconocido'}`
        }
      };
    }
  }

  /**
   * Registra una interacción del usuario con un producto
   */
  public static async trackInteraction(
    interactionType: string,
    itemId: number,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      console.log('📊 RecommendationService: Registrando interacción:', {
        interactionType,
        itemId,
        metadata
      });

      await ApiClient.post(`${this.BASE_PATH}/track-interaction`, {
        interactionType,
        itemId,
        metadata
      });

      console.log('✅ RecommendationService: Interacción registrada exitosamente');
    } catch (error) {
      console.error('❌ RecommendationService: Error registrando interacción:', error);
    }
  }

  /**
   * Obtiene el perfil del usuario para recomendaciones
   */
  public static async getUserProfile(): Promise<any> {
    try {
      console.log('👤 RecommendationService: Obteniendo perfil de usuario...');
      
      const response = await ApiClient.get(`${this.BASE_PATH}/user-profile`);
      
      console.log('✅ RecommendationService: Perfil obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ RecommendationService: Error obteniendo perfil:', error);
      return null;
    }
  }
}

export default RecommendationService;
