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
		sellers: PendingSellerItem[];
	};
}

export interface PendingRatingItem {
	id: number;
	name: string;
	image?: string;
	order_id: number;
	order_number: string;
	order_date: string;
	seller_id?: number;
	productId?: number;
	sellerId?: number;
}

export interface PendingSellerItem {
	id?: number;
	seller_id: number;
	order_id: number;
	seller_order_id?: number;
	order_number: string;
	date: string;
	name?: string;
	image?: string;
	is_rated: boolean;
}

export interface SellerRatingsResponse {
	status: string;
	message?: string; // Añadimos la propiedad message como opcional
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
	id?: number; // Hacemos el id opcional para que coincida con ExtendedRating
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
				type: "user_to_seller",
			};

			if (status && status !== "all") {
				params.status = status;
			}

			console.log("Solicitando valoraciones recibidas con parámetros:", params);
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.RATINGS.MY_RECEIVED,
				params
			);
			console.log("Respuesta original de valoraciones recibidas:", response);

			// Crear respuesta predeterminada
			const defaultResponse: SellerRatingsResponse = {
				status: "success",
				data: [],
				meta: {
					total: 0,
					per_page: perPage,
					current_page: page,
					last_page: 1,
					average_rating: 0,
					rating_counts: {
						"1": 0,
						"2": 0,
						"3": 0,
						"4": 0,
						"5": 0,
					},
				},
			};

			// Manejar diferentes estructuras de respuesta posibles
			if (!response) {
				return defaultResponse;
			}

			// Caso 1: Estructura response.data.data (anidada)
			if (response.data && response.data.data) {
				return {
					status: "success",
					data: response.data.data,
					meta: response.data.meta || defaultResponse.meta,
				};
			}

			// Caso 2: Estructura response.data (array)
			if (response.data && Array.isArray(response.data)) {
				return {
					status: "success",
					data: response.data,
					meta: response.meta || defaultResponse.meta,
				};
			}

			// Caso 3: Estructura response (object con properties data y meta)
			if (response.data && !Array.isArray(response.data)) {
				return {
					status: "success",
					data: response.data,
					meta: response.meta || defaultResponse.meta,
				};
			}

			// Si ninguno de los casos anteriores coincide, devolver la respuesta predeterminada
			return defaultResponse;
		} catch (error) {
			console.error("Error al obtener valoraciones recibidas:", error);
			// Devolver una respuesta con estructura válida en caso de error
			return {
				status: "error",
				message: error instanceof Error ? error.message : "Error desconocido",
				data: [],
				meta: {
					total: 0,
					per_page: perPage,
					current_page: page,
					last_page: 1,
					average_rating: 0,
					rating_counts: {
						"1": 0,
						"2": 0,
						"3": 0,
						"4": 0,
						"5": 0,
					},
				},
			};
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
