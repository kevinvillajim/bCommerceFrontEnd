// src/presentation/pages/CheckoutPage.tsx
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../hooks/useCart";
import {useAuth} from "../hooks/useAuth"; // ✅ AGREGAR PARA OBTENER DATOS DEL USUARIO
import {CheckoutService} from "../../core/services/CheckoutService";
import type {
	ShippingInfo,
	PaymentInfo,
	PaymentMethod,
} from "../../core/services/CheckoutService";
import {NotificationType} from "../contexts/CartContext";
import CreditCardForm from "../components/checkout/CreditCardForm";
import QRPaymentForm from "../components/checkout/QRPaymentForm"; 
import OrderSummary from "../components/checkout/OrderSummary";
import ShippingForm from "../components/checkout/ShippingForm";
import TestCheckoutButton from "../components/checkout/TestCheckoutButton";
import { extractErrorMessage } from "../../utils/errorHandler";
import DatafastPaymentButton from "../components/checkout/DatafastPaymentButtonProps";

const CheckoutPage: React.FC = () => {
	const navigate = useNavigate();
	const {cart, clearCart, showNotification} = useCart();
	const {user} = useAuth(); // ✅ OBTENER DATOS DEL USUARIO
	const [isLoading, setIsLoading] = useState(false);
	
	// ✅ SOLO TARJETA DE CRÉDITO Y DEUNA (antes QR)
	const [paymentMethod, setPaymentMethod] = useState<
		"credit_card" | "deuna"
	>("credit_card");
	
	// ✅ INICIALIZAR CON DATOS DEL USUARIO
	const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
		address: "",
		city: "",
		state: "",
		country: "",
		postal_code: "",
		phone: "",
	});
	
	const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
		method: "credit_card",
		card_number: "",
		card_expiry: "",
		card_cvc: "",
	});
	
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [orderComplete, setOrderComplete] = useState(false);
	const [orderDetails, setOrderDetails] = useState<any>(null);

	const checkoutService = new CheckoutService();

	// ✅ CARGAR DATOS DEL USUARIO AL MONTAR EL COMPONENTE
	useEffect(() => {
		if (user) {
			setShippingInfo({
				address: user.address || "",
				city: user.city || "",
				state: user.state || user.province || "",
				country: user.country || "Ecuador",
				postal_code: user.postal_code || user.zip_code || "",
				phone: user.phone || "",
			});
		}
	}, [user]);

	const handleSuccess = (orderData: any) => {
		console.log("Pago exitoso:", orderData);
	};

	const handleError = (error: string) => {
		console.error("Error:", error);
	};

	// Verificar si el carrito está vacío
	useEffect(() => {
		if (!cart || cart.items.length === 0) {
			showNotification(NotificationType.ERROR, "El carrito está vacío");
			navigate("/cart");
		}
	}, [cart, navigate, showNotification]);

	// ✅ ACTUALIZAR TIPOS DE MÉTODO DE PAGO
	const handlePaymentMethodChange = (method: "credit_card" | "deuna") => {
		setPaymentMethod(method);
		setPaymentInfo({
			...paymentInfo, 
			method: method === "deuna" ? "transfer" : method
		});
	};

	// Actualizar información de envío
	const handleShippingChange = (field: keyof ShippingInfo, value: string) => {
		setShippingInfo({...shippingInfo, [field]: value});
		// Limpiar error si el campo tiene valor
		if (value.trim() && formErrors[field]) {
			const newErrors = {...formErrors};
			delete newErrors[field];
			setFormErrors(newErrors);
		}
	};

	// Actualizar información de pago
	const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
		setPaymentInfo({...paymentInfo, [field]: value});
		// Limpiar error si el campo tiene valor
		if (value.trim() && formErrors[field]) {
			const newErrors = {...formErrors};
			delete newErrors[field];
			setFormErrors(newErrors);
		}
	};

	// Validar el formulario
	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		// Validar información de envío
		const requiredShippingFields: (keyof ShippingInfo)[] = [
			"address",
			"city",
			"state",
			"country",
			"postal_code",
			"phone",
		];
		requiredShippingFields.forEach((field) => {
			if (!shippingInfo[field]) {
				errors[field] = `El campo ${field.replace("_", " ")} es obligatorio`;
			}
		});

		// ✅ VALIDAR SOLO TARJETA DE CRÉDITO (DeUna no necesita validación de campos)
		if (paymentMethod === "credit_card") {
			if (!paymentInfo.card_number) {
				errors.card_number = "El número de tarjeta es obligatorio";
			} else if (!/^\d{16}$/.test(paymentInfo.card_number || "")) {
				errors.card_number = "El número de tarjeta debe tener 16 dígitos";
			}

			if (!paymentInfo.card_expiry) {
				errors.card_expiry = "La fecha de expiración es obligatoria";
			} else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.card_expiry || "")) {
				errors.card_expiry = "El formato debe ser MM/YY";
			}

			if (!paymentInfo.card_cvc) {
				errors.card_cvc = "El código de seguridad es obligatorio";
			} else if (!/^\d{3,4}$/.test(paymentInfo.card_cvc || "")) {
				errors.card_cvc = "El código debe tener 3 o 4 dígitos";
			}
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Procesar el checkout
	const processCheckout = async () => {
		if (!validateForm()) {
			showNotification(
				NotificationType.ERROR,
				"Por favor, completa todos los campos obligatorios"
			);
			return;
		}

		setIsLoading(true);

		try {
			const checkoutData = {
				payment: {
					...paymentInfo,
					method: paymentMethod === "deuna" ? ("transfer" as PaymentMethod) : paymentMethod,
				},
				shipping: shippingInfo,
			};

			const response = await checkoutService.processCheckout(checkoutData);

			if (response.status === "success") {
				setOrderComplete(true);
				setOrderDetails(response.data);
				showNotification(
					NotificationType.SUCCESS,
					"¡Pedido completado con éxito!"
				);
				clearCart();
			} else {
				throw new Error(response.message || "Error al procesar el pedido");
			}
		} catch (error) {
			console.error("Error al procesar checkout:", error);

			const errorMessage = extractErrorMessage(
				error,
				"Error al procesar el pago. Por favor, intenta de nuevo más tarde."
			);

			showNotification(NotificationType.ERROR, errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	// Si el pedido está completo, mostrar pantalla de éxito
	if (orderComplete && orderDetails) {
		return (
			<div className="container mx-auto px-4 py-10">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
					<div className="text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-10 w-10 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h2 className="text-3xl font-bold text-gray-800 mb-4">
							¡Pedido realizado con éxito!
						</h2>
						<p className="text-gray-600 mb-6">
							Tu pedido ha sido procesado correctamente. Hemos enviado un correo
							electrónico con los detalles.
						</p>
					</div>

					<div className="border-t border-gray-200 pt-4 pb-2 mb-4">
						<h3 className="text-lg font-semibold mb-2">Detalles del pedido:</h3>
						<div className="flex justify-between py-2">
							<span className="text-gray-600">Número de orden:</span>
							<span className="font-medium">{orderDetails.order_number}</span>
						</div>
						<div className="flex justify-between py-2">
							<span className="text-gray-600">Total:</span>
							<span className="font-medium">{orderDetails.total}</span>
						</div>
						<div className="flex justify-between py-2">
							<span className="text-gray-600">Estado del pago:</span>
							<span
								className={`font-medium ${orderDetails.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}
							>
								{orderDetails.payment_status === "paid"
									? "Pagado"
									: orderDetails.payment_status}
							</span>
						</div>
					</div>

					<div className="flex justify-center space-x-4 mt-6">
						<button
							onClick={() => navigate("/")}
							className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						>
							Volver a la tienda
						</button>
						<button
							onClick={() => navigate("/orders")}
							className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Ver mis pedidos
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Mostrar página de checkout
	return (
		<div className="container mx-auto px-4 py-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Finalizar compra</h1>
				<TestCheckoutButton />
			</div>

			<div className="flex flex-col lg:flex-row gap-8">
				{/* Formulario de checkout */}
				<div className="lg:w-2/3">
					{/* Información de envío/facturación */}
					<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
						<h2 className="text-xl font-bold mb-4">Información de facturación y envío</h2>
						<ShippingForm
							shippingInfo={shippingInfo}
							errors={formErrors}
							onChange={handleShippingChange}
						/>
					</div>

					{/* Métodos de pago */}
					<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
						<h2 className="text-xl font-bold mb-4">Método de pago</h2>

						{/* ✅ SOLO OPCIONES DE TARJETA DE CRÉDITO Y DEUNA */}
						<div className="flex flex-wrap gap-4 mb-6">
							<button
								type="button"
								onClick={() => handlePaymentMethodChange("credit_card")}
								className={`flex items-center border rounded-lg px-4 py-3 ${
									paymentMethod === "credit_card"
										? "border-primary-600 bg-primary-50 text-primary-600"
										: "border-gray-300 hover:bg-gray-50"
								}`}
							>
								<span className="mr-2">💳</span>
								<span>Tarjeta de crédito</span>
							</button>
							
							<button
								type="button"
								onClick={() => handlePaymentMethodChange("deuna")}
								className={`flex items-center border rounded-lg px-4 py-3 ${
									paymentMethod === "deuna"
										? "border-primary-600 bg-primary-50 text-primary-600"
										: "border-gray-300 hover:bg-gray-50"
								}`}
							>
								<span className="mr-2">🚀</span>
								<span>Pago con DeUna!</span>
							</button>
						</div>

						{/* Formulario según método de pago seleccionado */}
						{paymentMethod === "credit_card" && (
							<CreditCardForm
								paymentInfo={paymentInfo}
								errors={formErrors}
								onChange={handlePaymentChange}
								content={<DatafastPaymentButton
									onSuccess={handleSuccess}
									onError={handleError}
								/>}
							/>
						)}

						{paymentMethod === "deuna" && <QRPaymentForm />}
					</div>
				</div>

				{/* Resumen del pedido */}
				<div className="lg:w-1/3">
					<div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
						<OrderSummary cart={cart} />

						<button
							onClick={processCheckout}
							disabled={isLoading}
							className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
						>
							{isLoading ? (
								<>
									<svg
										className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Procesando...
								</>
							) : (
								"Finalizar compra"
							)}
						</button>

						<p className="mt-4 text-xs text-gray-500 text-center">
							Al hacer clic en "Finalizar compra", aceptas nuestros{" "}
							<a href="/terms" className="text-primary-600 hover:underline">
								Términos y condiciones
							</a>{" "}
							y{" "}
							<a href="/privacy" className="text-primary-600 hover:underline">
								Política de privacidad
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CheckoutPage;