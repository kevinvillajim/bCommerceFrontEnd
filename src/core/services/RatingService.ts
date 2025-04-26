// src/core/services/RatingService.ts
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

// Interfaces de respuestas
export interface RatingResponse {
	status: string;
	message: string;
	data: {
		id: number;
		rating: number;
		title?: string;
		comment?: string;
		user_id: number;
		product_id?: number;
		seller_id?: number;
		order_id: number;
		created_at: string;
		updated_at: string;
	};
}

export interface PendingRatingsResponse {
	status: string;
	data: {
		products: PendingRatingItem[];
		sellers: PendingRatingItem[];
	};
}

export interface PendingRatingItem {
	id: number;
	name: string;
	image?: string;
	order_id: number;
	order_number: string;
	order_date: string;
}

export interface SellerRatingsResponse {
	status: string;
	data: Rating[];
	meta: {
		total: number;
		per_page: number;
		current_page: number;
		last_page: number;
		average_rating: number;
		rating_counts: {
			"1": number;
			"2": number;
			"3": number;
			"4": number;
			"5": number;
		};
	};
}

export interface ProductRatingsResponse {
	status: string;
	data: Rating[];
	meta: {
		total: number;
		per_page: number;
		current_page: number;
		last_page: number;
		average_rating: number;
		rating_counts: {
			"1": number;
			"2": number;
			"3": number;
			"4": number;
			"5": number;
		};
	};
}

export interface Rating {
	id: number;
	rating: number;
	title?: string;
	comment?: string;
	user_id: number;
	product_id?: number;
	seller_id?: number;
	order_id: number;
	status: "pending" | "approved" | "rejected";
	created_at: string;
	updated_at: string;
	user?: {
		id: number;
		name: string;
		avatar?: string;
	};
	seller_response?: {
		id: number;
		text: string;
		created_at: string;
	};
	is_verified_purchase: boolean;
}

// Interfaces de solicitudes
export interface ProductRatingRequest {
	product_id: number;
	order_id: number;
	rating: number;
	title?: string;
	comment?: string;
}

export interface SellerRatingRequest {
	seller_id: number;
	order_id: number;
	rating: number;
	title?: string;
	comment?: string;
}

export interface ProblemReportRequest {
	type: "product" | "seller";
	entity_id: number;
	order_id: number;
	problem_type: string;
	description: string;
}

export interface ReportResponse {
	status: string;
	message: string;
	data: {
		id: number;
		type: string;
		status: string;
	};
}

export interface RatingReplyRequest {
	rating_id: number;
	reply_text: string;
}

export interface RatingReplyResponse {
	status: string;
	message: string;
	data: {
		id: number;
		rating_id: number;
		text: string;
		created_at: string;
	};
}

export interface RatingReportRequest {
	rating_id: number;
	reason: string;
}

export interface RatingReportResponse {
	status: string;
	message: string;
}

/**
 * Servicio para gestionar valoraciones de productos y vendedores
 */
export class RatingService {
	/**
	 * Obtiene las valoraciones pendientes del usuario
	 */
	async getPendingRatings(): Promise<PendingRatingsResponse> {
		try {
			const response = await ApiClient.get<PendingRatingsResponse>(
				API_ENDPOINTS.RATINGS.PENDING
			);
			return response;
		} catch (error) {
			console.error("Error al obtener valoraciones pendientes:", error);
			// Devuelve respuesta vacía en caso de error
			return {
				status: "error",
				data: {
					products: [],
					sellers: [],
				},
			};
		}
	}

	/**
	 * Valora un producto
	 */
	async rateProduct(data: ProductRatingRequest): Promise<RatingResponse> {
		try {
			const response = await ApiClient.post<RatingResponse>(
				API_ENDPOINTS.RATINGS.RATE_PRODUCT,
				data
			);
			return response;
		} catch (error) {
			console.error("Error al valorar producto:", error);
			throw error;
		}
	}

