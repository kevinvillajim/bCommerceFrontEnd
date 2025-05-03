// src/core/services/AdminRatingService.ts
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {Rating} from "../domain/entities/Rating";

// Interfaces para las respuestas de API
export interface AdminRatingResponse {
	status: string;
	message?: string;
	data: Rating[];
	meta: {
		total: number;
		per_page: number;
		current_page: number;
		last_page: number;
	};
}

export interface AdminActionResponse {
	status: string;
	message: string;
}

export interface AdminRatingFilters {
	status?: string;
	type?: string;
	rating?: number | null;
	from_date?: string;
	to_date?: string;
	page?: number;
	per_page?: number;
}

/**
 * Servicio para la administración de valoraciones
 */
export class AdminRatingService {
	/**
	 * Obtiene todas las valoraciones con filtros opcionales
	 */
	async getRatings(
		filters: AdminRatingFilters = {}
	): Promise<AdminRatingResponse> {
		try {
			const response = await ApiClient.get<AdminRatingResponse>(
				API_ENDPOINTS.ADMIN.RATINGS.LIST,
				filters
			);
			return response;
		} catch (error) {
			console.error("Error al obtener valoraciones:", error);
			throw error;
		}
	}

	/**
	 * Aprueba una valoración
	 */
	async approveRating(
		ratingId: number,
		note?: string
	): Promise<AdminActionResponse> {
		try {
			const response = await ApiClient.post<AdminActionResponse>(
				API_ENDPOINTS.ADMIN.RATINGS.APPROVE(ratingId),
				{note}
			);
			return response;
		} catch (error) {
			console.error(`Error al aprobar valoración ${ratingId}:`, error);
			throw error;
		}
	}

	/**
	 * Rechaza una valoración
	 */
	async rejectRating(
		ratingId: number,
		note: string
	): Promise<AdminActionResponse> {
		try {
			const response = await ApiClient.post<AdminActionResponse>(
				API_ENDPOINTS.ADMIN.RATINGS.REJECT(ratingId),
				{note}
			);
			return response;
		} catch (error) {
			console.error(`Error al rechazar valoración ${ratingId}:`, error);
			throw error;
		}
	}

	/**
	 * Reporta una valoración para revisión adicional
	 */
	async flagRating(
		ratingId: number,
		reason: string
	): Promise<AdminActionResponse> {
		try {
			const response = await ApiClient.post<AdminActionResponse>(
				API_ENDPOINTS.ADMIN.RATINGS.FLAG(ratingId),
				{reason}
			);
			return response;
		} catch (error) {
			console.error(`Error al marcar valoración ${ratingId}:`, error);
			throw error;
		}
	}

	/**
	 * Obtiene estadísticas generales de valoraciones
	 */
	async getRatingStats(): Promise<any> {
		try {
			const response = await ApiClient.get(API_ENDPOINTS.ADMIN.RATINGS.STATS);
			return response;
		} catch (error) {
			console.error("Error al obtener estadísticas de valoraciones:", error);
			throw error;
		}
	}
}

export default AdminRatingService;