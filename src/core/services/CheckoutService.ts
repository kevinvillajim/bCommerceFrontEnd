import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {extractErrorMessage} from "../../utils/errorHandler";
import type {Address} from "../domain/valueObjects/Address";
import type {ShoppingCart} from "../domain/entities/ShoppingCart";

export type PaymentMethod = "credit_card" | "paypal" | "transfer" | "qr" | "datafast" | "debit_card" | "de_una";

export interface PaymentInfo {
	method: PaymentMethod;
	card_number?: string;
	card_expiry?: string;
	card_cvc?: string;
	paypal_email?: string;
}

export interface CheckoutRequest {
	payment: PaymentInfo;
	shippingAddress: Address;
	billingAddress?: Address;
	seller_id?: number;
	items?: Array<{
		product_id: number;
		quantity: number;
		price: number;
	}>;
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
	items?: Array<{
		product_id: number;
		quantity: number;
		price: number;
	}>;
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
	 * Convierte Address a formato de shipping requerido por el backend
	 */
	private static convertAddressToShipping(address: Address, userEmail?: string): CheckoutRequest['shipping'] {
		const nameParts = address.name.split(' ');
		const firstName = nameParts[0] || '';
		const lastName = nameParts.slice(1).join(' ') || '';

		return {
			first_name: firstName,
			last_name: lastName,
			email: userEmail || '',
			phone: address.phone,
			address: address.street,
			city: address.city,
			state: address.state,
			postal_code: address.postalCode,
			country: address.country
		};
	}

	/**
	 * Procesar el pago y finalizar la compra
	 */
	async processCheckout(
		checkoutData: CheckoutRequest,
		userEmail?: string
	): Promise<CheckoutResponse> {
		try {
			console.log("🚀 CheckoutService.processCheckout INICIADO");
			console.log(
				"📦 Datos de checkout enviados:",
				JSON.stringify(checkoutData, null, 2)
			);

			console.log("🛒 Verificando estado del carrito antes del checkout...");

			console.log("📞 Llamando a API:", API_ENDPOINTS.CHECKOUT.PROCESS);

			console.log("🔍 DEBUGGING - Método original:", checkoutData.payment.method);

			// Mapear método de pago a los valores exactos del backend
			let paymentMethod: PaymentMethod = checkoutData.payment.method;
			if (paymentMethod === "transfer") {
				paymentMethod = "datafast" as PaymentMethod;
			} else if (paymentMethod === "credit_card") {
				paymentMethod = "credit_card" as PaymentMethod;
			}

			console.log("🔍 DEBUGGING - Método después de mapear:", paymentMethod);

			// Mapear dirección a formato requerido por backend
			const nameParts = (checkoutData.shippingAddress.name || '').split(' ');
			const backendData: BackendCheckoutRequest = {
				payment: {
					...checkoutData.payment,
					method: paymentMethod
				},
				shipping: {
					first_name: nameParts[0] || '',
					last_name: nameParts.slice(1).join(' ') || '',
					email: userEmail || '',
					phone: checkoutData.shippingAddress.phone || '',
					address: checkoutData.shippingAddress.street || '',
					city: checkoutData.shippingAddress.city || '',
					state: checkoutData.shippingAddress.state || '',
					postal_code: checkoutData.shippingAddress.postalCode || '',
					country: checkoutData.shippingAddress.country || ''
				},
				seller_id: checkoutData.seller_id,
				items: checkoutData.items
			};

			console.log("🔍 DEBUGGING - Datos completos que se enviarán al backend:", JSON.stringify(backendData, null, 2));

			const response = await ApiClient.post<CheckoutResponse>(
				API_ENDPOINTS.CHECKOUT.PROCESS,
				backendData
			);

			console.log("✅ CheckoutService: Respuesta COMPLETA del backend:");
			console.log("📊 Status:", response.status);
			console.log("💬 Message:", response.message);
			console.log("📦 Data completa:", JSON.stringify(response.data, null, 2));

			if (response.data && typeof response.data === "object") {
				const dataObj = response.data as any;
				if (dataObj.items) {
					console.log("🔍 ANÁLISIS DETALLADO DE ITEMS:");
					console.log("📊 Total de items en respuesta:", dataObj.items.length);

					const itemsByProductId = dataObj.items.reduce(
						(acc: any, item: any, index: number) => {
							console.log(`📋 Item ${index + 1}:`, {
								id: item.id,
								product_id: item.product_id,
								product_name: item.product_name,
								quantity: item.quantity,
								price: item.price,
								completeItem: item,
							});

							if (!acc[item.product_id]) {
								acc[item.product_id] = [];
							}
							acc[item.product_id].push(item);
							return acc;
						},
						{}
					);

					console.log("🔍 Items agrupados por product_id:", itemsByProductId);

					Object.keys(itemsByProductId).forEach((productId) => {
						const items = itemsByProductId[productId];
						if (items.length > 1) {
							console.warn(`⚠️ DUPLICADO DETECTADO para product_id ${productId}:`, items);
							console.warn(`❌ Se encontraron ${items.length} registros para el mismo producto`);
						}
					});
				}
			}

			console.log("🎉 CheckoutService.processCheckout COMPLETADO");
			return response;
		} catch (error) {
			console.error("❌ CheckoutService: Error COMPLETO al procesar checkout:");
			console.error("📊 Error object:", error);
			console.error("📊 Error message:", (error as any)?.message);
			console.error("📊 Error response:", (error as any)?.response);
			console.error("📊 Error response data:", (error as any)?.response?.data);

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
}