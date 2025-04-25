// src/core/adapters/ShippingServiceAdapter.ts
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

export interface ShippingFormData {
	tracking_number?: string;
	shipping_company?: string;
	estimated_delivery?: string;
	notes?: string;
}

/**
 * Adaptador para gestionar envíos
 */
export class ShippingServiceAdapter {
	/**
	 * Crea o actualiza la información de envío para una orden
	 * @param orderId ID de la orden
	 * @param shippingData Datos del envío
	 * @returns true si la operación tuvo éxito, false en caso contrario
	 */
	public async updateShippingInfo(
		orderId: string | number,
		shippingData: ShippingFormData
	): Promise<boolean> {
		try {
			console.log(
				`ShippingServiceAdapter: Actualizando información de envío para orden ${orderId}`,
				shippingData
			);

			// Convertir orderId a número si es string
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;

			// Realizar la petición PATCH para actualizar la información de envío
			const response = await ApiClient.patch(
				API_ENDPOINTS.ORDERS.UPDATE_SHIPPING(id),
				shippingData
			);

			console.log(
				`ShippingServiceAdapter: Respuesta de actualización de envío:`,
				response
			);

			// Verificar respuesta con el campo 'success'
			if (!response || response.success !== true) {
				console.error(
					"Error en la respuesta al actualizar información de envío:",
					response
				);
				return false;
			}

			return true;
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al actualizar información de envío para orden ${orderId}:`,
				error
			);
			return false;
		}
	}

	/**
	 * Marca una orden como enviada y establece la información de envío
	 * @param orderId ID de la orden
	 * @param shippingData Datos del envío
	 * @returns true si la operación tuvo éxito, false en caso contrario
	 */
	public async markAsShipped(
		orderId: string | number,
		shippingData: ShippingFormData
	): Promise<boolean> {
		try {
			console.log(
				`ShippingServiceAdapter: Marcando orden ${orderId} como enviada`,
				shippingData
			);

			// Paso 1: Actualizar los datos de envío
			const shippingUpdated = await this.updateShippingInfo(
				orderId,
				shippingData
			);

			if (!shippingUpdated) {
				console.error("Error al actualizar información de envío");
				return false;
			}

			// Paso 2: Actualizar el estado a "shipped"
			const id = typeof orderId === "string" ? parseInt(orderId) : orderId;
			const response = await ApiClient.put(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
				{status: "shipped"}
			);

			console.log(
				`ShippingServiceAdapter: Respuesta al actualizar estado:`,
				response
			);

			// Verificar respuesta
			if (!response || response.success !== true) {
				console.error(
					"Error en la respuesta al actualizar estado de envío:",
					response
				);
				return false;
			}

			return true;
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al marcar orden ${orderId} como enviada:`,
				error
			);
			return false;
		}
	}

	/**
	 * Obtiene la información de envío de una orden
	 * @param trackingNumber Número de seguimiento
	 * @returns Información de envío
	 */
	public async getShippingInfo(trackingNumber: string): Promise<any> {
		try {
			console.log(
				`ShippingServiceAdapter: Obteniendo información de envío para ${trackingNumber}`
			);

			const response = await ApiClient.get(
				API_ENDPOINTS.SHIPPING.TRACK(trackingNumber)
			);

			if (!response) {
				throw new Error("No se pudo obtener información del envío");
			}

			return response.data || response;
		} catch (error) {
			console.error(
				`ShippingServiceAdapter: Error al obtener información de envío ${trackingNumber}:`,
				error
			);
			throw error;
		}
	}
}

export default ShippingServiceAdapter;
