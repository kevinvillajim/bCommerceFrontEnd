// src/presentation/hooks/useSellerRatings.ts
import {useState, useEffect, useCallback, useMemo, useRef} from "react";
import RatingService from "../../core/services/RatingService";
import type {ExtendedRating} from "../types/ratingTypes";
import {extractErrorMessage} from "../../utils/errorHandler";

// Estructura para las estadísticas de valoraciones
interface RatingStats {
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

/**
 * Hook personalizado para gestionar las valoraciones del vendedor
 */
export const useSellerRatings = () => {
	// Usamos useRef para mantener la misma instancia del servicio entre renderizados
	const ratingServiceRef = useRef<RatingService>(new RatingService());
	const ratingService = ratingServiceRef.current;

	// Estados
	const [ratings, setRatings] = useState<ExtendedRating[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Filtros
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [ratingFilter, setRatingFilter] = useState<string>("all");
	const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
	const [productFilter, setProductFilter] = useState<string>("all");

	// Paginación
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Cargar valoraciones
	const fetchRatings = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await ratingService.getMyReceivedRatings(
				pagination.currentPage,
				pagination.itemsPerPage,
				statusFilter !== "all" ? statusFilter : undefined
			);

			if (response) {
				setRatings(response.data);

				// Actualizar paginación
				setPagination((prev) => ({
					...prev,
					totalPages: response.meta.last_page,
					totalItems: response.meta.total,
				}));
			}
		} catch (err) {
			console.error("Error al obtener valoraciones:", err);
			const errorMessage = extractErrorMessage(
				err,
				"Error al cargar valoraciones"
			);
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [pagination.currentPage, pagination.itemsPerPage, statusFilter]);

	// Cargar datos al montar el componente
	useEffect(() => {
		fetchRatings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Función para cambiar de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({
			...prev,
			currentPage: page,
		}));
		// Llamar directamente a fetchRatings después de actualizar la página
		setTimeout(() => fetchRatings(), 0);
	};

	// Función para cambiar filtro de estado
	const handleStatusFilterChange = (value: string) => {
		setStatusFilter(value);
		setPagination((prev) => ({
			...prev,
			currentPage: 1,
		}));
		// Llamar directamente a fetchRatings después de actualizar el filtro
		setTimeout(() => fetchRatings(), 0);
	};

	// Función para limpiar filtros
	const clearFilters = () => {
		setSearchTerm("");
		setStatusFilter("all");
		setRatingFilter("all");
		setVerifiedFilter("all");
		setProductFilter("all");
		setPagination((prev) => ({
			...prev,
			currentPage: 1,
		}));
		// Llamar directamente a fetchRatings después de limpiar filtros
		setTimeout(() => fetchRatings(), 0);
	};

	// Función para responder a una valoración
	const replyToRating = async (ratingId: number, replyText: string) => {
		try {
			const response = await ratingService.replyToRating({
				rating_id: ratingId,
				reply_text: replyText,
			});

			// Recargar valoraciones tras responder
			fetchRatings();

			return response;
		} catch (error) {
			console.error("Error al responder valoración:", error);
			throw error;
		}
	};

	// Función para reportar una valoración
	const reportRating = async (ratingId: number, reason: string) => {
		try {
			const response = await ratingService.reportRating({
				rating_id: ratingId,
				reason,
			});

			// Recargar valoraciones tras reportar
			fetchRatings();

			return response;
		} catch (error) {
			console.error("Error al reportar valoración:", error);
			throw error;
		}
	};

	// Calcular estadísticas
	const stats = useMemo(() => {
		const defaultStats: RatingStats = {
			averageRating: 0,
			totalCount: 0,
			distribution: {
				"1": 0,
				"2": 0,
				"3": 0,
				"4": 0,
				"5": 0,
			},
			statusCounts: {
				pending: 0,
				approved: 0,
				rejected: 0,
			},
			verifiedCount: 0,
			respondedCount: 0,
		};

		if (!ratings.length) return defaultStats;

		// Calcular contadores
		let totalRating = 0;
		const distribution = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0};
		const statusCounts = {pending: 0, approved: 0, rejected: 0};
		let verifiedCount = 0;
		let respondedCount = 0;

		ratings.forEach((rating) => {
			// Suma para el promedio
			totalRating += rating.rating;

			// Distribución de estrellas
			const ratingKey = String(rating.rating) as keyof typeof distribution;
			distribution[ratingKey]++;

			// Estado
			statusCounts[rating.status as keyof typeof statusCounts]++;

			// Compras verificadas
			if (rating.is_verified_purchase) {
				verifiedCount++;
			}

			// Valoraciones con respuesta
			if (rating.seller_response) {
				respondedCount++;
			}
		});

		return {
			averageRating: ratings.length ? totalRating / ratings.length : 0,
			totalCount: ratings.length,
			distribution,
			statusCounts,
			verifiedCount,
			respondedCount,
		};
	}, [ratings]);

	// Aplicar filtros a las valoraciones
	const filteredRatings = useMemo(() => {
		return ratings.filter((rating) => {
			// Filtro por término de búsqueda
			if (searchTerm && !matchesSearchTerm(rating, searchTerm)) {
				return false;
			}

			// Filtro por puntuación
			if (ratingFilter !== "all" && String(rating.rating) !== ratingFilter) {
				return false;
			}

			// Filtro por estado
			if (statusFilter !== "all" && rating.status !== statusFilter) {
				return false;
			}

			// Filtro por compra verificada
			if (verifiedFilter === "verified" && !rating.is_verified_purchase) {
				return false;
			}
			if (verifiedFilter === "unverified" && rating.is_verified_purchase) {
				return false;
			}

			// Filtro por producto
			if (
				productFilter !== "all" &&
				String(rating.product_id) !== productFilter
			) {
				return false;
			}

			return true;
		});
	}, [
		ratings,
		searchTerm,
		ratingFilter,
		statusFilter,
		verifiedFilter,
		productFilter,
	]);

	// Función auxiliar para buscar términos en diferentes campos
	const matchesSearchTerm = (rating: ExtendedRating, term: string): boolean => {
		const searchLower = term.toLowerCase();

		// Buscar en título y comentario
		if (
			(rating.title && rating.title.toLowerCase().includes(searchLower)) ||
			(rating.comment && rating.comment.toLowerCase().includes(searchLower))
		) {
			return true;
		}

		// Buscar en datos de usuario
		if (
			rating.user &&
			rating.user.name &&
			rating.user.name.toLowerCase().includes(searchLower)
		) {
			return true;
		}

		// Buscar en datos de producto
		if (
			rating.product &&
			rating.product.name &&
			rating.product.name.toLowerCase().includes(searchLower)
		) {
			return true;
		}

		return false;
	};

	// Obtener lista única de productos para los filtros
	const getUniqueProducts = useCallback(() => {
		const uniqueProducts = new Map();

		ratings.forEach((rating) => {
			if (rating.product_id && rating.product?.name) {
				uniqueProducts.set(String(rating.product_id), {
					id: String(rating.product_id),
					name: rating.product.name,
				});
			}
		});

		return Array.from(uniqueProducts.values());
	}, [ratings]);

	return {
		ratings,
		filteredRatings,
		loading,
		error,
		stats,
		pagination,
		handlePageChange,
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter: handleStatusFilterChange, // Reemplazamos setStatusFilter con la nueva función
		ratingFilter,
		setRatingFilter,
		verifiedFilter,
		setVerifiedFilter,
		productFilter,
		setProductFilter,
		clearFilters,
		fetchRatings,
		replyToRating,
		reportRating,
		getUniqueProducts,
	};
};

export default useSellerRatings;