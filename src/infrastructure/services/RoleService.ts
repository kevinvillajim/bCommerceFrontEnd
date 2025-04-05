import axiosInstance from "../api/axiosConfig";
import CacheService from "./CacheService";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";


const ROLE_CACHE_KEY = 'user_role_data';
const CACHE_TIME = 10 * 60 * 1000;

export interface RoleCheckResponse {
	success: boolean;
	status: number;
	data: {
		user_id: number;
		role: string;
		is_seller: boolean;
		is_admin: boolean;
		seller_info?: {
			id: number;
			store_name: string;
			status: string;
			verification_level: string;
		} | null;
		admin_info?: {
			id: number;
			role: string;
			permissions: string[];
		} | null;
	};
}

/**
 * Servicio para verificar y gestionar roles de usuario
 */
export class RoleService {
  /**
   * Verifica el rol del usuario actual y guarda los datos en caché
   */
  static async checkUserRole(): Promise<RoleCheckResponse | null> {
    try {
      // Verificar si hay datos en caché
      const cachedData = CacheService.getItem(ROLE_CACHE_KEY);
      if (cachedData) {
        console.log('Usando datos de rol en caché');
        return cachedData as RoleCheckResponse;
      }

      console.log('Verificando rol de usuario desde API');
      
      // Si no está en caché, hacer la petición
      // Añadir endpoint al API_ENDPOINTS si no existe
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.CHECK_ROLE);
      
      // Verificar la respuesta
      if (response && response.data && response.data.success) {
        // Guardar en caché por 10 minutos
        CacheService.setItem(ROLE_CACHE_KEY, response.data, CACHE_TIME);
        return response.data as RoleCheckResponse;
      }
      
      return null;
    } catch (error) {
      console.error('Error al verificar rol de usuario:', error);
      return null;
    }
  }

  /**
   * Verificar si el usuario es administrador
   */
  static async isAdmin(): Promise<boolean> {
    const roleData = await this.checkUserRole();
    return roleData?.data?.is_admin || false;
  }

  /**
   * Verificar si el usuario es vendedor
   */
  static async isSeller(): Promise<boolean> {
    const roleData = await this.checkUserRole();
    return roleData?.data?.is_seller || false;
  }

  /**
   * Obtener rol del usuario actual
   */
  static async getUserRole(): Promise<string | null> {
    const roleData = await this.checkUserRole();
    return roleData?.data?.role || null;
  }

  /**
   * Limpiar la caché de roles
   * Útil cuando el usuario cierra sesión
   */
  static clearRoleCache(): void {
    CacheService.removeItem(ROLE_CACHE_KEY);
    console.log('Caché de roles limpiada');
  }
}

export default RoleService;
