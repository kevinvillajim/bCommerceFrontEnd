import React, {useState, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
	ShoppingCart,
	Trash2,
	Plus,
	Minus,
	ArrowLeft,
	Heart,
} from "lucide-react";
import {useCart} from "../hooks/useCart";
import {useFavorites} from "../hooks/useFavorites";
import {formatCurrency} from "../../utils/formatters/formatCurrency";
import { NotificationType } from "../contexts/CartContext";

// IMPORTAR EL HELPER DE IMÁGENES CORREGIDO
import { getImageUrl } from "../../utils/imageManager";

const CartPage: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [isEmpty, setIsEmpty] = useState(false);
	const [couponCode, setCouponCode] = useState("");
	const [couponApplied, setCouponApplied] = useState(false);
	const [couponDiscount, setCouponDiscount] = useState(0);
	const [loadingItem, setLoadingItem] = useState<number | null>(null);

	const navigate = useNavigate();

	// Obtener datos del carrito y funciones para manipularlo
	const {
		cart,
		loading,
		error,
		fetchCart,
		itemCount,
		removeFromCart,
		updateCartItem,
		clearCart,
		showNotification,
	} = useCart();

	const {toggleFavorite} = useFavorites();

	// Cargar el carrito al montar el componente
	useEffect(() => {
		const loadCart = async () => {
			setIsLoading(true);
			try {
				await fetchCart();
			} catch (error) {
				console.error("Error al cargar el carrito:", error);
				showNotification(
					NotificationType.ERROR,
					"No se pudo cargar el carrito. Inténtalo de nuevo."
				);
			} finally {
				setIsLoading(false);
			}
		};

		loadCart();
	}, [fetchCart, showNotification]);

	// Actualizar estado de carrito vacío cuando cambia el carrito
	useEffect(() => {
		if (!loading && cart) {
			setIsEmpty(cart.items.length === 0);
		}
	}, [cart, loading]);

	// Funciones para manipular el carrito
	const increaseQuantity = async (id: number) => {
		if (loadingItem) return; // Evitar múltiples clics simultáneos

		setLoadingItem(id);
		const item = cart?.items.find((item) => item.id === id);

		if (item) {
			try {
				const result = await updateCartItem({
					itemId: id,
					quantity: item.quantity + 1,
				});

				if (!result) {
					throw new Error("No se pudo actualizar la cantidad");
				}
			} catch (error) {
				console.error("Error al aumentar cantidad:", error);
				showNotification(
					NotificationType.ERROR,
					"No se pudo actualizar la cantidad"
				);
			} finally {
				setLoadingItem(null);
			}
		}
	};

	const decreaseQuantity = async (id: number) => {
		if (loadingItem) return; // Evitar múltiples clics simultáneos

		setLoadingItem(id);
		const item = cart?.items.find((item) => item.id === id);

		if (item && item.quantity > 1) {
			try {
				const result = await updateCartItem({
					itemId: id,
					quantity: item.quantity - 1,
				});

				if (!result) {
					throw new Error("No se pudo actualizar la cantidad");
				}
			} catch (error) {
				console.error("Error al disminuir cantidad:", error);
				showNotification(
					NotificationType.ERROR,
					"No se pudo actualizar la cantidad"
				);
			} finally {
				setLoadingItem(null);
			}
		}
	};

	const handleRemoveFromCart = async (id: number) => {
		if (loadingItem) return; // Evitar múltiples clics simultáneos

		setLoadingItem(id);
		try {
			const result = await removeFromCart(id);

			if (result) {
				showNotification(
					NotificationType.SUCCESS,
					"Producto eliminado del carrito"
				);
			} else {
				throw new Error("No se pudo eliminar el producto");
			}
		} catch (error) {
			console.error("Error al eliminar del carrito:", error);
			showNotification(
				NotificationType.ERROR,
				"No se pudo eliminar el producto"
			);
		} finally {
			setLoadingItem(null);
		}
	};

	const moveToWishlist = async (id: number, productId: number) => {
		if (loadingItem) return; // Evitar múltiples clics simultáneos

		setLoadingItem(id);
		try {
			// Primero agregamos a favoritos
			await toggleFavorite(productId);

			// Luego eliminamos del carrito
			const result = await removeFromCart(id);

			if (result) {
				showNotification(
					NotificationType.SUCCESS,
					"Producto movido a favoritos"
				);
			} else {
				throw new Error("No se pudo mover el producto a favoritos");
			}
		} catch (error) {
			console.error("Error al mover a favoritos:", error);
			showNotification(
				NotificationType.ERROR,
				"No se pudo mover el producto a favoritos"
			);
		} finally {
			setLoadingItem(null);
		}
	};

	const applyCoupon = () => {
		if (couponCode.toLowerCase() === "discount10") {
			setCouponApplied(true);
			setCouponDiscount(10);
			showNotification(NotificationType.SUCCESS, "Cupón aplicado exitosamente");
		} else {
			showNotification(NotificationType.ERROR, "Código de cupón inválido");
		}
	};

	const handleEmptyCart = async () => {
		if (loading) return;

		try {
			const result = await clearCart();

			if (result) {
				showNotification(
					NotificationType.SUCCESS,
					"Carrito vaciado exitosamente"
				);
			} else {
				throw new Error("No se pudo vaciar el carrito");
			}
		} catch (error) {
			console.error("Error al vaciar el carrito:", error);
			showNotification(NotificationType.ERROR, "No se pudo vaciar el carrito");
		}
	};

	// FUNCIÓN CORREGIDA PARA OBTENER IMAGEN DEL PRODUCTO
	const getProductImage = (product: any): string => {
		console.log("🎨 CartPage - getProductImage:", product);
		
		let imagePath = "";

		// Prioridad 1: image
		if (product?.image) {
			imagePath = product.image;
		}
		// Prioridad 2: main_image  
		else if (product?.main_image) {
			imagePath = product.main_image;
		}
		// Prioridad 3: primer elemento de images array
		else if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
			const firstImage = product.images[0];
			if (typeof firstImage === 'string') {
				imagePath = firstImage;
			} else if (typeof firstImage === 'object' && firstImage !== null) {
				imagePath = firstImage.original || firstImage.medium || firstImage.thumbnail || "";
			}
		}

		console.log("🖼️ CartPage - Path extraído:", imagePath);
		
		// USAR EL HELPER CORREGIDO
		const finalUrl = getImageUrl(imagePath);
		console.log("🔗 CartPage - URL final:", finalUrl);
		
		return finalUrl;
	};

	// FUNCIÓN SIMPLIFICADA PARA CALCULAR PRECIOS DE ITEM
	const calculateItemPrices = (item: any): { original: number, discounted: number, discount: number, subtotal: number } => {
		console.log("💰 CartPage - Datos del item completo:", item);
	
	// *** AGREGÁ ESTE DEBUG TEMPORAL ***
	console.log("🔍 DEBUG - Item completo:", JSON.stringify(item, null, 2));
	console.log("🔍 DEBUG - Producto completo:", JSON.stringify(item.product, null, 2));

		
		// Obtener precio original del item
		const originalPrice = item.price || 0;
		
		// USAR DIRECTAMENTE final_price DE LA API - ESTA ES LA CORRECCIÓN PRINCIPAL
		let discountedPrice = originalPrice; // Por defecto usar precio original
		let discountPercentage = 0;
		
		if (item.product) {
			// PRIORIDAD 1: usar final_price si existe (viene calculado desde la API)
			if (item.product.final_price !== undefined && item.product.final_price !== null) {
				discountedPrice = item.product.final_price;
			}
			// FALLBACK: si no hay final_price, calcular manualmente (caso raro)
			else {
				discountPercentage = item.product.discount_percentage || 
									item.product.discountPercentage || 
									item.product.discount || 
									0;
				if (discountPercentage > 0) {
					discountedPrice = originalPrice - (originalPrice * (discountPercentage / 100));
				}
			}
			
			// Obtener porcentaje de descuento para mostrar en UI
			discountPercentage = item.product.discount_percentage || 
								item.product.discountPercentage || 
								item.product.discount || 
								0;
		}
		
		console.log("💰 CartPage - Precio original:", originalPrice);
		console.log("💰 CartPage - Precio con descuento (final_price):", discountedPrice);
		console.log("💰 CartPage - Descuento %:", discountPercentage);
		console.log("💰 CartPage - Cantidad:", item.quantity);
		
		// CALCULAR SUBTOTAL usando el precio con descuento (final_price)
		const subtotal = discountedPrice * item.quantity;
		
		console.log("💰 CartPage - Subtotal calculado:", subtotal);
		
		return {
			original: originalPrice,
			discounted: discountedPrice,
			discount: discountPercentage,
			subtotal: subtotal
		};
	};

	// CALCULAR TOTALES DEL CARRITO
	const calculateCartTotals = () => {
		if (!cart || !cart.items || cart.items.length === 0) {
			return {
				subtotal: 0,
				tax: 0,
				couponAmount: 0,
				total: 0
			};
		}

		// Calcular subtotal sumando todos los subtotales con descuento
		const subtotal = cart.items.reduce((sum, item) => {
			const itemPrices = calculateItemPrices(item);
			return sum + itemPrices.subtotal;
		}, 0);

		console.log("💰 CartPage - Subtotal total del carrito:", subtotal);

		const taxRate = 0.15; // 15% IVA
		const tax = subtotal * taxRate;
		const couponAmount = couponApplied ? subtotal * (couponDiscount / 100) : 0;
		const total = subtotal + tax - couponAmount;

		console.log("💰 CartPage - Totales finales:", {
			subtotal,
			tax,
			couponAmount,
			total
		});

		return {
			subtotal,
			tax, 
			couponAmount,
			total
		};
	};

	const { subtotal, tax, couponAmount, total } = calculateCartTotals();

	// Función para proceder al checkout
	const handleCheckout = () => {
		if (isEmpty) {
			showNotification(
				NotificationType.ERROR,
				"No hay productos en el carrito"
			);
			return;
		}

		// Redireccionar a la página de checkout
		navigate("/checkout");
	};

	return (
		<div className="container mx-auto px-4 lg:px-8 py-10">
			<h1 className="text-3xl font-bold mb-8">Mi Carrito</h1>

			{isLoading ? (
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			) : isEmpty ? (
				<div className="text-center py-20 bg-gray-50 rounded-lg">
					<ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-6" />
					<h2 className="text-2xl font-semibold text-gray-700 mb-3">
						Tu carrito está vacío
					</h2>
					<p className="text-gray-500 mb-8 max-w-md mx-auto">
						Añade productos a tu carrito para continuar comprando.
					</p>
					<Link
						to="/products"
						className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
					>
						Explorar productos
					</Link>
				</div>
			) : (
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Lista de productos */}
					<div className="lg:w-2/3">
						<div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
							{/* Encabezado */}
							<div className="hidden sm:grid sm:grid-cols-12 gap-4 p-5 bg-gray-50 border-b">
								<div className="sm:col-span-6">
									<span className="font-medium text-gray-800">Producto</span>
								</div>
								<div className="sm:col-span-2 text-center">
									<span className="font-medium text-gray-800">Precio</span>
								</div>
								<div className="sm:col-span-2 text-center">
									<span className="font-medium text-gray-800">Cantidad</span>
								</div>
								<div className="sm:col-span-2 text-center">
									<span className="font-medium text-gray-800">Total</span>
								</div>
							</div>

							{/* Productos */}
							{cart?.items.map((item) => {
								// CALCULAR PRECIOS USANDO LA FUNCIÓN SIMPLIFICADA
								const prices = calculateItemPrices(item);

								console.log("🛒 CartPage - Renderizando item:", {
									itemId: item.id,
									prices
								});

								return (
									<div
										key={item.id}
										className="border-b border-gray-200 last:border-b-0"
									>
										<div className="grid sm:grid-cols-12 gap-4 p-5">
											{/* Producto (imagen y nombre) - NAVEGACIÓN CORREGIDA */}
											<div className="sm:col-span-6 flex">
												<Link
													to={`/products/${item.productId}`}
													className="w-24 h-24 flex-shrink-0"
												>
													<img
														src={getProductImage(item.product)}
														alt={
															item.product?.name || `Producto ${item.productId}`
														}
														className="w-full h-full object-cover rounded"
													/>
												</Link>
												<div className="ml-4 flex flex-col">
													<Link
														to={`/products/${item.productId}`}
														className="font-medium text-gray-800 hover:text-primary-600"
													>
														{item.product?.name || `Producto ${item.productId}`}
													</Link>
													
													{/* Mostrar descuento si existe */}
													{prices.discount > 0 && (
														<div className="mt-1">
															<span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
																{prices.discount}% OFF
															</span>
														</div>
													)}

													<div className="mt-auto flex space-x-3 text-sm pt-3">
														<button
															onClick={() => handleRemoveFromCart(item.id)}
															disabled={loadingItem === item.id}
															className="text-gray-500 hover:text-red-500 flex items-center disabled:opacity-50"
														>
															<Trash2 size={14} className="mr-1" />
															Eliminar
														</button>
														<button
															onClick={() =>
																moveToWishlist(item.id, item.productId)
															}
															disabled={loadingItem === item.id}
															className="text-gray-500 hover:text-primary-600 flex items-center disabled:opacity-50"
														>
															<Heart size={14} className="mr-1" />
															Guardar
														</button>
													</div>
												</div>
											</div>

											{/* Precio - MOSTRAR PRECIO CON DESCUENTO */}
											<div className="sm:col-span-2 flex items-center justify-center sm:justify-center">
												<div className="sm:hidden mr-2 font-medium text-gray-800">
													Precio:
												</div>
												<div className="font-medium flex flex-col items-center">
													<span className="text-gray-800">
														{formatCurrency(prices.discounted)}
													</span>
													{prices.discount > 0 && (
														<span className="text-xs text-gray-500 line-through">
															{formatCurrency(prices.original)}
														</span>
													)}
												</div>
											</div>

											{/* Cantidad */}
											<div className="sm:col-span-2 flex items-center justify-center">
												<div className="sm:hidden mr-2 font-medium text-gray-800">
													Cantidad:
												</div>
												<div className="flex items-center border border-gray-300 rounded-md">
													<button
														onClick={() => decreaseQuantity(item.id)}
														disabled={
															item.quantity <= 1 || loadingItem === item.id
														}
														className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
													>
														<Minus size={14} />
													</button>
													<span className="px-3 py-1 text-gray-800 text-center w-10">
														{loadingItem === item.id ? (
															<span className="inline-block h-4 w-4 border-2 border-t-primary-600 border-r-primary-600 border-b-primary-200 border-l-primary-200 rounded-full animate-spin"></span>
														) : (
															item.quantity
														)}
													</span>
													<button
														onClick={() => increaseQuantity(item.id)}
														disabled={loadingItem === item.id}
														className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
													>
														<Plus size={14} />
													</button>
												</div>
											</div>

											{/* Total - USAR SUBTOTAL CALCULADO CON DESCUENTO */}
											<div className="sm:col-span-2 flex items-center justify-center sm:justify-center">
												<div className="sm:hidden mr-2 font-medium text-gray-800">
													Total:
												</div>
												<span className="font-bold text-gray-800">
													{formatCurrency(prices.subtotal)}
												</span>
											</div>
										</div>
									</div>
								);
							})}

							{/* Botones de acción en la parte inferior */}
							<div className="flex justify-between items-center p-5 bg-gray-50">
								<button
									onClick={handleEmptyCart}
									disabled={isEmpty || loading}
									className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
								>
									Vaciar carrito
								</button>

								<div className="text-sm text-gray-600">
									{itemCount} {itemCount === 1 ? "producto" : "productos"} en el
									carrito
								</div>
							</div>
						</div>

						{/* Botón para continuar comprando */}
						<div>
							<Link
								to="/products"
								className="inline-flex items-center text-primary-600 hover:text-primary-700"
							>
								<ArrowLeft size={18} className="mr-2" />
								Continuar comprando
							</Link>
						</div>
					</div>

					{/* Resumen del pedido - CÁLCULOS CORREGIDOS */}
					<div className="lg:w-1/3">
						<div className="bg-white rounded-lg shadow-lg overflow-hidden">
							<div className="p-6">
								<h2 className="text-xl font-bold text-gray-800 mb-4">
									Resumen del pedido
								</h2>

								{/* Cupón */}
								<div className="mb-6">
									<div className="flex items-center mb-2">
										<input
											type="text"
											placeholder="Código de cupón"
											className="flex-1 border border-gray-300 rounded-l-md py-3 px-4 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
											value={couponCode}
											onChange={(e) => setCouponCode(e.target.value)}
											disabled={couponApplied}
										/>
										<button
											onClick={applyCoupon}
											disabled={couponApplied || !couponCode}
											className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-r-md disabled:opacity-50"
										>
											Aplicar
										</button>
									</div>
									{couponApplied && (
										<div className="text-green-600 text-sm">
											Cupón aplicado: {couponDiscount}% de descuento
										</div>
									)}
								</div>

								{/* Cálculos */}
								<div className="space-y-4 border-t border-gray-200 pt-4">
									<div className="flex justify-between">
										<span className="text-gray-600">Subtotal (con descuentos)</span>
										<span className="font-medium">
											{formatCurrency(subtotal)}
										</span>
									</div>

									<div className="flex justify-between">
										<span className="text-gray-600">IVA (15%)</span>
										<span className="font-medium">{formatCurrency(tax)}</span>
									</div>

									{couponApplied && (
										<div className="flex justify-between text-green-600">
											<span>Descuento de cupón</span>
											<span>-{formatCurrency(couponAmount)}</span>
										</div>
									)}

									<div className="flex justify-between border-t border-gray-200 pt-4">
										<span className="text-xl font-bold">Total</span>
										<span className="text-xl font-bold">
											{formatCurrency(total)}
										</span>
									</div>
								</div>

								{/* Botón de checkout */}
								<button
									onClick={handleCheckout}
									disabled={isEmpty || loading}
									className="mt-8 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-md transition-colors disabled:opacity-50"
								>
									Proceder al pago
								</button>

								{/* Información adicional */}
								<div className="mt-4 text-xs text-gray-500">
									<p>
										Los impuestos y gastos de envío se calculan durante el
										proceso de pago.
									</p>
									<p className="mt-1">
										Aceptamos diversas formas de pago, incluyendo tarjetas de
										crédito, transferencias bancarias y pago contra entrega.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Mostrar errores de la API */}
			{error && (
				<div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
					<p className="font-medium">Error: {error}</p>
					<button
						onClick={() => fetchCart()}
						className="underline text-sm mt-1"
					>
						Reintentar cargar el carrito
					</button>
				</div>
			)}

			{/* Herramienta de depuración de seller_id - solo en desarrollo */}
		</div>
	);
};

export default CartPage;