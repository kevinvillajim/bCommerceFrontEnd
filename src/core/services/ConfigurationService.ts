import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {ApiResponse} from "../../presentation/types/admin/ratingConfigTypes";
import type {
	RatingConfigs,
	RatingStats,
} from "../../presentation/types/admin/ratingConfigTypes";

/**
 * Servicio para gestionar configuraciones del sistema
 */
class ConfigurationService {
	/**
	 * Obtiene configuraciones de valoraciones
	 */
	async getRatingConfigs(): Promise<ApiResponse<RatingConfigs>> {
		try {
			// Usamos el endpoint correcto definido en API_ENDPOINTS
			const response = await ApiClient.get<ApiResponse<RatingConfigs>>(
				API_ENDPOINTS.ADMIN.CONFIGURATIONS.RATINGS
			);
			return response;
		} catch (error) {
			console.error("Error al obtener configuraciones de valoraciones:", error);
			// Devolvemos una respuesta de error formateada
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
				data: {},
			};
		}
	}

	/**
	 * Actualiza configuraciones de valoraciones
	 */
	async updateRatingConfigs(configs: {
		auto_approve_all: boolean;
		auto_approve_threshold: number;
	}): Promise<ApiResponse> {
		try {
			const response = await ApiClient.post<ApiResponse>(
				API_ENDPOINTS.ADMIN.CONFIGURATIONS.RATINGS,
				configs
			);
			return response;
		} catch (error) {
			console.error(
				"Error al actualizar configuraciones de valoraciones:",
				error
			);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
			};
		}
	}

	/**
	 * Obtiene estadísticas de valoraciones
	 */
	async getRatingStats(): Promise<ApiResponse<RatingStats>> {
		try {
			const response = await ApiClient.get<ApiResponse<RatingStats>>(
				API_ENDPOINTS.ADMIN.RATINGS.STATS
			);
			return response;
		} catch (error) {
			console.error("Error al obtener estadísticas de valoraciones:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
				data: {
					totalCount: 0,
					approvedCount: 0,
					pendingCount: 0,
					rejectedCount: 0,
				},
			};
		}
	}

	/**
	 * Aprueba todas las valoraciones pendientes
	 */
	async approveAllPendingRatings(): Promise<ApiResponse> {
		try {
			const response = await ApiClient.post<ApiResponse>(
				API_ENDPOINTS.ADMIN.RATINGS.APPROVE_ALL
			);
			return response;
		} catch (error) {
			console.error("Error al aprobar valoraciones pendientes:", error);
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
			};
		}
	}
}

export default ConfigurationService;
