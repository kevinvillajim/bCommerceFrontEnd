// src/presentation/hooks/useAdminRatings.ts
import {useState, useEffect, useCallback} from "react";
import AdminRatingService from "../../core/services/AdminRatingService";
import type {AdminRatingFilters} from "../../core/services/AdminRatingService";
import type {Rating} from "../../core/domain/entities/Rating";
import {extractErrorMessage} from "../../utils/errorHandler";

export const useAdminRatings = () => {
	// Estado para almacenar las valoraciones
	const [ratings, setRatings] = useState<Rating[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statsLoading, setStatsLoading] = useState(true);

	// Estado para filtros
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [ratingFilter, setRatingFilter] = useState<number | null>(null);
	const [dateRangeFilter, setDateRangeFilter] = useState<{
		from: string;
		to: string;
	}>({
		from: "",
		to: "",
	});

	// Estado para paginación
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Estado para estadísticas
	const [stats, setStats] = useState({
		total: 0,
		pending: 0,
		approved: 0,
		rejected: 0,
	});

	// Estado para el modal de detalle
	const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
	const [showRatingModal, setShowRatingModal] = useState(false);
	const [moderationNote, setModerationNote] = useState("");

	// Añade un estado para controlar la inicialización
	const [isInitialized, setIsInitialized] = useState(false);

	// Inicializar el servicio
	const adminRatingService = new AdminRatingService();

	// Función para obtener las valoraciones
	const fetchRatings = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Preparar los filtros para la API
			const filters: AdminRatingFilters = {
				page: pagination.currentPage,
				per_page: pagination.itemsPerPage,
			};

			// Agregar filtros opcionales si están establecidos
			if (statusFilter !== "all") filters.status = statusFilter;
			if (typeFilter !== "all") filters.type = typeFilter;
			if (ratingFilter !== null) filters.rating = ratingFilter;
			if (dateRangeFilter.from) filters.from_date = dateRangeFilter.from;
			if (dateRangeFilter.to) filters.to_date = dateRangeFilter.to;

			// Realizar la petición
			const response = await adminRatingService.getRatings(filters);

			// Actualizar el estado con los datos recibidos
			if (response.status === "success" && response.data) {
				setRatings(response.data);

				// Actualizar información de paginación
				setPagination({
					currentPage: response.meta.current_page,
					totalPages: response.meta.last_page,
					totalItems: response.meta.total,
					itemsPerPage: response.meta.per_page,
				});
			} else {
				throw new Error(
					response.message || "Error al obtener las valoraciones"
				);
			}
		} catch (err) {
			console.error("Error al obtener valoraciones:", err);
			const errorMessage = extractErrorMessage(
				err,
				"Error al cargar las valoraciones"
			);
			setError(errorMessage);
		} finally {
			setLoading(false);
		}
	}, [
		adminRatingService,
		pagination.currentPage,
		pagination.itemsPerPage,
		statusFilter,
		typeFilter,
		ratingFilter,
		dateRangeFilter,
	]);

	// Función para obtener estadísticas
	const fetchStats = useCallback(async () => {
		setStatsLoading(true);
		try {
			const response = await adminRatingService.getRatingStats();
			if (response.status === "success" && response.data) {
				setStats({
					total: response.data.total || 0,
					pending: response.data.pending || 0,
					approved: response.data.approved || 0,
					rejected: response.data.rejected || 0,
				});
			}
		} catch (err) {
			console.error("Error al obtener estadísticas:", err);
		} finally {
			setStatsLoading(false);
		}
	}, [adminRatingService]);

	useEffect(() => {
		// Función para verificar la sesión antes de cargar datos
		const checkSessionAndLoad = async () => {
			try {
				// Opción 1: Hacer una petición liviana que solo verifique permisos
				// Por ejemplo: await ApiClient.get('/api/admin/check-session');

				// O simplemente esperar un momento para permitir que se inicialice la sesión
				await new Promise((resolve) => setTimeout(resolve, 500));

				// Si llegamos aquí, procedemos a cargar los datos
				setIsInitialized(true);
			} catch (err) {
				// Si hay un error, no inicializar
				console.error("Error al verificar la sesión:", err);
			}
		};

		checkSessionAndLoad();
	}, []);

	// Modifica el useEffect original para depender SOLO de isInitialized
	useEffect(() => {
		if (isInitialized) {
			fetchRatings();
			fetchStats();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isInitialized]); // Eliminamos fetchRatings y fetchStats de las dependencias

	// Modificamos las funciones que cambian filtros para que llamen a fetchRatings
	const handleStatusFilterChange = (status: string) => {
		setStatusFilter(status);
		// Utilizamos setTimeout para asegurar que el estado se actualice antes de fetchRatings
		setTimeout(() => fetchRatings(), 0);
	};

	const handleTypeFilterChange = (type: string) => {
		setTypeFilter(type);
		setTimeout(() => fetchRatings(), 0);
	};

	const handleRatingFilterChange = (rating: number | null) => {
		setRatingFilter(rating);
		setTimeout(() => fetchRatings(), 0);
	};

	const handleDateRangeFilterChange = (dateRange: {
		from: string;
		to: string;
	}) => {
		setDateRangeFilter(dateRange);
		setTimeout(() => fetchRatings(), 0);
	};

	// Función para cambiar de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({
			...prev,
			currentPage: page,
		}));
		// Cargar datos nuevamente cuando cambia la página
		setTimeout(() => fetchRatings(), 0);
	};

	// Función para abrir el modal de valoración
	const openRatingModal = (rating: Rating) => {
		setSelectedRating(rating);
		setModerationNote("");
		setShowRatingModal(true);
	};

	// Función para cerrar el modal de valoración
	const closeRatingModal = () => {
		setSelectedRating(null);
		setShowRatingModal(false);
		setModerationNote("");
	};

	// Función para aprobar una valoración
	const approveRating = async (ratingId: number) => {
		try {
			const response = await adminRatingService.approveRating(
				ratingId,
				moderationNote
			);
			if (response.status === "success") {
				// Actualizar el estado local
				setRatings((prevRatings) =>
					prevRatings.map((rating) =>
						rating.id === ratingId ? {...rating, status: "approved"} : rating
					)
				);

				// Actualizar estadísticas
				fetchStats();

				// Cerrar modal si está abierto
				closeRatingModal();

				return true;
			} else {
				throw new Error(response.message || "Error al aprobar la valoración");
			}
		} catch (err) {
			console.error(`Error al aprobar valoración ${ratingId}:`, err);
			setError(extractErrorMessage(err, "Error al aprobar la valoración"));
			return false;
		}
	};

	// Función para rechazar una valoración
	const rejectRating = async (ratingId: number) => {
		// Validar que hay una nota de moderación para el rechazo
		if (!moderationNote) {
			setError(
				"Es necesario proporcionar una nota de moderación para rechazar una valoración"
			);
			return false;
		}

		try {
			const response = await adminRatingService.rejectRating(
				ratingId,
				moderationNote
			);
			if (response.status === "success") {
				// Actualizar el estado local
				setRatings((prevRatings) =>
					prevRatings.map((rating) =>
						rating.id === ratingId ? {...rating, status: "rejected"} : rating
					)
				);

				// Actualizar estadísticas
				fetchStats();

				// Cerrar modal si está abierto
				closeRatingModal();

				return true;
			} else {
				throw new Error(response.message || "Error al rechazar la valoración");
			}
		} catch (err) {
			console.error(`Error al rechazar valoración ${ratingId}:`, err);
			setError(extractErrorMessage(err, "Error al rechazar la valoración"));
			return false;
		}
	};

	// Función para reportar una valoración
	const flagRating = async (ratingId: number, reason: string) => {
		try {
			const response = await adminRatingService.flagRating(ratingId, reason);

			if (response.status === "success") {
				// Actualizar el estado local con el nuevo estado
				if (response.data && response.data.newStatus) {
					setRatings((prevRatings) =>
						prevRatings.map((rating) =>
							rating.id === ratingId
								? {...rating, status: response.data.newStatus}
								: rating
						)
					);
				}

				// Actualizar estadísticas
				fetchStats();

				return true;
			} else {
				throw new Error(
					response.message || "Error al modificar el estado de la valoración"
				);
			}
		} catch (err) {
			console.error(
				`Error al modificar estado de valoración ${ratingId}:`,
				err
			);
			setError(
				extractErrorMessage(err, "Error al modificar estado de valoración")
			);
			return false;
		}
	};

	// Función para refrescar los datos
	const refreshData = () => {
		fetchRatings();
		fetchStats();
	};

	return {
		// Estado
		ratings,
		loading,
		error,
		statsLoading,
		stats,
		statusFilter,
		typeFilter,
		ratingFilter,
		dateRangeFilter,
		pagination,
		selectedRating,
		showRatingModal,
		moderationNote,

		// Funciones de acción
		setStatusFilter: handleStatusFilterChange,
		setTypeFilter: handleTypeFilterChange,
		setRatingFilter: handleRatingFilterChange,
		setDateRangeFilter: handleDateRangeFilterChange,
		handlePageChange,
		openRatingModal,
		closeRatingModal,
		setModerationNote,
		approveRating,
		rejectRating,
		flagRating,
		refreshData,
	};
};

export default useAdminRatings;
