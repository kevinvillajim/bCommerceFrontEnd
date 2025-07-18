// src/presentation/hooks/useProducts.ts - INTEGRACIÓN CON CACHE DE IMÁGENES
import {useState, useCallback, useEffect} from "react";
import {ProductService} from "../../core/services/ProductService";
import {useCacheInvalidation} from "./useReactiveCache";
import CacheService from "../../infrastructure/services/CacheService";
import appConfig from "../../config/appConfig";
import type {
	Product,
	ProductDetail,
	ProductListResponse,
} from "../../core/domain/entities/Product";
import type {ExtendedProductFilterParams} from "../types/ProductFilterParams";

// ✅ IMPORTAR HOOK OPTIMIZADO DE IMÁGENES
import {useImageCache} from "./useImageCache";

// Crear instancia del servicio de productos
const productService = new ProductService();

// Crear una clave de caché basada en los parámetros de filtro
const getCacheKey = (params?: ExtendedProductFilterParams): string => {
	if (!params) return "products_default";

	// Crear una copia para no modificar el original
	const paramsForKey = {...params};

	// Asegurarse de que categoryIds se maneje correctamente
	if (paramsForKey.categoryIds) {
		// Ordenar para asegurar consistencia independientemente del orden
		paramsForKey.categoryIds = [...paramsForKey.categoryIds].sort(
			(a, b) => a - b
		);
	}

	return `products_${JSON.stringify(paramsForKey)}`;
};

/**
 * Hook optimizado para operaciones de productos con cache reactivo e imágenes optimizadas
 */
