// src/presentation/pages/CheckoutPage.tsx - ACTUALIZADO CON DESCUENTOS POR VOLUMEN
import {useState, useEffect, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {useCart} from "../hooks/useCart";
import {useAuth} from "../hooks/useAuth";
import {useErrorHandler} from "../hooks/useErrorHandler";
import {CheckoutService} from "../../core/services/CheckoutService";
import {CheckoutItemsService} from "../../infrastructure/services/CheckoutItemsService";
import {calculateCartItemDiscounts} from "../../utils/volumeDiscountCalculator";
import type {
	PaymentInfo,
	PaymentMethod,
} from "../../core/services/CheckoutService";
import {NotificationType} from "../contexts/CartContext";
import CreditCardForm from "../components/checkout/CreditCardForm";
import QRPaymentForm from "../components/checkout/QRPaymentForm";
import AddressForm from "../components/checkout/AddressForm";
import type {Address} from "../../core/domain/valueObjects/Address";
import TestCheckoutButton from "../components/checkout/TestCheckoutButton";
import DatafastPaymentButton from "../components/checkout/DatafastPaymentButtonProps";
import {formatCurrency} from "../../utils/formatters/formatCurrency";
import {Gift, AlertTriangle, TrendingDown} from "lucide-react";

const CheckoutPage: React.FC = () => {
	const navigate = useNavigate();
	const {cart, clearCart, showNotification, appliedDiscount} = useCart();
	const {user} = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const initialAddress: Address = {
		name: "",
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

	const checkoutService = new CheckoutService();

	// ✅ USAR TOTALES DEL BACKEND DIRECTAMENTE
	const checkoutCalculations = useMemo(() => {
		if (!cart?.items?.length) {
			return {
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
			};
		}

		// ✅ Calcular items con descuentos
		const itemsWithDiscounts = cart.items.map((item) => {
			const discount = calculateCartItemDiscounts(item);
			const availableStock = item.product?.stockAvailable || item.product?.stock || 0;
			const hasStockIssue = item.quantity > availableStock || !item.product?.is_in_stock;

			return {
				...item,
				discount,
				itemTotal: discount.finalPricePerUnit * item.quantity,
				availableStock,
				hasStockIssue,
			};
		});

		// ✅ Identificar problemas de stock
		const stockIssues = itemsWithDiscounts
			.filter((item) => item.hasStockIssue)
			.map((item) => ({
				productName: item.product?.name || "Producto",
				requested: item.quantity,
				available: item.availableStock,
				isOutOfStock: !item.product?.is_in_stock,
			}));

		// ✅ USAR TOTALES DEL BACKEND DIRECTAMENTE (CART YA TIENE LOS CÁLCULOS CORRECTOS)

		let totals;
		
		// ✅ SIEMPRE USAR SECUENCIA EXACTA - MISMO CÁLCULO QUE CART
		console.log("🔍 FLUJO CHECKOUT - Calculando totales");
		console.log("📊 Items en checkout:", cart.items.length);
		console.log("📊 Cupón en checkout:", appliedDiscount?.discountCode?.code || "NINGUNO");
		totals = CheckoutItemsService.calculateCheckoutTotals(cart.items, appliedDiscount);
		console.log("🎯 TOTAL CHECKOUT:", totals.total);

		// ✅ Preparar items para envío al backend CON CUPÓN
		const checkoutItems = CheckoutItemsService.prepareItemsForCheckout(cart.items, appliedDiscount);

		return {
			items: itemsWithDiscounts,
			totals,
			stockIssues,
			checkoutItems
		};
	}, [cart?.items, cart?.total, cart?.subtotal, appliedDiscount]);

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
	}, [cart, navigate, showNotification]);

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

	const validateForm = (): boolean => {
		const errors: Record<string, string> = {};

		const validateAddress = (address: Address, prefix: string) => {
			const requiredFields: (keyof Address)[] = [
				"name",
				"street",
				"city",
				"state",
				"postalCode",
				"country",
				"phone",
			];
			requiredFields.forEach((field) => {
				if (!address[field]) {
					errors[`${prefix}${field}`] =
						`El campo ${field.replace("_", " ")} es obligatorio`;
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

	const processCheckout = async () => {
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
							? ("transfer" as PaymentMethod)
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
				discount_info: appliedDiscount || null // ✅ Pasar información completa del descuento
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
							¡Pedido realizado con éxito!
						</h2>
						<p className="text-gray-600 mb-6">
							Tu pedido ha sido procesado correctamente. Hemos enviado un correo
							electrónico con los detalles.
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
								{formatCurrency(checkoutCalculations.totals.total)}
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
				<TestCheckoutButton />
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
									onChange={(e) => setUseSameAddress(e.target.checked)}
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

					<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
						<h2 className="text-xl font-bold mb-4">Método de pago</h2>

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
									/>
								}
							/>
						)}

						{paymentMethod === "deuna" && (
					<QRPaymentForm 
						total={checkoutCalculations.totals.total}
						onPaymentSuccess={async (paymentData) => {
							console.log('DeUna payment successful:', paymentData);
							
							try {
								setIsLoading(true);
								
								// Crear la orden completa llamando al mismo flujo que el checkout normal
								const checkoutData: CheckoutRequest = {
									payment: {
										method: "de_una",
										card_number: "",
										card_expiry: "",
										card_cvc: "",
									},
									shippingAddress: formData.shippingAddress,
									billingAddress: useSameAddress ? formData.shippingAddress : formData.billingAddress,
									seller_id: CheckoutService.getSellerIdFromCart(cart),
									items: CheckoutService.prepareCartItemsForCheckout(
										cart?.items || [],
										appliedDiscount
									),
									discount_code: appliedDiscount?.discountCode?.code || null,
									discount_info: appliedDiscount,
								};

								console.log('Creating order after DeUna payment:', checkoutData);
								
								const response = await checkoutService.processCheckout(checkoutData, user?.email);

								if (response.status === "success") {
									console.log('Order created successfully after DeUna payment:', response);
									setOrderComplete(true);
									setOrderDetails(response.data);

									let successMessage = "¡Pago con DeUna completado y orden creada con éxito!";
									if (checkoutCalculations.totals.totalDiscounts > 0) {
										successMessage += ` Has ahorrado ${formatCurrency(checkoutCalculations.totals.totalDiscounts)} con descuentos aplicados.`;
									}

									handleSuccess(successMessage);
									clearCart();
								} else {
									throw new Error(response.message || 'Error creando la orden');
								}
								
							} catch (error: any) {
								console.error('Error creating order after DeUna payment:', error);
								handleError(error, "El pago fue exitoso pero hubo un error creando la orden. Contacta soporte.");
							} finally {
								setIsLoading(false);
							}
						}}
						onPaymentError={(error) => {
							console.error('DeUna payment error:', error);
							handleError(new Error(error), "Error en el pago con DeUna. Por favor, intenta de nuevo.");
						}}
					/>
				)}
					</div>
				</div>

				<div className="lg:w-1/3">
					<div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
						<OrderSummaryComponent />

						<button
							onClick={processCheckout}
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
									Procesando...
								</>
							) : checkoutCalculations.stockIssues.length > 0 ? (
								"Resuelve problemas de stock"
							) : (
								`Finalizar compra - ${formatCurrency(checkoutCalculations.totals.total)}`
							)}
						</button>

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