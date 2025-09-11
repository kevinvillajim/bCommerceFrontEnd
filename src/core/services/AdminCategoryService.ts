// src/core/services/AdminCategoryService.ts - NUEVO

import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Category,
	CategoryListResponse,
	CategoryCreationData,
	CategoryUpdateData,
	CategoryFilterParams,
} from "../domain/entities/Category";

/**
 * Servicio de administración de categorías - Solo para administradores
 * Permite gestionar cualquier categoría en el sistema usando las rutas de admin
 */
export class AdminCategoryService {
	/**
	 * Obtiene todas las categorías del sistema (como admin)
	 */
	async getAllCategories(
		filterParams?: CategoryFilterParams
	): Promise<CategoryListResponse | null> {
		try {
			console.log(
				"📤 AdminCategoryService: Obteniendo todas las categorías como admin:",
				filterParams
			);

			// Usar la ruta pública pero con permisos de admin
			const response = await ApiClient.get<CategoryListResponse>(
				API_ENDPOINTS.CATEGORIES.LIST,
				filterParams
			);

			console.log("📥 AdminCategoryService: Respuesta del servidor:", response);
			return response;
		} catch (error) {
			console.error(
				"❌ Error en AdminCategoryService.getAllCategories:",
				error
			);
			return null;
		}
	}

	/**
	 * Obtiene una categoría por ID (como admin)
	 */
	async getCategoryById(id: number): Promise<Category | null> {
		try {
			console.log(
				`📤 AdminCategoryService: Obteniendo categoría ${id} como admin`
			);

			const response = await ApiClient.get<Category>(
				API_ENDPOINTS.CATEGORIES.DETAILS(id)
			);

			console.log("✅ AdminCategoryService: Categoría obtenida:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en AdminCategoryService.getCategoryById:", error);
			return null;
		}
	}

	/**
	 * Crea una categoría (como admin)
	 */
	async createCategory(data: CategoryCreationData): Promise<Category | null> {
		try {
			console.log(
				"📤 AdminCategoryService: Creando categoría como admin:",
				data
			);

			// USAR RUTA ADMIN ESPECÍFICA
			const response = await ApiClient.post<Category>(
				API_ENDPOINTS.ADMIN.CATEGORIES.CREATE,
				data
			);

			console.log("✅ AdminCategoryService: Categoría creada:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en AdminCategoryService.createCategory:", error);
			return null;
		}
	}

	/**
	 * Actualiza cualquier categoría (como admin)
	 */
	async updateCategory(data: CategoryUpdateData): Promise<Category | null> {
		try {
			console.log(
				`📤 AdminCategoryService: Actualizando categoría ${data.id} como admin:`,
				data
			);

			if (!data.id) {
				throw new Error("ID de categoría requerido para actualización");
			}

			// USAR RUTA ADMIN ESPECÍFICA
			const response = await ApiClient.put<Category>(
				API_ENDPOINTS.ADMIN.CATEGORIES.UPDATE(data.id),
				data
			);

			console.log("✅ AdminCategoryService: Categoría actualizada:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en AdminCategoryService.updateCategory:", error);
			return null;
		}
	}

	/**
	 * Actualización parcial de categoría (como admin) - PATCH
	 */
	async partialUpdateCategory(
		id: number,
		data: Partial<CategoryUpdateData>
	): Promise<Category | null> {
		try {
			console.log(
				`📤 AdminCategoryService: Actualizando parcialmente categoría ${id} como admin:`,
				data
			);

			// USAR RUTA ADMIN PATCH ESPECÍFICA
			const response = await ApiClient.patch<Category>(
				API_ENDPOINTS.ADMIN.CATEGORIES.PARTIAL_UPDATE(id),
				data
			);

			console.log(
				"✅ AdminCategoryService: Categoría actualizada parcialmente:",
				response
			);
			return response;
		} catch (error) {
			console.error(
				"❌ Error en AdminCategoryService.partialUpdateCategory:",
				error
			);
			return null;
		}
	}

