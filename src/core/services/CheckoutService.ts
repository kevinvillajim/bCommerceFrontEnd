// src/core/services/CheckoutService.ts - ACTUALIZADO CON DESCUENTOS POR VOLUMEN
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {extractErrorMessage} from "../../utils/errorHandler";
import type {Address} from "../domain/valueObjects/Address";
import type {ShoppingCart} from "../domain/entities/ShoppingCart";
import {CheckoutItemsService} from "../../infrastructure/services/CheckoutItemsService";
import type {CheckoutItem} from "../../infrastructure/services/CheckoutItemsService";
import { validateTotalsEquality } from "../../constants/calculationConfig";

export type PaymentMethod = "credit_card" | "paypal" | "transfer" | "qr" | "datafast" | "debit_card" | "de_una";

export interface PaymentInfo {
	method: PaymentMethod;
	card_number?: string;
	card_expiry?: string;
	card_cvc?: string;
	paypal_email?: string;
}

// ✅ ACTUALIZADO: Interface CheckoutRequest con precios finales
export interface CheckoutRequest {
	payment: PaymentInfo;
	shippingAddress: Address;
	billingAddress?: Address;
	seller_id?: number;
	items?: CheckoutItem[]; // ✅ Usar CheckoutItem con precios finales
	discount_code?: string | null; // ✅ NUEVO: Código de descuento
	discount_info?: any; // ✅ NUEVO: Información completa del descuento aplicado
	calculated_totals?: { // ✅ CRÍTICO: Agregar totales calculados
		subtotal: number;
		tax: number;
		shipping: number;
		total: number;
		total_discounts: number;
	};
}

export interface BackendCheckoutRequest {
	payment: PaymentInfo;
	shipping: {
		first_name: string;
		last_name: string;
		email: string;
		phone: string;
		address: string;
		city: string;
		state: string;
		postal_code: string;
		country: string;
	};
	seller_id?: number;
	items?: CheckoutItem[]; // ✅ Usar CheckoutItem con precios finales
	discount_code?: string; // ✅ FIX: Opcional - solo se incluye si hay cupón
	// ✅ CRÍTICO: Totales exactos calculados que el backend DEBE usar
	calculated_totals?: {
		subtotal: number;
		tax: number;
		shipping: number;
		total: number;
		total_discounts: number;
	};
}

export interface CheckoutResponse {
	status: string;
	message: string;
	data: {
		order_id: string;
		order_number: string;
		total: string;
		payment_status: string;
		// ✅ NUEVOS: Campos de pricing con descuentos
		billed_amount?: number;
		paid_amount?: number;
		total_savings?: number;
		volume_discounts_applied?: boolean;
		volume_discount_savings?: number;
		seller_discount_savings?: number;
	};
}

export class CheckoutService {
	/**
	 * Obtiene el seller ID del carrito de compras
	 */
	static getSellerIdFromCart(cart: ShoppingCart | null): number | null {
		if (!cart || !cart.items || cart.items.length === 0) {
			console.log("🛒 getSellerIdFromCart: Carrito vacío o sin items");
			return null;
		}

		console.log("🛒 getSellerIdFromCart: Analizando carrito:", {
			totalItems: cart.items.length,
			items: cart.items.map((item) => ({
				id: item.id,
				productId: item.productId,
				quantity: item.quantity,
				productData: item.product,
			})),
		});

		const firstItem = cart.items[0];
		console.log("🛒 getSellerIdFromCart: Primer item del carrito:", firstItem);

		if (firstItem.product) {
			console.log("🛒 getSellerIdFromCart: Producto encontrado:", {
				sellerId: firstItem.product.sellerId,
				seller_id: firstItem.product.seller_id,
				seller: firstItem.product.seller,
				user_id: firstItem.product.user_id,
			});

			if (firstItem.product.sellerId) {
				console.log("✅ getSellerIdFromCart: Usando sellerId:", firstItem.product.sellerId);
				return firstItem.product.sellerId;
			}

			if (firstItem.product.seller_id) {
				console.log("✅ getSellerIdFromCart: Usando seller_id:", firstItem.product.seller_id);
				return firstItem.product.seller_id;
			}

			if (firstItem.product.seller && firstItem.product.seller.id) {
				console.log("✅ getSellerIdFromCart: Usando seller.id:", firstItem.product.seller.id);
				return firstItem.product.seller.id;
			}

			if (firstItem.product.user_id) {
				console.log("✅ getSellerIdFromCart: Usando user_id como fallback:", firstItem.product.user_id);
				return firstItem.product.user_id;
			}
		}

		console.warn("❌ getSellerIdFromCart: No se pudo obtener seller ID del carrito:", cart);
		return null;
	}

