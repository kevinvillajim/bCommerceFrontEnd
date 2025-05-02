import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	AdminShippingModel,
	AdminTrackingEvent,
} from "../adapters/AdminShippingAdapter";

export interface ShippingFilters {
	status?: string;
	carrier?: string;
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	limit?: number;
	search?: string;
}

/**
 * Servicio para administrar envíos desde el panel de administración
 */
export class AdminShippingService {
	/**
	 * Obtiene la lista de envíos con filtros opcionales
	 */
	async getShippings(filters: ShippingFilters = {}) {
		try {
			console.log(
				"AdminShippingService: Obteniendo envíos con filtros:",
				filters
			);

			// Usar el endpoint específico de envíos
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ADMIN.SHIPPING_LIST,
				filters
			);

			if (!response || !response.data) {
				return {
					shippings: [],
					pagination: {
						currentPage: 1,
						totalPages: 1,
						totalItems: 0,
						itemsPerPage: 10,
					},
				};
			}

			// Convertir respuesta a formato de envíos
            const shippingsList: AdminShippingModel[] = Array.isArray(response.data)
                ? response.data.map((shipping: any) => this.mapShippingToModel(shipping))
                : [];

			// Obtener información de paginación
			const pagination = response.pagination || {
				currentPage: 1,
				totalPages: 1,
				totalItems: shippingsList.length,
				itemsPerPage: 10,
			};

			return {
				shippings: shippingsList,
				pagination: {
					currentPage: Number(pagination.currentPage) || 1,
					totalPages: Number(pagination.totalPages) || 1,
					totalItems: Number(pagination.totalItems) || shippingsList.length,
					itemsPerPage: Number(pagination.itemsPerPage) || 10,
				},
			};
		} catch (error) {
			console.error("AdminShippingService: Error al obtener envíos:", error);
			return {
				shippings: [],
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalItems: 0,
					itemsPerPage: 10,
				},
			};
		}
	}

	/**
	 * Obtiene los detalles de un envío específico
	 */
	async getShippingDetail(id: number): Promise<AdminShippingModel | null> {
		try {
			console.log(`AdminShippingService: Obteniendo detalles de orden ${id}`);

			// Usar la ruta de detalles de orden de administrador
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ADMIN.ORDER_DETAIL(id)
			);

			if (!response || !response.data) {
				throw new Error("No se pudo obtener los detalles de la orden");
			}

			// Convertir la orden en un objeto de envío
			return this.mapOrderToShipping(response.data);
		} catch (error) {
			console.error(
				`AdminShippingService: Error al obtener detalles de orden ${id}:`,
				error
			);
			return null;
		}
	}

	/**
	 * Obtiene el historial de un envío
	 */
	async getShippingHistory(
		trackingNumber: string
	): Promise<AdminTrackingEvent[]> {
		try {
			console.log(
				`AdminShippingService: Obteniendo historial de envío ${trackingNumber}`
			);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.SHIPPING.HISTORY(trackingNumber)
			);

			if (!response || !response.data) {
				return [];
			}

			// Mapear los eventos del historial
			const events = Array.isArray(response.data)
				? response.data.map((item: any, index: number) => ({
						id: item.id || index + 1,
						status: item.status || "",
						location:
							typeof item.location === "object"
								? item.location.address || ""
								: item.location || "",
						timestamp: item.timestamp || "",
						description: item.details || item.description || "",
					}))
				: [];

			return events;
		} catch (error) {
			console.error(
				`AdminShippingService: Error al obtener historial de envío ${trackingNumber}:`,
				error
			);
			return [];
		}
	}

	/**
	 * Actualiza el estado de un envío
	 */
	async updateShippingStatus(
		orderId: number,
		status: string
	): Promise<boolean> {
		try {
			console.log(
				`AdminShippingService: Actualizando estado de orden ${orderId} a ${status}`
			);

			// Usar el endpoint de administrador para actualizar estado
			const response = await ApiClient.put<any>(
				API_ENDPOINTS.ADMIN.UPDATE_ORDER_STATUS(orderId),
				{status}
			);

			return !!(
				response &&
				(response.success === true || response.status === "success")
			);
		} catch (error) {
			console.error(
				`AdminShippingService: Error al actualizar estado de orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Avanza al siguiente estado de un envío
	 */
	async advanceShippingStatus(
		orderId: number,
		currentStatus: string
	): Promise<boolean> {
		try {
			console.log(`AdminShippingService: Avanzando estado de orden ${orderId}`);

			// Determinar el siguiente estado basado en el actual
			const nextStatus = this.getNextStatus(currentStatus);

			// Actualizar el estado de la orden usando el endpoint de administrador
			const response = await ApiClient.put<any>(
				API_ENDPOINTS.ADMIN.UPDATE_ORDER_STATUS(orderId),
				{status: nextStatus}
			);

			return !!(
				response &&
				(response.success === true || response.status === "success")
			);
		} catch (error) {
			console.error(
				`AdminShippingService: Error al avanzar estado de orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Envía una notificación de seguimiento al cliente
	 * Este método podría mantenerse usando un endpoint más genérico
	 */
	async sendTrackingNotification(orderId: number): Promise<boolean> {
		try {
			console.log(
				`AdminShippingService: Enviando notificación para orden ${orderId}`
			);

			// Aquí podríamos usar el endpoint general de notificaciones si existe
			// Por ahora simulamos una respuesta exitosa
			return true;
		} catch (error) {
			console.error(
				`AdminShippingService: Error al enviar notificación ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Convierte una orden en un modelo de envío
	 */
	private mapOrderToShipping(order: any): AdminShippingModel {
		// Extraer información de envío desde shipping_data
		const shippingData = order.shipping_data || {};

		// Determinar el estado de envío basado en el estado de la orden
		let shippingStatus = "pending";
		if (order.status === "shipped" || order.status === "in_transit") {
			shippingStatus = "in_transit";
		} else if (order.status === "delivered") {
			shippingStatus = "delivered";
		} else if (order.status === "cancelled") {
			shippingStatus = "cancelled";
		} else if (order.status === "completed") {
			shippingStatus = "delivered";
		}

		// Crear un objeto de envío a partir de los datos de la orden
		return {
			id: order.id || 0,
			trackingNumber: shippingData.tracking_number || `ORD-${order.id || 0}`,
			orderId: order.id || 0,
			orderNumber: order.order_number || `ORD-${order.id || 0}`,
			userId: order.user_id || 0,
			customerName: order.user_name || "Cliente",
			status: shippingStatus,
			carrier: shippingData.shipping_company || "Transportista por defecto",
			estimatedDeliveryDate: shippingData.estimated_delivery,
			shippedDate: order.status === "shipped" ? order.updated_at : undefined,
			deliveredDate:
				order.status === "delivered" ? order.updated_at : undefined,
			address: {
				street: shippingData.address || "",
				city: shippingData.city || "",
				state: shippingData.state || "",
				country: shippingData.country || "",
				postalCode: shippingData.postal_code || "",
				phone: shippingData.phone || "",
			},
			weight: shippingData.weight || 0,
			dimensions: shippingData.dimensions || "",
			trackingHistory: [], // Se llena después si es necesario
			createdAt: order.created_at || new Date().toISOString(),
			updatedAt: order.updated_at || new Date().toISOString(),
		};
	}

	/**
	 * Determina el siguiente estado basado en el estado actual
	 */
	private getNextStatus(currentStatus: string): string {
		const statusFlow: Record<string, string> = {
			pending: "processing",
			processing: "shipped",
			shipped: "in_transit",
			in_transit: "delivered",
			delivered: "completed",
		};

		return statusFlow[currentStatus] || "processing";
	}
	private mapShippingToModel(shipping: any): AdminShippingModel {
		return {
			id: shipping.id || 0,
			trackingNumber: shipping.tracking_number || "",
			orderId: shipping.order_id || 0,
			orderNumber:
				shipping.order?.order_number || `ORD-${shipping.order_id || 0}`,
			userId: shipping.user_id || 0,
			customerName: shipping.user_name || "Cliente",
			status: shipping.status || "pending",
			carrier: shipping.carrier_name || "Transportista por defecto",
			estimatedDeliveryDate: shipping.estimated_delivery,
			shippedDate: shipping.shipped_date,
			deliveredDate: shipping.delivered_at,
			address: this.extractAddressFromShipping(shipping),
			weight: shipping.weight || 0,
			dimensions: shipping.dimensions || "",
			trackingHistory: shipping.history || [],
			createdAt: shipping.created_at || new Date().toISOString(),
			updatedAt: shipping.updated_at || new Date().toISOString(),
		};
	}
	private extractAddressFromShipping(shipping: any): any {
		const address = {
			street: "",
			city: "",
			state: "",
			country: "",
			postalCode: "",
			phone: "",
		};

		// Extraer dirección de current_location si existe
		if (shipping.current_location) {
			const location =
				typeof shipping.current_location === "string"
					? JSON.parse(shipping.current_location)
					: shipping.current_location;

			if (location.address) {
				address.street = location.address;
			}
		}

		// Extraer datos adicionales de shipping_data de la orden si existe
		if (shipping.order && shipping.order.shipping_data) {
			const shippingData =
				typeof shipping.order.shipping_data === "string"
					? JSON.parse(shipping.order.shipping_data)
					: shipping.order.shipping_data;

			if (shippingData) {
				address.city = shippingData.city || "";
				address.state = shippingData.state || "";
				address.country = shippingData.country || "";
				address.postalCode = shippingData.postal_code || "";
				address.phone = shippingData.phone || "";
			}
		}

		return address;
	}
}

export default AdminShippingService;
