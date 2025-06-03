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

// Declarar tipos para las opciones del widget
declare global {
	interface Window {
		wpwlOptions?: {
			onReady?: () => void;
			onError?: (error: any) => void;
			style?: string;
			locale?: string;
			labels?: {
				cvv?: string;
				cardHolder?: string;
			};
		};
	}
}

export class DatafastService {
	private currentCheckoutId: string | null = null;

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

			// Guardar el checkout ID para uso posterior
			if (response.success && response.data) {
				this.currentCheckoutId = response.data.checkout_id;
			}

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

				// Guardar checkout ID
				this.currentCheckoutId = checkoutId;

				// URL del widget según la documentación
				const widgetUrl = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;

				console.log("DatafastService: Cargando widget desde", widgetUrl);

				// Configurar opciones del widget ANTES de cargar el script
				window.wpwlOptions = {
					onReady: () => {
						console.log("DatafastService: Widget listo");
						this.setupFormAfterLoad(containerId);
						resolve();
					},
					onError: (error: any) => {
						console.error("DatafastService: Error en widget", error);
						reject(new Error("Error en el widget de Datafast"));
					},
					style: "card",
					locale: "es",
					labels: {
						cvv: "CVV",
						cardHolder: "Nombre (igual que en la tarjeta)",
					},
				};

				// Crear script para cargar el widget
				const script = document.createElement("script");
				script.src = widgetUrl;
				script.async = true;
				script.id = "datafast-widget-script";

				script.onload = () => {
					console.log("DatafastService: Script del widget cargado");
					// El evento onReady del wpwlOptions manejará el resolve
				};

				script.onerror = () => {
					console.error("DatafastService: Error al cargar script del widget");
					reject(new Error("Error al cargar el script del widget de Datafast"));
				};

				document.head.appendChild(script);
			} catch (error) {
				console.error("DatafastService: Error al configurar widget:", error);
				reject(error);
			}
		});
	}

	/**
	 * Configurar el formulario después de que el widget se carga
	 */
	private setupFormAfterLoad(containerId: string): void {
		try {
			const container = document.getElementById(containerId);
			if (!container) {
				console.error("DatafastService: Container no encontrado", containerId);
				return;
			}

			// URL de retorno para procesar la respuesta
			const shopperResultURL = `${window.location.origin}/datafast-result`;

			// Limpiar container y crear formulario
			container.innerHTML = `
				<form action="${shopperResultURL}" class="paymentWidgets" data-brands="VISA MASTER AMEX DINERS DISCOVER">
				</form>
			`;

			console.log(
				"DatafastService: Formulario configurado con URL de retorno:",
				shopperResultURL
			);
		} catch (error) {
			console.error("DatafastService: Error al configurar formulario:", error);
		}
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
				console.log("DatafastService: Script removido");
			}

			// Limpiar variables globales del widget si existen
			if (window.wpwlOptions) {
				delete window.wpwlOptions;
				console.log("DatafastService: wpwlOptions limpiado");
			}

			// Limpiar checkout ID
			this.currentCheckoutId = null;
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

	/**
	 * Obtener el checkout ID actual
	 */
	getCurrentCheckoutId(): string | null {
		return this.currentCheckoutId;
	}

	/**
	 * Simular una transacción exitosa para pruebas
	 * (En producción, esto no debe usarse)
	 */
	async simulateSuccessfulPayment(
		transactionId: string
	): Promise<DatafastVerifyPaymentResponse> {
		if (!this.currentCheckoutId) {
			throw new Error("No hay checkout ID disponible");
		}

		// Simular el resourcePath que normalmente viene del widget
		const mockResourcePath = `/v1/checkouts/${this.currentCheckoutId}/payment`;

		console.log(
			"DatafastService: Simulando pago exitoso con resourcePath:",
			mockResourcePath
		);

		// Llamar al endpoint de verificación con el resourcePath simulado
		return await this.verifyPayment({
			resource_path: mockResourcePath,
			transaction_id: transactionId,
		});
	}
}
