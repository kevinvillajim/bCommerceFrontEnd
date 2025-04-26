import {useState} from "react";
import RatingService from "../../core/services/RatingService";
import type {
	Rating,
	PendingRatingItem,
	ProductRatingRequest,
	SellerRatingRequest,
	ProblemReportRequest,
} from "../../core/services/RatingService";

export const useRatings = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const ratingService = new RatingService();

	// Función para obtener valoraciones pendientes
	const getPendingRatings = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await ratingService.getPendingRatings();
			return response;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error desconocido";
			setError(`Error al obtener valoraciones pendientes: ${errorMessage}`);
			return {
				status: "error",
				data: {products: [], sellers: []},
			};
		} finally {
			setLoading(false);
		}
	};

	// Función para valorar un producto
	const rateProduct = async (data: ProductRatingRequest) => {
		setLoading(true);
		setError(null);
		try {
			const response = await ratingService.rateProduct(data);
			return response;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error desconocido";
			setError(`Error al valorar producto: ${errorMessage}`);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Función para valorar un vendedor
	const rateSeller = async (data: SellerRatingRequest) => {
		setLoading(true);
		setError(null);
		try {
			const response = await ratingService.rateSeller(data);
			return response;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error desconocido";
			setError(`Error al valorar vendedor: ${errorMessage}`);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Función para reportar un problema
	const reportProblem = async (data: ProblemReportRequest) => {
		setLoading(true);
		setError(null);
		try {
			const response = await ratingService.reportProblem(data);
			return response;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error desconocido";
			setError(`Error al reportar problema: ${errorMessage}`);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		error,
		getPendingRatings,
		rateProduct,
		rateSeller,
		reportProblem,
	};
};
