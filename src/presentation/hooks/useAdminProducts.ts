// src/presentation/hooks/useAdminProducts.ts

import {useState, useCallback} from "react";
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

	/**
	 * Función adaptadora para productos - CORREGIDA PARA BACKEND REAL
	 */
	const adaptProduct = useCallback((apiProduct: any): Product => {
		if (!apiProduct || typeof apiProduct !== "object") {
			console.error("Producto inválido para adaptar:", apiProduct);
			return {} as Product;
		}

		console.log("🔄 Adaptando producto desde API:", {
			id: apiProduct.id,
			name: apiProduct.name,
			featured: apiProduct.featured,
			published: apiProduct.published,
			featured_type: typeof apiProduct.featured,
			published_type: typeof apiProduct.published,
		});

		// Procesar imágenes
		let processedImages: string[] = [];
		if (apiProduct.main_image) {
			processedImages = [apiProduct.main_image];
		} else if (
			Array.isArray(apiProduct.images) &&
			apiProduct.images.length > 0
		) {
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
		} else if (apiProduct.image) {
			processedImages = [apiProduct.image];
		}

		// Procesar tags
		let processedTags: string[] = [];
		if (Array.isArray(apiProduct.tags)) {
			apiProduct.tags.forEach((tag: any) => {
				if (typeof tag === "string") {
					try {
						const parsed = JSON.parse(tag);
						if (Array.isArray(parsed)) {
							processedTags.push(...parsed);
						} else {
							processedTags.push(tag);
						}
					} catch {
						processedTags.push(tag);
					}
				}
			});
		}

		// CORREGIR: Asegurar que featured y published sean booleanos
		const featured = Boolean(
			apiProduct.featured === true ||
				apiProduct.featured === 1 ||
				apiProduct.featured === "1"
		);
		const published = Boolean(
			apiProduct.published === true ||
				apiProduct.published === 1 ||
				apiProduct.published === "1" ||
				apiProduct.published !== false
		);

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

			// CORREGIR: Usar las variables procesadas
			featured: featured,
			published: published,

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

		console.log("✅ Producto adaptado:", {
			id: adaptedProduct.id,
			name: adaptedProduct.name,
			featured: adaptedProduct.featured,
			published: adaptedProduct.published,
			featured_type: typeof adaptedProduct.featured,
			published_type: typeof adaptedProduct.published,
			status: adaptedProduct.status,
			images: adaptedProduct.images,
			tags: adaptedProduct.tags,
		});

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

				console.log(
					"🌐 useAdminProducts: Obteniendo productos desde API con filtros:",
					filterParams
				);
				const response = await getAllProductsUseCase.execute(filterParams);

				console.log("🔍 RESPUESTA RAW DE LA API:", response);

				if (response) {
					let adaptedData: Product[] = [];
					let responseMeta = null;

					// Procesar la respuesta según su estructura
					if (response.data && Array.isArray(response.data)) {
						console.log(
							"📦 Respuesta contiene array en data, procesando productos..."
						);
						adaptedData = response.data.map((product) => {
							console.log("🔄 Procesando producto:", product);
							return adaptProduct(product);
						});
						responseMeta = response.meta;
					} else if (Array.isArray(response)) {
						console.log("📦 Respuesta es directamente un array");
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

					console.log("💫 Datos procesados:", {
						productCount: adaptedData.length,
						meta: result.meta,
						firstProductSample: adaptedData[0]
							? {
									id: adaptedData[0].id,
									name: adaptedData[0].name,
									published: adaptedData[0].published,
									featured: adaptedData[0].featured,
									images: adaptedData[0].images,
								}
							: null,
					});

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
					console.warn("⚠️ Respuesta vacía de la API");
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
					// Limpiar caché relacionada
					clearProductCache();
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
		[]
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
					// Limpiar caché relacionada
					clearProductCache();
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
		[adaptProduct]
	);

	/**
	 * Elimina cualquier producto (como admin)
	 */
	const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
		setLoading(true);
		setError(null);

		try {
			const result = await deleteAnyProductUseCase.execute(id);

			if (result) {
				// Remover producto de la lista actual
				setProducts((prev) => prev.filter((p) => p.id !== id));
				// Limpiar caché relacionada
				clearProductCache();
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
	}, []);

	/**
	 * Alterna el estado destacado de un producto - CORREGIDO
	 */
	const toggleFeatured = useCallback(
		async (id: number, featured: boolean): Promise<boolean> => {
			setError(null);

			try {
				console.log(`🌟 Cambiando featured del producto ${id} a ${featured}`);

				const result = await toggleProductFeaturedUseCase.execute(id, featured);

				if (result) {
					// Actualizar producto en la lista actual INMEDIATAMENTE
					setProducts((prev) =>
						prev.map((p) => (p.id === id ? {...p, featured} : p))
					);

					// Actualizar detalle si coincide
					if (productDetail?.id === id) {
						setProductDetail((prev) => (prev ? {...prev, featured} : prev));
					}

					// NO llamar a loadData() aquí ya que actualizamos el estado directamente
					// clearProductCache(); // Solo limpiar caché

					console.log(
						`✅ Featured actualizado correctamente para producto ${id} a ${featured}`
					);
				} else {
					console.error(`❌ Error al actualizar featured para producto ${id}`);
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
		[productDetail]
	);

	/**
	 * Alterna el estado de publicación de un producto - CORREGIDO
	 */
	const togglePublished = useCallback(
		async (id: number, published: boolean): Promise<boolean> => {
			setError(null);

			try {
				console.log(`📢 Cambiando published del producto ${id} a ${published}`);

				const result = await toggleProductPublishedUseCase.execute(
					id,
					published
				);

				if (result) {
					// Actualizar producto en la lista actual INMEDIATAMENTE
					setProducts((prev) =>
						prev.map((p) => (p.id === id ? {...p, published} : p))
					);

					// Actualizar detalle si coincide
					if (productDetail?.id === id) {
						setProductDetail((prev) => (prev ? {...prev, published} : prev));
					}

					// NO llamar a loadData() aquí ya que actualizamos el estado directamente
					// clearProductCache(); // Solo limpiar caché

					console.log(
						`✅ Published actualizado correctamente para producto ${id} a ${published}`
					);
				} else {
					console.error(`❌ Error al actualizar published para producto ${id}`);
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
		[productDetail]
	);

	/**
	 * Actualiza el estado de un producto - CORREGIDO
	 */
	const updateStatus = useCallback(
		async (id: number, status: string): Promise<boolean> => {
			setError(null);

			try {
				console.log(`🔄 Cambiando status del producto ${id} a ${status}`);

				const result = await updateProductStatusUseCase.execute(id, status);

				if (result) {
					// Actualizar producto en la lista actual INMEDIATAMENTE
					setProducts((prev) =>
						prev.map((p) => (p.id === id ? {...p, status} : p))
					);

					// Actualizar detalle si coincide
					if (productDetail?.id === id) {
						setProductDetail((prev) => (prev ? {...prev, status} : prev));
					}

					// NO llamar a loadData() aquí ya que actualizamos el estado directamente
					// clearProductCache(); // Solo limpiar caché

					console.log(
						`✅ Status actualizado correctamente para producto ${id} a ${status}`
					);
				} else {
					console.error(`❌ Error al actualizar status para producto ${id}`);
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
		[productDetail]
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
	 * Limpia la caché de productos de admin
	 */
	const clearProductCache = useCallback(() => {
		const allKeys = Object.keys(localStorage);
		const adminProductKeys = allKeys.filter(
			(key) =>
				key.startsWith("admin_products_") ||
				key.startsWith("product_") ||
				key.startsWith("products_")
		);

		adminProductKeys.forEach((key) => {
			CacheService.removeItem(key);
		});

		console.log(
			`🗑️ ${adminProductKeys.length} claves de caché de productos de admin eliminadas`
		);
	}, []);

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
