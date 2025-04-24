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

		// Intentar extraer seller_id real de todos los productos
		const sellerIds: number[] = [];
		for (const item of cartItems) {
			const product = item.product;
			if (product) {
				let sellerId = null;
				if (product.seller_id) {
					sellerId = Number(product.seller_id);
				}
				else if (product.seller && product.seller.id) {
					sellerId = Number(product.seller.id);
				}
				// Si solo hay user_id, resolver seller_id real
				else if (product.user_id) {
					sellerId = await this.resolveUserIdToSellerId(product.user_id);
				}

				// Si el seller_id es igual al user_id, resolver seller_id real
				if (sellerId && product.user_id && sellerId === Number(product.user_id)) {
					const resolved = await this.resolveUserIdToSellerId(product.user_id);
					if (resolved && resolved !== sellerId) {
						sellerId = resolved;
					}
				}

				if (sellerId) {
					sellerIds.push(sellerId);
				}
			}
		}

		const uniqueSellerIds = [...new Set(sellerIds)];
		if (uniqueSellerIds.length === 1) {
			return uniqueSellerIds[0];
		}
		if (uniqueSellerIds.length > 1) {
			console.warn("Múltiples vendedores detectados en el carrito. Usando el primero.");
			return uniqueSellerIds[0];
		}

		// Si no se pudo resolver, usar el método anterior (por productoId)
		const productIds = cartItems.map((item) => item.productId);
		const vendorIds = await this.resolveSellerIdsForProducts(productIds);
		const uniqueVendorIds = new Set(vendorIds.values());
		if (uniqueVendorIds.size === 1) {
			return Array.from(uniqueVendorIds)[0];
		}
		if (uniqueVendorIds.size > 1) {
			console.warn("Múltiples vendedores detectados en el carrito (por productoId). Usando el primero.");
			return vendorIds.get(productIds[0]) || this.defaultSellerId;
		}
		return this.defaultSellerId;
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
			const response = (await ApiClient.get(
				API_ENDPOINTS.PRODUCTS.DETAILS(productId)
			)) as {data?: any};

			if (response.data) {
				const product = response.data;

				// Si ya tenemos el seller_id, usarlo directamente
				if (product.seller_id) {
					return Number(product.seller_id);
				}

				// Si tenemos user_id, resolver a seller_id
				if (product.user_id) {
					return await this.resolveUserIdToSellerId(product.user_id);
				}

				// Verificar otras posibles propiedades
				if (product.sellerId) {
					return await this.resolveUserIdToSellerId(product.sellerId);
				}

				if (product.seller && product.seller.id) {
					return await this.resolveUserIdToSellerId(product.seller.id);
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
	 * Método para convertir un user_id en seller_id utilizando la API
	 *
	 * @param userId ID del usuario
	 * @returns seller_id correspondiente o undefined si no se encuentra
	 */
	private static async resolveUserIdToSellerId(
		userId: number
	): Promise<number | undefined> {
		try {
			// Usamos el endpoint para obtener seller_id por user_id
			const response = (await ApiClient.get(
				API_ENDPOINTS.SELLERS.BY_USER_ID(userId)
			)) as {status?: string; data?: any};

			if (
				response.status === "success" &&
				response.data &&
				response.data.seller_id
			) {
				console.log(
					`SellerIdResolver: user_id ${userId} resuelto a seller_id ${response.data.seller_id}`
				);
				return Number(response.data.seller_id);
			}

			return undefined;
		} catch (error) {
			console.error(`Error al resolver user_id ${userId} a seller_id:`, error);
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
