import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {DatafastService} from "../../core/services/DatafastService";
import {useCart} from "../hooks/useCart";
import {NotificationType} from "../contexts/CartContext";
import {formatCurrency} from "../../utils/formatters/formatCurrency";

interface ProcessingResult {
	success: boolean;
	data?: {
		order_id: string;
		order_number: string;
		total: number;
		payment_status: string;
		payment_id: string;
	};
	message: string;
}

const DatafastResultPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const {clearCart, showNotification} = useCart();
	const [isProcessing, setIsProcessing] = useState(true);
	const [result, setResult] = useState<ProcessingResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [countdown, setCountdown] = useState(5);

	const datafastService = new DatafastService();

	useEffect(() => {
		const processDatafastResult = async () => {
			try {
				// Obtener resourcePath de los parámetros de la URL
				const resourcePath = searchParams.get("resourcePath");

				if (!resourcePath) {
					throw new Error(
						"No se encontró resourcePath en la respuesta de Datafast"
					);
				}

				console.log("Procesando resultado de Datafast:", {
					resourcePath,
					allParams: Object.fromEntries(searchParams.entries()),
				});

				// Obtener transaction_id del localStorage o generar uno de respaldo
				let transactionId = localStorage.getItem("datafast_transaction_id");

				if (!transactionId) {
					// Si no hay transaction_id guardado, generar uno basado en el resourcePath
					const checkoutIdMatch = resourcePath.match(/\/checkouts\/([^\/]+)/);
					const checkoutId = checkoutIdMatch
						? checkoutIdMatch[1]
						: Date.now().toString();
					transactionId = `ORDER_${Date.now()}_${checkoutId}`;

					console.warn(
						"No se encontró transaction_id en localStorage, usando:",
						transactionId
					);
				}

				console.log("Verificando pago con:", {
					resourcePath,
					transactionId,
				});

				// Verificar el pago
				const verifyResponse = await datafastService.verifyPayment({
					resource_path: resourcePath,
					transaction_id: transactionId,
				});

				console.log("Respuesta de verificación:", verifyResponse);

				if (verifyResponse.success && verifyResponse.data) {
					// Pago exitoso
					setResult({
						success: true,
						data: verifyResponse.data,
						message: "Pago procesado exitosamente",
					});

					// Limpiar datos temporales
					localStorage.removeItem("datafast_transaction_id");

					// Usar setTimeout para evitar setState durante render
					setTimeout(() => {
						clearCart();
						showNotification(
							NotificationType.SUCCESS,
							"¡Pago procesado exitosamente con Datafast!"
						);
					}, 100);

					// Redirigir después de 5 segundos
					setTimeout(() => {
						navigate("/orders");
					}, 5000);
				} else {
					// Pago fallido o pendiente
					const message = verifyResponse.message || "El pago no fue completado";
					const resultCode = verifyResponse.result_code;

					console.warn("Pago no exitoso:", {
						message,
						resultCode,
						fullResponse: verifyResponse,
					});

					// Mensajes específicos según el código de resultado
					let userMessage = message;
					if (resultCode === "000.200.100") {
						userMessage =
							"El checkout fue creado pero el pago no se completó. Por favor, intente nuevamente.";
					} else if (resultCode && resultCode.startsWith("800")) {
						userMessage =
							"El pago fue rechazado por el banco. Verifique sus datos e intente nuevamente.";
					}

					throw new Error(userMessage);
				}
			} catch (error) {
				console.error("Error al procesar resultado de Datafast:", error);

				const errorMessage =
					error instanceof Error
						? error.message
						: "Error desconocido al procesar el pago";
				setError(errorMessage);

				// Usar setTimeout para evitar setState durante render
				setTimeout(() => {
					showNotification(NotificationType.ERROR, errorMessage);
				}, 100);

				// Redirigir al carrito después de 8 segundos
				setTimeout(() => {
					navigate("/cart");
				}, 8000);
			} finally {
				setIsProcessing(false);
			}
		};

		processDatafastResult();
	}, [searchParams, navigate]);

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
						<div className="mt-4 text-sm text-gray-500">
							<p>Este proceso puede tomar unos segundos.</p>
						</div>
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

						<div className="text-sm text-gray-500 mb-6">
							<p>Serás redirigido al carrito en {countdown} segundos...</p>
						</div>

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

	if (result && result.success && result.data) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4">
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

						{/* Detalles del pedido */}
						<div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
							<h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
								Detalles del pedido
							</h3>

							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Número de orden:</span>
									<span className="font-medium text-gray-800">
										{result.data.order_number}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600">ID de pago:</span>
									<span className="font-medium text-gray-800">
										{result.data.payment_id}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600">Total pagado:</span>
									<span className="font-bold text-lg text-primary-600">
										{formatCurrency(result.data.total)}
									</span>
								</div>

								<div className="flex justify-between items-center">
									<span className="text-gray-600">Estado del pago:</span>
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
										<svg
											className="w-3 h-3 mr-1"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										Completado
									</span>
								</div>
							</div>
						</div>

						{/* Información adicional */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<div className="flex items-start">
								<svg
									className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clipRule="evenodd"
									/>
								</svg>
								<div className="text-sm text-blue-700">
									<p className="font-medium mb-1">¿Qué sigue?</p>
									<ul className="text-xs space-y-1">
										<li>• Recibirás un correo de confirmación</li>
										<li>• Procesaremos tu pedido en las próximas 24 horas</li>
										<li>• Te notificaremos cuando tu pedido sea enviado</li>
									</ul>
								</div>
							</div>
						</div>

						{/* Información de redirección */}
						<div className="text-sm text-gray-500 mb-6">
							<p>
								Serás redirigido a tus pedidos en{" "}
								<span className="font-medium text-primary-600">
									{countdown}
								</span>{" "}
								segundos...
							</p>
						</div>

						{/* Botones de acción */}
						<div className="flex flex-col sm:flex-row gap-3">
							<button
								onClick={() => navigate("/orders")}
								className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
								Ver mis pedidos
							</button>

							<button
								onClick={() => navigate("/")}
								className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
								Ir a inicio
							</button>

							<button
								onClick={() => navigate("/products")}
								className="flex-1 border border-primary-600 text-primary-600 hover:bg-primary-50 font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
							>
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
									/>
								</svg>
								Seguir comprando
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Fallback - no debería llegar aquí normalmente
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-800 mb-2">
						Estado desconocido
					</h2>
					<p className="text-gray-600 mb-6">
						No se pudo determinar el estado del pago.
					</p>

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
};

export default DatafastResultPage;
