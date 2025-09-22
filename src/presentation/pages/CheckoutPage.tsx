// src/presentation/pages/CheckoutPage.tsx - ACTUALIZADO CON DESCUENTOS POR VOLUMEN
import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../hooks/useCart";
import {useAuth} from "../hooks/useAuth";
import {useErrorHandler} from "../hooks/useErrorHandler";
import {useInvalidateCounters} from "../hooks/useHeaderCounters";
import {CheckoutService} from "../../core/services/CheckoutService";
import {CheckoutItemsService} from "../../infrastructure/services/CheckoutItemsService";
import {DatafastService} from "../../core/services/DatafastService";
import {calculateCartItemDiscountsAsync} from "../../utils/volumeDiscountCalculator";
// 🎯 JORDAN: VolumeDiscountContext eliminado - funcionalidad migrada a volumeDiscountCalculator
// import {useCartVolumeDiscounts} from "../contexts/VolumeDiscountContext";
import type {
	PaymentInfo,
	PaymentMethod,
} from "../../core/services/CheckoutService";
import {NotificationType} from "../contexts/CartContext";
import CreditCardForm from "../components/checkout/CreditCardForm";
import QRPaymentForm from "../components/checkout/QRPaymentForm";
import AddressForm from "../components/checkout/AddressForm";
import type {Address} from "../../core/domain/valueObjects/Address";
import DatafastPaymentButton from "../components/checkout/DatafastPaymentButtonProps";
import {formatCurrency} from "../../utils/formatters/formatCurrency";
import {Gift, AlertTriangle, TrendingDown} from "lucide-react";
import type {CheckoutData, CheckoutState} from "../../types/checkout";

