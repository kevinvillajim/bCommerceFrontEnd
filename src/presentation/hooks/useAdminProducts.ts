// src/presentation/hooks/useAdminProducts.ts

import {useState, useCallback} from "react";
import {useCacheInvalidation} from "./useReactiveCache";
import {AdminProductService} from "../../core/services/AdminProductService";
import CacheService from "../../infrastructure/services/CacheService";
import appConfig from "../../config/appConfig";

// Use Cases
import {GetAllProductsUseCase} from "../../core/useCases/admin/product/GetAllProductsUseCase";
import {CreateProductAsAdminUseCase} from "../../core/useCases/admin/product/CreateProductAsAdminUseCase";
import {UpdateAnyProductUseCase} from "../../core/useCases/admin/product/UpdateAnyProductUseCase";
import {DeleteAnyProductUseCase} from "../../core/useCases/admin/product/DeleteAnyProductUseCase";
import {ToggleProductFeaturedUseCase} from "../../core/useCases/admin/product/ToggleProductFeaturedUseCase";
import {ToggleProductPublishedUseCase} from "../../core/useCases/admin/product/ToggleProductPublishedUseCase";
import {UpdateProductStatusUseCase} from "../../core/useCases/admin/product/UpdateProductStatusUseCase";
import {GetProductsBySellerUseCase} from "../../core/useCases/admin/product/GetProductsBySellerUseCase";
import {GetProductStatsUseCase} from "../../core/useCases/admin/product/GetProductStatsUseCase";

import type {
	Product,
	ProductDetail,
	ProductListResponse,
	ProductCreationData,
	ProductUpdateData,
} from "../../core/domain/entities/Product";
import type {ExtendedProductFilterParams} from "../types/ProductFilterParams";

// Crear instancias del servicio y use cases
const adminProductService = new AdminProductService();

const getAllProductsUseCase = new GetAllProductsUseCase(adminProductService);
const createProductAsAdminUseCase = new CreateProductAsAdminUseCase(
	adminProductService
);
const updateAnyProductUseCase = new UpdateAnyProductUseCase(
	adminProductService
);
const deleteAnyProductUseCase = new DeleteAnyProductUseCase(
	adminProductService
);
const toggleProductFeaturedUseCase = new ToggleProductFeaturedUseCase(
	adminProductService
);
const toggleProductPublishedUseCase = new ToggleProductPublishedUseCase(
	adminProductService
);
const updateProductStatusUseCase = new UpdateProductStatusUseCase(
	adminProductService
);
const getProductsBySellerUseCase = new GetProductsBySellerUseCase(
	adminProductService
);
const getProductStatsUseCase = new GetProductStatsUseCase(adminProductService);

// Función para generar clave de caché
const getAdminCacheKey = (params?: ExtendedProductFilterParams): string => {
	if (!params) return "admin_products_default";
	return `admin_products_${JSON.stringify(params)}`;
};

/**
 * Hook para gestión administrativa de productos
 * Solo para usuarios con rol de administrador
 */
