// src/core/services/SellerAdminService.ts
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import SellerAdapter from "../../infrastructure/adapters/SellerAdapter";

// Interfaces para los datos de creación y actualización
export interface CreateSellerData {
	user_id: number;
	store_name: string;
	description?: string;
	status: "pending" | "active";
	commission_rate: number;
	is_featured: boolean;
}

export interface UpdateSellerData {
	store_name?: string;
	description?: string;
	commission_rate?: number;
	is_featured?: boolean;
	user_id?: number; // AGREGADO para compatibilidad con SellerFormModal
}

export interface SellerFilter {
	status?: string;
	is_featured?: boolean;
	sort_by?: string;
	sort_dir?: "asc" | "desc";
	per_page?: number;
	page?: number;
}

export interface SellerAdminResponse {
	data: any[]; // AGREGADO: propiedad data que faltaba
	sellers?: any[]; // Mantener por compatibilidad
	meta: {
		total: number;
		current_page: number;
		last_page: number;
		per_page: number;
	};
	pagination?: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

export class SellerAdminService {
	/**
	 * Obtiene la lista de vendedores con filtros opcionales
	 */
	async getSellers(filters: SellerFilter = {}) {
		try {
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ADMIN.SELLERS,
				filters
			);

			if (response && response.data) {
				// Laravel paginate structure: data array + pagination info
				const sellers = SellerAdapter.toEntityList(response.data);

				return {
					sellers,
					pagination: {
						currentPage: response.current_page || 1,
						totalPages: response.last_page || 1,
						totalItems: response.total || 0,
						itemsPerPage: response.per_page || 10,
					},
				};
			}

			throw new Error(response?.message || "Error al obtener vendedores");
		} catch (error) {
			console.error("Error al obtener vendedores:", error);
			throw error;
		}
	}

	/**
	 * Actualiza el nivel de verificación de un vendedor
	 */
	async updateVerificationLevel(
		id: number,
		level: "none" | "basic" | "verified" | "premium"
	) {
		try {
			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ADMIN.SELLERS + `/${id}`,
				{
					verification_level: level,
				}
			);

			if (response?.status === "success") {
				return SellerAdapter.toEntity(response.data);
			}

			throw new Error(
				response?.message ||
					"Error al actualizar nivel de verificación del vendedor"
			);
		} catch (error) {
			console.error(
				`Error al actualizar nivel de verificación del vendedor ${id}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Cambia el estado destacado de un vendedor
	 */
	async toggleFeatured(id: number, isFeatured: boolean) {
		try {
			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ADMIN.SELLERS + `/${id}`,
				{
					is_featured: isFeatured,
				}
			);

			if (response?.status === "success") {
				return SellerAdapter.toEntity(response.data);
			}

			throw new Error(
				response?.message || "Error al cambiar estado destacado del vendedor"
			);
		} catch (error) {
			console.error(
				`Error al cambiar estado destacado del vendedor ${id}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Actualiza el estado de un vendedor
	 */
	async updateSellerStatus(
		id: number,
		status: "pending" | "active" | "suspended" | "inactive",
		reason?: string
	) {
		try {
			const response = await ApiClient.put<any>(
				API_ENDPOINTS.ADMIN.SELLER_STATUS(id),
				{
					status,
					reason,
				}
			);

			if (response?.status === "success") {
				return SellerAdapter.toEntity(response.data);
			}

			throw new Error(
				response?.message || "Error al actualizar estado del vendedor"
			);
		} catch (error) {
			console.error(`Error al actualizar estado del vendedor ${id}:`, error);
			throw error;
		}
	}

	/**
	 * Crea un nuevo vendedor
	 */
	async createSeller(data: CreateSellerData) {
		try {
			// No necesitamos adaptar los datos de entrada porque ya están en el formato del backend
			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ADMIN.CREATE_SELLER,
				data
			);

			if (response?.status === "success") {
				return SellerAdapter.toEntity(response.data);
			}

			throw new Error(response?.message || "Error al crear vendedor");
		} catch (error) {
			console.error("Error al crear vendedor:", error);
			throw error;
		}
	}

	/**
	 * Actualiza información de un vendedor existente
	 */
	async updateSeller(id: number, data: UpdateSellerData) {
		try {
			const response = await ApiClient.put<any>(
				API_ENDPOINTS.ADMIN.UPDATE_SELLER(id),
				data
			);

			if (response?.status === "success") {
				return SellerAdapter.toEntity(response.data);
			}

			throw new Error(response?.message || "Error al actualizar vendedor");
		} catch (error) {
			console.error(`Error al actualizar vendedor ${id}:`, error);
			throw error;
		}
	}

	/**
	 * Obtiene usuarios que no son vendedores (para crear nuevos vendedores)
	 */
	async getNonSellerUsers() {
		try {
			// Obtener la lista de usuarios
			const response = await ApiClient.get<any>(API_ENDPOINTS.ADMIN.USERS);

			if (response?.success === true && response.data) {
				// Filtrar solo usuarios que no son vendedores
				return response.data
					.filter((user: any) => !user.is_seller)
					.map((user: any) => ({
						id: user.id,
						name: user.name,
						email: user.email,
					}));
			}

			throw new Error(response?.message || "Error al obtener usuarios");
		} catch (error) {
			console.error("Error al obtener usuarios no vendedores:", error);
			throw error;
		}
	}

	/**
	 * Marca todos los productos de un vendedor como destacados
	 */
	async featureAllSellerProducts(sellerId: number) {
		try {
			const response = await ApiClient.post<any>(
				`/admin/sellers/${sellerId}/feature-products`,
				{}
			);

			if (response?.status === "success") {
				return response.data;
			}

			throw new Error(response?.message || "Error al destacar productos del vendedor");
		} catch (error) {
			console.error(`Error al destacar productos del vendedor ${sellerId}:`, error);
			throw error;
		}
	}
}

export default SellerAdminService;
