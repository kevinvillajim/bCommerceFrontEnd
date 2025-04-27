import type {Rating, RatingResponse} from "../services/RatingService";
import type {
	ExtendedRating,
	RatingResponse as UIRatingResponse,
} from "../../presentation/types/ratingTypes";

/**
 * Clase adaptadora para transformar respuestas de la API de valoraciones
 * al formato esperado por los componentes de UI
 */
export class RatingAdapter {
	/**
	 * Adapta la respuesta de valoraciones de la API al formato esperado por la UI
	 * Maneja diferentes estructuras posibles de respuesta
	 */
	static adaptRatingResponse(apiResponse: any): UIRatingResponse {
		console.log("Adaptando respuesta de valoraciones:", apiResponse);

		// Respuesta predeterminada
		const defaultResponse: UIRatingResponse = {
			status: "success",
			data: [],
			meta: {
				total: 0,
				per_page: 10,
				current_page: 1,
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

		// Si no hay respuesta, devolver la predeterminada
		if (!apiResponse) {
			return defaultResponse;
		}

		// Encontrar los datos de valoraciones
		let ratingsData: ExtendedRating[] = [];

		// Caso 1: apiResponse.data es un array
		if (apiResponse.data && Array.isArray(apiResponse.data)) {
			ratingsData = this.adaptRatingItems(apiResponse.data);
		}
		// Caso 2: apiResponse.data.data es un array (estructura anidada)
		else if (
			apiResponse.data &&
			apiResponse.data.data &&
			Array.isArray(apiResponse.data.data)
		) {
			ratingsData = this.adaptRatingItems(apiResponse.data.data);
		}

		// Encontrar los metadatos
		let metaData = {...defaultResponse.meta};

		// Caso 1: apiResponse.meta existe
		if (apiResponse.meta) {
			metaData = {
				...metaData,
				...apiResponse.meta,
			};
		}
		// Caso 2: apiResponse.data.meta existe (estructura anidada)
		else if (apiResponse.data && apiResponse.data.meta) {
			metaData = {
				...metaData,
				...apiResponse.data.meta,
			};
		}

		// Construir y devolver la respuesta adaptada
		return {
			status: apiResponse.status || "success",
			data: ratingsData,
			meta: metaData,
		};
	}

	/**
	 * Adapta los elementos individuales de valoración
	 */
	static adaptRatingItems(items: any[]): ExtendedRating[] {
		return items.map((item) => this.adaptRatingItem(item));
	}

	/**
	 * Adapta un elemento individual de valoración
	 */
	static adaptRatingItem(item: any): ExtendedRating {
		// Asegurarse de que todos los campos requeridos estén presentes
		const rating: ExtendedRating = {
			id: item.id || 0,
			rating: item.rating || 0,
			title: item.title || undefined,
			comment: item.comment || undefined,
			user_id: item.user_id || 0,
			product_id: item.product_id || undefined,
			seller_id: item.seller_id || undefined,
			order_id: item.order_id || 0,
			status: item.status || "pending",
			created_at: item.created_at || new Date().toISOString(),
			updated_at: item.updated_at || new Date().toISOString(),
			is_verified_purchase: !!item.is_verified_purchase,
		};

		// Añadir información de usuario si está disponible
		if (item.user) {
			rating.user = {
				id: item.user.id || 0,
				name: item.user.name || "Usuario",
				avatar: item.user.avatar,
			};
		}

		// Añadir información de producto si está disponible
		if (item.product) {
			rating.product = {
				id: item.product.id || item.product_id,
				name: item.product.name || "Producto",
				image: item.product.image || item.product.main_image,
			};
		}

		// Añadir respuesta del vendedor si está disponible
		if (item.seller_response) {
			rating.seller_response = {
				id: item.seller_response.id || 0,
				text: item.seller_response.text || "",
				created_at: item.seller_response.created_at || new Date().toISOString(),
			};
		}

		return rating;
	}
}