export const useAdminProducts = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [productDetail, setProductDetail] = useState<ProductDetail | null>(
		null
	);
	const [stats, setStats] = useState<any>(null);
	const [meta, setMeta] = useState<{
		total: number;
		limit: number;
		offset: number;
		currentPage?: number;
		totalPages?: number;
	} | null>(null);

	// Hook para invalidación de cache
	const {invalidateAfterMutation} = useCacheInvalidation();

	/**
	 * Función adaptadora para productos
	 */
	const adaptProduct = useCallback((apiProduct: any): Product => {
		if (!apiProduct || typeof apiProduct !== "object") {
			console.error("Producto inválido para adaptar:", apiProduct);
			return {} as Product;
		}

		// Procesar imágenes
		let processedImages: string[] = [];

		// Prioridad 1: main_image (formato actual del backend)
		if (apiProduct.main_image) {
			processedImages = [apiProduct.main_image];
		}
		// Prioridad 2: array images si existe
		else if (Array.isArray(apiProduct.images) && apiProduct.images.length > 0) {
			processedImages = apiProduct.images
				.map((img: any) => {
					if (typeof img === "string") return img;
					if (typeof img === "object" && img !== null) {
						return (
							img.original ||
							img.large ||
							img.medium ||
							img.url ||
							img.path ||
							""
						);
					}
					return "";
				})
				.filter(Boolean);
		}
		// Prioridad 3: campo image individual
		else if (apiProduct.image) {
			processedImages = [apiProduct.image];
		}

		// Procesar tags
		let processedTags: string[] = [];
		if (Array.isArray(apiProduct.tags)) {
			apiProduct.tags.forEach((tag: any) => {
				if (typeof tag === "string") {
					try {
						// Si es un string JSON, parsearlo
						const parsed = JSON.parse(tag);
						if (Array.isArray(parsed)) {
							processedTags.push(...parsed);
						} else {
							processedTags.push(tag);
						}
					} catch {
						// Si no es JSON válido, agregarlo directamente
						processedTags.push(tag);
					}
				}
			});
		}

		const adaptedProduct: Product = {
			id: apiProduct.id,
			userId: apiProduct.user_id,
			sellerId: apiProduct.seller_id,
			categoryId: apiProduct.category_id,
			name: apiProduct.name,
			slug: apiProduct.slug,
			description: apiProduct.description || "",
			shortDescription: apiProduct.short_description,
			price: Number(apiProduct.price || 0),
			finalPrice: Number(apiProduct.final_price || apiProduct.price || 0),
			stock: Number(apiProduct.stock || 0),
			weight: apiProduct.weight,
			width: apiProduct.width,
			height: apiProduct.height,
			depth: apiProduct.depth,
			dimensions: apiProduct.dimensions,
			colors: apiProduct.colors,
			sizes: apiProduct.sizes,
			tags: processedTags,
			sku: apiProduct.sku,
			attributes: apiProduct.attributes,
			images: processedImages,
			featured: Boolean(apiProduct.featured),
			published: Boolean(apiProduct.published ?? true),
			status: apiProduct.status || "active",
			viewCount: apiProduct.view_count || 0,
			salesCount: apiProduct.sales_count || 0,
			discountPercentage: Number(apiProduct.discount_percentage || 0),
			isInStock: Boolean(apiProduct.is_in_stock ?? apiProduct.stock > 0),
			rating: Number(apiProduct.rating || 0),
			ratingCount: Number(apiProduct.rating_count || 0),
			createdAt: apiProduct.created_at,
			updatedAt: apiProduct.updated_at,

			// Campos específicos de admin
			category: apiProduct.category_name
				? {
						id: apiProduct.category_id,
						name: apiProduct.category_name,
					}
				: apiProduct.category,
			seller: apiProduct.seller,
			user: apiProduct.user,
		};

		return adaptedProduct;
	}, []);

	/**
	 * Obtiene todos los productos (como admin)
	 */
	const fetchAllProducts = useCallback(
		async (
			filterParams?: ExtendedProductFilterParams,
			forceRefresh: boolean = false
		): Promise<ProductListResponse | null> => {
			setLoading(true);
			setError(null);

			try {
				const cacheKey = getAdminCacheKey(filterParams);

				// Verificar caché si no se fuerza refresh
				if (!forceRefresh) {
					const cachedData = CacheService.getItem(cacheKey);
					if (cachedData) {
						console.log("💾 useAdminProducts: Usando datos en caché");
						setProducts(cachedData.data || []);
						setMeta(cachedData.meta || null);
						setLoading(false);
						return cachedData;
					}
				}

				console.log("🌐 useAdminProducts: Obteniendo productos desde API");
				const response = await getAllProductsUseCase.execute(filterParams);

				if (response) {
					let adaptedData: Product[] = [];
					let responseMeta = null;

					// Procesar la respuesta según su estructura
					if (response.data && Array.isArray(response.data)) {
						adaptedData = response.data.map(adaptProduct);
						responseMeta = response.meta;
					} else if (Array.isArray(response)) {
						adaptedData = response.map(adaptProduct);
						responseMeta = {
							total: response.length,
							limit: filterParams?.limit || 10,
							offset: filterParams?.offset || 0,
						};
					} else {
						console.warn("⚠️ Estructura de respuesta no reconocida:", response);
						adaptedData = [];
						responseMeta = {total: 0, limit: 0, offset: 0};
					}

					const result: ProductListResponse = {
						data: adaptedData,
						meta: responseMeta || {
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
					return result;
				} else {
					setProducts([]);
					setMeta({total: 0, limit: 0, offset: 0});
					return {data: [], meta: {total: 0, limit: 0, offset: 0}};
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al obtener productos";
				console.error("❌ Error obteniendo productos:", err);
				setError(errorMessage);
				setProducts([]);
				setMeta({total: 0, limit: 0, offset: 0});
				return null;
			} finally {
				setLoading(false);
			}
		},
		[adaptProduct]
	);

	/**
	 * Obtiene un producto por ID (como admin)
	 */
	const fetchProductById = useCallback(
		async (id: number): Promise<ProductDetail | null> => {
			setLoading(true);
			setError(null);

			try {
				const product = await adminProductService.getProductById(id);
				setProductDetail(product);
				return product;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al obtener producto";
				setError(errorMessage);
				setProductDetail(null);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	/**
	 * Crea un producto (como admin)
	 */
	const createProduct = useCallback(
		async (
			data: ProductCreationData,
			sellerId?: number
		): Promise<Product | null> => {
			setLoading(true);
			setError(null);

			try {
				const product = await createProductAsAdminUseCase.execute(
					data,
					sellerId
				);

				if (product) {
					// Invalidar cache después de crear
					invalidateAfterMutation([
						"admin_products_*",
						"products_*",
						"products_featured_*",
					]);
				}

				return product;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al crear producto";
				setError(errorMessage);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[invalidateAfterMutation]
	);

	/**
	 * Actualiza cualquier producto (como admin)
	 */
	const updateProduct = useCallback(
		async (data: ProductUpdateData): Promise<Product | null> => {
			setLoading(true);
			setError(null);

			try {
				const product = await updateAnyProductUseCase.execute(data);

				if (product) {
					// Actualizar producto en la lista actual
					setProducts((prev) =>
						prev.map((p) => (p.id === data.id ? adaptProduct(product) : p))
					);

					// Invalidar cache después de actualizar
					invalidateAfterMutation([
						"admin_products_*",
						"products_*",
						`product_${data.id}`,
						"products_featured_*",
					]);
				}

				return product;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al actualizar producto";
				setError(errorMessage);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[adaptProduct, invalidateAfterMutation]
	);

	/**
	 * Elimina cualquier producto (como admin)
	 */
	const deleteProduct = useCallback(
		async (id: number): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				const result = await deleteAnyProductUseCase.execute(id);

				if (result) {
					// Remover producto de la lista actual
					setProducts((prev) => prev.filter((p) => p.id !== id));

					// Invalidar cache después de eliminar
					invalidateAfterMutation([
						"admin_products_*",
						"products_*",
						`product_${id}`,
						"products_featured_*",
					]);
				}

				return result;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al eliminar producto";
				setError(errorMessage);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[invalidateAfterMutation]
	);

	/**
	 * Alterna el estado destacado de un producto
	 */
	const toggleFeatured = useCallback(
		async (id: number, featured: boolean): Promise<boolean> => {
			setError(null);

			try {
				const result = await toggleProductFeaturedUseCase.execute(id, featured);

				if (result) {
					// Actualizar producto en la lista actual INMEDIATAMENTE
					setProducts((prev) =>
						prev.map((p) => (p.id === id ? {...p, featured} : p))
					);

					// Invalidar cache después de la mutación
					invalidateAfterMutation([
						"admin_products_*",
						"products_*",
						`product_${id}`,
						"products_featured_*",
					]);
				} else {
					setError("Error al cambiar estado destacado del producto");
				}

				return result;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al cambiar estado destacado";
				console.error("❌ Error en toggleFeatured:", err);
				setError(errorMessage);
				return false;
			}
		},
		[invalidateAfterMutation]
	);

	/**
	 * Alterna el estado de publicación de un producto
	 */
	const togglePublished = useCallback(
		async (id: number, published: boolean): Promise<boolean> => {
			setError(null);

			try {
				const result = await toggleProductPublishedUseCase.execute(
					id,
					published
				);

				if (result) {
					// Actualizar producto en la lista actual INMEDIATAMENTE
					setProducts((prev) =>
						prev.map((p) => (p.id === id ? {...p, published} : p))
					);

					// Invalidar cache después de la mutación
					invalidateAfterMutation([
						"admin_products_*",
						"products_*",
						`product_${id}`,
						"products_featured_*",
					]);
				} else {
					setError("Error al cambiar estado de publicación del producto");
				}

				return result;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al cambiar estado de publicación";
				console.error("❌ Error en togglePublished:", err);
				setError(errorMessage);
				return false;
			}
		},
		[invalidateAfterMutation]
	);

	/**
	 * Actualiza el estado de un producto
	 */
	const updateStatus = useCallback(
		async (id: number, status: string): Promise<boolean> => {
			setError(null);

			try {
				const result = await updateProductStatusUseCase.execute(id, status);

				if (result) {
					// Actualizar producto en la lista actual INMEDIATAMENTE
					setProducts((prev) =>
						prev.map((p) => (p.id === id ? {...p, status} : p))
					);

					// Invalidar cache después de la mutación
					invalidateAfterMutation([
						"admin_products_*",
						"products_*",
						`product_${id}`,
						"products_featured_*",
					]);
				} else {
					setError("Error al actualizar estado del producto");
				}

				return result;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al actualizar estado";
				console.error("❌ Error en updateStatus:", err);
				setError(errorMessage);
				return false;
			}
		},
		[invalidateAfterMutation]
	);

	/**
	 * Obtiene productos por vendedor (como admin)
	 */
	const fetchProductsBySeller = useCallback(
		async (
			sellerId: number,
			filterParams?: ExtendedProductFilterParams
		): Promise<ProductListResponse | null> => {
			setLoading(true);
			setError(null);

			try {
				const response = await getProductsBySellerUseCase.execute(
					sellerId,
					filterParams
				);

				if (response && Array.isArray(response.data)) {
					const adaptedData = response.data.map(adaptProduct);
					setProducts(adaptedData);
					setMeta(response.meta || null);
				}

				return response;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener productos del vendedor";
				setError(errorMessage);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[adaptProduct]
	);

	/**
	 * Obtiene estadísticas de productos
	 */
	const fetchProductStats = useCallback(async (): Promise<any> => {
		setLoading(true);
		setError(null);

		try {
			const statsData = await getProductStatsUseCase.execute();
			setStats(statsData);
			return statsData;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error al obtener estadísticas";
			setError(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Limpia la caché de productos de admin usando cache reactivo
	 */
	const clearProductCache = useCallback(
		(productId?: number) => {
			if (productId) {
				// Invalidar cache específica de un producto
				invalidateAfterMutation([`product_${productId}`]);
				console.log(`🗑️ Caché del producto ${productId} invalidada`);
			} else {
				// Invalidar todos los patrones de productos
				invalidateAfterMutation([
					"admin_products_*",
					"products_*",
					"product_*",
				]);
				console.log("🗑️ Toda la caché de productos invalidada");
			}
		},
		[invalidateAfterMutation]
	);

	return {
		// Estado
		loading,
		error,
		products,
		productDetail,
		stats,
		meta,

		// Métodos
		fetchAllProducts,
		fetchProductById,
		createProduct,
		updateProduct,
		deleteProduct,
		toggleFeatured,
		togglePublished,
		updateStatus,
		fetchProductsBySeller,
		fetchProductStats,
		clearProductCache,

		// Utilidades
		setError: (error: string | null) => setError(error),
		setLoading: (loading: boolean) => setLoading(loading),
	};
};

export default useAdminProducts;
