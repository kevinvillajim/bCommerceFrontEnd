// Interfaces actualizadas para OrderServiceAdapter.ts
import {OrderService} from "../services/OrderService";
import {GetSellerOrdersUseCase} from "../useCases/order/GetSellerOrdersUseCase";
import {GetOrderStatsUseCase} from "../useCases/order/GetOrderStatsUseCase";
import {UpdateOrderStatusUseCase} from "../useCases/order/UpdateOrderStatusUseCase";
import type {OrderStatus} from "../domain/entities/Order";
import {GetUserOrdersUseCase} from "../useCases/order/GetUserOrdersUseCase";

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
