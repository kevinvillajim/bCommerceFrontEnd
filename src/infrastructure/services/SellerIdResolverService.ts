// src/infrastructure/services/SellerIdResolverService.ts
import ApiClient from "../api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

/**
 * Servicio para resolver seller_id cuando no está disponible en el producto
 * Este servicio actúa como una capa de compatibilidad para manejar productos
 * que no tienen seller_id en la respuesta de la API
 */
export class SellerIdResolverService {
	// Caché para almacenar seller_id por producto_id y evitar llamadas API repetidas
	private static productSellerCache: Map<number, number> = new Map();

	// Default seller ID para desarrollo o cuando no se puede resolver de otra manera
	private static defaultSellerId: number = 1;

	/**
	 * Intenta resolver el seller_id para un producto
	 *
	 * @param productId ID del producto
	 * @param useDefault Si debería usar un valor por defecto cuando no se puede resolver
	 * @returns seller_id o undefined si no se puede resolver
	 */
	public static async resolveSellerIdForProduct(
		productId: number,
		useDefault: boolean = true
	): Promise<number | undefined> {
		try {
			// 1. Verificar primero en la caché
			if (this.productSellerCache.has(productId)) {
				return this.productSellerCache.get(productId);
			}

			// 2. Intentar obtener desde la API de producto
			const sellerId = await this.fetchSellerIdFromApi(productId);

			if (sellerId) {
				// Guardar en caché para futuras referencias
				this.productSellerCache.set(productId, sellerId);
				return sellerId;
			}

			// 3. Si no se pudo resolver y useDefault es true, devolver el valor por defecto
			if (useDefault) {
				console.warn(
					`SellerIdResolver: Usando seller_id por defecto (${this.defaultSellerId}) para producto ${productId}`
				);
				return this.defaultSellerId;
			}

			// 4. No se pudo resolver
			return undefined;
		} catch (error) {
			console.error(
				`SellerIdResolver: Error al resolver seller_id para producto ${productId}:`,
				error
			);

			// En caso de error, usar el valor por defecto si está habilitado
			if (useDefault) {
				return this.defaultSellerId;
			}

			return undefined;
		}
	}

	/**
	 * Intenta obtener el seller_id desde diferentes fuentes para varios productos
	 *
	 * @param productIds Array de IDs de productos
	 * @returns Mapa de product_id a seller_id
	 */
	public static async resolveSellerIdsForProducts(
		productIds: number[]
	): Promise<Map<number, number>> {
		const result = new Map<number, number>();

		// Filtrar productos que ya están en caché
		const cachedProducts = productIds.filter((id) =>
			this.productSellerCache.has(id)
		);
		const uncachedProducts = productIds.filter(
			(id) => !this.productSellerCache.has(id)
		);

		// Añadir productos en caché al resultado
		cachedProducts.forEach((id) => {
			result.set(id, this.productSellerCache.get(id)!);
		});

		// Resolver productos no cacheados (podríamos optimizar con una llamada en batch)
		for (const productId of uncachedProducts) {
			const sellerId = await this.resolveSellerIdForProduct(productId);
			if (sellerId) {
				result.set(productId, sellerId);
			}
		}

		return result;
	}

	/**
	 * Resuelve seller_id para todo el carrito
	 *
	 * @param cartItems Items del carrito
	 * @returns seller_id único si todos los productos tienen el mismo vendedor, o undefined
	 */
	public static async resolveSellerIdForCart(
		cartItems: Array<{productId: number; product?: any}>
	): Promise<number | undefined> {
		if (!cartItems || cartItems.length === 0) {
			return undefined;
		}

		// Recolectar todos los IDs de productos
		const productIds = cartItems.map((item) => item.productId);

		// Resolver seller_ids para todos los productos
		const sellerIds = await this.resolveSellerIdsForProducts(productIds);

		// Verificar si todos los productos tienen el mismo seller_id
		const uniqueSellerIds = new Set(sellerIds.values());

		if (uniqueSellerIds.size === 0) {
			// No se pudo resolver ningún seller_id
			return this.defaultSellerId;
		}

		if (uniqueSellerIds.size === 1) {
			// Todos los productos tienen el mismo seller_id
			return Array.from(uniqueSellerIds)[0];
		}

		// Múltiples vendedores - por ahora usamos el del primer producto
		// En una implementación real, esto debería manejarse de otra manera
		console.warn(
			"SellerIdResolver: Múltiples vendedores detectados en el carrito. Usando el primer seller_id."
		);
		return sellerIds.get(productIds[0]) || this.defaultSellerId;
	}

	/**
	 * Intenta obtener el seller_id para un producto desde la API
	 *
	 * @param productId ID del producto
	 * @returns seller_id o undefined
	 */
	private static async fetchSellerIdFromApi(
		productId: number
	): Promise<number | undefined> {
		try {
			// Intentar obtener detalles del producto (esto podría requerir ajustes según tu API)
			const response = await ApiClient.get(
				`${API_ENDPOINTS.PRODUCTS.DETAILS}${productId}`
			) as { data?: any };

			if (response.data) {
				const product = response.data;

				// Intentar extraer el seller_id de varias ubicaciones posibles
				const sellerId =
					product.sellerId ||
					product.seller_id ||
					(product.seller && product.seller.id) ||
					product.user_id;

				if (sellerId) {
					return Number(sellerId);
				}
			}

			return undefined;
		} catch (error) {
			console.error(
				`Error al obtener detalles del producto ${productId}:`,
				error
			);
			return undefined;
		}
	}

	/**
	 * Establece el ID de vendedor por defecto (útil para pruebas)
	 */
	public static setDefaultSellerId(id: number): void {
		this.defaultSellerId = id;
	}

	/**
	 * Limpia la caché de productos-vendedores
	 */
	public static clearCache(): void {
		this.productSellerCache.clear();
	}
}

export default SellerIdResolverService;