export const useProducts = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [product, setProduct] = useState<ProductDetail | null>(null);
	const [meta, setMeta] = useState<{
		total: number;
		limit: number;
		offset: number;
	} | null>(null);
	const [isInitialized, setIsInitialized] = useState<boolean>(false);

	// Hook para invalidación de cache
	const {invalidate} = useCacheInvalidation();

	// ✅ HOOK PARA CACHE DE IMÁGENES OPTIMIZADO
	const {getMultipleImageUrls, preloadImages} = useImageCache();

	// ✅ FUNCIÓN OPTIMIZADA PARA ADAPTAR PRODUCTOS CON CACHE DE IMÁGENES
	const adaptProduct = useCallback((apiProduct: any): Product => {
		// Verificar que sea un objeto para prevenir errores
		if (!apiProduct || typeof apiProduct !== "object") {
			console.error("Producto inválido para adaptar:", apiProduct);
			return {} as Product;
		}

		// Procesar imágenes de manera más robusta - SIMPLIFICADO
		let processedImages: string[] = [];

		// Prioridad 1: array images
		if (Array.isArray(apiProduct.images) && apiProduct.images.length > 0) {
			processedImages = apiProduct.images
				.map((img: any) => {
					if (typeof img === "string") {
						return img;
					}
					if (typeof img === "object" && img !== null) {
						// Intentar extraer URL del objeto imagen
						return (
							img.original ||
							img.large ||
							img.medium ||
							img.thumbnail ||
							img.url ||
							img.path ||
							img.src ||
							""
						);
					}
					return "";
				})
				.filter(Boolean); // Filtrar strings vacíos
		}

		// Prioridad 2: campo image (singular)
		if (processedImages.length === 0 && apiProduct.image) {
			processedImages = [apiProduct.image];
		}

		// Prioridad 3: campo main_image
		if (processedImages.length === 0 && apiProduct.main_image) {
			processedImages = [apiProduct.main_image];
		}

		// Prioridad 4: campo featured_image
		if (processedImages.length === 0 && apiProduct.featured_image) {
			processedImages = [apiProduct.featured_image];
		}

		// Prioridad 5: campo thumbnail
		if (processedImages.length === 0 && apiProduct.thumbnail) {
			processedImages = [apiProduct.thumbnail];
		}

		// Mapear propiedades para manejar tanto camelCase como snake_case
		const adaptedProduct: Product = {
			id: apiProduct.id,
			userId: apiProduct.userId || apiProduct.user_id,
			categoryId: apiProduct.categoryId || apiProduct.category_id,
			name: apiProduct.name,
			slug: apiProduct.slug,
			description: apiProduct.description || "",
			price: Number(apiProduct.price || 0),
			stock: Number(apiProduct.stock || 0),
			weight: apiProduct.weight,
			width: apiProduct.width,
			height: apiProduct.height,
			depth: apiProduct.depth,
			dimensions: apiProduct.dimensions,
			colors: apiProduct.colors,
			sizes: apiProduct.sizes,
			tags: apiProduct.tags,
			sku: apiProduct.sku,
			attributes: apiProduct.attributes,
			images: processedImages,
			featured: Boolean(apiProduct.featured),
			published: Boolean(apiProduct.published),
			status: apiProduct.status || "active",
			viewCount: apiProduct.viewCount || apiProduct.view_count || 0,
			salesCount: apiProduct.salesCount || apiProduct.sales_count || 0,
			discountPercentage:
				apiProduct.discountPercentage || apiProduct.discount_percentage || 0,
			finalPrice: apiProduct.finalPrice || apiProduct.final_price,
			isInStock: apiProduct.isInStock || apiProduct.is_in_stock,
			rating: apiProduct.rating || apiProduct.rating_avg,
			ratingCount: apiProduct.rating_count || apiProduct.rating_avg_count,
			createdAt: apiProduct.createdAt || apiProduct.created_at,
			updatedAt: apiProduct.updatedAt || apiProduct.updated_at,
		};

		return adaptedProduct;
	}, []);

	// ✅ FUNCIÓN PARA PRECARGAR IMÁGENES DE PRODUCTOS
	const preloadProductImages = useCallback(
		async (products: Product[]): Promise<void> => {
			try {
				// Extraer las primeras imágenes de cada producto y convertir a strings
				const productImageObjects = products.map((product) => {
					// Convertir ProductImage a string si es necesario - solo propiedades existentes
					const getImageString = (img: any): string | undefined => {
						if (typeof img === "string") return img;
						if (img && typeof img === "object") {
							// Solo usar propiedades que existen en ProductImage
							return img.url || img.original || img.medium || img.thumbnail;
						}
						return undefined;
					};

					const imageString = product.images?.[0]
						? getImageString(product.images[0])
						: undefined;
					// Filtrar undefined values del array
					const imagesArray = product.images
						? product.images
								.map(getImageString)
								.filter((img): img is string => img !== undefined)
						: undefined;

					return {
						image: imageString,
						images: imagesArray,
					};
				});

				// Obtener URLs optimizadas usando el hook de cache de imágenes
				const imageUrls = getMultipleImageUrls(productImageObjects, "medium");

				// Precargar las imágenes de forma asíncrona (no bloquear la UI)
				if (imageUrls.length > 0) {
					setTimeout(() => {
						preloadImages(imageUrls).catch((error) =>
							console.log("⚠️ Error precargando imágenes (no crítico):", error)
						);
					}, 100);
				}
			} catch (error) {
				console.log("⚠️ Error configurando precarga de imágenes:", error);
			}
		},
		[getMultipleImageUrls, preloadImages]
	);

	// Inicializar el hook
	useEffect(() => {
		if (!isInitialized) {
			// Verificar la caché para productos destacados
			const cachedFeatured = CacheService.getItem("products_featured");
			if (cachedFeatured) {
				setProducts(cachedFeatured.data || []);
				setMeta(cachedFeatured.meta || null);

				// ✅ PRECARGAR IMÁGENES DE PRODUCTOS DESTACADOS
				if (cachedFeatured.data?.length > 0) {
					preloadProductImages(cachedFeatured.data);
				}
			}
			setIsInitialized(true);
		}
	}, [isInitialized, preloadProductImages]);

	/**
	 * Recupera productos con filtros opcionales
	 */
	const fetchProducts = useCallback(
		async (
			filterParams?: ExtendedProductFilterParams
		): Promise<ProductListResponse | null> => {
			setLoading(true);
			setError(null);

			try {
				const cacheKey = getCacheKey(filterParams);

				// Intentar obtener datos de caché primero
				const cachedData = CacheService.getItem(cacheKey);
				if (cachedData) {
					console.log("💾 Usando datos en caché");
					setProducts(cachedData.data || []);
					setMeta(cachedData.meta || null);
					setLoading(false);

					// ✅ PRECARGAR IMÁGENES DE PRODUCTOS DESDE CACHE
					if (cachedData.data?.length > 0) {
						preloadProductImages(cachedData.data);
					}

					return cachedData;
				}

				console.log("🌐 Realizando petición a la API");
				const response = await productService.getProducts(filterParams);

				if (response) {
					// Adaptar los datos si es necesario
					let adaptedData: Product[] = [];

					if (Array.isArray(response.data)) {
						adaptedData = response.data.map(adaptProduct);
					} else if (response.data && typeof response.data === "object") {
						adaptedData = [adaptProduct(response.data)];
					} else if (Array.isArray(response)) {
						adaptedData = response.map(adaptProduct);
					}

					const result: ProductListResponse = {
						data: adaptedData,
						meta: response.meta || {
							total: adaptedData.length,
							limit: filterParams?.limit || 10,
							offset: filterParams?.offset || 0,
						},
					};

					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						result,
						appConfig.cache.productCacheTime
					);

					setProducts(adaptedData);
					setMeta(result.meta);

					// ✅ PRECARGAR IMÁGENES DE PRODUCTOS NUEVOS
					if (adaptedData.length > 0) {
						preloadProductImages(adaptedData);
					}

					return result;
				} else {
					setProducts([]);
					setMeta({total: 0, limit: 0, offset: 0});
					return {data: [], meta: {total: 0, limit: 0, offset: 0}};
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al obtener productos";
				setError(errorMessage);
				setProducts([]);
				setMeta({total: 0, limit: 0, offset: 0});
				return null;
			} finally {
				setLoading(false);
			}
		},
		[adaptProduct, preloadProductImages]
	);

	/**
	 * Recupera detalles de un producto por ID
	 */
	const fetchProductById = useCallback(
		async (id: number): Promise<ProductDetail | null> => {
			setLoading(true);
			setError(null);

			const cacheKey = `product_${id}`;

			try {
				// Intentar obtener de caché primero
				const cachedProduct = CacheService.getItem(cacheKey);

				if (cachedProduct) {
					console.log(`💾 Usando producto en caché con ID ${id}`);
					setProduct(cachedProduct);
					setLoading(false);
					return cachedProduct;
				}

				console.log(`🌐 Obteniendo producto con ID ${id} desde API`);
				const productDetailResponse = await productService.getProductById(id);

				if (productDetailResponse) {
					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						productDetailResponse,
						appConfig.cache.productCacheTime
					);

					setProduct(productDetailResponse);

					// ✅ PRECARGAR IMÁGENES DEL PRODUCTO INDIVIDUAL
					if (
						productDetailResponse.images &&
						productDetailResponse.images.length > 0
					) {
						// Convertir ProductImage[] a string[] - solo propiedades existentes
						const imageStrings = productDetailResponse.images
							.map((img) => {
								if (typeof img === "string") return img;
								if (img && typeof img === "object") {
									// Solo usar propiedades que existen en ProductImage
									return (
										img.url || img.original || img.medium || img.thumbnail || ""
									);
								}
								return "";
							})
							.filter(Boolean);

						const imageUrls = getMultipleImageUrls(
							[
								{
									images: imageStrings,
								},
							],
							"original"
						);

						// Precargar todas las imágenes del producto para galería
						setTimeout(() => {
							preloadImages(imageUrls).catch((error) =>
								console.log(
									"⚠️ Error precargando imágenes del producto:",
									error
								)
							);
						}, 50);
					}

					return productDetailResponse;
				}

				setProduct(null);
				return null;
			} catch (err) {
				console.error("❌ Error obteniendo detalles de producto:", err);
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener detalles del producto";
				setError(errorMessage);
				setProduct(null);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[getMultipleImageUrls, preloadImages]
	);

	/**
	 * Recupera detalles de un producto por slug
	 */
	const fetchProductBySlug = useCallback(
		async (slug: string): Promise<ProductDetail | null> => {
			setLoading(true);
			setError(null);

			const cacheKey = `product_slug_${slug}`;

			try {
				// Intentar obtener de caché primero
				const cachedProduct = CacheService.getItem(cacheKey);

				if (cachedProduct) {
					console.log(`💾 Usando producto en caché con slug ${slug}`);
					setProduct(cachedProduct);
					setLoading(false);
					return cachedProduct;
				}

				console.log(`🌐 Obteniendo producto con slug ${slug} desde API`);
				const productDetailResponse =
					await productService.getProductBySlug(slug);

				if (productDetailResponse) {
					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						productDetailResponse,
						appConfig.cache.productCacheTime
					);

					setProduct(productDetailResponse);

					// ✅ PRECARGAR IMÁGENES DEL PRODUCTO POR SLUG
					if (
						productDetailResponse.images &&
						productDetailResponse.images.length > 0
					) {
						// Convertir ProductImage[] a string[] - solo propiedades existentes
						const imageStrings = productDetailResponse.images
							.map((img) => {
								if (typeof img === "string") return img;
								if (img && typeof img === "object") {
									// Solo usar propiedades que existen en ProductImage
									return (
										img.url || img.original || img.medium || img.thumbnail || ""
									);
								}
								return "";
							})
							.filter(Boolean);

						const imageUrls = getMultipleImageUrls(
							[
								{
									images: imageStrings,
								},
							],
							"original"
						);

						setTimeout(() => {
							preloadImages(imageUrls).catch((error) =>
								console.log(
									"⚠️ Error precargando imágenes del producto:",
									error
								)
							);
						}, 50);
					}

					return productDetailResponse;
				}

				setProduct(null);
				return null;
			} catch (err) {
				console.error(
					"❌ Error obteniendo detalles de producto por slug:",
					err
				);
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener detalles del producto";
				setError(errorMessage);
				setProduct(null);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[getMultipleImageUrls, preloadImages]
	);

	/**
	 * Recupera productos destacados
	 */
	const fetchFeaturedProducts = useCallback(
		async (limit: number = 8): Promise<Product[]> => {
			setLoading(true);
			setError(null);

			const cacheKey = `products_featured_${limit}`;

			try {
				// Intentar obtener de caché primero
				const cachedProducts = CacheService.getItem(cacheKey);

				if (cachedProducts) {
					console.log(
						`💾 Usando productos destacados en caché (límite: ${limit})`
					);
					setProducts(cachedProducts);
					setLoading(false);

					// ✅ PRECARGAR IMÁGENES DE PRODUCTOS DESTACADOS DESDE CACHE
					preloadProductImages(cachedProducts);

					return cachedProducts;
				}

				console.log(
					`🌐 Obteniendo productos destacados desde API (límite: ${limit})`
				);
				const featuredProducts =
					await productService.getFeaturedProducts(limit);

				if (featuredProducts && featuredProducts.length > 0) {
					// Adaptar datos si es necesario
					const adaptedProducts = featuredProducts.map(adaptProduct);

					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						adaptedProducts,
						appConfig.cache.productCacheTime
					);

					setProducts(adaptedProducts);

					// ✅ PRECARGAR IMÁGENES DE PRODUCTOS DESTACADOS NUEVOS
					preloadProductImages(adaptedProducts);

					return adaptedProducts;
				}

				setProducts([]);
				return [];
			} catch (err) {
				console.error("❌ Error obteniendo productos destacados:", err);
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener productos destacados";
				setError(errorMessage);
				setProducts([]);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[adaptProduct, preloadProductImages]
	);

	/**
	 * Recupera productos relacionados
	 */
	const fetchRelatedProducts = useCallback(
		async (productId: number, limit: number = 4): Promise<Product[]> => {
			setLoading(true);
			setError(null);

			const cacheKey = `products_related_${productId}_${limit}`;

			try {
				// Intentar obtener de caché primero
				const cachedProducts = CacheService.getItem(cacheKey);

				if (cachedProducts) {
					console.log(
						`💾 Usando productos relacionados en caché para producto ${productId}`
					);
					setLoading(false);

					// ✅ PRECARGAR IMÁGENES DE PRODUCTOS RELACIONADOS DESDE CACHE
					preloadProductImages(cachedProducts);

					return cachedProducts;
				}

				console.log(
					`🌐 Obteniendo productos relacionados desde API para producto ${productId}`
				);
				const relatedProducts = await productService.getRelatedProducts(
					productId,
					limit
				);

				if (relatedProducts && relatedProducts.length > 0) {
					// Adaptar datos si es necesario
					const adaptedProducts = relatedProducts.map(adaptProduct);

					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						adaptedProducts,
						appConfig.cache.productCacheTime
					);

					// ✅ PRECARGAR IMÁGENES DE PRODUCTOS RELACIONADOS NUEVOS
					preloadProductImages(adaptedProducts);

					return adaptedProducts;
				}

				return [];
			} catch (err) {
				console.error("❌ Error obteniendo productos relacionados:", err);
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener productos relacionados";
				setError(errorMessage);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[adaptProduct, preloadProductImages]
	);

	/**
	 * Registra visualización de producto
	 */
	const trackProductView = useCallback(
		async (productId: number): Promise<void> => {
			try {
				await productService.trackProductView(productId);
			} catch (err) {
				console.error("❌ Error registrando visualización de producto:", err);
			}
		},
		[]
	);

	/**
	 * Limpia la caché de productos usando cache reactivo
	 */
	const clearProductCache = useCallback(
		(productId?: number): void => {
			if (productId) {
				// Limpiar caché específica de un producto
				CacheService.removeItem(`product_${productId}`);
				invalidate(`product_${productId}`);
				console.log(`🗑️ Caché del producto ${productId} eliminada`);
			} else {
				// Invalidar todos los patrones de productos
				invalidate("products_*");
				invalidate("product_*");
				console.log("🗑️ Toda la caché de productos invalidada");
			}
		},
		[invalidate]
	);

	return {
		loading,
		error,
		products,
		product,
		meta,
		fetchProducts,
		fetchProductById,
		fetchProductBySlug,
		fetchFeaturedProducts,
		fetchRelatedProducts,
		trackProductView,
		clearProductCache,
		// ✅ NUEVAS FUNCIONALIDADES DE CACHE DE IMÁGENES
		preloadProductImages,
	};
};

export default useProducts;
