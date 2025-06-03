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
}

export interface DatafastCheckoutResponse {
	success: boolean;
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
}

export interface DatafastVerifyPaymentResponse {
	success: boolean;
	data?: {
		order_id: string;
		order_number: string;
		total: number;
		payment_status: string;
		payment_id: string;
	};
	message: string;
	result_code?: string;
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
	 * Cargar el widget de Datafast en la página
	 */
	loadWidget(checkoutId: string, containerId: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				// Remover widget existente si existe
				this.removeWidget();

				const widgetUrl = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;

				// Crear script para cargar el widget
				const script = document.createElement("script");
				script.src = widgetUrl;
				script.async = true;
				script.id = "datafast-widget-script";

				script.onload = () => {
					console.log("DatafastService: Widget cargado exitosamente");
					resolve();
				};

				script.onerror = () => {
					console.error("DatafastService: Error al cargar widget");
					reject(new Error("Error al cargar el widget de Datafast"));
				};

				document.head.appendChild(script);
			} catch (error) {
				console.error("DatafastService: Error al configurar widget:", error);
				reject(error);
			}
		});
	}

	/**
	 * Remover el widget de Datafast
	 */
	removeWidget(): void {
		try {
			// Remover script del widget
			const existingScript = document.getElementById("datafast-widget-script");
			if (existingScript) {
				existingScript.remove();
			}

			// Limpiar variables globales del widget si existen
			if ((window as any).wpwlOptions) {
				delete (window as any).wpwlOptions;
			}
		} catch (error) {
			console.warn("DatafastService: Error al remover widget:", error);
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
