import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {DatafastService} from "../../core/services/DatafastService";
import {useCart} from "../hooks/useCart";
import {NotificationType} from "../contexts/CartContext";

const DatafastResultPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const {clearCart, showNotification} = useCart();
	const [isProcessing, setIsProcessing] = useState(true);
	const [result, setResult] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);

	const datafastService = new DatafastService();

	useEffect(() => {
		const processDatafastResult = async () => {
			try {
				// Obtener resourcePath de los parámetros de la URL
				const resourcePath = searchParams.get("resourcePath");

				if (!resourcePath) {
					throw new Error("No se encontró resourcePath en la respuesta");
				}

				console.log("Procesando resultado de Datafast:", {
					resourcePath,
					allParams: Object.fromEntries(searchParams.entries()),
				});

				// Obtener transaction_id del localStorage o de algún otro lugar
				// En un caso real, esto debería venir del flujo anterior
				const transactionId =
					localStorage.getItem("datafast_transaction_id") ||
					`ORDER_${Date.now()}_1`;

				// Verificar el pago
				const verifyResponse = await datafastService.verifyPayment({
					resource_path: resourcePath,
					transaction_id: transactionId,
				});

				if (verifyResponse.success && verifyResponse.data) {
					// Pago exitoso
					setResult(verifyResponse.data);
					clearCart();

					showNotification(
						NotificationType.SUCCESS,
						"¡Pago procesado exitosamente con Datafast!"
					);

					// Limpiar datos temporales
					localStorage.removeItem("datafast_transaction_id");

					// Redirigir después de 3 segundos
					setTimeout(() => {
						navigate("/orders");
					}, 3000);
				} else {
					throw new Error(
						verifyResponse.message || "El pago no fue completado"
					);
				}
			} catch (error) {
				console.error("Error al procesar resultado de Datafast:", error);

				const errorMessage =
					error instanceof Error ? error.message : "Error desconocido";
				setError(errorMessage);

				showNotification(NotificationType.ERROR, errorMessage);

				// Redirigir al carrito después de 5 segundos
				setTimeout(() => {
					navigate("/cart");
				}, 5000);
			} finally {
				setIsProcessing(false);
			}
		};

		processDatafastResult();
	}, [searchParams, navigate, clearCart, showNotification]);

	if (isProcessing) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
						<h2 className="text-xl font-semibold text-gray-800 mb-2">
							Procesando pago...
						</h2>
						<p className="text-gray-600">
							Estamos verificando tu pago con Datafast. Por favor espera.
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
					<div className="text-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-8 h-8 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-gray-800 mb-2">
							Error en el pago
						</h2>
						<p className="text-gray-600 mb-6">{error}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<button
								onClick={() => navigate("/cart")}
								className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
							>
								Volver al carrito
							</button>
							<button
								onClick={() => navigate("/")}
								className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition-colors"
							>
								Ir a inicio
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (result) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
					<div className="text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg
								className="w-8 h-8 text-green-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>

						<h2 className="text-2xl font-bold text-gray-800 mb-2">
							¡Pago exitoso!
						</h2>

						<p className="text-gray-600 mb-6">
							Tu pago ha sido procesado correctamente con Datafast.
						</p>

						<div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
							<h3 className="font-semibold text-gray-800 mb-2">
								Detalles de la orden:
							</h3>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-600">Número de orden:</span>
									<span className="font-medium">{result.order_number}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Total:</span>
									<span className="font-medium">${result.total}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Estado del pago:</span>
									<span className="text-green-600 font-medium">
										{result.payment_status}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">ID de pago:</span>
									<span className="font-medium text-xs">
										{result.payment_id}
									</span>
								</div>
							</div>
						</div>

						<div className="text-sm text-gray-500 mb-6">
							Serás redirigido a tus pedidos en unos segundos...
						</div>

						<div className="flex flex-col sm:flex-row gap-3">
							<button
								onClick={() => navigate("/orders")}
								className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
							>
								Ver mis pedidos
							</button>
							<button
								onClick={() => navigate("/")}
								className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md transition-colors"
							>
								Seguir comprando
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return null;
};

export default DatafastResultPage;