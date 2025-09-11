import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Order,
	OrderDetail,
	OrderListResponse,
	OrderStatusUpdateData,
} from "../domain/entities/Order";

/**
 * Servicio para gestión de órdenes específicas del vendedor
 * Separado del OrderService general para evitar conflictos entre roles
 */
export class SellerOrderService {
	/**
	 * Obtiene las órdenes del vendedor con filtros opcionales
	 */
	async getSellerOrders(filters?: {
		status?: string;
		paymentStatus?: string;
		dateFrom?: string;
		dateTo?: string;
		search?: string;
		page?: number;
		limit?: number;
	}): Promise<OrderListResponse> {
		try {
			console.log(
				"SellerOrderService: Obteniendo órdenes del vendedor con filtros:",
				filters
			);

			// Preparar parámetros de consulta
			const params: any = {};

			if (filters) {
				if (filters.status && filters.status !== "all") {
					params.status = filters.status;
				}
				if (filters.paymentStatus && filters.paymentStatus !== "all") {
					params.payment_status = filters.paymentStatus;
				}
				if (filters.dateFrom) {
					params.date_from = filters.dateFrom;
				}
				if (filters.dateTo) {
					params.date_to = filters.dateTo;
				}
				if (filters.search) {
					params.search = filters.search;
				}
				if (filters.page) {
					params.page = filters.page;
				}
				if (filters.limit) {
					params.limit = filters.limit;
				}
			}

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				params
			);

			console.log("SellerOrderService: Respuesta de órdenes:", response);

			// Verificar la estructura de la respuesta
			if (!response) {
				throw new Error("Respuesta vacía del servidor");
			}

			// Manejar diferentes formatos de respuesta
			let orders = [];
			let pagination = {
				total: 0,
				per_page: 10,
				current_page: 1,
				last_page: 1,
			};

			if (response.success && response.data) {
				// Formato con success
				orders = Array.isArray(response.data) ? response.data : [];
				pagination = response.pagination || pagination;
			} else if (response.data && Array.isArray(response.data)) {
				// Formato directo con data
				orders = response.data;
				pagination = response.meta || response.pagination || pagination;
			} else if (Array.isArray(response)) {
				// Formato directo como array
				orders = response;
			}

			return {
				data: orders,
				meta: {
					total: pagination.total || orders.length,
					per_page: pagination.per_page || 10,
					current_page: pagination.current_page || 1,
					last_page: pagination.last_page || 1,
				},
			};
		} catch (error) {
			console.error("SellerOrderService: Error al obtener órdenes:", error);
			// Devolver objeto vacío en caso de error
			return {
				data: [],
				meta: {
					total: 0,
					per_page: 10,
					current_page: 1,
					last_page: 1,
				},
			};
		}
	}

	/**
	 * Obtiene el detalle de una orden específica usando el endpoint de vendedor
	 * CORREGIDO: Simplificado para usar directamente la respuesta del backend
	 */
	async getSellerOrderDetails(orderId: number): Promise<OrderDetail> {
		try {
			console.log(
				`SellerOrderService: Obteniendo detalle de orden ${orderId} como vendedor`
			);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDER_DETAILS(orderId)
			);

			console.log(
				`SellerOrderService: Respuesta para orden ${orderId}:`,
				response
			);

			if (!response) {
				throw new Error("Respuesta vacía al obtener detalle de orden");
			}

			// SIMPLIFICADO: Usar directamente la respuesta del backend
			// El backend ya devuelve la estructura correcta
			let orderData;
			if (response.success && response.data) {
				orderData = response.data;
			} else if (response.data) {
				orderData = response.data;
			} else {
				orderData = response;
			}

			if (!orderData) {
				throw new Error("No se encontraron datos de la orden");
			}

			// Devolver directamente los datos del backend sin modificar
			// La estructura ya está correcta según el controlador
			return orderData;
		} catch (error) {
			console.error(
				`SellerOrderService: Error al obtener detalle de orden ${orderId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Actualiza el estado de una orden
	 */
	async updateOrderStatus(
		orderId: number,
		data: OrderStatusUpdateData
	): Promise<Order> {
		try {
			console.log(
				`SellerOrderService: Actualizando estado de orden ${orderId} a ${data.status}`
			);

			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
				data
			);

			console.log(
				`SellerOrderService: Respuesta de actualización para orden ${orderId}:`,
				response
			);

			if (!response) {
				throw new Error("Respuesta vacía al actualizar estado de orden");
			}

			// Manejar diferentes formatos de respuesta
			let orderData;
			if (response.success && response.data) {
				orderData = response.data;
			} else if (response.data) {
				orderData = response.data;
			} else {
				// Si no hay datos específicos, devolver un objeto básico
				orderData = { id: orderId, status: data.status };
			}

			return orderData;
		} catch (error) {
			console.error(
				`SellerOrderService: Error al actualizar estado de orden ${orderId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Obtiene estadísticas de órdenes del vendedor
	 */
	async getOrderStats(): Promise<any> {
		try {
			console.log("SellerOrderService: Obteniendo estadísticas de órdenes");

			const response = await ApiClient.get<any>(API_ENDPOINTS.ORDERS.STATS);

			console.log("SellerOrderService: Respuesta de estadísticas:", response);

			if (!response) {
				throw new Error("Respuesta vacía al obtener estadísticas");
			}

			// Manejar diferentes formatos de respuesta
			let statsData;
			if (response.success && response.data) {
				statsData = response.data;
			} else if (response.data) {
				statsData = response.data;
			} else {
				statsData = response;
			}

			// Asegurar que tengamos un objeto con propiedades básicas
			const defaultStats = {
				totalOrders: 0,
				pendingOrders: 0,
				processingOrders: 0,
				shippedOrders: 0,
				deliveredOrders: 0,
				cancelledOrders: 0,
				totalSales: 0,
			};

			return { ...defaultStats, ...statsData };
		} catch (error) {
			console.error(
				"SellerOrderService: Error al obtener estadísticas:",
				error
			);
			// Devolver objeto básico en caso de error
			return {
				totalOrders: 0,
				pendingOrders: 0,
				processingOrders: 0,
				shippedOrders: 0,
				deliveredOrders: 0,
				cancelledOrders: 0,
				totalSales: 0,
			};
		}
	}

	/**
	 * Completa una orden específica
	 */
	async completeOrder(orderId: number): Promise<boolean> {
		try {
			console.log(`SellerOrderService: Completando orden ${orderId}`);

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ORDERS.COMPLETE(orderId)
			);

			console.log(`SellerOrderService: Respuesta al completar orden:`, response);

			// Verificar diferentes formatos de respuesta exitosa
			return response && (
				response.success === true ||
				response.status === "success" ||
				response.message?.includes("success") ||
				response.data
			);
		} catch (error) {
			console.error(
				`SellerOrderService: Error al completar orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Actualiza la información de envío de una orden
	 */
	async updateShippingInfo(
		orderId: number,
		shippingInfo: {
			tracking_number?: string;
			shipping_company?: string;
			estimated_delivery?: string;
			notes?: string;
		}
	): Promise<boolean> {
		try {
			console.log(
				`SellerOrderService: Actualizando información de envío para orden ${orderId}`,
				shippingInfo
			);

			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(orderId),
				shippingInfo
			);

			console.log(`SellerOrderService: Respuesta al actualizar envío:`, response);

			// Verificar diferentes formatos de respuesta exitosa
			return response && (
				response.success === true ||
				response.status === "success" ||
				response.message?.includes("success") ||
				response.data
			);
		} catch (error) {
			console.error(
				`SellerOrderService: Error al actualizar información de envío para orden ${orderId}:`,
				error
			);
			return false;
		}
	}
}

export default SellerOrderService;