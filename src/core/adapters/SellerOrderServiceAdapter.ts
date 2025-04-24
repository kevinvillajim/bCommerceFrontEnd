// src/core/adapters/SellerOrderServiceAdapter.ts
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
// Remover imports no utilizados
import type {ReactNode} from "react";

/**
 * Interfaces específicas para la gestión de órdenes del vendedor
 */
export interface SellerOrderUI {
	id: string;
	orderNumber: string;
	date: string;
	customer: {
		id: number;
		name: string;
		email: string;
	};
	total: number;
	items: Array<{
		id: number;
		productId: number;
		name: string;
		quantity: number;
		price: number;
		subtotal: number;
	}>;
	status:
		| "pending"
		| "processing"
		| "paid"
		| "shipped"
		| "delivered"
		| "completed"
		| "cancelled";
	paymentStatus: "pending" | "completed" | "rejected" | "failed" | "paid";
	shippingAddress?: string;
}

export interface SellerOrderStatUI {
	label: string;
	value: number | string;
	icon?: ReactNode;
	color: string; // Quitamos undefined para compatibilidad con OrderStatUI
	isCurrency?: boolean;
}

export interface SellerOrderPagination {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

export interface SellerOrdersResponse {
	orders: SellerOrderUI[];
	pagination: SellerOrderPagination;
}

// Interfaces para respuestas de API
interface ApiOrderResponse {
	success: boolean;
	message?: string;
	data: Array<{
		id: number;
		order_number?: string;
		orderNumber?: string;
		date?: string;
		created_at?: string;
		user_id?: number;
		userId?: number;
		customer?: {
			name: string;
			email: string;
		};
		user_name?: string;
		user_email?: string;
		total: number;
		items?: Array<{
			id: number;
			product_id: number;
			product_name?: string;
			quantity: number;
			price: number;
			subtotal: number;
		}>;
		status: string;
		payment_status?: string;
		paymentStatus?: string;
		shipping_data?: any;
	}>;
	pagination?: {
		totalItems?: number;
		totalPages?: number;
		currentPage?: number;
		itemsPerPage?: number;
	};
}

interface ApiStatsResponse {
	success: boolean;
	message?: string;
	data: {
		totalOrders?: number;
		pendingOrders?: number;
		processingOrders?: number;
		shippedOrders?: number;
		deliveredOrders?: number;
		completedOrders?: number;
		cancelledOrders?: number;
		totalSales?: number;
	};
}

interface ApiUpdateResponse {
	success: boolean;
	message?: string;
}

/**
 * Adaptador específico para las órdenes del vendedor
 * Mantiene separada la lógica de obtención y formateo de datos
 */
export class SellerOrderServiceAdapter {
	/**
	 * Obtiene las órdenes del vendedor con filtros
	 */
	async getSellerOrders(filters?: {
		status?: string;
		paymentStatus?: string;
		dateFrom?: string;
		dateTo?: string;
		search?: string;
		page?: number;
		limit?: number;
	}): Promise<SellerOrdersResponse> {
		try {
			console.log(
				"SellerOrderServiceAdapter: Obteniendo órdenes con filtros:",
				filters
			);

			// Preparar parámetros para la API
			const apiParams: Record<string, any> = {
				limit: filters?.limit || 10,
				offset: filters?.page ? (filters.page - 1) * (filters?.limit || 10) : 0,
			};

			// Añadir filtros si existen
			if (filters?.status && filters.status !== "all") {
				apiParams.status = filters.status;
			}

			if (filters?.paymentStatus && filters.paymentStatus !== "all") {
				apiParams.payment_status = filters.paymentStatus;
			}

			if (filters?.dateFrom) {
				apiParams.date_from = filters.dateFrom;
			}

			if (filters?.dateTo) {
				apiParams.date_to = filters.dateTo;
			}

			if (filters?.search) {
				apiParams.search = filters.search;
			}

			// Realizar la llamada a la API
			const response = await ApiClient.get<ApiOrderResponse>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				apiParams
			);

			console.log("SellerOrderServiceAdapter: Respuesta de API:", response);

			// Verificar si la respuesta es válida
			if (!response || response.success === false) {
				throw new Error(response?.message || "Error al obtener órdenes");
			}

			// Convertir la respuesta de la API a nuestro formato de UI
			const orders: SellerOrderUI[] = (response.data || []).map((order) => ({
				id: order.id.toString(),
				orderNumber:
					order.order_number || order.orderNumber || `ORD-${order.id}`,
				date: order.date || order.created_at || new Date().toISOString(),
				customer: {
					id: order.user_id || order.userId || 0,
					name: order.customer?.name || order.user_name || "Cliente",
					email: order.customer?.email || order.user_email || "",
				},
				total: parseFloat(order.total.toString()),
				items: Array.isArray(order.items)
					? order.items.map((item) => ({
							id: item.id,
							productId: item.product_id,
							name: item.product_name || "Producto",
							quantity: item.quantity,
							price: item.price,
							subtotal: item.subtotal,
						}))
					: [],
				status: (order.status || "pending") as SellerOrderUI["status"],
				paymentStatus: (order.payment_status ||
					order.paymentStatus ||
					"pending") as SellerOrderUI["paymentStatus"],
				shippingAddress: order.shipping_data
					? JSON.stringify(order.shipping_data)
					: undefined,
			}));

			// Crear objeto de paginación
			const pagination: SellerOrderPagination = {
				currentPage: filters?.page || 1,
				totalPages:
					response.pagination?.totalPages ||
					Math.ceil(
						(response.pagination?.totalItems || orders.length) /
							(filters?.limit || 10)
					),
				totalItems: response.pagination?.totalItems || orders.length,
				itemsPerPage: filters?.limit || 10,
			};

			return {
				orders,
				pagination,
			};
		} catch (error) {
			console.error(
				"SellerOrderServiceAdapter: Error al obtener órdenes:",
				error
			);

			// Devolver una respuesta vacía en caso de error
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
	 * Obtiene estadísticas de órdenes para el vendedor
	 */
	async getOrderStats(): Promise<SellerOrderStatUI[]> {
		try {
			console.log("SellerOrderServiceAdapter: Obteniendo estadísticas");

			// Llamar al endpoint de estadísticas
			const response = await ApiClient.get<ApiStatsResponse>(
				API_ENDPOINTS.ORDERS.STATS
			);

			console.log(
				"SellerOrderServiceAdapter: Respuesta de estadísticas:",
				response
			);

			if (!response || response.success === false) {
				throw new Error(response?.message || "Error al obtener estadísticas");
			}

			const statsData = response.data || {};

			// Transformar los datos a nuestro formato de UI
			const stats: SellerOrderStatUI[] = [
				{
					label: "Total Pedidos",
					value: statsData.totalOrders || 0,
					color: "blue",
					isCurrency: false,
				},
				{
					label: "Pendientes",
					value: statsData.pendingOrders || 0,
					color: "yellow",
					isCurrency: false,
				},
				{
					label: "En Proceso",
					value: statsData.processingOrders || 0,
					color: "purple",
					isCurrency: false,
				},
				{
					label: "Enviados",
					value: statsData.shippedOrders || 0,
					color: "indigo",
					isCurrency: false,
				},
				{
					label: "Total Ventas",
					value: statsData.totalSales || 0,
					color: "green",
					isCurrency: true,
				},
			];

			return stats;
		} catch (error) {
			console.error(
				"SellerOrderServiceAdapter: Error al obtener estadísticas:",
				error
			);

			// Devolver estadísticas vacías en caso de error
			return [
				{
					label: "Total Pedidos",
					value: 0,
					color: "blue",
					isCurrency: false,
				},
				{
					label: "Pendientes",
					value: 0,
					color: "yellow",
					isCurrency: false,
				},
				{
					label: "En Proceso",
					value: 0,
					color: "purple",
					isCurrency: false,
				},
				{
					label: "Enviados",
					value: 0,
					color: "indigo",
					isCurrency: false,
				},
				{
					label: "Total Ventas",
					value: 0,
					color: "green",
					isCurrency: true,
				},
			];
		}
	}

	/**
	 * Actualiza el estado de una orden
	 */
	async updateOrderStatus(
		orderId: string,
		newStatus: SellerOrderUI["status"]
	): Promise<boolean> {
		try {
			console.log(
				`SellerOrderServiceAdapter: Actualizando estado de orden ${orderId} a ${newStatus}`
			);

			const response = await ApiClient.put<ApiUpdateResponse>(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(parseInt(orderId)),
				{status: newStatus}
			);

			console.log(
				"SellerOrderServiceAdapter: Respuesta de actualización:",
				response
			);

			return response && response.success === true;
		} catch (error) {
			console.error(
				`SellerOrderServiceAdapter: Error al actualizar estado de orden ${orderId}:`,
				error
			);
			return false;
		}
	}
}

export default SellerOrderServiceAdapter;
