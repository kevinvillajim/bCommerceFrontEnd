// src/core/services/AdminSellerService.ts

import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

export interface AdminSeller {
	id: number;
	store_name: string;
	user_name: string;
	email: string;
	display_name: string;
	status: string;
}

export interface AdminSellerListResponse {
	data: AdminSeller[];
}

/**
 * Servicio para gestión de sellers desde admin
 */
export class AdminSellerService {
	/**
	 * Obtiene la lista de sellers activos para admin
	 */
	async getAllSellers(): Promise<AdminSellerListResponse | null> {
		try {
			console.log("📤 AdminSellerService: Obteniendo sellers para admin");

			const response = await ApiClient.get<AdminSellerListResponse>(
				API_ENDPOINTS.ADMIN.SELLERS
			);

			console.log("📥 AdminSellerService: Sellers obtenidos:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en AdminSellerService.getAllSellers:", error);
			return null;
		}
	}
}

export default AdminSellerService;