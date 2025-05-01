import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {Seller} from "../domain/entities/Seller";

// Tipos para los parámetros de filtrado
export interface SellerFilters {
	status?: string;
	verification_level?: string;
	page?: number;
	per_page?: number;
	sort_by?: string;
	sort_dir?: "asc" | "desc";
	search?: string;
}

// Tipo para la respuesta paginada
export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		current_page: number;
		from: number;
		last_page: number;
		path: string;
		per_page: number;
		to: number;
		total: number;
	};
}

// Tipo para respuestas de actualización
export interface ApiResponse {
	status: string;
	message: string;
	data?: any;
}

// Datos para crear un vendedor
export interface CreateSellerData {
	user_id: number;
	store_name: string;
	description?: string;
	status: "pending" | "active";
	verification_level: "none" | "basic" | "verified" | "premium";
	commission_rate?: number;
	is_featured?: boolean;
}

// Datos para actualizar un vendedor
export interface UpdateSellerData {
	store_name?: string;
	description?: string;
	verification_level?: "none" | "basic" | "verified" | "premium";
	commission_rate?: number;
	is_featured?: boolean;
}

/**
 * Servicio para administrar vendedores desde el panel de administración
 */
class SellerAdminService {
	/**
	 * Obtiene la lista de vendedores con filtros y paginación
	 */
	async getSellers(
		filters: SellerFilters = {}
	): Promise<PaginatedResponse<Seller>> {
		try {
			const response = await ApiClient.get<PaginatedResponse<Seller>>(
				API_ENDPOINTS.ADMIN.SELLERS,
				{params: filters}
			);
			return response;
		} catch (error) {
			console.error("Error al obtener vendedores:", error);
			throw error;
		}
	}

	/**
	 * Actualiza el estado de un vendedor
	 */
	async updateSellerStatus(
		sellerId: number,
		status: "pending" | "active" | "suspended" | "inactive",
		reason?: string
	): Promise<ApiResponse> {
		try {
			const response = await ApiClient.put<ApiResponse>(
				`${API_ENDPOINTS.ADMIN.SELLERS}/${sellerId}/status`,
				{status, reason}
			);
			return response;
		} catch (error) {
			console.error("Error al actualizar estado del vendedor:", error);
			throw error;
		}
	}

	/**
	 * Actualiza los detalles de un vendedor
	 */
	async updateSeller(
		sellerId: number,
		data: UpdateSellerData
	): Promise<ApiResponse> {
		try {
			const response = await ApiClient.put<ApiResponse>(
				`${API_ENDPOINTS.ADMIN.SELLERS}/${sellerId}`,
				data
			);
			return response;
		} catch (error) {
			console.error("Error al actualizar vendedor:", error);
			throw error;
		}
	}

	/**
	 * Crea un nuevo vendedor
	 */
	async createSeller(data: CreateSellerData): Promise<ApiResponse> {
		try {
			const response = await ApiClient.post<ApiResponse>(
				API_ENDPOINTS.ADMIN.SELLERS,
				data
			);
			return response;
		} catch (error) {
			console.error("Error al crear vendedor:", error);
			throw error;
		}
	}

	/**
	 * Actualiza el nivel de verificación de un vendedor
	 */
	async updateVerificationLevel(
		sellerId: number,
		level: "none" | "basic" | "verified" | "premium"
	): Promise<ApiResponse> {
		return this.updateSeller(sellerId, {verification_level: level});
	}

	/**
	 * Cambia el estado de destacado de un vendedor
	 */
	async toggleFeatured(
		sellerId: number,
		isFeatured: boolean
	): Promise<ApiResponse> {
		return this.updateSeller(sellerId, {is_featured: isFeatured});
	}
}

export default SellerAdminService;
