// src/core/adapters/OrderServiceAdapter.ts - CORREGIDO CON DESCUENTOS POR VOLUMEN
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

// ✅ ACTUALIZADA: Interface para la respuesta adaptada para la UI con descuentos por volumen
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
		// ✅ NUEVOS: Campos de descuentos por volumen
		originalPrice?: number;
		volumeDiscountPercentage?: number;
		volumeSavings?: number;
		discountLabel?: string | null; // ✅ CORREGIDO: permite null
		hasVolumeDiscount?: boolean;
	}[];
	status: OrderStatus;
	paymentStatus: "pending" | "paid" | "rejected" | "completed";
	shippingAddress?: string;
	notes?: string;
	itemCount?: number;
	// ✅ NUEVOS: Campos de información de descuentos por volumen
	originalTotal?: number;
	volumeDiscountSavings?: number;
	volumeDiscountsApplied?: boolean;
	shippingCost?: number;
	freeShipping?: boolean;
	totalDiscounts?: number;
	pricingBreakdown?: any;
}

// ✅ ACTUALIZADA: Extendemos la interfaz Order para incluir campos de descuentos por volumen
interface OrderWithAPIFields extends Order {
	date?: string;
	itemCount?: number;
	// ✅ NUEVOS: Campos de descuentos por volumen que pueden venir del API
	subtotal_products?: number;
	iva_amount?: number;
	original_total?: number;
	volume_discount_savings?: number;
	volume_discounts_applied?: boolean;
	shipping_cost?: number;
	free_shipping?: boolean;
	total_discounts?: number;
	pricing_breakdown?: any;
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

	/**
	 * ✅ CORREGIDO: Obtener detalles de orden con información de descuentos por volumen
	 */
	async getOrderDetails(orderId: string | number): Promise<OrderDetail> {
		try {
			// Convertir orderId a número si viene como string
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;

			// Utilizar el caso de uso para obtener los detalles
			const response = await this.getOrderDetailUseCase.execute(id);

			// Los datos vienen directamente del backend, asegurémonos de adaptarlos correctamente
			if (response) {
				// ✅ ADAPTAR CON INFORMACIÓN DE DESCUENTOS POR VOLUMEN
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

					// ✅ PROCESAR ITEMS CON INFORMACIÓN DE DESCUENTOS POR VOLUMEN
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
							product_image: item.product_image,
							// ✅ CAMPOS DE DESCUENTOS POR VOLUMEN
							original_price: item.original_price,
							volume_discount_percentage: item.volume_discount_percentage,
							volume_savings: item.volume_savings,
							discount_label: item.discount_label,
							hasVolumeDiscount: (item.volume_discount_percentage || 0) > 0
						})) || [],

