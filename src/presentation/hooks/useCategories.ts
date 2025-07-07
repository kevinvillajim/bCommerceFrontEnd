// src/presentation/hooks/useCategories.ts - CORREGIDO
import {useState, useCallback, useEffect} from "react";
import CacheService from "../../infrastructure/services/CacheService";
import appConfig from "../../config/appConfig";
import {CategoryService} from "../../core/services/CategoryService";
import type {Category} from "../../core/domain/entities/Category";

// Instanciar el servicio de categorías
const categoryService = new CategoryService();

/**
 * Hook para gestionar operaciones con categorías (solo lectura)
 */
export const useCategories = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [mainCategories, setMainCategories] = useState<Category[]>([]);
	const [featuredCategories, setFeaturedCategories] = useState<Category[]>([]);
	const [categoryDetail, setCategoryDetail] = useState<Category | null>(null);
	const [isInitialized, setIsInitialized] = useState<boolean>(false);

	// Adaptador para normalizar los datos de categorías
	const adaptCategory = useCallback((apiCategory: any): Category => {
		// Verificar que sea un objeto para prevenir errores
		if (!apiCategory || typeof apiCategory !== "object") {
			console.error("Categoría inválida para adaptar:", apiCategory);
			return {} as Category;
		}

		// Mapeo de propiedades, respetando snake_case del backend
		return {
			id: apiCategory.id,
			name: apiCategory.name || "",
			slug: apiCategory.slug || "",
			description: apiCategory.description || "",
			parent_id: apiCategory.parent_id,
			icon: apiCategory.icon,
			image: apiCategory.image,
			order: apiCategory.order,
			is_active: Boolean(apiCategory.is_active ?? true),
			featured: Boolean(apiCategory.featured ?? false),
			created_at: apiCategory.created_at,
			updated_at: apiCategory.updated_at,
			// API response specific fields
			subcategories: Array.isArray(apiCategory.subcategories)
				? apiCategory.subcategories.map((sub: any) => adaptCategory(sub))
				: undefined,
			product_count: apiCategory.product_count || 0,
			full_path: apiCategory.full_path,
			has_children: Boolean(apiCategory.has_children),
			url: apiCategory.url,
			parent: apiCategory.parent
				? adaptCategory(apiCategory.parent)
				: undefined,
			image_url: apiCategory.image_url,
			icon_url: apiCategory.icon_url,
		};
	}, []);

	// Inicialización - cargar categorías si hay datos en caché
	useEffect(() => {
		if (!isInitialized) {
			// Verificar si hay categorías en caché
			const cachedCategories = CacheService.getItem("categories_all");
			if (cachedCategories && cachedCategories.data) {
				setCategories(cachedCategories.data || []);
			}

			// Verificar si hay categorías principales en caché
			const cachedMainCategories = CacheService.getItem(
				"categories_main_with_counts"
			);
			if (cachedMainCategories) {
				setMainCategories(cachedMainCategories);
			}

			// Verificar si hay categorías destacadas en caché
			const cachedFeaturedCategories = CacheService.getItem(
				"categories_featured_8"
			);
			if (cachedFeaturedCategories) {
				setFeaturedCategories(cachedFeaturedCategories);
			}

			setIsInitialized(true);
		}
	}, [isInitialized]);

	/**
	 * Obtener todas las categorías
	 */
	const fetchCategories = useCallback(
		async (withCounts: boolean = true, forceRefresh: boolean = false) => {
			setLoading(true);
			setError(null);

			const cacheKey = `categories_all_${withCounts ? "with_counts" : "no_counts"}`;

			try {
				// Intentar obtener datos de la caché primero si no se fuerza refresh
				if (!forceRefresh) {
					const cachedData = CacheService.getItem(cacheKey);
					if (cachedData && cachedData.data) {
						console.log("💾 useCategories: Usando categorías en caché");
						setCategories(cachedData.data || []);
						setLoading(false);
						return cachedData;
					}
				}

				console.log(
					"🌐 useCategories: Obteniendo categorías desde API con withCounts:",
					withCounts
				);

				// Hacer la petición a la API
				const response = await categoryService.getCategories({
					with_counts: withCounts,
					is_active: true,
					with_children: true, // ✅ AGREGADO: solicitar subcategorías
				});

				console.log(
					"📥 useCategories: Respuesta de categorías desde API:",
					response
				);

				if (response && response.data && Array.isArray(response.data)) {
					// Adaptar datos
					const adaptedCategories = response.data.map(adaptCategory);

					const result = {
						data: adaptedCategories,
						meta: response.meta || {total: adaptedCategories.length},
					};

					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						result,
						appConfig.cache.categoryCacheTime
					);

					setCategories(adaptedCategories);
					return result;
				} else {
					console.warn(
						"⚠️ useCategories: Respuesta de categorías no tiene el formato esperado:",
						response
					);
					setCategories([]);
					return {data: [], meta: {total: 0}};
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al obtener categorías";
				setError(errorMessage);
				console.error("❌ useCategories: Error al obtener categorías:", err);
				setCategories([]);
				return {data: [], meta: {total: 0}};
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Obtener categorías principales
	 */
	const fetchMainCategories = useCallback(
		async (withCounts: boolean = true, forceRefresh: boolean = false) => {
			setLoading(true);
			setError(null);

			const cacheKey = `categories_main_${withCounts ? "with_counts" : "no_counts"}`;

			try {
				// Intentar obtener datos de la caché primero
				if (!forceRefresh) {
					const cachedData = CacheService.getItem(cacheKey);
					if (cachedData) {
						console.log(
							"💾 useCategories: Usando categorías principales en caché"
						);
						setMainCategories(cachedData);
						setLoading(false);
						return cachedData;
					}
				}

				console.log(
					"🌐 useCategories: Obteniendo categorías principales desde API"
				);

				// Hacer la petición a la API para categorías principales
				const response = await categoryService.getMainCategories(withCounts);

				console.log(
					"📥 useCategories: Respuesta de categorías principales desde API:",
					response
				);

				// ✅ CORREGIDO: Verificar la estructura correcta {data: [...], meta: {...}}
				if (response && response.data && Array.isArray(response.data)) {
					// Adaptar datos del array dentro de data
					const adaptedCategories = response.data.map(adaptCategory);

					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						adaptedCategories,
						appConfig.cache.categoryCacheTime
					);

					setMainCategories(adaptedCategories);
					console.log(
						"✅ useCategories: Categorías principales procesadas correctamente:",
						adaptedCategories.length
					);
					return adaptedCategories;
				} else {
					console.warn(
						"⚠️ useCategories: Respuesta de categorías principales no tiene el formato esperado:",
						response
					);
					setMainCategories([]);
					return [];
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener categorías principales";
				setError(errorMessage);
				console.error(
					"❌ useCategories: Error al obtener categorías principales:",
					err
				);
				setMainCategories([]);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Obtener categorías destacadas
	 */
	const fetchFeaturedCategories = useCallback(
		async (limit: number = 8, forceRefresh: boolean = false) => {
			setLoading(true);
			setError(null);

			const cacheKey = `categories_featured_${limit}`;

			try {
				// Intentar obtener datos de la caché primero
				if (!forceRefresh) {
					const cachedData = CacheService.getItem(cacheKey);
					if (cachedData) {
						console.log(
							"💾 useCategories: Usando categorías destacadas en caché"
						);
						setFeaturedCategories(cachedData);
						setLoading(false);
						return cachedData;
					}
				}

				console.log(
					"🌐 useCategories: Obteniendo categorías destacadas desde API"
				);

				// Hacer la petición a la API
				const response = await categoryService.getFeaturedCategories(limit);

				console.log(
					"📥 useCategories: Respuesta de categorías destacadas desde API:",
					response
				);

				// ✅ CORREGIDO: Verificar si es array directamente O si tiene estructura {data: [...]}
				let categoriesToProcess = [];
				if (Array.isArray(response)) {
					categoriesToProcess = response;
				} else if (response && response.data && Array.isArray(response.data)) {
					categoriesToProcess = response.data;
				}

				if (categoriesToProcess.length > 0) {
					// Adaptar datos
					const adaptedCategories = categoriesToProcess.map(adaptCategory);

					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						adaptedCategories,
						appConfig.cache.categoryCacheTime
					);

					setFeaturedCategories(adaptedCategories);
					console.log(
						"✅ useCategories: Categorías destacadas procesadas correctamente:",
						adaptedCategories.length
					);
					return adaptedCategories;
				} else {
					console.warn(
						"⚠️ useCategories: Respuesta de categorías destacadas no tiene el formato esperado:",
						response
					);
					setFeaturedCategories([]);
					return [];
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener categorías destacadas";
				setError(errorMessage);
				console.error(
					"❌ useCategories: Error al obtener categorías destacadas:",
					err
				);
				setFeaturedCategories([]);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Obtener subcategorías de una categoría
	 */
	const fetchSubcategories = useCallback(
		async (categoryId: number) => {
			setLoading(true);
			setError(null);

			const cacheKey = `categories_subcats_${categoryId}`;

			try {
				// Intentar obtener datos de la caché primero
				const cachedData = CacheService.getItem(cacheKey);

				if (cachedData) {
					console.log(
						`💾 useCategories: Usando subcategorías en caché para categoría ${categoryId}`
					);
					setLoading(false);
					return cachedData;
				}

				// Si no hay caché, hacer la petición a la API
				const response = await categoryService.getSubcategories(categoryId);

				console.log(
					`📥 useCategories: Respuesta de subcategorías para categoría ${categoryId}:`,
					response
				);

				// ✅ CORREGIDO: Verificar si es array directamente O si tiene estructura {data: [...]}
				let categoriesToProcess = [];
				if (Array.isArray(response)) {
					categoriesToProcess = response;
				} else if (response && response.data && Array.isArray(response.data)) {
					categoriesToProcess = response.data;
				}

				if (categoriesToProcess.length > 0) {
					// Adaptar datos
					const adaptedCategories = categoriesToProcess.map(adaptCategory);

					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						adaptedCategories,
						appConfig.cache.categoryCacheTime
					);

					console.log(
						`✅ useCategories: Subcategorías procesadas correctamente para categoría ${categoryId}:`,
						adaptedCategories.length
					);
					return adaptedCategories;
				}

				return [];
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al obtener subcategorías";
				setError(errorMessage);
				console.error("❌ useCategories: Error al obtener subcategorías:", err);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Obtener categoría por su slug
	 */
	const fetchCategoryBySlug = useCallback(
		async (slug: string) => {
			setLoading(true);
			setError(null);

			const cacheKey = `category_slug_${slug}`;

			try {
				// Intentar obtener datos de la caché primero
				const cachedData = CacheService.getItem(cacheKey);

				if (cachedData) {
					console.log(
						`💾 useCategories: Usando categoría en caché para slug ${slug}`
					);
					setCategoryDetail(cachedData);
					setLoading(false);
					return cachedData;
				}

				// Si no hay caché, hacer la petición a la API
				const response = await categoryService.getCategoryBySlug(slug);

				console.log(
					`📥 useCategories: Respuesta de categoría con slug ${slug}:`,
					response
				);

				if (response) {
					// Adaptar datos
					const adaptedCategory = adaptCategory(response);

					// Guardar en caché
					CacheService.setItem(
						cacheKey,
						adaptedCategory,
						appConfig.cache.categoryCacheTime
					);

					setCategoryDetail(adaptedCategory);
					return adaptedCategory;
				}

				setCategoryDetail(null);
				return null;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener categoría por slug";
				setError(errorMessage);
				console.error(
					"❌ useCategories: Error al obtener categoría por slug:",
					err
				);
				setCategoryDetail(null);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Limpiar caché de categorías
	 */
	const clearCategoryCache = useCallback(() => {
		// Identificar y limpiar todas las claves de caché relacionadas con categorías
		const allKeys = Object.keys(localStorage);
		const categoryKeys = allKeys.filter(
			(key) => key.startsWith("category_") || key.startsWith("categories_")
		);

		categoryKeys.forEach((key) => {
			CacheService.removeItem(key);
		});

		console.log(
			`🗑️ useCategories: ${categoryKeys.length} claves de caché de categorías eliminadas`
		);
	}, []);

	return {
		// Estados
		loading,
		error,
		categories,
		mainCategories,
		featuredCategories,
		categoryDetail,
		isInitialized,

		// Métodos
		fetchCategories,
		fetchMainCategories,
		fetchFeaturedCategories,
		fetchSubcategories,
		fetchCategoryBySlug,
		clearCategoryCache,

		// Utilidades
		setError: (error: string | null) => setError(error),
		setLoading: (loading: boolean) => setLoading(loading),
	};
};

export default useCategories;
