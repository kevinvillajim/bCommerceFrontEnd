import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {extractErrorMessage} from "../../utils/errorHandler";
import SellerIdResolverService from "../../infrastructure/services/SellerIdResolverService";

export type PaymentMethod = "credit_card" | "paypal" | "transfer" | "qr";

export interface ShippingInfo {
	address: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
	phone: string;
}

export interface PaymentInfo {
	method: PaymentMethod;
	card_number?: string;
	card_expiry?: string;
	card_cvc?: string;
	paypal_email?: string;
}

export interface CheckoutRequest {
	payment: PaymentInfo;
	shipping: ShippingInfo;
	// El campo seller_id ahora es opcional y solo se usa para
	// compatibilidad con órdenes de un solo vendedor
	seller_id?: number;
}

export interface SellerOrderInfo {
	id: number;
	seller_id: number;
	total: number;
	status: string;
	order_number: string;
}

export interface CheckoutResponse {
	status: string;
	message: string;
	data: {
		order_id: string;
		order_number: string;
		total: string;
		payment_status: string;
		// Nuevo campo para órdenes de múltiples vendedores
		seller_orders?: SellerOrderInfo[];
	};
}

export class CheckoutService {
	/**
	 * Procesar el pago y finalizar la compra
	 * Soporte para órdenes con productos de múltiples vendedores
	 */
	async processCheckout(
		checkoutData: CheckoutRequest
	): Promise<CheckoutResponse> {
		try {
			console.log("CheckoutService: Procesando checkout", checkoutData);

			// Si se proporciona seller_id, verificar si es correcto
			if (checkoutData.seller_id === 63) {
				console.log("⚠️ Corrigiendo seller_id: user_id 63 → seller_id 11");
				checkoutData.seller_id = 11; // El ID correcto para TestStore
			}

			// Hacer llamada a la API
			const response = await ApiClient.post<CheckoutResponse>(
				API_ENDPOINTS.CHECKOUT.PROCESS,
				checkoutData
			);

			console.log("CheckoutService: Respuesta de checkout", response);

			// Verificar si hay órdenes de vendedor en la respuesta
			if (
				response.data.seller_orders &&
				response.data.seller_orders.length > 0
			) {
				console.log(
					`CheckoutService: Orden creada con ${response.data.seller_orders.length} órdenes de vendedor`
				);
			}

			return response;
		} catch (error) {
			console.error("CheckoutService: Error al procesar checkout:", error);

			// Extraer un mensaje de error amigable del error
			const errorMessage = extractErrorMessage(
				error,
				"Error al procesar el pago. Por favor, intenta de nuevo más tarde."
			);

			throw new Error(errorMessage);
		}
	}

	/**
	 * Obtiene todos los seller_ids de los productos en el carrito
	 * para mostrar información al usuario antes del checkout
	 */
	async getSellerIdsFromCart(
		cartItems: Array<{productId: number; product?: any}>
	): Promise<Map<number, number>> {
		try {
			return await SellerIdResolverService.resolveSellerIdsForCart(cartItems);
		} catch (error) {
			console.error(
				"CheckoutService: Error obteniendo seller_ids del carrito:",
				error
			);
			return new Map();
		}
	}

	/**
	 * Verifica si el carrito tiene productos de múltiples vendedores
	 */
	async hasMultipleSellers(
		cartItems: Array<{productId: number; product?: any}>
	): Promise<boolean> {
		const sellerIds = await this.getSellerIdsFromCart(cartItems);

		// Extraer valores únicos
		const uniqueSellerIds = new Set(sellerIds.values());

		// Si hay más de un vendedor único, es una orden multi-vendedor
		return uniqueSellerIds.size > 1;
	}
}
