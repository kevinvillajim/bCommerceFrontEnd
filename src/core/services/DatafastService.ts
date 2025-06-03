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
		email?: string;
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
	debug_data?: any; // Para debugging
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
	private isProduction: boolean;
	private baseUrl: string;

	constructor() {
		this.isProduction = process.env.NODE_ENV === "production";
		this.baseUrl = this.isProduction
			? "https://eu-prod.oppwa.com"
			: "https://eu-test.oppwa.com";
	}

	/**
	 * Validar datos del checkout antes de enviar
	 */
	private validateCheckoutData(checkoutData: DatafastCheckoutRequest): void {
		// Validar datos de envío requeridos
		if (!checkoutData.shipping) {
			throw new Error("Los datos de envío son requeridos");
		}

		const requiredShippingFields = ["address", "city", "country"];
		for (const field of requiredShippingFields) {
			if (!checkoutData.shipping[field as keyof typeof checkoutData.shipping]) {
				throw new Error(`El campo de envío '${field}' es requerido`);
			}
		}

		// Validar formato del país (2 caracteres)
		if (checkoutData.shipping.country.length !== 2) {
			checkoutData.shipping.country = checkoutData.shipping.country
				.substring(0, 2)
				.toUpperCase();
		}

		// Validar datos del cliente si están presentes
		if (checkoutData.customer) {
			// Validar email si está presente
			if (checkoutData.customer.email) {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(checkoutData.customer.email)) {
					throw new Error("El formato del email no es válido");
				}
			}

			// Validar longitud de campos
			const fieldLimits = {
				given_name: 48,
				middle_name: 50,
				surname: 48,
				phone: 25,
				doc_id: 10,
			};

			for (const [field, limit] of Object.entries(fieldLimits)) {
				const value =
					checkoutData.customer[field as keyof typeof checkoutData.customer];
				if (value && value.length > limit) {
					console.warn(
						`Campo '${field}' excede la longitud máxima de ${limit} caracteres. Será truncado.`
					);
				}
			}

			// Limpiar y formatear documento de identidad
			if (checkoutData.customer.doc_id) {
				// Remover caracteres no numéricos
				checkoutData.customer.doc_id = checkoutData.customer.doc_id.replace(
					/\D/g,
					""
				);
				// Truncar a 10 caracteres máximo
				if (checkoutData.customer.doc_id.length > 10) {
					checkoutData.customer.doc_id = checkoutData.customer.doc_id.substring(
						0,
						10
					);
				}
				// Rellenar con ceros a la izquierda
				checkoutData.customer.doc_id = checkoutData.customer.doc_id.padStart(
					10,
					"0"
				);
			}
		}
	}

	/**
	 * Crear un checkout de Datafast
	 */
	async createCheckout(
		checkoutData: DatafastCheckoutRequest
	): Promise<DatafastCheckoutResponse> {
		try {
			console.log("DatafastService: Validando datos de checkout", checkoutData);

			// Validar datos antes de enviar
			this.validateCheckoutData(checkoutData);

			console.log("DatafastService: Creando checkout", checkoutData);

			const response = await ApiClient.post<DatafastCheckoutResponse>(
				API_ENDPOINTS.DATAFAST.CREATE_CHECKOUT,
				checkoutData
			);

			console.log("DatafastService: Respuesta de checkout", response);

			// Si hay error en la respuesta, loggearlo para debugging
			if (!response.success && response.error_code) {
				console.error("DatafastService: Error en checkout", {
					error_code: response.error_code,
					message: response.message,
					debug_data: response.debug_data,
				});

				// Proporcionar mensajes más específicos según el código de error
				if (response.error_code === "200.300.404") {
					throw new Error(
						"Parámetro inválido o faltante. Revisa que todos los campos requeridos estén completos y en el formato correcto."
					);
				}
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

			// Validar resourcePath
			if (
				!verifyData.resource_path ||
				!verifyData.resource_path.includes("/payment")
			) {
				throw new Error("El resource_path no es válido");
			}

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
				// Validar parámetros
				if (!checkoutId || !containerId) {
					throw new Error("checkoutId y containerId son requeridos");
				}

				// Remover widget existente si existe
				this.removeWidget();

				const widgetUrl = `${this.baseUrl}/v1/paymentWidgets.js?checkoutId=${checkoutId}`;

				console.log("DatafastService: Cargando widget desde", widgetUrl);

				// Crear script para cargar el widget
				const script = document.createElement("script");
				script.src = widgetUrl;
				script.async = true;
				script.id = "datafast-widget-script";

				script.onload = () => {
					console.log("DatafastService: Widget cargado exitosamente");

					// Verificar que el container existe
					const container = document.getElementById(containerId);
					if (!container) {
						reject(
							new Error(`Container con ID '${containerId}' no encontrado`)
						);
						return;
					}

					resolve();
				};

				script.onerror = (error) => {
					console.error("DatafastService: Error al cargar widget", error);
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
				console.log("DatafastService: Script del widget removido");
			}

			// Limpiar variables globales del widget si existen
			const windowObj = window as any;
			if (windowObj.wpwlOptions) {
				delete windowObj.wpwlOptions;
			}
			if (windowObj.wpwl) {
				delete windowObj.wpwl;
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
			const urlObj = new URL(url);
			const resourcePath = urlObj.searchParams.get("resourcePath");

			if (!resourcePath) {
				console.error(
					"DatafastService: No se encontró resourcePath en la URL:",
					url
				);
				return null;
			}

			console.log("DatafastService: ResourcePath extraído:", resourcePath);
			return resourcePath;
		} catch (error) {
			console.error("DatafastService: Error al extraer resourcePath:", error);
			return null;
		}
	}

	/**
	 * Obtener información de debugging
	 */
	getDebugInfo(): object {
		return {
			isProduction: this.isProduction,
			baseUrl: this.baseUrl,
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
		};
	}
}
