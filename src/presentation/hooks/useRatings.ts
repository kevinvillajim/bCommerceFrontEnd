// src/presentation/hooks/useRatings.ts
import {useState, useCallback} from "react";
import RatingService from "../../core/services/RatingService";
import type {
	ProductRatingRequest,
	SellerRatingRequest,
	ProblemReportRequest,
	RatingReplyRequest,
	RatingReportRequest,
} from "../../core/services/RatingService";
import {extractErrorMessage} from "../../utils/errorHandler";

export const useRatings = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const ratingService = new RatingService();

	// Función para obtener valoraciones pendientes
	const getPendingRatings = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			console.log("Solicitando valoraciones pendientes...");
			const response = await ratingService.getPendingRatings();
			console.log("Respuesta de valoraciones pendientes:", response);
			return response;
		} catch (err) {
			console.error("Error al obtener valoraciones pendientes:", err);
			const errorMessage = extractErrorMessage(
				err,
				"Error al obtener valoraciones pendientes"
			);
			setError(errorMessage);
			return {
				status: "error",
				message: errorMessage,
				data: {products: [], sellers: []},
			};
		} finally {
			setLoading(false);
		}
	}, [ratingService]);

	// Función para valorar un producto
	const rateProduct = useCallback(
		async (data: ProductRatingRequest) => {
			setLoading(true);
			setError(null);
			try {
				console.log("Enviando valoración de producto:", data);
				const response = await ratingService.rateProduct(data);
				console.log("Respuesta al valorar producto:", response);
				return response;
			} catch (err) {
				console.error("Error al valorar producto:", err);
				const errorMessage = extractErrorMessage(
					err,
					"Error al valorar producto"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[ratingService]
	);

	// Función para valorar un vendedor
	const rateSeller = useCallback(
		async (data: SellerRatingRequest) => {
			setLoading(true);
			setError(null);
			try {
				console.log("Enviando valoración de vendedor:", data);
				const response = await ratingService.rateSeller(data);
				console.log("Respuesta al valorar vendedor:", response);
				return response;
			} catch (err) {
				console.error("Error al valorar vendedor:", err);
				const errorMessage = extractErrorMessage(
					err,
					"Error al valorar vendedor"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[ratingService]
	);

	// Función para reportar un problema
	const reportProblem = useCallback(
		async (data: ProblemReportRequest) => {
			setLoading(true);
			setError(null);
			try {
				console.log("Enviando reporte de problema:", data);
				const response = await ratingService.reportProblem(data);
				console.log("Respuesta al reportar problema:", response);
				return response;
			} catch (err) {
				console.error("Error al reportar problema:", err);
				const errorMessage = extractErrorMessage(
					err,
					"Error al reportar problema"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[ratingService]
	);

	// Función para responder a una valoración
	const replyToRating = useCallback(
		async (ratingId: number, replyText: string) => {
			setLoading(true);
			setError(null);
			try {
				console.log("Enviando respuesta a valoración:", {ratingId, replyText});
				const request: RatingReplyRequest = {
					rating_id: ratingId,
					reply_text: replyText,
				};
				const response = await ratingService.replyToRating(request);
				console.log("Respuesta al responder valoración:", response);
				return response;
			} catch (err) {
				console.error("Error al responder valoración:", err);
				const errorMessage = extractErrorMessage(
					err,
					"Error al responder valoración"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[ratingService]
	);

	// Función para reportar una valoración inapropiada
	const reportRating = useCallback(
		async (ratingId: number, reason: string) => {
			setLoading(true);
			setError(null);
			try {
				console.log("Enviando reporte de valoración:", {ratingId, reason});
				const request: RatingReportRequest = {
					rating_id: ratingId,
					reason: reason,
				};
				const response = await ratingService.reportRating(request);
				console.log("Respuesta al reportar valoración:", response);
				return response;
			} catch (err) {
				console.error("Error al reportar valoración:", err);
				const errorMessage = extractErrorMessage(
					err,
					"Error al reportar valoración"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[ratingService]
	);

	// Función para obtener valoraciones de un producto
	const getProductRatings = useCallback(
		async (productId: number, page: number = 1, perPage: number = 10) => {
			setLoading(true);
			setError(null);
			try {
				console.log(`Obteniendo valoraciones del producto ${productId}...`);
				const response = await ratingService.getProductRatings(
					productId,
					page,
					perPage
				);
				console.log(`Valoraciones del producto ${productId}:`, response);
				return response;
			} catch (err) {
				console.error(
					`Error al obtener valoraciones del producto ${productId}:`,
					err
				);
				const errorMessage = extractErrorMessage(
					err,
					"Error al obtener valoraciones del producto"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[ratingService]
	);

	// Función para obtener valoraciones de un vendedor
	const getSellerRatings = useCallback(
		async (sellerId: number, page: number = 1, perPage: number = 10) => {
			setLoading(true);
			setError(null);
			try {
				console.log(`Obteniendo valoraciones del vendedor ${sellerId}...`);
				const response = await ratingService.getSellerRatings(
					sellerId,
					page,
					perPage
				);
				console.log(`Valoraciones del vendedor ${sellerId}:`, response);
				return response;
			} catch (err) {
				console.error(
					`Error al obtener valoraciones del vendedor ${sellerId}:`,
					err
				);
				const errorMessage = extractErrorMessage(
					err,
					"Error al obtener valoraciones del vendedor"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[ratingService]
	);

	// Función para obtener mis valoraciones recibidas
	const getMyReceivedRatings = useCallback(
		async (page: number = 1, perPage: number = 10, status?: string) => {
			setLoading(true);
			setError(null);
			try {
				console.log("Obteniendo mis valoraciones recibidas...");
				const response = await ratingService.getMyReceivedRatings(
					page,
					perPage,
					status
				);
				console.log("Mis valoraciones recibidas:", response);
				return response;
			} catch (err) {
				console.error("Error al obtener mis valoraciones recibidas:", err);
				const errorMessage = extractErrorMessage(
					err,
					"Error al obtener mis valoraciones recibidas"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[ratingService]
	);

	return {
		loading,
		error,
		getPendingRatings,
		rateProduct,
		rateSeller,
		reportProblem,
		replyToRating,
		reportRating,
		getProductRatings,
		getSellerRatings,
		getMyReceivedRatings,
	};
};
