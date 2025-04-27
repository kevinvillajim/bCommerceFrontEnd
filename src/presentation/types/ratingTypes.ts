import type {Rating as BaseRating} from "../../core/services/RatingService";

// Extender el tipo Rating para incluir información adicional
export interface ExtendedRating extends BaseRating {
	product?: {
		id?: number;
		name?: string;
		image?: string;
		slug?: string;
	};
	// Ya no necesitamos redefinir el campo id como opcional porque lo hemos hecho en BaseRating
	// Sólo mantenemos los campos adicionales que no están en BaseRating
}

// Respuesta adaptada de valoraciones para la UI
export interface RatingResponse {
	status: string;
	message?: string;
	data: ExtendedRating[];
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

// Estructura para estadísticas de valoraciones en la UI
export interface RatingStats {
	averageRating: number;
	totalCount: number;
	distribution: {
		"1": number;
		"2": number;
		"3": number;
		"4": number;
		"5": number;
	};
	statusCounts: {
		pending: number;
		approved: number;
		rejected: number;
	};
	verifiedCount: number;
	respondedCount: number;
}

// Estructura para formulario de valoración
export interface RatingFormData {
	rating: number;
	title?: string;
	comment?: string;
	entityId: number;
	orderId: number;
	entityType: "product" | "seller";
}

// Estructura para formulario de reporte
export interface ReportFormData {
	ratingId: number;
	reason: string;
}

// Estructura para formulario de respuesta
export interface ReplyFormData {
	ratingId: number;
	text: string;
}

// Estructura para filtros de valoraciones
export interface RatingFilters {
	status?: string;
	rating?: string;
	verified?: string;
	productId?: string;
	search?: string;
}

// Estructura para opciones de paginación
export interface PaginationOptions {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange: (page: number) => void;
}
