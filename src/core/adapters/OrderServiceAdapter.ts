import {OrderService} from "../services/OrderService";
import {GetSellerOrdersUseCase} from "../useCases/order/GetSellerOrdersUseCase";
import {GetOrderStatsUseCase} from "../useCases/order/GetOrderStatsUseCase";
import {UpdateOrderStatusUseCase} from "../useCases/order/UpdateOrderStatusUseCase";
import {GetOrderDetailUseCase} from "../useCases/order/GetOrderDetailUseCase";
import type {OrderStatus, OrderDetail} from "../domain/entities/Order";
import {GetUserOrdersUseCase} from "../useCases/order/GetUserOrdersUseCase";

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
	total: number;
	items: {
		id: number;
		productId: number;
		name: string;
		quantity: number;
		price: number;
		subtotal: number;
		image?: string;
	}[];
	status:
		| "pending"
		| "processing"
		| "paid"
		| "shipped"
		| "delivered"
		| "completed"
		| "cancelled";
	paymentStatus: "pending" | "paid" | "rejected";
	shippingAddress: string;
	notes?: string;
}

// Interface para la respuesta de estadísticas adaptada para la UI
export interface OrderStatUI {
	label: string;
	value: number | string;
	icon: React.ReactNode;
	color: string;
	isCurrency?: boolean;
}

/**
 * Adaptador para transformar datos de la API al formato esperado por SellerOrdersPage
 */
export class OrderServiceAdapter {
	private orderService: OrderService;
	private getSellerOrdersUseCase: GetSellerOrdersUseCase;
	private getOrderStatsUseCase: GetOrderStatsUseCase;
	private updateOrderStatusUseCase: UpdateOrderStatusUseCase;

