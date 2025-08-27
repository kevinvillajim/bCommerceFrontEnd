import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {extractErrorMessage} from "../../utils/errorHandler";

export interface DatafastCheckoutRequest {
	shipping: {
		address: string;
		city: string;
		country: string;
	};
	customer?: {
		given_name?: string;
		middle_name?: string;
		surname?: string;
		phone?: string;
		doc_id?: string;
	};
	items?: {
		product_id: number;
		quantity: number;
		price: number;
	}[];
	total: number;
	subtotal: number;
	shipping_cost: number;
	tax: number;
	discount_code?: string | null;
	discount_info?: any;
}

export interface DatafastCheckoutResponse {
	success: boolean;
	status?: string;
	data?: {
		checkout_id: string;
		widget_url: string;
		transaction_id: string;
		amount: number;
	};
	message: string;
	error_code?: string;
}

export interface DatafastVerifyPaymentRequest {
	resource_path: string;
	transaction_id: string;
	calculated_total?: number; // ✅ AGREGAR SOPORTE PARA TOTAL CALCULADO
}

export interface DatafastVerifyPaymentResponse {
	success: boolean;
	status?: string;
	data?: {
		order_id: string;
		order_number: string;
		total: number;
		payment_status: string;
		payment_id: string;
	};
	message: string;
	result_code?: string;
	is_phase_1_error?: boolean;
}

export class DatafastService {
	/**
	 * Crear un checkout de Datafast
	 */
	async createCheckout(
		checkoutData: DatafastCheckoutRequest
	): Promise<DatafastCheckoutResponse> {
		try {
			console.log("DatafastService: Creando checkout", checkoutData);

			const response = await ApiClient.post<DatafastCheckoutResponse>(
				API_ENDPOINTS.DATAFAST.CREATE_CHECKOUT,
				checkoutData
			);

			console.log("DatafastService: Respuesta de checkout", response);

			return response;
		} catch (error) {
			console.error("DatafastService: Error al crear checkout:", error);

			const errorMessage = extractErrorMessage(
				error,
				"Error al crear el checkout de Datafast"
			);

			throw new Error(errorMessage);
		}
	}

	/**
	 * Verificar el estado del pago
	 */
	async verifyPayment(
		verifyData: DatafastVerifyPaymentRequest
	): Promise<DatafastVerifyPaymentResponse> {
		try {
			console.log("DatafastService: Verificando pago", verifyData);

			const response = await ApiClient.post<DatafastVerifyPaymentResponse>(
				API_ENDPOINTS.DATAFAST.VERIFY_PAYMENT,
				verifyData
			);

			console.log("DatafastService: Respuesta de verificación", response);

			return response;
		} catch (error) {
			console.error("DatafastService: Error al verificar pago:", error);

			const errorMessage = extractErrorMessage(
				error,
				"Error al verificar el pago de Datafast"
			);

			throw new Error(errorMessage);
		}
	}

	/**
	 * Simular una transacción exitosa para pruebas en Fase 1
	 * (En producción, esto no debe usarse)
	 */
	async simulateSuccessfulPayment(
		checkoutId: string,
		transactionId: string,
		calculatedTotal?: number
	): Promise<DatafastVerifyPaymentResponse> {
		if (!checkoutId) {
			throw new Error("checkout_id es requerido para simular el pago");
		}

		if (!transactionId) {
			throw new Error("transaction_id es requerido para simular el pago");
		}

		// Simular el resourcePath que normalmente viene del widget
		const mockResourcePath = `/v1/checkouts/${checkoutId}/payment`;

		console.log("DatafastService: Simulando pago exitoso", {
			checkoutId,
			transactionId,
			mockResourcePath,
		});

		try {
			// Llamar al endpoint de verificación con el parámetro simulate_success
			const requestData = {
				resource_path: mockResourcePath,
				transaction_id: transactionId,
				calculated_total: calculatedTotal, // ✅ ENVIAR TOTAL CALCULADO
			};
			
			console.log("🔄 Enviando datos de simulación:", requestData);
			
			const response = await ApiClient.post<DatafastVerifyPaymentResponse>(
				API_ENDPOINTS.DATAFAST.VERIFY_PAYMENT + "?simulate_success=true",
				requestData
			);

			console.log("DatafastService: Respuesta de simulación:", response);

			return response;
		} catch (error) {
			console.error("DatafastService: Error en simulación:", error);

			const errorMessage = extractErrorMessage(
				error,
				"Error al simular el pago de Datafast"
			);

			throw new Error(errorMessage);
		}
	}

	/**
	 * Manejar el resultado real de Datafast (cuando viene del widget)
	 */
	async handleDatafastResult(
		resourcePath: string,
		transactionId: string,
		calculatedTotal?: number
	): Promise<DatafastVerifyPaymentResponse> {
		try {
			console.log("DatafastService: Manejando resultado real de Datafast", {
				resourcePath,
				transactionId,
				calculatedTotal,
			});

			const response = await this.verifyPayment({
				resource_path: resourcePath,
				transaction_id: transactionId,
				calculated_total: calculatedTotal, // ✅ INCLUIR TOTAL CALCULADO
			});

			// Si es el error típico de Fase 1, devolver un mensaje más claro
			if (response.status !== "success" && response.result_code === "800.900.300") { // ✅ CORREGIDO: Cambiar response.success por response.status
				return {
					success: false,
					message:
						'No se completó un pago real. Este es el comportamiento esperado en Fase 1 de pruebas. Use "Simular Pago Exitoso" para probar el flujo completo.',
					result_code: response.result_code,
					is_phase_1_error: true,
				};
			}

			return response;
		} catch (error) {
			console.error("DatafastService: Error al manejar resultado:", error);

			const errorMessage = extractErrorMessage(
				error,
				"Error al procesar el resultado de Datafast"
			);

			throw new Error(errorMessage);
		}
	}

	/**
	 * Extraer resourcePath de la URL de respuesta
	 */
	extractResourcePath(url: string): string | null {
		try {
			const urlParams = new URLSearchParams(url.split("?")[1]);
			const resourcePath = urlParams.get("resourcePath");
			console.log("DatafastService: ResourcePath extraído:", resourcePath);
			return resourcePath;
		} catch (error) {
			console.error("DatafastService: Error al extraer resourcePath:", error);
			return null;
		}
	}
}
