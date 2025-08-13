// src/presentation/pages/CartPage.tsx - ACTUALIZADO CON DESCUENTOS Y CUPONES
import React, {useState, useEffect, useMemo, useCallback} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
	ShoppingCart,
	Trash2,
	Plus,
	Minus,
	ArrowLeft,
	Heart,
	Gift,
	TrendingDown,
	AlertTriangle,
	Tag // ✅ NUEVO: Icono para cupón
} from "lucide-react";
import {useCart} from "../hooks/useCart";
import {useFavorites} from "../hooks/useFavorites";
import {useInvalidateCounters} from "../hooks/useHeaderCounters";
import {useErrorHandler} from "../hooks/useErrorHandler";
import {NotificationType} from "../contexts/CartContext";
import CacheService from "../../infrastructure/services/CacheService";
import {formatCurrency} from "../../utils/formatters/formatCurrency";

// ✅ NUEVO: Importar calculadora centralizada y funciones necesarias
import {calculateCartItemDiscounts} from "../../utils/volumeDiscountCalculator";
import {EcommerceCalculator} from "../../utils/ecommerceCalculator";
import type {CartItemWithDiscounts} from "../../utils/volumeDiscountCalculator";

// Importar hooks optimizados
import {useImageCache} from "../hooks/useImageCache";
import {useAutoPrefetch} from "../hooks/useAutoPrefetch";

