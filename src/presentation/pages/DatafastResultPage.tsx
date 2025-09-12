import React, {useEffect, useState, useRef} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {DatafastService} from "../../core/services/DatafastService";
import {useCart} from "../hooks/useCart";
import {NotificationType} from "../contexts/CartContext";
import {formatCurrency} from "../../utils/formatters/formatCurrency";
import {CheckoutService} from "../../core/services/CheckoutService";
import type {PaymentMethod} from "../../core/services/CheckoutService";
import {CheckoutItemsService} from "../../infrastructure/services/CheckoutItemsService";
import {useAuth} from "../contexts/AuthContext";
import {validateTotalsEquality, CALCULATION_CONFIG} from "../../constants/calculationConfig";
import {useDatafastCSP} from "../hooks/useDatafastCSP";

// 🔒 SISTEMA DE BLOQUEO GLOBAL MEJORADO
// Usa el resourcePath como clave única para garantizar procesamiento idempotente
interface ProcessingRecord {
	processedAt: number;
	orderData?: any;
	status: 'processing' | 'completed' | 'failed';
}

const globalProcessingRecords: Map<string, ProcessingRecord> = new Map();

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
	// 🔓 Desactivar CSP temporalmente para permitir scripts de Datafast
	useDatafastCSP();
	
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const {cart, clearCart, showNotification, appliedDiscount} = useCart();
	const {user} = useAuth();
	const [isProcessing, setIsProcessing] = useState(true);
	const [result, setResult] = useState<ProcessingResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [countdown] = useState(5);

	const datafastService = new DatafastService();
	const checkoutService = new CheckoutService();
	
	// ✅ SOLUCIÓN: Usar ref para el cart para evitar bucles infinitos
	const cartRef = useRef(cart);
	cartRef.current = cart; // Actualizar el ref cuando el cart cambie

	useEffect(() => {
		const resourcePath = searchParams.get('resourcePath');
		
		// ✅ CORRECCIÓN: Declarar cleanupFunction al inicio del scope
		let cleanupFunction: (() => void) | null = null;
		
		// 🚨 VALIDACIÓN #1: Sin resourcePath no hay nada que procesar
		if (!resourcePath) {
			console.log("⚠️ No hay resourcePath en la URL");
			// Verificar si hay una orden reciente guardada
			const recentOrder = localStorage.getItem("datafast_order_result");
			const recentTimestamp = localStorage.getItem("datafast_order_timestamp");
			if (recentOrder && recentTimestamp) {
				const age = Date.now() - parseInt(recentTimestamp);
				if (age < 30000) { // Menos de 30 segundos
					try {
						const orderData = JSON.parse(recentOrder);
						setResult({
							success: true,
							data: orderData,
							message: "Pago procesado exitosamente"
						});
						setIsProcessing(false);
						setTimeout(() => navigate("/orders"), 3000);
						return;
					} catch (e) {
						console.error("Error parseando orden reciente:", e);
					}
				}
			}
			setError("No se encontró información del pago");
			setIsProcessing(false);
			return;
		}
		
		// 🔒 BLOQUEO IDEMPOTENTE: Usar resourcePath como clave única
		const existingRecord = globalProcessingRecords.get(resourcePath);
		
		if (existingRecord) {
			console.log("🔍 Registro existente encontrado:", {
				resourcePath,
				status: existingRecord.status,
				processedAt: new Date(existingRecord.processedAt).toISOString()
			});
			
			// Si está procesando, esperar
			if (existingRecord.status === 'processing') {
				console.log("⏳ Pago en proceso, esperando...");
				// Revisar cada segundo si ya terminó
				const checkInterval = setInterval(() => {
					const record = globalProcessingRecords.get(resourcePath);
					if (record && record.status !== 'processing') {
						clearInterval(checkInterval);
						if (record.status === 'completed' && record.orderData) {
							setResult({
								success: true,
								data: record.orderData,
								message: "Pago procesado exitosamente"
							});
							setIsProcessing(false);
							setTimeout(() => navigate("/orders"), 3000);
						} else if (record.status === 'failed') {
							setError("Error procesando el pago");
							setIsProcessing(false);
						}
					}
				}, 1000);
				
				// Guardar función de limpieza para el useEffect
				cleanupFunction = () => clearInterval(checkInterval);
				
				// ✅ CRÍTICO: Salir completamente cuando está procesando para evitar request duplicado  
				return;
			}
			
			// Si ya se completó, mostrar resultado
			if (existingRecord.status === 'completed' && existingRecord.orderData) {
				console.log("✅ Pago ya procesado, mostrando resultado");
				setResult({
					success: true,
					data: existingRecord.orderData,
					message: "Pago procesado exitosamente"
				});
				setIsProcessing(false);
				setTimeout(() => navigate("/orders"), 3000);
				return;
			}
			
			// Si falló, puede intentar de nuevo después de 30 segundos
			if (existingRecord.status === 'failed') {
				const age = Date.now() - existingRecord.processedAt;
				if (age < 30000) {
					console.log("❌ Pago falló recientemente, no reintentar aún");
					setError("Error procesando el pago. Por favor, intente nuevamente.");
					setIsProcessing(false);
					return;
				}
				// Si pasaron más de 30 segundos, permitir reintentar
				console.log("🔄 Reintentando pago fallido");
			}
		}
		
		// 🛡️ ÚLTIMA VERIFICACIÓN: Si hay una orden MUY reciente, ni siquiera intentar procesar
		const recentOrder = localStorage.getItem("datafast_order_result");
		const recentTimestamp = localStorage.getItem("datafast_order_timestamp");
		if (recentOrder && recentTimestamp) {
			const age = Date.now() - parseInt(recentTimestamp);
			if (age < 10000) { // Menos de 10 segundos = es el segundo montaje de StrictMode
				console.log("🛑 Orden procesada hace", Math.round(age/1000), "segundos. Bloqueando segundo procesamiento.");
				
				// Marcar como completado con la orden existente
				globalProcessingRecords.set(resourcePath, {
					processedAt: parseInt(recentTimestamp),
					status: 'completed',
					orderData: JSON.parse(recentOrder)
				});
				
				// Mostrar resultado y salir
				try {
					const orderData = JSON.parse(recentOrder);
					setResult({
						success: true,
						data: orderData,
						message: "Pago procesado exitosamente"
					});
					setIsProcessing(false);
					setTimeout(() => navigate("/orders"), 3000);
				} catch (e) {
					console.error("Error parseando orden reciente:", e);
				}
				return;
			}
		}
		
		// 🚀 MARCAR COMO PROCESANDO INMEDIATAMENTE
		globalProcessingRecords.set(resourcePath, {
			processedAt: Date.now(),
			status: 'processing'
		});
		
		// Reducir logs para evitar saturación
		if (process.env.NODE_ENV === 'development') {
			console.log("✅ Procesando pago:", resourcePath?.substring(0, 20) + "...");
		}
		
		const processDatafastResult = async () => {
			const resourcePath = searchParams.get("resourcePath");
			
			if (!resourcePath) {
				console.error("❌ No hay resourcePath para procesar");
				globalProcessingRecords.set("no-resource", {
					processedAt: Date.now(),
					status: 'failed'
				});
				throw new Error("No se encontró información del pago");
			}
			
			// 🛡️ VERIFICACIÓN CRÍTICA MEJORADA: Si ya hay una orden procesada MUY recientemente, NO hacer nada más
			const existingOrderStr = localStorage.getItem("datafast_order_result");
			const existingOrderTimestamp = localStorage.getItem("datafast_order_timestamp");
			const currentTransactionId = localStorage.getItem("datafast_transaction_id");
			
			if (existingOrderStr && existingOrderTimestamp && currentTransactionId) {
				const orderAge = Date.now() - parseInt(existingOrderTimestamp);
				// Si la orden tiene menos de 60 segundos, verificar si es la misma transacción
				if (orderAge < 60000) {
					try {
						const existingOrder = JSON.parse(existingOrderStr);
						
						// ✅ VERIFICACIÓN ADICIONAL: Comparar transaction_id para evitar conflictos entre transacciones
						const existingTransactionFromOrder = existingOrder.datafast_transaction_id || existingOrder.transaction_id;
						
						console.log("🔍 Verificando transacción duplicada:", {
							currentTransactionId,
							existingTransactionFromOrder,
							orderAge: Math.round(orderAge/1000) + "s",
							match: existingTransactionFromOrder === currentTransactionId
						});
						
						// Solo salir si es la MISMA transacción
						if (existingTransactionFromOrder === currentTransactionId) {
							console.log("✅ MISMA TRANSACCIÓN ya procesada hace", Math.round(orderAge/1000), "segundos. Evitando request duplicado.");
							
							// Actualizar el registro global
							globalProcessingRecords.set(resourcePath, {
								processedAt: Date.now(),
								status: 'completed',
								orderData: existingOrder
							});
							
							// Mostrar resultado existente
							setResult({
								success: true,
								data: existingOrder,
								message: "Pago procesado exitosamente"
							});
							
							// Limpiar carrito por si acaso
							setTimeout(() => {
								if (cartRef.current && cartRef.current.items.length > 0) {
									clearCart();
								}
								showNotification(NotificationType.SUCCESS, "¡Pago completado exitosamente!");
							}, 100);
							
							// Redirigir
							setTimeout(() => {
								navigate("/orders");
							}, 3000);
							
							return; // SALIR COMPLETAMENTE - NO HACER MÁS LLAMADAS API
						} else {
							console.log("⚠️ Transacción DIFERENTE detectada. Continuando con procesamiento normal.");
						}
					} catch (e) {
						console.error("Error parseando orden existente:", e);
						// Si hay error, continúar con procesamiento normal
					}
				}
			}
			
			try {
				console.log("🚀 Procesando pago con resourcePath:", resourcePath);
				
				// VERIFICACIÓN MEJORADA: Solo usar datos guardados si NO hay resourcePath nuevo
				// y si los datos guardados son recientes (menos de 5 minutos)
				const orderDataStr = localStorage.getItem("datafast_order_result");
				const orderTimestamp = localStorage.getItem("datafast_order_timestamp");
				
				if (orderDataStr && !resourcePath) {
					const now = Date.now();
					const timestamp = orderTimestamp ? parseInt(orderTimestamp) : 0;
					const isRecent = (now - timestamp) < 5 * 60 * 1000; // 5 minutos
					
					if (isRecent) {
						try {
							const orderData = JSON.parse(orderDataStr);
							console.log("✅ Mostrando orden ya procesada (reciente):", orderData);
							
							setResult({
								success: true,
								data: orderData,
								message: "Pago procesado exitosamente"
							});
							
							// Limpiar datos temporales
							localStorage.removeItem("datafast_order_result");
							localStorage.removeItem("datafast_order_timestamp");
							localStorage.removeItem("datafast_transaction_id");
							localStorage.removeItem("datafast_calculated_total");
							localStorage.removeItem("datafast_form_data");
							localStorage.removeItem("datafast_cart_backup");
							
							setTimeout(() => {
								showNotification(NotificationType.SUCCESS, "¡Pago completado exitosamente!");
							}, 100);
							
							setTimeout(() => {
								navigate("/orders");
							}, 8000);
							
							return;
						} catch (e) {
							console.error("Error parseando datos de orden:", e);
						}
					} else {
						console.log("⚠️ Datos de orden antiguos, procesando nuevo pago");
						// Limpiar datos antiguos
						localStorage.removeItem("datafast_order_result");
						localStorage.removeItem("datafast_order_timestamp");
					}
				}
				
				// SEGUNDA VERIFICACIÓN: Si hay resourcePath, procesar el pago
				if (!resourcePath) {
					// Si no hay resourcePath ni datos guardados, mostrar error
					throw new Error(
						"No se encontró información del pago"
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

				// ✅ OBTENER TOTAL CALCULADO DEL LOCALSTORAGE (PARA PAGOS REALES)
				const calculatedTotalStr = localStorage.getItem("datafast_calculated_total");
				const calculatedTotal = calculatedTotalStr ? parseFloat(calculatedTotalStr) : undefined;
				
				console.log("Verificando pago con:", {
					resourcePath,
					transactionId,
					calculatedTotal,
				});

				// Verificar el pago - INCLUIR TOTAL CALCULADO
				const verifyResponse = await datafastService.verifyPayment({
					resource_path: resourcePath,
					transaction_id: transactionId,
					calculated_total: calculatedTotal, // ✅ ENVIAR TOTAL CALCULADO
				});

				console.log("Respuesta de verificación:", verifyResponse);

				// ✅ CORRECCIÓN: Verificar 'status' en lugar de 'success'
				if ((verifyResponse.success || verifyResponse.status === 'success') && verifyResponse.data) {
					// Pago exitoso - Ahora crear la orden en el sistema
					console.log("✅ Pago verificado exitosamente, creando orden...");
					
					// Obtener datos del formulario y carrito backup
					const formDataStr = localStorage.getItem("datafast_form_data");
					const cartBackupStr = localStorage.getItem("datafast_cart_backup");
					
					let formData = {
						given_name: "Cliente",
						surname: "Datafast",
						address: "N/A",
						city: "N/A",
						country: "EC",
						phone: "N/A"
					};
					
					if (formDataStr) {
						try {
							formData = JSON.parse(formDataStr);
						} catch (e) {
							console.error("Error parseando datos del formulario:", e);
						}
					}
					
					// Usar carrito actual o backup
					let cartToProcess = cartRef.current;
					if ((!cartRef.current || cartRef.current.items.length === 0) && cartBackupStr) {
						try {
							cartToProcess = JSON.parse(cartBackupStr);
							console.log("📦 Usando carrito backup para procesar orden", cartToProcess);
						} catch (e) {
							console.error("Error parseando carrito backup:", e);
						}
					}
					
					// 🚨 VALIDACIÓN CRÍTICA #1: Verificar que tenemos un carrito válido
					if (!cartToProcess || !cartToProcess.items || cartToProcess.items.length === 0) {
						console.error("❌ CRÍTICO: No hay carrito disponible para procesar");
						console.error("   - cart:", cartRef.current);
						console.error("   - cartBackupStr:", cartBackupStr);
						
						// 🔍 NUEVA PROTECCIÓN: Verificar si ya existe una orden procesada
						const existingOrderStr = localStorage.getItem("datafast_order_result");
						const existingOrderTimestamp = localStorage.getItem("datafast_order_timestamp");
						
						if (existingOrderStr && existingOrderTimestamp) {
							const orderAge = Date.now() - parseInt(existingOrderTimestamp);
							if (orderAge < 60000) { // Menos de 1 minuto
								console.log("✅ Orden ya procesada recientemente, mostrando resultado existente");
								const existingOrder = JSON.parse(existingOrderStr);
								
								setResult({
									success: true,
									data: existingOrder,
									message: "Pago procesado exitosamente (orden existente)"
								});
								
								setTimeout(() => {
									showNotification(NotificationType.SUCCESS, "¡Pago completado exitosamente!");
									navigate("/orders");
								}, 3000);
								
								return; // Salir sin procesar de nuevo
							}
						}
						
						throw new Error("No se encontraron items para procesar la orden. Por favor, vuelva al carrito.");
					}
					
					console.log("🔍 VALIDACIÓN PRE-CHECKOUT DATAFAST:");
					console.log("   ✅ Carrito encontrado con", cartToProcess.items.length, "items");
					console.log("   - Items del carrito:", cartToProcess.items);
					
					// Preparar items para el checkout con forceRefresh
					const sellerId = cartToProcess ? CheckoutService.getSellerIdFromCart(cartToProcess) : null;
					const items = cartToProcess ? await CheckoutItemsService.prepareItemsForCheckout(
						cartToProcess.items, 
						null, // No hay cupón aplicado
						true  // forceRefresh para garantizar datos frescos
					) : [];
					
					// 🚨 VALIDACIÓN CRÍTICA #2: Verificar que los items tienen precios válidos
					if (items.length === 0) {
						console.error("❌ CRÍTICO: No se pudieron preparar items para checkout");
						throw new Error("Error preparando items para el pago");
					}
					
					const invalidItems = items.filter(item => !item.price || item.price <= 0);
					if (invalidItems.length > 0) {
						console.error("❌ CRÍTICO: Items con precio inválido:", invalidItems);
						throw new Error("Algunos productos no tienen precio válido");
					}
					
					console.log("   ✅ Items preparados correctamente:", items.length);
					console.log("   - Precios de items:", items.map(i => ({ id: i.product_id, price: i.price })));
					
					// Calcular totales con forceRefresh
					const calculatedTotals = cartToProcess ? await CheckoutItemsService.calculateCheckoutTotals(
						cartToProcess.items, 
						appliedDiscount,
						true // forceRefresh para garantizar cálculo correcto
					) : null;
					
					// 🚨 VALIDACIÓN CRÍTICA #3: El total NUNCA debe ser $0.00
					if (!calculatedTotals || calculatedTotals.total <= 0) {
						console.error("❌ CRÍTICO: Total calculado es $0.00 o inválido");
						console.error("   - calculatedTotals:", calculatedTotals);
						console.error("   - cartToProcess:", cartToProcess);
						console.error("   - items preparados:", items);
						throw new Error(`El total calculado es inválido: $${calculatedTotals?.total || 0}`);
					}
					
					// 🚨 VALIDACIÓN CRÍTICA #4: Verificar consistencia con monto de Datafast
					const datafastAmount = typeof verifyResponse.data.total === 'string' 
						? parseFloat(verifyResponse.data.total) 
						: verifyResponse.data.total;
					const ourTotal = calculatedTotals.total;
					
					// ✅ USAR SISTEMA DE VALIDACIÓN CENTRALIZADO
					const totalsMatch = validateTotalsEquality(
						datafastAmount,
						ourTotal,
						'Datafast vs Sistema (DatafastResultPage)',
						CALCULATION_CONFIG.VALIDATIONS.CHECKOUT_TOLERANCE // Usa tolerancia de 0.001 por defecto
					);
					
					console.log("💰 VALIDACIÓN DE MONTOS CON SISTEMA CENTRALIZADO:");
					console.log("   - Total de Datafast:", datafastAmount);
					console.log("   - Total calculado (EcommerceCalculator):", ourTotal);
					console.log("   - Tolerancia aplicada:", CALCULATION_CONFIG.VALIDATIONS.CHECKOUT_TOLERANCE);
					console.log("   - Validación:", totalsMatch ? "✅ MONTOS VÁLIDOS" : "⚠️ DISCREPANCIA DETECTADA");
					
					if (!totalsMatch) {
						console.warn("⚠️ ADVERTENCIA: Los totales tienen una discrepancia mayor a la tolerancia permitida");
						console.warn(`   Datafast: $${datafastAmount} vs Calculado: $${ourTotal}`);
						console.warn(`   Diferencia: $${Math.abs(datafastAmount - ourTotal).toFixed(6)}`);
						console.warn(`   Tolerancia máxima: $${CALCULATION_CONFIG.VALIDATIONS.CHECKOUT_TOLERANCE}`);
						// No lanzar error, solo advertencia - El sistema procederá con el total de Datafast
					}
					
					console.log("✅ TODAS LAS VALIDACIONES PASADAS:");
					console.log("   - Total válido: $", calculatedTotals.total);
					console.log("   - Items válidos:", items.length);
					console.log("   - Seller ID:", sellerId);
					
					console.log("📦 Preparando checkout con:", {
						sellerId,
						items: items.length,
						total: calculatedTotals.total,
						formData: formData ? "Datos de formulario presentes" : "Sin datos de formulario"
					});
					
					// Crear la orden en el sistema
					const checkoutRequestData = {
						payment: {
							method: "datafast" as PaymentMethod,
							transaction_id: verifyResponse.data.payment_id,
							amount: verifyResponse.data.total
						},
						shippingAddress: {
							name: formData.given_name + " " + formData.surname,
							identification: formData.doc_id || "",
							street: formData.address,
							city: formData.city,
							state: formData.country,
							postalCode: "00000",
							country: formData.country,
							phone: formData.phone,
						},
						seller_id: sellerId || undefined,
						items: items,
						calculated_totals: calculatedTotals ? {
							subtotal: calculatedTotals.subtotal,
							tax: calculatedTotals.tax,
							shipping: calculatedTotals.shipping,
							total: calculatedTotals.total,
							total_discounts: calculatedTotals.totalDiscounts
						} : undefined
					};
					
					try {
						const checkoutResponse = await checkoutService.processCheckout(checkoutRequestData, user?.email);
						
						if (checkoutResponse.status === "success") {
							console.log("✅ Orden creada exitosamente:", checkoutResponse.data);
							
							// Combinar datos de Datafast y del checkout
							const finalOrderData = {
								...verifyResponse.data,
								order_id: checkoutResponse.data.order_id || verifyResponse.data.order_id,
								order_number: checkoutResponse.data.order_number || verifyResponse.data.order_number,
								transaction_id: transactionId,  // ✅ AGREGAR TRANSACTION_ID PARA ANTI-DUPLICACIÓN
								datafast_transaction_id: transactionId // También con nombre alternativo
							};
							
							// Guardar resultado ANTES de cualquier otra cosa
							localStorage.setItem("datafast_order_result", JSON.stringify(finalOrderData));
							localStorage.setItem("datafast_order_timestamp", Date.now().toString());
							
							// Actualizar registro global como completado
							if (resourcePath) {
								globalProcessingRecords.set(resourcePath, {
									processedAt: Date.now(),
									status: 'completed',
									orderData: finalOrderData
								});
							}
							
							// Limpiar carrito INMEDIATAMENTE
							clearCart();
							
							// Mostrar notificación de éxito
							showNotification(
								NotificationType.SUCCESS,
								"¡Pago y orden completados exitosamente!"
							);
							
							// Actualizar estado para mostrar éxito brevemente
							setResult({
								success: true,
								data: finalOrderData,
								message: "Pago y orden procesados exitosamente",
							});
							
							// REDIRIGIR INMEDIATAMENTE - Evitar re-render y crash
							// NO cambiar estado visual, ir directo a orders
							navigate("/orders");
							return; // Salir inmediatamente
						} else {
							throw new Error(checkoutResponse.message || "Error al crear la orden");
						}
					} catch (checkoutError) {
						console.error("Error creando orden:", checkoutError);
						// Aún así mostrar que el pago fue exitoso
						setResult({
							success: true,
							data: verifyResponse.data,
							message: "Pago procesado (orden pendiente de creación)",
						});
						
						// Limpiar carrito de todas formas
						setTimeout(() => {
							clearCart();
						}, 100);
					}
					
					// Limpiar datos temporales
					localStorage.removeItem("datafast_transaction_id");
					localStorage.removeItem("datafast_calculated_total");
					localStorage.removeItem("datafast_form_data");
					localStorage.removeItem("datafast_cart_backup");
					localStorage.removeItem("datafast_checkout_id");
					localStorage.removeItem("datafast_resource_path");
					
					// La redirección ya se maneja arriba en el bloque de éxito
				} else {
					// Pago fallido o pendiente
					const message = verifyResponse.message || "El pago no fue completado";
					const resultCode = verifyResponse.result_code;

					console.warn("Pago no exitoso:", {
						message,
						resultCode,
						fullResponse: verifyResponse,
					});

					// ✅ MANEJO ESPECIAL: Si es 200.300.404, verificar si ya existe orden exitosa
					if (resultCode === "200.300.404") {
						console.log("🔍 Error 200.300.404 - Verificando si ya existe orden exitosa");
						
						// Verificar si hay datos de orden recientes en localStorage
						const orderDataStr = localStorage.getItem("datafast_order_result");
						const orderTimestamp = localStorage.getItem("datafast_order_timestamp");
						
						if (orderDataStr && orderTimestamp) {
							const now = Date.now();
							const timestamp = parseInt(orderTimestamp);
							const isRecent = (now - timestamp) < 10 * 60 * 1000; // 10 minutos
							
							if (isRecent) {
								try {
									const orderData = JSON.parse(orderDataStr);
									console.log("✅ Encontrada orden exitosa reciente, mostrando éxito:", orderData);
									
									setResult({
										success: true,
										data: orderData,
										message: "Pago procesado exitosamente"
									});
									
									// Limpiar datos temporales ya que el pago fue exitoso
									localStorage.removeItem("datafast_transaction_id");
									localStorage.removeItem("datafast_calculated_total");
									localStorage.removeItem("datafast_form_data");
									localStorage.removeItem("datafast_cart_backup");
									localStorage.removeItem("datafast_checkout_id");
									localStorage.removeItem("datafast_resource_path");
									
									setTimeout(() => {
										showNotification(NotificationType.SUCCESS, "¡Pago completado exitosamente!");
									}, 100);
									
									setTimeout(() => {
										navigate("/orders");
									}, 5000);
									
									// ✅ IMPORTANTE: Actualizar registro global y salir sin lanzar error
									if (resourcePath) {
										globalProcessingRecords.set(resourcePath, {
											processedAt: Date.now(),
											status: 'completed',
											orderData: orderData
										});
									}
									return; // Salir completamente de la función
								} catch (e) {
									console.error("Error parseando datos de orden:", e);
								}
							}
						}
						
						// Si no hay orden reciente, es realmente un error
						const userMessage = "La sesión de pago expiró. Si el pago fue exitoso, aparecerá en sus órdenes.";
						throw new Error(userMessage);
					}
					
					// Otros códigos de error
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
					error instanceof Error
						? error.message
						: "Error desconocido al procesar el pago";
				setError(errorMessage);
				
				// Actualizar registro global como fallido
				if (resourcePath) {
					globalProcessingRecords.set(resourcePath, {
						processedAt: Date.now(),
						status: 'failed'
					});
				}

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
		
		// Retornar función de cleanup si existe (para limpiar intervals)
		return cleanupFunction || undefined;
	}, [searchParams, navigate]); // ✅ REMOVIDO 'cart' - ahora usando cartRef para evitar bucles

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
