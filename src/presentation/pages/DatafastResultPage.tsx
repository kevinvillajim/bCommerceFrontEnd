import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {DatafastService} from "../../core/services/DatafastService";
import {useCart} from "../hooks/useCart";
import {NotificationType} from "../contexts/CartContext";

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

	const datafastService = new DatafastService();

	useEffect(() => {
		const processDatafastResult = async () => {
			try {
				// Obtener resourcePath de los parámetros de la URL
				const resourcePath = searchParams.get("resourcePath");

				if (!resourcePath) {
					throw new Error("No se encontró resourcePath en la respuesta de Datafast");
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
					const checkoutId = checkoutIdMatch ? checkoutIdMatch[1] : Date.now().toString();
					transactionId = `ORDER_${Date.now()}_${checkoutId}`;
					
					console.warn("No se encontró transaction_id en localStorage, usando:", transactionId);
				}

				console.log("Verificando pago con:", {
					resourcePath,
					transactionId
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
						message: "Pago procesado exitosamente"
					});

					clearCart();

					showNotification(
						NotificationType.SUCCESS,
						"¡Pago procesado exitosamente con Datafast!"
					);

					// Limpiar datos temporales
					localStorage.removeItem("datafast_transaction_id");

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
						fullResponse: verifyResponse
					});

					// Mensajes específicos según el código de resultado
					let userMessage = message;
					if (resultCode === "000.200.100") {
						userMessage = "El checkout fue creado pero el pago no se completó. Por favor, intente nuevamente.";
					} else if (resultCode && resultCode.startsWith("800")) {
						userMessage = "El pago fue rechazado por el banco. Verifique sus datos e intente nuevamente.";
					}

					throw new Error(userMessage);
				}
			} catch (error) {
				console.error("Error al procesar resultado de Datafast:", error);

				const errorMessage =
					error instanceof Error ? error.message : "Error desconocido al procesar el pago";
				setError(errorMessage);

				showNotification(NotificationType.ERROR, errorMessage);

				// Redirigir al carrito después de 8 segundos
				setTimeout(() => {
					navigate("/cart");
				}, 8000);
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
							<p>Serás redirigido al carrito en unos segundos...</p>
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