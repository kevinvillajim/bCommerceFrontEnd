// src/core/adapters/OrderServiceAdapter.ts
import {OrderService} from "../services/OrderService";
import {GetSellerOrdersUseCase} from "../useCases/order/GetSellerOrdersUseCase";
import {GetOrderStatsUseCase} from "../useCases/order/GetOrderStatsUseCase";
import {UpdateOrderStatusUseCase} from "../useCases/order/UpdateOrderStatusUseCase";
import {GetOrderDetailUseCase} from "../useCases/order/GetOrderDetailUseCase";
import {GetUserOrdersUseCase} from "../useCases/order/GetUserOrdersUseCase";
import type {
	Order,
	OrderDetail,
	OrderStats,
	OrderStatus,
} from "../domain/entities/Order";

// Interface para las estadísticas en la UI
export interface OrderStatUI {
	label: string;
	value: number | string;
	icon?: React.ReactNode;
	color: string;
	isCurrency?: boolean;
}

// Interface para la respuesta adaptada para la UI
export interface OrderUI {
	id: string;
	orderNumber: string;
	date: string;
	customer: {
		id: number;
		name: string;
		email: string;
	};
	subtotal: number; // Subtotal sin IVA
	taxAmount: number; // Monto del IVA
	total: number; // Total con IVA incluido
	items: {
		id: number;
		productId: number;
		name: string;
		quantity: number;
		price: number;
		subtotal: number;
		image?: string;
	}[];
	status: OrderStatus;
	paymentStatus: "pending" | "paid" | "rejected" | "completed"; // Añadido "completed" para compatibilidad con la API
	shippingAddress?: string;
	notes?: string;
	itemCount?: number; // Número de items en la orden - campo adicional
}

// Extendemos la interfaz Order para incluir el campo date que viene de la API pero no está en la definición
interface OrderWithAPIFields extends Order {
	date?: string;
	itemCount?: number; // Número de items en la orden que podría venir del API
}

/**
 * Adaptador para servicios de órdenes
 * Proporciona una interfaz simplificada para los componentes de UI
 */
export class OrderServiceAdapter {
	private orderService: OrderService;
	private sellerOrdersUseCase: GetSellerOrdersUseCase;
	private userOrdersUseCase: GetUserOrdersUseCase;
	private orderStatsUseCase: GetOrderStatsUseCase;
	private updateOrderStatusUseCase: UpdateOrderStatusUseCase;
	private getOrderDetailUseCase: GetOrderDetailUseCase;

