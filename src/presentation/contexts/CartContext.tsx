import React, {
	createContext,
	useState,
	useEffect,
	useCallback,
	useContext,
	useRef,
} from "react";
import type {ReactNode} from "react";
import type {
	ShoppingCart,
	CartItem,
	AddToCartRequest,
	CartItemUpdateData,
} from "../../core/domain/entities/ShoppingCart";
import type { Product } from "../../core/domain/entities/Product";
import {LocalStorageService} from "../../infrastructure/services/LocalStorageService";
import {AuthContext} from "./AuthContext";
import {CartService} from "../../core/services/CartService";
import appConfig from "../../config/appConfig";
import CacheService from "../../infrastructure/services/CacheService";

// Tipos para las notificaciones del carrito
export enum NotificationType {
	SUCCESS = "success",
	ERROR = "error",
	INFO = "info",
	WARNING = "warning",
}

interface CartNotification {
	id: string;
	type: NotificationType;
	message: string;
}

// ✅ NUEVO: Interfaz para manejar códigos de descuento
interface DiscountCode {
	code: string;
	discount_percentage: number;
	discount_amount: number;
	expires_at: string;
}

interface AppliedDiscount {
	discountCode: DiscountCode;
	appliedAt: Date;
}

// Define context interface
interface CartContextProps {
	cart: ShoppingCart | null;
	loading: boolean;
	error: string | null;
	addToCart: (request: AddToCartRequest) => Promise<boolean>;
	removeFromCart: (itemId: number) => Promise<boolean>;
	updateCartItem: (data: CartItemUpdateData) => Promise<boolean>;
	clearCart: () => Promise<boolean>;
	fetchCart: () => Promise<void>;
	itemCount: number;
	totalAmount: number;
	// Propiedades de notificación
	notification: CartNotification | null;
	showNotification: (type: NotificationType, message: string) => void;
	hideNotification: () => void;
	cartItemCount: number;
	// ✅ NUEVAS: Propiedades de código de descuento
	appliedDiscount: AppliedDiscount | null;
	validateDiscountCode: (code: string) => Promise<{ success: boolean; message: string; data?: DiscountCode }>;
	applyDiscountCode: (code: string) => Promise<{ success: boolean; message: string; cart?: ShoppingCart }>;
	removeDiscountCode: () => Promise<{ success: boolean; message: string; cart?: ShoppingCart }>;
}

// Create context with default values
export const CartContext = createContext<CartContextProps>({
	cart: null,
	loading: false,
	error: null,
	addToCart: async () => false,
	removeFromCart: async () => false,
	updateCartItem: async () => false,
	clearCart: async () => false,
	fetchCart: async () => {},
	itemCount: 0,
	totalAmount: 0,
	notification: null,
	showNotification: () => {},
	hideNotification: () => {},
	cartItemCount: 0,
	// ✅ NUEVOS: Valores por defecto para descuentos
	appliedDiscount: null,
	validateDiscountCode: async () => ({ success: false, message: "Not implemented" }),
	applyDiscountCode: async () => ({ success: false, message: "Not implemented" }),
	removeDiscountCode: async () => ({ success: false, message: "Not implemented" }),
});

// Storage service instance
const storageService = new LocalStorageService();
const cartService = new CartService();

// Cache keys y tiempos
const CACHE_KEYS = {
	CART_USER: "cart_user_data",
	CART_GUEST: "cart_guest_data",
};

const CACHE_TIMES = {
	CART: 3 * 60 * 1000, // 3 minutos
};

// Provider component
interface CartProviderProps {
	children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({children}) => {
	const [cart, setCart] = useState<ShoppingCart | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [itemCount, setItemCount] = useState<number>(0);
	const [totalAmount, setTotalAmount] = useState<number>(0);
	const [notification, setNotification] = useState<CartNotification | null>(
		null
	);
	// ✅ NUEVO: Estado para descuentos
	const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);

	const {isAuthenticated} = useContext(AuthContext);

	// Referencias para controlar el flujo
	const isInitialized = useRef(false);
	const lastCartString = useRef("");
	const isAuthenticatedRef = useRef(isAuthenticated);
	const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const fetchCartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isFetchingRef = useRef(false);
	const cartUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Actualizar el ref cuando cambia isAuthenticated
	useEffect(() => {
		isAuthenticatedRef.current = isAuthenticated;
	}, [isAuthenticated]);

