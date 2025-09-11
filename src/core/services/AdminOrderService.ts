import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import ApiClient from "../../infrastructure/api/apiClient";
import type {
	Order,
	OrderDetail,
	OrderListResponse,
	OrderStatusUpdateData,
} from "../domain/entities/Order";

/**
 * Servicio específico para gestión de órdenes desde el panel de administración
 */
export class AdminOrderService {
	/**
	 * Obtiene todas las órdenes con filtros opcionales
	 */
	async getAdminOrders(filters?: {
		status?: string;
		paymentStatus?: string;
		dateFrom?: string;
		dateTo?: string;
		search?: string;
		sellerId?: number;
		page?: number;
		limit?: number;
	}): Promise<OrderListResponse> {
		try {
			console.log(
				"AdminOrderService: Obteniendo órdenes con filtros:",
				filters
			);

			// Usamos el endpoint específico para administradores
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ADMIN.ORDERS,
				filters
			);

			console.log("AdminOrderService: Respuesta de órdenes:", response);

			// Verificar la estructura de la respuesta
			const orders = response?.data || [];
			const pagination = response?.pagination || {
				currentPage: 1,
				totalPages: 1,
				totalItems: 0,
				itemsPerPage: 10,
			};

			return {
				data: orders,
				meta: {
					total: pagination.totalItems,
					per_page: pagination.itemsPerPage,
					current_page: pagination.currentPage,
					last_page: pagination.totalPages,
				},
			};
		} catch (error) {
			console.error("AdminOrderService: Error al obtener órdenes:", error);
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
	 * Obtiene el detalle de una orden específica
	 */
	async getOrderDetails(orderId: number): Promise<OrderDetail> {
		try {
			console.log(`AdminOrderService: Obteniendo detalle de orden ${orderId}`);

			// Usar el endpoint correcto para obtener los detalles de la orden
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ADMIN.ORDER_DETAIL(orderId)
			);

			console.log(
				`AdminOrderService: Respuesta para orden ${orderId}:`,
				response
			);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta vacía al obtener detalle de orden");
			}

			return response.data;
		} catch (error) {
			console.error(
				`AdminOrderService: Error al obtener detalle de orden ${orderId}:`,
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
				`AdminOrderService: Actualizando estado de orden ${orderId} a ${data.status}`
			);

			const response = await ApiClient.put<any>(
				API_ENDPOINTS.ADMIN.UPDATE_ORDER_STATUS(orderId),
				data
			);

			console.log(
				`AdminOrderService: Respuesta de actualización para orden ${orderId}:`,
				response
			);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta vacía al actualizar estado de orden");
			}

			return response.data;
		} catch (error) {
			console.error(
				`AdminOrderService: Error al actualizar estado de orden ${orderId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Cancela una orden
	 */
	async cancelOrder(orderId: number, reason: string = ""): Promise<boolean> {
		try {
			console.log(`AdminOrderService: Cancelando orden ${orderId}`);

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ADMIN.CANCEL_ORDER(orderId),
				{reason}
			);

			console.log(
				`AdminOrderService: Respuesta de cancelar orden ${orderId}:`,
				response
			);

			// Verificar el resultado
			return response?.success || false;
		} catch (error) {
			console.error(
				`AdminOrderService: Error al cancelar orden ${orderId}:`,
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
		shippingInfo: any
	): Promise<boolean> {
		try {
			console.log(
				`AdminOrderService: Actualizando información de envío para orden ${orderId}`
			);

			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ADMIN.UPDATE_SHIPPING(orderId),
				shippingInfo
			);

			console.log(
				`AdminOrderService: Respuesta de actualización de envío para ${orderId}:`,
				response
			);

			// Verificar el resultado
			return response?.success || false;
		} catch (error) {
			console.error(
				`AdminOrderService: Error al actualizar envío de orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Obtiene estadísticas generales de órdenes
	 */
	async getOrderStats(): Promise<any> {
		try {
			console.log("AdminOrderService: Obteniendo estadísticas de órdenes");

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ADMIN.ORDER_STATS
			);

			console.log("AdminOrderService: Respuesta de estadísticas:", response);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta vacía al obtener estadísticas");
			}

			return response.data;
		} catch (error) {
			console.error("AdminOrderService: Error al obtener estadísticas:", error);
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
}

export default AdminOrderService;
