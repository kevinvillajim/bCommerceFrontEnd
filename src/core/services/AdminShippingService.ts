import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import AdminShippingAdapter from "../adapters/AdminShippingAdapter";
import type {
	AdminShippingModel,
	AdminTrackingEvent,
} from "../adapters/AdminShippingAdapter";

export interface AdminShippingFilters {
	status?: string;
	carrier?: string;
	date_from?: string;
	date_to?: string;
	search?: string;
	page?: number;
	limit?: number;
}

export interface AdminShippingResponse {
	data: AdminShippingModel[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

export class AdminShippingService {
	/**
	 * Obtener listado de envíos para administración
	 */
	async getAdminShippings(
		filters: AdminShippingFilters = {}
	): Promise<AdminShippingResponse> {
		try {
			const response = await ApiClient.get(API_ENDPOINTS.ADMIN.SHIPPING_LIST, filters);

			// En caso de que el backend devuelva directamente los datos sin formato
			if (response && !response.data && Array.isArray(response)) {
				const shippings =
					AdminShippingAdapter.convertToAdminModelList(response);

				return {
					data: shippings,
					pagination: {
						currentPage: filters.page || 1,
						totalPages: 1,
						totalItems: shippings.length,
						itemsPerPage: filters.limit || 10,
					},
				};
			}

			// Formato normal de respuesta
			const data = response.data || [];
			const shippings = AdminShippingAdapter.convertToAdminModelList(
				Array.isArray(data) ? data : data.data || []
			);

			const pagination = response.meta || response.pagination || {};

			return {
				data: shippings,
				pagination: {
					currentPage: pagination.current_page || 1,
					totalPages: pagination.last_page || 1,
					totalItems: pagination.total || shippings.length,
					itemsPerPage: pagination.per_page || 10,
				},
			};
		} catch (error) {
			console.error("Error al obtener envíos para administración:", error);
			throw error;
		}
	}

	/**
	 * Obtener detalles de un envío para administración
	 */
	async getAdminShippingDetail(id: number): Promise<AdminShippingModel | null> {
		try {
			const response = await ApiClient.get(API_ENDPOINTS.ADMIN.SHIPPING_DETAIL(id));

			if (!response) {
				return null;
			}

			// Si la respuesta tiene un formato data.data, manejarlo
			const data = response.data ? response.data : response;

			return AdminShippingAdapter.convertToAdminModel(data);
		} catch (error) {
			console.error(`Error al obtener detalles del envío ${id}:`, error);
			return null;
		}
	}

	/**
	 * Obtener historial de un envío por número de tracking
	 */
	async getAdminShippingHistory(
		trackingNumber: string
	): Promise<AdminTrackingEvent[]> {
		try {
			const response = await ApiClient.get(
				API_ENDPOINTS.ADMIN.SHIPPING_HISTORY(trackingNumber)
			);

			if (!response || !response.data || !response.data.history) {
				return [];
			}

			return response.data.history.map((item: any, index: number) => ({
				id: item.id || index + 1,
				status: item.status || "",
				location:
					typeof item.location === "object"
						? item.location.address
						: item.location || "",
				timestamp: item.timestamp || "",
				description: item.details || item.description || "",
			}));
		} catch (error) {
			console.error(
				`Error al obtener historial del envío ${trackingNumber}:`,
				error
			);
			return [];
		}
	}

	/**
	 * Actualizar estado de un envío
	 */
	async updateAdminShippingStatus(
		trackingNumber: string,
		status: string
	): Promise<boolean> {
		try {
			const response = await ApiClient.put(
				API_ENDPOINTS.ADMIN.UPDATE_SHIPPING_STATUS(trackingNumber),
				{status}
			);

			return (
				response && (response.status === "success" || response.success === true)
			);
		} catch (error) {
			console.error(
				`Error al actualizar estado del envío ${trackingNumber}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Simular eventos de envío para pruebas
	 */
	async simulateAdminShippingEvents(
		trackingNumber: string,
		days: number = 5
	): Promise<boolean> {
		try {
			const response = await ApiClient.post(
				API_ENDPOINTS.ADMIN.SIMULATE_SHIPPING(trackingNumber),
				{days}
			);

			return (
				response && (response.status === "success" || response.success === true)
			);
		} catch (error) {
			console.error(
				`Error al simular eventos de envío ${trackingNumber}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Enviar notificación de seguimiento
	 */
	async sendAdminTrackingNotification(
		trackingNumber: string
	): Promise<boolean> {
		try {
			const response = await ApiClient.post(
				API_ENDPOINTS.ADMIN.SHIPPING_SEND_NOTIFICATION(trackingNumber),
				{}
			);

			return (
				response && (response.status === "success" || response.success === true)
			);
		} catch (error) {
			console.error(
				`Error al enviar notificación de seguimiento ${trackingNumber}:`,
				error
			);
			throw error;
		}
	}
}

export default AdminShippingService;