const CartPage: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [isEmpty, setIsEmpty] = useState(false);
	const [couponCode, setCouponCode] = useState("");
	const [loadingItem, setLoadingItem] = useState<number | null>(null);
	const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

	const navigate = useNavigate();

	// Hooks optimizados
	const {getOptimizedImageUrl} = useImageCache();
	const {prefetchCartPageData} = useAutoPrefetch({
		enabled: true,
		delay: 500,
		onPrefetchComplete: () => console.log("✅ Cart page prefetch completed"),
	});

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
		// ✅ NUEVO: Funciones de descuento del CartContext
		appliedDiscount,
		applyDiscountCode,
		removeDiscountCode,
	} = useCart();

	const {toggleFavorite} = useFavorites();

	// Hook para manejo de errores mejorado
	const {handleError, handleSuccess, handleStockError} = useErrorHandler({
		showNotification,
		context: 'CartPage'
	});

	// Fetch cart data when component mounts
	useEffect(() => {
		const loadCartData = async () => {
			setIsLoading(true);
			try {
				await fetchCart();
			} catch (error) {
				console.error('Error loading cart data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadCartData();
	}, [fetchCart]);

	// Hook para actualizaciones optimistas
	const {
		optimisticCartAdd,
		optimisticCartRemove,
		optimisticFavoriteAdd
	} = useInvalidateCounters();

	// Helper para obtener stock disponible
	const getAvailableStock = useCallback((product: any): number => {
		if (typeof product.stockAvailable === 'number') {
			return product.stockAvailable;
		}
		if (typeof product.stock === 'number') {
			return product.stock;
		}
		return 0;
	}, []);

	// Helper para validar disponibilidad
	const isStockAvailable = useCallback((product: any, requestedQuantity: number): boolean => {
		const availableStock = getAvailableStock(product);
		return availableStock >= requestedQuantity && product.is_in_stock !== false;
	}, [getAvailableStock]);

	// Función simple para invalidar cache
	const invalidateRelatedPages = useCallback(() => {
		CacheService.removeItem("cart_user_data");
		CacheService.removeItem("cart_guest_data");
		CacheService.removeItem("header_counters");
		
		// Invalidar cache de favoritos
		for (let page = 1; page <= 10; page++) {
			CacheService.removeItem(`user_favorites_${page}_10`);
		}
		
		console.log("🔄 Cache invalidado desde CartPage");
	}, []);

	// Función optimizada para obtener imagen del producto
	const getProductImage = useCallback(
		(product: any): string => {
			return getOptimizedImageUrl(product, "medium");
		},
		[getOptimizedImageUrl]
	);

	// ✅ ACTUALIZADO: Calcular descuentos por volumen para cada item
	const cartItemsWithDiscounts = useMemo(() => {
		if (!cart?.items) {
			return [];
		}

		return cart.items.map(item => {
			// ✅ Usar nueva calculadora de descuentos
			const discount = calculateCartItemDiscounts(item);
			
			return {
				...item,
				discount,
				imageUrl: getProductImage(item.product)
			} as CartItemWithDiscounts;
		});
	}, [cart?.items, getProductImage]);

	// ✅ USAR CALCULADORA CENTRALIZADA DIRECTAMENTE
	const cartTotals = useMemo(() => {
		if (!cartItemsWithDiscounts.length) {
			return {
				subtotal: 0,
				tax: 0,
				couponAmount: 0,
				total: 0,
				totalVolumeSavings: 0,
				totalSellerSavings: 0,
				totalSavings: 0,
				volumeDiscountsApplied: false,
				shipping: 0,
			};
		}

		// ✅ USAR CALCULADORA CENTRALIZADA DIRECTAMENTE
		console.log("🔍 FLUJO CART - Usando calculadora centralizada directamente");
		const result = EcommerceCalculator.calculateTotals(cartItemsWithDiscounts, appliedDiscount);
		
		console.log("🔍 FLUJO CART - Totales finales calculados:");
		console.log("   💰 Subtotal después de cupón:", result.subtotalAfterCoupon);
		console.log("   💰 + Envío:", result.shipping, "=", result.subtotalWithShipping);
		console.log("   💰 + IVA 15%:", result.tax);
		console.log("   🎯 TOTAL CART:", result.total);
		console.log("   📊 Descuentos: seller=", result.sellerDiscounts, 
		         "volume=", result.volumeDiscounts, "cupón=", result.couponDiscount);

		return {
			subtotal: result.subtotalAfterCoupon,
			tax: result.tax,
			couponAmount: result.couponDiscount,
			total: result.total,
			totalVolumeSavings: result.volumeDiscounts,
			totalSellerSavings: result.sellerDiscounts,
			totalSavings: result.totalDiscounts,
			volumeDiscountsApplied: result.volumeDiscountsApplied,
			shipping: result.shipping,
		};
	}, [cartItemsWithDiscounts, appliedDiscount, cart?.total, cart?.subtotal]);

	// Cargar carrito simple - Solo al montar componente
	useEffect(() => {
		const loadCart = async () => {
			setIsLoading(true);
			try {
				await fetchCart();
				// Prefetch de datos relacionados después de cargar carrito
				prefetchCartPageData();
			} catch (error: any) {
				console.error("Error al cargar el carrito:", error);
				handleError(error, "No se pudo cargar el carrito. Inténtalo de nuevo.");
			} finally {
				setIsLoading(false);
			}
		};

		loadCart();
	}, []);

	// Actualizar estado de carrito vacío cuando cambia el carrito
	useEffect(() => {
		if (!loading && cart) {
			setIsEmpty(cart.items.length === 0);
		}
	}, [cart, loading]);

	// ✅ FUNCIÓN PARA INCREMENTAR CANTIDAD CON VALIDACIÓN DE STOCK
	const increaseQuantity = useCallback(
		async (id: number) => {
			if (loadingItem) return;

			setLoadingItem(id);
			const item = cart?.items.find((item) => item.id === id);

			if (item) {
				try {
					// ✅ VALIDAR STOCK ANTES DE INCREMENTAR
					const availableStock = getAvailableStock(item.product);
					const newQuantity = item.quantity + 1;

					if (!isStockAvailable(item.product, newQuantity)) {
						handleStockError(availableStock, newQuantity);
						setLoadingItem(null);
						return;
					}

					// Actualización optimista
					optimisticCartAdd();

					const result = await updateCartItem({
						itemId: id,
						quantity: newQuantity,
					});

					if (!result) {
						throw new Error("No se pudo actualizar la cantidad");
					}

					// Invalidar cache y refetch
					invalidateRelatedPages();
					await fetchCart();
				} catch (error: any) {
					console.error("Error al aumentar cantidad:", error);
					
					// Manejo específico de errores de stock
					if (error?.response?.data?.message?.includes('stock') || 
						error?.message?.includes('stock') ||
						error?.response?.data?.message?.includes('insuficiente')) {
						const availableStock = getAvailableStock(item.product);
						handleStockError(availableStock, item.quantity + 1);
					} else {
						handleError(error, "No se pudo actualizar la cantidad");
					}
				} finally {
					setLoadingItem(null);
				}
			}
		},
		[cart?.items, loadingItem, updateCartItem, optimisticCartAdd, invalidateRelatedPages, fetchCart, 
		 getAvailableStock, isStockAvailable, handleStockError, handleError]
	);

	// ✅ FUNCIÓN PARA DISMINUIR CANTIDAD
	const decreaseQuantity = useCallback(
		async (id: number) => {
			if (loadingItem) return;

			setLoadingItem(id);
			const item = cart?.items.find((item) => item.id === id);

			if (item && item.quantity > 1) {
				try {
					// Actualización optimista
					optimisticCartRemove();

					const result = await updateCartItem({
						itemId: id,
						quantity: item.quantity - 1,
					});

					if (!result) {
						throw new Error("No se pudo actualizar la cantidad");
					}

					// Invalidar cache y refetch
					invalidateRelatedPages();
					await fetchCart();
				} catch (error: any) {
					console.error("Error al disminuir cantidad:", error);
					handleError(error, "No se pudo actualizar la cantidad");
				} finally {
					setLoadingItem(null);
				}
			}
		},
		[cart?.items, loadingItem, updateCartItem, optimisticCartRemove, invalidateRelatedPages, fetchCart, handleError]
	);

	// ✅ FUNCIÓN PARA ELIMINAR DEL CARRITO
	const handleRemoveFromCart = useCallback(
		async (id: number) => {
			if (loadingItem) return;

			setLoadingItem(id);
			try {
				// Actualización optimista
				const item = cart?.items.find((item) => item.id === id);
				const itemQuantity = item?.quantity || 1;
				
				for (let i = 0; i < itemQuantity; i++) {
					optimisticCartRemove();
				}

				const result = await removeFromCart(id);

				if (result) {
					// Invalidar cache y refetch
					invalidateRelatedPages();
					await fetchCart();

					handleSuccess("Producto eliminado del carrito");
				} else {
					throw new Error("No se pudo eliminar el producto");
				}
			} catch (error: any) {
				console.error("Error al eliminar del carrito:", error);
				handleError(error, "No se pudo eliminar el producto");
			} finally {
				setLoadingItem(null);
			}
		},
		[loadingItem, removeFromCart, invalidateRelatedPages, optimisticCartRemove, cart?.items, fetchCart, handleSuccess, handleError]
	);

	// ✅ FUNCIÓN PARA MOVER A FAVORITOS
	const moveToWishlist = useCallback(
		async (id: number, productId: number) => {
			if (loadingItem) return;

			setLoadingItem(id);
			try {
				// Actualización optimista
				optimisticFavoriteAdd();

				const item = cart?.items.find((item) => item.id === id);
				const itemQuantity = item?.quantity || 1;
				
				for (let i = 0; i < itemQuantity; i++) {
					optimisticCartRemove();
				}

				// Primero agregamos a favoritos
				await toggleFavorite(productId);

				// Luego eliminamos del carrito
				const result = await removeFromCart(id);

				if (result) {
					// Invalidar cache y refetch
					invalidateRelatedPages();
					await fetchCart();

					handleSuccess("Producto movido a favoritos");
				} else {
					throw new Error("No se pudo mover el producto a favoritos");
				}
			} catch (error: any) {
				console.error("Error al mover a favoritos:", error);
				handleError(error, "No se pudo mover el producto a favoritos");
			} finally {
				setLoadingItem(null);
			}
		},
		[loadingItem, toggleFavorite, removeFromCart, optimisticFavoriteAdd, optimisticCartRemove, invalidateRelatedPages, cart?.items, fetchCart, handleSuccess, handleError]
	);

	// ✅ FUNCIÓN PARA APLICAR CUPÓN - USANDO NUEVA API DE CART CONTEXT
	const applyCoupon = useCallback(async () => {
		if (!couponCode.trim()) {
			showNotification(NotificationType.ERROR, "Por favor ingresa un código de cupón");
			return;
		}

		setIsApplyingCoupon(true);

		try {
			const result = await applyDiscountCode(couponCode);
			
			if (result.success) {
				handleSuccess(result.message);
				setCouponCode(""); // Limpiar el campo después de aplicar
			} else {
				showNotification(NotificationType.ERROR, result.message);
			}
		} catch (error: any) {
			console.error("Error applying coupon:", error);
			showNotification(NotificationType.ERROR, "Error inesperado al aplicar el cupón");
		} finally {
			setIsApplyingCoupon(false);
		}
	}, [couponCode, applyDiscountCode, handleSuccess, showNotification]);

	// ✅ FUNCIÓN PARA REMOVER CUPÓN - USANDO NUEVA API DE CART CONTEXT
	const removeCoupon = useCallback(async () => {
		try {
			const result = await removeDiscountCode();
			
			if (result.success) {
				handleSuccess(result.message);
				setCouponCode(""); // Limpiar el campo
			} else {
				showNotification(NotificationType.ERROR, result.message);
			}
		} catch (error: any) {
			console.error("Error removing coupon:", error);
			showNotification(NotificationType.ERROR, "Error inesperado al remover el cupón");
		}
	}, [removeDiscountCode, handleSuccess, showNotification]);

	// ✅ FUNCIÓN PARA VACIAR CARRITO
	const handleEmptyCart = useCallback(async () => {
		if (loading) return;

		try {
			// Actualización optimista
			const totalItems = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
			
			for (let i = 0; i < totalItems; i++) {
				optimisticCartRemove();
			}

			const result = await clearCart();

			if (result) {
				// Invalidar cache y refetch
				invalidateRelatedPages();
				await fetchCart();

				handleSuccess("Carrito vaciado exitosamente");
			} else {
				throw new Error("No se pudo vaciar el carrito");
			}
		} catch (error: any) {
			console.error("Error al vaciar el carrito:", error);
			handleError(error, "No se pudo vaciar el carrito");
		}
	}, [loading, clearCart, invalidateRelatedPages, optimisticCartRemove, cart?.items, fetchCart, handleSuccess, handleError]);

	// ✅ FUNCIÓN PARA PROCEDER AL CHECKOUT
	const handleCheckout = useCallback(() => {
		if (isEmpty) {
			showNotification(
				NotificationType.ERROR,
				"No hay productos en el carrito"
			);
			return;
		}

		// Redireccionar a la página de checkout
		navigate("/checkout");
	}, [isEmpty, navigate, showNotification]);

	// ✅ COMPONENTE ACTUALIZADO PARA ITEM DEL CARRITO CON DESCUENTOS POR VOLUMEN
	const CartItem = React.memo(
		({
			item,
			onIncrease,
			onDecrease,
			onRemove,
			onMoveToWishlist,
			isLoading,
		}: {
			item: CartItemWithDiscounts;
			onIncrease: () => void;
			onDecrease: () => void;
			onRemove: () => void;
			onMoveToWishlist: () => void;
			isLoading: boolean;
		}) => {
			const discount = item.discount;
			const availableStock = getAvailableStock(item.product);
			const isAtStockLimit = item.quantity >= availableStock;
			
			return (
				<div className="border-b border-gray-200 last:border-b-0">
					<div className="grid sm:grid-cols-12 gap-4 p-5">
						{/* Producto (imagen y nombre) */}
						<div className="sm:col-span-6 flex">
							<Link
								to={`/products/${item.productId}`}
								className="w-24 h-24 flex-shrink-0"
							>
								<img
									src={item.imageUrl}
									alt={item.product?.name || `Producto ${item.productId}`}
									className="w-full h-full object-cover rounded"
								/>
							</Link>
							<div className="ml-4 flex flex-col">
								<Link
									to={`/products/${item.productId}`}
									className="font-medium text-lg mb-2 text-gray-800 hover:text-primary-600"
								>
									{item.product?.name || `Producto ${item.productId}`}
								</Link>

								{/* ✅ MOSTRAR INFORMACIÓN DE STOCK */}
								<div className="flex items-center space-x-2 mb-2">
									{availableStock > 0 ? (
										<div className="flex items-center text-sm">
											<div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
											<span className="text-green-600">
												{availableStock} en stock
											</span>
										</div>
									) : (
										<div className="flex items-center text-sm">
											<AlertTriangle size={12} className="text-red-500 mr-1" />
											<span className="text-red-600">Agotado</span>
										</div>
									)}
								</div>

								{/* ✅ MOSTRAR DESCUENTOS APLICADOS */}
								<div className="flex flex-wrap gap-2 mb-2">
									{discount.sellerDiscountAmount > 0 && (
										<span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center">
											<Gift size={12} className="mr-1" />
											Seller: {item.product?.discount_percentage || 0}% OFF
										</span>
									)}
									{discount.volumeDiscountAmount > 0 && (
										<span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded flex items-center">
											<TrendingDown size={12} className="mr-1" />
											Volumen: {discount.discountPercentage}% OFF adicional
										</span>
									)}
								</div>

								{/* ✅ MOSTRAR AHORROS TOTALES */}
								{discount.hasDiscount && (
									<div className="text-xs text-green-600 mb-2">
										Ahorras: {formatCurrency(discount.savingsTotal)}
									</div>
								)}

								<div className="mt-auto flex space-x-3 text-sm pt-3">
									<button
										onClick={onRemove}
										disabled={isLoading}
										className="text-gray-500 hover:text-red-500 flex items-center disabled:opacity-50"
									>
										<Trash2 size={14} className="mr-1" />
										Eliminar
									</button>
									<button
										onClick={onMoveToWishlist}
										disabled={isLoading}
										className="text-gray-500 hover:text-primary-600 flex items-center disabled:opacity-50"
									>
										<Heart size={14} className="mr-1" />
										Guardar
									</button>
								</div>
							</div>
						</div>

						{/* Precio */}
						<div className="sm:col-span-2 flex items-center justify-center sm:justify-center">
							<div className="sm:hidden mr-2 font-medium text-gray-800">
								Precio:
							</div>
							<div className="font-medium flex flex-col items-center">
								<span className="text-gray-800">
									{formatCurrency(discount.finalPricePerUnit)}
								</span>
								{discount.hasDiscount && (
									<span className="text-xs text-gray-500 line-through">
										{formatCurrency(discount.originalPrice)}
									</span>
								)}
							</div>
						</div>

						{/* Cantidad */}
						<div className="sm:col-span-2 flex items-center justify-center">
							<div className="sm:hidden mr-2 font-medium text-gray-800">
								Cantidad:
							</div>
							<div className="flex flex-col items-center">
								<div className="flex items-center border border-gray-300 rounded-md">
									<button
										onClick={onDecrease}
										disabled={item.quantity <= 1 || isLoading}
										className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
									>
										<Minus size={14} />
									</button>
									<span className="px-3 py-1 text-gray-800 text-center w-10">
										{isLoading ? (
											<span className="inline-block h-4 w-4 border-2 border-t-primary-600 border-r-primary-600 border-b-primary-200 border-l-primary-200 rounded-full animate-spin"></span>
										) : (
											item.quantity
										)}
									</span>
									<button
										onClick={onIncrease}
										disabled={isLoading || isAtStockLimit || availableStock === 0}
										className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
									>
										<Plus size={14} />
									</button>
								</div>
								
								{/* ✅ ADVERTENCIA DE STOCK LIMITADO */}
								{isAtStockLimit && availableStock > 0 && (
									<div className="text-xs text-amber-600 mt-1 flex items-center">
										<AlertTriangle size={10} className="mr-1" />
										Límite de stock
									</div>
								)}
							</div>
						</div>

						{/* Total */}
						<div className="sm:col-span-2 flex items-center justify-center sm:justify-center">
							<div className="sm:hidden mr-2 font-medium text-gray-800">
								Total:
							</div>
							<div className="flex flex-col items-center">
								<span className="font-bold text-gray-800">
									{formatCurrency(discount.finalPricePerUnit * item.quantity)}
								</span>
								{discount.hasDiscount && (
									<span className="text-xs text-green-600">
										(-{formatCurrency(discount.savingsTotal)})
									</span>
								)}
							</div>
						</div>
					</div>
				</div>
			);
		}
	);

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
						{/* ✅ BANNER DE DESCUENTOS APLICADOS */}
						{(cartTotals.totalSavings > 0) && (
							<div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
								<div className="flex items-center">
									<TrendingDown size={20} className="text-green-600 mr-3" />
									<div className="flex-1">
										<h3 className="font-medium text-green-800">
											¡Descuentos Aplicados!
										</h3>
										<div className="text-sm text-green-600 mt-1 space-y-1">
											{cartTotals.totalSellerSavings > 0 && (
												<p>Descuentos del vendedor: {formatCurrency(cartTotals.totalSellerSavings)}</p>
											)}
											{cartTotals.totalVolumeSavings > 0 && (
												<p>Descuentos por volumen: {formatCurrency(cartTotals.totalVolumeSavings)}</p>
											)}
										</div>
									</div>
									<div className="text-2xl font-bold text-green-600">
										{formatCurrency(cartTotals.totalSavings)}
									</div>
								</div>
							</div>
						)}

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

							{/* ✅ PRODUCTOS CON DESCUENTOS CALCULADOS */}
							{cartItemsWithDiscounts.map((item) => (
								<CartItem
									key={item.id}
									item={item}
									onIncrease={() => increaseQuantity(item.id)}
									onDecrease={() => decreaseQuantity(item.id)}
									onRemove={() => handleRemoveFromCart(item.id)}
									onMoveToWishlist={() => moveToWishlist(item.id, item.productId)}
									isLoading={loadingItem === item.id}
								/>
							))}

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
									{itemCount} {itemCount === 1 ? "producto" : "productos"} en el carrito
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

					{/* ✅ RESUMEN CON TODOS LOS DESCUENTOS */}
					<div className="lg:w-1/3">
						<div className="bg-white rounded-lg shadow-lg overflow-hidden">
							<div className="p-6">
								<h2 className="text-xl font-bold text-gray-800 mb-4">
									Resumen del pedido
								</h2>

								{/* ✅ SECCIÓN DE CUPÓN - AÑADIDA PARA CORREGIR ERRORES */}
								<div className="mb-4 pb-4 border-b border-gray-200">
									<label htmlFor="coupon" className="flex items-center text-sm font-medium text-gray-700 mb-2">
										<Tag size={16} className="mr-2" /> ¿Tienes un cupón?
									</label>
									<div className="flex">
										<input
											type="text"
											id="coupon"
											value={couponCode}
											onChange={(e) => setCouponCode(e.target.value)}
											placeholder="Código de cupón"
											disabled={!!appliedDiscount}
											className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
										/>
										<button
											onClick={applyCoupon}
											disabled={!couponCode || !!appliedDiscount || isApplyingCoupon}
											className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-r-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
										>
											{isApplyingCoupon ? (
												<>
													<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
													Aplicando...
												</>
											) : (
												'Aplicar'
											)}
										</button>
									</div>
								</div>

								{/* ✅ CÁLCULOS CON DESCUENTOS POR VOLUMEN */}
								<div className="space-y-4 pt-4">
									<div className="flex justify-between">
										<span className="text-gray-600">
											Subtotal (con descuentos)
										</span>
										<span className="font-medium">
											{formatCurrency(cartTotals.subtotal)}
										</span>
									</div>

									{/* ✅ MOSTRAR AHORROS DESGLOSADOS */}
									{cartTotals.totalSellerSavings > 0 && (
										<div className="flex justify-between text-blue-600">
											<span className="flex items-center text-sm">
												<Gift size={16} className="mr-1" />
												Descuentos del vendedor
											</span>
											<span className="font-medium">
												-{formatCurrency(cartTotals.totalSellerSavings)}
											</span>
										</div>
									)}

									{cartTotals.totalVolumeSavings > 0 && (
										<div className="flex justify-between text-green-600">
											<span className="flex items-center text-sm">
												<TrendingDown size={16} className="mr-1" />
												Descuentos por volumen
											</span>
											<span className="font-medium">
												-{formatCurrency(cartTotals.totalVolumeSavings)}
											</span>
										</div>
									)}

									<div className="flex justify-between">
										<span className="text-gray-600">Envío:</span>
										<span className="font-medium">
											{cartTotals.shipping === 0 ? 
												"Gratis" : 
												formatCurrency(cartTotals.shipping)
											}
										</span>
									</div>

									{appliedDiscount && (
										<div className="flex justify-between text-green-600">
											<div className="flex items-center gap-2">
												<span>Descuento de cupón ({appliedDiscount.discountCode.discount_percentage}%)</span>
												<button
													onClick={removeCoupon}
													className="text-gray-400 hover:text-red-500 transition-colors text-sm"
													title="Remover cupón"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
											<span>-{formatCurrency(cartTotals.couponAmount)}</span>
										</div>
									)}

									<div className="flex justify-between">
										<span className="text-gray-600">IVA (15%)</span>
										<span className="font-medium">
											{formatCurrency(cartTotals.tax)}
										</span>
									</div>

									<div className="flex justify-between border-t border-gray-200 pt-4">
										<span className="text-xl font-bold">Total</span>
										<span className="text-xl font-bold">
											{formatCurrency(cartTotals.total)}
										</span>
									</div>

									{/* ✅ RESUMEN DE AHORROS TOTALES */}
									{cartTotals.totalSavings > 0 && (
										<div className="bg-green-50 border border-green-200 rounded-lg p-3">
											<div className="flex items-center justify-between">
												<span className="text-sm font-medium text-green-800">
													Total ahorrado:
												</span>
												<span className="text-lg font-bold text-green-600">
													{formatCurrency(cartTotals.totalSavings)}
												</span>
											</div>
										</div>
									)}
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
									{cartTotals.totalSavings > 0 && (
										<p className="mt-2 text-green-600 font-medium">
											¡Tienes descuentos aplicados en tu carrito!
										</p>
									)}
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
		</div>
	);
};

export default CartPage;
