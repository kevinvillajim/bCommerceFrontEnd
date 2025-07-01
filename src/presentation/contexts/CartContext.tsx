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
import {LocalStorageService} from "../../infrastructure/services/LocalStorageService";
import {AuthContext} from "./AuthContext";
import {CartService} from "../../core/services/CartService";
import appConfig from "../../config/appConfig";

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
});

// Storage service instance
const storageService = new LocalStorageService();
const cartService = new CartService();

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

	const {isAuthenticated} = useContext(AuthContext);

	// Referencias para controlar el flujo
	const isInitialized = useRef(false);
	const lastCartString = useRef("");
	const isAuthenticatedRef = useRef(isAuthenticated);
	const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const fetchCartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isFetchingRef = useRef(false);

	// FIX: Control de actualización y debounce
	const cartUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Actualizar el ref cuando cambia isAuthenticated
	useEffect(() => {
		isAuthenticatedRef.current = isAuthenticated;
	}, [isAuthenticated]);

	// Función para mostrar una notificación
	const showNotification = useCallback(
		(type: NotificationType, message: string) => {
			// Limpiar cualquier temporizador existente
			if (notificationTimeoutRef.current) {
				clearTimeout(notificationTimeoutRef.current);
			}

			// Crear y mostrar la nueva notificación
			setNotification({
				id: Date.now().toString(),
				type,
				message,
			});

			// Establecer temporizador para ocultar la notificación después de 3 segundos
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

	// Calcular el número total de elementos en el carrito (sumando cantidades)
	const calculateTotalItems = useCallback((cartItems: CartItem[]): number => {
		if (!cartItems || cartItems.length === 0) return 0;
		return cartItems.reduce((total, item) => total + item.quantity, 0);
	}, []);

	// Función para cargar el carrito desde la API
	const fetchCartFromAPI = useCallback(async () => {
		// FIX: Evitar múltiples peticiones simultáneas
		if (isFetchingRef.current) return null;

		isFetchingRef.current = true;

		try {
			setLoading(true);
			const response = await cartService.getCart();

			if (response && response.status === "success" && response.data) {
				// Convertir datos de la API al formato de nuestro estado
				const cartData: ShoppingCart = {
					id: response.data.id,
					total: response.data.total,
					items: response.data.items.map((item) => ({
						id: item.id,
						productId: item.product.id,
						quantity: item.quantity,
						price: item.price,
						subtotal: item.subtotal,
						attributes: item.attributes,
						product: {
							// ✅ CORREGIDO - Usar valores seguros con fallbacks
							id: item.product.id,
							name: item.product.name,
							slug: item.product.slug,
							price: item.product.price,
							final_price: item.product.final_price || item.product.price, // ✅ CORREGIDO
							discount_percentage: item.product.discount_percentage || 0, // ✅ CORREGIDO
							rating: item.product.rating || 0, // ✅ CORREGIDO
							rating_count: item.product.rating_count || 0, // ✅ CORREGIDO
							image: item.product.main_image || item.product.image,
							stockAvailable: item.product.stock,
							sellerId: item.product.seller_id || item.product.sellerId,
							seller_id: item.product.seller_id,
						},
					})),
					item_count: response.data.item_count || 0,
				};

				// Calcular la suma total de cantidades
				const totalQuantities = calculateTotalItems(cartData.items);
				const itemCountValue = response.data.item_count || totalQuantities;

				// FIX: Actualización atómica del estado para evitar renderizaciones parciales
				setCart(cartData);
				setItemCount(itemCountValue);
				setTotalAmount(cartData.total);
				lastCartString.current = JSON.stringify(cartData);

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
					// Calcular totales
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
		// FIX: Implementar debounce para evitar múltiples llamadas simultáneas
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
						// Calcular totales
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
		}, 100); // Pequeño debounce de 100ms
	}, [fetchCartFromAPI, calculateTotalItems]);

	// Initialize cart on mount or when auth state changes
	useEffect(() => {
		// Si ya inicializamos, solo actualizamos cuando cambie isAuthenticated
		if (
			isInitialized.current &&
			isAuthenticatedRef.current === isAuthenticated
		) {
			return;
		}

		fetchCart();
		isInitialized.current = true;
	}, [isAuthenticated, fetchCart]);

	// FIX: Reducir las actualizaciones periódicas a un intervalo mayor
	useEffect(() => {
		// Cargar carrito al montar el componente
		fetchCart();

		// Actualizar el carrito en intervalos regulares pero más espaciados
		const cartRefreshInterval = setInterval(() => {
			if (isAuthenticatedRef.current && !isFetchingRef.current) {
				fetchCart();
			}
		}, 180000); // Cada 3 minutos en lugar de cada minuto

		// Limpiar intervalo al desmontar
		return () => {
			clearInterval(cartRefreshInterval);
		};
	}, [fetchCart]); // Sin dependencias para que solo se ejecute al montar

	// Update derived states when cart changes - FIX: Incluir lógica para evitar ciclos
	useEffect(() => {
		if (!cart) {
			setItemCount(0);
			setTotalAmount(0);
			return;
		}

		// FIX: Implementar debounce para evitar múltiples actualizaciones en cascada
		if (cartUpdateTimeoutRef.current) {
			clearTimeout(cartUpdateTimeoutRef.current);
		}

		cartUpdateTimeoutRef.current = setTimeout(() => {
			// Calcular contador de items - sumando las cantidades
			const totalItems = cart.items ? cart.items.length : 0;

			// Verificar si el itemCount ha cambiado realmente
			if (itemCount !== totalItems) {
				setItemCount(totalItems);
			}

			// Verificar si el totalAmount ha cambiado realmente
			if (totalAmount !== cart.total) {
				setTotalAmount(cart.total);
			}

			// Sincronizar con localStorage para usuarios anónimos
			// Solo guardar si el carrito ha cambiado realmente
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

				// Verificar si el producto ya existe en el carrito
				const existingItemIndex = cart.items.findIndex(
					(item) => item.productId === request.productId
				);

				let updatedCart: ShoppingCart;

				if (existingItemIndex >= 0) {
					// Actualizar item existente
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
					// Añadir nuevo item
					// Nota: en una app real, obtendríamos el precio del producto del servidor
					const price = 0; // Obtener dinámicamente en app real
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
		[addToCartLocal, fetchCart]
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
		[removeFromCartLocal, fetchCart]
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
		[updateCartItemLocal, fetchCart]
	);

	// Clear entire cart - versión local
	const clearCartLocal = useCallback(async (): Promise<boolean> => {
		try {
			if (!cart) return false;

			// Crear un carrito vacío manteniendo el ID
			const emptyCart = {
				id: cart.id,
				items: [],
				total: 0,
			};

			setCart(emptyCart);
			lastCartString.current = JSON.stringify(emptyCart);

			// Actualizar localStorage
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
				await fetchCart();
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
	}, [clearCartLocal, fetchCart]);

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

// Custom hook para usar el contexto de carrito con notificaciones
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
