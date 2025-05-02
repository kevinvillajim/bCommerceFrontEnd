import {useState, useEffect, useCallback} from "react";
import type {
	ShippingFilters,
} from "../../core/services/AdminShippingService";
import AdminShippingService from "../../core/services/AdminShippingService";
import type {AdminShippingModel} from "../../core/adapters/AdminShippingAdapter";

/**
 * Hook personalizado para la administración de envíos
 */
const useAdminShipping = () => {
	// Instanciar el servicio
	const adminShippingService = new AdminShippingService();

	// Estados
	const [adminShippings, setAdminShippings] = useState<AdminShippingModel[]>(
		[]
	);
	const [selectedAdminShipping, setSelectedAdminShipping] =
		useState<AdminShippingModel | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [showTrackingModal, setShowTrackingModal] = useState<boolean>(false);

	// Filtros
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [carrierFilter, setCarrierFilter] = useState<string>("all");
	const [dateRangeFilter, setDateRangeFilter] = useState<{
		from: string;
		to: string;
	}>({from: "", to: ""});
	const [searchTerm, setSearchTerm] = useState<string>("");

	// Paginación
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	/**
	 * Obtiene la lista de envíos desde el backend
	 */
	const fetchAdminShippings = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Preparar filtros para la API
			const filters: ShippingFilters = {
				page: pagination.currentPage,
				limit: pagination.itemsPerPage,
			};

			// Añadir filtros adicionales si están definidos
			if (statusFilter !== "all") filters.status = statusFilter;
			if (carrierFilter !== "all") filters.carrier = carrierFilter;
			if (dateRangeFilter.from) filters.dateFrom = dateRangeFilter.from;
			if (dateRangeFilter.to) filters.dateTo = dateRangeFilter.to;
			if (searchTerm) filters.search = searchTerm;

			// Llamar al servicio
			const result = await adminShippingService.getShippings(filters);

			// Actualizar estados
			setAdminShippings(result.shippings);
			setPagination(result.pagination);
		} catch (err) {
			console.error("Error al obtener envíos:", err);
			setError(err instanceof Error ? err.message : "Error al cargar envíos");
		} finally {
			setLoading(false);
		}
	}, [
		adminShippingService,
		pagination.currentPage,
		pagination.itemsPerPage,
		statusFilter,
		carrierFilter,
		dateRangeFilter,
		searchTerm,
	]);

	/**
	 * Obtiene los detalles de un envío específico
	 */
	const fetchAdminShippingDetail = useCallback(
		async (shipping: AdminShippingModel) => {
			setLoading(true);

			try {
				// Si ya tenemos el historial completo, usamos ese
				if (shipping.trackingHistory && shipping.trackingHistory.length > 0) {
					setSelectedAdminShipping(shipping);
					setShowTrackingModal(true);
					setLoading(false);
					return;
				}

				// Si no, obtenemos el historial del backend
				const history = await adminShippingService.getShippingHistory(
					shipping.trackingNumber
				);

				// Creamos una copia del envío con el historial actualizado
				const shippingWithHistory = {
					...shipping,
					trackingHistory: history,
				};

				setSelectedAdminShipping(shippingWithHistory);
				setShowTrackingModal(true);
			} catch (err) {
				console.error(
					`Error al obtener detalles del envío ${shipping.trackingNumber}:`,
					err
				);
				setError(
					err instanceof Error
						? err.message
						: "Error al cargar detalles del envío"
				);

				// Aún así mostramos el modal con los datos que tenemos
				setSelectedAdminShipping(shipping);
				setShowTrackingModal(true);
			} finally {
				setLoading(false);
			}
		},
		[adminShippingService]
	);

	/**
	 * Actualiza el estado de un envío
	 */
	const updateAdminShippingStatus = useCallback(
		async (trackingNumber: string, status: string) => {
			setLoading(true);

			try {
				const success = await adminShippingService.updateShippingStatus(
					trackingNumber,
					status
				);

				if (success) {
					// Refrescar la lista después de actualizar
					await fetchAdminShippings();
					return true;
				}

				return false;
			} catch (err) {
				console.error(
					`Error al actualizar estado del envío ${trackingNumber}:`,
					err
				);
				setError(
					err instanceof Error ? err.message : "Error al actualizar estado"
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[adminShippingService, fetchAdminShippings]
	);

	/**
	 * Avanza el estado de un envío al siguiente estado lógico
	 */
	const advanceAdminShippingStatus = useCallback(
		async (id: number, currentStatus: string) => {
			const shipping = adminShippings.find((s) => s.id === id);

			if (!shipping) {
				setError("Envío no encontrado");
				return false;
			}

			setLoading(true);

			try {
				const success = await adminShippingService.advanceShippingStatus(
					shipping.trackingNumber,
					currentStatus
				);

				if (success) {
					// Refrescar la lista después de actualizar
					await fetchAdminShippings();
					return true;
				}

				return false;
			} catch (err) {
				console.error(
					`Error al avanzar estado del envío ${shipping.trackingNumber}:`,
					err
				);
				setError(
					err instanceof Error ? err.message : "Error al avanzar estado"
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[adminShippingService, adminShippings, fetchAdminShippings]
	);

	/**
	 * Envía una notificación de seguimiento al cliente
	 */
	const sendAdminTrackingNotification = useCallback(
		async (trackingNumber: string) => {
			setLoading(true);

			try {
				const success =
					await adminShippingService.sendTrackingNotification(trackingNumber);

				if (success) {
					alert("Notificación enviada correctamente");
					return true;
				}

				return false;
			} catch (err) {
				console.error(
					`Error al enviar notificación para ${trackingNumber}:`,
					err
				);
				setError(
					err instanceof Error ? err.message : "Error al enviar notificación"
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[adminShippingService]
	);

	/**
	 * Maneja el cambio de página en la paginación
	 */
	const handleAdminPageChange = useCallback((page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
	}, []);

	/**
	 * Refresca los datos de la lista de envíos
	 */
	const refreshAdminData = useCallback(() => {
		fetchAdminShippings();
	}, [fetchAdminShippings]);

	// Cargar envíos cuando cambian los filtros o la paginación
	useEffect(() => {
		fetchAdminShippings();
	}, [
		fetchAdminShippings,
		pagination.currentPage,
		statusFilter,
		carrierFilter,
	]);

	return {
		adminShippings,
		selectedAdminShipping,
		loading,
		error,
		showTrackingModal,
		statusFilter,
		carrierFilter,
		dateRangeFilter,
		searchTerm,
		pagination,
		setStatusFilter,
		setCarrierFilter,
		setDateRangeFilter,
		setSearchTerm,
		setShowTrackingModal,
		fetchAdminShippings,
		fetchAdminShippingDetail,
		updateAdminShippingStatus,
		advanceAdminShippingStatus,
		sendAdminTrackingNotification,
		handleAdminPageChange,
		refreshAdminData,
	};
};

export default useAdminShipping;
