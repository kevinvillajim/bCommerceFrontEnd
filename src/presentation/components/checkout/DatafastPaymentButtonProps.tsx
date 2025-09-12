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
import {useDatafastCSP} from "../../hooks/useDatafastCSP";

interface DatafastPaymentButtonProps {
	onSuccess?: (orderData: any) => void;
	onError?: (error: string) => void;
	shippingAddress?: {
		name?: string;
		street?: string;
		city?: string;
		state?: string;
		postalCode?: string;
		country?: string;
		phone?: string;
		identification?: string;
	};
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
	shippingAddress,
}) => {
	// 🔓 Desactivar CSP temporalmente para permitir scripts de Datafast
	useDatafastCSP();
	
	// ✅ MAPEO DE PAÍSES: nombres completos a códigos ISO 3166-1 alpha-2
	const countryMapping: Record<string, string> = {
		"Ecuador": "EC",
		"Colombia": "CO", 
		"Perú": "PE",
		"Peru": "PE",
		"Estados Unidos": "US",
		"United States": "US",
		"USA": "US",
		// Si ya viene como código, lo dejamos igual
		"EC": "EC",
		"CO": "CO", 
		"PE": "PE",
		"US": "US"
	};
	
	const navigate = useNavigate();
	const {cart, clearCart, showNotification, appliedDiscount} = useCart();
	const {user} = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	// ✅ FUNCIÓN HELPER: Mapear país a código ISO (debe estar antes del useState)
	const mapCountryCode = (country: string): string => {
		return countryMapping[country] || country.substring(0, 2).toUpperCase();
	};

	const [showWidget, setShowWidget] = useState(false);
	const [checkoutData, setCheckoutData] = useState<any>(null);
	const [showForm, setShowForm] = useState(false);
	const [widgetLoaded, setWidgetLoaded] = useState(false);
	const [calculatedTotals, setCalculatedTotals] = useState<any>(null);

	// ✅ FIX: Usar datos de shippingAddress en lugar de hardcodeados
	const [formData, setFormData] = useState<FormData>(() => {
		// Separar el nombre completo en partes si está disponible
		const nameParts = shippingAddress?.name?.split(' ') || [];
		const firstName = nameParts[0] || "Juan";
		const lastName = nameParts.slice(1).join(' ') || "Pérez";
		
		return {
			address: shippingAddress?.street || "Av. Test 123",
			city: shippingAddress?.city || "Quito", 
			country: mapCountryCode(shippingAddress?.country || "Ecuador"),
			given_name: firstName,
			middle_name: "",
			surname: lastName,
			phone: shippingAddress?.phone || "0999999999",
			doc_id: shippingAddress?.identification || "1234567890",
		};
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

	// ✅ NUEVO: Actualizar formData cuando cambia shippingAddress
	useEffect(() => {
		if (shippingAddress) {
			const nameParts = shippingAddress.name?.split(' ') || [];
			const firstName = nameParts[0] || formData.given_name;
			const lastName = nameParts.slice(1).join(' ') || formData.surname;
			const mappedCountry = mapCountryCode(shippingAddress.country || "Ecuador");
			
			setFormData(prev => ({
				...prev,
				address: shippingAddress.street || prev.address,
				city: shippingAddress.city || prev.city,
				country: mappedCountry,
				given_name: firstName,
				surname: lastName,
				phone: shippingAddress.phone || prev.phone,
				doc_id: shippingAddress.identification || prev.doc_id,
			}));
			
			console.log("📍 Datos de dirección actualizados en Datafast:", {
				from_shippingAddress: shippingAddress,
				updated_formData: {
					address: shippingAddress.street,
					city: shippingAddress.city,
					country: mappedCountry,
					given_name: firstName,
					surname: lastName,
					phone: shippingAddress.phone,
					doc_id: shippingAddress.identification,
				}
			});
		}
	}, [shippingAddress]);

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
			
			// ✅ FIX DEFINITIVO: Construir customer object condicionalmente
			const customerData: any = {
				given_name: formData.given_name,
				surname: formData.surname,
				phone: formData.phone,
				doc_id: formData.doc_id,
			};
			
			// Solo agregar middle_name si realmente tiene valor
			if (formData.middle_name && formData.middle_name.trim() !== "") {
				customerData.middle_name = formData.middle_name.trim();
			}
			
			const requestData: DatafastCheckoutRequest = {
				shipping: {
					address: formData.address,
					city: formData.city,
					country: mapCountryCode(formData.country), // ✅ Usar función de mapeo
				},
				customer: customerData,
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
			console.log("🔍 DEBUG - Datos específicos que están causando error:");
			console.log("   - customer.middle_name:", requestData.customer.middle_name !== undefined 
				? `"${requestData.customer.middle_name}" (tipo: ${typeof requestData.customer.middle_name})` 
				: "OMITIDO - campo no enviado");
			console.log("   - shipping.country:", `"${requestData.shipping.country}" (tipo: ${typeof requestData.shipping.country})`);
			console.log("🔍 DEBUG - Customer completo:", JSON.stringify(requestData.customer, null, 2));

			const response = await datafastService.createCheckout(requestData);
			console.log("Respuesta del checkout:", response);

			if (response.status === "success" && response.data) { // ✅ CORREGIDO: Cambiar response.success por response.status
				setCheckoutData(response.data);
				setShowForm(false);
				setShowWidget(true);

				// ✅ GUARDAR DATOS NECESARIOS PARA LA VERIFICACIÓN
				localStorage.setItem(
					"datafast_transaction_id",
					response.data.transaction_id
				);
				
				// ✅ GUARDAR CHECKOUT_ID PARA SIMULACIÓN
				localStorage.setItem(
					"datafast_checkout_id",
					response.data.checkout_id
				);
				
				// ✅ GUARDAR TOTAL CALCULADO PARA PAGOS REALES
				localStorage.setItem("datafast_calculated_total", totals.total.toString());
				
				// ✅ GUARDAR DATOS DEL FORMULARIO PARA LA PÁGINA DE RESULTADO
				localStorage.setItem("datafast_form_data", JSON.stringify(formData));
				
				// ✅ GUARDAR BACKUP DEL CARRITO PARA PROCESAR LA ORDEN DESPUÉS
				console.log("💾 GUARDANDO BACKUP DEL CARRITO EN LOCALSTORAGE");
				console.log("   - Items en carrito:", cart?.items?.length || 0);
				console.log("   - Carrito completo:", cart);
				localStorage.setItem("datafast_cart_backup", JSON.stringify(cart));
				console.log("   ✅ Backup guardado en 'datafast_cart_backup'");

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
					
					// Agregar listener adicional al formulario cuando esté listo
					setTimeout(() => {
						const form = document.querySelector('form.paymentWidgets');
						if (form) {
							console.log("📝 Agregando listener adicional al formulario");
							
							// Escuchar el evento submit
							form.addEventListener('submit', function(_e) {
								console.log("🚀 FORMULARIO ENVIADO - Evento capturado!");
								console.log("   - Action actual:", form.getAttribute('action'));
								console.log("   - Method:", form.getAttribute('method'));
								console.log("   - Target:", form.getAttribute('target'));
								
								// No prevenir el default, solo observar
								// _e.preventDefault();
							});
							
							// También observar cambios en el DOM
							const observer = new MutationObserver((mutations) => {
								mutations.forEach((mutation) => {
									if (mutation.type === 'attributes' && mutation.attributeName === 'action') {
										console.log("🔄 Action del formulario cambió a:", form.getAttribute('action'));
									}
								});
							});
							
							observer.observe(form, { 
								attributes: true, 
								attributeFilter: ['action', 'method'] 
							});
							
							// Observar la creación de iframes
							const iframeObserver = new MutationObserver((mutations) => {
								mutations.forEach((mutation) => {
									mutation.addedNodes.forEach((node: any) => {
										if (node.tagName === 'IFRAME') {
											console.log("🖼️ Nuevo iframe detectado:", {
												name: node.name,
												src: node.src,
												id: node.id
											});
											
											// Escuchar cuando el iframe se carga
											node.addEventListener('load', () => {
												console.log("✅ Iframe cargado:", node.name);
												try {
													const iframeDoc = node.contentDocument || node.contentWindow?.document;
													if (iframeDoc) {
														console.log("📄 Contenido del iframe accesible");
													}
												} catch (e) {
													console.log("🔒 Iframe cross-origin, no se puede acceder al contenido");
												}
											});
										}
									});
								});
							});
							
							iframeObserver.observe(document.body, { 
								childList: true, 
								subtree: true 
							});
						}
					}, 500);
				},
				onBeforeSubmitCard: function (data: any) {
					console.log("🔄 Widget Datafast: Usuario hizo clic en Pagar, procesando...");
					console.log("🔍 Datos de la tarjeta que se están enviando:", data);
					
					// Buscar el formulario y verificar su estado
					const form = document.querySelector('form.paymentWidgets') as HTMLFormElement;
					if (form) {
						console.log("📝 Estado del formulario al hacer submit:");
						console.log("   - Action:", form.action);
						console.log("   - Method:", form.method);
						console.log("   - Target:", form.target);
						
						// Verificar si hay campos ocultos con el checkout ID
						const checkoutIdField = form.querySelector('input[name="checkoutId"]');
						if (checkoutIdField) {
							console.log("   - CheckoutId field:", checkoutIdField.getAttribute('value'));
						}
						
						// Verificar si hay un iframe target
						const targetFrame = document.querySelector(`iframe[name="${form.target}"]`);
						if (targetFrame) {
							console.log("   - Target iframe encontrado:", targetFrame);
						} else {
							console.log("   - ⚠️ No se encontró iframe target");
						}
					}
					
					showNotification(
						NotificationType.INFO,
						"Procesando pago con Datafast..."
					);
					
					// Retornar true para permitir el submit
					return true;
				},
				onAfterSubmitCard: async function (data: any) {
					console.log("⏳ Widget Datafast: Datos enviados, esperando respuesta...");
					console.log("📤 Respuesta completa después del envío:", data);
					
					// Debug detallado de la respuesta
					console.log("🔍 DEBUG: Analizando estructura de la respuesta:");
					console.log("   - Tipo de data:", typeof data);
					console.log("   - Es un array?:", Array.isArray(data));
					console.log("   - Keys del objeto:", data ? Object.keys(data) : "data es null/undefined");
					
					// Si data es un evento, intentar obtener más información
					if (data && data.originalEvent) {
						console.log("📋 Evento original detectado:", data.originalEvent);
					}
					if (data && data.target) {
						console.log("🎯 Target del evento:", data.target);
						const form = data.target;
						if (form && form.tagName === 'FORM') {
							console.log("📝 Formulario encontrado en evento:");
							console.log("   - Action:", form.action);
							console.log("   - Method:", form.method);
						}
					}
					
					// Intentar convertir a string solo si no es circular
					try {
						console.log("   - JSON stringified:", JSON.stringify(data, null, 2));
					} catch (e) {
						console.log("   - No se puede convertir a JSON (referencia circular)");
					}
					
					// Verificar si hay información de redirect
					if (data && data.redirect) {
						console.log("🔗 Información de redirect encontrada:", data.redirect);
					}
					
					// Verificar si hay un resourcePath
					if (data && data.resourcePath) {
						console.log("📍 ResourcePath encontrado:", data.resourcePath);
						console.log("🔄 Intentando redirección manual a:", `/datafast-result?resourcePath=${encodeURIComponent(data.resourcePath)}`);
						
						// Intentar redirección manual si el widget no lo hace automáticamente
						setTimeout(() => {
							console.log("⏰ Esperando 3 segundos para ver si hay redirección automática...");
						}, 3000);
					}
					
					// Monitorear cambios en el DOM y verificar estado
					let checkCount = 0;
					const maxChecks = 10; // Verificar máximo 10 veces
					
					const checkInterval = setInterval(async () => {
						checkCount++;
						console.log(`🔄 Verificación ${checkCount}/${maxChecks} del estado del pago...`);
						
						// Verificar si hay un iframe de pago
						const paymentIframe = document.querySelector('iframe[name*="oppwa"], iframe[src*="oppwa"], iframe[src*="datafast"]') as HTMLIFrameElement;
						if (paymentIframe) {
							console.log("🖼️ iFrame de pago detectado:", {
								name: paymentIframe.getAttribute('name'),
								src: paymentIframe.getAttribute('src'),
								visible: paymentIframe.style.display !== 'none'
							});
						}
						
						// Verificar si el formulario cambió
						const form = document.querySelector('form.paymentWidgets');
						if (form) {
							const formAction = form.getAttribute('action');
							if (formAction && formAction.includes('resourcePath')) {
								console.log("📝 Formulario actualizado con resourcePath:", formAction);
								clearInterval(checkInterval);
								
								// Extraer resourcePath
								const urlParams = new URLSearchParams(formAction.split('?')[1]);
								const resourcePath = urlParams.get('resourcePath');
								if (resourcePath) {
									console.log("🎯 ResourcePath extraído:", resourcePath);
									localStorage.setItem("datafast_resource_path", resourcePath);
									
									// Redirigir manualmente después de un momento
									setTimeout(() => {
										console.log("🚀 Redirigiendo manualmente al resultado...");
										window.location.href = formAction;
									}, 2000);
								}
							}
						}
						
						// Verificar el estado del pago con el backend
						if (checkCount >= 3) { // Empezar a verificar después del 3er intento
							const checkoutId = localStorage.getItem("datafast_checkout_id");
							const transactionId = localStorage.getItem("datafast_transaction_id");
							
							if (checkoutId && transactionId) {
								try {
									const verifyResponse = await fetch(`/api/datafast/verify-payment/${transactionId}`, {
										method: 'GET',
										headers: {
											'Content-Type': 'application/json',
											'Authorization': `Bearer ${localStorage.getItem('authToken')}`
										}
									});
									
									const result = await verifyResponse.json();
									console.log(`📊 Estado del pago (intento ${checkCount}):`, result.data?.payment_status);
									
									if (result.status === 'success' && result.data?.payment_status === 'completed') {
										console.log("🎉 Pago completado exitosamente!");
										clearInterval(checkInterval);
										window.location.href = `/datafast-result?status=success&transactionId=${transactionId}`;
									}
								} catch (error) {
									console.error(`❌ Error verificando estado (intento ${checkCount}):`, error);
								}
							}
						}
						
						// Detener después de maxChecks intentos
						if (checkCount >= maxChecks) {
							console.log("⏰ Se alcanzó el límite de verificaciones");
							clearInterval(checkInterval);
						}
					}, 3000); // Verificar cada 3 segundos
				},
				onLoadThreeDSecure: function () {
					console.log("🔐 Widget Datafast: Cargando 3D Secure...");
				},
				onBeforeRedirectToResult: function (data: any) {
					console.log("🔄 Widget Datafast: Redirigiendo a página de resultado...");
					console.log("🔗 Datos completos de redirección:", data);
					console.log("🔍 DEBUG Redirect - Keys:", data ? Object.keys(data) : "null");
					console.log("🔍 DEBUG Redirect - JSON:", JSON.stringify(data, null, 2));
					
					// Si encontramos un resourcePath, guardarlo
					if (data && data.resourcePath) {
						localStorage.setItem("datafast_resource_path", data.resourcePath);
						console.log("💾 ResourcePath guardado en localStorage:", data.resourcePath);
					}
					
					// Permitir que el widget haga la redirección
					return true;
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
					console.log("📋 Datos completos del formulario:", data);
					console.log("📋 DEBUG Submit - Keys:", data ? Object.keys(data) : "null");
					console.log("📋 DEBUG Submit - JSON:", JSON.stringify(data, null, 2));
					
					// Verificar el formulario actual
					const form = document.querySelector('form.paymentWidgets');
					if (form) {
						console.log("📝 Formulario encontrado:");
						console.log("   - Action:", form.getAttribute('action'));
						console.log("   - Method:", form.getAttribute('method'));
						console.log("   - Target:", form.getAttribute('target'));
						
						// Verificar si hay un iframe oculto
						const iframe = document.querySelector('iframe[name*="oppwa"]');
						if (iframe) {
							console.log("🖼️ iFrame de pago encontrado:", iframe);
						}
					}
					
					return true; // Permitir el submit
				},
				style: "card",
				locale: "es",
				labels: {
					cvv: "CVV",
					cardHolder: "Nombre (igual que en la tarjeta)",
				},
			};

			// Cargar script adicional de validaciones de Datafast (opcional, ya que puede no existir)
			const validationScriptUrl = import.meta.env.VITE_DATAFAST_VALIDATION_SCRIPT;
			if (validationScriptUrl) {
				const additionalScript = document.createElement("script");
				additionalScript.src = validationScriptUrl;
				additionalScript.async = true;
				additionalScript.onerror = () => {
					console.warn("Script de validaciones adicionales de Datafast no disponible, continuando sin él");
				};
				document.head.appendChild(additionalScript);
			}

			// Usar la URL del widget que viene del backend (incluye el checkoutId)
			const script = document.createElement("script");
			script.id = "datafast-widget-script";
			
			// IMPORTANTE: Usar widget_url del backend que ya incluye el checkoutId
			if (checkoutData?.widget_url) {
				script.src = checkoutData.widget_url;
				console.log("📌 Usando widget_url del backend:", checkoutData.widget_url);
			} else {
				// Fallback solo si no hay widget_url del backend
				const widgetBaseUrl = import.meta.env.VITE_DATAFAST_WIDGET_URL || "https://eu-test.oppwa.com/v1/paymentWidgets.js";
				script.src = `${widgetBaseUrl}?checkoutId=${checkoutId}`;
				console.log("⚠️ Usando fallback URL con checkoutId:", script.src);
			}
			
			script.async = true;

			script.onload = () => {
				console.log("✅ Script de widget Datafast cargado exitosamente");
				
				// Verificar que el widget se cargó correctamente
				setTimeout(() => {
					const forms = document.querySelectorAll('form.paymentWidgets');
					console.log("📝 Formularios de pago encontrados:", forms.length);
					
					if (forms.length === 0) {
						console.warn("⚠️ No se encontraron formularios con clase 'paymentWidgets'");
					} else {
						forms.forEach((form, index) => {
							console.log(`📋 Formulario ${index + 1}:`, {
								action: form.getAttribute('action'),
								method: form.getAttribute('method'),
								'data-brands': form.getAttribute('data-brands')
							});
						});
					}
					
					// Verificar si hay scripts dinámicos bloqueados
					const scripts = document.querySelectorAll('script[src*="techlab-cdn"], script[src*="oppwa"]');
					console.log("📜 Scripts de Datafast cargados:", scripts.length);
					scripts.forEach(script => {
						console.log("  - ", (script as HTMLScriptElement).src);
					});
				}, 1000);
			};

			script.onerror = (error) => {
				console.error("❌ Error al cargar script del widget:", error);
				showNotification(
					NotificationType.ERROR,
					"Error al cargar el formulario de pago. Por favor, recargue la página."
				);
			};

			document.head.appendChild(script);
			console.log("📌 Script del widget añadido al DOM:", script.src);
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
			// ✅ SOLUCIÓN CORREGIDA: Replicar EXACTAMENTE el flujo del widget real
			console.log("🎯 PRUEBA COMPLETA DATAFAST: Simulando flujo idéntico al widget real");

			// Paso 1: Crear checkout (igual que el widget)
			await handleStartPayment();

			// Paso 2: Esperar a que se complete la creación del checkout
			setTimeout(async () => {
				try {
					// Obtener datos del checkout creado
					const transactionId = localStorage.getItem("datafast_transaction_id");
					const checkoutId = localStorage.getItem("datafast_checkout_id");
					
					if (!transactionId || !checkoutId) {
						throw new Error("No se encontraron IDs de transacción para continuar con la simulación");
					}

					console.log("🔄 Simulando flujo completo del widget (sin usar crédito)...");
					
					// Paso 3: Simular el comportamiento EXACTO del widget real
					const resultUrl = await datafastService.simulateCompleteWidgetFlow(
						checkoutId,
						transactionId,
						calculatedTotals.total,
						formData
					);

					console.log("✅ Flujo del widget simulado exitosamente");
					console.log("🚀 Redirigiendo a DatafastResultPage (idéntico al widget real):", resultUrl);

					// Paso 4: Redirigir EXACTAMENTE igual que lo haría el widget real
					// Esto procesará el resultado a través de DatafastResultPage usando el flujo completo
					window.location.href = resultUrl;
					
					// Ya no necesitamos limpiar el carrito aquí - DatafastResultPage se encargará
					
				} catch (simulationError) {
					console.error("❌ Error en simulación de widget flow:", simulationError);
					showNotification(
						NotificationType.ERROR, 
						"Error al simular el flujo del widget: " + (simulationError as any)?.message
					);
				}
			}, 2000); // Tiempo para que se complete el checkout

			// Salir aquí - el flujo continuará en DatafastResultPage
			return;
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
					} : undefined
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
		if (!checkoutData) {
			showNotification(NotificationType.ERROR, "No hay datos de checkout disponibles");
			return;
		}

		try {
			setIsLoading(true);
			
			// ✅ GUARDAR EL TOTAL CALCULADO EN LOCALSTORAGE PARA LA PÁGINA DE RESULTADO
			const totals = cart ? await CheckoutItemsService.calculateCheckoutTotals(cart.items, appliedDiscount) : null;
			if (totals) {
				localStorage.setItem("datafast_calculated_total", totals.total.toString());
				console.log("💰 Total calculado guardado para verificación:", totals.total);
			}

			// ✅ GUARDAR DATOS DEL CARRITO PARA RECUPERACIÓN EN CASO DE ERROR
			console.log("💾 GUARDANDO BACKUP DEL CARRITO EN LOCALSTORAGE (ANTES DEL WIDGET)");
			console.log("   - Items en carrito:", cart?.items?.length || 0);
			console.log("   - Carrito completo:", cart);
			localStorage.setItem("datafast_cart_backup", JSON.stringify(cart));
			console.log("   ✅ Backup guardado exitosamente");
			
			// ✅ CONFIGURAR EL CALLBACK PARA MANEJAR EL RESULTADO DEL PAGO REAL
			(window as any).wpwlOptions = {
				onReady: function() {
					console.log("🎯 Widget Datafast listo para pago real");
					showNotification(
						NotificationType.INFO,
						"Complete los datos de su tarjeta en el formulario y haga clic en 'Pagar'."
					);
				},
				onSuccess: function(result: any) {
					console.log("🎉 Pago real exitoso:", result);
					// Redirigir a página de resultado
					window.location.href = `/datafast-result?resourcePath=${encodeURIComponent(result.resourcePath)}`;
				},
				onError: function(error: any) {
					console.error("❌ Error en pago real:", error);
					setIsLoading(false);
					showNotification(
						NotificationType.ERROR,
						"Error al procesar el pago. Inténtelo nuevamente."
					);
				}
			};

			console.log("🔄 Configuración lista para pago real con Datafast");
			
		} catch (error) {
			console.error("❌ Error configurando pago real:", error);
			setIsLoading(false);
			showNotification(
				NotificationType.ERROR,
				"Error al configurar el pago real"
			);
		}
	};

	// Determinar si estamos en desarrollo
	const isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.VITE_APP_ENV === 'development';

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
						{/* El widget de Datafast inyectará su propio formulario aquí */}
						<form
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

					{isDevelopment && (
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
						</div>
					)}

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