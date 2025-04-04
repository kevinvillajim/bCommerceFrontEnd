// src/core/services/CategoryService.ts
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

			// Construir parámetros de API
			const apiParams: Record<string, any> = {};

			if (params) {
				if (params.parent_id !== undefined)
					apiParams.parent_id = params.parent_id;
				if (params.featured !== undefined) apiParams.featured = params.featured;
				if (params.is_active !== undefined)
					apiParams.is_active = params.is_active;
				if (params.term) apiParams.term = params.term;
				if (params.limit !== undefined) apiParams.limit = params.limit;
				if (params.offset !== undefined) apiParams.offset = params.offset;
				if (params.sort_by) apiParams.sort_by = params.sort_by;
				if (params.sort_dir) apiParams.sort_dir = params.sort_dir;
				if (params.with_counts !== undefined)
					apiParams.with_counts = params.with_counts;
				if (params.with_children !== undefined)
					apiParams.with_children = params.with_children;
			}

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CATEGORIES.LIST,
				apiParams
			);

			console.log("Respuesta de API de categorías:", response);

			// Verificar estructura de respuesta
			if (response && "data" in response && Array.isArray(response.data)) {
				// La respuesta ya tiene la estructura esperada
				return {
					data: response.data,
					meta: response.meta || {
						total: response.data.length,
						limit: params?.limit || 10,
						offset: params?.offset || 0,
					},
				};
			} else if (response && Array.isArray(response)) {
				// La respuesta es un array directo
				return {
					data: response,
					meta: {
						total: response.length,
						limit: params?.limit || 10,
						offset: params?.offset || 0,
					},
				};
			} else if (
				response &&
				response.data &&
				Array.isArray(response.data.data)
			) {
				// La respuesta tiene estructura anidada data.data
				return {
					data: response.data.data,
					meta: response.data.meta || {
						total: response.data.data.length,
						limit: params?.limit || 10,
						offset: params?.offset || 0,
					},
				};
			}

			// Si llegamos aquí, la estructura no es reconocida
			console.warn(
				"Estructura de respuesta de categorías no reconocida:",
				response
			);
			return {
				data: [],
				meta: {
					total: 0,
					limit: params?.limit || 10,
					offset: params?.offset || 0,
				},
			};
		} catch (error) {
			console.error("Error al obtener categorías:", error);
			return {
				data: [],
				meta: {
					total: 0,
					limit: params?.limit || 10,
					offset: params?.offset || 0,
				},
			};
		}
	}

	/**
	 * Obtiene categorías principales (sin parent)
	 */
	async getMainCategories(withChildren: boolean = false): Promise<Category[]> {
		try {
			console.log(
				`Obteniendo categorías principales (con hijos: ${withChildren})`
			);

			const response = await ApiClient.get<any>(API_ENDPOINTS.CATEGORIES.MAIN, {
				withChildren: withChildren,
			});

			console.log("Respuesta de categorías principales:", response);

			// Manejar diferentes estructuras de respuesta
			if (response && Array.isArray(response)) {
				return response;
			} else if (response && Array.isArray(response.data)) {
				return response.data;
			} else if (
				response &&
				response.data &&
				Array.isArray(response.data.data)
			) {
				return response.data.data;
			}

			return [];
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

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CATEGORIES.FEATURED,
				{limit}
			);

			console.log("Respuesta de categorías destacadas:", response);

			// Manejar diferentes estructuras de respuesta
			if (response && Array.isArray(response)) {
				return response;
			} else if (response && Array.isArray(response.data)) {
				return response.data;
			} else if (
				response &&
				response.data &&
				Array.isArray(response.data.data)
			) {
				return response.data.data;
			}

			return [];
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

			console.log(`Respuesta de categoría ID ${id}:`, response);

			// Manejar diferentes estructuras de respuesta
			if (response && typeof response === "object") {
				return response;
			} else if (
				response &&
				response.data &&
				typeof response.data === "object"
			) {
				return response.data;
			}

			return null;
		} catch (error) {
			console.error(`Error al obtener categoría ${id}:`, error);
			return null;
		}
	}

	/**
	 * Obtiene una categoría por su slug
	 */
	async getCategoryBySlug(slug: string): Promise<Category | null> {
		try {
			console.log(`Obteniendo categoría con slug ${slug}`);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CATEGORIES.SLUG(slug)
			);

			console.log(`Respuesta de categoría slug ${slug}:`, response);

			// Manejar diferentes estructuras de respuesta
			if (response && typeof response === "object") {
				return response;
			} else if (
				response &&
				response.data &&
				typeof response.data === "object"
			) {
				return response.data;
			}

			return null;
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

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.CATEGORIES.SUBCATEGORIES(categoryId)
			);

			console.log(`Respuesta de subcategorías para ${categoryId}:`, response);

			// Manejar diferentes estructuras de respuesta
			if (response && Array.isArray(response)) {
				return response;
			} else if (response && Array.isArray(response.data)) {
				return response.data;
			} else if (
				response &&
				response.data &&
				Array.isArray(response.data.data)
			) {
				return response.data.data;
			}

			return [];
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
				if (key !== "image") {
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

			console.log("Respuesta de creación de categoría:", response);

			// Manejar diferentes estructuras de respuesta
			if (response && typeof response === "object") {
				return response;
			} else if (
				response &&
				response.data &&
				typeof response.data === "object"
			) {
				return response.data;
			}

			return null;
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
				if (key !== "image") {
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

			console.log(`Respuesta de actualización de categoría ${id}:`, response);

			// Manejar diferentes estructuras de respuesta
			if (response && typeof response === "object") {
				return response;
			} else if (
				response &&
				response.data &&
				typeof response.data === "object"
			) {
				return response.data;
			}

			return null;
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

			console.log(`Respuesta de eliminación de categoría ${id}:`, response);

			// Verificar resultado
			const success =
				(response && response.success) ||
				(response && response.status === "success") ||
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
