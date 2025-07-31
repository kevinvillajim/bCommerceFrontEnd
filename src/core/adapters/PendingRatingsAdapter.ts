import type {
	PendingRatingItem,
	PendingSellerItem,
	PendingRatingsResponse,
} from "../services/RatingService";

/**
 * Interfaz para los grupos de órdenes procesados
 */
export interface OrderGroup {
	orderId: number;
	orderNumber: string;
	orderDate: string;
	products: PendingRatingItem[];
	sellers: PendingRatingItem[];
}

/**
 * Adaptador para transformar la respuesta de la API de valoraciones pendientes
 * al formato requerido por el componente PendingRatingsList
 */
export class PendingRatingsAdapter {
	/**
	 * Adapta la respuesta de la API al formato esperado por los componentes de UI
	 * @param apiResponse Respuesta de la API con valoraciones pendientes
	 * @returns Lista de grupos de órdenes con sus productos y vendedores pendientes de valorar
	 */
	static adaptPendingRatings(
		apiResponse: PendingRatingsResponse
	): OrderGroup[] {
		// Si no hay respuesta o es inválida, devolver un array vacío
		if (!apiResponse || !apiResponse.data) {
			return [];
		}

		const {products, sellers} = apiResponse.data;

		// Mapa para agrupar por orden
		const orderGroupsMap = new Map<number, OrderGroup>();

		// Procesar productos
		(products || []).forEach((product) => {
			const orderId = product.order_id;

			// Si no existe el grupo para esta orden, crearlo
			if (!orderGroupsMap.has(orderId)) {
				orderGroupsMap.set(orderId, {
					orderId,
					orderNumber: product.order_number,
					orderDate: product.order_date,
					products: [],
					sellers: [],
				});
			}

			const adaptedProduct: PendingRatingItem = {
				...product,
				productId: product.id,
				seller_id: product.seller_id || product.sellerId,
			};

			// Añadir el producto adaptado al grupo
			orderGroupsMap.get(orderId)?.products.push(adaptedProduct);
		});

		// Procesar vendedores
		(sellers || []).forEach((seller: PendingSellerItem) => {
			const orderId = seller.order_id;

			// Si no existe el grupo para esta orden, crearlo
			if (!orderGroupsMap.has(orderId)) {
				orderGroupsMap.set(orderId, {
					orderId,
					orderNumber: seller.order_number,
					orderDate: seller.date, // Campo diferente para sellers
					products: [],
					sellers: [],
				});
			}

			const adaptedSeller: PendingRatingItem = {
				id: seller.id || seller.seller_id,
				name: seller.name || `Vendedor #${seller.seller_id}`,
				order_id: seller.order_id,
				order_number: seller.order_number,
				order_date: seller.date,
				image: seller.image,
				seller_id: seller.seller_id,
			};

			// Añadir el vendedor al grupo
			orderGroupsMap.get(orderId)?.sellers.push(adaptedSeller);
		});

		// Convertir el mapa a array y ordenar por fecha (más reciente primero)
		return Array.from(orderGroupsMap.values()).sort(
			(a, b) =>
				new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
		);
	}
}

export default PendingRatingsAdapter;