	constructor() {
		this.orderService = new OrderService();
		this.getSellerOrdersUseCase = new GetSellerOrdersUseCase(this.orderService);
		this.getOrderStatsUseCase = new GetOrderStatsUseCase(this.orderService);
		this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
			this.orderService
		);
	}

	/**
	 * Obtiene las órdenes del vendedor adaptadas al formato de la UI
	 */
	async getSellerOrders(filters: {
		status?: string;
		paymentStatus?: string;
		dateFrom?: string;
		dateTo?: string;
		search?: string;
		page?: number;
		limit?: number;
	}) {
		try {
			const response = await this.getSellerOrdersUseCase.execute(filters);

			// Adaptar el formato de respuesta de la API al formato esperado por la UI
			const ordersArray = Array.isArray(response.data) ? response.data : [];
			const adaptedOrders: OrderUI[] = ordersArray.map((order) => ({
				id: String(order.id),
				orderNumber: order.orderNumber,
				date: order.createdAt || new Date().toISOString(),
				customer: {
					id: order.userId,
					name: order.user_name || "Cliente",
					email: order.user_email || "email@example.com",
				},
				total: order.total,
				items: order.items.map((item) => ({
					id: item.id || 0,
					productId: item.productId,
					name: item.product?.name || "Producto",
					quantity: item.quantity,
					price: item.price,
					subtotal: item.subtotal,
				})),
				status: this.mapOrderStatus(order.status),
				paymentStatus: this.mapPaymentStatus(order.paymentStatus),
				shippingAddress: this.formatShippingAddress(order.shippingData),
				notes: order.shippingData?.notes,
			}));

			return {
				orders: adaptedOrders,
				pagination: {
					currentPage: response.meta.current_page,
					totalPages: response.meta.last_page,
					totalItems: response.meta.total,
					itemsPerPage: response.meta.per_page,
				},
			};
		} catch (error) {
			console.error("Error en OrderServiceAdapter.getSellerOrders:", error);
			throw error;
		}
	}

	/**
	 * Obtiene estadísticas de órdenes
	 */
	async getOrderStats(): Promise<OrderStatUI[]> {
		try {
			const stats = await this.getOrderStatsUseCase.execute();

			// Aquí no devolvemos el objeto estadísticas directamente, sino un array de objetos formateados
			return [
				{
					label: "Total Pedidos",
					value: stats.totalOrders,
					icon: null, // El componente SellerOrdersPage asignará el icono
					color: "blue",
				},
				{
					label: "Pendientes",
					value: stats.pendingOrders,
					icon: null,
					color: "yellow",
				},
				{
					label: "En Proceso",
					value: stats.processingOrders,
					icon: null,
					color: "blue",
				},
				{
					label: "Enviados",
					value: stats.shippedOrders,
					icon: null,
					color: "indigo",
				},
				{
					label: "Total Ventas",
					value: stats.totalSales,
					icon: null,
					color: "green",
					isCurrency: true,
				},
			];
		} catch (error) {
			console.error("Error en OrderServiceAdapter.getOrderStats:", error);
			throw error;
		}
	}

	/**
	 * Actualiza el estado de una orden
	 */
	async updateOrderStatus(
		orderId: string,
		newStatus: string
	): Promise<boolean> {
		try {
			// Mapear el estado de la UI al dominio
			const domainStatus = this.mapUiStatusToDomain(newStatus);

			await this.updateOrderStatusUseCase.execute(
				Number(orderId),
				domainStatus
			);
			return true;
		} catch (error) {
			console.error(
				`Error en OrderServiceAdapter.updateOrderStatus para orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Mapea el estado de la UI al dominio
	 */
	private mapUiStatusToDomain(uiStatus: string): OrderStatus {
		switch (uiStatus) {
			case "pending":
				return "pending";
			case "processing":
				return "processing";
			case "paid":
				return "paid";
			case "shipped":
				return "shipped";
			case "delivered":
				return "delivered";
			case "completed":
				return "completed";
			case "cancelled":
				return "cancelled";
			default:
				throw new Error(`Estado desconocido: ${uiStatus}`);
		}
	}

	/**
	 * Mapea el estado del dominio a la UI
	 */
	private mapOrderStatus(status: OrderStatus | undefined): OrderUI["status"] {
		switch (status) {
			case "pending":
				return "pending";
			case "processing":
				return "processing";
			case "paid":
				return "paid";
			case "shipped":
				return "shipped";
			case "delivered":
				return "delivered";
			case "completed":
				return "completed";
			case "cancelled":
				return "cancelled";
			default:
				return "pending";
		}
	}

	/**
	 * Mapea el estado de pago a los valores esperados por la UI
	 */
	private mapPaymentStatus(
		paymentStatus: string | null | undefined
	): "pending" | "paid" | "rejected" {
		switch (paymentStatus) {
			case "completed":
				return "paid";
			case "failed":
				return "rejected";
			default:
				return "pending";
		}
	}

	/**
	 * Formatea la dirección de envío como texto
	 */
	private formatShippingAddress(shippingData: any): string {
		if (!shippingData) return "No disponible";

		const parts = [
			shippingData.address,
			shippingData.city,
			shippingData.state,
			shippingData.country,
			shippingData.postalCode,
		].filter(Boolean);

		return parts.join(", ");
	}

	/**
	 * Obtiene el detalle de una orden específica (adaptado para cliente)
	 */
	async getOrderDetails(orderId: string | number, isUser: boolean = true) {
		try {
			const orderDetail = await this.orderService.getOrderDetails(
				Number(orderId)
			);

			// Adaptar los datos para asegurar que tienen el formato correcto
			return {
				id: orderDetail.id,
				orderNumber: orderDetail.orderNumber,
				date: orderDetail.createdAt,
				total: orderDetail.total,
				status: this.mapOrderStatus(orderDetail.status),
				paymentStatus: orderDetail.paymentStatus,
				paymentMethod: orderDetail.paymentMethod,
				userId: orderDetail.userId,
				customer: {
					id: orderDetail.userId,
					name: orderDetail.user_name || "Cliente",
					email: orderDetail.user_email || "email@example.com",
				},
				items: Array.isArray(orderDetail.items)
					? orderDetail.items.map((item: any) => ({
							id: item.id,
							productId: item.productId,
							name: item.product_name || item.product?.name || "Producto",
							quantity: item.quantity,
							price: item.price,
							subtotal: item.subtotal,
							image: item.product_image || item.product?.image,
							sku: item.product_sku || item.product?.sku,
						}))
					: [],
				shippingAddress: this.formatShippingAddress(orderDetail.shippingData),
				shippingData: orderDetail.shippingData,
				notes: orderDetail.shippingData?.notes,
				createdAt: orderDetail.createdAt,
				updatedAt: orderDetail.updatedAt,
			};
		} catch (error) {
			console.error("Error en OrderServiceAdapter.getOrderDetails:", error);
			throw error;
		}
	}

	/**
	 * Obtiene las órdenes del cliente adaptadas al formato de la UI
	 */
	async getUserOrders(filters: {
		status?: string;
		page?: number;
		limit?: number;
	}) {
		try {
			const getUserOrdersUseCase = new GetUserOrdersUseCase(this.orderService);
			const response = await getUserOrdersUseCase.execute(filters);

			// Asegura que response.data es un array
			const ordersArray = Array.isArray(response.data) ? response.data : [];

			const adaptedOrders: OrderUI[] = ordersArray.map((order) => ({
				id: String(order.id),
				orderNumber: order.orderNumber,
				date: order.createdAt || new Date().toISOString(),
				customer: {
					id: order.userId || 0,
					name: order.user_name || "Cliente",
					email: order.user_email || "email@example.com",
				},
				total: order.total,
				items: Array.isArray(order.items)
					? order.items.map((item) => ({
							id: item.id || 0,
							productId: item.productId,
							name: item.product?.name || "Producto",
							quantity: item.quantity,
							price: item.price,
							subtotal: item.subtotal,
							image: item.product?.image,
						}))
					: [],
				status: this.mapOrderStatus(order.status),
				paymentStatus: this.mapPaymentStatus(order.paymentStatus),
				shippingAddress: this.formatShippingAddress(order.shippingData),
				notes: order.shippingData?.notes,
			}));

			// Adaptar la paginación a la respuesta real del backend
			const meta = response.meta || {};
			const currentPage = Number(meta.current_page) || 1;
			const itemsPerPage = Number(meta.per_page) || 10;
			const totalItems = Number(meta.total) || 0;
			const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

			return {
				orders: adaptedOrders,
				pagination: {
					currentPage,
					totalPages,
					totalItems,
					itemsPerPage,
				},
			};
		} catch (error) {
			console.error("Error en OrderServiceAdapter.getUserOrders:", error);
			throw error;
		}
	}
}
