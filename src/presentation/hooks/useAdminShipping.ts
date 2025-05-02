// src/presentation/hooks/useAdminShipping.ts
import {useState, useEffect, useCallback, useRef} from "react";
import type {ShippingFilters} from "../../core/services/AdminShippingService";
import AdminShippingService from "../../core/services/AdminShippingService";
import type {AdminShippingModel} from "../../core/adapters/AdminShippingAdapter";

/**
 * Hook personalizado para la administración de envíos
 */
const useAdminShipping = () => {
	// Instanciar el servicio (usando useRef para mantener la misma instancia)
	const serviceRef = useRef(new AdminShippingService());
	const adminShippingService = serviceRef.current;

	// Estados
	const [adminShippings, setAdminShippings] = useState<AdminShippingModel[]>(
		[]
	);
	const [selectedAdminShipping, setSelectedAdminShipping] =
		useState<AdminShippingModel | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
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

	// Flag para controlar si ya se ha cargado inicialmente
	const initialLoadDoneRef = useRef(false);

	/**
	 * Obtiene la lista de envíos desde el backend
	 */
	const fetchAdminShippings = useCallback(async () => {
		// Evitar carga si ya está en proceso
		if (loading) return;

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
		dateRangeFilter.from,
		dateRangeFilter.to,
		searchTerm,
		loading, // Importante: añadir loading para evitar múltiples llamadas
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

				// Obtener detalles completos y historial
				const details = await adminShippingService.getShippingDetail(
					shipping.id
				);

				if (details) {
					// Intentar obtener el historial si hay un número de seguimiento
					let history = [];
					if (details.trackingNumber) {
						history = await adminShippingService.getShippingHistory(
							details.trackingNumber
						);
					}

					// Crear una copia del envío con el historial actualizado
					const shippingWithHistory = {
						...details,
						trackingHistory: history,
					};

					setSelectedAdminShipping(shippingWithHistory);
				} else {
					// Si no hay detalles, usar los datos básicos
					setSelectedAdminShipping(shipping);
				}

				setShowTrackingModal(true);
			} catch (err) {
				console.error(
					`Error al obtener detalles del envío ${shipping.id}:`,
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
		async (orderId: number, status: string) => {
			setLoading(true);

			try {
				const success = await adminShippingService.updateShippingStatus(
					orderId,
					status
				);

				if (success) {
					// Refrescar la lista después de actualizar
					await fetchAdminShippings();
					return true;
				}

				return false;
			} catch (err) {
				console.error(`Error al actualizar estado del envío ${orderId}:`, err);
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
			setLoading(true);

			try {
				const success = await adminShippingService.advanceShippingStatus(
					id,
					currentStatus
				);

				if (success) {
					// Refrescar la lista después de actualizar
					await fetchAdminShippings();
					return true;
				}

				return false;
			} catch (err) {
				console.error(`Error al avanzar estado del envío ${id}:`, err);
				setError(
					err instanceof Error ? err.message : "Error al avanzar estado"
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[adminShippingService, fetchAdminShippings]
	);

	/**
	 * Envía una notificación de seguimiento al cliente
	 */
	const sendAdminTrackingNotification = useCallback(
		async (orderId: number) => {
			setLoading(true);

			try {
				const success =
					await adminShippingService.sendTrackingNotification(orderId);

				if (success) {
					alert("Notificación enviada correctamente");
					return true;
				}

				return false;
			} catch (err) {
				console.error(`Error al enviar notificación para ${orderId}:`, err);
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

	// Efecto para manejar cambios en los filtros principales
	useEffect(() => {
		// Evitar la primera carga ya que se hará en el efecto de carga inicial
		if (!initialLoadDoneRef.current) return;

		const timer = setTimeout(() => {
			fetchAdminShippings();
		}, 300); // Pequeño retraso para evitar múltiples llamadas

		// Limpieza para evitar múltiples ejecuciones
		return () => clearTimeout(timer);
	}, [
		fetchAdminShippings,
		pagination.currentPage,
		statusFilter,
		carrierFilter,
	]);

	// Efecto para la carga inicial que se ejecuta solo una vez
	useEffect(() => {
		if (!initialLoadDoneRef.current) {
			fetchAdminShippings();
			initialLoadDoneRef.current = true;
		}
	}, [fetchAdminShippings]);

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
