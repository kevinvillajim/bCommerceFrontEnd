// src/infrastructure/services/SellerIdResolverService.ts
import ApiClient from "../api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";

// Interfaces para las respuestas esperadas
interface SellerResponse {
	status: string;
	message?: string;
	data: {
		seller_id: number;
	};
}

interface ProductDetailResponse {
	status?: string;
	data: {
		id?: number;
		seller_id?: number;
		user_id?: number;
		sellerId?: number;
		seller?: {
			id?: number;
		};
	};
}

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
	 * @returns seller_id o undefined
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
			const cachedId = this.productSellerCache.get(id);
			if (cachedId !== undefined) {
				result.set(id, cachedId);
			}
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
	 * @returns Map de product_id a seller_id para todos los productos en el carrito
	 */
	public static async resolveSellerIdsForCart(
		cartItems: Array<{productId: number; product?: any}>
	): Promise<Map<number, number>> {
		if (!cartItems || cartItems.length === 0) {
			return new Map();
		}

		// Mapa para asociar productos con sus vendedores
		const sellerMap = new Map<number, number>();

		// Iterar a través de los items del carrito para recopilar seller_ids
		for (const item of cartItems) {
			const product = item.product;
			let sellerId: number | null = null;

			if (product) {
				// Priorizar seller_id del producto si existe
				if (product.seller_id !== undefined) {
					sellerId = Number(product.seller_id);
				} else if (product.seller && product.seller.id !== undefined) {
					sellerId = Number(product.seller.id);
				} else if (product.sellerId !== undefined) {
					sellerId = Number(product.sellerId);
				}
				// Si solo hay user_id, resolver seller_id real
				else if (product.user_id !== undefined) {
					const resolvedId = await this.resolveUserIdToSellerId(
						product.user_id
					);
					if (resolvedId) {
						sellerId = resolvedId;
					}
				}

				// Si encontramos un seller_id, añadirlo al mapa
				if (sellerId) {
					sellerMap.set(item.productId, sellerId);
				} else {
					// Si no se encuentra seller_id, intentar resolverlo
					const resolvedSellerId = await this.resolveSellerIdForProduct(
						item.productId,
						true
					);
					if (resolvedSellerId) {
						sellerMap.set(item.productId, resolvedSellerId);
					}
				}
			} else {
				// Si no hay información de producto, intentar resolver por productId
				const resolvedSellerId = await this.resolveSellerIdForProduct(
					item.productId,
					true
				);
				if (resolvedSellerId) {
					sellerMap.set(item.productId, resolvedSellerId);
				}
			}
		}

		return sellerMap;
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
			const response = await ApiClient.get<ProductDetailResponse>(
				API_ENDPOINTS.PRODUCTS.DETAILS(productId)
			);

			if (response && response.data) {
				const product = response.data;

				// Priorizar seller_id correcto si está disponible
				if (product.seller_id !== undefined) {
					return Number(product.seller_id);
				}

				// Verificar otras posibles propiedades
				if (product.sellerId !== undefined) {
					return Number(product.sellerId);
				}

				if (product.seller && product.seller.id !== undefined) {
					return Number(product.seller.id);
				}

				// Si solo tenemos user_id, intentar resolver a seller_id
				if (product.user_id !== undefined) {
					return await this.resolveUserIdToSellerId(product.user_id);
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
	public static async resolveUserIdToSellerId(
		userId: number
	): Promise<number | undefined> {
		try {
			console.log(`Intentando resolver user_id ${userId} a seller_id...`);

			// // CASO ESPECIAL: Si el user_id es 63, sabemos que el seller_id es 11
			// if (userId === 63) {
			// 	console.log("Caso especial: user_id 63 → seller_id 11");
			// 	return 11;
			// }

			// Continuar con la resolución normal para otros casos
			const response = await ApiClient.get<SellerResponse>(
				API_ENDPOINTS.SELLERS.BY_USER_ID(userId)
			);

			console.log(`Respuesta al resolver user_id ${userId}:`, response);

			// Verificación de la estructura de respuesta
			if (
				response &&
				response.status === "success" &&
				response.data &&
				response.data.seller_id
			) {
				const sellerId = Number(response.data.seller_id);
				console.log(`✅ user_id ${userId} resuelto a seller_id ${sellerId}`);
				return sellerId;
			}

			return undefined;
		} catch (error) {
			console.error(
				`❌ Error al resolver user_id ${userId} a seller_id:`,
				error
			);

			// Si el user_id es 63, devolver 11 como fallback incluso en caso de error
			// if (userId === 63) return 11;

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
