import {useState, useCallback} from "react";
import ApiClient from "../../infrastructure/api/apiClient";
import CacheService from "../../infrastructure/services/CacheService";
import appConfig from "../../config/appConfig";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Category,
	CategoryListResponse,
} from "../../core/domain/entities/Category";

/**
 * Hook optimizado para operaciones con categorías
 * Incluye sistema de caché para mejorar el rendimiento
 */
export const useCategories = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [mainCategories, setMainCategories] = useState<Category[]>([]);
	const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);

	/**
	 * Fetch all categories
	 * Versión optimizada con caché
	 */
	const fetchCategories = useCallback(async () => {
		setLoading(true);
		setError(null);

		const cacheKey = "categories_all";

		try {
			// Intentar obtener datos de la caché primero
			const cachedData = CacheService.getItem(cacheKey);

			if (cachedData) {
				console.log("Usando categorías en caché");
				setCategories(cachedData);
				setLoading(false);
				return cachedData;
			}

			// Si no hay caché, hacer la petición a la API
			const response = await ApiClient.get<CategoryListResponse>(
				API_ENDPOINTS.CATEGORIES.LIST,
				{
					withCounts: true,
				}
			);

			if (response && response.data) {
				// Guardar en caché
				CacheService.setItem(
					cacheKey,
					response.data,
					appConfig.cache.categoryCacheTime
				);

				setCategories(response.data);
				return response.data;
			}

			setCategories([]);
			return [];
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error al obtener categorías";
			setError(errorMessage);
			setCategories([]);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Fetch main categories (those without parent_id)
	 */
	const fetchMainCategories = useCallback(async () => {
		setLoading(true);
		setError(null);

		const cacheKey = "categories_main";

		try {
			// Intentar obtener datos de la caché primero
			const cachedData = CacheService.getItem(cacheKey);

			if (cachedData) {
				console.log("Usando categorías principales en caché");
				setMainCategories(cachedData);
				setLoading(false);
				return cachedData;
			}

			// Si no hay caché, hacer la petición a la API
			const response = await ApiClient.get<{data: Category[]}>(
				API_ENDPOINTS.CATEGORIES.MAIN,
				{
					withCounts: true,
					withChildren: true,
				}
			);

			if (response && response.data) {
				// Guardar en caché
				CacheService.setItem(
					cacheKey,
					response.data,
					appConfig.cache.categoryCacheTime
				);

				setMainCategories(response.data);
				return response.data;
			}

			setMainCategories([]);
			return [];
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Error al obtener categorías principales";
			setError(errorMessage);
			setMainCategories([]);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Fetch featured categories
	 */
	const fetchFeaturedCategories = useCallback(async (limit: number = 8) => {
		setLoading(true);
		setError(null);

		const cacheKey = `categories_featured_${limit}`;

		try {
			// Intentar obtener datos de la caché primero
			const cachedData = CacheService.getItem(cacheKey);

			if (cachedData) {
				console.log("Usando categorías destacadas en caché");
				setFeaturedCategories(cachedData);
				setLoading(false);
				return cachedData;
			}

			// Si no hay caché, hacer la petición a la API
			const response = await ApiClient.get<{data: Category[]}>(
				API_ENDPOINTS.CATEGORIES.FEATURED,
				{limit}
			);

			if (response && response.data) {
				// Guardar en caché
				CacheService.setItem(
					cacheKey,
					response.data,
					appConfig.cache.categoryCacheTime
				);

				setFeaturedCategories(response.data);
				return response.data;
			}

			setFeaturedCategories([]);
			return [];
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Error al obtener categorías destacadas";
			setError(errorMessage);
			setFeaturedCategories([]);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Fetch subcategories for a specific category
	 */
	const fetchSubcategories = useCallback(async (categoryId: number) => {
		setLoading(true);
		setError(null);

		const cacheKey = `categories_subcats_${categoryId}`;

		try {
			// Intentar obtener datos de la caché primero
			const cachedData = CacheService.getItem(cacheKey);

			if (cachedData) {
				console.log(
					`Usando subcategorías en caché para categoría ${categoryId}`
				);
				setLoading(false);
				return cachedData;
			}

			// Si no hay caché, hacer la petición a la API
			const response = await ApiClient.get<{data: Category[]}>(
				API_ENDPOINTS.CATEGORIES.SUBCATEGORIES(categoryId),
				{withCounts: true}
			);

			if (response && response.data) {
				// Guardar en caché
				CacheService.setItem(
					cacheKey,
					response.data,
					appConfig.cache.categoryCacheTime
				);

				return response.data;
			}

			return [];
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error al obtener subcategorías";
			setError(errorMessage);
			return [];
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Fetch category by slug
	 */
	const fetchCategoryBySlug = useCallback(async (slug: string) => {
		setLoading(true);
		setError(null);

		const cacheKey = `category_slug_${slug}`;

		try {
			// Intentar obtener datos de la caché primero
			const cachedData = CacheService.getItem(cacheKey);

			if (cachedData) {
				console.log(`Usando categoría en caché para slug ${slug}`);
				setLoading(false);
				return cachedData;
			}

			// Si no hay caché, hacer la petición a la API
			const response = await ApiClient.get<{data: Category}>(
				API_ENDPOINTS.CATEGORIES.SLUG(slug),
				{
					withSubcategories: true,
					withProducts: false,
				}
			);

			if (response && response.data) {
				// Guardar en caché
				CacheService.setItem(
					cacheKey,
					response.data,
					appConfig.cache.categoryCacheTime
				);

				return response.data;
			}

			return null;
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Error al obtener categoría por slug";
			setError(errorMessage);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Fetch products by category ID
	 */
	const fetchProductsByCategory = useCallback(
		async (categoryId: number, limit: number = 12, page: number = 1) => {
			setLoading(true);
			setError(null);

			const cacheKey = `category_products_${categoryId}_${limit}_${page}`;

			try {
				// Intentar obtener datos de la caché primero
				const cachedData = CacheService.getItem(cacheKey);

				if (cachedData) {
					console.log(`Usando productos en caché para categoría ${categoryId}`);
					setLoading(false);
					return cachedData;
				}

				// Si no hay caché, hacer la petición a la API
				const response = await ApiClient.get(
					API_ENDPOINTS.CATEGORIES.PRODUCTS(categoryId),
					{
						limit,
						page,
						includeSubcategories: true,
					}
				);

				if (response) {
					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						response,
						appConfig.cache.productCacheTime
					);

					return response;
				}

				return null;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener productos por categoría";
				setError(errorMessage);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	return {
		loading,
		error,
		categories,
		mainCategories,
		featuredCategories,
		fetchCategories,
		fetchMainCategories,
		fetchFeaturedCategories,
		fetchSubcategories,
		fetchCategoryBySlug,
		fetchProductsByCategory,
	};
};

export default useCategories;
