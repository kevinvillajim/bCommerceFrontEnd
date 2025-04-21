import {useContext, useState, useCallback} from "react";
import {CartContext} from "../contexts/CartContext";
import {CartService} from "../../core/services/CartService";
import type {
	AddToCartRequest,
	CartItemUpdateData,
} from "../../core/domain/entities/ShoppingCart";
import {useAuth} from "./useAuth";

// Instanciar el servicio del carrito
const cartService = new CartService();

export const useCart = () => {
	const cartContext = useContext(CartContext);
	const [loadingAction, setLoadingAction] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const {isAuthenticated} = useAuth();

	/**
	 * Agrega un producto al carrito
	 * @param request Datos del producto a agregar
	 */
	const addToCartWithAPI = useCallback(
		async (request: AddToCartRequest) => {
			if (!isAuthenticated) {
				// Si no está autenticado, usar la función del contexto local
				return cartContext.addToCart(request);
			}

			setLoadingAction(true);
			setActionError(null);

			try {
				// Llamar al servicio API
				const response = await cartService.addToCart(request);

				if (response && response.status === "success") {
					// Actualizar el carrito completo después de añadir
					await cartContext.fetchCart();
					return true;
				}

				throw new Error(
					response.message || "Error al agregar producto al carrito"
				);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Error al agregar producto al carrito";
				setActionError(errorMessage);
				console.error("Error al agregar producto al carrito:", error);
				return false;
			} finally {
				setLoadingAction(false);
			}
		},
		[isAuthenticated, cartContext]
	);

	/**
	 * Eliminar un producto del carrito
	 * @param itemId ID del item a eliminar
	 */
	const removeFromCartWithAPI = useCallback(
		async (itemId: number) => {
			if (!isAuthenticated) {
				// Si no está autenticado, usar la función del contexto local
				return cartContext.removeFromCart(itemId);
			}

			setLoadingAction(true);
			setActionError(null);

			try {
				// Llamar al servicio API
				const response = await cartService.removeFromCart(itemId);

				if (response && response.status === "success") {
					// Actualizar el carrito completo después de eliminar
					await cartContext.fetchCart();
					return true;
				}

				throw new Error(
					response.message || "Error al eliminar producto del carrito"
				);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Error al eliminar producto del carrito";
				setActionError(errorMessage);
				console.error("Error al eliminar producto del carrito:", error);
				return false;
			} finally {
				setLoadingAction(false);
			}
		},
		[isAuthenticated, cartContext]
	);

	/**
	 * Actualizar cantidad de un producto en el carrito
	 * @param data Datos de actualización (id y cantidad)
	 */
	const updateCartItemWithAPI = useCallback(
		async (data: CartItemUpdateData) => {
			if (!isAuthenticated) {
				// Si no está autenticado, usar la función del contexto local
				return cartContext.updateCartItem(data);
			}

			setLoadingAction(true);
			setActionError(null);

			try {
				// Llamar al servicio API
				const response = await cartService.updateCartItem(
					data.itemId,
					data.quantity
				);

				if (response && response.status === "success") {
					// Actualizar el carrito completo después de actualizar
					await cartContext.fetchCart();
					return true;
				}

				throw new Error(
					response.message || "Error al actualizar producto del carrito"
				);
			} catch (error) {
				const errorMessage =
					error instanceof Error
						? error.message
						: "Error al actualizar producto del carrito";
				setActionError(errorMessage);
				console.error("Error al actualizar producto del carrito:", error);
				return false;
			} finally {
				setLoadingAction(false);
			}
		},
		[isAuthenticated, cartContext]
	);

	/**
	 * Vaciar carrito
	 */
	const clearCartWithAPI = useCallback(async () => {
		if (!isAuthenticated) {
			// Si no está autenticado, usar la función del contexto local
			return cartContext.clearCart();
		}

		setLoadingAction(true);
		setActionError(null);

		try {
			// Llamar al servicio API
			const response = await cartService.clearCart();

			if (response && response.status === "success") {
				// Actualizar el carrito completo después de vaciarlo
				await cartContext.fetchCart();
				return true;
			}

			throw new Error(response.message || "Error al vaciar el carrito");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Error al vaciar el carrito";
			setActionError(errorMessage);
			console.error("Error al vaciar el carrito:", error);
			return false;
		} finally {
			setLoadingAction(false);
		}
	}, [isAuthenticated, cartContext]);

	// Retornar valores y funciones del contexto, pero reemplazando las funciones con nuestras versiones
	return {
		...cartContext,
		addToCart: addToCartWithAPI,
		removeFromCart: removeFromCartWithAPI,
		updateCartItem: updateCartItemWithAPI,
		clearCart: clearCartWithAPI,
		loadingAction,
		actionError,
	};
};

export default useCart;
