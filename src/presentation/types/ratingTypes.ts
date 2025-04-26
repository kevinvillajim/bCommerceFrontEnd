import type {Rating as BaseRating} from "../../core/services/RatingService";

// Extender el tipo Rating para incluir product
export interface ExtendedRating extends BaseRating {
	product?: {
		id?: number;
		name?: string;
		image?: string;
	};
}
export interface RatingResponse {
    status: string;
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