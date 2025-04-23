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
	const {cart, clearCart, showNotification} = useCart();
	const checkoutService = new CheckoutService();
	const [isLoading, setIsLoading] = useState(false);

	// Obtener el seller_id del primer producto en el carrito
	const getSellerId = (): number | undefined => {
		if (!cart || !cart.items || cart.items.length === 0) {
			return undefined;
		}

		// Intentar obtener el seller_id del primer producto
		const firstItem = cart.items[0];

		// El seller_id puede estar en diferentes propiedades dependiendo de la estructura de datos
		const sellerId =
			// Primero en el product directamente
			firstItem.product?.sellerId ||
			firstItem.product?.seller_id ||
			// Luego, si hay un objeto 'seller' dentro de product
			firstItem.product?.seller?.id ||
			// Por último, si user_id es en realidad el seller_id en algunos casos
			firstItem.product?.user_id;

		if (!sellerId) {
			console.warn(
				"TestCheckoutButton: No se pudo determinar el seller_id del producto:",
				firstItem
			);
		}

		return sellerId;
	};

	const handleTestCheckout = async () => {
		if (!cart || cart.items.length === 0) {
			showNotification(NotificationType.ERROR, "El carrito está vacío");
			return;
		}

		setIsLoading(true);
		try {
			// Obtener el seller_id
			const sellerId = getSellerId();

			if (!sellerId) {
				console.warn(
					"TestCheckoutButton: No se pudo obtener el seller_id para el checkout de prueba"
				);
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

			console.log(
				"TestCheckoutButton: Enviando checkout con seller_id:",
				sellerId
			);
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
