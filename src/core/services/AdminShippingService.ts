// src/core/services/AdminShippingService.ts
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import AdminShippingAdapter from "../adapters/AdminShippingAdapter";
import type {
	AdminShippingModel,
	AdminTrackingEvent,
} from "../adapters/AdminShippingAdapter";

export interface ShippingFilters {
	status?: string;
	carrier?: string;
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	limit?: number;
	search?: string;
}

/**
 * Servicio para administrar envíos desde el panel de administración
 */
export class AdminShippingService {
	/**
	 * Obtiene la lista de envíos con filtros opcionales
	 */
	async getShippings(filters: ShippingFilters = {}) {
		try {
			console.log(
				"AdminShippingService: Obteniendo envíos con filtros:",
				filters
			);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.ADMIN.SHIPPING_LIST,
				filters
			);

			if (!response) {
				throw new Error("No se recibió respuesta del servidor");
			}

			const shippingsList = Array.isArray(response.data)
				? AdminShippingAdapter.convertToAdminModelList(response.data)
				: [];

			const pagination = response.pagination || {
				currentPage: 1,
				totalPages: 1,
				totalItems: shippingsList.length,
				itemsPerPage: 10,
			};

			return {
				shippings: shippingsList,
				pagination: {
					currentPage: Number(pagination.currentPage) || 1,
					totalPages: Number(pagination.totalPages) || 1,
					totalItems: Number(pagination.totalItems) || shippingsList.length,
					itemsPerPage: Number(pagination.itemsPerPage) || 10,
				},
			};
		} catch (error) {
			console.error("AdminShippingService: Error al obtener envíos:", error);
			throw error;
		}
	}

	/**
	 * Obtiene los detalles de un envío específico
	 */
	async getShippingDetail(trackingNumber: string): Promise<AdminShippingModel> {
		try {
			console.log(
				`AdminShippingService: Obteniendo detalles de envío ${trackingNumber}`
			);

			const response = await ApiClient.get<any>(
				`${API_ENDPOINTS.SHIPPING.TRACK(trackingNumber)}`
			);

			if (!response || !response.data) {
				throw new Error("No se pudo obtener los detalles del envío");
			}

			// Convertir los datos del backend al modelo de administración
			return AdminShippingAdapter.convertToAdminModel(response.data);
		} catch (error) {
			console.error(
				`AdminShippingService: Error al obtener detalles de envío ${trackingNumber}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Obtiene el historial de un envío
	 */
	async getShippingHistory(
		trackingNumber: string
	): Promise<AdminTrackingEvent[]> {
		try {
			console.log(
				`AdminShippingService: Obteniendo historial de envío ${trackingNumber}`
			);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.SHIPPING.HISTORY(trackingNumber)
			);

			if (!response || !response.data) {
				return [];
			}

			// Mapear los eventos del historial al formato esperado
			const events = Array.isArray(response.data)
				? response.data.map((item: any, index: number) => ({
						id: item.id || index + 1,
						status: item.status || "",
						location:
							typeof item.location === "object"
								? item.location.address || ""
								: item.location || "",
						timestamp: item.timestamp || "",
						description: item.details || item.description || "",
					}))
				: [];

			return events;
		} catch (error) {
			console.error(
				`AdminShippingService: Error al obtener historial de envío ${trackingNumber}:`,
				error
			);
			return [];
		}
	}

	/**
	 * Actualiza el estado de un envío
	 */
	async updateShippingStatus(
		trackingNumber: string,
		status: string
	): Promise<boolean> {
		try {
			console.log(
				`AdminShippingService: Actualizando estado de envío ${trackingNumber} a ${status}`
			);

			const response = await ApiClient.put<any>(
				API_ENDPOINTS.ADMIN.UPDATE_SHIPPING_STATUS(trackingNumber),
				{status}
			);

			return !!(
				response &&
				(response.success === true || response.status === "success")
			);
		} catch (error) {
			console.error(
				`AdminShippingService: Error al actualizar estado de envío ${trackingNumber}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Avanza al siguiente estado de un envío
	 */
	async advanceShippingStatus(
		trackingNumber: string,
		currentStatus: string
	): Promise<boolean> {
		try {
			console.log(
				`AdminShippingService: Avanzando estado de envío ${trackingNumber}`
			);

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ADMIN.SIMULATE_SHIPPING(trackingNumber),
				{action: "advance_status"}
			);

			return !!(
				response &&
				(response.success === true || response.status === "success")
			);
		} catch (error) {
			console.error(
				`AdminShippingService: Error al avanzar estado de envío ${trackingNumber}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Envía una notificación de seguimiento al cliente
	 */
	async sendTrackingNotification(trackingNumber: string): Promise<boolean> {
		try {
			console.log(
				`AdminShippingService: Enviando notificación para envío ${trackingNumber}`
			);

			const response = await ApiClient.post<any>(
				API_ENDPOINTS.ADMIN.SHIPPING_SEND_NOTIFICATION(trackingNumber),
				{}
			);

			return !!(
				response &&
				(response.success === true || response.status === "success")
			);
		} catch (error) {
			console.error(
				`AdminShippingService: Error al enviar notificación de envío ${trackingNumber}:`,
				error
			);
			throw error;
		}
	}
}

export default AdminShippingService;
