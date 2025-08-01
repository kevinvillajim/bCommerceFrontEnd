import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../../hooks/useCart";
import {useAuth} from "../../hooks/useAuth";
import {DatafastService} from "../../../core/services/DatafastService";
import {CheckoutService} from "../../../core/services/CheckoutService";
import type {DatafastCheckoutRequest} from "../../../core/services/DatafastService";
import type {PaymentMethod, PaymentInfo} from "../../../core/services/CheckoutService";
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
	const {user} = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [showWidget, setShowWidget] = useState(false);
	const [checkoutData, setCheckoutData] = useState<any>(null);
	const [showForm, setShowForm] = useState(false);
	const [widgetLoaded, setWidgetLoaded] = useState(false);

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
	const checkoutService = new CheckoutService();

	useEffect(() => {
		return () => {
			const script = document.getElementById("datafast-widget-script");
			if (script) {
				script.remove();
			}
		};
	}, []);

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({...prev, [field]: value}));
	};

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

		if (formData.doc_id.length !== 10 || !/^\d+$/.test(formData.doc_id)) {
			showNotification(
				NotificationType.ERROR,
				"La cédula debe tener exactamente 10 dígitos"
			);
			return false;
		}

		return true;
	};

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

			const response = await datafastService.createCheckout(requestData);
			console.log("Respuesta del checkout:", response);

			if (response.success && response.data) {
				setCheckoutData(response.data);
				setShowForm(false);
				setShowWidget(true);

				localStorage.setItem(
					"datafast_transaction_id",
					response.data.transaction_id
				);

				showNotification(
					NotificationType.SUCCESS,
					"Checkout creado. Preparando formulario de pago..."
				);

				setTimeout(() => {
					if (response.data) {
						loadDatafastWidget(response.data.checkout_id);
					} else {
						showNotification(
							NotificationType.ERROR,
							"Datos de checkout no disponibles"
						);
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

	const loadDatafastWidget = (checkoutId: string) => {
		try {
			console.log("Cargando widget de Datafast...", checkoutId);

			const existingScript = document.getElementById("datafast-widget-script");
			if (existingScript) {
				existingScript.remove();
			}

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

	const handleCompleteTestCheckout = async () => {
		console.log("🧪 DatafastPaymentButton.handleCompleteTestCheckout INICIADO");
	
		if (!cart || cart.items.length === 0) {
			console.log("❌ Carrito vacío o null, abortando checkout");
			showNotification(NotificationType.ERROR, "El carrito está vacío");
			return;
		}

		if (!validateFormData()) {
			console.log("❌ Validación de formulario falló");
			return;
		}

		console.log("🛒 ANÁLISIS COMPLETO DEL CARRITO ANTES DEL CHECKOUT (DATAFAST):");
		console.log("📊 Cart completo:", JSON.stringify(cart, null, 2));
		console.log("📊 Total de items en carrito:", cart.items.length);
		console.log("📊 Total del carrito:", cart.total);

		cart.items.forEach((item, index) => {
			console.log(`📋 Item ${index + 1}:`, {
				id: item.id,
				productId: item.productId,
				quantity: item.quantity,
				price: item.price,
				subtotal: item.subtotal,
				product: item.product ? {
					id: item.product.id,
					name: item.product.name,
					price: item.product.price,
					final_price: item.product.final_price,
					sellerId: item.product.sellerId,
					seller_id: item.product.seller_id,
					user_id: item.product.user_id
				} : null,
				completeItem: item
			});
		});

		console.log("🔍 VERIFICANDO DUPLICADOS EN EL CARRITO (DATAFAST):");
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
			console.log("🚀 Iniciando checkout de prueba completo (DATAFAST)...");

			// ✅ CORREGIDO: Agregar null check para cart
			const sellerId = cart ? CheckoutService.getSellerIdFromCart(cart) : null;
			console.log("🏪 Seller ID obtenido (DATAFAST):", sellerId);

			// ✅ CORREGIDO: Construir items del carrito con precios válidos
			const items = cart.items.map(item => {
				console.log("🔍 DEBUGGING ITEM INDIVIDUAL:", {
					item: item,
					productId: item.productId,
					quantity: item.quantity,
					item_price: item.price,
					item_subtotal: item.subtotal,
					product_final_price: item.product?.final_price,
					product_price: item.product?.price,
					complete_product: item.product
				});
				
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
				
				console.log("🔍 PRECIO FINAL CALCULADO:", price);
				
				return {
					product_id: item.productId,
					quantity: item.quantity,
					price: price
				};
			});

			console.log("🛒 Items formateados para backend (DATAFAST):", JSON.stringify(items, null, 2));

			const testCheckoutData = {
				payment: {
					method: "transfer" as PaymentMethod,
				} as PaymentInfo,
				shippingAddress: {
					name: formData.given_name + " " + formData.surname,
					street: formData.address || "Calle de Prueba 123",
					city: formData.city || "Quito", 
					state: formData.country || "Pichincha",
					postalCode: "170000",
					country: formData.country || "Ecuador",
					phone: formData.phone || "0999999999",
				},
				seller_id: sellerId || undefined,
				items: items
			};

			console.log("📦 Datos completos de checkout (DATAFAST):", JSON.stringify(testCheckoutData, null, 2));
			console.log("🚀 Enviando checkout al backend (DATAFAST)...");

			const response = await checkoutService.processCheckout(testCheckoutData, user?.email);

			console.log("✅ Respuesta del checkout recibida (DATAFAST):", response);

			if (response.status === "success") {
				console.log("🎉 Checkout exitoso (DATAFAST), limpiando carrito...");
				clearCart();
				setShowWidget(false);
				setShowForm(false);

				showNotification(
					NotificationType.SUCCESS,
					"¡Pedido de prueba completado con éxito!"
				);

				console.log("📊 Detalles COMPLETOS de la orden (DATAFAST):", JSON.stringify(response.data, null, 2));

				if (response.data && typeof response.data === 'object') {
					const orderData = response.data as any;
					console.log("🔍 ANÁLISIS DE LA ORDEN CREADA (DATAFAST):");
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

				onSuccess?.(response.data);
				navigate("/orders");
			} else {
				throw new Error(response.message || "Error en el checkout de prueba");
			}
		} catch (error) {
			console.error("❌ Error COMPLETO en el checkout de prueba (DATAFAST):");
			console.error("📊 Error object:", error);
			console.error("📊 Error stack:", (error as any)?.stack);
			const errorMessage =
				error instanceof Error ? error.message : "Error al procesar el checkout de prueba";
			console.error("📊 Error message final:", errorMessage);
			showNotification(NotificationType.ERROR, errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
			console.log("🧪 DatafastPaymentButton.handleCompleteTestCheckout FINALIZADO");
		}
	};

	const handleSimulatePaymentResult = async () => {
		if (!checkoutData) {
			showNotification(NotificationType.ERROR, "No hay datos de checkout");
			return;
		}

		setIsLoading(true);
		try {
			console.log("Simulando pago exitoso completo...");

			const verifyResponse = await datafastService.simulateSuccessfulPayment(
				checkoutData.checkout_id,
				checkoutData.transaction_id
			);

			console.log("Respuesta de verificación Datafast:", verifyResponse);

			if (verifyResponse.success && verifyResponse.data) {
				console.log("Procesando checkout completo en el sistema...");
				
				// ✅ CORREGIDO: Agregar null check para cart
				const sellerId = cart ? CheckoutService.getSellerIdFromCart(cart) : null;
				console.log("Seller ID obtenido:", sellerId);
				
				// ✅ CORREGIDO: Construir items del carrito con precios válidos solo si cart existe
				const items = cart ? cart.items.map(item => {
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
				}) : [];
				
				const checkoutRequestData = {
					payment: {
						method: "transfer" as PaymentMethod,
					} as PaymentInfo,
					shippingAddress: {
						name: formData.given_name + " " + formData.surname,
						street: formData.address,
						city: formData.city,
						state: formData.country,
						postalCode: "00000",
						country: formData.country,
						phone: formData.phone,
					},
					seller_id: sellerId || undefined,
					items: items
				};

				const checkoutResponse = await checkoutService.processCheckout(checkoutRequestData, user?.email);
				
				console.log("Respuesta del checkout completo:", checkoutResponse);

				if (checkoutResponse.status === "success") {
					clearCart();
					setShowWidget(false);

					showNotification(
						NotificationType.SUCCESS,
						"¡Pago y pedido completados exitosamente!"
					);

					console.log("Detalles completos de la orden:", {
						datafast: verifyResponse.data,
						checkout: checkoutResponse.data
					});

					onSuccess?.(checkoutResponse.data);
					navigate("/orders");
				} else {
					throw new Error(checkoutResponse.message || "Error al procesar el checkout completo");
				}
			} else {
				throw new Error(verifyResponse.message || "Error en la simulación de Datafast");
			}
		} catch (error) {
			console.error("Error en la simulación completa:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Error al procesar la simulación completa";
			showNotification(NotificationType.ERROR, errorMessage);
			onError?.(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRealPayment = () => {
		showNotification(
			NotificationType.INFO,
			"Complete los datos de su tarjeta en el formulario y haga clic en 'Pagar'. Nota: En Fase 1, las transacciones son simuladas."
		);
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

					<div className="min-h-[400px] border border-gray-200 rounded-lg p-4">
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

					<div className="mt-6 space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<button
								onClick={handleRealPayment}
								disabled={!widgetLoaded}
								className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
							>
								Pago Real
							</button>

							<button
								onClick={handleSimulatePaymentResult}
								disabled={isLoading}
								className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
							>
								{isLoading ? "Verificando..." : "Simular Pago Exitoso"}
							</button>
						</div>

						<div className="border-t pt-4">
							<button
								onClick={handleCompleteTestCheckout}
								disabled={isLoading}
								className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
							>
								{isLoading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Procesando...
									</>
								) : (
									<>
										<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Prueba Completa de Checkout
									</>
								)}
							</button>
							<p className="text-xs text-gray-500 text-center mt-2">
								Simula el proceso completo de checkout como el botón de prueba original
							</p>
						</div>

						<div className="flex justify-center">
							<button
								onClick={() => {
									setShowWidget(false);
									setShowForm(true);
									setWidgetLoaded(false);
									const script = document.getElementById("datafast-widget-script");
									if (script) script.remove();
								}}
								disabled={isLoading}
								className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
							>
								Volver
							</button>
						</div>
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
				className="w-full transition-all duration-200 transform hover:scale-101 bg-[#003c58] border-1 hover:bg-[#00B86E] text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 flex items-center justify-center"
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