import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	AddToCartRequest,
	ShoppingCartResponse,
} from "../domain/entities/ShoppingCart";

/**
 * Servicio optimizado para gestionar las operaciones del carrito de compras
 * ✅ Eliminadas consultas adicionales para seller_id que causaban lentitud
 */
export class CartService {
	/**
	 * Obtiene el carrito del usuario actual
	 * ✅ SIN ENRIQUECIMIENTO COSTOSO - más rápido y eficiente
	 */
	async getCart(): Promise<ShoppingCartResponse> {
		try {
			console.log("CartService: Obteniendo carrito del usuario");

			const response = await ApiClient.get<ShoppingCartResponse>(
				API_ENDPOINTS.CART.GET
			);

			console.log("CartService: Respuesta del carrito:", response);

			// ✅ RETORNAR DIRECTAMENTE SIN ENRIQUECIMIENTO
			// El header ya no depende de estos datos adicionales
			// Si se necesita seller_id, se puede hacer en componentes específicos bajo demanda

			return response;
		} catch (error) {
			console.error("CartService: Error al obtener carrito:", error);

			// Devolver un carrito vacío en caso de error
			return {
				status: "error",
				message:
					error instanceof Error ? error.message : "Error al obtener carrito",
				data: {
					id: 0,
					total: 0,
					items: [],
					item_count: 0,
				},
			};
		}
	}

	/**
	 * Añade un producto al carrito
	 * @param request Datos del producto a añadir
	 */
	async addToCart(request: AddToCartRequest): Promise<any> {
		try {
			console.log("CartService: Añadiendo producto al carrito:", request);

			// Convertir formato del request para el backend
			const apiRequest = {
				product_id: request.productId,
				quantity: request.quantity,
				attributes: request.attributes,
			};

			const response = await ApiClient.post(
				API_ENDPOINTS.CART.ADD_ITEM,
				apiRequest
			);

			console.log("CartService: Producto añadido al carrito:", response);

			return response;
		} catch (error) {
			console.error("CartService: Error al añadir al carrito:", error);
			throw error;
		}
	}

	/**
	 * Elimina un producto del carrito
	 * @param itemId ID del item a eliminar
	 */
	async removeFromCart(itemId: number): Promise<any> {
		try {
			console.log(`CartService: Eliminando producto ${itemId} del carrito`);

			const response = await ApiClient.delete(
				API_ENDPOINTS.CART.REMOVE_ITEM(itemId)
			);

			console.log(
				`CartService: Producto ${itemId} eliminado del carrito:`,
				response
			);

			return response;
		} catch (error) {
			console.error(
				`CartService: Error al eliminar producto ${itemId} del carrito:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Actualiza la cantidad de un producto en el carrito
	 * @param itemId ID del item a actualizar
	 * @param quantity Nueva cantidad
	 */
	async updateCartItem(itemId: number, quantity: number): Promise<any> {
		try {
			console.log(
				`CartService: Actualizando cantidad de producto ${itemId} a ${quantity}`
			);

			const response = await ApiClient.put(
				API_ENDPOINTS.CART.UPDATE_ITEM(itemId),
				{quantity}
			);

			console.log(
				`CartService: Cantidad actualizada para producto ${itemId}:`,
				response
			);

			return response;
		} catch (error) {
			console.error(
				`CartService: Error al actualizar cantidad de producto ${itemId}:`,
				error
			);
			throw error;
		}
	}

	/**
	 * Vacía el carrito por completo
	 */
	async clearCart(): Promise<any> {
		try {
			console.log("CartService: Vaciando carrito");

			const response = await ApiClient.post(API_ENDPOINTS.CART.EMPTY);

			console.log("CartService: Carrito vaciado:", response);

			return response;
		} catch (error) {
			console.error("CartService: Error al vaciar carrito:", error);
			throw error;
		}
	}
}

export default CartService;
