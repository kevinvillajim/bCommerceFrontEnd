import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {extractErrorMessage} from "../../utils/errorHandler";
import type {Address} from "../domain/valueObjects/Address";
import type {ShoppingCart} from "../domain/entities/ShoppingCart";

export type PaymentMethod = "credit_card" | "paypal" | "transfer" | "qr";

export interface PaymentInfo {
	method: PaymentMethod;
	card_number?: string;
	card_expiry?: string;
	card_cvc?: string;
	paypal_email?: string;
}

// Re-using Address for shipping information
export type ShippingInfo = Address;

export interface CheckoutRequest {
	payment: PaymentInfo;
	shippingAddress: Address;
	billingAddress?: Address;
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

		// Buscar el seller ID en el primer item del carrito
		const firstItem = cart.items[0];
		console.log("🛒 getSellerIdFromCart: Primer item del carrito:", firstItem);

		if (firstItem.product) {
			console.log("🛒 getSellerIdFromCart: Producto encontrado:", {
				sellerId: firstItem.product.sellerId,
				seller_id: firstItem.product.seller_id,
				seller: firstItem.product.seller,
				user_id: firstItem.product.user_id,
			});

			// Prioridad 1: sellerId en el producto
			if (firstItem.product.sellerId) {
				console.log(
					"✅ getSellerIdFromCart: Usando sellerId:",
					firstItem.product.sellerId
				);
				return firstItem.product.sellerId;
			}

			// Prioridad 2: seller_id en el producto
			if (firstItem.product.seller_id) {
				console.log(
					"✅ getSellerIdFromCart: Usando seller_id:",
					firstItem.product.seller_id
				);
				return firstItem.product.seller_id;
			}

			// Prioridad 3: seller.id en el producto
			if (firstItem.product.seller && firstItem.product.seller.id) {
				console.log(
					"✅ getSellerIdFromCart: Usando seller.id:",
					firstItem.product.seller.id
				);
				return firstItem.product.seller.id;
			}

			// Prioridad 4: user_id como fallback
			if (firstItem.product.user_id) {
				console.log(
					"✅ getSellerIdFromCart: Usando user_id como fallback:",
					firstItem.product.user_id
				);
				return firstItem.product.user_id;
			}
		}

		console.warn(
			"❌ getSellerIdFromCart: No se pudo obtener seller ID del carrito:",
			cart
		);
		return null;
	}

	/**
	 * Procesar el pago y finalizar la compra
	 */
	async processCheckout(
		checkoutData: CheckoutRequest
	): Promise<CheckoutResponse> {
		try {
			console.log("🚀 CheckoutService.processCheckout INICIADO");
			console.log(
				"📦 Datos de checkout enviados:",
				JSON.stringify(checkoutData, null, 2)
			);

			// ✅ NUEVO: Verificar si hay algún carrito activo antes del checkout
			console.log("🛒 Verificando estado del carrito antes del checkout...");

			// Aquí podrías agregar una llamada para obtener el carrito actual
			// const currentCart = await this.getCurrentCart();
			// console.log("🛒 Carrito actual:", currentCart);

			console.log("📞 Llamando a API:", API_ENDPOINTS.CHECKOUT.PROCESS);

			const response = await ApiClient.post<CheckoutResponse>(
				API_ENDPOINTS.CHECKOUT.PROCESS,
				checkoutData
			);

			console.log("✅ CheckoutService: Respuesta COMPLETA del backend:");
			console.log("📊 Status:", response.status);
			console.log("💬 Message:", response.message);
			console.log("📦 Data completa:", JSON.stringify(response.data, null, 2));

			// ✅ NUEVO: Verificar específicamente los items si están en la respuesta
			if (response.data && typeof response.data === "object") {
				const dataObj = response.data as any;
				if (dataObj.items) {
					console.log("🔍 ANÁLISIS DETALLADO DE ITEMS:");
					console.log("📊 Total de items en respuesta:", dataObj.items.length);

					// Agrupar por product_id para detectar duplicados
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

					// Detectar duplicados
					Object.keys(itemsByProductId).forEach((productId) => {
						const items = itemsByProductId[productId];
						if (items.length > 1) {
							console.warn(
								`⚠️ DUPLICADO DETECTADO para product_id ${productId}:`,
								items
							);
							console.warn(
								`❌ Se encontraron ${items.length} registros para el mismo producto`
							);
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

			// Extraer un mensaje de error amigable del error
			const errorMessage = extractErrorMessage(
				error,
				"Error al procesar el pago. Por favor, intenta de nuevo más tarde."
			);

			console.error("📊 Error message final:", errorMessage);
			throw new Error(errorMessage);
		}
	}

	/**
	 * ✅ NUEVO: Método para obtener el carrito actual (si existe un endpoint)
	 */
	async getCurrentCart(): Promise<any> {
		try {
			console.log("🛒 Obteniendo carrito actual...");
			// Aquí podrías hacer una llamada al endpoint del carrito si existe
			// const cart = await ApiClient.get('/cart');
			// return cart;
			return null; // Por ahora retornar null
		} catch (error) {
			console.error("❌ Error al obtener carrito actual:", error);
			return null;
		}
	}
}