	// Función para mostrar una notificación
	const showNotification = useCallback(
		(type: NotificationType, message: string) => {
			if (notificationTimeoutRef.current) {
				clearTimeout(notificationTimeoutRef.current);
			}

			setNotification({
				id: Date.now().toString(),
				type,
				message,
			});

			notificationTimeoutRef.current = setTimeout(() => {
				setNotification(null);
				notificationTimeoutRef.current = null;
			}, 3000);
		},
		[]
	);

	// Función para ocultar manualmente la notificación
	const hideNotification = useCallback(() => {
		if (notificationTimeoutRef.current) {
			clearTimeout(notificationTimeoutRef.current);
			notificationTimeoutRef.current = null;
		}
		setNotification(null);
	}, []);

	// Limpiar temporizadores al desmontar
	useEffect(() => {
		return () => {
			if (notificationTimeoutRef.current) {
				clearTimeout(notificationTimeoutRef.current);
			}
			if (fetchCartTimeoutRef.current) {
				clearTimeout(fetchCartTimeoutRef.current);
			}
			if (cartUpdateTimeoutRef.current) {
				clearTimeout(cartUpdateTimeoutRef.current);
			}
		};
	}, []);

	// Invalidar cache relacionado con carrito
	const invalidateCartCache = useCallback(() => {
		CacheService.removeItem(CACHE_KEYS.CART_USER);
		CacheService.removeItem(CACHE_KEYS.CART_GUEST);
		CacheService.removeItem("header_counters");
		console.log("🗑️ Cart cache invalidated");
	}, []);

	// Calcular el número total de elementos en el carrito (sumando cantidades)
	const calculateTotalItems = useCallback((cartItems: CartItem[]): number => {
		if (!cartItems || cartItems.length === 0) return 0;
		return cartItems.reduce((total, item) => total + item.quantity, 0);
	}, []);

	// ✅ FUNCIÓN SIMPLE PARA CARGAR EL CARRITO (como funcionaba antes)
	const fetchCartFromAPI = useCallback(async () => {
		if (isFetchingRef.current) return null;

		isFetchingRef.current = true;

		try {
			setLoading(true);
			setError(null);

			// ✅ VERIFICAR CACHE PRIMERO
			const cacheKey = isAuthenticatedRef.current
				? CACHE_KEYS.CART_USER
				: CACHE_KEYS.CART_GUEST;
			const cachedCart = CacheService.getItem(cacheKey);

			if (cachedCart) {
				console.log("📦 Using cached cart data");
				setCart(cachedCart);
				setItemCount(cachedCart.items ? cachedCart.items.length : 0);
				setTotalAmount(cachedCart.total || 0);
				lastCartString.current = JSON.stringify(cachedCart);
				setLoading(false);
				isFetchingRef.current = false;
				return cachedCart;
			}

			console.log("🌐 Fetching cart from API...");
			// ✅ USAR EL CARTSERVICE SIMPLE ORIGINAL
			const response = await cartService.getCart();

			if (response && response.status === "success" && response.data) {
				// ✅ CONVERTIR DATOS DE LA API AL FORMATO DEL ESTADO (simple)
				const cartData: ShoppingCart = {
					id: response.data.id,
					total: response.data.total,
					items: response.data.items.map((item) => {
						const product = item.product as Product || {} as Product;

						return {
							id: item.id,
							productId: product.id || 0,
							quantity: item.quantity,
							price: item.price,
							subtotal: item.subtotal,
							attributes: item.attributes,
							
							// ✅ INCLUIR INFORMACIÓN DE DESCUENTOS SI VIENE DEL BACKEND
							final_price: item.final_price || item.price,
							original_price: item.original_price || item.price,
							volume_discount_percentage: item.volume_discount_percentage || 0,
							volume_savings: item.volume_savings || 0,
							discount_label: item.discount_label || undefined,
							
							product: {
								id: product.id || 0,
								name: product.name || "Producto sin nombre",
								slug: product.slug,
								price: product.price || 0,
								final_price: product.final_price ?? product.price ?? 0,
								discount_percentage: product.discount_percentage ?? 0,
								rating: product.rating ?? 0,
								rating_count: product.rating_count ?? 0,
								image: (product.main_image || product.image || (product.images && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].original || product.images[0].medium || product.images[0].thumbnail) : undefined)),
								main_image: (product.main_image || product.image || (product.images && product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].original || product.images[0].medium || product.images[0].thumbnail) : undefined)),
								stockAvailable: product.stock || 0,
								sellerId: product.sellerId || product.seller_id || (product.seller ? product.seller.id : undefined) || product.user_id,
								seller_id: product.seller_id || product.sellerId || (product.seller ? product.seller.id : undefined) || product.user_id,
								seller: product.seller,
								user_id: product.user_id,
								stock: product.stock || 0,
								is_in_stock: product.is_in_stock ?? true,
							},
						};
					}),
					item_count: response.data.item_count || 0,
					
					// ✅ INCLUIR INFORMACIÓN DE DESCUENTOS A NIVEL DE CARRITO SI VIENE
					subtotal: response.data.subtotal || response.data.total,
					total_volume_savings: response.data.total_volume_savings || 0,
					volume_discounts_applied: response.data.volume_discounts_applied || false,
				};

