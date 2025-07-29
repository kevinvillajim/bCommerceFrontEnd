// src/core/adapters/ShippingServiceAdapter.ts - CORREGIDO COMPLETO
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
 * Actualizado para usar datos combinados de Orders y Shippings
 */
export default class ShippingServiceAdapter {
	/**
	 * Obtiene la lista de envíos para el vendedor (usando datos combinados de Orders y Shippings)
	 * Actualizado para usar el endpoint específico de shipping
	 */
	async getShippingsList(filters: any = {}): Promise<ShippingListResponse> {
		try {
			console.log("ShippingServiceAdapter: Obteniendo envíos del vendedor", filters);

			// ✅ USAR EL ENDPOINT DE SHIPPING CORRECTO según tus rutas
			const response = await ApiClient.get<any>(
				'/shipping', // Ruta real según tu archivo de rutas
				filters
			);

			console.log("ShippingServiceAdapter: Respuesta de envíos:", response);

			if (!response) {
				throw new Error("Respuesta vacía del servidor");
			}

			// Manejar la respuesta del endpoint de shipping
			let shippings = [];
			let pagination = {
				currentPage: 1,
				totalPages: 1,
				totalItems: 0,
				itemsPerPage: 10,
			};

			if (response.success && response.data) {
				shippings = Array.isArray(response.data) ? response.data : [];
				pagination = response.pagination || pagination;
			} else if (response.data && Array.isArray(response.data)) {
				shippings = response.data;
				pagination = response.meta || response.pagination || pagination;
			} else if (Array.isArray(response)) {
				shippings = response;
			}

			// ✅ MAPEAR DIRECTAMENTE LOS DATOS DE SHIPPING (ya vienen combinados del backend)
			const items: ShippingItem[] = shippings.map((shipping: any) => this.mapShippingToItem(shipping));

			return {
				items,
				pagination: {
					currentPage: Number(pagination.currentPage) || Number((pagination as any).current_page) || 1,
					totalPages: Number(pagination.totalPages) || Number((pagination as any).last_page) || 1,
					totalItems: Number(pagination.totalItems) || Number((pagination as any).total) || items.length,
					itemsPerPage: Number(pagination.itemsPerPage) || Number((pagination as any).per_page) || 10,
				},
			};
		} catch (error) {
			console.error("ShippingServiceAdapter: Error al obtener envíos:", error);
			
			// ✅ FALLBACK: Si falla el endpoint de shipping, usar el de orders como respaldo
			console.log("Intentando con endpoint de orders como fallback...");
			return this.getShippingsListFromOrders(filters);
		}
	}

	/**
	 * ✅ NUEVO: Mapear datos de shipping (que ya incluyen datos de order) a ShippingItem
	 */
	private mapShippingToItem(shippingData: any): ShippingItem {
		console.log("Mapeando datos de shipping:", shippingData);

		// Los datos ya vienen del backend con información combinada
		return {
			id: String(shippingData.id || 0),
			orderId: String(shippingData.order_id || 0),
			orderNumber: shippingData.order_number || shippingData.order?.order_number || `#${shippingData.order_id || 0}`,
			date: shippingData.created_at || new Date().toISOString(),
			customer: {
				id: shippingData.user_id || shippingData.order?.user_id || 0,
				name: shippingData.user_name || shippingData.order?.user?.name || "Cliente",
				email: shippingData.order?.user?.email || "sin@email.com",
				phone: shippingData.order?.user?.phone,
			},
			// ✅ USAR DATOS REALES DE SHIPPING
			status: this.mapStatusFromAPI(shippingData.status || "pending"),
			trackingNumber: shippingData.tracking_number || undefined,
			carrier: shippingData.carrier_name || undefined,
			estimatedDelivery: shippingData.estimated_delivery || undefined,
			lastUpdate: shippingData.updated_at || shippingData.last_updated || new Date().toISOString(),
			shippingAddress: shippingData.shipping_address || this.extractShippingAddress(shippingData),
			shippingMethod: "Estándar",
			weight: shippingData.weight || undefined,
			shippingCost: undefined, // Puedes obtenerlo de order si está disponible
		};
	}

