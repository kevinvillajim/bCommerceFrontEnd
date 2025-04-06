import React, {
	createContext,
	useState,
	useEffect,
	useCallback,
	useContext,
	useRef,
} from "react";
import type {ReactNode} from "react";
import type {AxiosResponse} from "axios";
import type {
	ShoppingCart,
	CartItem,
	AddToCartRequest,
	CartItemUpdateData,
} from "../../core/domain/entities/ShoppingCart";
import {LocalStorageService} from "../../infrastructure/services/LocalStorageService";
import {AuthContext} from "../contexts/AuthContext";
import axiosInstance from "../../infrastructure/api/axiosConfig";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import appConfig from "../../config/appConfig";

// Define context interface
interface CartContextProps {
	cart: ShoppingCart | null;
	loading: boolean;
	error: string | null;
	addToCart: (request: AddToCartRequest) => Promise<boolean>;
	removeFromCart: (itemId: number) => Promise<boolean>;
	updateCartItem: (data: CartItemUpdateData) => Promise<boolean>;
	clearCart: () => Promise<boolean>;
	itemCount: number;
	totalAmount: number;
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
	itemCount: 0,
	totalAmount: 0,
});

// Storage service instance
const storageService = new LocalStorageService();

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

	const {isAuthenticated} = useContext(AuthContext);

	// Referencias para controlar el flujo
	const isInitialized = useRef(false);
	const lastCartString = useRef("");
	const isAuthenticatedRef = useRef(isAuthenticated);

	// Actualizar el ref cuando cambia isAuthenticated
	useEffect(() => {
		isAuthenticatedRef.current = isAuthenticated;
	}, [isAuthenticated]);

	// Initialize cart on mount or when auth state changes - SOLO UNA VEZ
	useEffect(() => {
		// Si ya inicializamos, solo actualizamos cuando cambie isAuthenticated
		if (
			isInitialized.current &&
			isAuthenticatedRef.current === isAuthenticated
		) {
			return;
		}

		const initCart = async () => {
			const token = storageService.getItem(appConfig.storage.authTokenKey);

			if (token && isAuthenticated) {
				try {
					setLoading(true);

					const response: AxiosResponse<any> = await axiosInstance.get(
						API_ENDPOINTS.CART.GET
					);

					// Analizar la estructura de respuesta
					let cartData = null;

					// Estructura esperada según documentación: { status: "success", data: {...} }
					if (response && response.data && response.data.data) {
						cartData = response.data.data;
					}
					// Estructura alternativa: { data: {...} }
					else if (response && response.data) {
						cartData = response.data;
					}

					if (cartData) {
						setCart(cartData);
						// Actualizar referencia de último carrito conocido
						lastCartString.current = JSON.stringify(cartData);
					}
				} catch (err) {
					console.error("Error al obtener el carrito desde la API:", err);

					// Intentar recuperar de localStorage como fallback
					const localCart = storageService.getItem("cart");
					if (localCart) {
						try {
							const parsedCart =
								typeof localCart === "string"
									? JSON.parse(localCart)
									: localCart;
							setCart(parsedCart);
							lastCartString.current = JSON.stringify(parsedCart);
						} catch (e) {
							console.error(
								"Error al parsear el carrito desde localStorage:",
								e
							);
							storageService.removeItem("cart");
						}
					}
				} finally {
					setLoading(false);
				}
			} else {
				// Usuario no autenticado, usar carrito local
				const localCart = storageService.getItem("cart");
				if (localCart) {
					try {
						const parsedCart =
							typeof localCart === "string" ? JSON.parse(localCart) : localCart;
						setCart(parsedCart);
						lastCartString.current = JSON.stringify(parsedCart);
					} catch (e) {
						console.error("Error al parsear el carrito desde localStorage:", e);
						storageService.removeItem("cart");
					}
				}
			}

			// Marcar como inicializado
			isInitialized.current = true;
		};

		initCart();
	}, [isAuthenticated]);

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
		if (
			!storageService.getItem(appConfig.storage.authTokenKey) &&
			cartString !== lastCartString.current
		) {
			storageService.setItem("cart", cartString);
			lastCartString.current = cartString;
		}
	}, [cart]);

	// Métodos optimizados (dejando sólo los cambios necesarios)

	// Add item to cart
	const addToCart = useCallback(
		async (request: AddToCartRequest): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token && isAuthenticatedRef.current) {
					// Para usuarios autenticados, usar API
					const apiRequest = {
						product_id: request.productId,
						quantity: request.quantity,
						attributes: request.attributes,
					};

					const response = await axiosInstance.post(
						API_ENDPOINTS.CART.ADD_ITEM,
						apiRequest
					);

					// Verificar respuesta según la estructura documentada
					if (
						response.data &&
						response.data.status === "success" &&
						response.data.data &&
						response.data.data.cart
					) {
						setCart(response.data.data.cart);
						lastCartString.current = JSON.stringify(response.data.data.cart);
						return true;
					}
					// Estructura alternativa
					else if (response.data && response.data.cart) {
						setCart(response.data.cart);
						lastCartString.current = JSON.stringify(response.data.cart);
						return true;
					} else {
						console.error(
							"Estructura de respuesta de carrito no reconocida:",
							response.data
						);
						return false;
					}
				} else {
					// Para usuarios anónimos, actualizar carrito local
					const currentCart = cart || {
						id: Date.now(),
						userId: 0,
						items: [],
						total: 0,
					};

					// Verificar si el producto ya existe en el carrito
					const existingItemIndex = currentCart.items.findIndex(
						(item) => item.productId === request.productId
					);

					let updatedCart: ShoppingCart;

					if (existingItemIndex >= 0) {
						// Actualizar item existente
						const updatedItems = [...currentCart.items];
						updatedItems[existingItemIndex].quantity += request.quantity;
						updatedItems[existingItemIndex].subtotal =
							updatedItems[existingItemIndex].price *
							updatedItems[existingItemIndex].quantity;

						const newTotal = updatedItems.reduce(
							(sum, item) => sum + item.subtotal,
							0
						);

						updatedCart = {
							...currentCart,
							items: updatedItems,
							total: newTotal,
						};
					} else {
						// Añadir nuevo item
						const price = 0; // Obtener dinámicamente en app real
						const newItem: CartItem = {
							id: Date.now(),
							cartId: currentCart.id,
							productId: request.productId,
							quantity: request.quantity,
							price: price,
							subtotal: price * request.quantity,
						};

						const newItems = [...currentCart.items, newItem];
						const newTotal = newItems.reduce(
							(sum, item) => sum + item.subtotal,
							0
						);

						updatedCart = {
							...currentCart,
							items: newItems,
							total: newTotal,
						};
					}

					setCart(updatedCart);
					lastCartString.current = JSON.stringify(updatedCart);
					return true;
				}
			} catch (err: any) {
				const errorMsg =
					err instanceof Error
						? err.message
						: "Error al añadir producto al carrito";
				setError(errorMsg);
				console.error("Error al añadir producto al carrito:", err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[cart]
	);

	// Remove item from cart (optimizado pero manteniendo la lógica principal)
	const removeFromCart = useCallback(
		async (itemId: number): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token && isAuthenticatedRef.current) {
					// Para usuarios autenticados, usar API
					const response = await axiosInstance.delete(
						API_ENDPOINTS.CART.REMOVE_ITEM(itemId)
					);

					// Verificar respuesta y actualizar carrito
					if (
						response.data &&
						response.data.status === "success" &&
						response.data.data &&
						response.data.data.cart
					) {
						setCart(response.data.data.cart);
						lastCartString.current = JSON.stringify(response.data.data.cart);
						return true;
					}
					// Estructura alternativa
					else if (response.data && response.data.cart) {
						setCart(response.data.cart);
						lastCartString.current = JSON.stringify(response.data.cart);
						return true;
					} else {
						console.error(
							"Estructura de respuesta de carrito no reconocida:",
							response.data
						);
						return false;
					}
				} else {
					// Para usuarios anónimos, actualizar carrito local
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
				}
			} catch (err: any) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al eliminar producto del carrito";
				setError(errorMessage);
				console.error("Error al eliminar producto del carrito:", err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[cart]
	);

	// Update cart item quantity (optimizado pero manteniendo la lógica principal)
	const updateCartItem = useCallback(
		async (data: CartItemUpdateData): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token && isAuthenticatedRef.current) {
					// Para usuarios autenticados, usar API
					const response = await axiosInstance.put(
						API_ENDPOINTS.CART.UPDATE_ITEM(data.itemId),
						{quantity: data.quantity}
					);

					if (
						response.data &&
						response.data.status === "success" &&
						response.data.data &&
						response.data.data.cart
					) {
						setCart(response.data.data.cart);
						lastCartString.current = JSON.stringify(response.data.data.cart);
						return true;
					}
					// Estructura alternativa
					else if (response.data && response.data.cart) {
						setCart(response.data.cart);
						lastCartString.current = JSON.stringify(response.data.cart);
						return true;
					} else {
						console.error(
							"Estructura de respuesta de carrito no reconocida:",
							response.data
						);
						return false;
					}
				} else {
					// Para usuarios anónimos, actualizar carrito local
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
				}
			} catch (err: any) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al actualizar producto del carrito";
				setError(errorMessage);
				console.error("Error al actualizar producto del carrito:", err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[cart]
	);

	// Clear entire cart (optimizado pero manteniendo la lógica principal)
	const clearCart = useCallback(async (): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = storageService.getItem(appConfig.storage.authTokenKey);

			if (token && isAuthenticatedRef.current) {
				// Para usuarios autenticados, usar API
				const response = await axiosInstance.post(API_ENDPOINTS.CART.EMPTY);

				if (response.data && response.data.status === "success") {
					// La respuesta puede contener un carrito vacío o podemos crear uno
					if (response.data.data && response.data.data.cart) {
						setCart(response.data.data.cart);
						lastCartString.current = JSON.stringify(response.data.data.cart);
					} else {
						// Crear un carrito vacío con la estructura correcta
						const emptyCart = {
							id: cart?.id || 0,
							userId: cart?.userId || 0,
							items: [],
							total: 0,
						};
						setCart(emptyCart);
						lastCartString.current = JSON.stringify(emptyCart);
					}
					return true;
				} else {
					console.error(
						"Estructura de respuesta de carrito no reconocida:",
						response.data
					);
					return false;
				}
			} else {
				// Para usuarios anónimos, limpiar carrito local
				if (cart) {
					// Crear un carrito vacío manteniendo el ID
					const emptyCart = {
						id: cart.id,
						userId: cart.userId,
						items: [],
						total: 0,
					};

					setCart(emptyCart);
					lastCartString.current = JSON.stringify(emptyCart);

					// Actualizar localStorage
					storageService.setItem("cart", JSON.stringify(emptyCart));
				}

				return true;
			}
		} catch (err: any) {
			const errorMessage =
				err instanceof Error ? err.message : "Error al vaciar carrito";
			setError(errorMessage);
			console.error("Error al vaciar carrito:", err);
			return false;
		} finally {
			setLoading(false);
		}
	}, [cart]);

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
				itemCount,
				totalAmount,
			}}
		>
			{children}
		</CartContext.Provider>
	);
};

export default CartProvider;
