import {AdminOrderService} from "../services/AdminOrderService";
import type {OrderStatus} from "../domain/entities/Order";

// Interface para las estadísticas en la UI
export interface AdminOrderStatUI {
	label: string;
	value: number | string;
	icon?: React.ReactNode;
	color: string;
	isCurrency?: boolean;
}

// Interface para la respuesta adaptada para la UI administrativa
export interface AdminOrderUI {
	id: number;
	orderNumber: string;
	date: string;
	customer: {
		id: number;
		name: string;
		email: string;
	};
	seller: {
		id: number;
		name: string;
	};
	total: number;
	status: OrderStatus;
	paymentStatus: string;
	paymentMethod: string;
	items: Array<{
		id: number;
		productId: number;
		name: string;
		quantity: number;
		price: number;
		subtotal: number;
		image?: string;
	}>;
	shippingData?: {
		address: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
		phone?: string;
		name?: string;
	};
}

/**
 * Adaptador para servicios de órdenes administrativas
 */
export class AdminOrderServiceAdapter {
	private adminOrderService: AdminOrderService;

	constructor() {
		this.adminOrderService = new AdminOrderService();
	}

	/**
	 * Obtiene las órdenes para la vista de administración
	 * @param filters Filtros para la consulta
	 * @returns Órdenes adaptadas para la UI y información de paginación
	 */
	async getAdminOrders(filters?: {
		status?: string;
		paymentStatus?: string;
		dateFrom?: string;
		dateTo?: string;
		search?: string;
		sellerId?: number | null;
		page?: number;
		limit?: number;
	}): Promise<{
		orders: AdminOrderUI[];
		pagination: {
			currentPage: number;
			totalPages: number;
			totalItems: number;
			itemsPerPage: number;
		};
	}> {
		try {
			// Preparar filtros para la API
			const apiFilters: any = {...filters};

			// Convertir valores especiales
			if (filters?.status === "all") {
				delete apiFilters.status;
			}

			if (filters?.paymentStatus === "all") {
				delete apiFilters.paymentStatus;
			}

			if (filters?.sellerId === null) {
				delete apiFilters.sellerId;
			}

			// Usar el servicio para obtener órdenes
			const response = await this.adminOrderService.getAdminOrders(apiFilters);

			// Adaptar las órdenes al formato requerido por la UI
			const orders: AdminOrderUI[] = response.data.map((order: any) =>
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
			console.error("Error en AdminOrderServiceAdapter.getAdminOrders:", error);
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
	 * Obtiene los detalles de una orden
	 * @param orderId ID de la orden
	 * @returns Detalles de la orden adaptados para la UI
	 */
	async getOrderDetails(orderId: number): Promise<AdminOrderUI | null> {
		try {
			const orderDetails =
				await this.adminOrderService.getOrderDetails(orderId);
			return this.adaptOrderToUI(orderDetails);
		} catch (error) {
			console.error(`Error al obtener detalles de la orden ${orderId}:`, error);
			return null;
		}
	}

	/**
	 * Actualiza el estado de una orden
	 * @param orderId ID de la orden
	 * @param status Nuevo estado
	 * @returns true si se actualizó correctamente
	 */
	async updateOrderStatus(
		orderId: number,
		status: OrderStatus
	): Promise<boolean> {
		try {
			await this.adminOrderService.updateOrderStatus(orderId, {status});
			return true;
		} catch (error) {
			console.error(
				`Error al actualizar estado de la orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Cancela una orden
	 * @param orderId ID de la orden
	 * @param reason Razón de la cancelación
	 * @returns true si se canceló correctamente
	 */
	async cancelOrder(orderId: number, reason: string = ""): Promise<boolean> {
		try {
			return await this.adminOrderService.cancelOrder(orderId, reason);
		} catch (error) {
			console.error(`Error al cancelar la orden ${orderId}:`, error);
			return false;
		}
	}

	/**
	 * Obtiene estadísticas de órdenes para el dashboard
	 * @returns Estadísticas formateadas para la UI
	 */
	async getOrderStats(): Promise<AdminOrderStatUI[]> {
		try {
			const stats = await this.adminOrderService.getOrderStats();

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
					label: "Entregados",
					value: stats.deliveredOrders,
					color: "purple",
					isCurrency: false,
				},
				{
					label: "Completados",
					value: stats.completedOrders,
					color: "green",
					isCurrency: false,
				},
				{
					label: "Cancelados",
					value: stats.cancelledOrders,
					color: "red",
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
			console.error("Error en AdminOrderServiceAdapter.getOrderStats:", error);
			return [];
		}
	}

	/**
	 * Adapta una orden al formato requerido por la UI
	 * @param order Orden desde el API
	 * @returns Orden formateada para la UI administrativa
	 */
	private adaptOrderToUI(order: any): AdminOrderUI {
		// Extraer información del cliente
		const customerName =
			order.user_name ||
			(order.user ? order.user.name : "Cliente") ||
			(order.customer ? order.customer.name : "Cliente");

		const customerEmail =
			order.user_email ||
			(order.user ? order.user.email : "") ||
			(order.customer ? order.customer.email : "");

		// Extraer información del vendedor
		const sellerName =
			order.seller_name ||
			(order.seller ? order.seller.name : "Vendedor") ||
			"Vendedor";

		// Procesar items con el formato esperado
		const items = Array.isArray(order.items)
			? order.items.map((item: any) => ({
					id: item.id || 0,
					productId: item.product_id || item.productId || 0,
					name:
						item.product_name ||
						(item.product ? item.product.name : "Producto"),
					quantity: item.quantity || 0,
					price: item.price || 0,
					subtotal: item.subtotal || 0,
					image:
						item.product_image ||
						(item.product ? item.product.image : undefined),
				}))
			: [];

		// Procesar datos de envío
		let shippingData = null;
		if (order.shipping_data) {
			// Puede venir como string JSON
			if (typeof order.shipping_data === "string") {
				try {
					shippingData = JSON.parse(order.shipping_data);
				} catch (e) {
					console.error("Error al parsear shipping_data:", e);
					shippingData = {};
				}
			} else {
				shippingData = order.shipping_data;
			}
		}

		return {
			id: order.id || 0,
			orderNumber: order.order_number || order.orderNumber || `#${order.id}`,
			date:
				order.created_at ||
				order.createdAt ||
				order.date ||
				new Date().toISOString(),
			customer: {
				id: order.user_id || (order.user ? order.user.id : 0) || 0,
				name: customerName,
				email: customerEmail,
			},
			seller: {
				id: order.seller_id || (order.seller ? order.seller.id : 0) || 0,
				name: sellerName,
			},
			total: order.total || 0,
			status: order.status || "pending",
			paymentStatus: order.payment_status || order.paymentStatus || "pending",
			paymentMethod: order.payment_method || order.paymentMethod || "N/A",
			items: items,
			shippingData: shippingData,
		};
	}
}

export default AdminOrderServiceAdapter;