	/**
	 * ✅ FALLBACK: Método original como respaldo usando órdenes
	 */
	private async getShippingsListFromOrders(filters: any = {}): Promise<ShippingListResponse> {
		try {
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				filters
			);

			console.log("ShippingServiceAdapter: Respuesta de órdenes (fallback):", response);

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

			const items: ShippingItem[] = orders.map((order: any) => this.mapOrderToShippingItem(order));

			return {
				items,
				pagination: {
					currentPage: Number(pagination.currentPage) || Number((pagination as any).current_page) || 1,
					totalPages: Number(pagination.totalPages) || Number((pagination as any).last_page) || 1,
					totalItems: Number(pagination.totalItems) || Number((pagination as any).total) || items.length,
					itemsPerPage: Number(pagination.itemsPerPage) || Number((pagination as any).per_page) || 10,
				},
			};
		} catch (error) {
			console.error("ShippingServiceAdapter: Error en fallback:", error);
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
	 * ✅ HELPER: Extraer dirección de shipping de los datos
	 */
	private extractShippingAddress(shippingData: any): string {
		// Si ya viene formateada desde el backend
		if (shippingData.shipping_address) {
			return shippingData.shipping_address;
		}

		// Si viene en order.shipping_data
		if (shippingData.order?.shipping_data) {
			const shippingInfo = typeof shippingData.order.shipping_data === 'string' 
				? JSON.parse(shippingData.order.shipping_data) 
				: shippingData.order.shipping_data;
			
			return [
				shippingInfo.address,
				shippingInfo.city,
				shippingInfo.state,
				shippingInfo.country
			].filter(Boolean).join(', ');
		}

		return "Dirección no disponible";
	}

	/**
	 * Obtiene los detalles de un envío específico - CORREGIDO
	 */
	async getShippingDetails(shippingId: string): Promise<ShippingItem | null> {
		try {
			console.log(`ShippingServiceAdapter: Obteniendo detalles del envío ${shippingId}`);

			// ✅ USAR LA RUTA CORRECTA según tu archivo de rutas
			const response = await ApiClient.get<any>(
				`/shipping/${shippingId}`
			);

			console.log("ShippingServiceAdapter: Respuesta de detalles:", response);

			if (!response) {
				throw new Error("No se encontraron detalles del envío");
			}

			// Manejar diferentes formatos de respuesta
			let shippingData;
			if (response.success && response.data) {
				shippingData = response.data;
			} else if (response.data) {
				shippingData = response.data;
			} else {
				shippingData = response;
			}

			if (!shippingData) {
				throw new Error("Datos de envío vacíos");
			}

			// ✅ USAR EL MAPEO CORRECTO PARA DATOS DE SHIPPING
			return this.mapShippingToItem(shippingData);
		} catch (error) {
			console.error(`ShippingServiceAdapter: Error al obtener detalles del envío ${shippingId}:`, error);
			return null;
		}
	}

	/**
	 * Actualiza el estado de un envío - CORREGIDO
	 */
	async updateShippingStatus(shippingId: string, newStatus: ShippingItem["status"]): Promise<boolean> {
		try {
			console.log(`ShippingServiceAdapter: Actualizando estado del envío ${shippingId} a ${newStatus}`);

			// ✅ USAR LA RUTA CORRECTA según tu archivo de rutas
			const response = await ApiClient.patch<any>(
				`/shipping/${shippingId}/status`,
				{
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
			return false;
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

			// ✅ USAR LA RUTA CORRECTA según tu archivo de rutas
			const response = await ApiClient.get<any>(
				`/shipping/${trackingNumber}/history`
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

			// ✅ USAR LA RUTA CORRECTA según tu archivo de rutas
			const response = await ApiClient.get<any>(
				`/shipping/${trackingNumber}/route`
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
			case "failed":
				shippingStatus = "failed";
				break;
			case "returned":
				shippingStatus = "returned";
				break;
			case "cancelled":
				shippingStatus = "failed"; // Cancelado se muestra como fallido en shipping
				break;
			case "completed":
				shippingStatus = "delivered"; // Completado se muestra como entregado
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
	 * Mapea el estado del API al formato de la UI
	 */
	private mapStatusFromAPI(apiStatus: string): ShippingItem["status"] {
		if (!apiStatus) return "pending";

		switch (apiStatus.toLowerCase()) {
			case "pending":
				return "pending";
			case "processing":
			case "ready_for_pickup":
			case "ready_to_ship":
				return "ready_to_ship";
			case "picked_up":
			case "shipped":
				return "shipped";
			case "in_transit":
			case "out_for_delivery":
				return "in_transit";
			case "delivered":
			case "completed":
				return "delivered";
			case "exception":
			case "failed":
			case "cancelled":
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