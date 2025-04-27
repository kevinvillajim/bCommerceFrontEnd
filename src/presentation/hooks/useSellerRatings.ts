import {useState, useEffect, useCallback} from "react";
import RatingService from "../../core/services/RatingService";
import {RatingAdapter} from "../../core/adapters/RatingAdapter";
import {extractErrorMessage} from "../../utils/errorHandler";
import type {ExtendedRating} from "../types/ratingTypes";

interface UsePaginationProps {
	initialPage?: number;
	initialLimit?: number;
}

interface UseFilterProps {
	initialStatus?: string;
	initialRating?: string;
	initialVerified?: string;
	initialProduct?: string;
}

export const useSellerRatings = (
	{initialPage = 1, initialLimit = 10}: UsePaginationProps = {},
	{
		initialStatus = "all",
		initialRating = "all",
		initialVerified = "all",
		initialProduct = "all",
	}: UseFilterProps = {}
) => {
	// Estados para datos
	const [ratings, setRatings] = useState<ExtendedRating[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Estados para filtros
	const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
	const [ratingFilter, setRatingFilter] = useState<string>(initialRating);
	const [verifiedFilter, setVerifiedFilter] = useState<string>(initialVerified);
	const [productFilter, setProductFilter] = useState<string>(initialProduct);
	const [searchTerm, setSearchTerm] = useState<string>("");

	// Estado para paginación
	const [pagination, setPagination] = useState({
		currentPage: initialPage,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: initialLimit,
	});

	// Estados para estadísticas
	const [stats, setStats] = useState({
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
	});

	// Instancia del servicio
	const ratingService = new RatingService();

	// Función para cargar valoraciones
	const fetchRatings = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Preparar filtros
			const params: Record<string, any> = {
				page: pagination.currentPage,
				per_page: pagination.itemsPerPage,
			};

			// Añadir filtro de estado si no es "all"
			if (statusFilter !== "all") {
				params.status = statusFilter;
			}

			console.log("Solicitando valoraciones con parámetros:", params);

			// Llamar a la API a través del servicio
			const response = await ratingService.getMyReceivedRatings(
				params.page,
				params.per_page,
				params.status
			);

			console.log("Respuesta de API de valoraciones:", response);

			// Adaptar la respuesta usando el adaptador
			const adaptedResponse = RatingAdapter.adaptRatingResponse(response);

			console.log("Respuesta adaptada:", adaptedResponse);

			// Actualizar datos
			setRatings(adaptedResponse.data);

			// Actualizar paginación
			setPagination({
				currentPage: Number(adaptedResponse.meta.current_page) || 1,
				totalPages: Number(adaptedResponse.meta.last_page) || 1,
				totalItems: Number(adaptedResponse.meta.total) || 0,
				itemsPerPage:
					Number(adaptedResponse.meta.per_page) || pagination.itemsPerPage,
			});

			// Actualizar estadísticas
			updateStats(adaptedResponse.data, adaptedResponse.meta);
		} catch (error) {
			console.error("Error al cargar valoraciones:", error);
			setError(
				extractErrorMessage(error, "No se pudieron cargar las valoraciones")
			);
			// En caso de error, establecer valoraciones vacías
			setRatings([]);
		} finally {
			setLoading(false);
		}
	}, [
		pagination.currentPage,
		pagination.itemsPerPage,
		statusFilter,
		ratingService,
	]);

	// Función para actualizar estadísticas
	const updateStats = (ratingsData: ExtendedRating[], meta: any) => {
		// Usar metadatos de la API si están disponibles
		if (meta && meta.average_rating && meta.rating_counts) {
			setStats((prevStats) => ({
				...prevStats,
				averageRating: meta.average_rating,
				totalCount: meta.total || ratingsData.length,
				distribution: meta.rating_counts,
			}));
		} else {
			// Calcular estadísticas manualmente si no están disponibles
			const totalCount = ratingsData.length;
			const averageRating =
				totalCount > 0
					? Number(
							(
								ratingsData.reduce((sum, r) => sum + r.rating, 0) / totalCount
							).toFixed(1)
						)
					: 0;

			// Distribución de valoraciones
			const distribution = {
				"1": ratingsData.filter((r) => r.rating === 1).length,
				"2": ratingsData.filter((r) => r.rating === 2).length,
				"3": ratingsData.filter((r) => r.rating === 3).length,
				"4": ratingsData.filter((r) => r.rating === 4).length,
				"5": ratingsData.filter((r) => r.rating === 5).length,
			};

			setStats((prevStats) => ({
				...prevStats,
				averageRating,
				totalCount,
				distribution,
			}));
		}

		// Estas estadísticas siempre se calculan manualmente
		const statusCounts = {
			pending: ratingsData.filter((r) => r.status === "pending").length,
			approved: ratingsData.filter((r) => r.status === "approved").length,
			rejected: ratingsData.filter((r) => r.status === "rejected").length,
		};

		const verifiedCount = ratingsData.filter(
			(r) => r.is_verified_purchase
		).length;
		const respondedCount = ratingsData.filter((r) => r.seller_response).length;

		setStats((prevStats) => ({
			...prevStats,
			statusCounts,
			verifiedCount,
			respondedCount,
		}));
	};

	// Función para responder a una valoración
	const replyToRating = async (ratingId: number, replyText: string) => {
		try {
			setLoading(true);

			const response = await ratingService.replyToRating({
				rating_id: ratingId,
				reply_text: replyText,
			});

			// Recargar datos después de responder
			await fetchRatings();

			return response;
		} catch (error) {
			console.error("Error al responder valoración:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Función para reportar una valoración
	const reportRating = async (ratingId: number, reason: string) => {
		try {
			setLoading(true);

			const response = await ratingService.reportRating({
				rating_id: ratingId,
				reason,
			});

			// Recargar datos después de reportar
			await fetchRatings();

			return response;
		} catch (error) {
			console.error("Error al reportar valoración:", error);
			throw error;
		} finally {
			setLoading(false);
		}
	};

	// Función para obtener productos únicos de las valoraciones
	const getUniqueProducts = useCallback(() => {
		const productMap = new Map();

		ratings.forEach((rating) => {
			if (rating.product_id) {
				const productName =
					rating.product?.name || `Producto ${rating.product_id}`;
				productMap.set(rating.product_id, {
					id: rating.product_id,
					name: productName,
				});
			}
		});

		return Array.from(productMap.values());
	}, [ratings]);

	// Filtrar valoraciones en el cliente
	const filteredRatings = useMemo(() => {
		return ratings.filter((rating) => {
			// Filtrar por puntuación
			const matchesRating =
				ratingFilter === "all" || Number(ratingFilter) === rating.rating;

			// Filtrar por producto
			const matchesProduct =
				productFilter === "all" ||
				(rating.product_id && String(rating.product_id) === productFilter);

			// Filtrar por compra verificada
			const matchesVerified =
				verifiedFilter === "all" ||
				(verifiedFilter === "verified" && rating.is_verified_purchase) ||
				(verifiedFilter === "unverified" && !rating.is_verified_purchase);

			// Filtrar por término de búsqueda
			const matchesSearch =
				searchTerm === "" ||
				(rating.product?.name &&
					rating.product.name
						.toLowerCase()
						.includes(searchTerm.toLowerCase())) ||
				(rating.user?.name &&
					rating.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(rating.title &&
					rating.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(rating.comment &&
					rating.comment.toLowerCase().includes(searchTerm.toLowerCase()));

			return (
				matchesRating && matchesProduct && matchesVerified && matchesSearch
			);
		});
	}, [ratings, ratingFilter, productFilter, verifiedFilter, searchTerm]);

	// Cargar datos al montar el componente y cuando cambien los filtros o paginación
	useEffect(() => {
		fetchRatings();
	}, [fetchRatings]);

	// Resetear página cuando cambian los filtros
	useEffect(() => {
		if (pagination.currentPage !== 1) {
			setPagination((prev) => ({...prev, currentPage: 1}));
		}
	}, [statusFilter]);

	// Función para cambiar la página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
	};

	// Función para limpiar filtros
	const clearFilters = () => {
		setStatusFilter("all");
		setRatingFilter("all");
		setVerifiedFilter("all");
		setProductFilter("all");
		setSearchTerm("");
	};

	return {
		// Datos
		ratings,
		filteredRatings,
		loading,
		error,
		stats,

		// Filtros
		statusFilter,
		setStatusFilter,
		ratingFilter,
		setRatingFilter,
		verifiedFilter,
		setVerifiedFilter,
		productFilter,
		setProductFilter,
		searchTerm,
		setSearchTerm,
		clearFilters,

		// Paginación
		pagination,
		handlePageChange,

		// Acciones
		fetchRatings,
		replyToRating,
		reportRating,

		// Utilidades
		getUniqueProducts,
	};
};
