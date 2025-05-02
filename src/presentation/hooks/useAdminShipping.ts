// src/admin/hooks/useAdminShipping.ts
import {useState, useEffect, useCallback} from "react";
import AdminShippingService from "../../core/services/AdminShippingService";
import type {
	AdminShippingFilters,
} from "../../core/services/AdminShippingService";
import type {
	AdminShippingModel,
	AdminTrackingEvent,
} from "../../core/adapters/AdminShippingAdapter";

export const useAdminShipping = () => {
	const shippingService = new AdminShippingService();

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
	}>({
		from: "",
		to: "",
	});

	// Paginación
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	/**
	 * Cargar listado de envíos para administración
	 */
	const fetchAdminShippings = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			// Preparar filtros para la API
			const filters: AdminShippingFilters = {
				page: pagination.currentPage,
				limit: pagination.itemsPerPage,
			};

			// Añadir filtros opcionales si están seleccionados
			if (statusFilter !== "all") {
				filters.status = statusFilter;
			}

			if (carrierFilter !== "all") {
				filters.carrier = carrierFilter;
			}

			if (dateRangeFilter.from) {
				filters.date_from = dateRangeFilter.from;
			}

			if (dateRangeFilter.to) {
				filters.date_to = dateRangeFilter.to;
			}

			const response = await shippingService.getAdminShippings(filters);

			setAdminShippings(response.data);
			setPagination({
				currentPage: response.pagination.currentPage,
				totalPages: response.pagination.totalPages,
				totalItems: response.pagination.totalItems,
				itemsPerPage: response.pagination.itemsPerPage,
			});
		} catch (err) {
			console.error("Error al obtener envíos para administración:", err);
			setError("Error al cargar los envíos. Inténtalo de nuevo más tarde.");
		} finally {
			setLoading(false);
		}
	}, [
		pagination.currentPage,
		pagination.itemsPerPage,
		statusFilter,
		carrierFilter,
		dateRangeFilter,
		shippingService,
	]);

	/**
	 * Cargar los datos al montar el componente y cuando cambien los filtros
	 */
	useEffect(() => {
		fetchAdminShippings();
	}, [fetchAdminShippings]);

	/**
	 * Obtener detalles de un envío para administración
	 */
	const fetchAdminShippingDetail = useCallback(
		async (shipping: AdminShippingModel) => {
			setSelectedAdminShipping(shipping);
			setShowTrackingModal(true);

			try {
				// Cargar historial del envío si no lo tiene o está vacío
				if (
					!shipping.trackingHistory ||
					shipping.trackingHistory.length === 0
				) {
					const history = await shippingService.getAdminShippingHistory(
						shipping.trackingNumber
					);

					// Actualizar el envío seleccionado con el historial
					setSelectedAdminShipping((prev) => {
						if (!prev) return null;
						return {
							...prev,
							trackingHistory: history,
						};
					});
				}
			} catch (err) {
				console.error(
					"Error al obtener detalles del envío para administración:",
					err
				);
			}
		},
		[shippingService]
	);

	/**
	 * Actualizar estado de un envío para administración
	 */
	const updateAdminShippingStatus = useCallback(
		async (trackingNumber: string, status: string) => {
			setLoading(true);

			try {
				const success = await shippingService.updateAdminShippingStatus(
					trackingNumber,
					status
				);

				if (success) {
					// Actualizar el envío en la lista local
					setAdminShippings((prevShippings) =>
						prevShippings.map((shipping) =>
							shipping.trackingNumber === trackingNumber
								? {...shipping, status}
								: shipping
						)
					);

					// Si hay un envío seleccionado, actualizarlo también
					if (
						selectedAdminShipping &&
						selectedAdminShipping.trackingNumber === trackingNumber
					) {
						setSelectedAdminShipping((prev) => {
							if (!prev) return null;

							// Crear un nuevo evento en el historial
							const newEvent: AdminTrackingEvent = {
								id:
									prev.trackingHistory.length > 0
										? Math.max(...prev.trackingHistory.map((e) => e.id)) + 1
										: 1,
								status,
								location: "Actualización del administrador",
								timestamp: new Date().toISOString(),
								description: `Estado actualizado a: ${status}`,
							};

							return {
								...prev,
								status,
								trackingHistory: [newEvent, ...prev.trackingHistory],
							};
						});
					}

					return true;
				}

				throw new Error("No se pudo actualizar el estado del envío");
			} catch (err) {
				console.error(
					`Error al actualizar el estado del envío ${trackingNumber}:`,
					err
				);
				setError(
					"Error al actualizar el estado del envío. Inténtalo de nuevo."
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[shippingService, selectedAdminShipping]
	);

	/**
	 * Avanzar al siguiente estado del envío para administración
	 */
	const advanceAdminShippingStatus = useCallback(
		(shippingId: number, currentStatus: string) => {
			// Encontrar el envío por ID
			const shipping = adminShippings.find((s) => s.id === shippingId);
			if (!shipping) return;

			// Determinar el siguiente estado según el estado actual
			const statusFlow: Record<string, string> = {
				pending: "processing",
				processing: "ready_for_pickup",
				ready_for_pickup: "shipped",
				shipped: "in_transit",
				in_transit: "out_for_delivery",
				out_for_delivery: "delivered",
				delivered: "delivered", // Estado final
				failed_delivery: "out_for_delivery", // Reintentar entrega
				returned: "returned", // Estado final
				cancelled: "cancelled", // Estado final
			};

			const nextStatus = statusFlow[currentStatus] || currentStatus;

			// Si hay un siguiente estado diferente, actualizarlo
			if (nextStatus !== currentStatus) {
				updateAdminShippingStatus(shipping.trackingNumber, nextStatus);
			}
		},
		[adminShippings, updateAdminShippingStatus]
	);

	/**
	 * Enviar notificación de seguimiento para administración
	 */
	const sendAdminTrackingNotification = useCallback(
		async (trackingNumber: string) => {
			try {
				const success =
					await shippingService.sendAdminTrackingNotification(trackingNumber);

				if (success) {
					alert(
						`Se ha enviado la notificación de seguimiento para el envío ${trackingNumber}`
					);
				}

				return success;
			} catch (err) {
				console.error(
					`Error al enviar notificación para ${trackingNumber}:`,
					err
				);
				return false;
			}
		},
		[shippingService]
	);

	/**
	 * Simular eventos de envío para pruebas en administración
	 */
	const simulateAdminShippingEvents = useCallback(
		async (trackingNumber: string, days: number = 5) => {
			setLoading(true);

			try {
				const success = await shippingService.simulateAdminShippingEvents(
					trackingNumber,
					days
				);

				// Recargar los datos después de la simulación
				if (success) {
					await fetchAdminShippings();
				}

				return success;
			} catch (err) {
				console.error(`Error al simular eventos para ${trackingNumber}:`, err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[shippingService, fetchAdminShippings]
	);

	/**
	 * Cambiar página de resultados para administración
	 */
	const handleAdminPageChange = useCallback((page: number) => {
		setPagination((prev) => ({
			...prev,
			currentPage: page,
		}));
	}, []);

	/**
	 * Refrescar datos para administración
	 */
	const refreshAdminData = useCallback(() => {
		fetchAdminShippings();
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
		pagination,
		setStatusFilter,
		setCarrierFilter,
		setDateRangeFilter,
		setShowTrackingModal,
		fetchAdminShippings,
		fetchAdminShippingDetail,
		updateAdminShippingStatus,
		advanceAdminShippingStatus,
		sendAdminTrackingNotification,
		simulateAdminShippingEvents,
		handleAdminPageChange,
		refreshAdminData,
	};
};

export default useAdminShipping;