				// ✅ GUARDAR EN CACHE
				CacheService.setItem(cacheKey, cartData, CACHE_TIMES.CART);

				// Calcular la suma total de cantidades
				const totalQuantities = calculateTotalItems(cartData.items);
				const itemCountValue = response.data.item_count || totalQuantities;

				setCart(cartData);
				setItemCount(itemCountValue);
				setTotalAmount(cartData.total);
				lastCartString.current = JSON.stringify(cartData);

				console.log("✅ Cart loaded successfully:", {
					itemCount: itemCountValue,
					total: cartData.total,
					items: cartData.items.length,
					volume_discounts_applied: cartData.volume_discounts_applied
				});

				return cartData;
			}

			throw new Error("Formato de respuesta de carrito inválido");
		} catch (error) {
			console.error("Error al obtener carrito desde la API:", error);
			setError(
				error instanceof Error ? error.message : "Error al obtener carrito"
			);

			// Intentar usar caché local en caso de error
			const localCart = storageService.getItem(appConfig.storage.cartKey);
			if (localCart) {
				try {
					const parsedCart =
						typeof localCart === "string" ? JSON.parse(localCart) : localCart;
					setCart(parsedCart);
					lastCartString.current = JSON.stringify(parsedCart);
					const totalItems = calculateTotalItems(parsedCart.items || []);
					setItemCount(totalItems);
					setTotalAmount(parsedCart.total || 0);
				} catch (e) {
					console.error("Error al usar caché local del carrito:", e);
				}
			}
			return null;
		} finally {
			setLoading(false);
			isFetchingRef.current = false;
		}
	}, [calculateTotalItems]);

	// Cargar carrito (desde API o localStorage)
	const fetchCart = useCallback(async () => {
		if (fetchCartTimeoutRef.current) {
			clearTimeout(fetchCartTimeoutRef.current);
		}

		fetchCartTimeoutRef.current = setTimeout(async () => {
			if (isAuthenticatedRef.current) {
				await fetchCartFromAPI();
			} else {
				// Usuario no autenticado, usar carrito local
				const localCart = storageService.getItem(appConfig.storage.cartKey);
				if (localCart) {
					try {
						const parsedCart =
							typeof localCart === "string" ? JSON.parse(localCart) : localCart;
						setCart(parsedCart);
						lastCartString.current = JSON.stringify(parsedCart);
						const totalItems = calculateTotalItems(parsedCart.items || []);
						setItemCount(totalItems);
						setTotalAmount(parsedCart.total || 0);
					} catch (e) {
						console.error("Error al parsear carrito del localStorage:", e);
					}
				} else {
					// No hay carrito local, crear uno vacío
					const emptyCart: ShoppingCart = {
						id: 0,
						items: [],
						total: 0,
					};
					setCart(emptyCart);
					setItemCount(0);
					setTotalAmount(0);
				}
			}
			fetchCartTimeoutRef.current = null;
		}, 100);
	}, [fetchCartFromAPI, calculateTotalItems]);

	// Initialize cart only when needed (not on mount)
	useEffect(() => {
		// No auto-fetch on mount - only fetch when explicitly requested
		isInitialized.current = true;
	}, [isAuthenticated]);

	// Update derived states when cart changes
	useEffect(() => {
		if (!cart) {
			setItemCount(0);
			setTotalAmount(0);
			return;
		}

		if (cartUpdateTimeoutRef.current) {
			clearTimeout(cartUpdateTimeoutRef.current);
		}

		cartUpdateTimeoutRef.current = setTimeout(() => {
			const totalItems = cart.items ? cart.items.length : 0;

			if (itemCount !== totalItems) {
				setItemCount(totalItems);
			}

			if (totalAmount !== cart.total) {
				setTotalAmount(cart.total);
			}

			// Sincronizar con localStorage para usuarios anónimos
			const cartString = JSON.stringify(cart);
			if (
				!isAuthenticatedRef.current &&
				cartString !== lastCartString.current
			) {
				storageService.setItem(appConfig.storage.cartKey, cartString);
				lastCartString.current = cartString;
			}

			cartUpdateTimeoutRef.current = null;
		}, 100);
	}, [cart, calculateTotalItems, itemCount, totalAmount]);

	// Add item to cart - versión local
	const addToCartLocal = useCallback(
		async (request: AddToCartRequest): Promise<boolean> => {
			try {
				if (!cart) return false;

				const existingItemIndex = cart.items.findIndex(
					(item) => item.productId === request.productId
				);

				let updatedCart: ShoppingCart;

				if (existingItemIndex >= 0) {
					const updatedItems = [...cart.items];
					updatedItems[existingItemIndex].quantity += request.quantity;
					updatedItems[existingItemIndex].subtotal =
						updatedItems[existingItemIndex].price *
						updatedItems[existingItemIndex].quantity;

					const newTotal = updatedItems.reduce(
						(sum, item) => sum + item.subtotal,
						0
					);

					updatedCart = {
						...cart,
						items: updatedItems,
						total: newTotal,
					};
				} else {
					const price = 0;
					const newItem: CartItem = {
						id: Date.now(),
						productId: request.productId,
						quantity: request.quantity,
						price: price,
						subtotal: price * request.quantity,
					};

					const newItems = [...cart.items, newItem];
					const newTotal = newItems.reduce(
						(sum, item) => sum + item.subtotal,
						0
					);

					updatedCart = {
						...cart,
						items: newItems,
						total: newTotal,
					};
				}

				setCart(updatedCart);
				lastCartString.current = JSON.stringify(updatedCart);
				return true;
			} catch (err) {
				console.error("Error al añadir producto al carrito:", err);
				return false;
			}
		},
		[cart]
	);

	// Add item to cart
	const addToCart = useCallback(
		async (request: AddToCartRequest): Promise<boolean> => {
			if (!isAuthenticatedRef.current) {
				const result = await addToCartLocal(request);
				await fetchCart();
				return result;
			}
			try {
				setLoading(true);
				const response = await cartService.addToCart(request);
				if (response && response.status === "success") {
					invalidateCartCache();
					await fetchCart();
					return true;
				}
				throw new Error(response?.message || "No se pudo agregar al carrito");
			} catch (err) {
				console.error("Error al agregar producto al carrito:", err);
				setError(
					err instanceof Error
						? err.message
						: "Error al agregar producto al carrito"
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[addToCartLocal, fetchCart, invalidateCartCache]
	);

	// Remove item from cart - versión local
	const removeFromCartLocal = useCallback(
		async (itemId: number): Promise<boolean> => {
			try {
				if (!cart) return false;

				const updatedItems = cart.items.filter((item) => item.id !== itemId);
				const newTotal = updatedItems.reduce(
					(sum, item) => sum + item.subtotal,
					0
				);

				const updatedCart = {
					...cart,
					items: updatedItems,
					total: newTotal,
				};

				setCart(updatedCart);
				lastCartString.current = JSON.stringify(updatedCart);
				return true;
			} catch (err) {
				console.error("Error al eliminar producto del carrito:", err);
				return false;
			}
		},
		[cart]
	);

	// Remove item from cart
	const removeFromCart = useCallback(
		async (itemId: number): Promise<boolean> => {
			if (!isAuthenticatedRef.current) {
				const result = await removeFromCartLocal(itemId);
				await fetchCart();
				return result;
			}
			try {
				setLoading(true);
				const response = await cartService.removeFromCart(itemId);
				if (response && response.status === "success") {
					invalidateCartCache();
					await fetchCart();
					return true;
				}
				throw new Error(response?.message || "No se pudo eliminar del carrito");
			} catch (err) {
				console.error("Error al eliminar producto del carrito:", err);
				setError(
					err instanceof Error
						? err.message
						: "Error al eliminar producto del carrito"
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[removeFromCartLocal, fetchCart, invalidateCartCache]
	);

	// Update cart item quantity - versión local
	const updateCartItemLocal = useCallback(
		async (data: CartItemUpdateData): Promise<boolean> => {
			try {
				if (!cart) return false;

				const updatedItems = cart.items.map((item) => {
					if (item.id === data.itemId) {
						return {
							...item,
							quantity: data.quantity,
							subtotal: item.price * data.quantity,
						};
					}
					return item;
				});

				const newTotal = updatedItems.reduce(
					(sum, item) => sum + item.subtotal,
					0
				);

				const updatedCart = {
					...cart,
					items: updatedItems,
					total: newTotal,
				};

				setCart(updatedCart);
				lastCartString.current = JSON.stringify(updatedCart);
				return true;
			} catch (err) {
				console.error("Error al actualizar producto del carrito:", err);
				return false;
			}
		},
		[cart]
	);

	// Update cart item quantity
	const updateCartItem = useCallback(
		async (data: CartItemUpdateData): Promise<boolean> => {
			if (!isAuthenticatedRef.current) {
				const result = await updateCartItemLocal(data);
				await fetchCart();
				return result;
			}
			try {
				setLoading(true);
				const response = await cartService.updateCartItem(
					data.itemId,
					data.quantity
				);
				if (response && response.status === "success") {
					invalidateCartCache();
					await fetchCart();
					return true;
				}
				throw new Error(
					response?.message || "No se pudo actualizar el carrito"
				);
			} catch (err) {
				console.error("Error al actualizar producto del carrito:", err);
				setError(
					err instanceof Error
						? err.message
						: "Error al actualizar producto del carrito"
				);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[updateCartItemLocal, fetchCart, invalidateCartCache]
	);

	// Clear entire cart - versión local
	const clearCartLocal = useCallback(async (): Promise<boolean> => {
		try {
			if (!cart) return false;

			const emptyCart = {
				id: cart.id,
				items: [],
				total: 0,
			};

			setCart(emptyCart);
			lastCartString.current = JSON.stringify(emptyCart);

			storageService.setItem(
				appConfig.storage.cartKey,
				JSON.stringify(emptyCart)
			);
			return true;
		} catch (err) {
			console.error("Error al vaciar carrito:", err);
			return false;
		}
	}, [cart]);

	// Clear entire cart
	const clearCart = useCallback(async (): Promise<boolean> => {
		if (!isAuthenticatedRef.current) {
			const result = await clearCartLocal();
			await fetchCart();
			return result;
		}
		try {
			setLoading(true);
			const response = await cartService.clearCart();
			if (response && response.status === "success") {
				// ✅ OPTIMIZADO: Solo invalidar cache, no refetch (el context se actualiza automáticamente)
				invalidateCartCache();
				return true;
			}
			throw new Error(response?.message || "No se pudo vaciar el carrito");
		} catch (err) {
			console.error("Error al vaciar carrito:", err);
			setError(err instanceof Error ? err.message : "Error al vaciar carrito");
			return false;
		} finally {
			setLoading(false);
		}
	}, [clearCartLocal, fetchCart, invalidateCartCache]);

	// ✅ NUEVO: Validar código de descuento
	const validateDiscountCode = useCallback(async (code: string): Promise<{ success: boolean; message: string; data?: DiscountCode }> => {
		try {
			setLoading(true);
			const response = await cartService.validateDiscountCode(code);
			
			if (response && response.status === "success") {
				return {
					success: true,
					message: response.message || "Código válido",
					data: response.data
				};
			}
			
			return {
				success: false,
				message: response?.message || "Código de descuento inválido"
			};
		} catch (error: any) {
			console.error("Error validating discount code:", error);
			return {
				success: false,
				message: error.response?.data?.message || error.message || "Error al validar código de descuento"
			};
		} finally {
			setLoading(false);
		}
	}, []);

	// ✅ NUEVO: Aplicar código de descuento
	const applyDiscountCode = useCallback(async (code: string): Promise<{ success: boolean; message: string; cart?: ShoppingCart }> => {
		try {
			setLoading(true);
			const response = await cartService.applyDiscountCode(code);
			
			if (response && response.status === "success") {
				// Actualizar cart state con datos del response
				if (response.data?.cart) {
					setCart(response.data.cart);
					lastCartString.current = JSON.stringify(response.data.cart);
				}
				
				// Guardar información del descuento aplicado
				if (response.data?.discount_code) {
					setAppliedDiscount({
						discountCode: response.data.discount_code,
						appliedAt: new Date()
					});
				}
				
				// Invalidar cache
				invalidateCartCache();
				
				return {
					success: true,
					message: response.message || "Descuento aplicado exitosamente",
					cart: response.data?.cart
				};
			}
			
			return {
				success: false,
				message: response?.message || "No se pudo aplicar el código de descuento"
			};
		} catch (error: any) {
			console.error("Error applying discount code:", error);
			return {
				success: false,
				message: error.response?.data?.message || error.message || "Error al aplicar código de descuento"
			};
		} finally {
			setLoading(false);
		}
	}, [invalidateCartCache]);

	// ✅ NUEVO: Remover código de descuento
	const removeDiscountCode = useCallback(async (): Promise<{ success: boolean; message: string; cart?: ShoppingCart }> => {
		try {
			setLoading(true);
			const response = await cartService.removeDiscountCode();
			
			if (response && response.status === "success") {
				// Actualizar cart state
				if (response.data?.cart) {
					setCart(response.data.cart);
					lastCartString.current = JSON.stringify(response.data.cart);
				}
				
				// Limpiar descuento aplicado
				setAppliedDiscount(null);
				
				// Invalidar cache
				invalidateCartCache();
				
				return {
					success: true,
					message: response.message || "Descuento removido exitosamente",
					cart: response.data?.cart
				};
			}
			
			return {
				success: false,
				message: response?.message || "No se pudo remover el código de descuento"
			};
		} catch (error: any) {
			console.error("Error removing discount code:", error);
			return {
				success: false,
				message: error.response?.data?.message || error.message || "Error al remover código de descuento"
			};
		} finally {
			setLoading(false);
		}
	}, [invalidateCartCache]);

	return (
		<CartContext.Provider
			value={{
				cart,
				loading,
				error,
				addToCart,
				removeFromCart,
				updateCartItem,
				clearCart,
				fetchCart,
				itemCount,
				totalAmount,
				notification,
				showNotification,
				hideNotification,
				cartItemCount: itemCount,
				// ✅ NUEVOS: Propiedades de código de descuento
				appliedDiscount,
				validateDiscountCode,
				applyDiscountCode,
				removeDiscountCode,
			}}
		>
			{children}
			{/* Renderizar notificación si existe */}
			{notification && (
				<div className="fixed bottom-4 right-4 z-50 max-w-sm">
					<div
						className={`px-4 py-3 rounded-lg shadow-lg flex items-center ${
							notification.type === NotificationType.SUCCESS
								? "bg-green-600 text-white"
								: notification.type === NotificationType.ERROR
									? "bg-red-500 text-white"
									: notification.type === NotificationType.WARNING
										? "bg-yellow-500 text-white"
										: "bg-blue-500 text-white"
						}`}
					>
						<span className="flex-1">{notification.message}</span>
						<button onClick={hideNotification} className="ml-2 text-white">
							×
						</button>
					</div>
				</div>
			)}
		</CartContext.Provider>
	);
};

export const useCartWithNotifications = () => {
	const context = useContext(CartContext);
	if (!context) {
		throw new Error(
			"useCartWithNotifications debe usarse dentro de un CartProvider"
		);
	}
	return context;
};

export default CartProvider;