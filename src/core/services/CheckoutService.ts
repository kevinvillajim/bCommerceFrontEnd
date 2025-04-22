import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {extractErrorMessage} from "../../utils/errorHandler";

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
