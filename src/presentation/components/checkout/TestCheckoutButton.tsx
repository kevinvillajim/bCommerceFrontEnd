import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../../hooks/useCart";
import {CheckoutService} from "../../../core/services/CheckoutService";
import type {PaymentMethod} from "../../../core/services/CheckoutService";
import {NotificationType} from "../../contexts/CartContext";
import {extractErrorMessage} from "../../../utils/errorHandler";

interface TestCheckoutButtonProps {}

const TestCheckoutButton: React.FC<TestCheckoutButtonProps> = () => {
	const navigate = useNavigate();
	const {cart, clearCart, showNotification, appliedDiscount} = useCart();
	const checkoutService = new CheckoutService();
	const [isLoading, setIsLoading] = useState(false);

	const handleTestCheckout = async () => {
		console.log("🧪 TestCheckoutButton.handleTestCheckout INICIADO");

		if (!cart || cart.items.length === 0) {
			console.log("❌ Carrito vacío, abortando checkout");
			showNotification(NotificationType.ERROR, "El carrito está vacío");
			return;
		}

		console.log("🛒 ANÁLISIS COMPLETO DEL CARRITO ANTES DEL CHECKOUT:");
		console.log("📊 Cart completo:", JSON.stringify(cart, null, 2));
		console.log("📊 Total de items en carrito:", cart.items.length);
		console.log("📊 Total del carrito:", cart.total);

		// ✅ NUEVO: Análisis detallado de cada item
		console.log("🔍 ANÁLISIS ITEM POR ITEM:");
		cart.items.forEach((item, index) => {
			console.log(`📋 Item ${index + 1}:`, {
				id: item.id,
				productId: item.productId,
				quantity: item.quantity,
				price: item.price,
				product: item.product ? {
					id: item.product.id,
					name: item.product.name,
					price: item.product.price,
					sellerId: item.product.sellerId,
					seller_id: item.product.seller_id,
					user_id: item.product.user_id
				} : null,
				completeItem: item
			});
		});

		// ✅ NUEVO: Detectar duplicados en el carrito
		console.log("🔍 VERIFICANDO DUPLICADOS EN EL CARRITO:");
		const itemsByProductId = cart.items.reduce((acc: any, item, index) => {
			if (!acc[item.productId]) {
				acc[item.productId] = [];
			}
			acc[item.productId].push({index, item});
			return acc;
		}, {});

		console.log("📊 Items agrupados por productId:", itemsByProductId);

		Object.keys(itemsByProductId).forEach(productId => {
			const items = itemsByProductId[productId];
			if (items.length > 1) {
				console.warn(`⚠️ DUPLICADO EN CARRITO DETECTADO para productId ${productId}:`);
				console.warn(`❌ Se encontraron ${items.length} items para el mismo producto`);
				items.forEach((itemData: any, i: number) => {
					console.warn(`   ${i + 1}. Item[${itemData.index}]:`, itemData.item);
				});
			} else {
				console.log(`✅ Producto ${productId}: Sin duplicados (${items[0].item.quantity} unidades)`);
			}
		});

		setIsLoading(true);
		try {
			// ✅ OBTENER SELLER_ID DEL CARRITO
			const sellerId = CheckoutService.getSellerIdFromCart(cart);
			console.log("🏪 Seller ID obtenido para test:", sellerId);

			// ✅ CORREGIDO: Construir items del carrito con precios válidos
			const items = cart.items.map(item => {
				// Priorizar precios válidos: product.final_price > product.price > item.price > subtotal/quantity
				let price = 0;
				
				if (item.product?.final_price && item.product.final_price > 0) {
					price = item.product.final_price;
				} else if (item.product?.price && item.product.price > 0) {
					price = item.product.price;
				} else if (item.price && item.price > 0) {
					price = item.price;
				} else if (item.subtotal && item.quantity > 0) {
					price = item.subtotal / item.quantity;
				} else {
					console.warn(`⚠️ No se pudo determinar precio para producto ${item.productId}, usando 1.00`);
					price = 1.00; // Precio mínimo como fallback
				}
				
				return {
					product_id: item.productId,
					quantity: item.quantity,
					price: price
				};
			});

			console.log("🛒 Items formateados para backend:", JSON.stringify(items, null, 2));

			// Datos de prueba - agregado seller_id y items
			const testData = {
				payment: {
					method: "credit_card" as PaymentMethod,
					card_number: "4111111111111111",
					card_expiry: "12/25",
					card_cvc: "123",
				},
				shippingAddress: {
					name: "Test User",
					street: "Calle de Prueba 123",
					city: "Ciudad de Prueba",
					state: "Estado de Prueba",
					postalCode: "12345",
					country: "País de Prueba",
					phone: "123456789",
				},
				seller_id: sellerId || undefined,
				items: items, // ✅ AGREGAR ITEMS CON PRECIOS VÁLIDOS
				// ✅ NUEVO: Incluir código de descuento aplicado y su información
				discount_code: appliedDiscount?.discountCode?.code || null,
				discount_info: appliedDiscount || null // ✅ Pasar información completa del descuento
			};

			console.log("📦 Datos completos de checkout de prueba:", JSON.stringify(testData, null, 2));
			console.log("🚀 Enviando checkout al backend...");

			const response = await checkoutService.processCheckout(testData);

			console.log("✅ Respuesta del checkout recibida:", response);

			if (response.status === "success") {
				console.log("🎉 Checkout exitoso, limpiando carrito...");
				clearCart();
				showNotification(
					NotificationType.SUCCESS,
					"¡Pedido de prueba completado con éxito!"
				);

				// Mostrar los detalles de la orden por consola
				console.log("📊 Detalles COMPLETOS de la orden:", JSON.stringify(response.data, null, 2));

				// ✅ NUEVO: Análisis específico de la respuesta
				if (response.data && typeof response.data === 'object') {
					const orderData = response.data as any;
					console.log("🔍 ANÁLISIS DE LA ORDEN CREADA:");
					console.log("📊 Order ID:", orderData.order_id);
					console.log("📊 Order Number:", orderData.order_number);
					console.log("📊 Total:", orderData.total);
					
					if (orderData.items) {
						console.log("📊 Items en la orden creada:", orderData.items.length);
						orderData.items.forEach((item: any, index: number) => {
							console.log(`📋 Order Item ${index + 1}:`, {
								id: item.id,
								product_id: item.product_id,
								product_name: item.product_name,
								quantity: item.quantity,
								price: item.price
							});
						});
					}
				}

				// Navegar a una página de confirmación o dashboard
				navigate("/orders");
			} else {
				throw new Error(response.message || "Error en el checkout de prueba");
			}
		} catch (error) {
			console.error("❌ Error COMPLETO en el checkout de prueba:");
			console.error("📊 Error object:", error);
			console.error("📊 Error stack:", (error as any)?.stack);

			// Usar el extractor de mensajes de error
			const errorMessage = extractErrorMessage(
				error,
				"Error en el checkout de prueba. Por favor, intenta de nuevo más tarde."
			);

			console.error("📊 Error message final:", errorMessage);
			showNotification(NotificationType.ERROR, errorMessage);
		} finally {
			setIsLoading(false);
			console.log("🧪 TestCheckoutButton.handleTestCheckout FINALIZADO");
		}
	};

	return (
		<button
			onClick={handleTestCheckout}
			disabled={isLoading}
			className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors flex items-center disabled:opacity-50"
		>
			{isLoading ? (
				<span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
			) : null}
			Prueba rápida de checkout
		</button>
	);
};

export default TestCheckoutButton;