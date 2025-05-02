export interface AdminShippingModel {
	id: number;
	trackingNumber: string;
	orderId: number;
	orderNumber: string;
	userId: number;
	customerName: string;
	status: string;
	carrier: string;
	estimatedDeliveryDate?: string;
	shippedDate?: string;
	deliveredDate?: string;
	address: {
		street: string;
		city: string;
		state: string;
		country: string;
		postalCode: string;
		phone: string;
	};
	weight?: number;
	dimensions?: string;
	trackingHistory: AdminTrackingEvent[];
	createdAt: string;
	updatedAt: string;
}

export interface AdminTrackingEvent {
	id: number;
	status: string;
	location: string;
	timestamp: string;
	description: string;
}

export class AdminShippingAdapter {
	/**
	 * Convierte datos del backend al formato de administración
	 */
	static convertToAdminModel(backendData: any): AdminShippingModel {
		// Mapeo de historial
		const trackingHistory: AdminTrackingEvent[] = [];

		if (backendData.history && Array.isArray(backendData.history)) {
			backendData.history.forEach((item: any, index: number) => {
				trackingHistory.push({
					id: item.id || index + 1,
					status: item.status || "",
					location:
						typeof item.location === "object"
							? item.location.address || ""
							: item.location || "",
					timestamp: item.timestamp || "",
					description: item.details || item.description || "",
				});
			});
		}

		// Extraer datos de dirección desde shipping_data
		const shippingData = backendData.shipping_data || {};

		return {
			id: backendData.id,
			trackingNumber: backendData.tracking_number,
			orderId: backendData.order_id,
			orderNumber: backendData.order_number || `ORD-${backendData.order_id}`,
			userId: backendData.user_id || 0,
			customerName: backendData.user_name || "Cliente",
			status: backendData.status,
			carrier: backendData.carrier_name || "Transportista por defecto",
			estimatedDeliveryDate: backendData.estimated_delivery,
			shippedDate: backendData.shipped_date || null,
			deliveredDate: backendData.delivered_at,
			address: {
				street: shippingData.address || "",
				city: shippingData.city || "",
				state: shippingData.state || "",
				country: shippingData.country || "",
				postalCode: shippingData.postal_code || "",
				phone: shippingData.phone || "",
			},
			weight: shippingData.weight || 0,
			dimensions: shippingData.dimensions || "",
			trackingHistory: trackingHistory,
			createdAt: backendData.created_at,
			updatedAt: backendData.updated_at,
		};
	}

	/**
	 * Convierte una lista de envíos del backend al formato de administración
	 */
	static convertToAdminModelList(backendDataList: any[]): AdminShippingModel[] {
		if (!Array.isArray(backendDataList)) {
			return [];
		}
		return backendDataList.map((item) => this.convertToAdminModel(item));
	}
}

export default AdminShippingAdapter;
