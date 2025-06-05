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

interface FormData {
	address: string;
	city: string;
	country: string;
	given_name: string;
	middle_name: string;
	surname: string;
	phone: string;
	doc_id: string;
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
	const [widgetLoaded, setWidgetLoaded] = useState(false);

	// Datos del formulario básico
	const [formData, setFormData] = useState<FormData>({
		address: "Av. Test 123",
		city: "Quito",
		country: "EC",
		given_name: "Juan",
		middle_name: "Carlos",
		surname: "Pérez",
		phone: "0999999999",
		doc_id: "1234567890",
	});

	const datafastService = new DatafastService();

	// Limpiar al desmontar componente
	useEffect(() => {
		return () => {
			// Limpiar scripts de Datafast al desmontar
			const script = document.getElementById("datafast-widget-script");
			if (script) {
				script.remove();
			}
		};
	}, []);

	// Manejar cambios en el formulario
	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({...prev, [field]: value}));
	};

	// Validar datos del formulario
	const validateFormData = (): boolean => {
		const requiredFields: (keyof FormData)[] = [
			"address",
			"city",
			"country",
			"given_name",
			"surname",
			"phone",
			"doc_id",
		];

		for (const field of requiredFields) {
			if (!formData[field] || formData[field].trim() === "") {
				showNotification(
					NotificationType.ERROR,
					`El campo ${field.replace("_", " ")} es obligatorio`
				);
				return false;
			}
		}

		// Validar formato de cédula (10 dígitos)
		if (formData.doc_id.length !== 10 || !/^\d+$/.test(formData.doc_id)) {
			showNotification(
				NotificationType.ERROR,
				"La cédula debe tener exactamente 10 dígitos"
			);
			return false;
		}

		return true;
	};

	// Iniciar proceso de pago con Datafast
	const handleStartPayment = async () => {
		if (!cart || cart.items.length === 0) {
			showNotification(NotificationType.ERROR, "El carrito está vacío");
			return;
		}

		if (!validateFormData()) {
			return;
		}

		setIsLoading(true);

		try {
			// Preparar datos para Datafast
			const requestData: DatafastCheckoutRequest = {
				shipping: {
					address: formData.address,
					city: formData.city,
					country: formData.country.toUpperCase(),
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
			console.log("Respuesta del checkout:", response);

			if (response.success && response.data) {
				setCheckoutData(response.data);
				setShowForm(false);
				setShowWidget(true);

				// Guardar transaction_id en localStorage para el resultado
				localStorage.setItem(
					"datafast_transaction_id",
					response.data.transaction_id
				);

				showNotification(
					NotificationType.SUCCESS,
					"Checkout creado. Preparando formulario de pago..."
				);

				// Cargar widget después de que el DOM esté listo
				setTimeout(() => {
					if (response.data) {
						loadDatafastWidget(response.data.checkout_id);
					} else {
						showNotification(NotificationType.ERROR, "Datos de checkout no disponibles");
					}
				}, 100);
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

	// Cargar widget de Datafast de forma más simple
	const loadDatafastWidget = (checkoutId: string) => {
		try {
			console.log("Cargando widget de Datafast...", checkoutId);

			// Remover script anterior si existe
			const existingScript = document.getElementById("datafast-widget-script");
			if (existingScript) {
				existingScript.remove();
			}

			// Configurar opciones globales ANTES de cargar el script
			(window as any).wpwlOptions = {
				onReady: function () {
					console.log("Widget de Datafast listo!");
					setWidgetLoaded(true);
					showNotification(
						NotificationType.SUCCESS,
						"Formulario de pago cargado correctamente."
					);
				},
				style: "card",
				locale: "es",
				labels: {
					cvv: "CVV",
					cardHolder: "Nombre (igual que en la tarjeta)",
				},
			};

			// Crear y cargar script
			const script = document.createElement("script");
			script.id = "datafast-widget-script";
			script.src = `https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
			script.async = true;

			script.onload = () => {
				console.log("Script de widget cargado");
			};

			script.onerror = () => {
				console.error("Error al cargar script del widget");
				showNotification(
					NotificationType.ERROR,
					"Error al cargar el formulario de pago"
				);
			};

			document.head.appendChild(script);
		} catch (error) {
			console.error("Error al configurar widget:", error);
			showNotification(
				NotificationType.ERROR,
				"Error al configurar el formulario de pago"
			);
		}
	};

	// Verificar pago (simulación para pruebas)
	const handleSimulatePaymentResult = async () => {
		if (!checkoutData) {
			showNotification(NotificationType.ERROR, "No hay datos de checkout");
			return;
		}

		setIsLoading(true);
		try {
			console.log("Simulando pago exitoso...");

			// Simular verificación de pago
			const verifyResponse = await datafastService.simulateSuccessfulPayment(
				checkoutData.transaction_id
			);

			console.log("Respuesta de verificación:", verifyResponse);

			if (verifyResponse.success && verifyResponse.data) {
				clearCart();
				setShowWidget(false);

				showNotification(
					NotificationType.SUCCESS,
					"¡Pago completado exitosamente!"
				);

				onSuccess?.(verifyResponse.data);
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

	// Procesar pago real (cuando el usuario complete el formulario)
	const handleRealPayment = () => {
		showNotification(
			NotificationType.INFO,
			"Complete los datos de su tarjeta en el formulario y haga clic en 'Pagar'. Nota: En Fase 1, las transacciones son simuladas."
		);
	};

	// Manejar resultado real del widget (cuando viene un resourcePath real)
	const handleWidgetResult = async (resourcePath: string) => {
		if (!checkoutData) {
			showNotification(NotificationType.ERROR, "No hay datos de checkout");
			return;
		}

		setIsLoading(true);
		try {
			console.log("Procesando resultado real del widget...");

			const verifyResponse = await datafastService.handleDatafastResult(
				resourcePath,
				checkoutData.transaction_id
			);

			console.log("Respuesta de verificación real:", verifyResponse);

			if (verifyResponse.success && verifyResponse.data) {
				// Pago exitoso
				clearCart();
				setShowWidget(false);

				showNotification(
					NotificationType.SUCCESS,
					"¡Pago completado exitosamente!"
				);

				onSuccess?.(verifyResponse.data);
				navigate("/orders");
			} else if (verifyResponse.is_phase_1_error) {
				// Error típico de Fase 1 - mostrar mensaje informativo
				showNotification(
					NotificationType.INFO,
					verifyResponse.message ||
						"No se completó un pago real. Use 'Simular Pago Exitoso' para probar el flujo."
				);
			} else {
				throw new Error(verifyResponse.message || "Pago no completado");
			}
		} catch (error) {
			console.error("Error al procesar resultado del widget:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Error al verificar pago";
			showNotification(NotificationType.ERROR, errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
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

					{/* Container para el widget - MUY SIMPLE */}
					<div className="min-h-[400px] border border-gray-200 rounded-lg p-4">
						{/* El formulario de Datafast aparecerá aquí automáticamente */}
						<form
							action={`${window.location.origin}/datafast-result`}
							className="paymentWidgets"
							data-brands="VISA MASTER AMEX DINERS DISCOVER"
						>
							{!widgetLoaded && (
								<div className="flex items-center justify-center h-64">
									<div className="text-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
										<p className="text-gray-600">
											Cargando formulario de pago...
										</p>
									</div>
								</div>
							)}
						</form>
					</div>

					{/* Información de prueba */}
					<div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
						<h4 className="font-semibold text-yellow-800 mb-2">
							Datos de prueba para usar:
						</h4>
						<div className="text-sm text-yellow-700 space-y-1">
							<p>
								<strong>Tarjeta:</strong> 4200 0000 0000 0000
							</p>
							<p>
								<strong>Fecha:</strong> 12/25
							</p>
							<p>
								<strong>CVV:</strong> 123
							</p>
							<p>
								<strong>Titular:</strong> {formData.given_name}{" "}
								{formData.surname}
							</p>
						</div>
					</div>

					{/* Botones de control */}
					<div className="mt-6 flex gap-4">
						<button
							onClick={handleRealPayment}
							disabled={!widgetLoaded}
							className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
						>
							Pago Real
						</button>

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
								setWidgetLoaded(false);
								// Limpiar script
								const script = document.getElementById(
									"datafast-widget-script"
								);
								if (script) script.remove();
							}}
							disabled={isLoading}
							className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
						>
							Volver
						</button>
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
								Nombre *
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
								Segundo Nombre
							</label>
							<input
								type="text"
								value={formData.middle_name}
								onChange={(e) =>
									handleInputChange("middle_name", e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Apellido *
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
								Teléfono *
							</label>
							<input
								type="text"
								value={formData.phone}
								onChange={(e) => handleInputChange("phone", e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
								placeholder="0999999999"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Cédula/ID * (10 dígitos)
							</label>
							<input
								type="text"
								value={formData.doc_id}
								onChange={(e) => {
									const value = e.target.value.replace(/\D/g, "").slice(0, 10);
									handleInputChange("doc_id", value);
								}}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
								placeholder="1234567890"
								maxLength={10}
							/>
						</div>

						<div className="md:col-span-2">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Dirección *
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
								Ciudad *
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
								País *
							</label>
							<select
								value={formData.country}
								onChange={(e) => handleInputChange("country", e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
							>
								<option value="EC">Ecuador</option>
								<option value="CO">Colombia</option>
								<option value="PE">Perú</option>
								<option value="US">Estados Unidos</option>
							</select>
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
