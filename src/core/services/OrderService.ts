import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import ApiClient from "../../infrastructure/api/apiClient";
import ConfigurationManager from './ConfigurationManager';
import { isNumberEqual } from "../../constants/calculationConfig";
import type {
	Order,
	OrderDetail,
	OrderListResponse,
	OrderStatusUpdateData,
} from "../domain/entities/Order";

/**
 * Servicio para gestión de órdenes
 */
export class OrderService {
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
				"OrderService: Obteniendo órdenes del vendedor con filtros:",
				filters
			);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				filters
			);

			console.log("OrderService: Respuesta de órdenes:", response);

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
			console.error("OrderService: Error al obtener órdenes:", error);
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
			console.log(`OrderService: Obteniendo detalle de orden ${orderId}`);

			// Usar el endpoint correcto para obtener los detalles de la orden
			// Si es una orden del cliente, usar la ruta de usuario
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.USER.ORDER_DETAILS(orderId)
			);

			console.log(`OrderService: Respuesta para orden ${orderId}:`, response);

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

				// 🎯 JORDAN: Calcular IVA con tax rate dinámico
				const configManager = ConfigurationManager.getInstance();
				const configResult = await configManager.getUnifiedConfig();
				const taxRate = configResult.config.tax_rate;
				const taxAmount = subtotal * taxRate;

				// Calcular el total correcto (subtotal + IVA)
				const correctTotal = subtotal + taxAmount;

				// Si el total en la respuesta es incorrecto, actualizarlo usando tolerancia configurada
				if (!isNumberEqual(orderData.total, correctTotal)) {
					console.warn(`🔧 OrderService: Corrigiendo total de orden ${orderId}: ${orderData.total} → ${correctTotal}`);
					orderData.total = correctTotal;
				}
			}

			return orderData;
		} catch (error) {
			console.error(
				`OrderService: Error al obtener detalle de orden ${orderId}:`,
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
				`OrderService: Actualizando estado de orden ${orderId} a ${data.status}`
			);

			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
				data
			);

			console.log(
				`OrderService: Respuesta de actualización para orden ${orderId}:`,
				response
			);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta vacía al actualizar estado de orden");
			}

			return response.data;
		} catch (error) {
			console.error(
				`OrderService: Error al actualizar estado de orden ${orderId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Completa una orden
	 */
	async completeOrder(orderId: number): Promise<boolean> {
		try {
			console.log(`OrderService: Completando orden ${orderId}`);

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ORDERS.COMPLETE(orderId)
			);

			console.log(
				`OrderService: Respuesta de completar orden ${orderId}:`,
				response
			);

			// Verificar el resultado
			return response?.success || false;
		} catch (error) {
			console.error(
				`OrderService: Error al completar orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Cancela una orden
	 */
	async cancelOrder(orderId: number, reason: string = ""): Promise<boolean> {
		try {
			console.log(`OrderService: Cancelando orden ${orderId}`);

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ORDERS.CANCEL(orderId),
				{reason}
			);

			console.log(
				`OrderService: Respuesta de cancelar orden ${orderId}:`,
				response
			);

			// Verificar el resultado
			return response?.success || false;
		} catch (error) {
			console.error(`OrderService: Error al cancelar orden ${orderId}:`, error);
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
				`OrderService: Actualizando información de envío para orden ${orderId}`
			);

			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(orderId),
				shippingInfo
			);

			console.log(
				`OrderService: Respuesta de actualización de envío para ${orderId}:`,
				response
			);

			// Verificar el resultado
			return response?.success || false;
		} catch (error) {
			console.error(
				`OrderService: Error al actualizar envío de orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Obtiene las estadísticas de órdenes del vendedor
	 */
	async getOrderStats(): Promise<any> {
		try {
			console.log("OrderService: Obteniendo estadísticas de órdenes");

			const response = await ApiClient.get<any>(API_ENDPOINTS.ORDERS.STATS);

			console.log("OrderService: Respuesta de estadísticas:", response);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				throw new Error("Respuesta vacía al obtener estadísticas");
			}

			return response.data;
		} catch (error) {
			console.error("OrderService: Error al obtener estadísticas:", error);
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
	 * Obtiene órdenes pendientes de envío
	 */
	async getOrdersAwaitingShipment(
		limit: number = 10,
		offset: number = 0
	): Promise<any[]> {
		try {
			console.log("OrderService: Obteniendo órdenes pendientes de envío");

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.AWAITING_SHIPMENT,
				{limit, offset}
			);

			console.log(
				"OrderService: Respuesta de órdenes pendientes de envío:",
				response
			);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				return [];
			}

			return Array.isArray(response.data) ? response.data : [];
		} catch (error) {
			console.error(
				"OrderService: Error al obtener órdenes pendientes de envío:",
				error
			);
			return [];
		}
	}

	/**
	 * Obtiene clientes del vendedor con sus compras
	 */
	async getSellerCustomers(
		limit: number = 10,
		offset: number = 0
	): Promise<any[]> {
		try {
			console.log("OrderService: Obteniendo clientes del vendedor");

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.CUSTOMERS,
				{limit, offset}
			);

			console.log("OrderService: Respuesta de clientes:", response);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				return [];
			}

			return Array.isArray(response.data) ? response.data : [];
		} catch (error) {
			console.error("OrderService: Error al obtener clientes:", error);
			return [];
		}
	}

	/**
	 * Obtiene órdenes con un producto específico
	 */
	async getOrdersWithProduct(
		productId: number,
		limit: number = 10,
		offset: number = 0
	): Promise<any[]> {
		try {
			console.log(`OrderService: Obteniendo órdenes con producto ${productId}`);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.WITH_PRODUCT(productId),
				{limit, offset}
			);

			console.log(
				`OrderService: Respuesta de órdenes con producto ${productId}:`,
				response
			);

			// Verificar si hay datos en la respuesta
			if (!response || !response.data) {
				return [];
			}

			return Array.isArray(response.data) ? response.data : [];
		} catch (error) {
			console.error(
				`OrderService: Error al obtener órdenes con producto ${productId}:`,
				error
			);
			return [];
		}
	}
	/**
	 * Obtiene las órdenes del cliente actual
	 */
	async getUserOrders(filters?: {
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<OrderListResponse> {
		try {
			console.log(
				"OrderService: Obteniendo órdenes del cliente con filtros:",
				filters
			);

			// Usar la ruta correcta de las órdenes de usuario
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.USER.ORDERS,
				filters
			);

			console.log("OrderService: Respuesta de órdenes de cliente:", response);

			// Verificar la estructura de la respuesta
			const orders = response?.data || [];
			const pagination = response?.pagination || {
				currentPage: 1,
				totalPages: 1,
				totalItems: 0,
				itemsPerPage: 10,
			};

			// 🎯 JORDAN: Obtener configuración dinámica una vez
			const configManager = ConfigurationManager.getInstance();
			const configResult = await configManager.getUnifiedConfig();
			const taxRate = configResult.config.tax_rate;

			// Corregir los cálculos de precio si es necesario
			const processedOrders = orders.map((order: any) => {
				// Si tenemos los items, verificar los totales
				if (order.items && Array.isArray(order.items)) {
					const subtotal = order.items.reduce(
						(sum: number, item: any) => sum + item.price * item.quantity,
						0
					);

					const taxAmount = subtotal * taxRate;

					// Total correcto
					const correctTotal = subtotal + taxAmount;

					// Actualizar el total si es incorrecto usando tolerancia configurada
					if (!isNumberEqual(order.total, correctTotal)) {
						console.warn(`🔧 OrderService: Corrigiendo total de orden: ${order.total} → ${correctTotal}`);
						order.total = correctTotal;
					}
				}
				return order;
			});

			return {
				data: processedOrders,
				meta: {
					total: pagination.totalItems,
					per_page: pagination.itemsPerPage,
					current_page: pagination.currentPage,
					last_page: pagination.totalPages,
				},
			};
		} catch (error) {
			console.error(
				"OrderService: Error al obtener órdenes del cliente:",
				error
			);
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
}

export default OrderService;
