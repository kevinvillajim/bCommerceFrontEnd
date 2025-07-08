// src/presentation/hooks/useAdminCategories.ts - CORREGIDO

import {useState, useCallback} from "react";
import {AdminCategoryService} from "../../core/services/AdminCategoryService";
import CacheService from "../../infrastructure/services/CacheService";
import appConfig from "../../config/appConfig";

// Use Cases
import {GetAllCategoriesUseCase} from "../../core/useCases/admin/category/GetAllCategoriesUseCase";
import {CreateCategoryAsAdminUseCase} from "../../core/useCases/admin/category/CreateCategoryAsAdminUseCase";
import {UpdateAnyCategoryUseCase} from "../../core/useCases/admin/category/UpdateAnyCategoryUseCase";
import {DeleteAnyCategoryUseCase} from "../../core/useCases/admin/category/DeleteAnyCategoryUseCase";
import {ToggleCategoryActiveUseCase} from "../../core/useCases/admin/category/ToggleCategoryActiveUseCase";
import {ToggleCategoryFeaturedUseCase} from "../../core/useCases/admin/category/ToggleCategoryFeaturedUseCase";
import {GetCategoryByIdUseCase} from "../../core/useCases/admin/category/GetCategoryByIdUseCase";

import type {
	Category,
	CategoryListResponse,
	CategoryCreationData,
	CategoryUpdateData,
	CategoryFilterParams,
} from "../../core/domain/entities/Category";

// Instanciar el servicio y use cases
const adminCategoryService = new AdminCategoryService();

const getAllCategoriesUseCase = new GetAllCategoriesUseCase(
	adminCategoryService
);
const createCategoryAsAdminUseCase = new CreateCategoryAsAdminUseCase(
	adminCategoryService
);
const updateAnyCategoryUseCase = new UpdateAnyCategoryUseCase(
	adminCategoryService
);
const deleteAnyCategoryUseCase = new DeleteAnyCategoryUseCase(
	adminCategoryService
);
const toggleCategoryActiveUseCase = new ToggleCategoryActiveUseCase(
	adminCategoryService
);
const toggleCategoryFeaturedUseCase = new ToggleCategoryFeaturedUseCase(
	adminCategoryService
);
const getCategoryByIdUseCase = new GetCategoryByIdUseCase(adminCategoryService);

/**
 * Hook para gestión administrativa de categorías
 * Solo para usuarios con rol de administrador
 */
