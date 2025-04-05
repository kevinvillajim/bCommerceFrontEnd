import axiosInstance from "../api/axiosConfig";
import CacheService from "./CacheService";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

const ROLE_CACHE_KEY = "user_role_data";
const CACHE_TIME = 10 * 60 * 1000; // 10 minutos

// Memoria local para evitar consultas excesivas al localStorage
let cachedRoleData: RoleCheckResponse | null = null;
let lastRoleCheck = 0;

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
	 * @param forceRefresh Si es true, fuerza una recarga desde la API
	 */
	static async checkUserRole(
		forceRefresh = false
	): Promise<RoleCheckResponse | null> {
		try {
			// Si tenemos datos en memoria y no ha pasado mucho tiempo, usarlos directamente
			const now = Date.now();
			if (!forceRefresh && cachedRoleData && now - lastRoleCheck < 30000) {
				// 30 segundos
				return cachedRoleData;
			}

			// Verificar si hay datos en caché de localStorage y no forzamos actualización
			if (!forceRefresh) {
				const localCachedData = CacheService.getItem(ROLE_CACHE_KEY);
				if (localCachedData) {
					// Actualizar caché en memoria pero no mostrar el log cada vez
					cachedRoleData = localCachedData as RoleCheckResponse;
					lastRoleCheck = now;
					return cachedRoleData;
				}
			}

			// Si se fuerza actualización o no hay caché, hacer la petición a la API
			const response = await axiosInstance.get(API_ENDPOINTS.AUTH.CHECK_ROLE);

			// Verificar la respuesta
			if (response && response.data && response.data.success) {
				// Guardar en caché de localStorage
				CacheService.setItem(ROLE_CACHE_KEY, response.data, CACHE_TIME);

				// Actualizar memoria local
				cachedRoleData = response.data as RoleCheckResponse;
				lastRoleCheck = now;

				console.log("Datos de rol actualizados desde API");
				return cachedRoleData;
			}

			return null;
		} catch (error) {
			console.error("Error al verificar rol de usuario:", error);
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
		cachedRoleData = null;
		lastRoleCheck = 0;
		console.log("Caché de roles limpiada");
	}
}

export default RoleService;
