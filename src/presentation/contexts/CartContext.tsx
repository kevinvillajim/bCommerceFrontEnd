import React, {
	createContext,
	useState,
	useEffect,
	useCallback,
	useContext,
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

	// Initialize cart on mount
	useEffect(() => {
		const initCart = async () => {
			const token = storageService.getItem(appConfig.storage.authTokenKey);
			console.log("Token obtenido:", token);

			if (token && isAuthenticated) {
				try {
					console.log(
						"📦 Usuario autenticado, intentando obtener el carrito desde la API"
					);
					setLoading(true);

					const response: AxiosResponse<any> = await axiosInstance.get(
						API_ENDPOINTS.CART.GET
					);
					console.log("Respuesta de la API del carrito:", response);

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
						console.log("Datos del carrito obtenidos de la API:", cartData);
						setCart(cartData);
					} else {
						throw new Error("Estructura de respuesta de carrito no reconocida");
					}
				} catch (err: any) {
					console.error("Error al obtener el carrito desde la API:", err);
					console.log("Intentando obtener el carrito desde localStorage...");

					const localCart = storageService.getItem("cart");
					console.log("Valor obtenido de localStorage:", localCart);

					if (localCart) {
						try {
							const parsedCart =
								typeof localCart === "string"
									? JSON.parse(localCart)
									: localCart;
							console.log(
								"Carrito parseado correctamente desde localStorage:",
								parsedCart
							);
							setCart(parsedCart);
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
				console.log("📦 Usuario no autenticado, usando carrito local");

				const localCart = storageService.getItem("cart");
				console.log("Valor obtenido de localStorage:", localCart);

				if (localCart) {
					try {
						const parsedCart =
							typeof localCart === "string" ? JSON.parse(localCart) : localCart;
						console.log(
							"Carrito parseado correctamente desde localStorage:",
							parsedCart
						);
						setCart(parsedCart);
					} catch (e) {
						console.error("Error al parsear el carrito desde localStorage:", e);
						storageService.removeItem("cart");
					}
				}
			}
		};

		initCart();
	}, [isAuthenticated]);

	// Update derived states when cart changes
	useEffect(() => {
		if (cart) {
			// Calcular contador de items
			const count = cart.items
				? cart.items.reduce((sum, item) => sum + item.quantity, 0)
				: 0;
			setItemCount(count);

			// Usar el total proporcionado por la API o calcular
			setTotalAmount(cart.total || 0);

			// Sincronizar con localStorage para usuarios anónimos
			if (!storageService.getItem(appConfig.storage.authTokenKey)) {
				storageService.setItem("cart", JSON.stringify(cart));
			}
		} else {
			setItemCount(0);
			setTotalAmount(0);
		}
	}, [cart]);

	// Add item to cart
	const addToCart = useCallback(
		async (request: AddToCartRequest): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token && isAuthenticated) {
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

					console.log("Respuesta al añadir producto al carrito:", response);

					// Verificar respuesta según la estructura documentada
					if (
						response.data &&
						response.data.status === "success" &&
						response.data.data &&
						response.data.data.cart
					) {
						setCart(response.data.data.cart);
						return true;
					}
					// Estructura alternativa
					else if (response.data && response.data.cart) {
						setCart(response.data.cart);
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

						setCart({
							...currentCart,
							items: updatedItems,
							total: newTotal,
						});
					} else {
						// Añadir nuevo item (en una app real, deberías obtener el precio del producto de algún lado)
						// Esto es simplificado - deberías obtener el precio del producto
						const price = 0; // Esto debería venir de datos del producto
						const newItem: CartItem = {
							id: Date.now(), // ID generado localmente
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

						setCart({
							...currentCart,
							items: newItems,
							total: newTotal,
						});
					}

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
		[cart, isAuthenticated]
	);

	// Remove item from cart
	const removeFromCart = useCallback(
		async (itemId: number): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token && isAuthenticated) {
					// Para usuarios autenticados, usar API
					const response = await axiosInstance.delete(
						API_ENDPOINTS.CART.REMOVE_ITEM(itemId)
					);

					console.log("Respuesta al eliminar producto del carrito:", response);

					// Verificar respuesta según la estructura documentada
					if (
						response.data &&
						response.data.status === "success" &&
						response.data.data &&
						response.data.data.cart
					) {
						setCart(response.data.data.cart);
						return true;
					}
					// Estructura alternativa
					else if (response.data && response.data.cart) {
						setCart(response.data.cart);
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

					setCart({
						...cart,
						items: updatedItems,
						total: newTotal,
					});

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
		[cart, isAuthenticated]
	);

	// Update cart item quantity
	const updateCartItem = useCallback(
		async (data: CartItemUpdateData): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const token = storageService.getItem(appConfig.storage.authTokenKey);

				if (token && isAuthenticated) {
					// Para usuarios autenticados, usar API
					const response = await axiosInstance.put(
						API_ENDPOINTS.CART.UPDATE_ITEM(data.itemId),
						{quantity: data.quantity}
					);

					console.log(
						"Respuesta al actualizar producto del carrito:",
						response
					);

					// Verificar respuesta según la estructura documentada
					if (
						response.data &&
						response.data.status === "success" &&
						response.data.data &&
						response.data.data.cart
					) {
						setCart(response.data.data.cart);
						return true;
					}
					// Estructura alternativa
					else if (response.data && response.data.cart) {
						setCart(response.data.cart);
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

					setCart({
						...cart,
						items: updatedItems,
						total: newTotal,
					});

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
		[cart, isAuthenticated]
	);

	// Clear entire cart
	const clearCart = useCallback(async (): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const token = storageService.getItem(appConfig.storage.authTokenKey);

			if (token && isAuthenticated) {
				// Para usuarios autenticados, usar API
				const response = await axiosInstance.post(API_ENDPOINTS.CART.EMPTY);

				console.log("Respuesta al vaciar carrito:", response);

				// Verificar respuesta según la estructura documentada
				if (response.data && response.data.status === "success") {
					// La respuesta puede contener un carrito vacío o podemos crear uno
					if (response.data.data && response.data.data.cart) {
						setCart(response.data.data.cart);
					} else {
						// Crear un carrito vacío con la estructura correcta
						setCart({
							id: cart?.id || 0,
							userId: cart?.userId || 0,
							items: [],
							total: 0,
						});
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
					setCart({
						id: cart.id,
						userId: cart.userId,
						items: [],
						total: 0,
					});

					// Actualizar localStorage
					storageService.setItem(
						"cart",
						JSON.stringify({
							id: cart.id,
							userId: cart.userId,
							items: [],
							total: 0,
						})
					);
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
	}, [cart, isAuthenticated]);

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