	constructor() {
		this.orderService = new OrderService();
		this.sellerOrdersUseCase = new GetSellerOrdersUseCase(this.orderService);
		this.userOrdersUseCase = new GetUserOrdersUseCase(this.orderService);
		this.orderStatsUseCase = new GetOrderStatsUseCase(this.orderService);
		this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
			this.orderService
		);
		this.getOrderDetailUseCase = new GetOrderDetailUseCase(this.orderService);
	}

	/**
	 * Obtiene las órdenes del vendedor
	 * @param filters Filtros para la consulta
	 * @returns Órdenes adaptadas para la UI y información de paginación
	 */
	async getSellerOrders(filters?: {
		status?: string;
		paymentStatus?: string;
		dateFrom?: string;
		dateTo?: string;
		search?: string;
		page?: number;
		limit?: number;
	}): Promise<{
		orders: OrderUI[];
		pagination: {
			currentPage: number;
			totalPages: number;
			totalItems: number;
			itemsPerPage: number;
		};
	}> {
		try {
			// Utilizar el caso de uso para obtener órdenes
			const response = await this.sellerOrdersUseCase.execute(filters);

			// Adaptar las órdenes al formato requerido por la UI
			const orders: OrderUI[] = response.data.map((order) =>
				this.adaptOrderToUI(order)
			);

			// Adaptar información de paginación
			const pagination = {
				currentPage: response.meta.current_page,
				totalPages: response.meta.last_page,
				totalItems: response.meta.total,
				itemsPerPage: response.meta.per_page,
			};

			return {orders, pagination};
		} catch (error) {
			console.error("Error en OrderServiceAdapter.getSellerOrders:", error);
			return {
				orders: [],
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
	 * Obtiene las órdenes del cliente
	 * @param filters Filtros para la consulta
	 * @returns Órdenes adaptadas para la UI y información de paginación
	 */
	async getUserOrders(filters?: {
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<{
		orders: OrderUI[];
		pagination: {
			currentPage: number;
			totalPages: number;
			totalItems: number;
			itemsPerPage: number;
		};
	}> {
		try {
			// Utilizar el caso de uso para obtener órdenes del cliente
			const response = await this.userOrdersUseCase.execute(filters);

			// Adaptar las órdenes al formato requerido por la UI
			const orders: OrderUI[] = response.data.map(
				(order: OrderWithAPIFields) => {
					return this.adaptOrderToUI(order);
				}
			);

			// Adaptar información de paginación
			const pagination = {
				currentPage: Number(response.meta.current_page) || 1,
				totalPages: Math.ceil(
					response.meta.total / Number(response.meta.last_page || 10)
				),
				totalItems: Number(response.meta.total) || 0,
				itemsPerPage: Number(response.meta.per_page) || 10,
			};

			return {orders, pagination};
		} catch (error) {
			console.error("Error en OrderServiceAdapter.getUserOrders:", error);
			return {
				orders: [],
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
	 * Obtiene estadísticas de órdenes para el dashboard
	 * @returns Estadísticas formateadas para la UI
	 */
	async getOrderStats(): Promise<OrderStatUI[]> {
		try {
			// Utilizar el caso de uso para obtener estadísticas
			const stats: OrderStats = await this.orderStatsUseCase.execute();

			// Transformar a formato para UI
			return [
				{
					label: "Total Pedidos",
					value: stats.totalOrders,
					color: "blue",
					isCurrency: false,
				},
				{
					label: "Pendientes",
					value: stats.pendingOrders,
					color: "yellow",
					isCurrency: false,
				},
				{
					label: "En Proceso",
					value: stats.processingOrders,
					color: "blue",
					isCurrency: false,
				},
				{
					label: "Enviados",
					value: stats.shippedOrders,
					color: "indigo",
					isCurrency: false,
				},
				{
					label: "Total Ventas",
					value: stats.totalSales,
					color: "green",
					isCurrency: true,
				},
			];
		} catch (error) {
			console.error("Error en OrderServiceAdapter.getOrderStats:", error);
			return [];
		}
	}

	/**
	 * Actualiza el estado de una orden
	 * @param orderId ID de la orden a actualizar
	 * @param status Nuevo estado
	 * @returns true si se actualizó correctamente, false en caso contrario
	 */
	async updateOrderStatus(
		orderId: string | number,
		status: OrderStatus
	): Promise<boolean> {
		try {
			// Convertir orderId a número si viene como string
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;

			// Utilizar el caso de uso para actualizar el estado
			const updatedOrder = await this.updateOrderStatusUseCase.execute(
				id,
				status
			);

			return !!updatedOrder;
		} catch (error) {
			console.error(
				`Error en OrderServiceAdapter.updateOrderStatus para orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	async getOrderDetails(orderId: string | number): Promise<OrderDetail> {
		try {
			// Convertir orderId a número si viene como string
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;

			// Utilizar el caso de uso para obtener los detalles
			const response = await this.getOrderDetailUseCase.execute(id);

			// Los datos vienen directamente del backend, asegurémonos de adaptarlos correctamente
			// a la estructura que espera la interfaz de usuario
			if (response) {
				// Crear un objeto con estructura adecuada manteniendo la compatibilidad
				const orderDetail = {
					...response,

					// Adaptaciones necesarias:
					userId: response.userId,
					sellerId: response.sellerId,
					paymentId: response.paymentId,
					paymentMethod: response.paymentMethod,
					paymentStatus: response.paymentStatus,
					createdAt: response.createdAt,
					updatedAt: response.updatedAt,
					orderNumber: response.orderNumber,
					shippingData: response.shippingData,

					// Procesar items con el formato esperado
					items:
						response.items?.map((item) => ({
							...item,
							productId: item.productId,
							product: {
								name: item.product?.name || item.product_name || 'Unknown Product',
								image: item.product?.image || item.product_image,
								slug: item.product?.slug,
								sku: item.product?.sku || item.product_sku,
							},
							product_name: item.product_name,
							product_sku: item.product_sku,
							product_image: item.product_image
						})) || [],
				};

				console.log("Orden adaptada para UI:", orderDetail);

				// Verificar si los cálculos son correctos
				const subtotal =
					orderDetail.items?.reduce(
						(sum, item) => sum + item.price * item.quantity,
						0
					) || 0;

				// Si el total parece incorrecto, corregirlo (asumiendo IVA del 15%)
				const taxRate = 0.15;
				const taxAmount = subtotal * taxRate;
				const calculatedTotal = subtotal + taxAmount;

				if (Math.abs(orderDetail.total - calculatedTotal) > 0.01) {
					orderDetail.total = calculatedTotal;
				}

				return orderDetail;
			}

			return response;
		} catch (error) {
			console.error(
				`Error en OrderServiceAdapter.getOrderDetails para orden ${orderId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Adapta una orden al formato requerido por la UI
	 * @param order Orden proveniente del backend
	 * @returns Orden formateada para la UI
	 */
	private adaptOrderToUI(order: OrderWithAPIFields): OrderUI {
		// Calcular subtotal y monto de impuesto
		const subtotal =
			order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
			0;

		const taxRate = 0.15; // 15% IVA
		const taxAmount = subtotal * taxRate;

		// Asegurarse de que el total incluya el impuesto
		// Si no hay subtotal calculado, usar directamente el total de la orden
		const total = subtotal > 0 ? subtotal + taxAmount : order.total || 0;

		// Determinar el número de ítems
		// Si tenemos items, usar la longitud del array
		// Si no, usar itemCount si existe, si no, no proporcionar un valor
		const itemCount = order.items?.length || order.itemCount || undefined;

		// Adaptar los items - si no hay items, dejamos un array vacío
		const adaptedItems =
			order.items?.map((item) => ({
				id: item.id || 0,
				productId: item.productId,
				name: item.product?.name || item.product_name || "Producto",
				quantity: item.quantity,
				price: item.price,
				subtotal: item.price * item.quantity,
				image: item.product?.image || item.product_image,
			})) || [];

		// Construir dirección de envío
		const shippingAddress = order.shippingData
			? `${order.shippingData.address}, ${order.shippingData.city}, ${order.shippingData.state}, ${order.shippingData.country}`
			: undefined;

		// Manejar el estado de pago (compatibilidad con "completed" de la API)
		const paymentStatus = order.paymentStatus as
			| "pending"
			| "paid"
			| "rejected"
			| "completed";

		// Construir objeto final
		return {
			id: String(order.id),
			orderNumber: order.orderNumber,
			// Usar la fecha que viene de la API o caer en la fecha actual si no existe
			date: order.date || order.createdAt || new Date().toISOString(),
			customer: {
				id: order.userId,
				name: order.user_name || "Cliente",
				email: order.user_email || "email@example.com",
			},
			subtotal,
			taxAmount,
			total,
			items: adaptedItems,
			status: order.status || "pending",
			paymentStatus,
			shippingAddress,
			notes: order.shippingData?.notes,
			itemCount: itemCount,
		};
	}
}

export default OrderServiceAdapter;