					// ✅ CAMPOS DE TOTALES CON DESCUENTOS
					subtotal_products: response.subtotal_products,
					iva_amount: response.iva_amount,
					original_total: response.original_total,
					volume_discount_savings: response.volume_discount_savings,
					volume_discounts_applied: response.volume_discounts_applied,
					shipping_cost: response.shipping_cost,
					free_shipping: response.free_shipping,
					total_discounts: response.total_discounts,
					pricing_breakdown: response.pricing_breakdown
				};

				console.log("✅ Orden adaptada para UI con descuentos por volumen:", orderDetail);

				// ✅ USAR TOTALES QUE VIENEN DEL BACKEND (ya calculados)
				if (orderDetail.subtotal_products && orderDetail.iva_amount) {
					console.log("💰 Usando totales calculados del backend:", {
						subtotal_products: orderDetail.subtotal_products,
						iva_amount: orderDetail.iva_amount,
						total: orderDetail.total,
						volume_savings: orderDetail.volume_discount_savings
					});
				} else {
					// Fallback: calcular si no vienen del backend
					const subtotal =
						orderDetail.items?.reduce(
							(sum, item) => sum + item.price * item.quantity,
							0
						) || 0;

					const taxRate = 0.15;
					const taxAmount = subtotal * taxRate;
					const calculatedTotal = subtotal + taxAmount;

					if (Math.abs(orderDetail.total - calculatedTotal) > 0.01) {
						console.warn("⚠️ Diferencia en cálculo de totales, corrigiendo:", {
							original: orderDetail.total,
							calculated: calculatedTotal
						});
						orderDetail.total = calculatedTotal;
					}
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
	 * ✅ CORREGIDO: Adapta una orden al formato requerido por la UI con descuentos por volumen
	 */
	private adaptOrderToUI(order: OrderWithAPIFields): OrderUI {
		// ✅ USAR TOTALES QUE VIENEN DEL BACKEND (ya calculados con descuentos)
		const subtotal = order.subtotal_products || 
			order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

		const taxAmount = order.iva_amount || (subtotal * 0.15); // Fallback al 15%
		const total = order.total || (subtotal + taxAmount);

		// Determinar el número de ítems
		const itemCount = order.items?.length || order.itemCount || undefined;

		// ✅ ADAPTAR ITEMS CON INFORMACIÓN DE DESCUENTOS POR VOLUMEN
		const adaptedItems =
			order.items?.map((item) => ({
				id: item.id || 0,
				productId: item.productId,
				name: item.product?.name || item.product_name || "Producto",
				quantity: item.quantity,
				price: item.price, // Precio final (con descuentos aplicados)
				subtotal: item.price * item.quantity,
				image: item.product?.image || item.product_image,
				// ✅ INFORMACIÓN DE DESCUENTOS POR VOLUMEN
				originalPrice: item.original_price || item.price,
				volumeDiscountPercentage: item.volume_discount_percentage || 0,
				volumeSavings: item.volume_savings || 0,
				discountLabel: item.discount_label || null, // ✅ CORREGIDO: null en lugar de undefined
				hasVolumeDiscount: (item.volume_discount_percentage || 0) > 0
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

		// ✅ CONSTRUIR OBJETO CON INFORMACIÓN DE DESCUENTOS POR VOLUMEN
		return {
			id: String(order.id),
			orderNumber: order.orderNumber,
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
			// ✅ INFORMACIÓN ADICIONAL DE DESCUENTOS POR VOLUMEN
			originalTotal: order.original_total || total,
			volumeDiscountSavings: order.volume_discount_savings || 0, // ✅ CORREGIDO: valor por defecto
			volumeDiscountsApplied: order.volume_discounts_applied || false,
			shippingCost: order.shipping_cost || 0,
			freeShipping: order.free_shipping || false,
			totalDiscounts: order.total_discounts || 0,
			pricingBreakdown: order.pricing_breakdown || null
		};
	}

	/**
	 * ✅ NUEVO: Obtener resumen de descuentos de una orden
	 */
	getOrderDiscountSummary(order: OrderUI): {
		hasDiscounts: boolean;
		totalSavings: number;
		volumeDiscounts: boolean;
		itemsWithDiscounts: number;
	} {
		const itemsWithDiscounts = order.items.filter(item => item.hasVolumeDiscount).length;
		const totalSavings = order.volumeDiscountSavings || 0; // ✅ CORREGIDO: valor por defecto
		
		return {
			hasDiscounts: totalSavings > 0,
			totalSavings,
			volumeDiscounts: order.volumeDiscountsApplied || false,
			itemsWithDiscounts
		};
	}

	/**
	 * ✅ NUEVO: Formatear información de pricing para mostrar en UI
	 */
	formatPricingBreakdown(order: OrderUI): {
		subtotal: string;
		tax: string;
		shipping: string;
		discounts: string;
		total: string;
	} {
		return {
			subtotal: `$${order.subtotal.toFixed(2)}`,
			tax: `$${order.taxAmount.toFixed(2)}`,
			shipping: order.freeShipping ? 'GRATIS' : `$${(order.shippingCost || 0).toFixed(2)}`,
			discounts: (order.volumeDiscountSavings || 0) > 0 ? `-$${(order.volumeDiscountSavings || 0).toFixed(2)}` : '$0.00',
			total: `$${order.total.toFixed(2)}`
		};
	}
}

export default OrderServiceAdapter;