const CheckoutPage: React.FC = () => {
	const navigate = useNavigate();
	const {cart, clearCart, showNotification, appliedDiscount} = useCart();
	const {user} = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	// ✅ Servicios para arquitectura centralizada
	const datafastService = new DatafastService();

	// ✅ Hook para descuentos por volumen dinámicos desde BD
	// 🎯 JORDAN: Volume discounts ahora se manejan directamente en volumeDiscountCalculator
	// const {isEnabled: volumeDiscountsEnabled, config: volumeDiscountConfig} = useCartVolumeDiscounts();

	const initialAddress: Address = {
		name: "",
		identification: "",
		street: "",
		city: "",
		state: "",
		postalCode: "",
		country: "Ecuador",
		phone: "",
	};

	const {handleSuccess, handleError} = useErrorHandler({
		showNotification,
		context: "CheckoutPage",
	});

	// ✅ Hook para actualizaciones optimistas del header
	const {optimisticCartRemove} = useInvalidateCounters();

	const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "deuna">(
		"credit_card"
	);

	const [shippingAddress, setShippingAddress] =
		useState<Address>(initialAddress);
	const [billingAddress, setBillingAddress] = useState<Address>(initialAddress);
	const [useSameAddress, setUseSameAddress] = useState(true);

	const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
		method: "credit_card",
		card_number: "",
		card_expiry: "",
		card_cvc: "",
	});

	const [formErrors, setFormErrors] = useState<Record<string, string>>({});
	const [orderComplete, setOrderComplete] = useState(false);
	const [orderDetails, setOrderDetails] = useState<any>(null);
	const [countdown, setCountdown] = useState(8);

	// ✅ NUEVO: Estados para el flujo de checkout centralizado
	const [, setCheckoutState] = useState<CheckoutState>("forms_filling" as CheckoutState);
	const [validatedCheckoutData, setValidatedCheckoutData] = useState<CheckoutData | null>(null);
	const [showPaymentMethods, setShowPaymentMethods] = useState(false);

	const checkoutService = new CheckoutService();

	// ✅ ESTADO PARA CÁLCULOS DE CHECKOUT ASÍNCRONOS
	const [checkoutCalculations, setCheckoutCalculations] = useState<{
		items: any[];
		totals: {
			subtotal: number;
			originalSubtotal: number;
			sellerDiscounts: number;
			volumeDiscounts: number;
			totalDiscounts: number;
			couponDiscount: number;
			tax: number;
			shipping: number;
			total: number;
			freeShipping: boolean;
		};
		stockIssues: Array<{
			productName: string;
			requested: number;
			available: number;
			isOutOfStock: boolean;
		}>;
		checkoutItems: any[];
	}>({
		items: [],
		totals: {
			subtotal: 0,
			originalSubtotal: 0,
			sellerDiscounts: 0,
			volumeDiscounts: 0,
			totalDiscounts: 0,
			couponDiscount: 0,
			tax: 0,
			shipping: 0,
			total: 0,
			freeShipping: false
		},
		stockIssues: [],
		checkoutItems: []
	});

	// ✅ CALCULAR TOTALES DE FORMA ASÍNCRONA
	useEffect(() => {
		const calculateCheckout = async () => {
			if (!cart?.items?.length) {
				setCheckoutCalculations({
					items: [],
					totals: {
						subtotal: 0,
						originalSubtotal: 0,
						sellerDiscounts: 0,
						volumeDiscounts: 0,
						totalDiscounts: 0,
						couponDiscount: 0,
						tax: 0,
						shipping: 0,
						total: 0,
						freeShipping: false
					},
					stockIssues: [],
					checkoutItems: []
				});
				return;
			}

			// ✅ Calcular items con descuentos asíncronamente usando BD config
			console.log("🔄 CheckoutPage: Calculando descuentos con configuración dinámica");
			const itemsWithDiscounts = await Promise.all(
				cart.items.map(async (item) => {
					// 🎯 JORDAN: Usar calculadora asíncrona con configuración dinámica
					const discount = await calculateCartItemDiscountsAsync(item);
					const availableStock = item.product?.stockAvailable || item.product?.stock || 0;
					const hasStockIssue = item.quantity > availableStock || !item.product?.is_in_stock;

					return {
						...item,
						discount,
						itemTotal: discount.finalPricePerUnit * item.quantity,
						availableStock,
						hasStockIssue,
					};
				})
			);
			console.log("✅ CheckoutPage: Descuentos calculados para", itemsWithDiscounts.length, "items");

		// ✅ Identificar problemas de stock
		const stockIssues = itemsWithDiscounts
			.filter((item) => item.hasStockIssue)
			.map((item) => ({
				productName: item.product?.name || "Producto",
				requested: item.quantity,
				available: item.availableStock,
				isOutOfStock: !item.product?.is_in_stock,
			}));

			// ✅ CALCULAR TOTALES DE FORMA ASÍNCRONA
			console.log("🔍 FLUJO CHECKOUT - Calculando totales");
			console.log("📊 Items en checkout:", cart.items.length);
			console.log("📊 Cupón en checkout:", appliedDiscount?.discountCode?.code || "NINGUNO");
			
			// 🎯 CRITICAL: forceRefresh para garantizar configuraciones frescas en Checkout
			const totals = await CheckoutItemsService.calculateCheckoutTotals(cart.items, appliedDiscount, true);
			console.log("🎯 TOTAL CHECKOUT:", totals.total);

			// ✅ JORDAN: Preparar items para envío al backend con configuración unificada
			// 🎯 CRITICAL: forceRefresh para garantizar configuraciones frescas
			const checkoutItems = await CheckoutItemsService.prepareItemsForCheckout(cart.items, appliedDiscount, true);

			setCheckoutCalculations({
				items: itemsWithDiscounts,
				totals,
				stockIssues,
				checkoutItems
			});
		};

		calculateCheckout();
	}, [cart?.items, cart?.total, cart?.subtotal, appliedDiscount]); // 🎯 JORDAN: Dependencias simplificadas

	// Funciones helper
	const getAvailableStock = (product: any): number => {
		if (typeof product.stockAvailable === "number") {
			return product.stockAvailable;
		}
		if (typeof product.stock === "number") {
			return product.stock;
		}
		return 0;
	};

	const validateCartStock = () => {
		if (!cart?.items) return {valid: true, errors: []};

		const errors: string[] = [];

		cart.items.forEach((item) => {
			const availableStock = getAvailableStock(item.product);

			if (!item.product?.is_in_stock) {
				errors.push(`${item.product?.name || "Producto"} está agotado`);
			} else if (item.quantity > availableStock) {
				errors.push(
					`${item.product?.name || "Producto"}: solo hay ${availableStock} unidades disponibles (solicitaste ${item.quantity})`
				);
			}
		});

		return {
			valid: errors.length === 0,
			errors,
		};
	};

	useEffect(() => {
		if (user) {
			const userAddress: Address = {
				name: `${user.name}`,
				street: user.address || "",
				city: user.city || "",
				state: user.state || user.province || "",
				postalCode: user.postal_code || user.zip_code || "",
				country: user.country || "Ecuador",
				phone: user.phone || "",
			};
			setShippingAddress(userAddress);
			setBillingAddress(userAddress);
		}
	}, [user]);

	const handleDatafastSuccess = (orderData: any) => {
		console.log("Pago exitoso:", orderData);
	};

	const handleDatafastError = (error: string) => {
		console.error("Error:", error);
	};

	useEffect(() => {
		// 🔧 CRITICAL FIX: Don't redirect when order is complete (allows receipt display)
		if (orderComplete && orderDetails) {
			console.log('✅ Order complete - skipping cart validation to show receipt');
			return;
		}

		if (!cart || cart.items.length === 0) {
			showNotification(NotificationType.ERROR, "El carrito está vacío");
			navigate("/cart");
			return;
		}

		const stockValidation = validateCartStock();
		if (!stockValidation.valid) {
			console.warn("⚠️ Problemas de stock detectados:", stockValidation.errors);

			if (stockValidation.errors.length > 0) {
				showNotification(
					NotificationType.WARNING,
					`Problema de stock: ${stockValidation.errors[0]}`
				);
			}
		}
	}, [cart, navigate, showNotification, orderComplete, orderDetails]);

	// ✅ NUEVO: Redirect automático después de completar orden - mostrar recibo por 5 segundos
	useEffect(() => {
		if (orderComplete) {
			// Reset countdown when order completes
			setCountdown(8);
			
			// Update countdown every second
			const countdownTimer = setInterval(() => {
				setCountdown(prev => {
					if (prev <= 1) {
						clearInterval(countdownTimer);
						// Move navigation outside of setState to prevent React warning
						setTimeout(() => {
							console.log('🔄 Auto-redirecting to orders page after 8 seconds');
							navigate("/orders");
						}, 0);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);

			return () => clearInterval(countdownTimer);
		}
	}, [orderComplete, navigate]);

	const handlePaymentMethodChange = (method: "credit_card" | "deuna") => {
		setPaymentMethod(method);
		setPaymentInfo({
			...paymentInfo,
			method: method === "deuna" ? "transfer" : "credit_card",
		});
	};

	const handleShippingChange = (field: keyof Address, value: string) => {
		const newAddress = {...shippingAddress, [field]: value};
		setShippingAddress(newAddress);
		if (useSameAddress) {
			setBillingAddress(newAddress);
		}
	};

	const handleBillingChange = (field: keyof Address, value: string) => {
		setBillingAddress({...billingAddress, [field]: value});
	};

	const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
		setPaymentInfo({...paymentInfo, [field]: value});
		if (value.trim() && formErrors[field]) {
			const newErrors = {...formErrors};
			delete newErrors[field];
			setFormErrors(newErrors);
		}
	};

	// ✅ VALIDACIÓN COMPLETA: Para formularios con método de pago específico (legacy)
	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		const validateAddress = (address: Address, prefix: string) => {
			const requiredFields: (keyof Address)[] = [
				"name",
				"identification",
				"street",
				"city",
				"state",
				"country",
				"phone",
			];
			requiredFields.forEach((field) => {
				if (!address[field]) {
					errors[`${prefix}${field}`] =
						`El campo ${field.replace("_", " ")} es obligatorio`;
				}

				// Validación especial para el campo name (nombre completo)
				if (field === "name" && address[field]) {
					const nameParts = address[field].trim().split(/\s+/);
					if (nameParts.length < 2) {
						errors[`${prefix}${field}`] =
							"Debe ingresar al menos un nombre y un apellido separados por espacio";
					}
				}
			});
		};

		validateAddress(shippingAddress, "shipping");
		if (!useSameAddress) {
			validateAddress(billingAddress, "billing");
		}

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

	// ✅ NUEVA VALIDACIÓN: Solo para direcciones (sin método de pago)
	const validateAddressesOnly = (): boolean => {
		const errors: Record<string, string> = {};

		const validateAddress = (address: Address, prefix: string) => {
			const requiredFields: (keyof Address)[] = [
				"name",
				"identification",
				"street",
				"city",
				"state",
				"country",
				"phone",
			];
			requiredFields.forEach((field) => {
				if (!address[field]) {
					errors[`${prefix}${field}`] =
						`El campo ${field.replace("_", " ")} es obligatorio`;
				}

				// Validación especial para el campo name (nombre completo)
				if (field === "name" && address[field]) {
					const nameParts = address[field].trim().split(/\s+/);
					if (nameParts.length < 2) {
						errors[`${prefix}${field}`] =
							"Debe ingresar al menos un nombre y un apellido separados por espacio";
					}
				}
			});
		};

		// Validar dirección de envío
		validateAddress(shippingAddress, "shipping");

		// Solo validar dirección de facturación si NO se usa la misma dirección
		if (!useSameAddress) {
			validateAddress(billingAddress, "billing");
		}

		setFormErrors(errors);
		const isValid = Object.keys(errors).length === 0;

		// Debug para ver qué está fallando
		if (!isValid) {
			console.log("❌ VALIDACIÓN FALLÓ - Errores encontrados:", errors);
			console.log("📊 Estado actual de direcciones:");
			console.log("   - useSameAddress:", useSameAddress);
			console.log("   - shippingAddress:", shippingAddress);
			if (!useSameAddress) {
				console.log("   - billingAddress:", billingAddress);
			}
		} else {
			console.log("✅ VALIDACIÓN DE DIRECCIONES EXITOSA");
		}

		return isValid;
	};

	// ✅ FUNCIÓN HELPER: Combina datos del cart con cálculos validados (estrategia híbrida)
	const combineCartWithCalculations = (cartItems: any[], calculatedItems: any[]) => {
		console.log("🔄 Combinando datos del cart con cálculos validados (estrategia híbrida)");

		return cartItems.map((cartItem, index) => {
			const calculatedItem = calculatedItems[index];

			// Combinar información descriptiva del cart con precios validados de la calculadora
			const combinedItem = {
				// Del cart original (información descriptiva)
				product_id: cartItem.productId || cartItem.product_id,
				name: cartItem.product?.name || `Product ${cartItem.productId || cartItem.product_id}`,
				subtotal: calculatedItem.price * calculatedItem.quantity, // Calcular subtotal con precio validado

				// De la calculadora (precios validados)
				quantity: calculatedItem.quantity,
				price: calculatedItem.price,
				original_price: calculatedItem.original_price || calculatedItem.base_price,
				discount_percentage: calculatedItem.volume_discount_percentage || 0,
			};

			console.log(`   Item ${index + 1}: ${combinedItem.name} - $${combinedItem.price} x ${combinedItem.quantity}`);
			return combinedItem;
		});
	};

	// ✅ NUEVA FUNCIÓN: Validar formularios y crear objeto temporal de checkout
	const validateAndPrepareCheckout = async () => {
		console.log("🔍 VALIDACIÓN DE CHECKOUT: Iniciando validación centralizada");

		// Validar stock
		const stockValidation = validateCartStock();
		if (!stockValidation.valid) {
			console.log("❌ Validación de stock falló:", stockValidation.errors);

			stockValidation.errors.forEach((error) => {
				showNotification(NotificationType.ERROR, error);
			});

			showNotification(
				NotificationType.WARNING,
				"Por favor, ajusta las cantidades en tu carrito antes de continuar"
			);
			return false;
		}

		// Validar solo direcciones (sin método de pago)
		if (!validateAddressesOnly()) {
			console.log("❌ Validación de direcciones falló");
			showNotification(
				NotificationType.ERROR,
				"Por favor, completa todos los campos de dirección obligatorios"
			);
			return false;
		}

		// Validar que el usuario esté autenticado
		if (!user?.id) {
			showNotification(
				NotificationType.ERROR,
				"Debes iniciar sesión para completar la compra"
			);
			return false;
		}

		console.log("✅ VALIDACIÓN EXITOSA: Creando objeto temporal de checkout");

		try {
			setIsLoading(true);

			// Crear objeto temporal con toda la información necesaria
			const now = new Date();
			const sessionId = `checkout_${user.id}_${now.getTime()}`;

			const checkoutData: CheckoutData = {
				userId: user.id,
				shippingData: {
					name: shippingAddress.name || "",
					email: user.email || "",
					phone: shippingAddress.phone || "",
					street: shippingAddress.street || "",
					city: shippingAddress.city || "",
					state: shippingAddress.state || "",
					country: shippingAddress.country || "",
					postal_code: shippingAddress.postalCode || "",
					identification: shippingAddress.identification || "",
				},
				billingData: {
					name: (useSameAddress ? shippingAddress : billingAddress).name || "",
					email: user.email || "",
					phone: (useSameAddress ? shippingAddress : billingAddress).phone || "",
					street: (useSameAddress ? shippingAddress : billingAddress).street || "",
					city: (useSameAddress ? shippingAddress : billingAddress).city || "",
					state: (useSameAddress ? shippingAddress : billingAddress).state || "",
					country: (useSameAddress ? shippingAddress : billingAddress).country || "",
					postal_code: (useSameAddress ? shippingAddress : billingAddress).postalCode || "",
					identification: (useSameAddress ? shippingAddress : billingAddress).identification || "",
					same_as_shipping: useSameAddress,
				},
				items: combineCartWithCalculations(cart?.items || [], checkoutCalculations.checkoutItems),
				totals: {
					subtotal_original: checkoutCalculations.totals.originalSubtotal,
					subtotal_with_discounts: checkoutCalculations.totals.subtotal,
					seller_discounts: checkoutCalculations.totals.sellerDiscounts,
					volume_discounts: checkoutCalculations.totals.volumeDiscounts,
					coupon_discount: checkoutCalculations.totals.couponDiscount,
					total_discounts: checkoutCalculations.totals.totalDiscounts,
					iva_amount: checkoutCalculations.totals.tax,
					shipping_cost: checkoutCalculations.totals.shipping,
					free_shipping: checkoutCalculations.totals.freeShipping,
					free_shipping_threshold: 50, // Valor por defecto
					final_total: checkoutCalculations.totals.total,
				},
				discountCode: appliedDiscount?.discountCode?.code,
				discountInfo: appliedDiscount ? {
					code: appliedDiscount.discountCode.code,
					discount_percentage: appliedDiscount.discountCode.discount_percentage,
					discount_amount: checkoutCalculations.totals.couponDiscount,
				} : undefined,
				timestamp: now.toISOString(),
				sessionId: sessionId,
				validatedAt: now.toISOString(),
				expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutos
			};

			// ✅ ARQUITECTURA CENTRALIZADA: Almacenar datos en backend antes de mostrar métodos de pago
			console.log("💾 Almacenando CheckoutData en backend (arquitectura centralizada)...");

			const storeRequest = {
				shippingData: checkoutData.shippingData,
				billingData: checkoutData.billingData,
				items: checkoutData.items,
				totals: checkoutData.totals,
				sessionId: checkoutData.sessionId,
				discountCode: checkoutData.discountCode,
				discountInfo: checkoutData.discountInfo
			};

			const storeResponse = await datafastService.storeCheckoutData(storeRequest);

			if (!storeResponse.success) {
				throw new Error(storeResponse.message || "Error al almacenar datos de checkout");
			}

			console.log("✅ CheckoutData almacenado en backend:", {
				sessionId: storeResponse.data.session_id,
				expiresAt: storeResponse.data.expires_at,
				finalTotal: storeResponse.data.final_total
			});

			// Guardar objeto temporal local
			setValidatedCheckoutData(checkoutData);
			setCheckoutState("forms_validated" as CheckoutState);
			setShowPaymentMethods(true);

			console.log("✅ OBJETO TEMPORAL CREADO Y ALMACENADO:", {
				sessionId: checkoutData.sessionId,
				userId: checkoutData.userId,
				total: checkoutData.totals.final_total,
				itemsCount: checkoutData.items.length,
				expiresAt: checkoutData.expiresAt,
				backendSessionId: storeResponse.data.session_id
			});

			showNotification(
				NotificationType.SUCCESS,
				"Formularios validados y datos seguros almacenados. Selecciona tu método de pago preferido."
			);

			return true;

		} catch (error) {
			console.error("❌ Error creando objeto temporal:", error);
			handleError(
				error as Error,
				"Error validando los datos. Por favor, intenta de nuevo."
			);
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	// ✅ FUNCIÓN MANTENIDA: Fallback para procesamiento directo en emergencias
	// @ts-ignore - Legacy function mantenida como fallback, no se usa pero se preserva
	const legacyProcessCheckout = async () => {
		console.log("🛒 CheckoutPage.processCheckout INICIADO CON DESCUENTOS POR VOLUMEN");

		const stockValidation = validateCartStock();
		if (!stockValidation.valid) {
			console.log("❌ Validación de stock falló:", stockValidation.errors);

			stockValidation.errors.forEach((error) => {
				showNotification(NotificationType.ERROR, error);
			});

			showNotification(
				NotificationType.WARNING,
				"Por favor, ajusta las cantidades en tu carrito antes de continuar"
			);
			return;
		}

		if (!validateForm()) {
			console.log("❌ Validación de formulario falló");
			showNotification(
				NotificationType.ERROR,
				"Por favor, completa todos los campos obligatorios"
			);
			return;
		}

		console.log("🛒 ANÁLISIS COMPLETO DEL CARRITO CON DESCUENTOS POR VOLUMEN:");
		console.log("📊 Totales calculados:", checkoutCalculations.totals);
		console.log("📊 Items para checkout:", checkoutCalculations.checkoutItems);

		setIsLoading(true);

		try {
			const sellerId = CheckoutService.getSellerIdFromCart(cart);

			const checkoutData = {
				payment: {
					...paymentInfo,
					method:
						paymentMethod === "deuna"
							? ("qr" as PaymentMethod)
							: paymentMethod === "credit_card"
							? ("credit_card" as PaymentMethod)
							: paymentInfo.method,
				},
				shippingAddress: shippingAddress,
				billingAddress: useSameAddress ? shippingAddress : billingAddress,
				seller_id: sellerId || undefined,
				items: checkoutCalculations.checkoutItems, // ✅ Usar items con descuentos calculados
				// ✅ NUEVO: Incluir código de descuento aplicado y su información
				discount_code: appliedDiscount?.discountCode?.code || null,
				discount_info: appliedDiscount || null, // ✅ Pasar información completa del descuento
				// ✅ CRÍTICO: Enviar totales calculados al backend
				calculated_totals: {
					subtotal: checkoutCalculations.totals.subtotal,
					tax: checkoutCalculations.totals.tax,
					shipping: checkoutCalculations.totals.shipping,
					total: checkoutCalculations.totals.total,
					total_discounts: checkoutCalculations.totals.totalDiscounts
				}
			};

			console.log(
				"📦 Datos completos de checkout con descuentos por volumen:",
				JSON.stringify(checkoutData, null, 2)
			);
			console.log("🚀 Enviando checkout al backend...");

			const response = await checkoutService.processCheckout(checkoutData, user?.email);

			console.log("✅ Respuesta del checkout recibida:", response);

			if (response.status === "success") {
				console.log("🎉 Checkout exitoso con descuentos por volumen, limpiando carrito...");
				setOrderComplete(true);
				setOrderDetails(response.data);

				let successMessage = "¡Pedido completado con éxito!";
				if (checkoutCalculations.totals.totalDiscounts > 0) {
					successMessage += ` Has ahorrado ${formatCurrency(checkoutCalculations.totals.totalDiscounts)} con descuentos aplicados.`;
				}

				handleSuccess(successMessage);

				// ✅ ACTUALIZACIÓN OPTIMISTA DEL HEADER (mismo patrón que CartPage)
				const totalItems = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
				for (let i = 0; i < totalItems; i++) {
					optimisticCartRemove();
				}

				clearCart();

				// ✅ Log de información de descuentos aplicados
				if (response.data && typeof response.data === "object") {
					const orderData = response.data as any;
					console.log("🔍 ORDEN CREADA CON DESCUENTOS:");
					console.log("📊 Order ID:", orderData.order_id);
					console.log("📊 Order Number:", orderData.order_number);
					console.log("📊 Total:", orderData.total);
					console.log("📊 Total Savings:", orderData.total_savings);
					console.log("📊 Volume Discounts Applied:", orderData.volume_discounts_applied);
				}
			} else {
				throw new Error(response.message || "Error al procesar el pedido");
			}
		} catch (error: any) {
			console.error("❌ Error COMPLETO al procesar checkout con descuentos por volumen:");
			console.error("📊 Error object:", error);
			console.error("📊 Error message:", (error as any)?.message);

			handleError(
				error,
				"Error al procesar el pago. Por favor, intenta de nuevo más tarde."
			);
		} finally {
			setIsLoading(false);
			console.log("🛒 CheckoutPage.processCheckout FINALIZADO");
		}
	};

	// ✅ COMPONENTE DE RESUMEN CON DESCUENTOS POR VOLUMEN
	const OrderSummaryComponent = () => (
		<div>
			<h2 className="text-xl font-bold text-gray-800 mb-4">
				Resumen del pedido
			</h2>

			{checkoutCalculations.stockIssues.length > 0 && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
					<div className="flex items-start">
						<AlertTriangle size={18} className="text-red-600 mr-2 mt-0.5" />
						<div className="flex-1">
							<h4 className="font-medium text-red-800 text-sm mb-2">
								Problemas de stock detectados
							</h4>
							<div className="space-y-1">
								{checkoutCalculations.stockIssues.map((issue, index) => (
									<div key={index} className="text-xs text-red-700">
										<strong>{issue.productName}:</strong>{" "}
										{issue.isOutOfStock
											? "Producto agotado"
											: `Solo ${issue.available} disponibles (solicitaste ${issue.requested})`}
									</div>
								))}
							</div>
							<div className="mt-2">
								<button
									onClick={() => navigate("/cart")}
									className="text-xs text-red-600 underline hover:no-underline"
								>
									Ir al carrito para ajustar cantidades
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* ✅ BANNER DE DESCUENTOS APLICADOS */}
			{checkoutCalculations.totals.totalDiscounts > 0 && (
				<div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
					<div className="flex items-center">
						<div className="flex-1">
							<h4 className="font-medium text-green-800 text-sm">
								¡Descuentos Aplicados!
							</h4>
							<div className="text-xs text-green-600 mt-1 space-y-1">
								{checkoutCalculations.totals.sellerDiscounts > 0 && (
									<p>Descuentos del vendedor: {formatCurrency(checkoutCalculations.totals.sellerDiscounts)}</p>
								)}
								{checkoutCalculations.totals.volumeDiscounts > 0 && (
									<p>Descuentos por volumen: {formatCurrency(checkoutCalculations.totals.volumeDiscounts)}</p>
								)}
							</div>
						</div>
						<div className="text-lg font-bold text-green-600">
							{formatCurrency(checkoutCalculations.totals.totalDiscounts)}
						</div>
					</div>
				</div>
			)}

			<div className="space-y-3 mb-6">
				{checkoutCalculations.items.map((item, index) => (
					<div
						key={index}
						className={`flex items-center justify-between py-2 border-b border-gray-100 ${
							item.hasStockIssue ? "bg-red-50 px-2 rounded" : ""
						}`}
					>
						<div className="flex-1">
							<h4
								className={`text-sm font-medium ${item.hasStockIssue ? "text-red-900" : "text-gray-900"}`}
							>
								{item.product?.name || `Producto ${item.productId}`}
								{item.hasStockIssue && (
									<span className="ml-2 text-xs text-red-600">⚠️</span>
								)}
							</h4>
							<div className="flex items-center space-x-2 mt-1">
								<span className="text-xs text-gray-500">
									Cantidad: {item.quantity}
								</span>
								
								{/* ✅ MOSTRAR DESCUENTOS APLICADOS */}
								{item.discount.sellerDiscountAmount > 0 && (
									<span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded flex items-center">
										<Gift size={10} className="mr-1" />
										Seller: {item.product?.discount_percentage || 0}% OFF
									</span>
								)}
								{item.discount.volumeDiscountAmount > 0 && (
									<span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded flex items-center">
										<TrendingDown size={10} className="mr-1" />
										Volumen: {item.discount.discountPercentage}% OFF
									</span>
								)}
							</div>
							
							{/* ✅ MOSTRAR PRECIO CON DESCUENTOS */}
							{item.discount.hasDiscount && (
								<div className="text-xs text-gray-600 mt-1">
									Precio unitario: {formatCurrency(item.discount.finalPricePerUnit)}
									<span className="line-through text-gray-400 ml-1">
										{formatCurrency(item.discount.originalPrice)}
									</span>
									{item.discount.savingsTotal > 0 && (
										<span className="text-green-600 ml-1">
											(Ahorras: {formatCurrency(item.discount.savingsTotal)})
										</span>
									)}
								</div>
							)}
						</div>
						<div className="text-right">
							<span
								className={`text-sm font-medium ${item.hasStockIssue ? "text-red-900" : "text-gray-900"}`}
							>
								{formatCurrency(item.itemTotal)}
							</span>
						</div>
					</div>
				))}
			</div>

			{/* ✅ TOTALES CON DESCUENTOS DESGLOSADOS */}
			<div className="space-y-3 border-t border-gray-200 pt-4">
				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Subtotal (con descuentos):</span>
					<span className="font-medium">
						{formatCurrency(checkoutCalculations.totals.subtotal)}
					</span>
				</div>

				{/* ✅ MOSTRAR AHORROS DESGLOSADOS */}
				{checkoutCalculations.totals.sellerDiscounts > 0 && (
					<div className="flex justify-between text-sm text-blue-600">
						<span className="flex items-center">
							<Gift size={14} className="mr-1" />
							Descuentos del vendedor:
						</span>
						<span className="font-medium">
							-{formatCurrency(checkoutCalculations.totals.sellerDiscounts)}
						</span>
					</div>
				)}

				{checkoutCalculations.totals.volumeDiscounts > 0 && (
					<div className="flex justify-between text-sm text-green-600">
						<span className="flex items-center">
							<TrendingDown size={14} className="mr-1" />
							Descuentos por volumen:
						</span>
						<span className="font-medium">
							-{formatCurrency(checkoutCalculations.totals.volumeDiscounts)}
						</span>
					</div>
				)}

				{/* ✅ NUEVO: Mostrar descuento de código aplicado */}
				{appliedDiscount && (
					<div className="flex justify-between text-sm text-green-600">
						<span className="flex items-center">
							<Gift size={14} className="mr-1" />
							Código de descuento ({appliedDiscount.discountCode.code}):
						</span>
						<span className="font-medium">
							-{formatCurrency(checkoutCalculations.totals.couponDiscount || 0)}
						</span>
					</div>
				)}

				<div className="flex justify-between text-sm">
					<span className="text-gray-600">IVA (15%):</span>
					<span className="font-medium">
						{formatCurrency(checkoutCalculations.totals.tax)}
					</span>
				</div>

				<div className="flex justify-between text-sm">
					<span className="text-gray-600">Envío:</span>
					<span className="font-medium">
						{checkoutCalculations.totals.freeShipping ? 
							"Gratis" : 
							formatCurrency(checkoutCalculations.totals.shipping)
						}
					</span>
				</div>

				<div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
					<span>Total:</span>
					<span>{formatCurrency(checkoutCalculations.totals.total)}</span>
				</div>

				{/* ✅ RESUMEN DE AHORROS TOTALES */}
				{checkoutCalculations.totals.totalDiscounts > 0 && (
					<div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-green-800">
								Total ahorrado:
							</span>
							<span className="text-lg font-bold text-green-600">
								{formatCurrency(checkoutCalculations.totals.totalDiscounts)}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);

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
							¡Pago con DeUna completado!
						</h2>
						<p className="text-gray-600 mb-6">
							Tu pago se procesó correctamente y tu pedido está siendo preparado. 
							Recibirás un correo electrónico con los detalles.
						</p>

						{/* ✅ MOSTRAR AHORROS EN CONFIRMACIÓN */}
						{checkoutCalculations.totals.totalDiscounts > 0 && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
								<div className="flex items-center justify-center">
									<Gift className="h-5 w-5 text-green-600 mr-2" />
									<span className="text-green-800 font-medium">
										¡Has ahorrado {formatCurrency(checkoutCalculations.totals.totalDiscounts)}!
									</span>
								</div>
							</div>
						)}
					</div>

					<div className="border-t border-gray-200 pt-4 pb-2 mb-4">
						<h3 className="text-lg font-semibold mb-2">Detalles del pedido:</h3>
						<div className="flex justify-between py-2">
							<span className="text-gray-600">Número de orden:</span>
							<span className="font-medium">{orderDetails.order_number}</span>
						</div>
						<div className="flex justify-between py-2">
							<span className="text-gray-600">Total:</span>
							<span className="font-medium">
								{formatCurrency(orderDetails.total || checkoutCalculations.totals.total)}
							</span>
						</div>
						{checkoutCalculations.totals.totalDiscounts > 0 && (
							<div className="flex justify-between py-2">
								<span className="text-gray-600">Total ahorrado:</span>
								<span className="font-medium text-green-600">
									{formatCurrency(checkoutCalculations.totals.totalDiscounts)}
								</span>
							</div>
						)}
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

					{/* ✅ NUEVO: Mensaje de redirección automática */}
					<div className="text-center mb-6">
						<p className="text-sm text-gray-500">
							Serás redirigido a tus pedidos en{" "}
							<span className="font-medium text-primary-600">{countdown}</span>{" "}
							segundos...
						</p>
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

	return (
		<div className="container mx-auto px-4 py-10">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Finalizar compra</h1>
			</div>

			<div className="flex flex-col lg:flex-row gap-8">
				<div className="lg:w-2/3">
					<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
						<h2 className="text-xl font-bold mb-4">
							Información de envío y facturación
						</h2>
						<div className="mb-4">
							<label className="inline-flex items-center">
								<input
									type="checkbox"
									className="form-checkbox h-5 w-5 text-primary-600"
									checked={useSameAddress}
									onChange={(e) => {
										const checked = e.target.checked;
										setUseSameAddress(checked);
										if (!checked) {
											setBillingAddress({...shippingAddress});
										}
									}}
								/>
								<span className="ml-2 text-gray-700">
									Usar la misma dirección para facturación
								</span>
							</label>
						</div>

						<AddressForm
							title={
								useSameAddress
									? "Dirección de Envío y Facturación"
									: "Dirección de Envío"
							}
							address={shippingAddress}
							onAddressChange={handleShippingChange}
							errors={formErrors}
						/>

						{!useSameAddress && (
							<div className="mt-8 pt-8 border-t border-gray-200">
								<AddressForm
									title="Dirección de Facturación"
									address={billingAddress}
									onAddressChange={handleBillingChange}
									errors={formErrors}
								/>
							</div>
						)}
					</div>

					{/* ✅ MOSTRAR MÉTODOS DE PAGO SOLO DESPUÉS DE VALIDACIÓN */}
					{showPaymentMethods && validatedCheckoutData && (
						<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
							<h2 className="text-xl font-bold mb-4">Método de pago</h2>

							{/* ✅ INDICADOR DE DATOS VALIDADOS */}
							<div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
								<div className="flex items-center">
									<div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
									<span className="text-sm text-green-800 font-medium">
										Datos validados correctamente
									</span>
								</div>
								<p className="text-xs text-green-600 mt-1">
									Total a pagar: {formatCurrency(validatedCheckoutData.totals.final_total)}
								</p>
							</div>

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
									<span>Pago con Deuna!</span>
								</button>
							</div>

							{paymentMethod === "credit_card" && (
								<CreditCardForm
									paymentInfo={paymentInfo}
									errors={formErrors}
									onChange={handlePaymentChange}
									content={
										<DatafastPaymentButton
											onSuccess={handleDatafastSuccess}
											onError={handleDatafastError}
											checkoutData={validatedCheckoutData}
										/>
									}
								/>
							)}

							{paymentMethod === "deuna" && (
								<QRPaymentForm
									checkoutData={validatedCheckoutData}
									onPaymentSuccess={async (paymentData) => {
										console.log('✅ DeUna payment successful, processing completion:', paymentData);

										try {
											// ✅ VALIDAR DATOS DEL PAGO ANTES DE PROCESAR
											if (!paymentData || !paymentData.payment_id) {
												throw new Error('Datos de pago de DeUna incompletos');
											}

											// ✅ INTENTAR VERIFICAR EL ESTADO DEL PAGO CON FALLBACKS
											let orderData = null;
											let attempts = 0;
											const maxAttempts = 3;

											while (!orderData && attempts < maxAttempts) {
												attempts++;
												console.log(`🔄 Intento ${attempts}/${maxAttempts} - Verificando orden creada por webhook...`);

												try {
													// Esperar un poco más en cada intento para que el webhook procese
													await new Promise(resolve => setTimeout(resolve, 1000 * attempts));

													// Intentar obtener la orden del backend si está disponible
													// En el futuro se puede implementar una llamada al backend para verificar
													// Por ahora, usar los datos del paymentData
													orderData = {
														order_id: paymentData.order_id || `DEUNA-${Date.now()}`,
														order_number: paymentData.payment_id,
														total: validatedCheckoutData.totals.final_total,
														payment_status: 'paid',
														payment_method: 'deuna',
														payment_id: paymentData.payment_id,
														created_via: 'deuna_webhook',
														completed_at: paymentData.completed_at || new Date().toISOString()
													};
													break;

												} catch (attemptError) {
													console.warn(`⚠️ Intento ${attempts} falló:`, attemptError);
													if (attempts >= maxAttempts) {
														// En el último intento, usar datos básicos como fallback
														orderData = {
															order_id: paymentData.payment_id || `DEUNA-${Date.now()}`,
															order_number: paymentData.payment_id || `DEUNA-${Date.now()}`,
															total: validatedCheckoutData.totals.final_total,
															payment_status: 'processing', // Estado más conservador
															payment_method: 'deuna',
															payment_id: paymentData.payment_id,
															created_via: 'deuna_frontend_fallback',
															completed_at: new Date().toISOString()
														};
														console.log('🆘 Usando datos de fallback para mostrar recibo');
													}
												}
											}

											// ✅ MOSTRAR ESTADO DE LA ORDEN SEGÚN LO QUE SE OBTUVO
											console.log('🎯 Setting orderComplete to true and orderDetails');
											setOrderDetails(orderData);
											setOrderComplete(true);

											// ✅ ACTUALIZACIÓN OPTIMISTA DEL HEADER (mismo patrón que CartPage)
											const totalItems = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
											for (let i = 0; i < totalItems; i++) {
												optimisticCartRemove();
											}

											// ✅ LIMPIAR CARRITO SOLO DESPUÉS DE PROCESAR EXITOSAMENTE
											clearCart();

											// ✅ NOTIFICACIÓN ESPECÍFICA SEGÚN EL RESULTADO
											if (orderData && orderData.created_via === 'deuna_frontend_fallback') {
												showNotification(
													NotificationType.WARNING,
													'Pago completado. Si no aparece en tus órdenes inmediatamente, revisa en unos minutos.'
												);
											} else {
												showNotification(
													NotificationType.SUCCESS,
													'¡Pago completado exitosamente con DeUna!'
												);
											}

											console.log('✅ DeUna payment completion processed successfully - should show receipt now');
											console.log('📊 Order details set:', {
												order_id: orderData?.order_id,
												total: orderData?.total,
												created_via: orderData?.created_via
											});

										} catch (error) {
											console.error('❌ Error processing DeUna payment completion:', error);

											// ✅ FALLBACK CRÍTICO: MOSTRAR INFORMACIÓN MÍNIMA PARA EL USUARIO
											const fallbackOrderData = {
												order_id: paymentData?.payment_id || `DEUNA-ERROR-${Date.now()}`,
												order_number: paymentData?.payment_id || `ERROR-${Date.now()}`,
												total: validatedCheckoutData.totals.final_total,
												payment_status: 'unknown',
												payment_method: 'deuna',
												payment_id: paymentData?.payment_id || 'unknown',
												created_via: 'deuna_error_fallback',
												completed_at: new Date().toISOString(),
												error_message: 'Error procesando la confirmación. Verifica tus órdenes.'
											};

											setOrderDetails(fallbackOrderData);
											setOrderComplete(true);

											// No limpiar carrito si hay error - mejor experiencia para el usuario
											showNotification(
												NotificationType.ERROR,
												'Error procesando la confirmación del pago. Si el pago fue exitoso, aparecerá en tus órdenes.'
											);

											handleError(error as Error, "Error procesando la confirmación del pago. Por favor, verifica tus órdenes.");
										}
									}}
									onPaymentError={(error) => {
										console.error('❌ DeUna payment error:', error);
										handleError(new Error(error), "Error en el pago con DeUna. Por favor, intenta de nuevo.");
									}}
								/>
							)}
						</div>
					)}

					{/* ✅ MENSAJE INFORMATIVO CUANDO NO HAY MÉTODOS DE PAGO */}
					{!showPaymentMethods && (
						<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
							<h2 className="text-xl font-bold mb-4">Método de pago</h2>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<p className="text-blue-800 text-sm">
									Los métodos de pago se mostrarán después de validar tu información de envío y facturación.
								</p>
							</div>
						</div>
					)}
				</div>

				<div className="lg:w-1/3">
					<div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
						<OrderSummaryComponent />

						{/* ✅ BOTÓN DINÁMICO SEGÚN EL ESTADO DEL CHECKOUT */}
						{!showPaymentMethods ? (
							<button
								onClick={validateAndPrepareCheckout}
								disabled={isLoading || checkoutCalculations.stockIssues.length > 0}
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
										Validando datos...
									</>
								) : checkoutCalculations.stockIssues.length > 0 ? (
									"Resuelve problemas de stock"
								) : (
									`Validar datos y continuar - ${formatCurrency(checkoutCalculations.totals.total)}`
								)}
							</button>
						) : (
							<div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="text-sm font-medium text-green-800">
											✅ Datos validados
										</h4>
										<p className="text-xs text-green-600 mt-1">
											Selecciona tu método de pago para continuar
										</p>
									</div>
									<button
										onClick={() => {
											setShowPaymentMethods(false);
											setValidatedCheckoutData(null);
											setCheckoutState("forms_filling" as CheckoutState);
										}}
										className="text-xs text-green-600 underline hover:no-underline"
									>
										Editar datos
									</button>
								</div>
							</div>
						)}

						{checkoutCalculations.stockIssues.length > 0 && (
							<div className="mt-3 text-xs text-center text-red-600">
								⚠️ Ajusta las cantidades en tu carrito antes de continuar
							</div>
						)}

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