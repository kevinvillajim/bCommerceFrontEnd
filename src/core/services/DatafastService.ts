import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {extractErrorMessage} from "../../utils/errorHandler";

export interface DatafastCheckoutRequest {
	// ✅ SINCRONIZADO CON PHP: Refleja exactamente las validaciones del backend
	shippingAddress: {
		street: string;          // required|string|max:100
		city: string;            // required|string|max:50
		country: string;         // required|string|max:100
		identification?: string; // sometimes|string|max:13 (RUC/cédula)
	};
	customer: {                  // required|array - OBLIGATORIO PARA SRI
		given_name?: string;     // sometimes|string|max:48
		middle_name?: string;    // sometimes|string|max:50
		surname?: string;        // sometimes|string|max:48
		phone?: string;          // sometimes|string|min:7|max:25
		doc_id: string;          // required|string|size:10 - OBLIGATORIO PARA SRI
	};
	items?: {                    // sometimes|array
		product_id: number;
		quantity: number;
		price: number;
	}[];
	total: number;               // required|numeric|min:0.01
	subtotal?: number;           // sometimes|numeric|min:0
	shipping_cost?: number;      // sometimes|numeric|min:0
	tax?: number;                // sometimes|numeric|min:0
	discount_code?: string | null; // sometimes|string|nullable
	discount_info?: any;         // sometimes|array|nullable
	// ✅ CAMPOS PARA CHECKOUTDATA TEMPORAL
	session_id?: string;         // sometimes|string|max:100
	validated_at?: string;       // sometimes|string
}

// ✅ ESTANDARIZADO: Response unificada con backend
export interface DatafastCheckoutResponse {
	// ✅ DECISIÓN: Usar 'success' como campo principal booleano
	success: boolean;               // Campo principal de estado
	status: 'success' | 'failed' | 'error'; // ✅ OBLIGATORIO: Estado descriptivo
	data?: {
		checkout_id: string;        // ID del checkout de Datafast
		widget_url: string;         // URL del widget para el pago
		transaction_id: string;     // ID único del sistema (ORDER_xxx)
		amount: number;             // Monto total a pagar
	};
	message: string;                // ✅ OBLIGATORIO: Mensaje descriptivo del resultado
	error_code?: string;            // Código de error específico si falla
}

export interface DatafastVerifyPaymentRequest {
	resource_path: string;
	transaction_id: string;
	calculated_total?: number; // ✅ OPCIONAL: Para verificación adicional de seguridad - Backend valida contra datos almacenados
	session_id?: string; // ✅ OPCIONAL: Para arquitectura centralizada - Permite recuperar CheckoutData temporal
}

// ✅ ESTANDARIZADO: Response de verificación unificada
export interface DatafastVerifyPaymentResponse {
	// ✅ DECISIÓN: Usar 'success' como campo principal booleano
	success: boolean;
	status: 'success' | 'processing' | 'error' | 'pending'; // ✅ OBLIGATORIO: Estado descriptivo
	data?: {
		order_id: number;             // ✅ CORREGIDO: ID numérico de la orden
		order_number: string;         // Número de orden para mostrar al usuario
		total: number;                // Total de la orden
		payment_status: 'completed' | 'pending' | 'failed' | 'error'; // ✅ TIPADO FUERTE
		payment_id: string;           // ID del pago de Datafast
		transaction_id: string;       // ID único del sistema
		processed_at: string;         // Timestamp ISO 8601
	};
	message: string;                  // ✅ OBLIGATORIO: Mensaje descriptivo del resultado
	result_code?: string;             // Código de resultado de Datafast
	is_phase_1_error?: boolean;       // Indicador de error típico de Fase 1
}

// ✅ INTERFACES TIPADAS FUERTEMENTE - SINCRONIZADAS CON PHP
export interface ShippingData {
	street: string;        // required|string|max:100
	city: string;          // required|string|max:50
	country: string;       // required|string|max:100
	identification?: string; // sometimes|string|max:13
}

export interface BillingData {
	street: string;
	city: string;
	country: string;
	identification?: string;
}

export interface CartItem {
	product_id: number;    // required|integer
	quantity: number;      // required|integer|min:1
	price: number;         // required|numeric|min:0
	name?: string;         // Para mostrar en UI
	subtotal?: number;     // Calculado: price * quantity
}

export interface OrderTotals {
	subtotal: number;      // required|numeric|min:0
	shipping_cost: number; // required|numeric|min:0
	tax: number;           // required|numeric|min:0
	discount: number;      // required|numeric|min:0
	final_total: number;   // required|numeric|min:0.01
}

export interface DiscountInfo {
	type: 'volume' | 'coupon' | 'feedback';
	amount: number;
	percentage?: number;
	code?: string;
	description?: string;
}

// ✅ INTERFACES PARA ARQUITECTURA CENTRALIZADA - FUERTEMENTE TIPADAS
export interface StoreCheckoutDataRequest {
	shippingData: ShippingData;      // ✅ TIPADO FUERTE
	billingData: BillingData;        // ✅ TIPADO FUERTE
	items: CartItem[];               // ✅ TIPADO FUERTE - min:1 validado en PHP
	totals: OrderTotals;             // ✅ TIPADO FUERTE
	sessionId: string;               // required|string|max:100
	discountCode?: string | null;    // sometimes|string|nullable
	discountInfo?: DiscountInfo[];   // ✅ TIPADO FUERTE - array de descuentos
}

