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

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				filters
			);

			console.log("SellerOrderService: Respuesta de órdenes:", response);

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
	 */
	async getSellerOrderDetails(orderId: number): Promise<OrderDetail> {
		try {
			console.log(
				`SellerOrderService: Obteniendo detalle de orden ${orderId} como vendedor`
			);

			// IMPORTANTE: Aquí usamos el endpoint específico para vendedores
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.DETAILS(orderId)
			);

			console.log(
				`SellerOrderService: Respuesta para orden ${orderId}:`,
				response
			);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta vacía al obtener detalle de orden");
			}

			// Si la respuesta viene con el total de precio incorrecto, corregirlo aquí
			let orderData = response.data;

			// Verificar si necesitamos procesar o transformar datos
			if (orderData.items && Array.isArray(orderData.items)) {
				// Calcular el subtotal
				const subtotal = orderData.items.reduce(
					(sum: number, item: any) => sum + item.price * item.quantity,
					0
				);

				// Calcular el IVA (15%)
				const taxRate = 0.15;
				const taxAmount = subtotal * taxRate;

				// Calcular el total correcto (subtotal + IVA)
				const correctTotal = subtotal + taxAmount;

				// Si el total en la respuesta es incorrecto, actualizarlo
				if (Math.abs(orderData.total - correctTotal) > 0.01) {
					orderData.total = correctTotal;
				}
			}

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

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta vacía al actualizar estado de orden");
			}

			return response.data;
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

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta vacía al obtener estadísticas");
			}

			return response.data;
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
}

export default SellerOrderService;