	/**
	 * Valora un vendedor
	 */
	async rateSeller(data: SellerRatingRequest): Promise<RatingResponse> {
		try {
			const response = await ApiClient.post<RatingResponse>(
				API_ENDPOINTS.RATINGS.RATE_SELLER,
				data
			);
			return response;
		} catch (error) {
			console.error("Error al valorar vendedor:", error);
			throw error;
		}
	}

	/**
	 * Obtiene las valoraciones de un producto
	 */
	async getProductRatings(
		productId: number,
		page: number = 1,
		perPage: number = 10
	): Promise<ProductRatingsResponse> {
		try {
			const response = await ApiClient.get<ProductRatingsResponse>(
				API_ENDPOINTS.RATINGS.PRODUCT(productId),
				{page, per_page: perPage}
			);
			return response;
		} catch (error) {
			console.error(
				`Error al obtener valoraciones del producto ${productId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Obtiene las valoraciones de un vendedor
	 */
	async getSellerRatings(
		sellerId: number,
		page: number = 1,
		perPage: number = 10
	): Promise<SellerRatingsResponse> {
		try {
			const response = await ApiClient.get<SellerRatingsResponse>(
				API_ENDPOINTS.RATINGS.SELLER(sellerId),
				{page, per_page: perPage}
			);
			return response;
		} catch (error) {
			console.error(
				`Error al obtener valoraciones del vendedor ${sellerId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Reporta un problema con un producto/vendedor
	 */
	async reportProblem(data: ProblemReportRequest): Promise<ReportResponse> {
		try {
			const response = await ApiClient.post<ReportResponse>(
				API_ENDPOINTS.RATINGS.REPORT_PROBLEM,
				data
			);
			return response;
		} catch (error) {
			console.error("Error al reportar problema:", error);
			throw error;
		}
	}

	/**
	 * Responde a una valoración (para vendedores)
	 */
	async replyToRating(data: RatingReplyRequest): Promise<RatingReplyResponse> {
		try {
			const response = await ApiClient.post<RatingReplyResponse>(
				API_ENDPOINTS.RATINGS.REPLY,
				data
			);
			return response;
		} catch (error) {
			console.error("Error al responder a valoración:", error);
			throw error;
		}
	}

	/**
	 * Reporta una valoración inapropiada (para vendedores)
	 */
	async reportRating(data: RatingReportRequest): Promise<RatingReportResponse> {
		try {
			const response = await ApiClient.post<RatingReportResponse>(
				API_ENDPOINTS.RATINGS.REPORT,
				data
			);
			return response;
		} catch (error) {
			console.error("Error al reportar valoración:", error);
			throw error;
		}
	}

	/**
	 * Obtiene las valoraciones recibidas del vendedor actual
	 */
	async getMyReceivedRatings(
		page: number = 1,
		perPage: number = 10,
		status?: string
	): Promise<SellerRatingsResponse> {
		try {
			const params: Record<string, any> = {
				page,
				per_page: perPage,
			};

			if (status) {
				params.status = status;
			}

			const response = await ApiClient.get<SellerRatingsResponse>(
				API_ENDPOINTS.RATINGS.MY_RECEIVED,
				params
			);
			return response;
		} catch (error) {
			console.error("Error al obtener valoraciones recibidas:", error);
			throw error;
		}
	}

	/**
	 * Obtiene las valoraciones dadas por el usuario actual
	 */
	async getMyGivenRatings(
		page: number = 1,
		perPage: number = 10,
		type?: "product" | "seller"
	): Promise<ProductRatingsResponse> {
		try {
			const params: Record<string, any> = {
				page,
				per_page: perPage,
			};

			if (type) {
				params.type = type;
			}

			const response = await ApiClient.get<ProductRatingsResponse>(
				API_ENDPOINTS.RATINGS.MY_GIVEN,
				params
			);
			return response;
		} catch (error) {
			console.error("Error al obtener valoraciones dadas:", error);
			throw error;
		}
	}
}

export default RatingService;