// ✅ ESTANDARIZADO: Response de almacenamiento de checkout
export interface StoreCheckoutDataResponse {
	success: boolean;
	status: 'success' | 'failed' | 'error'; // ✅ AÑADIDO: Consistencia con otras responses
	message: string;
	data: {
		session_id: string;         // Identificador único de sesión
		expires_at: string;         // Timestamp ISO 8601 de expiración
		final_total: number;        // Total calculado final
	};
	error_code?: string;            // ✅ AÑADIDO: Código de error si falla
}

export class DatafastService {
	/**
	 * Almacenar CheckoutData temporal para arquitectura centralizada
	 * ✅ CORREGIDO: Usa interfaces fuertemente tipadas
	 */
	async storeCheckoutData(
		checkoutData: StoreCheckoutDataRequest
	): Promise<StoreCheckoutDataResponse> {
		try {
			console.log("DatafastService: Almacenando CheckoutData temporal", checkoutData);

			const response = await ApiClient.post<StoreCheckoutDataResponse>(
				API_ENDPOINTS.DATAFAST.STORE_CHECKOUT_DATA,
				checkoutData
			);

			console.log("DatafastService: CheckoutData almacenado exitosamente", response);

			return response;
		} catch (error) {
			console.error("DatafastService: Error al almacenar CheckoutData:", error);

			const errorMessage = extractErrorMessage(
				error,
				"Error al almacenar datos de checkout"
			);

			throw new Error(errorMessage);
		}
	}

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
			// ✅ CORREGIDO: Llamar al endpoint de verificación con simulate_success en el body
			const requestData = {
				resource_path: mockResourcePath,
				transaction_id: transactionId,
				calculated_total: calculatedTotal, // ✅ ENVIAR TOTAL CALCULADO
				simulate_success: true, // ✅ MOVIDO DEL QUERY PARAMETER AL BODY
			};

			console.log("🔄 Enviando datos de simulación:", requestData);

			const response = await ApiClient.post<DatafastVerifyPaymentResponse>(
				API_ENDPOINTS.DATAFAST.VERIFY_PAYMENT, // ✅ SIN QUERY PARAMETER
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
	 * Simular el flujo completo del widget (idéntico al comportamiento real)
	 * Esta función replica exactamente lo que haría el widget real sin consumir crédito
	 * IMPORTANTE: Usa el endpoint de verificación con simulate_success=true para garantizar 
	 * que pase por EXACTAMENTE el mismo proceso: crear orden + factura + envío SRI
	 */
	async simulateCompleteWidgetFlow(
		checkoutId: string,
		transactionId: string,
		calculatedTotal: number,
		formData: any
	): Promise<string> {
		try {
			console.log("🎯 DatafastService: Simulando flujo COMPLETO del widget (orden + factura + SRI)");
			console.log("📊 Parámetros:", { checkoutId, transactionId, calculatedTotal });
			
			// 1. Simular el resourcePath que generaría el widget real
			const mockResourcePath = `/v1/checkouts/${checkoutId}/payment`;
			console.log("🔗 ResourcePath simulado:", mockResourcePath);
			
			// 2. Guardar datos en localStorage EXACTAMENTE igual que el widget real
			console.log("💾 Guardando datos en localStorage (idéntico a widget real)...");
			
			// ResourcePath (usado por DatafastResultPage)
			localStorage.setItem("datafast_resource_path", mockResourcePath);
			
			// Form data (usado por DatafastResultPage para crear orden)
			localStorage.setItem("datafast_form_data", JSON.stringify(formData));
			
			// Total calculado (para verificación en resultado)
			localStorage.setItem("datafast_calculated_total", calculatedTotal.toString());
			
			// Transaction y checkout IDs (ya deberían estar guardados pero asegurar)
			localStorage.setItem("datafast_transaction_id", transactionId);
			localStorage.setItem("datafast_checkout_id", checkoutId);
			
			console.log("✅ Datos guardados en localStorage:");
			console.log("   - datafast_resource_path:", mockResourcePath);
			console.log("   - datafast_form_data:", "guardado");
			console.log("   - datafast_calculated_total:", calculatedTotal);
			console.log("   - datafast_transaction_id:", transactionId);
			console.log("   - datafast_checkout_id:", checkoutId);
			
			// 3. ✅ CRÍTICO: NO hacer request prematuramente
			// El único request debe ser cuando DatafastResultPage procese la URL
			// Esto evita el problema de doble request que causaba "carrito vacío"
			console.log("📋 Configuración lista - DatafastResultPage procesará el pago");
			console.log("⚠️ NO hacer request aquí para evitar doble procesamiento");
			
			// 4. Simular delay del widget (más realista)
			console.log("⏳ Simulando delay de procesamiento del widget...");
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// 5. Construir URL de redirección idéntica al widget real
			// DatafastResultPage procesará esto y seguirá el flujo completo:
			// verifyPayment() → processCheckout() → orden + factura + SRI
			// ✅ AGREGADO: simulate=true para activar DatafastTestValidator
			const resultUrl = `/datafast-result?resourcePath=${encodeURIComponent(mockResourcePath)}&status=pending&transactionId=${transactionId}&simulate=true`;
			console.log("🚀 URL de redirección generada (flujo completo):", resultUrl);
			console.log("📋 DatafastResultPage ejecutará:");
			console.log("   1. verifyPayment() - verificación (simulada como exitosa)");  
			console.log("   2. processCheckout() - crear orden + factura + enviar SRI");
			console.log("   3. clearCart() - limpiar carrito");
			console.log("   4. navigate('/orders') - redirigir a órdenes");
			
			return resultUrl;
			
		} catch (error) {
			console.error("❌ Error en simulación de widget flow:", error);
			throw new Error("Error al simular el flujo del widget");
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
