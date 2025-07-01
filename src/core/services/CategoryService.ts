// src/core/services/CategoryService.ts - ACTUALIZADO

import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Category,
	CategoryListResponse,
	CategoryFilterParams,
} from "../domain/entities/Category";

/**
 * Servicio de categorías - Para usuarios normales y operaciones de solo lectura
 * NO incluye operaciones de creación, actualización o eliminación
 * Esas operaciones están en AdminCategoryService
 */
export class CategoryService {
	/**
	 * Obtiene categorías (solo lectura)
	 */
	async getCategories(
		filterParams?: CategoryFilterParams
	): Promise<CategoryListResponse | null> {
		try {
			console.log("📤 CategoryService: Obteniendo categorías:", filterParams);

			const response = await ApiClient.get<CategoryListResponse>(
				API_ENDPOINTS.CATEGORIES.LIST,
				filterParams
			);

			console.log("📥 CategoryService: Respuesta del servidor:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en CategoryService.getCategories:", error);
			return null;
		}
	}

	/**
	 * Obtiene una categoría por ID (solo lectura)
	 */
	async getCategoryById(id: number): Promise<Category | null> {
		try {
			console.log(`📤 CategoryService: Obteniendo categoría ${id}`);

			const response = await ApiClient.get<Category>(
				API_ENDPOINTS.CATEGORIES.DETAILS(id)
			);

			console.log("✅ CategoryService: Categoría obtenida:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en CategoryService.getCategoryById:", error);
			return null;
		}
	}

	/**
	 * Obtiene una categoría por slug (solo lectura)
	 */
	async getCategoryBySlug(slug: string): Promise<Category | null> {
		try {
			console.log(`📤 CategoryService: Obteniendo categoría por slug ${slug}`);

			const response = await ApiClient.get<Category>(
				API_ENDPOINTS.CATEGORIES.SLUG(slug)
			);

			console.log("✅ CategoryService: Categoría obtenida por slug:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en CategoryService.getCategoryBySlug:", error);
			return null;
		}
	}

	/**
	 * Obtiene categorías principales (solo lectura)
	 */
	async getMainCategories(withCounts: boolean = true): Promise<Category[]> {
		try {
			console.log("📤 CategoryService: Obteniendo categorías principales");

			const response = await ApiClient.get<Category[]>(
				API_ENDPOINTS.CATEGORIES.MAIN,
				{with_counts: withCounts}
			);

			console.log(
				"✅ CategoryService: Categorías principales obtenidas:",
				response
			);
			return response || [];
		} catch (error) {
			console.error("❌ Error en CategoryService.getMainCategories:", error);
			return [];
		}
	}

	/**
	 * Obtiene categorías destacadas (solo lectura)
	 */
	async getFeaturedCategories(limit: number = 8): Promise<Category[]> {
		try {
			console.log("📤 CategoryService: Obteniendo categorías destacadas");

			const response = await ApiClient.get<Category[]>(
				API_ENDPOINTS.CATEGORIES.FEATURED, {limit}
			);

			console.log(
				"✅ CategoryService: Categorías destacadas obtenidas:",
				response
			);
			return response || [];
		} catch (error) {
			console.error(
				"❌ Error en CategoryService.getFeaturedCategories:",
				error
			);
			return [];
		}
	}

	/**
	 * Obtiene subcategorías de una categoría (solo lectura)
	 */
	async getSubcategories(parentId: number): Promise<Category[]> {
		try {
			console.log(
				`📤 CategoryService: Obteniendo subcategorías de ${parentId}`
			);

			const response = await ApiClient.get<Category[]>(
				API_ENDPOINTS.CATEGORIES.SUBCATEGORIES(parentId)
			);

			console.log("✅ CategoryService: Subcategorías obtenidas:", response);
			return response || [];
		} catch (error) {
			console.error("❌ Error en CategoryService.getSubcategories:", error);
			return [];
		}
	}

	/**
	 * Obtiene productos de una categoría (solo lectura)
	 */
	async getCategoryProducts(
		categoryId: number,
		filterParams?: any
	): Promise<any> {
		try {
			console.log(
				`📤 CategoryService: Obteniendo productos de categoría ${categoryId}`
			);

			const response = await ApiClient.get(
				API_ENDPOINTS.CATEGORIES.PRODUCTS(categoryId),
				filterParams
			);

			console.log(
				"✅ CategoryService: Productos de categoría obtenidos:",
				response
			);
			return response;
		} catch (error) {
			console.error("❌ Error en CategoryService.getCategoryProducts:", error);
			return null;
		}
	}
}

export default CategoryService;
