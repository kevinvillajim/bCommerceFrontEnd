// src/core/adapters/SellerOrderServiceAdapter.ts
import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import type {ServiceResponse} from "../../presentation/types/admin/ProductFilterParams";
import type {OrderStatus} from "../domain/entities/Order";

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
		name?: string;
		sku?: string;
		image?: string;
	}>;
	status: OrderStatus;
	paymentStatus: "pending" | "completed" | "failed" | "rejected";
	shippingAddress?: string;
}

export interface SellerOrderStatUI {
	label: string;
	value: number | string;
	isCurrency?: boolean;
	color: string;
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

			// Llamar a la API usando la ruta específica para vendedores
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDERS,
				apiFilters
			);

			console.log("SellerOrderServiceAdapter: Respuesta de la API:", response);

			// Verificar la estructura de la respuesta
			if (!response || response.success !== true) {
				throw new Error("Respuesta de API inválida");
			}

			// Mapear los datos a formato UI
			const orders: SellerOrderUI[] = Array.isArray(response.data)
				? response.data.map((order: any) => this.mapOrderToUI(order))
				: [];

			// Extraer información de paginación o usar valores predeterminados
			const pagination = response.pagination || {
				currentPage: 1,
				totalPages: 1,
				totalItems: orders.length,
				itemsPerPage: 10,
			};

			// Convertir todos los valores numéricos que podrían venir como strings
			const formattedPagination = {
				currentPage: Number(pagination.currentPage) || 1,
				totalPages: Number(pagination.totalPages) || 1,
				totalItems: Number(pagination.totalItems) || orders.length,
				itemsPerPage: Number(pagination.itemsPerPage) || 10,
			};

			return {
				orders,
				pagination: formattedPagination,
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
	 * Convierte un objeto de orden del API al formato UI
	 * @param order Objeto de orden del API
	 * @returns Objeto de orden con formato para UI
	 */
	private mapOrderToUI(order: any): SellerOrderUI {
		// Asegurar que el objeto order existe
		if (!order) {
			console.warn("SellerOrderServiceAdapter: Orden inválida recibida");
			return {
				id: "0",
				orderNumber: "N/A",
				date: new Date().toISOString(),
				customer: {
					id: 0,
					name: "Cliente",
					email: "sin@email.com",
				},
				total: 0,
				items: [],
				status: "pending",
				paymentStatus: "pending",
			};
		}

		// Extraer datos del usuario
		const userName = order.customer?.name || "Cliente";
		const userEmail = order.customer?.email || "sin@email.com";

		// Asegurar que items sea un array y mapear correctamente
		const items = Array.isArray(order.items) ? order.items.map((item: any) => ({
			id: item.id,
			product_id: item.product_id,
			quantity: Number(item.quantity) || 1,
			price: Number(item.price) || 0,
			subtotal: Number(item.subtotal) || 0,
			name: item.product?.name || item.product_name || `Producto ${item.product_id}`,
			sku: item.product?.sku || item.product_sku || `SKU-${item.product_id}`,
			image: item.product?.image || item.product_image || '/placeholder-product.jpg'
		})) : [];

		// Usar el total que viene del backend directamente
		const total = typeof order.total === "string" 
			? parseFloat(order.total) 
			: order.total || 0;

		return {
			id: String(order.id || 0),
			orderNumber: order.orderNumber || order.order_number || `#${order.id || 0}`,
			date: order.date || order.created_at || new Date().toISOString(),
			customer: {
				id: order.customer?.id || order.user_id || 0,
				name: userName,
				email: userEmail,
			},
			total: total,
			items: items,
			status: order.status || "pending",
			paymentStatus: order.paymentStatus || order.payment_status || "pending",
			shippingAddress:
				typeof order.shippingAddress === "string"
					? order.shippingAddress
					: JSON.stringify(order.shippingAddress || {}),
		};
	}

	/**
	 * Actualiza el estado de una orden
	 * @param orderId ID de la orden
	 * @param status Nuevo estado
	 * @returns Éxito de la operación
	 */
	public async updateOrderStatus(
		orderId: string,
		status: OrderStatus
	): Promise<boolean> {
		try {
			console.log(
				`SellerOrderServiceAdapter: Actualizando orden ${orderId} a estado ${status}`
			);

			// Usar el endpoint de actualización de estado según los endpoints reales
			const response = await ApiClient.patch<ServiceResponse>(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(Number(orderId)),
				{
					status,
				}
			);

			// Verificar con campo 'success' en la respuesta
			if (!response || response.success !== true) {
				console.error(
					`Error al actualizar estado: Respuesta inválida`,
					response
				);
				return false;
			}

			console.log(
				`Estado de orden actualizado correctamente:`,
				response.data || response.message
			);

			return true;
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

			// Usar el endpoint específico para estadísticas de vendedor
			const response = await ApiClient.get<any>(API_ENDPOINTS.ORDERS.STATS);

			console.log(
				"SellerOrderServiceAdapter: Respuesta de estadísticas:",
				response
			);

			// Verificar con campo 'success' en lugar de 'status'
			if (!response || response.success !== true) {
				throw new Error("Respuesta de API inválida para estadísticas");
			}

			const data = response.data || {};

			// Mapear los datos a estadísticas para UI
			const stats: SellerOrderStatUI[] = [
				{
					label: "Total Pedidos",
					value: Number(data.totalOrders) || 0,
					color: "blue",
				},
				{
					label: "Pendientes",
					value: Number(data.pendingOrders) || 0,
					color: "yellow",
				},
				{
					label: "En Proceso",
					value: Number(data.processingOrders) || 0,
					color: "blue",
				},
				{
					label: "Enviados",
					value: Number(data.shippedOrders) || 0,
					color: "indigo",
				},
				{
					label: "Total Ventas",
					value: Number(data.totalSales) || 0,
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

	/**
	 * Obtiene los detalles de una orden específica como vendedor
	 * CORREGIDO: Se adapta exactamente a la respuesta del backend
	 */
	async getOrderDetails(orderId: string | number): Promise<any> {
		try {
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;

			console.log(
				`SellerOrderServiceAdapter: Obteniendo detalle de orden ${id} como vendedor`
			);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ORDERS.SELLER_ORDER_DETAILS(id)
			);

			console.log(
				`SellerOrderServiceAdapter: Respuesta para orden ${id}:`,
				response
			);

			if (!response || !response.data) {
				throw new Error("Respuesta vacía al obtener detalle de orden");
			}

			const orderData = response.data;

			// SIMPLIFICADO: Usar los datos tal como vienen del backend
			// Mapear solo los campos necesarios sin cambiar la estructura
			const orderDetail = {
				// Datos básicos de la orden
				id: orderData.id,
				orderNumber: orderData.orderNumber || orderData.order_number || `#${orderData.id}`,
				orderDate: orderData.orderDate || orderData.order_date || orderData.date,
				status: orderData.status,
				total: Number(orderData.total) || 0,
				
				// Items de la orden
				items: Array.isArray(orderData.items) ? orderData.items.map((item: any) => ({
					id: item.id,
					product_id: item.product_id,
					product_name: item.product_name || `Producto ${item.product_id}`,
					quantity: Number(item.quantity) || 1,
					unit_price: Number(item.unit_price) || 0,
					total_price: Number(item.total_price) || 0,
					original_unit_price: Number(item.original_unit_price) || 0,
					price: Number(item.unit_price) || 0, // Para compatibilidad
					subtotal: Number(item.total_price) || 0, // Para compatibilidad
					product_image: item.product_image || '/placeholder-product.jpg',
					product_slug: item.product_slug || null,
					
					// ✅ DATOS ESPECÍFICOS DEL SELLER
					seller_discount_percentage: Number(item.seller_discount_percentage) || 0,
					seller_discount_amount: Number(item.seller_discount_amount) || 0,
					platform_commission_rate: Number(item.platform_commission_rate) || 0,
					platform_commission_amount: Number(item.platform_commission_amount) || 0,
					seller_net_earning_from_products: Number(item.seller_net_earning_from_products) || 0,
					volume_discount_percentage: Number(item.volume_discount_percentage) || 0,
					has_volume_discount: Boolean(item.has_volume_discount) || false
				})) : [],

				// Datos del cliente
				customer: orderData.customer || {
					id: orderData.user_id || 0,
					name: "Cliente",
					email: "sin@email.com"
				},

				// Datos de envío
				shippingData: orderData.shippingData || orderData.shipping_data || {},
				shipping: orderData.shipping || null,

				// Datos de pago - CORREGIDO para usar la estructura del backend
				payment: orderData.payment || {
					method: "Tarjeta de crédito",
					status: "completed",
					payment_id: null
				},

				// Campos adicionales para compatibilidad
				paymentMethod: orderData.payment?.method || "Tarjeta de crédito",
				paymentStatus: orderData.payment?.status || "completed",
				paymentId: orderData.payment?.payment_id || null,
				
				// Fechas
				createdAt: orderData.orderDate || orderData.order_date || orderData.date,
				updatedAt: orderData.updated_at || orderData.orderDate,

				// Dirección de envío formateada
				shippingAddress: this.formatShippingAddress(orderData),

				// ✅ DATOS CRÍTICOS DEL SELLER - order_summary del backend
				orderSummary: orderData.order_summary || {}
			};

			console.log("Orden adaptada para UI de vendedor:", orderDetail);
			return orderDetail;

		} catch (error) {
			console.error(
				`SellerOrderServiceAdapter: Error al obtener detalle de orden ${orderId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Formatea la dirección de envío desde los datos de la orden
	 */
	private formatShippingAddress(orderData: any): string {
		// Intentar diferentes ubicaciones de los datos de envío
		const shippingData = orderData.shippingData || orderData.shipping_data || {};
		
		if (typeof shippingData === 'string') {
			try {
				const parsed = JSON.parse(shippingData);
				const parts = [
					parsed.address,
					parsed.city,
					parsed.state || parsed.province,
					parsed.country,
					parsed.postal_code
				].filter(Boolean);
				
				return parts.length > 0 ? parts.join(', ') : 'Dirección no disponible';
			} catch (e) {
				return shippingData;
			}
		}
		
		if (shippingData && typeof shippingData === 'object') {
			const parts = [
				shippingData.address,
				shippingData.city,
				shippingData.state || shippingData.province,
				shippingData.country,
				shippingData.postal_code
			].filter(Boolean);
			
			return parts.length > 0 ? parts.join(', ') : 'Dirección no disponible';
		}
		
		return 'Dirección no disponible';
	}

	/**
	 * Completa una orden específica
	 */
	async completeOrder(orderId: string | number): Promise<boolean> {
		try {
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;

			console.log(`SellerOrderServiceAdapter: Completando orden ${id}`);

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ORDERS.COMPLETE(id)
			);

			console.log(`Respuesta al completar orden ${id}:`, response);

			return response && response.success === true;
		} catch (error) {
			console.error(
				`SellerOrderServiceAdapter: Error al completar orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Actualiza la información de envío de una orden
	 */
	async updateShippingInfo(
		orderId: string | number,
		shippingInfo: {
			tracking_number?: string;
			shipping_company?: string;
			estimated_delivery?: string;
			notes?: string;
		}
	): Promise<boolean> {
		try {
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;

			console.log(
				`SellerOrderServiceAdapter: Actualizando información de envío para orden ${id}`
			);

			const response = await ApiClient.patch<any>(
				API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(id),
				shippingInfo
			);

			console.log(`Respuesta al actualizar información de envío:`, response);

			return response && response.success === true;
		} catch (error) {
			console.error(
				`SellerOrderServiceAdapter: Error al actualizar información de envío para orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Crea información de envío para una orden
	 */
	async createShipping(
		orderId: string | number,
		shippingData: {
			tracking_number: string;
			shipping_company?: string;
			estimated_delivery?: string;
			notes?: string;
		}
	): Promise<boolean> {
		try {
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;

			console.log(
				`SellerOrderServiceAdapter: Creando información de envío para orden ${id}`
			);

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(id),
				{
					...shippingData,
					status: 'shipped'
				}
			);

			console.log(`Respuesta al crear información de envío:`, response);

			return response && response.success === true;
		} catch (error) {
			console.error(
				`SellerOrderServiceAdapter: Error al crear información de envío para orden ${orderId}:`,
				error
			);
			return false;
		}
	}
}