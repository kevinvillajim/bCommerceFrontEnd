/**
 * Archivo: src/core/domain/entities/Order.ts
 * Entidades relacionadas con órdenes de compra y sus tipos - CORREGIDO CON DESCUENTOS POR VOLUMEN
 */
import type {Address} from "../valueObjects/Address";

export interface Order {
	id?: number;
	userId: number;
	sellerId?: number;
	items: OrderItem[];
	total: number;
	status: OrderStatus;
	paymentId?: string;
	payment_method?: PaymentMethod;
	paymentStatus?: PaymentStatus;
	paymentDetails?: Record<string, any>;
	shippingData?: ShippingData;
	orderNumber: string;
	createdAt?: string;
	updatedAt?: string;
	user_name?: string; // Añadido para compatibilidad con API
	user_email?: string; // Añadido para compatibilidad con API
	
	// ✅ NUEVOS: Campos de descuentos por volumen y pricing detallado
	original_total?: number;
	volume_discount_savings?: number;
	volume_discounts_applied?: boolean;
	subtotal_products?: number;
	iva_amount?: number;
	shipping_cost?: number;
	total_discounts?: number;
	free_shipping?: boolean;
	free_shipping_threshold?: number;
	pricing_breakdown?: any;
}

/**
 * Order item entity - ACTUALIZADO CON DESCUENTOS POR VOLUMEN
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
	
	// ✅ NUEVOS: Campos de descuentos por volumen
	original_price?: number;
	volume_discount_percentage?: number;
	volume_savings?: number;
	discount_label?: string;
	hasVolumeDiscount?: boolean;
}

/**
 * Order detail entity - Versión extendida con información adicional
 */
export interface OrderDetail extends Order {
	customer: any;
	orderDate: any;
	payment: any;
	payment_status: string | null | undefined;
	created_at: any;
	createdAt: string;
	customerName?: string;
	customerEmail?: string;
	paymentMethod?: string;
	seller_name?: string;
	seller_email?: string;
	seller_store_name?: string;
	shippingAddress?: {
		address: string;
		city: string;
		state: string;
		country: string;
	};
	orderSummary?: {
		total_quantity: number;
		total_seller_earnings_from_products: number;
		total_platform_commission: number;
		shipping_distribution?: {
			seller_amount: number;
		};
	};
	seller_id?: number;
	sellerId?: number;
	shippingData?: ShippingData;
	items: (OrderItem & {
		product_name?: string;
		product_sku?: string;
		product_image?: string;
		// ✅ NUEVOS: Campos de descuentos por volumen en detalles
		original_price?: number;
		volume_discount_percentage?: number;
		volume_savings?: number;
		discount_label?: string;
		hasVolumeDiscount?: boolean;
	})[];
}

/**
 * Order creation data
 */
export interface OrderCreationData {
	sellerId?: number;
	items: OrderItemCreationData[];
	shippingAddress: Address;
	billingAddress?: Address;
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
 * Order status type - ✅ CORREGIDO para incluir 'rejected'
 */
export type OrderStatus =
	| "pending"
	| "processing"
	| "paid"
	| "shipped"
	| "delivered"
	| "completed"
	| "cancelled"
	| "rejected"
	| "ready_to_ship"
	| "in_transit"
	| "failed"
	| "returned";

export const isValidOrderStatus = (status: string): status is OrderStatus => {
	const validStatuses: OrderStatus[] = [
		"pending",
		"processing",
		"paid",
		"shipped",
		"delivered",
		"completed",
		"cancelled",
		"rejected",
	];
	return validStatuses.includes(status as OrderStatus);
};

export const getValidTransitions = (
	currentStatus: OrderStatus
): OrderStatus[] => {
	const transitions: Record<OrderStatus, OrderStatus[]> = {
		pending: ["processing", "cancelled", "rejected"],
		processing: ["shipped", "cancelled", "rejected"],
		paid: ["processing", "shipped", "cancelled", "rejected"],
		shipped: ["delivered", "cancelled"],
		delivered: ["completed"],
		completed: [],
		cancelled: [],
		rejected: [],
		ready_to_ship: [],
		in_transit: [],
		failed: [],
		returned: []
	};

	return transitions[currentStatus] || [];
};

// ✅ FUNCIÓN HELPER PARA VERIFICAR SI UNA TRANSICIÓN ES VÁLIDA
export const canTransitionTo = (
	currentStatus: OrderStatus,
	newStatus: OrderStatus
): boolean => {
	return getValidTransitions(currentStatus).includes(newStatus);
};

/**
 * Payment method type
 */
export type PaymentMethod =
	| "credit_card"
	| "paypal"
	| "transfer"
	| "datafast"
	| "deuna"
	| "other"
	| null;

/**
 * Payment status type
 */
export type PaymentStatus =
	| "pending"
	| "completed"
	| "failed"
	| "rejected"
	| null;

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