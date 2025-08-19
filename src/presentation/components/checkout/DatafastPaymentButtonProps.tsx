import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../../hooks/useCart";
import {useAuth} from "../../hooks/useAuth";
import {DatafastService} from "../../../core/services/DatafastService";
import {CheckoutService} from "../../../core/services/CheckoutService";
import {CheckoutItemsService} from "../../../infrastructure/services/CheckoutItemsService";
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
	const {cart, clearCart, showNotification, appliedDiscount} = useCart();
	const {user} = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [showWidget, setShowWidget] = useState(false);
	const [checkoutData, setCheckoutData] = useState<any>(null);
	const [showForm, setShowForm] = useState(false);
	const [widgetLoaded, setWidgetLoaded] = useState(false);
	const [calculatedTotals, setCalculatedTotals] = useState<any>(null);

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
			// ✅ USAR MISMA LÓGICA QUE EL BOTÓN "PRUEBA COMPLETA" QUE FUNCIONA PERFECTO
			const checkoutItems = await CheckoutItemsService.prepareItemsForCheckout(cart.items); // SIN appliedDiscount
			const totals = await CheckoutItemsService.calculateCheckoutTotals(cart.items, appliedDiscount);
			
			// Almacenar totales para usar en el widget
			setCalculatedTotals(totals);
			
			console.log("💰 Totales calculados para Datafast:", totals);
			console.log("🛒 Items para Datafast (preparados como Prueba Completa):", checkoutItems);
			
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
				items: checkoutItems,
				total: totals.total,
				subtotal: totals.subtotal,
				shipping_cost: totals.shipping,
				tax: totals.tax,
				// ✅ AGREGAR LO MISMO QUE HACE "PRUEBA COMPLETA"
				discount_code: appliedDiscount?.discountCode.code || null,
				discount_info: appliedDiscount || null
			};

			console.log("Iniciando checkout con Datafast...", requestData);
			console.log("💰 Total enviado a Datafast: $", totals.total);

			const response = await datafastService.createCheckout(requestData);
			console.log("Respuesta del checkout:", response);

			if (response.success && response.data) {
				setCheckoutData(response.data);
				setShowForm(false);
				setShowWidget(true);

				// ✅ GUARDAR DATOS NECESARIOS PARA LA VERIFICACIÓN
				localStorage.setItem(
					"datafast_transaction_id",
					response.data.transaction_id
				);
				
				// ✅ GUARDAR TOTAL CALCULADO PARA PAGOS REALES
				localStorage.setItem("datafast_calculated_total", totals.total.toString());

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
					console.log("✅ Widget de Datafast listo!");
					setWidgetLoaded(true);
					showNotification(
						NotificationType.SUCCESS,
						"Formulario de pago cargado correctamente."
					);
				},
				onBeforeSubmitCard: function (data: any) {
					console.log("🔄 Widget Datafast: Usuario hizo clic en Pagar, procesando...");
					console.log("🔍 Datos de la tarjeta que se están enviando:", data);
					showNotification(
						NotificationType.INFO,
						"Procesando pago con Datafast..."
					);
				},
				onAfterSubmitCard: function (data: any) {
					console.log("⏳ Widget Datafast: Datos enviados, esperando respuesta...");
					console.log("📤 Respuesta después del envío:", data);
				},
				onLoadThreeDSecure: function () {
					console.log("🔐 Widget Datafast: Cargando 3D Secure...");
				},
				onBeforeRedirectToResult: function (data: any) {
					console.log("🔄 Widget Datafast: Redirigiendo a página de resultado...");
					console.log("🔗 Datos de redirección:", data);
				},
				onChangeBrand: function (e: any) {
					console.log("💳 Widget Datafast: Marca de tarjeta detectada:", e.brand);
					console.log("💳 Datos completos del evento:", e);
				},
				onError: function (error: any) {
					console.error("❌ Widget Datafast: Error en el pago", error);
					console.error("❌ Detalles completos del error:", {
						message: error.message,
						code: error.code,
						name: error.name,
						full: error
					});
					showNotification(
						NotificationType.ERROR,
						"Error al procesar el pago: " + (error.message || error.code || 'Error desconocido')
					);
				},
				onSubmit: function (data: any) {
					console.log("📋 Widget Datafast: Formulario enviado");
					console.log("📋 Datos del formulario:", data);
				},
				style: "card",
				locale: "es",
				labels: {
					cvv: "CVV",
					cardHolder: "Nombre (igual que en la tarjeta)",
				},
			};

			// Cargar script adicional de validaciones de Datafast
			const additionalScript = document.createElement("script");
			additionalScript.src = "https://www.datafast.com.ec/js/dfAdditionalValidations1.js";
			additionalScript.async = true;
			document.head.appendChild(additionalScript);

			const script = document.createElement("script");
			script.id = "datafast-widget-script";
			script.src = checkoutData?.widget_url || `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${checkoutId}`;
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

			// ✅ USAR MISMA LÓGICA DE CÁLCULO QUE CHECKOUT PAGE
			const checkoutItems = await CheckoutItemsService.prepareItemsForCheckout(cart.items);
			console.log("🛒 Items formateados con descuentos aplicados (DATAFAST):", JSON.stringify(checkoutItems, null, 2));

			// ✅ CALCULAR TOTALES CORRECTOS PARA EL BACKEND
			console.log("🔍 DEBUG: cart.items antes de calcular:", cart.items);
			console.log("🔍 DEBUG: appliedDiscount antes de calcular:", appliedDiscount);
			
			const calculatedTotals = await CheckoutItemsService.calculateCheckoutTotals(cart.items, appliedDiscount);
			console.log("💰 Totales calculados para backend (DATAFAST):", calculatedTotals);
			console.log("🔍 DEBUG: calculatedTotals es null?", calculatedTotals === null);
			console.log("🔍 DEBUG: calculatedTotals es undefined?", calculatedTotals === undefined);
			console.log("🔍 DEBUG: tipo de calculatedTotals:", typeof calculatedTotals);

			console.log("🛒 Items formateados para backend (DATAFAST):", JSON.stringify(checkoutItems, null, 2));

			const testCheckoutData = {
				payment: {
					method: "datafast" as PaymentMethod,
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
				items: checkoutItems, // ✅ USAR ITEMS CON DESCUENTOS CALCULADOS
				// ✅ CRÍTICO: Incluir totales calculados requeridos por el backend
				calculated_totals: {
					subtotal: calculatedTotals?.subtotal || 0,     // subtotal_products (después de descuentos)
					tax: calculatedTotals?.tax || 0,               // iva_amount
					shipping: calculatedTotals?.shipping || 0,     // shipping_cost  
					total: calculatedTotals?.total || 0,           // total final (subtotal + shipping + tax)
					total_discounts: calculatedTotals?.totalDiscounts || 0 // total_discounts
				},
				// ✅ NUEVO: Incluir código de descuento aplicado y su información
				discount_code: appliedDiscount?.discountCode.code || null,
				discount_info: appliedDiscount || null // ✅ Pasar información completa del descuento
			};

			console.log("📦 Datos completos de checkout (DATAFAST):", JSON.stringify(testCheckoutData, null, 2));
			console.log("🔍 DEBUG: testCheckoutData.calculated_totals:", testCheckoutData.calculated_totals);
			console.log("🔍 DEBUG: Estructura del objeto calculated_totals:");
			console.log("   - subtotal:", testCheckoutData.calculated_totals.subtotal);
			console.log("   - tax:", testCheckoutData.calculated_totals.tax);  
			console.log("   - shipping:", testCheckoutData.calculated_totals.shipping);
			console.log("   - total:", testCheckoutData.calculated_totals.total);
			console.log("   - total_discounts:", testCheckoutData.calculated_totals.total_discounts);
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

			// ✅ ENVIAR EL TOTAL CALCULADO CORRECTO PARA SIMULACIÓN
			const totals = cart ? await CheckoutItemsService.calculateCheckoutTotals(cart.items, appliedDiscount) : null;
			
			const verifyResponse = await datafastService.simulateSuccessfulPayment(
				checkoutData.checkout_id,
				checkoutData.transaction_id,
				totals?.total || 0
			);

			console.log("Respuesta de verificación Datafast:", verifyResponse);

			if (verifyResponse.success && verifyResponse.data) {
				console.log("Procesando checkout completo en el sistema...");
				
				// ✅ CORREGIDO: Agregar null check para cart
				const sellerId = cart ? CheckoutService.getSellerIdFromCart(cart) : null;
				console.log("Seller ID obtenido:", sellerId);
				
				// ✅ USAR MISMA LÓGICA DE CÁLCULO QUE CHECKOUT PAGE
				const items = cart ? await CheckoutItemsService.prepareItemsForCheckout(cart.items) : [];
				
				// ✅ CALCULAR TOTALES CORRECTOS PARA EL BACKEND
				console.log("🔍 DEBUG SIMULATE: cart.items antes de calcular:", cart?.items);
				console.log("🔍 DEBUG SIMULATE: appliedDiscount antes de calcular:", appliedDiscount);
				
				const calculatedTotals = cart ? await CheckoutItemsService.calculateCheckoutTotals(cart.items, appliedDiscount) : null;
				console.log("💰 DEBUG SIMULATE: Totales calculados:", calculatedTotals);
				console.log("🔍 DEBUG SIMULATE: calculatedTotals es null?", calculatedTotals === null);
				console.log("🔍 DEBUG SIMULATE: calculatedTotals es undefined?", calculatedTotals === undefined);
				
				const checkoutRequestData = {
					payment: {
						method: "datafast" as PaymentMethod,
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
					items: items,
					// ✅ CRÍTICO: Incluir totales calculados requeridos por el backend
					calculated_totals: calculatedTotals ? {
						subtotal: calculatedTotals.subtotal,     // subtotal_products (después de descuentos)
						tax: calculatedTotals.tax,               // iva_amount
						shipping: calculatedTotals.shipping,     // shipping_cost
						total: calculatedTotals.total,           // total final (subtotal + shipping + tax)
						total_discounts: calculatedTotals.totalDiscounts // total_discounts
					} : {}
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

	const handleRealPayment = async () => {
		// ✅ GUARDAR EL TOTAL CALCULADO EN LOCALSTORAGE PARA LA PÁGINA DE RESULTADO
		const totals = cart ? await CheckoutItemsService.calculateCheckoutTotals(cart.items, appliedDiscount) : null;
		if (totals) {
			localStorage.setItem("datafast_calculated_total", totals.total.toString());
			console.log("💰 Total calculado guardado para verificación:", totals.total);
		}
		
		showNotification(
			NotificationType.INFO,
			"Complete los datos de su tarjeta en el formulario y haga clic en 'Pagar'."
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
						<p className="text-blue-700">Monto: ${calculatedTotals?.total?.toFixed(2) || checkoutData?.amount || cart?.total}</p>
						<p className="text-blue-700">ID: {checkoutData?.transaction_id}</p>
					</div>

					<div className="min-h-[400px] border border-gray-200 rounded-lg p-4">
						<form
							action={`${import.meta.env.VITE_URL_BASE}/datafast-result`}
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
								<strong>Tarjeta VISA:</strong> 4200 0000 0000 0000
							</p>
							<p>
								<strong>Fecha:</strong> 07/26
							</p>
							<p>
								<strong>CVV:</strong> 246
							</p>
							<p>
								<strong>Titular:</strong> {formData.given_name}{" "}
								{formData.surname}
							</p>
							<p className="text-xs mt-2 text-blue-600">
								<strong>Fase 2:</strong> Credenciales de testing avanzado con transacciones reales limitadas
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