	/**
	 * ✅ ACTUALIZADO: Procesar el pago usando precios con descuentos por volumen
	 */
	async processCheckout(
		checkoutData: CheckoutRequest,
		userEmail?: string
	): Promise<CheckoutResponse> {
		try {
			console.log("🚀 CheckoutService.processCheckout INICIADO CON DESCUENTOS POR VOLUMEN");
			console.log("📦 Datos de checkout enviados:", JSON.stringify(checkoutData, null, 2));

			// ✅ VALIDACIÓN SEGURA: Verificar que address.name existe
			if (!checkoutData.shippingAddress.name) {
				throw new Error('El nombre en la dirección de envío es requerido');
			}

			// ✅ MAPEAR método de pago de manera más robusta
			let paymentMethod: PaymentMethod = checkoutData.payment.method;
			
			// Mapeo de métodos de pago
			const methodMapping: Record<string, PaymentMethod> = {
				"transfer": "datafast",
				"credit_card": "credit_card",
				"debit_card": "debit_card", 
				"paypal": "paypal",
				"qr": "de_una",
				"datafast": "datafast",
				"de_una": "de_una"
			};

			if (methodMapping[paymentMethod]) {
				paymentMethod = methodMapping[paymentMethod];
			}

			console.log("🔍 DEBUGGING - Método después de mapear:", paymentMethod);

			// ✅ PROCESAR ITEMS CON DESCUENTOS POR VOLUMEN
			const items = checkoutData.items || [];
			console.log("🔍 DEBUGGING - Items recibidos:", items);

			if (items.length === 0) {
				console.warn("⚠️ No se recibieron items en checkoutData");
			}

			// ✅ VALIDAR que los items tengan precios finales correctos
			const validation = CheckoutItemsService.validateItemsForCheckout(items);
			if (!validation.valid) {
				throw new Error(`Validación de items falló: ${validation.errors.join(', ')}`);
			}

			console.log("✅ Items validados correctamente:", items);

			// ✅ CONVERSIÓN SEGURA: Mapear dirección a formato requerido por backend
			// ✅ USAR CALCULADORA CENTRALIZADA PARA TOTALES EXACTOS
			const appliedDiscount = checkoutData.discount_info || 
				(checkoutData.discount_code ? { 
					discountCode: { 
						code: checkoutData.discount_code,
						discount_percentage: 5, // Valor por defecto si no se proporciona discount_info
						discount_amount: 0
					}
				} : null);
			
			// ✅ CRÍTICO: NO RECALCULAR - Usar totales ya calculados que se pasaron como parámetro
			console.log("🔍 USANDO TOTALES PRECALCULADOS (NO SE RECALCULA):");
			console.log("   📊 calculated_totals recibidos:", checkoutData.calculated_totals);

			console.log("🔍 FLUJO COMPLETO DE CHECKOUT CORREGIDO:");
			console.log("1️⃣ Items del carrito:", checkoutData.items?.length || 0);
			console.log("2️⃣ Código de descuento:", checkoutData.discount_code || "NINGUNO");
			console.log("3️⃣ appliedDiscount:", appliedDiscount);
			console.log("4️⃣ TOTALES EXACTOS CALCULADOS (CALCULADORA CENTRALIZADA):", checkoutData.calculated_totals);
			console.log("5️⃣ Total final CORRECTO que debe guardarse en DB:", checkoutData.calculated_totals?.total, "✅ DEBE SER $8.87");

			const nameParts = (checkoutData.shippingAddress.name || '').split(' ');
			
			// ✅ FIX CORREGIDO: Enviar shippingAddress y billingAddress directamente sin transformar
			const backendData: any = {
				payment: {
					...checkoutData.payment,
					method: paymentMethod
				},
				// ✅ CUSTOMER: REQUERIDO PARA SRI (mantener para Datafast)
				customer: {
					given_name: nameParts[0] || '',
					surname: nameParts.slice(1).join(' ') || '',
					phone: checkoutData.shippingAddress.phone || '',
					doc_id: checkoutData.shippingAddress.identification || ''
				},
				// ✅ CORRECCIÓN CRÍTICA: Enviar shippingAddress y billingAddress con formato original
				shippingAddress: checkoutData.shippingAddress, // ✅ Directo, sin transformar
				billingAddress: checkoutData.billingAddress,   // ✅ AÑADIDO: Faltaba por completo
				seller_id: checkoutData.seller_id,
				items: items, // ✅ Usar items con precios finales calculados
				// ✅ CRÍTICO: Enviar totales exactos de calculadora centralizada para que backend los use SIN RECALCULAR
				calculated_totals: checkoutData.calculated_totals || {
					subtotal: 0,
					tax: 0,
					shipping: 0,
					total: 0,
					total_discounts: 0
				}
			};
			
			// ✅ FIX: Solo agregar discount_code si hay un cupón válido
			if (checkoutData.discount_code && checkoutData.discount_code.trim() !== "") {
				backendData.discount_code = checkoutData.discount_code.trim();
				console.log("✅ Cupón aplicado enviado al backend:", backendData.discount_code);
			} else {
				console.log("✅ No hay cupón - campo discount_code omitido del request");
			}

			console.log("🔍 DEBUGGING - Datos CORREGIDOS enviados al backend:", JSON.stringify(backendData, null, 2));
			console.log("✅ CORRECCIÓN APLICADA: shippingAddress y billingAddress enviados con formato original");
			
			// ✅ LOGS CRÍTICOS PARA TOTALES CORREGIDOS
			console.log("💰 TOTALES CRÍTICOS CORREGIDOS QUE DEBE USAR EL BACKEND:");
			console.log("   📊 Subtotal:", checkoutData.calculated_totals?.subtotal);
			console.log("   📊 IVA:", checkoutData.calculated_totals?.tax);
			console.log("   📊 Envío:", checkoutData.calculated_totals?.shipping);
			console.log("   📊 TOTAL FINAL:", checkoutData.calculated_totals?.total, "✅ DEBE SER $8.87");
			console.log("   📊 Total descuentos:", checkoutData.calculated_totals?.total_discounts);
			console.log("🚨 EL BACKEND NO DEBE RECALCULAR - USAR ESTOS TOTALES EXACTOS");
			console.log("🚨 TOTAL ESPERADO EN RESPUESTA:", checkoutData.calculated_totals?.total);

			// ✅ VALIDACIÓN FINAL antes de enviar
			if (backendData.items && backendData.items.length > 0) {
				for (let i = 0; i < backendData.items.length; i++) {
					const item = backendData.items[i];
					if (!item.hasOwnProperty('price') || item.price === undefined || item.price === null) {
						throw new Error(`FATAL: Item ${i} no tiene campo 'price' definido. Item: ${JSON.stringify(item)}`);
					}
					if (typeof item.price !== 'number' || item.price <= 0) {
						throw new Error(`FATAL: Item ${i} tiene precio inválido: ${item.price} (tipo: ${typeof item.price})`);
					}
				}
				console.log("✅ VALIDACIÓN FINAL: Todos los items tienen precios finales válidos");
			}

			const response = await ApiClient.post<CheckoutResponse>(
				API_ENDPOINTS.CHECKOUT.PROCESS,
				backendData
			);

			console.log("✅ CheckoutService: Respuesta del backend:");
			console.log("📊 Status:", response.status);
			console.log("💬 Message:", response.message);
			console.log("📦 Data:", JSON.stringify(response.data, null, 2));

			// ✅ LOG de información de descuentos si está disponible
			if (response.data && typeof response.data === "object") {
				const dataObj = response.data as any;
				
				if (dataObj.total_savings && dataObj.total_savings > 0) {
					console.log("💰 DESCUENTOS APLICADOS EN LA ORDEN:");
					console.log(`💵 Total ahorrado: $${dataObj.total_savings}`);
					
					if (dataObj.volume_discount_savings) {
						console.log(`📈 Descuentos por volumen: $${dataObj.volume_discount_savings}`);
					}
					
					if (dataObj.seller_discount_savings) {
						console.log(`🏪 Descuentos del seller: $${dataObj.seller_discount_savings}`);
					}
				}
			}

			console.log("🎉 CheckoutService.processCheckout COMPLETADO CON DESCUENTOS POR VOLUMEN");
			return response;
		} catch (error) {
			console.error("❌ CheckoutService: Error al procesar checkout:");
			console.error("📊 Error object:", error);
			console.error("📊 Error message:", (error as any)?.message);
			console.error("📊 Error response:", (error as any)?.response?.data);

			// ✅ DEBUGGING ADICIONAL para identificar el problema
			if ((error as any)?.response?.status === 400) {
				console.error("🔍 ERROR 400 DETECTADO - Analizando request enviada:");
				console.error("📊 Payment method enviado:", checkoutData.payment.method);
				console.error("📊 Items enviados:", checkoutData.items);
				console.error("📊 Seller ID enviado:", checkoutData.seller_id);
			}

			const errorMessage = extractErrorMessage(
				error,
				"Error al procesar el pago. Por favor, intenta de nuevo más tarde."
			);

			console.error("📊 Error message final:", errorMessage);
			throw new Error(errorMessage);
		}
	}

