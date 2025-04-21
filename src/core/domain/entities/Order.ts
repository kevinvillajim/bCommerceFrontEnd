/**
 * Archivo: src/core/domain/entities/Order.ts
 * Entidades relacionadas con órdenes de compra y sus tipos
 */
export interface Order {
	id?: number;
	userId: number;
	sellerId?: number;
	items: OrderItem[];
	total: number;
	status: OrderStatus;
	paymentId?: string;
	paymentMethod?: PaymentMethod;
	paymentStatus?: PaymentStatus;
	paymentDetails?: Record<string, any>;
	shippingData?: ShippingData;
	orderNumber: string;
	createdAt?: string;
	updatedAt?: string;
	user_name?: string; // Añadido para compatibilidad con API
	user_email?: string; // Añadido para compatibilidad con API
}

/**
 * Order item entity
 */
export interface OrderItem {
	id?: number;
	orderId?: number;
	productId: number;
	quantity: number;
	price: number;
	subtotal: number;
	product?: {
		name: string;
		image?: string;
		slug?: string;
		sku?: string;
	};
	createdAt?: string;
	updatedAt?: string;
	product_name?: string; // Para compatibilidad con API
	product_sku?: string; // Para compatibilidad con API
	product_image?: string; // Para compatibilidad con API
}

/**
 * Order detail entity - Versión extendida con información adicional
 */
export interface OrderDetail extends Order {
	items: (OrderItem & {
		product_name?: string;
		product_sku?: string;
		product_image?: string;
	})[];
}

/**
 * Order creation data
 */
export interface OrderCreationData {
	sellerId?: number;
	items: OrderItemCreationData[];
	shippingData?: ShippingData;
}

/**
 * Order item creation data
 */
export interface OrderItemCreationData {
	productId: number;
	quantity: number;
	price?: number;
}

/**
 * Order status update data
 */
export interface OrderStatusUpdateData {
	status: OrderStatus;
}

/**
 * Order payment info update data
 */
export interface OrderPaymentUpdateData {
	paymentId: string;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	paymentDetails?: Record<string, any>;
}

/**
 * Order shipping data update
 */
export interface OrderShippingUpdateData {
	shippingData: ShippingData;
}

/**
 * Order list response
 */
export interface OrderListResponse {
	data: Order[];
	meta: {
		total: number;
		per_page: number;
		current_page: number;
		last_page: number;
	};
}

/**
 * Order detail response
 */
export interface OrderDetailResponse {
	data: OrderDetail;
}

/**
 * Order filter params
 */
export interface OrderFilterParams {
	userId?: number;
	sellerId?: number;
	status?: string;
	paymentStatus?: string;
	orderNumber?: string;
	dateFrom?: string;
	dateTo?: string;
	search?: string;
	page?: number;
	perPage?: number;
	sortBy?: string;
	sortDir?: "asc" | "desc";
}

/**
 * Order statistics
 */
export interface OrderStats {
	totalOrders: number;
	pendingOrders: number;
	processingOrders: number;
	shippedOrders: number;
	deliveredOrders: number;
	completedOrders: number;
	cancelledOrders: number;
	totalSales: number;
}

/**
 * Order status type - Actualizada para incluir 'paid'
 */
export type OrderStatus =
	| "pending"
	| "processing"
	| "paid" // Añadido para compatibilidad
	| "shipped"
	| "delivered"
	| "completed"
	| "cancelled";

/**
 * Payment method type
 */
export type PaymentMethod =
	| "credit_card"
	| "paypal"
	| "transfer"
	| "other"
	| null;

/**
 * Payment status type
 */
export type PaymentStatus = "pending" | "completed" | "failed" | null;

/**
 * Shipping data type
 */
export interface ShippingData {
	address: string;
	city: string;
	state: string;
	country: string;
	postalCode: string;
	phone?: string;
	name?: string;
	tracking_number?: string;
	shipping_company?: string;
	estimated_delivery?: string;
	notes?: string;
	cancel_reason?: string;
}
