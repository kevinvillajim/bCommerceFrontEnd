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
	static convertToAdminModel(shipping: any): AdminShippingModel {
		// Mapeo directo desde la entidad Shipping en la BD
		return {
			id: shipping.id || 0,
			trackingNumber: shipping.tracking_number || "",
			orderId: shipping.order_id || 0,
			orderNumber:
				shipping.order?.order_number || `ORD-${shipping.order_id || 0}`,
			userId: shipping.order?.user_id || 0,
			customerName: shipping.order?.user_name || "Cliente",
			status: shipping.status || "pending",
			carrier: shipping.carrier_name || "Transportista por defecto",
			estimatedDeliveryDate: shipping.estimated_delivery,
			shippedDate: shipping.shipped_date,
			deliveredDate: shipping.delivered_at,
			address: this.extractAddress(shipping),
			weight: shipping.weight || 0,
			dimensions: shipping.dimensions || "",
			trackingHistory: [], // Se llenará con getShippingHistory si es necesario
			createdAt: shipping.created_at || new Date().toISOString(),
			updatedAt: shipping.updated_at || new Date().toISOString(),
		};
	}

	private static extractAddress(shipping: any): any {
		// Si hay current_location, intentar parsear
		let address = {
			street: "",
			city: "",
			state: "",
			country: "",
			postalCode: "",
			phone: "",
		};

		try {
			if (shipping.current_location) {
				const location =
					typeof shipping.current_location === "string"
						? JSON.parse(shipping.current_location)
						: shipping.current_location;

				if (location.address) {
					address.street = location.address;
				}
			}

			// Obtener datos de la orden relacionada si existen
			if (shipping.order && shipping.order.shipping_data) {
				const shippingData =
					typeof shipping.order.shipping_data === "string"
						? JSON.parse(shipping.order.shipping_data)
						: shipping.order.shipping_data;

				address = {
					...address,
					city: shippingData.city || "",
					state: shippingData.state || "",
					country: shippingData.country || "",
					postalCode: shippingData.postal_code || "",
					phone: shippingData.phone || "",
				};
			}
		} catch (e) {
			console.error("Error al extraer datos de dirección:", e);
		}

		return address;
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