	/**
	 * Elimina cualquier categoría (como admin)
	 */
	async deleteCategory(id: number): Promise<boolean> {
		try {
			console.log(
				`📤 AdminCategoryService: Eliminando categoría ${id} como admin`
			);

			// USAR RUTA ADMIN ESPECÍFICA
			const response = await ApiClient.delete(
				API_ENDPOINTS.ADMIN.CATEGORIES.DELETE(id)
			);

			console.log("✅ AdminCategoryService: Categoría eliminada:", response);
			return true;
		} catch (error) {
			console.error("❌ Error en AdminCategoryService.deleteCategory:", error);
			return false;
		}
	}

	/**
	 * Cambia el estado activo de una categoría - PATCH
	 */
	async toggleActive(id: number, is_active: boolean): Promise<boolean> {
		try {
			console.log(
				`📤 AdminCategoryService: Cambiando estado activo de categoría ${id} a ${is_active}`
			);

			// USAR RUTA ADMIN PATCH ESPECÍFICA
			const response = await ApiClient.patch(
				API_ENDPOINTS.ADMIN.CATEGORIES.PARTIAL_UPDATE(id),
				{is_active: is_active}
			);

			console.log(
				"✅ AdminCategoryService: Estado activo actualizado:",
				response
			);
			return true;
		} catch (error) {
			console.error("❌ Error en AdminCategoryService.toggleActive:", error);
			if (error instanceof Error) {
				console.error("Error message:", error.message);
			}
			return false;
		}
	}

	/**
	 * Cambia el estado destacado de una categoría - PATCH
	 */
	async toggleFeatured(id: number, featured: boolean): Promise<boolean> {
		try {
			console.log(
				`📤 AdminCategoryService: Cambiando estado destacado de categoría ${id} a ${featured}`
			);

			// USAR RUTA ADMIN PATCH ESPECÍFICA
			const response = await ApiClient.patch(
				API_ENDPOINTS.ADMIN.CATEGORIES.PARTIAL_UPDATE(id),
				{featured: featured}
			);

			console.log(
				"✅ AdminCategoryService: Estado destacado actualizado:",
				response
			);
			return true;
		} catch (error) {
			console.error("❌ Error en AdminCategoryService.toggleFeatured:", error);
			if (error instanceof Error) {
				console.error("Error message:", error.message);
			}
			return false;
		}
	}

	/**
	 * Actualiza el orden de una categoría - PATCH
	 */
	async updateOrder(id: number, order: number): Promise<boolean> {
		try {
			console.log(
				`📤 AdminCategoryService: Actualizando orden de categoría ${id} a ${order}`
			);

			// USAR RUTA ADMIN PATCH ESPECÍFICA
			const response = await ApiClient.patch(
				API_ENDPOINTS.ADMIN.CATEGORIES.PARTIAL_UPDATE(id),
				{order: order}
			);

			console.log("✅ AdminCategoryService: Orden actualizado:", response);
			return true;
		} catch (error) {
			console.error("❌ Error en AdminCategoryService.updateOrder:", error);
			if (error instanceof Error) {
				console.error("Error message:", error.message);
			}
			return false;
		}
	}

	/**
	 * Obtiene categorías principales (como admin)
	 */
	async getMainCategories(withCounts: boolean = true): Promise<Category[]> {
		try {
			console.log(
				"📤 AdminCategoryService: Obteniendo categorías principales como admin"
			);

			const response = await ApiClient.get<{data: Category[]}>(
				API_ENDPOINTS.CATEGORIES.MAIN,
				{with_counts: withCounts}
			);

			console.log(
				"✅ AdminCategoryService: Categorías principales obtenidas:",
				response
			);
			return response?.data || [];
		} catch (error) {
			console.error(
				"❌ Error en AdminCategoryService.getMainCategories:",
				error
			);
			return [];
		}
	}

	/**
	 * Obtiene subcategorías de una categoría (como admin)
	 */
	async getSubcategories(parentId: number): Promise<Category[]> {
		try {
			console.log(
				`📤 AdminCategoryService: Obteniendo subcategorías de ${parentId} como admin`
			);

			const response = await ApiClient.get<{data: Category[]}>(
				API_ENDPOINTS.CATEGORIES.SUBCATEGORIES(parentId)
			);

			console.log(
				"✅ AdminCategoryService: Subcategorías obtenidas:",
				response
			);
			return response?.data || [];
		} catch (error) {
			console.error(
				"❌ Error en AdminCategoryService.getSubcategories:",
				error
			);
			return [];
		}
	}
}

export default AdminCategoryService;
