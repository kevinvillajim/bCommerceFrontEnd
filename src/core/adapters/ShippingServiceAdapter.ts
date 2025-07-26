// src/core/adapters/ShippingServiceAdapter.ts
import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

// Interfaces para shipping
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
	status: "pending" | "ready_to_ship" | "shipped" | "in_transit" | "delivered" | "failed" | "returned";
	trackingNumber?: string;
	carrier?: string;
	estimatedDelivery?: string;
	lastUpdate?: string;
	shippingAddress?: string;
	shippingMethod?: string;
	weight?: number;
	shippingCost?: number;
}

export interface ShippingHistoryItem {
	date: string;
	status: string;
	description: string;
	location?: string;
}

export interface ShippingRouteItem {
	date: string;
	location: string;
	status: string;
}

export interface ShippingListResponse {
	items: ShippingItem[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

/**
 * Adaptador de servicio para gestión de envíos de vendedores
 * Simplificado para trabajar con endpoints de Laravel existentes
 */
export default class ShippingServiceAdapter {
	/**
	 * Obtiene la lista de envíos para el vendedor (basado en sus órdenes)
	 * Simplificado para que funcione directamente
	 */
	async getShippingsList(filters: any = {}): Promise<ShippingListResponse> {
		try {
			console.log("ShippingServiceAdapter: Obteniendo órdenes del vendedor", filters);

			// Obtener órdenes del vendedor directamente
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				filters
			);

			console.log("ShippingServiceAdapter: Respuesta de órdenes:", response);

			// Verificar respuesta
			if (!response) {
				throw new Error("Respuesta vacía del servidor");
			}

			// Manejar diferentes formatos de respuesta
			let orders = [];
			let pagination = {
				currentPage: 1,
				totalPages: 1,
				totalItems: 0,
				itemsPerPage: 10,
			};

			if (response.success && response.data) {
				orders = Array.isArray(response.data) ? response.data : [];
				pagination = response.pagination || pagination;
			} else if (response.data && Array.isArray(response.data)) {
				orders = response.data;
				pagination = response.meta || response.pagination || pagination;
			} else if (Array.isArray(response)) {
				orders = response;
			}

			// Convertir todas las órdenes a items de envío
			const items: ShippingItem[] = orders.map((order: any) => this.mapOrderToShippingItem(order));

			return {
				items,
				pagination: {
					currentPage: Number(pagination.currentPage) || Number(pagination.current_page) || 1,
					totalPages: Number(pagination.totalPages) || Number(pagination.last_page) || 1,
					totalItems: Number(pagination.totalItems) || Number(pagination.total) || items.length,
					itemsPerPage: Number(pagination.itemsPerPage) || Number(pagination.per_page) || 10,
				},
			};
		} catch (error) {
			console.error("ShippingServiceAdapter: Error al obtener órdenes:", error);
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
	 * Obtiene los detalles de un envío específico - SIMPLIFICADO
	 */
	async getShippingDetails(orderIdOrShippingId: string): Promise<ShippingItem | null> {
		try {
			console.log(`ShippingServiceAdapter: Obteniendo detalles de la orden ${orderIdOrShippingId}`);

			// Obtener detalles de la orden directamente
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDER_DETAILS(Number(orderIdOrShippingId))
			);

			console.log("ShippingServiceAdapter: Respuesta de detalles:", response);

			if (!response) {
				throw new Error("No se encontraron detalles de la orden");
			}

			// Manejar diferentes formatos de respuesta
			let orderData;
			if (response.success && response.data) {
				orderData = response.data;
			} else if (response.data) {
				orderData = response.data;
			} else {
				orderData = response;
			}

			if (!orderData) {
				throw new Error("Datos de orden vacíos");
			}

			// Convertir a shipping item
			return this.mapOrderToShippingItem(orderData);
		} catch (error) {
			console.error(`ShippingServiceAdapter: Error al obtener detalles de la orden ${orderIdOrShippingId}:`, error);
			return null;
		}
	}

	/**
	 * Actualiza el estado de un envío - SIMPLIFICADO
	 */
	async updateShippingStatus(orderIdOrShippingId: string, newStatus: ShippingItem["status"]): Promise<boolean> {
		try {
			console.log(`ShippingServiceAdapter: Actualizando estado de la orden ${orderIdOrShippingId} a ${newStatus}`);

			// Intentar actualizar usando el endpoint de shipping
			const response = await ApiClient.post<any>(
				API_ENDPOINTS.SHIPPING.UPDATE_STATUS,
				{
					shipping_id: orderIdOrShippingId,
					status: newStatus,
				}
			);

			console.log("ShippingServiceAdapter: Respuesta de actualización:", response);
			
			// Verificar diferentes formatos de respuesta exitosa
			const isSuccess = response && (
				response.status === "success" || 
				response.success === true ||
				response.message?.includes("success")
			);

			return isSuccess;
		} catch (error) {
			console.error(`ShippingServiceAdapter: Error al actualizar estado:`, error);
			
			// Si falla, intentar con el endpoint de orden
			try {
				console.log("Intentando actualizar vía endpoint de orden...");
				const response = await ApiClient.patch<any>(
					API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(Number(orderIdOrShippingId)),
					{
						status: newStatus,
					}
				);

				console.log("Respuesta vía orden:", response);
				return response && (response.status === "success" || response.success === true);
			} catch (secondError) {
				console.error("También falló el segundo intento:", secondError);
				return false;
			}
		}
	}

	/**
	 * Marca un pedido como enviado con información de seguimiento
	 */
	async markAsShipped(orderId: string, shippingData: {
		tracking_number: string;
		shipping_company: string;
		estimated_delivery?: string;
		notes?: string;
	}): Promise<boolean> {
		try {
			console.log(`ShippingServiceAdapter: Marcando orden ${orderId} como enviada`, shippingData);

			// Usar el endpoint de actualización de información de envío
			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(Number(orderId)),
				shippingData
			);

			console.log("ShippingServiceAdapter: Respuesta al marcar como enviado:", response);

			return response && response.success === true;
		} catch (error) {
			console.error(`ShippingServiceAdapter: Error al marcar orden ${orderId} como enviada:`, error);
			return false;
		}
	}

	/**
	 * Obtiene el historial de un envío por número de seguimiento
	 */
	async getShippingHistory(trackingNumber: string): Promise<ShippingHistoryItem[]> {
		try {
			console.log(`ShippingServiceAdapter: Obteniendo historial para ${trackingNumber}`);

			// Usar el endpoint de historial de envío
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.SHIPPING.HISTORY(trackingNumber)
			);

			console.log("ShippingServiceAdapter: Respuesta de historial:", response);

			if (!response || !response.data || !response.data.history) {
				return [];
			}

			// Mapear el historial al formato esperado
			return Array.isArray(response.data.history) 
				? response.data.history.map((item: any) => ({
					date: item.timestamp || item.date || new Date().toISOString(),
					status: item.status || "unknown",
					description: item.description || item.details || `Estado: ${item.status}`,
					location: item.location?.address || item.location || undefined,
				}))
				: [];
		} catch (error) {
			console.error(`ShippingServiceAdapter: Error al obtener historial para ${trackingNumber}:`, error);
			return [];
		}
	}

