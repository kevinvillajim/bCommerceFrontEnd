import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import { extractErrorMessage } from "../../utils/errorHandler";
import type {ShoppingCart} from "../domain/entities/ShoppingCart";

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
	// Eliminado el campo seller_id que causaba el error
}

export interface CheckoutResponse {
	status: string;
	message: string;
	data: {
		order_id: string;
		order_number: string;
		total: string;
		payment_status: string;
	};
}

export class CheckoutService {
	/**
	 * Obtiene el seller ID del carrito de compras
	 * @param cart Carrito de compras
	 * @returns seller ID o null si no se encuentra
	 */
	static getSellerIdFromCart(cart: ShoppingCart | null): number | null {
		if (!cart || !cart.items || cart.items.length === 0) {
			return null;
		}

		// Buscar el seller ID en el primer item del carrito
		const firstItem = cart.items[0];

		if (firstItem.product) {
			// Prioridad 1: sellerId en el producto
			if (firstItem.product.sellerId) {
				return firstItem.product.sellerId;
			}

			// Prioridad 2: seller_id en el producto
			if (firstItem.product.seller_id) {
				return firstItem.product.seller_id;
			}

			// Prioridad 3: seller.id en el producto
			if (firstItem.product.seller && firstItem.product.seller.id) {
				return firstItem.product.seller.id;
			}

			// Prioridad 4: user_id como fallback
			if (firstItem.product.user_id) {
				return firstItem.product.user_id;
			}
		}

		console.warn("No se pudo obtener seller ID del carrito:", cart);
		return null;
	}
	/**
	 * Procesar el pago y finalizar la compra
	 */
	async processCheckout(
		checkoutData: CheckoutRequest
	): Promise<CheckoutResponse> {
		try {
			console.log("CheckoutService: Procesando checkout", checkoutData);

			const response = await ApiClient.post<CheckoutResponse>(
				API_ENDPOINTS.CHECKOUT.PROCESS,
				checkoutData
			);

			console.log("CheckoutService: Respuesta de checkout", response);

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
}
