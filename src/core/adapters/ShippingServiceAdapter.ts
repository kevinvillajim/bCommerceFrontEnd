// src/core/adapters/ShippingServiceAdapter.ts
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {ShippingFormData} from "../../presentation/components/shipping/ShippingFormModal";

// Definición de interfaces para los datos de envío
export interface ShippingItem {
	id: string;
	orderId: string;
	orderNumber: string;
	date: string;
	customer: {
		id: number;
		name: string;
		email: string;
		phone?: string;
	};
	trackingNumber?: string;
	status:
		| "pending"
		| "ready_to_ship"
		| "in_transit"
		| "shipped" // Añadido para coincidir con la DB
		| "delivered"
		| "failed"
		| "returned";
	carrier?: string;
	estimatedDelivery?: string;
	shippingAddress: string;
	shippingMethod?: string;
	weight?: number;
	shippingCost?: number;
	lastUpdate?: string;
	history?: ShippingHistoryItem[];
}

export interface ShippingHistoryItem {
	date: string;
	status: string;
	location?: string;
	description: string;
}

export interface ShippingRouteItem {
	date: string;
	location: string;
	coordinates?: {
		lat: number;
		lng: number;
	};
	status: string;
}

// Adaptador de servicio para gestionar operaciones de envío
export default class ShippingServiceAdapter {
	/**
	 * Obtiene la lista de envíos del vendedor
	 * @param filters Filtros opcionales para la búsqueda
	 * @returns Lista de envíos y metadatos de paginación
	 */
	async getShippingsList(filters?: {
		status?: string;
		carrier?: string;
		dateFrom?: string;
		dateTo?: string;
		search?: string;
		page?: number;
		limit?: number;
	}): Promise<{
		items: ShippingItem[];
		pagination: {
			currentPage: number;
			totalPages: number;
			totalItems: number;
			itemsPerPage: number;
		};
	}> {
		try {
			console.log(
				"ShippingServiceAdapter: Obteniendo lista de envíos con filtros:",
				filters
			);

			// *** CAMBIO PRINCIPAL: Usamos el endpoint de órdenes general en lugar del específico de awaiting-shipment
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				filters
			);

			console.log("ShippingServiceAdapter: Respuesta de API:", response);

			// Verificar la estructura de la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta de API inválida");
			}

			// Mapear los datos a formato ShippingItem
			const shippingItems: ShippingItem[] = Array.isArray(response.data)
				? response.data.map((item: any) => this.mapOrderToShippingItem(item))
				: [];

			// Extraer metadatos de paginación
			const pagination = response.pagination || {
				currentPage: 1,
				totalPages: 1,
				totalItems: shippingItems.length,
				itemsPerPage: 10,
			};

