/**
 * Utilidades para manejar información del vendedor
 */

/**
 * Extrae el ID del vendedor de un producto
 * Compatible con diferentes estructuras de datos donde podría estar almacenado
 * @param product Objeto de producto que puede contener información del vendedor
 * @returns ID del vendedor o undefined si no se encuentra
 */
export const getSellerIdFromProduct = (product: any): number | undefined => {
	if (!product) return undefined;

	// Intentar diferentes propiedades donde podría estar el ID del vendedor
	const sellerId =
		product.seller_id ||
		product.sellerId ||
		(product.seller ? product.seller.id : undefined);

	return typeof sellerId === "number" ? sellerId : undefined;
};

/**
 * Extrae el ID del vendedor del primer elemento del carrito
 * @param cartItems Elementos del carrito
 * @returns ID del vendedor o undefined si no se encuentra
 */
export const getSellerIdFromCart = (cartItems: any[]): number | undefined => {
	if (!cartItems || !cartItems.length) return undefined;

	const firstItem = cartItems[0];

	// Primero intentar obtener del item directamente
	const directSellerId = firstItem.seller_id || firstItem.sellerId;
	if (directSellerId) return directSellerId;

	// Si no está en el item, buscar en el producto asociado
	if (firstItem.product) {
		return getSellerIdFromProduct(firstItem.product);
	}

	return undefined;
};

/**
 * Obtiene información básica del vendedor de un producto
 * @param product Objeto de producto
 * @returns Objeto con información del vendedor o null si no se encuentra
 */
export const getSellerInfoFromProduct = (
	product: any
): {id?: number; name?: string} | null => {
	if (!product) return null;

	// Intentar obtener el objeto vendedor, si existe
	const seller = product.seller || {};

	// Intentar diferentes propiedades donde podría estar el ID y nombre
	const sellerId = product.seller_id || product.sellerId || seller.id;
	const sellerName = seller.name || seller.storeName;

	if (sellerId || sellerName) {
		return {
			id: sellerId,
			name: sellerName || `Vendedor #${sellerId}`,
		};
	}

	return null;
};

export default {
	getSellerIdFromProduct,
	getSellerIdFromCart,
	getSellerInfoFromProduct,
};
