import React, {useState, useRef, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../../hooks/useCart";
import {DatafastService} from "../../../core/services/DatafastService";
import type {DatafastCheckoutRequest} from "../../../core/services/DatafastService";
import {NotificationType} from "../../contexts/CartContext";

interface DatafastPaymentButtonProps {
	onSuccess?: (orderData: any) => void;
	onError?: (error: string) => void;
}

const DatafastPaymentButton: React.FC<DatafastPaymentButtonProps> = ({
	onSuccess,
	onError,
}) => {
	const navigate = useNavigate();
	const {cart, clearCart, showNotification} = useCart();
	const [isLoading, setIsLoading] = useState(false);
	const [showWidget, setShowWidget] = useState(false);
	const [checkoutData, setCheckoutData] = useState<any>(null);
	const [showForm, setShowForm] = useState(false);

	// Datos del formulario básico
	const [formData, setFormData] = useState({
		address: "Av. Test 123",
		city: "Quito",
		country: "EC",
		given_name: "Juan",
		middle_name: "Carlos",
		surname: "Pérez",
		phone: "0999999999",
		doc_id: "1234567890",
	});

	const widgetContainerRef = useRef<HTMLDivElement>(null);
	const datafastService = new DatafastService();

	// Limpiar widget al desmontar componente
	useEffect(() => {
		return () => {
			datafastService.removeWidget();
		};
	}, []);

	// Manejar cambios en el formulario
	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({...prev, [field]: value}));
	};

	// Iniciar proceso de pago con Datafast
	const handleStartPayment = async () => {
		if (!cart || cart.items.length === 0) {
			showNotification(NotificationType.ERROR, "El carrito está vacío");
			return;
		}

		setIsLoading(true);
		try {
			// Preparar datos para Datafast
			const requestData: DatafastCheckoutRequest = {
				shipping: {
					address: formData.address,
					city: formData.city,
					country: formData.country,
				},
				customer: {
					given_name: formData.given_name,
					middle_name: formData.middle_name,
					surname: formData.surname,
					phone: formData.phone,
					doc_id: formData.doc_id,
				},
			};

			console.log("Iniciando checkout con Datafast...", requestData);

			// Crear checkout en backend
			const response = await datafastService.createCheckout(requestData);

			if (response.success && response.data) {
				setCheckoutData(response.data);
				setShowForm(false);
				setShowWidget(true);

				// Cargar widget de Datafast
				await datafastService.loadWidget(
					response.data.checkout_id,
					"datafast-widget-container"
				);

				// Configurar el formulario de pago
				setTimeout(() => {
					setupDatafastForm(response.data!);
				}, 1000);

				showNotification(
					NotificationType.SUCCESS,
					"Checkout creado. Complete el pago en el formulario."
				);
			} else {
				throw new Error(response.message || "Error al crear checkout");
			}
		} catch (error) {
			console.error("Error al iniciar pago con Datafast:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Error desconocido";
			showNotification(NotificationType.ERROR, errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	// Configurar el formulario de Datafast
	const setupDatafastForm = (checkoutData: any) => {
		try {
			// URL de retorno para procesar la respuesta
			const shopperResultURL = `${window.location.origin}/datafast-result`;

			// Crear el formulario dinámicamente
			const form = document.createElement("form");
			form.action = shopperResultURL;
			form.className = "paymentWidgets";
			form.setAttribute("data-brands", "VISA MASTER AMEX DINERS DISCOVER");

			// Insertar formulario en el container
			const container = document.getElementById("datafast-widget-container");
			if (container) {
				container.innerHTML = "";
				container.appendChild(form);
			}

			console.log("Formulario de Datafast configurado:", {
				checkout_id: checkoutData.checkout_id,
				amount: checkoutData.amount,
				transaction_id: checkoutData.transaction_id,
			});
		} catch (error) {
			console.error("Error al configurar formulario de Datafast:", error);
		}
	};

	// Verificar pago después del proceso
	const handleVerifyPayment = async (resourcePath: string) => {
		if (!checkoutData) {
			showNotification(NotificationType.ERROR, "No hay datos de checkout");
			return;
		}

		setIsLoading(true);
		try {
			console.log("Verificando pago con resourcePath:", resourcePath);

			const verifyResponse = await datafastService.verifyPayment({
				resource_path: resourcePath,
				transaction_id: checkoutData.transaction_id,
			});

			if (verifyResponse.success && verifyResponse.data) {
				// Pago exitoso
				clearCart();
				setShowWidget(false);

				showNotification(
					NotificationType.SUCCESS,
					"¡Pago completado exitosamente!"
				);

				onSuccess?.(verifyResponse.data);

				// Navegar a página de éxito
				navigate("/orders");
			} else {
				throw new Error(verifyResponse.message || "Pago no completado");
			}
		} catch (error) {
			console.error("Error al verificar pago:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Error al verificar pago";
			showNotification(NotificationType.ERROR, errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	// Manejar resultado de Datafast (simulado para pruebas)
	const handleSimulatePaymentResult = () => {
		// Simular resourcePath para pruebas
		const mockResourcePath =
			"/v1/checkouts/" + (checkoutData?.checkout_id || "test") + "/payment";
		handleVerifyPayment(mockResourcePath);
	};

	if (showWidget) {
		return (
			<div className="datafast-payment-widget">
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h3 className="text-xl font-bold mb-4">Pagar con Datafast</h3>

					<div className="mb-4 p-4 bg-blue-50 rounded-lg">
						<h4 className="font-semibold text-blue-800">
							Información del pedido:
						</h4>
						<p className="text-blue-700">Monto: ${checkoutData?.amount}</p>
						<p className="text-blue-700">ID: {checkoutData?.transaction_id}</p>
					</div>

					{/* Container para el widget de Datafast */}
					<div
						id="datafast-widget-container"
						ref={widgetContainerRef}
						className="min-h-[400px] border border-gray-200 rounded-lg p-4"
					>
						<div className="flex items-center justify-center h-full">
							<div className="text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
								<p className="text-gray-600">Cargando formulario de pago...</p>
							</div>
						</div>
					</div>

					{/* Botones de control */}
					<div className="mt-6 flex gap-4">
						<button
							onClick={handleSimulatePaymentResult}
							disabled={isLoading}
							className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
						>
							{isLoading ? "Verificando..." : "Simular Pago Exitoso"}
						</button>

						<button
							onClick={() => {
								setShowWidget(false);
								setShowForm(true);
								datafastService.removeWidget();
							}}
							disabled={isLoading}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
						>
							Cancelar
						</button>
					</div>

					<div className="mt-4 text-sm text-gray-500">
						<p>
							<strong>Para pruebas, usar estos datos:</strong>
						</p>
						<p>Tarjeta: 4200 0000 0000 0000</p>
						<p>Fecha: 12/22</p>
						<p>CVV: 123</p>
						<p>Titular: Su Empresa</p>
					</div>
				</div>
			</div>
		);
	}

	if (showForm) {
		return (
			<div className="datafast-form">
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h3 className="text-xl font-bold mb-4">Información para Datafast</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Nombre
							</label>
							<input
								type="text"
								value={formData.given_name}
								onChange={(e) =>
									handleInputChange("given_name", e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Apellido
							</label>
							<input
								type="text"
								value={formData.surname}
								onChange={(e) => handleInputChange("surname", e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Teléfono
							</label>
							<input
								type="text"
								value={formData.phone}
								onChange={(e) => handleInputChange("phone", e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Cédula/ID
							</label>
							<input
								type="text"
								value={formData.doc_id}
								onChange={(e) => handleInputChange("doc_id", e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Dirección
							</label>
							<input
								type="text"
								value={formData.address}
								onChange={(e) => handleInputChange("address", e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Ciudad
							</label>
							<input
								type="text"
								value={formData.city}
								onChange={(e) => handleInputChange("city", e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								País
							</label>
							<input
								type="text"
								value={formData.country}
								onChange={(e) => handleInputChange("country", e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>
					</div>

					<div className="mt-6 flex gap-4">
						<button
							onClick={handleStartPayment}
							disabled={isLoading}
							className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
						>
							{isLoading ? (
								<>
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
									Creando checkout...
								</>
							) : (
								"Continuar con Datafast"
							)}
						</button>

						<button
							onClick={() => setShowForm(false)}
							disabled={isLoading}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
						>
							Cancelar
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="datafast-payment-button">
			<button
				onClick={() => setShowForm(true)}
				disabled={isLoading || !cart || cart.items.length === 0}
				className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
			>
				<svg
					className="w-5 h-5 mr-2"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
					/>
				</svg>
				Pagar con Datafast
			</button>

			{(!cart || cart.items.length === 0) && (
				<p className="mt-2 text-sm text-gray-500 text-center">
					Agrega productos al carrito para continuar
				</p>
			)}
		</div>
	);
};

export default DatafastPaymentButton;
