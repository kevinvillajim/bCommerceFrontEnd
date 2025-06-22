import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Category,
	CategoryListResponse,
	CategoryCreationData,
	CategoryUpdateData,
	CategoryFilterParams,
} from "../domain/entities/Category";
import ApiClient from "../../infrastructure/api/apiClient";

/**
 * Servicio para gestionar categorías
 */
export class CategoryService {
	/**
	 * Obtiene todas las categorías
	 */
	async getCategories(
		params?: CategoryFilterParams
	): Promise<CategoryListResponse> {
		try {
			console.log("Obteniendo categorías con parámetros:", params);

			// Construir parámetros de API usando nombres correctos del backend
			const apiParams: Record<string, any> = {};

			if (params) {
				if (params.parent_id !== undefined)
					apiParams.parent_id = params.parent_id;
				if (params.featured !== undefined) apiParams.featured = params.featured;
				if (params.is_active !== undefined) apiParams.active = params.is_active;
				if (params.term) apiParams.term = params.term;
				if (params.limit !== undefined) apiParams.limit = params.limit;
				if (params.offset !== undefined) apiParams.offset = params.offset;
				if (params.sort_by) apiParams.sort_by = params.sort_by;
				if (params.sort_dir) apiParams.sort_dir = params.sort_dir;
				if (params.with_counts !== undefined)
					apiParams.withCounts = params.with_counts;
				if (params.with_children !== undefined)
					apiParams.withChildren = params.with_children;
			}

			console.log("Parámetros de API finales:", apiParams);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CATEGORIES.LIST,
				apiParams
			);

			console.log("Respuesta raw de API de categorías:", response);

			// Procesar la respuesta
			let categoryData: Category[] = [];
			let metaData = {
				total: 0,
				active_only: params?.is_active !== undefined ? params.is_active : true,
				featured_only: params?.featured || false,
			};

			// Manejar diferentes estructuras de respuesta
			if (response && response.data) {
				if (Array.isArray(response.data)) {
					// Estructura: { data: [...], meta: {...} }
					categoryData = response.data;
					if (response.meta) {
						metaData = {
							...metaData,
							...response.meta,
						};
					}
				} else if (response.data.data && Array.isArray(response.data.data)) {
					// Estructura: { data: { data: [...], meta: {...} } }
					categoryData = response.data.data;
					if (response.data.meta) {
						metaData = {
							...metaData,
							...response.data.meta,
						};
					}
				}
			} else if (Array.isArray(response)) {
				// Respuesta directa como array
				categoryData = response;
				metaData.total = response.length;
			}

			console.log("Categorías procesadas:", {
				count: categoryData.length,
				meta: metaData,
				sample: categoryData.slice(0, 2)
			});

			return {
				data: categoryData,
				meta: metaData,
			};
		} catch (error) {
			console.error("Error al obtener categorías:", error);
			return {
				data: [],
				meta: {
					total: 0,
					active_only:
						params?.is_active !== undefined ? params.is_active : true,
					featured_only: params?.featured || false,
				},
			};
		}
	}

	/**
	 * Obtiene categorías principales (sin parent)
	 */
	async getMainCategories(withCounts: boolean = false): Promise<Category[]> {
		try {
			console.log(
				`Obteniendo categorías principales (con conteos: ${withCounts})`
			);

			const response = await ApiClient.get<any>(API_ENDPOINTS.CATEGORIES.MAIN, {
				withCounts: withCounts,
				active: true,
			});

			console.log("Respuesta raw de categorías principales:", response);

			// Manejar diferentes estructuras de respuesta
			let categoryData: Category[] = [];

			if (response && response.data) {
				if (Array.isArray(response.data)) {
					categoryData = response.data;
				} else if (response.data.data && Array.isArray(response.data.data)) {
					categoryData = response.data.data;
				}
			} else if (Array.isArray(response)) {
				categoryData = response;
			}

			console.log("Categorías principales procesadas:", {
				count: categoryData.length,
				sample: categoryData.slice(0, 2)
			});

			return categoryData;
		} catch (error) {
			console.error("Error al obtener categorías principales:", error);
			return [];
		}
	}

	/**
	 * Obtiene categorías destacadas
	 */
	async getFeaturedCategories(limit: number = 8): Promise<Category[]> {
		try {
			console.log(`Obteniendo categorías destacadas (límite: ${limit})`);

			// Usar el endpoint general con filtro de destacadas
			const response = await ApiClient.get<any>(API_ENDPOINTS.CATEGORIES.LIST, {
				featured: true,
				limit: limit,
				active: true,
				withCounts: true,
			});

			console.log("Respuesta raw de categorías destacadas:", response);

			// Manejar diferentes estructuras de respuesta
			let categoryData: Category[] = [];

			if (response && response.data) {
				if (Array.isArray(response.data)) {
					categoryData = response.data;
				} else if (response.data.data && Array.isArray(response.data.data)) {
					categoryData = response.data.data;
				}
			} else if (Array.isArray(response)) {
				categoryData = response;
			}

			console.log("Categorías destacadas procesadas:", {
				count: categoryData.length,
				sample: categoryData.slice(0, 2)
			});

			return categoryData;
		} catch (error) {
			console.error("Error al obtener categorías destacadas:", error);
			return [];
		}
	}

	/**
	 * Obtiene detalles de una categoría por ID
	 */
	async getCategoryById(id: number): Promise<Category | null> {
		try {
			console.log(`Obteniendo categoría con ID ${id}`);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CATEGORIES.DETAILS(id)
			);

			console.log(`Respuesta raw de categoría ID ${id}:`, response);

			// Manejar diferentes estructuras de respuesta
			let categoryData = null;

			if (response && response.data) {
				if (typeof response.data === "object") {
					categoryData = response.data;
				}
			} else if (response && typeof response === "object") {
				categoryData = response;
			}

			return categoryData;
		} catch (error) {
			console.error(`Error al obtener categoría ${id}:`, error);
			return null;
		}
	}

	/**
	 * Obtiene una categoría por su slug
	 */
	async getCategoryBySlug(
		slug: string,
		withSubcategories: boolean = true,
		withProducts: boolean = false,
		productsLimit: number = 8
	): Promise<Category | null> {
		try {
			console.log(`Obteniendo categoría con slug ${slug}`);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CATEGORIES.SLUG(slug),
				{
					withSubcategories: withSubcategories,
					withProducts: withProducts,
					productsLimit: productsLimit,
				}
			);

			console.log(`Respuesta raw de categoría slug ${slug}:`, response);

			// Manejar diferentes estructuras de respuesta
			let categoryData = null;

			if (response && response.data) {
				if (typeof response.data === "object") {
					categoryData = response.data;
				}
			} else if (response && typeof response === "object") {
				categoryData = response;
			}

			return categoryData;
		} catch (error) {
			console.error(`Error al obtener categoría con slug ${slug}:`, error);
			return null;
		}
	}

	/**
	 * Obtiene subcategorías de una categoría
	 */
	async getSubcategories(categoryId: number): Promise<Category[]> {
		try {
			console.log(`Obteniendo subcategorías para categoría ${categoryId}`);

			// Primero intentamos usar el endpoint específico
			try {
				const response = await ApiClient.get<any>(
					API_ENDPOINTS.CATEGORIES.SUBCATEGORIES(categoryId)
				);

				console.log(`Respuesta raw de subcategorías para ${categoryId}:`, response);

				// Manejar diferentes estructuras de respuesta
				let categoryData: Category[] = [];

				if (response && response.data) {
					if (Array.isArray(response.data)) {
						return response.data;
					} else if (response.data.data && Array.isArray(response.data.data)) {
						return response.data.data;
					}
				} else if (Array.isArray(response)) {
					return response;
				}

				return categoryData;
			} catch (error) {
				// Si el endpoint específico falla, intentamos con el endpoint general filtrado
				console.log("Endpoint específico falló, intentando alternativa");

				const response = await ApiClient.get<any>(
					API_ENDPOINTS.CATEGORIES.LIST,
					{
						parent_id: categoryId,
						active: true,
					}
				);

				// Manejar diferentes estructuras de respuesta
				let categoryData: Category[] = [];

				if (response && response.data) {
					if (Array.isArray(response.data)) {
						return response.data;
					} else if (response.data.data && Array.isArray(response.data.data)) {
						return response.data.data;
					}
				} else if (Array.isArray(response)) {
					return response;
				}

				return categoryData;
			}
		} catch (error) {
			console.error(
				`Error al obtener subcategorías para ${categoryId}:`,
				error
			);
			return [];
		}
	}

	/**
	 * Crea una nueva categoría
	 */
	async createCategory(data: CategoryCreationData): Promise<Category | null> {
		try {
			console.log("Creando nueva categoría:", data);

			// Para manejar imágenes, usamos FormData
			const formData = new FormData();

			// Añadir datos básicos
			Object.entries(data).forEach(([key, value]) => {
				if (key !== "image" && value !== undefined) {
					formData.append(key, String(value));
				}
			});

			// Añadir imagen si existe
			if (data.image) {
				formData.append("image", data.image);
			}

			const response = await ApiClient.uploadFile<any>(
				API_ENDPOINTS.CATEGORIES.CREATE,
				formData
			);

			console.log("Respuesta raw de creación de categoría:", response);

			// Manejar diferentes estructuras de respuesta
			let categoryData = null;

			if (response && response.data) {
				if (typeof response.data === "object") {
					categoryData = response.data;
				}
			} else if (response && typeof response === "object") {
				categoryData = response;
			}

			return categoryData;
		} catch (error) {
			console.error("Error al crear categoría:", error);
			return null;
		}
	}

	/**
	 * Actualiza una categoría existente
	 */
	async updateCategory(
		id: number,
		data: CategoryUpdateData
	): Promise<Category | null> {
		try {
			console.log(`Actualizando categoría ${id}:`, data);

			// Para manejar imágenes, usamos FormData
			const formData = new FormData();

			// Añadir datos básicos
			Object.entries(data).forEach(([key, value]) => {
				if (key !== "image" && key !== "id" && value !== undefined) {
					formData.append(key, String(value));
				}
			});

			// Añadir imagen si existe
			if (data.image) {
				formData.append("image", data.image);
			}

			const response = await ApiClient.uploadFile<any>(
				API_ENDPOINTS.CATEGORIES.UPDATE(id),
				formData
			);

			console.log(`Respuesta raw de actualización de categoría ${id}:`, response);

			// Manejar diferentes estructuras de respuesta
			let categoryData = null;

			if (response && response.data) {
				if (typeof response.data === "object") {
					categoryData = response.data;
				}
			} else if (response && typeof response === "object") {
				categoryData = response;
			}

			return categoryData;
		} catch (error) {
			console.error(`Error al actualizar categoría ${id}:`, error);
			return null;
		}
	}

	/**
	 * Elimina una categoría
	 */
	async deleteCategory(id: number): Promise<boolean> {
		try {
			console.log(`Eliminando categoría ${id}`);

			const response = await ApiClient.delete<any>(
				API_ENDPOINTS.CATEGORIES.DELETE(id)
			);

			console.log(`Respuesta raw de eliminación de categoría ${id}:`, response);

			// Verificar resultado
			const success =
				(response && response.success) ||
				(response && response.status === "success") ||
				(response && response.message && response.message.includes("éxito")) ||
				(response && response.data && response.data.success) ||
				false;

			return success;
		} catch (error) {
			console.error(`Error al eliminar categoría ${id}:`, error);
			return false;
		}
	}
}

export default CategoryService;