export const useAdminCategories = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [categories, setCategories] = useState<Category[]>([]);
	const [mainCategories, setMainCategories] = useState<Category[]>([]);
	const [categoryDetail, setCategoryDetail] = useState<Category | null>(null);

	/**
	 * Adaptador para normalizar los datos de categorías
	 */
	const adaptCategory = useCallback((apiCategory: any): Category => {
		if (!apiCategory || typeof apiCategory !== "object") {
			console.error("Categoría inválida para adaptar:", apiCategory);
			return {} as Category;
		}

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

	/**
	 * Obtiene todas las categorías (como admin)
	 */
	const fetchAllCategories = useCallback(
		async (
			params?: CategoryFilterParams,
			forceRefresh: boolean = false
		): Promise<CategoryListResponse> => {
			setLoading(true);
			setError(null);

			const cacheKey = `admin_categories_${JSON.stringify(params || {})}`;

			try {
				// Verificar caché si no se fuerza refresh
				if (!forceRefresh) {
					const cachedData = CacheService.getItem(cacheKey);
					if (cachedData && Array.isArray(cachedData.data)) {
						console.log("💾 useAdminCategories: Usando categorías en caché");
						setCategories(cachedData.data);
						setLoading(false);
						return cachedData;
					}
				}

				console.log("🌐 useAdminCategories: Obteniendo categorías desde API");
				// USAR USE CASE
				const response: CategoryListResponse | null =
					await getAllCategoriesUseCase.execute({
						...params,
						// No filtrar por is_active para que admin vea todas
					});

				if (
					response &&
					typeof response === "object" &&
					"data" in response &&
					Array.isArray(response.data)
				) {
					const adaptedCategories = response.data.map(adaptCategory);

					const result: CategoryListResponse = {
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
						"Respuesta de categorías no tiene el formato esperado:",
						response
					);
					setCategories([]);
					const emptyResult: CategoryListResponse = {
						data: [],
						meta: {total: 0},
					};
					return emptyResult;
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al obtener categorías";
				setError(errorMessage);
				console.error("Error al obtener categorías:", err);
				setCategories([]);
				const emptyResult: CategoryListResponse = {data: [], meta: {total: 0}};
				return emptyResult;
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Obtiene categorías principales (como admin)
	 */
	const fetchMainCategories = useCallback(
		async (
			withCounts: boolean = true,
			forceRefresh: boolean = false
		): Promise<Category[]> => {
			setLoading(true);
			setError(null);

			const cacheKey = `admin_main_categories_${withCounts ? "with_counts" : "no_counts"}`;

			try {
				// Verificar caché si no se fuerza refresh
				if (!forceRefresh) {
					const cachedData = CacheService.getItem(cacheKey);
					if (cachedData && Array.isArray(cachedData)) {
						console.log(
							"💾 useAdminCategories: Usando categorías principales en caché"
						);
						setMainCategories(cachedData);
						setLoading(false);
						return cachedData;
					}
				}

				console.log(
					"🌐 useAdminCategories: Obteniendo categorías principales desde API"
				);
				// USAR SERVICIO ADMIN
				const response: Category[] | CategoryListResponse | null =
					await adminCategoryService.getMainCategories(withCounts);

				// CORREGIDO: Manejar respuesta que puede ser array directo o con estructura {data, meta} con tipos explícitos
				let categoriesArray: Category[] = [];

				if (Array.isArray(response)) {
					categoriesArray = response;
				} else if (
					response &&
					typeof response === "object" &&
					"data" in response &&
					Array.isArray((response as CategoryListResponse).data)
				) {
					categoriesArray = (response as CategoryListResponse).data;
				} else {
					console.warn(
						"Respuesta de categorías principales no tiene el formato esperado:",
						response
					);
					setMainCategories([]);
					return [];
				}

				const adaptedCategories = categoriesArray.map(adaptCategory);

				// Guardar en caché
				CacheService.setItem(
					cacheKey,
					adaptedCategories,
					appConfig.cache.categoryCacheTime
				);

				setMainCategories(adaptedCategories);
				return adaptedCategories;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener categorías principales";
				setError(errorMessage);
				console.error("Error al obtener categorías principales:", err);
				setMainCategories([]);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Obtiene una categoría por ID (como admin)
	 */
	const fetchCategoryById = useCallback(
		async (id: number): Promise<Category | null> => {
			setLoading(true);
			setError(null);

			const cacheKey = `admin_category_${id}`;

			try {
				// Verificar caché primero
				const cachedData = CacheService.getItem(cacheKey);
				if (cachedData) {
					console.log(`💾 useAdminCategories: Usando categoría ${id} en caché`);
					setCategoryDetail(cachedData);
					setLoading(false);
					return cachedData;
				}

				console.log(
					`🌐 useAdminCategories: Obteniendo categoría ${id} desde API`
				);
				// USAR USE CASE
				const response: Category | null =
					await getCategoryByIdUseCase.execute(id);

				if (response && typeof response === "object") {
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
					err instanceof Error ? err.message : "Error al obtener categoría";
				setError(errorMessage);
				console.error("Error al obtener categoría:", err);
				setCategoryDetail(null);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Crea una nueva categoría (como admin)
	 */
	const createCategory = useCallback(
		async (data: CategoryCreationData): Promise<Category | null> => {
			setLoading(true);
			setError(null);

			try {
				console.log("🌐 useAdminCategories: Creando nueva categoría:", data);
				// USAR USE CASE
				const response: Category | null =
					await createCategoryAsAdminUseCase.execute(data);

				if (response && typeof response === "object") {
					const adaptedCategory = adaptCategory(response);

					// Actualizar la lista de categorías
					setCategories((prev) => [...prev, adaptedCategory]);

					// Si es una categoría principal, también actualizar esa lista
					if (!data.parent_id) {
						setMainCategories((prev) => [...prev, adaptedCategory]);
					}

					// Limpiar caché relacionada
					clearCategoryCache();

					return adaptedCategory;
				}

				return null;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al crear categoría";
				setError(errorMessage);
				console.error("Error al crear categoría:", err);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory]
	);

	/**
	 * Actualiza una categoría (como admin)
	 */
	const updateCategory = useCallback(
		async (data: CategoryUpdateData): Promise<Category | null> => {
			setLoading(true);
			setError(null);

			try {
				console.log(
					`🌐 useAdminCategories: Actualizando categoría ${data.id}:`,
					data
				);
				// USAR USE CASE
				const response: Category | null =
					await updateAnyCategoryUseCase.execute(data);

				if (response && typeof response === "object") {
					const adaptedCategory = adaptCategory(response);

					// Actualizar en las listas actuales
					setCategories((prev) =>
						prev.map((cat) => (cat.id === data.id ? adaptedCategory : cat))
					);
					setMainCategories((prev) =>
						prev.map((cat) => (cat.id === data.id ? adaptedCategory : cat))
					);

					// Actualizar detalle si coincide
					if (categoryDetail?.id === data.id) {
						setCategoryDetail(adaptedCategory);
					}

					// Limpiar caché relacionada
					clearCategoryCache();

					return adaptedCategory;
				}

				return null;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al actualizar categoría";
				setError(errorMessage);
				console.error("Error al actualizar categoría:", err);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[adaptCategory, categoryDetail]
	);

	/**
	 * Elimina una categoría (como admin)
	 */
	const deleteCategory = useCallback(
		async (id: number): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				console.log(`🌐 useAdminCategories: Eliminando categoría ${id}`);
				// USAR USE CASE
				const result = await deleteAnyCategoryUseCase.execute(id);

				if (result) {
					// Remover de las listas actuales
					setCategories((prev) => prev.filter((cat) => cat.id !== id));
					setMainCategories((prev) => prev.filter((cat) => cat.id !== id));

					// Limpiar detalle si coincide
					if (categoryDetail?.id === id) {
						setCategoryDetail(null);
					}

					// Limpiar caché relacionada
					clearCategoryCache();

					return true;
				}

				return false;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al eliminar categoría";
				setError(errorMessage);
				console.error("Error al eliminar categoría:", err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[categoryDetail]
	);

	/**
	 * Alterna el estado activo de una categoría
	 */
	const toggleActive = useCallback(
		async (id: number, is_active: boolean): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				console.log(
					`🌐 useAdminCategories: Cambiando estado activo de categoría ${id} a ${is_active}`
				);
				// USAR USE CASE
				const result = await toggleCategoryActiveUseCase.execute(id, is_active);

				if (result) {
					// Actualizar en las listas actuales
					const updateCategory = (cat: Category) =>
						cat.id === id ? {...cat, is_active} : cat;

					setCategories((prev) => prev.map(updateCategory));
					setMainCategories((prev) => prev.map(updateCategory));

					// Actualizar detalle si coincide
					if (categoryDetail?.id === id) {
						setCategoryDetail((prev) => (prev ? {...prev, is_active} : prev));
					}

					// Limpiar caché relacionada
					clearCategoryCache();

					return true;
				}

				return false;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al cambiar estado activo";
				setError(errorMessage);
				console.error("Error al cambiar estado activo:", err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[categoryDetail]
	);

	/**
	 * Alterna el estado destacado de una categoría
	 */
	const toggleFeatured = useCallback(
		async (id: number, featured: boolean): Promise<boolean> => {
			setLoading(true);
			setError(null);

			try {
				console.log(
					`🌐 useAdminCategories: Cambiando estado destacado de categoría ${id} a ${featured}`
				);
				// USAR USE CASE
				const result = await toggleCategoryFeaturedUseCase.execute(
					id,
					featured
				);

				if (result) {
					// Actualizar en las listas actuales
					const updateCategory = (cat: Category) =>
						cat.id === id ? {...cat, featured} : cat;

					setCategories((prev) => prev.map(updateCategory));
					setMainCategories((prev) => prev.map(updateCategory));

					// Actualizar detalle si coincide
					if (categoryDetail?.id === id) {
						setCategoryDetail((prev) => (prev ? {...prev, featured} : prev));
					}

					// Limpiar caché relacionada
					clearCategoryCache();

					return true;
				}

				return false;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al cambiar estado destacado";
				setError(errorMessage);
				console.error("Error al cambiar estado destacado:", err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[categoryDetail]
	);

	/**
	 * Limpia la caché de categorías de admin
	 */
	const clearCategoryCache = useCallback(() => {
		const allKeys = Object.keys(localStorage);
		const adminCategoryKeys = allKeys.filter(
			(key) =>
				key.startsWith("admin_categories_") ||
				key.startsWith("admin_category_") ||
				key.startsWith("admin_main_categories_") ||
				key.startsWith("category_") ||
				key.startsWith("categories_")
		);

		adminCategoryKeys.forEach((key) => {
			CacheService.removeItem(key);
		});

		console.log(
			`🗑️ ${adminCategoryKeys.length} claves de caché de categorías de admin eliminadas`
		);
	}, []);

	return {
		// Estado
		loading,
		error,
		categories,
		mainCategories,
		categoryDetail,

		// Métodos
		fetchAllCategories,
		fetchMainCategories,
		fetchCategoryById,
		createCategory,
		updateCategory,
		deleteCategory,
		toggleActive,
		toggleFeatured,
		clearCategoryCache,

		// Utilidades
		setError: (error: string | null) => setError(error),
		setLoading: (loading: boolean) => setLoading(loading),
	};
};

export default useAdminCategories;
