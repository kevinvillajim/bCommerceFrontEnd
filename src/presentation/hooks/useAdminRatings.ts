// src/presentation/hooks/useAdminRatings.ts
import {useState, useEffect, useCallback} from "react";
import AdminRatingService from "../../core/services/AdminRatingService";
import type {AdminRatingFilters, AdminRatingStatsResponse} from "../../core/services/AdminRatingService";
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
			console.log("Obteniendo valoraciones con filtros:", {
				page: pagination.currentPage,
				per_page: pagination.itemsPerPage,
				statusFilter,
				typeFilter,
				ratingFilter,
				dateRangeFilter
			});

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

			console.log("Filtros enviados a la API:", filters);

			// Realizar la petición
			const response = await adminRatingService.getRatings(filters);
			
			console.log("Respuesta recibida de la API:", response);

			// Actualizar el estado con los datos recibidos
			if (response && response.data) {
				console.log("Datos de valoraciones:", response.data);
				setRatings(Array.isArray(response.data) ? response.data : []);

				// Actualizar información de paginación si existe
				if (response.meta) {
					setPagination({
						currentPage: response.meta.current_page || pagination.currentPage,
						totalPages: response.meta.last_page || pagination.totalPages,
						totalItems: response.meta.total || 0,
						itemsPerPage: response.meta.per_page || pagination.itemsPerPage,
					});
				}
			} else {
				console.warn("Respuesta sin datos válidos:", response);
				setRatings([]);
			}
		} catch (err) {
			console.error("Error al obtener valoraciones:", err);
			const errorMessage = extractErrorMessage(
				err,
				"Error al cargar las valoraciones"
			);
			setError(errorMessage);
			setRatings([]); // Limpiar ratings en caso de error
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
			console.log("Obteniendo estadísticas de ratings...");
			const response = await adminRatingService.getRatingStats();
			console.log("Respuesta de estadísticas:", response);
			
			if (response && response.data) {
				console.log("Datos de estadísticas:", response.data);
				setStats({
					total: response.data.total || 0,
					pending: response.data.pending || 0,
					approved: response.data.approved || 0,
					rejected: response.data.rejected || 0,
				});
			} else if (response && response.status === "success") {
				// Si tiene status success pero no data, intentar usar la respuesta directamente
				console.log("Usando respuesta directa como datos:", response);
				setStats({
					total: (response as any).total || 0,
					pending: (response as any).pending || 0,
					approved: (response as any).approved || 0,
					rejected: (response as any).rejected || 0,
				});
			} else {
				console.warn("Respuesta de estadísticas sin datos válidos:", response);
				setStats({
					total: 0,
					pending: 0,
					approved: 0,
					rejected: 0,
				});
			}
		} catch (err) {
			console.error("Error al obtener estadísticas:", err);
			// En caso de error, mantener estadísticas en 0
			setStats({
				total: 0,
				pending: 0,
				approved: 0,
				rejected: 0,
			});
		} finally {
			setStatsLoading(false);
		}
	}, [adminRatingService]);

	// Efecto inicial simplificado - cargar datos al montar el componente
	useEffect(() => {
		fetchRatings();
		fetchStats();
	}, []); // Solo ejecutar al montar

	// Efecto para recargar cuando cambien los filtros
	useEffect(() => {
		if (isInitialized) {
			fetchRatings();
		}
	}, [statusFilter, typeFilter, ratingFilter, dateRangeFilter, pagination.currentPage]);
	
	// Marcar como inicializado después del primer render
	useEffect(() => {
		setIsInitialized(true);
	}, []);

	// Función para calcular estadísticas desde los datos cargados (fallback)
	const calculateStatsFromData = useCallback(() => {
		if (ratings.length > 0) {
			const calculatedStats = {
				total: ratings.length,
				pending: ratings.filter(r => r.status === 'pending').length,
				approved: ratings.filter(r => r.status === 'approved').length,
				rejected: ratings.filter(r => r.status === 'rejected').length,
			};
			console.log("Estadísticas calculadas desde los datos:", calculatedStats);
			setStats(calculatedStats);
		}
	}, [ratings]);

	// Calcular estadísticas desde los datos si no se obtuvieron del servidor
	useEffect(() => {
		if (ratings.length > 0 && stats.total === 0 && !statsLoading) {
			console.log("Estadísticas del servidor no disponibles, calculando desde los datos locales...");
			calculateStatsFromData();
		}
	}, [ratings, stats.total, statsLoading, calculateStatsFromData]);


	// Funciones simplificadas para cambiar filtros - el useEffect se encarga de recargar
	const handleStatusFilterChange = (status: string) => {
		setStatusFilter(status);
		// Resetear a la primera página al cambiar filtros
		setPagination(prev => ({ ...prev, currentPage: 1 }));
	};

	const handleTypeFilterChange = (type: string) => {
		setTypeFilter(type);
		setPagination(prev => ({ ...prev, currentPage: 1 }));
	};

	const handleRatingFilterChange = (rating: number | null) => {
		setRatingFilter(rating);
		setPagination(prev => ({ ...prev, currentPage: 1 }));
	};

	const handleDateRangeFilterChange = (dateRange: {
		from: string;
		to: string;
	}) => {
		setDateRangeFilter(dateRange);
		setPagination(prev => ({ ...prev, currentPage: 1 }));
	};

	// Función para cambiar de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({
			...prev,
			currentPage: page,
		}));
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
				// CORREGIDO: Verificar si data existe antes de acceder a newStatus
				if (response.data && response.data.newStatus) {
					setRatings((prevRatings) =>
						prevRatings.map((rating) =>
							rating.id === ratingId
								? {...rating, status: response.data!.newStatus as any} // CORREGIDO: non-null assertion y cast
								: rating
						)
					);
				}

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
