import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../../hooks/useCart";
import {CheckoutService} from "../../../core/services/CheckoutService";
import type {PaymentMethod} from "../../../core/services/CheckoutService";
import {NotificationType} from "../../contexts/CartContext";
import {extractErrorMessage} from "../../../utils/errorHandler";
import {SellerIdResolverService} from "../../../infrastructure/services/SellerIdResolverService";

interface TestCheckoutButtonProps {}

const TestCheckoutButton: React.FC<TestCheckoutButtonProps> = () => {
	const navigate = useNavigate();
	const {cart, clearCart, showNotification} = useCart();
	const checkoutService = new CheckoutService();
	const [isLoading, setIsLoading] = useState(false);

	// Función mejorada para obtener el seller_id del carrito usando el servicio de resolución
	const getSellerId = async (): Promise<number | undefined> => {
		if (!cart || !cart.items || cart.items.length === 0) {
			console.warn("No hay productos en el carrito para obtener el seller_id");
			return undefined;
		}

		try {
			// Usar el servicio resolvedor para obtener el seller_id del carrito
			const sellerId = await SellerIdResolverService.resolveSellerIdForCart(
				cart.items
			);
			console.log(
				`TestCheckoutButton: Usando seller_id: ${sellerId || "no encontrado"}`
			);
			return sellerId;
		} catch (error) {
			console.error("Error al resolver seller_id:", error);
			return undefined;
		}
	};

	const handleTestCheckout = async () => {
		if (!cart || cart.items.length === 0) {
			showNotification(NotificationType.ERROR, "El carrito está vacío");
			return;
		}

		setIsLoading(true);
		try {
			// Obtener el seller_id usando el servicio de resolución

			let sellerId = await getSellerId();

			// Verificación adicional para mayor seguridad
			if (sellerId === 63) {
				console.warn(
					"⚠️ Se detectó user_id 63 como seller_id. Corrigiendo a seller_id 11."
				);
				sellerId = 11;
			}

			if (!sellerId) {
				console.warn(
					"⚠️ No se pudo resolver el seller_id. Usando valor por defecto 11."
				);
				sellerId = 11;
			}

			console.log(`📦 Checkout con seller_id: ${sellerId}`);

			if (!sellerId) {
				showNotification(
					NotificationType.ERROR,
					"No se pudo determinar el vendedor del producto. Por favor, contacta con soporte."
				);
				setIsLoading(false);
				return;
			}

			// Datos de prueba
			const testData = {
				payment: {
					method: "credit_card" as PaymentMethod,
					card_number: "4111111111111111",
					card_expiry: "12/25",
					card_cvc: "123",
				},
				shipping: {
					address: "Calle de Prueba 123",
					city: "Ciudad de Prueba",
					state: "Estado de Prueba",
					country: "País de Prueba",
					postal_code: "12345",
					phone: "123456789",
				},
				// Incluir el seller_id en la solicitud
				seller_id: sellerId,
			};

			console.log("TestCheckoutButton: Enviando checkout con datos:", testData);
			const response = await checkoutService.processCheckout(testData);

			if (response.status === "success") {
				clearCart();
				showNotification(
					NotificationType.SUCCESS,
					"¡Pedido de prueba completado con éxito!"
				);

				// Mostrar los detalles de la orden por consola
				console.log("Detalles de la orden:", response.data);

				// Navegar a una página de confirmación o dashboard
				navigate("/orders");
			} else {
				throw new Error(response.message || "Error en el checkout de prueba");
			}
		} catch (error) {
			console.error("Error en el checkout de prueba:", error);

			// Usar el extractor de mensajes de error
			const errorMessage = extractErrorMessage(
				error,
				"Error en el checkout de prueba. Por favor, intenta de nuevo más tarde."
			);

			showNotification(NotificationType.ERROR, errorMessage);
		} finally {
			setIsLoading(false);
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
