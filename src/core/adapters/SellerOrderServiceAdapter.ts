// src/core/adapters/SellerOrderServiceAdapter.ts
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

// Definición de interfaces para los datos de la UI
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
		product_id: number;
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
	paymentStatus: "pending" | "completed" | "failed" | "rejected";
}

export interface SellerOrderStatUI {
	label: string;
	value: number | string;
	isCurrency?: boolean;
	color?: string;
	icon?: React.ReactNode;
}

// Definición de interfaces para filtros de búsqueda
export interface SellerOrderFilters {
	page?: number;
	limit?: number;
	status?: string;
	paymentStatus?: string;
	search?: string;
	dateFrom?: string;
	dateTo?: string;
}

/**
 * Adaptador de servicio para gestionar órdenes del vendedor
 * Convierte los datos de la API a formato amigable para la UI
 */
export default class SellerOrderServiceAdapter {
	/**
	 * Obtiene las órdenes del vendedor con filtros aplicados
	 * @param filters Filtros para la búsqueda de órdenes
	 * @returns Órdenes formateadas y datos de paginación
	 */
	public async getSellerOrders(filters: SellerOrderFilters = {}) {
		try {
			console.log(
				"SellerOrderServiceAdapter: Obteniendo órdenes con filtros:",
				filters
			);

			// Formatear los parámetros para la API
			const apiFilters: any = {
				limit: filters.limit || 10,
				page: filters.page || 1,
			};

			// Añadir filtros opcionales si están presentes
			if (filters.status && filters.status !== "all") {
				apiFilters.status = filters.status;
			}

			if (filters.paymentStatus && filters.paymentStatus !== "all") {
				apiFilters.payment_status = filters.paymentStatus;
			}

			if (filters.search) {
				apiFilters.search = filters.search;
			}

			if (filters.dateFrom) {
				apiFilters.date_from = filters.dateFrom;
			}

			if (filters.dateTo) {
				apiFilters.date_to = filters.dateTo;
			}

			// Llamar a la API usando la nueva ruta específica para vendedores
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				apiFilters
			);

			console.log("SellerOrderServiceAdapter: Respuesta de la API:", response);

			// Verificar la estructura de la respuesta
			if (!response || !response.status || response.status !== "success") {
				throw new Error("Respuesta de API inválida");
			}

			// Mapear los datos a formato UI
			const orders: SellerOrderUI[] = response.data.map((order: any) => ({
				id: String(order.id),
				orderNumber: order.orderNumber || `#${order.id}`,
				date: order.date || order.created_at || new Date().toISOString(),
				customer: {
					id: order.customer?.id || order.user_id || 0,
					name: order.customer?.name || "Cliente",
					email: order.customer?.email || "sin@email.com",
				},
				total: parseFloat(order.total) || 0,
				items: Array.isArray(order.items) ? order.items : [],
				status: order.status || "pending",
				paymentStatus: order.paymentStatus || order.payment_status || "pending",
			}));

			// Extraer información de paginación
			const pagination = response.pagination || {
				currentPage: 1,
				totalPages: 1,
				totalItems: orders.length,
				itemsPerPage: 10,
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

			// Devolver un valor predeterminado en caso de error
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
	 * Actualiza el estado de una orden
	 * @param orderId ID de la orden
	 * @param status Nuevo estado
	 * @returns Éxito de la operación
	 */
	public async updateOrderStatus(
		orderId: string,
		status: SellerOrderUI["status"]
	): Promise<boolean> {
		try {
			console.log(
				`SellerOrderServiceAdapter: Actualizando orden ${orderId} a estado ${status}`
			);

			const response = await ApiClient.put(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(Number(orderId)),
				{
					status,
				}
			);

			return response && response.status === "success";
		} catch (error) {
			console.error(
				`SellerOrderServiceAdapter: Error al actualizar estado de orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Obtiene estadísticas de pedidos del vendedor
	 * @returns Estadísticas formateadas para la UI
	 */
	public async getOrderStats(): Promise<SellerOrderStatUI[]> {
		try {
			console.log(
				"SellerOrderServiceAdapter: Obteniendo estadísticas de órdenes"
			);

			// Llamar a la API usando la nueva ruta específica para estadísticas de vendedor
			const response = await ApiClient.get<any>(API_ENDPOINTS.ORDERS.STATS);

			console.log(
				"SellerOrderServiceAdapter: Respuesta de estadísticas:",
				response
			);

			if (!response || !response.status || response.status !== "success") {
				throw new Error("Respuesta de API inválida para estadísticas");
			}

			const data = response.data;

			// Mapear los datos a estadísticas para UI
			const stats: SellerOrderStatUI[] = [
				{
					label: "Total Pedidos",
					value: data.totalOrders || 0,
					color: "blue",
				},
				{
					label: "Pendientes",
					value: data.pendingOrders || 0,
					color: "yellow",
				},
				{
					label: "En Proceso",
					value: data.processingOrders || 0,
					color: "blue",
				},
				{
					label: "Enviados",
					value: data.shippedOrders || 0,
					color: "indigo",
				},
				{
					label: "Total Ventas",
					value: data.totalSales || 0,
					isCurrency: true,
					color: "green",
				},
			];

			return stats;
		} catch (error) {
			console.error(
				"SellerOrderServiceAdapter: Error al obtener estadísticas:",
				error
			);

			// Devolver estadísticas básicas en caso de error
			return [
				{
					label: "Total Pedidos",
					value: 0,
					color: "blue",
				},
				{
					label: "Pendientes",
					value: 0,
					color: "yellow",
				},
				{
					label: "En Proceso",
					value: 0,
					color: "blue",
				},
				{
					label: "Total Ventas",
					value: 0,
					isCurrency: true,
					color: "green",
				},
			];
		}
	}
}