			return {
				items: shippingItems,
				pagination: {
					currentPage: Number(pagination.currentPage) || 1,
					totalPages: Number(pagination.totalPages) || 1,
					totalItems: Number(pagination.totalItems) || shippingItems.length,
					itemsPerPage: Number(pagination.itemsPerPage) || 10,
				},
			};
		} catch (error) {
			console.error(
				"ShippingServiceAdapter: Error al obtener lista de envíos:",
				error
			);
			// En caso de error, devolver una lista vacía
			return {
				items: [],
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
	 * @param id ID del envío o de la orden
	 * @returns Detalles completos del envío
	 */
	async getShippingDetails(id: string): Promise<ShippingItem | null> {
		try {
			console.log(
				`ShippingServiceAdapter: Obteniendo detalles del envío ${id}`
			);

			// Obtener detalles de la orden, que incluye información de envío
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.DETAILS(Number(id))
			);

			console.log(
				`ShippingServiceAdapter: Respuesta para envío ${id}:`,
				response
			);

			if (!response || !response.data) {
				throw new Error("Respuesta de API inválida");
			}

			// Mapear los datos de la orden a un objeto ShippingItem
			const shippingItem = this.mapOrderToShippingItem(response.data);

			// Si tiene número de seguimiento, obtener también el historial
			if (shippingItem.trackingNumber) {
				try {
					const history = await this.getShippingHistory(
						shippingItem.trackingNumber
					);
					shippingItem.history = history;
				} catch (historyError) {
					console.warn("No se pudo obtener historial de envío:", historyError);
					// No establecemos error para no interrumpir la visualización de los detalles
				}
			}

			return shippingItem;
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al obtener detalles del envío ${id}:`,
				error
			);
			return null;
		}
	}

	/**
	 * Obtiene el historial de un envío por su número de seguimiento
	 * @param trackingNumber Número de seguimiento
	 * @returns Lista de eventos en el historial
	 */
	async getShippingHistory(
		trackingNumber: string
	): Promise<ShippingHistoryItem[]> {
		try {
			console.log(
				`ShippingServiceAdapter: Obteniendo historial para ${trackingNumber}`
			);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.SHIPPING.HISTORY(trackingNumber)
			);

			console.log(
				`ShippingServiceAdapter: Historial para ${trackingNumber}:`,
				response
			);

			if (!response || !response.data) {
				return [];
			}

			// Mapear el historial al formato esperado
			return Array.isArray(response.data)
				? response.data.map((item: any) => ({
						date: item.date || item.timestamp || new Date().toISOString(),
						status: item.status || "unknown",
						location: item.location || undefined,
						description: item.description || item.message || "Sin descripción",
					}))
				: [];
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al obtener historial de ${trackingNumber}:`,
				error
			);
			return [];
		}
	}

	/**
	 * Obtiene la ruta de un envío por su número de seguimiento
	 * @param trackingNumber Número de seguimiento
	 * @returns Lista de puntos en la ruta con coordenadas
	 */
	async getShippingRoute(trackingNumber: string): Promise<ShippingRouteItem[]> {
		try {
			console.log(
				`ShippingServiceAdapter: Obteniendo ruta para ${trackingNumber}`
			);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.SHIPPING.ROUTE(trackingNumber)
			);

			console.log(
				`ShippingServiceAdapter: Ruta para ${trackingNumber}:`,
				response
			);

			if (!response || !response.data) {
				return [];
			}

			// Mapear los datos de ruta al formato esperado
			return Array.isArray(response.data)
				? response.data.map((item: any) => ({
						date: item.date || item.timestamp || new Date().toISOString(),
						location: item.location || "Desconocido",
						coordinates: item.coordinates || undefined,
						status: item.status || "unknown",
					}))
				: [];
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al obtener ruta de ${trackingNumber}:`,
				error
			);
			return [];
		}
	}

	/**
	 * Asigna un número de seguimiento a una orden
	 * @param orderId ID de la orden
	 * @param trackingData Datos de seguimiento (número, transportista)
	 * @returns true si se asignó correctamente
	 */
	async assignTrackingNumber(
		orderId: string,
		trackingData: {
			tracking_number: string;
			shipping_company?: string;
			estimated_delivery?: string;
			notes?: string;
		}
	): Promise<boolean> {
		try {
			console.log(
				`ShippingServiceAdapter: Asignando tracking a orden ${orderId}:`,
				trackingData
			);

			// Asignar el número de seguimiento es una actualización de la información de envío
			// Enviamos la información de tracking dentro del objeto shipping_data
			const shippingDataUpdate = {
				tracking_number: trackingData.tracking_number,
				shipping_company: trackingData.shipping_company,
				estimated_delivery: trackingData.estimated_delivery,
				notes: trackingData.notes,
			};

			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(Number(orderId)),
				shippingDataUpdate
			);

			console.log(
				`ShippingServiceAdapter: Respuesta al asignar tracking:`,
				response
			);

			// Verificar el éxito de la operación
			return (
				response && (response.success === true || response.status === "success")
			);
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al asignar tracking a orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Actualiza el estado de un envío
	 * @param orderId ID de la orden
	 * @param status Nuevo estado
	 * @returns true si se actualizó correctamente
	 */
	async updateShippingStatus(
		orderId: string,
		status: ShippingItem["status"]
	): Promise<boolean> {
		try {
			console.log(
				`ShippingServiceAdapter: Actualizando estado de envío ${orderId} a ${status}`
			);

			// Mapear el estado de envío al estado correspondiente de la orden
			const orderStatus = this.mapShippingStatusToOrderStatus(status);

			// Actualizar el estado de la orden
			const response = await ApiClient.put<any>(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(Number(orderId)),
				{
					status: orderStatus,
				}
			);

			console.log(
				`ShippingServiceAdapter: Respuesta de actualización:`,
				response
			);

			// Verificar el éxito de la operación
			return (
				response && (response.success === true || response.status === "success")
			);
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al actualizar estado de envío ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Marca una orden como enviada y actualiza la información de envío
	 * @param orderId ID de la orden
	 * @param shippingData Datos de envío (tracking, transportista, etc.)
	 * @returns true si se actualizó correctamente
	 */
	async markAsShipped(
		orderId: string,
		shippingData: ShippingFormData
	): Promise<boolean> {
		try {
			console.log(
				`ShippingServiceAdapter: Marcando orden ${orderId} como enviada:`,
				shippingData
			);

			// Enviar los datos directamente sin encapsularlos en shipping_data
			const shippingDataUpdate = {
				tracking_number: shippingData.tracking_number,
				shipping_company: shippingData.shipping_company,
				estimated_delivery: shippingData.estimated_delivery,
				notes: shippingData.notes,
			};

			// Actualizamos la información de envío
			const shippingResponse = await ApiClient.patch<any>(
				API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(Number(orderId)),
				shippingDataUpdate
			);

			console.log(
				`ShippingServiceAdapter: Respuesta al actualizar envío:`,
				shippingResponse
			);

			if (
				!shippingResponse ||
				(shippingResponse.success !== true &&
					shippingResponse.status !== "success")
			) {
				throw new Error("Error al actualizar información de envío");
			}

			// Después actualizamos el estado de la orden a "shipped"
			const statusResponse = await ApiClient.put<any>(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(Number(orderId)),
				{
					status: "shipped",
				}
			);

			console.log(
				`ShippingServiceAdapter: Respuesta al actualizar estado:`,
				statusResponse
			);

			// Verificar el éxito de la operación
			return (
				statusResponse &&
				(statusResponse.success === true || statusResponse.status === "success")
			);
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al marcar orden ${orderId} como enviada:`,
				error
			);
			return false;
		}
	}

	/**
	 * Mapea un objeto de orden a un objeto de envío
	 * @param order Datos de la orden
	 * @returns Objeto ShippingItem
	 */
	private mapOrderToShippingItem(order: any): ShippingItem {
		// Extraer la dirección de envío solo desde shipping_data
		let shippingAddress = "";
		if (order.shipping_data || order.shippingData) {
			// Acceder al objeto shipping_data (ambas formas para compatibilidad)
			const shippingData = order.shipping_data || order.shippingData;

			// Extraer los campos de dirección del objeto
			const parts = [
				shippingData.address,
				shippingData.city,
				shippingData.state,
				shippingData.country,
				shippingData.postal_code || shippingData.postalCode,
			].filter(Boolean);

			shippingAddress = parts.join(", ");
		} else if (typeof order.shippingAddress === "string") {
			// Fallback por si viene como string completo
			shippingAddress = order.shippingAddress;
		}

		// Determinar el estado del envío
		let shippingStatus: ShippingItem["status"] = "pending";
		const shippingData = order.shipping_data || order.shippingData;

		// Buscar primero en shipping.status si existe
		if (order.shipping && order.shipping.status) {
			shippingStatus = order.shipping.status;
		}
		// De lo contrario, inferir por el estado de la orden
		else if (order.status === "shipped" || order.status === "in_transit") {
			shippingStatus = "shipped"; // Ajustado para coincidir con la DB
		} else if (order.status === "delivered") {
			shippingStatus = "delivered";
		} else if (order.status === "cancelled") {
			shippingStatus = "failed";
		} else if (order.status === "completed") {
			shippingStatus = "delivered";
		} else if (order.status === "pending") {
			shippingStatus = "pending";
		} else if (order.status === "processing") {
			// Si tiene número de seguimiento, está listo para enviar; si no, sigue pendiente
			shippingStatus = shippingData?.tracking_number
				? "ready_to_ship"
				: "pending";
		}

		// Extraer datos del cliente
		const customerName =
			order.user_name || (order.customer ? order.customer.name : "Cliente");
		const customerEmail =
			order.user_email ||
			(order.customer ? order.customer.email : "email@example.com");
		const customerId =
			order.userId || order.user_id || (order.customer ? order.customer.id : 0);

		// Datos del transportista y tracking desde shipping_data o shipping
		const trackingNumber =
			shippingData?.tracking_number ||
			order.trackingNumber ||
			(order.shipping ? order.shipping.tracking_number : undefined);

		const carrier =
			shippingData?.shipping_company ||
			order.carrier ||
			(order.shipping ? order.shipping.carrier_name : undefined);

		const estimatedDelivery =
			shippingData?.estimated_delivery ||
			order.estimatedDelivery ||
			(order.shipping ? order.shipping.estimated_delivery : undefined);

		// Número de teléfono desde shipping_data
		const phone = shippingData?.phone;

		// Información de ubicación actual, extraída de shipping si existe
		const currentLocation = order.shipping?.current_location
			? typeof order.shipping.current_location === "string"
				? order.shipping.current_location
				: JSON.stringify(order.shipping.current_location)
			: undefined;

		return {
			id: String(order.id || 0),
			orderId: String(order.id || 0),
			orderNumber:
				order.orderNumber || order.order_number || `ORD-${order.id || 0}`,
			date:
				order.createdAt ||
				order.created_at ||
				order.date ||
				new Date().toISOString(),
			customer: {
				id: customerId,
				name: customerName,
				email: customerEmail,
				phone: phone, // Añadimos teléfono a los datos del cliente
			},
			trackingNumber: trackingNumber,
			status: shippingStatus,
			carrier: carrier,
			estimatedDelivery: estimatedDelivery,
			shippingAddress: shippingAddress,
			shippingMethod: order.shippingMethod || "Estándar",
			lastUpdate: order.updatedAt || order.updated_at || order.lastUpdate,
			// Mapear el historial si existe
			history: Array.isArray(order.history)
				? order.history.map((item: any) => ({
						date: item.date || new Date().toISOString(),
						status: item.status,
						location: item.location || currentLocation,
						description: item.description,
					}))
				: undefined,
		};
	}

	/**
	 * Mapea un estado de envío a un estado de orden
	 * @param shippingStatus Estado del envío
	 * @returns Estado correspondiente de la orden
	 */
	private mapShippingStatusToOrderStatus(
		shippingStatus: ShippingItem["status"]
	): string {
		switch (shippingStatus) {
			case "pending":
				return "pending";
			case "ready_to_ship":
				return "processing";
			case "in_transit":
			case "shipped": // Añadido para coincidir con la DB
				return "shipped";
			case "delivered":
				return "delivered";
			case "failed":
				return "cancelled";
			case "returned":
				return "cancelled";
			default:
				return "processing";
		}
	}
}