	/**
	 * Obtener el carrito actual
	 */
	async getCurrentCart(): Promise<any> {
		try {
			console.log("🛒 Obteniendo carrito actual...");
			return null;
		} catch (error) {
			console.error("❌ Error al obtener carrito actual:", error);
			return null;
		}
	}

	/**
	 * ✅ CORREGIDO: Preparar items del carrito con descuentos para checkout
	 */
	static async prepareCartItemsForCheckout(cartItems: any[], appliedDiscount: any = null): Promise<CheckoutItem[]> {
		console.log("🛒 Preparando items del carrito con descuentos");
		console.log("🎫 Cupón aplicado:", appliedDiscount?.discountCode?.code || "NINGUNO");
		
		const checkoutItems = await CheckoutItemsService.prepareItemsForCheckout(cartItems, appliedDiscount);
		
		// ✅ Debug para verificar consistencia
		await CheckoutItemsService.debugItemPricing(cartItems, checkoutItems);
		
		console.log("✅ Items preparados para checkout:", checkoutItems);
		
		return checkoutItems;
	}

	/**
	 * ✅ NUEVO: Calcular totales para mostrar en checkout
	 */
	static calculateCheckoutTotals(cartItems: any[]) {
		return CheckoutItemsService.calculateCheckoutTotals(cartItems);
	}

	/**
	 * ✅ ACTUALIZADO: Validar totales considerando descuentos por volumen
	 */
	static validateCheckoutTotals(cartTotal: number, checkoutTotal: number, customTolerance?: number): boolean {
		return validateTotalsEquality(
			cartTotal, 
			checkoutTotal, 
			'Validación CheckoutService',
			customTolerance
		);
	}
}