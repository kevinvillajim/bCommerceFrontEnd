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

	// Limpiar temporizador al desmontar
	useEffect(() => {
		return () => {
			if (notificationTimeoutRef.current) {
				clearTimeout(notificationTimeoutRef.current);
			}
		};
	}, []);

	// Función para cargar el carrito desde la API
	const fetchCartFromAPI = useCallback(async () => {
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
							name: item.product.name,
							image: item.product.image,
							slug: item.product.slug,
							stockAvailable: item.product.stock,
						},
					})),
				};

				setCart(cartData);
				setItemCount(response.data.item_count);
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
					const count = parsedCart.items
						? parsedCart.items.reduce(
								(sum: number, item: CartItem) => sum + item.quantity,
								0
							)
						: 0;
					setItemCount(count);
					setTotalAmount(parsedCart.total || 0);
				} catch (e) {
					console.error("Error al usar caché local del carrito:", e);
				}
			}
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	// Cargar carrito (desde API o localStorage)
	const fetchCart = useCallback(async () => {
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
					const count = parsedCart.items
						? parsedCart.items.reduce(
								(sum: number, item: CartItem) => sum + item.quantity,
								0
							)
						: 0;
					setItemCount(count);
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
	}, [fetchCartFromAPI]);

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

	// Update derived states when cart changes
	useEffect(() => {
		if (!cart) {
			setItemCount(0);
			setTotalAmount(0);
			return;
		}

		// Calcular contador de items
		const count = cart.items
			? cart.items.reduce((sum, item) => sum + item.quantity, 0)
			: 0;
		setItemCount(count);

		// Usar el total proporcionado por la API o calcular
		setTotalAmount(cart.total || 0);

		// Sincronizar con localStorage para usuarios anónimos
		// Solo guardar si el carrito ha cambiado realmente
		const cartString = JSON.stringify(cart);
		if (!isAuthenticatedRef.current && cartString !== lastCartString.current) {
			storageService.setItem(appConfig.storage.cartKey, cartString);
			lastCartString.current = cartString;
		}
	}, [cart]);

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
				return addToCartLocal(request);
			}

			// La implementación para usuarios autenticados es manejada por el hook useCart
			// que usará cartService para interactuar con la API
			return true;
		},
		[addToCartLocal]
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
				return removeFromCartLocal(itemId);
			}

			// La implementación para usuarios autenticados es manejada por el hook useCart
			// que usará cartService para interactuar con la API
			return true;
		},
		[removeFromCartLocal]
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
				return updateCartItemLocal(data);
			}

			// La implementación para usuarios autenticados es manejada por el hook useCart
			// que usará cartService para interactuar con la API
			return true;
		},
		[updateCartItemLocal]
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
			return clearCartLocal();
		}

		// La implementación para usuarios autenticados es manejada por el hook useCart
		// que usará cartService para interactuar con la API
		return true;
	}, [clearCartLocal]);

	// Devolver contexto
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