	/**
	 * Obtiene la ruta de un envío por número de seguimiento
	 */
	async getShippingRoute(trackingNumber: string): Promise<ShippingRouteItem[]> {
		try {
			console.log(`ShippingServiceAdapter: Obteniendo ruta para ${trackingNumber}`);

			// Usar el endpoint de ruta de envío
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.SHIPPING.ROUTE(trackingNumber)
			);

			console.log("ShippingServiceAdapter: Respuesta de ruta:", response);

			if (!response || !response.data || !response.data.route_points) {
				return [];
			}

			// Mapear los puntos de ruta al formato esperado
			return Array.isArray(response.data.route_points)
				? response.data.route_points.map((item: any) => ({
					date: item.timestamp || item.date || new Date().toISOString(),
					location: item.address || item.location || "Ubicación desconocida",
					status: item.status || "unknown",
				}))
				: [];
		} catch (error) {
			console.error(`ShippingServiceAdapter: Error al obtener ruta para ${trackingNumber}:`, error);
			return [];
		}
	}

	/**
	 * Mapea una orden del API al formato de ShippingItem para la UI
	 * Simplificado para que funcione con cualquier estructura de datos
	 */
	private mapOrderToShippingItem(apiOrder: any): ShippingItem {
		// Manejar caso donde el objeto es null o undefined
		if (!apiOrder) {
			return this.getDefaultShippingItem();
		}

		console.log("Mapeando orden a shipping item:", apiOrder);

		// Extraer información del cliente de diferentes posibles ubicaciones
		const customer = apiOrder.user || apiOrder.customer || {};
		
		// Extraer dirección de envío
		let shippingAddress = "";
		if (apiOrder.shipping_data) {
			if (typeof apiOrder.shipping_data === 'string') {
				try {
					const parsed = JSON.parse(apiOrder.shipping_data);
					shippingAddress = [parsed.address, parsed.city, parsed.state, parsed.country]
						.filter(Boolean)
						.join(', ');
				} catch (e) {
					shippingAddress = apiOrder.shipping_data;
				}
			} else if (typeof apiOrder.shipping_data === 'object') {
				shippingAddress = [
					apiOrder.shipping_data.address, 
					apiOrder.shipping_data.city, 
					apiOrder.shipping_data.state, 
					apiOrder.shipping_data.country
				].filter(Boolean).join(', ');
			}
		}

		// Determinar estado del envío de forma simple
		let shippingStatus: ShippingItem["status"] = "pending";
		
		// Mapear estados de orden a estados de envío
		switch (apiOrder.status) {
			case "shipped":
				shippingStatus = "shipped";
				break;
			case "delivered":
				shippingStatus = "delivered";
				break;
			case "processing":
				shippingStatus = "ready_to_ship";
				break;
			case "in_transit":
				shippingStatus = "in_transit";
				break;
			default:
				shippingStatus = "pending";
		}

		// Si hay shipping_status específico, usarlo
		if (apiOrder.shipping_status) {
			shippingStatus = this.mapStatusFromAPI(apiOrder.shipping_status);
		}

		return {
			id: String(apiOrder.id || 0),
			orderId: String(apiOrder.id || 0),
			orderNumber: apiOrder.order_number || apiOrder.orderNumber || `#${apiOrder.id || 0}`,
			date: apiOrder.created_at || apiOrder.date || new Date().toISOString(),
			customer: {
				id: customer.id || 0,
				name: customer.name || "Cliente",
				email: customer.email || "sin@email.com",
				phone: customer.phone || apiOrder.phone,
			},
			status: shippingStatus,
			trackingNumber: apiOrder.tracking_number || undefined,
			carrier: apiOrder.shipping_company || apiOrder.carrier || undefined,
			estimatedDelivery: apiOrder.estimated_delivery || undefined,
			lastUpdate: apiOrder.updated_at || new Date().toISOString(),
			shippingAddress: shippingAddress || "Dirección no disponible",
			shippingMethod: "Estándar",
			weight: undefined,
			shippingCost: undefined,
		};
	}

	/**
	 * Mapea un objeto de envío del API al formato de la UI
	 */
	private mapShippingFromAPI(apiShipping: any): ShippingItem {
		// Manejar caso donde el objeto es null o undefined
		if (!apiShipping) {
			return this.getDefaultShippingItem();
		}

		// Extraer información del cliente (puede venir anidado en order)
		const customer = apiShipping.order?.user || apiShipping.user || {};
		
		// Extraer dirección de envío
		const shippingData = apiShipping.order?.shipping_data || {};
		const shippingAddress = typeof shippingData === 'object' 
			? [shippingData.address, shippingData.city, shippingData.state, shippingData.country]
				.filter(Boolean)
				.join(', ')
			: shippingData || '';

		return {
			id: String(apiShipping.id || 0),
			orderId: String(apiShipping.order_id || apiShipping.orderId || 0),
			orderNumber: apiShipping.order?.order_number || apiShipping.orderNumber || `#${apiShipping.order_id || 0}`,
			date: apiShipping.created_at || apiShipping.date || new Date().toISOString(),
			customer: {
				id: customer.id || 0,
				name: customer.name || apiShipping.user_name || "Cliente",
				email: customer.email || "sin@email.com",
				phone: customer.phone || shippingData.phone,
			},
			status: this.mapStatusFromAPI(apiShipping.status),
			trackingNumber: apiShipping.tracking_number || undefined,
			carrier: apiShipping.carrier_name || apiShipping.carrier || undefined,
			estimatedDelivery: apiShipping.estimated_delivery || undefined,
			lastUpdate: apiShipping.last_updated || apiShipping.updated_at || undefined,
			shippingAddress: shippingAddress || undefined,
			shippingMethod: apiShipping.shipping_method || "Estándar",
			weight: apiShipping.weight ? Number(apiShipping.weight) : undefined,
			shippingCost: apiShipping.shipping_cost ? Number(apiShipping.shipping_cost) : undefined,
		};
	}

	/**
	 * Mapea el estado del API al formato de la UI
	 */
	private mapStatusFromAPI(apiStatus: string): ShippingItem["status"] {
		if (!apiStatus) return "pending";

		switch (apiStatus.toLowerCase()) {
			case "pending":
				return "pending";
			case "processing":
			case "ready_for_pickup":
				return "ready_to_ship";
			case "picked_up":
			case "in_transit":
			case "shipped":
				return "shipped";
			case "out_for_delivery":
				return "in_transit";
			case "delivered":
				return "delivered";
			case "exception":
			case "failed":
				return "failed";
			case "returned":
				return "returned";
			default:
				return "pending";
		}
	}

	/**
	 * Retorna un item de envío por defecto
	 */
	private getDefaultShippingItem(): ShippingItem {
		return {
			id: "0",
			orderId: "0",
			orderNumber: "#0",
			date: new Date().toISOString(),
			customer: {
				id: 0,
				name: "Cliente",
				email: "sin@email.com",
			},
			status: "pending",
		};
	}
}