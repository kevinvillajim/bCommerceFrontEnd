import {OrderService} from "../services/OrderService";
import {GetSellerOrdersUseCase} from "../useCases/order/GetSellerOrdersUseCase";
import {GetOrderStatsUseCase} from "../useCases/order/GetOrderStatsUseCase";
import {UpdateOrderStatusUseCase} from "../useCases/order/UpdateOrderStatusUseCase";
import {GetOrderDetailUseCase} from "../useCases/order/GetOrderDetailUseCase";
import type { OrderStatus, OrderDetail } from "../domain/entities/Order";
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
	private getOrderDetailUseCase: GetOrderDetailUseCase;

	constructor() {
		this.orderService = new OrderService();
		this.getSellerOrdersUseCase = new GetSellerOrdersUseCase(this.orderService);
		this.getOrderStatsUseCase = new GetOrderStatsUseCase(this.orderService);
		this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
			this.orderService
		);
		this.getOrderDetailUseCase = new GetOrderDetailUseCase(this.orderService);
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
			const adaptedOrders: OrderUI[] = response.data.map((order) => ({
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
	 * Obtiene el detalle de una orden específica
	 */
	async getOrderDetails(orderId: string): Promise<OrderDetail> {
		try {
			const orderDetail = await this.getOrderDetailUseCase.execute(
				Number(orderId)
			);

			// Asegurarse de que los datos estén en el formato esperado por el frontend
			return {
				...orderDetail,
				// Asegurar que los datos necesarios estén presentes
				id: orderDetail.id || 0,
				orderNumber: orderDetail.orderNumber || `ORD-${orderId}`,
				items: orderDetail.items.map((item) => ({
					...item,
					product_name: item.product_name || item.product?.name || "Producto",
					product_sku: item.product_sku || item.product?.sku || "N/A",
					product_image: item.product_image || item.product?.image || undefined,
				})),
			};
		} catch (error) {
			console.error(
				`Error en OrderServiceAdapter.getOrderDetails para orden ${orderId}:`,
				error
			);
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

			// Adaptar el formato de respuesta de la API al formato esperado por la UI
			const adaptedOrders: OrderUI[] = response.data.map((order) => ({
				id: String(order.id),
				orderNumber: order.orderNumber,
				date: order.createdAt || new Date().toISOString(),
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
			console.error("Error en OrderServiceAdapter.getUserOrders:", error);
			throw error;
		}
	}
}
