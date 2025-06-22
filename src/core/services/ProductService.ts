// src/core/services/ProductService.ts

import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import type {
	Product,
	ProductDetail,
	ProductFilterParams,
	ProductListResponse,
} from "../domain/entities/Product";
import type { ExtendedProductFilterParams } from "../../presentation/types/ProductFilterParams";

export class ProductService {
	/**
	 * Obtiene productos con filtros opcionales
	 */
	async getProducts(
		filterParams?: ExtendedProductFilterParams
	): Promise<ProductListResponse | null> {
		try {
			console.log("📤 ProductService: Enviando petición con parámetros:", filterParams);
			
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.LIST,
				filterParams
			);
			
			console.log("📥 ProductService: Respuesta del servidor:", response);
			
			return response;
		} catch (error) {
			console.error("❌ Error en ProductService.getProducts:", error);
			return null;
		}
	}

	/**
	 * Obtiene un producto por ID
	 */
	async getProductById(id: number): Promise<ProductDetail | null> {
		try {
			const response = await ApiClient.get<{ data: ProductDetail }>(
				API_ENDPOINTS.PRODUCTS.DETAILS(id)
			);
			return response?.data || null;
		} catch (error) {
			console.error("❌ Error en ProductService.getProductById:", error);
			return null;
		}
	}

	/**
	 * Obtiene un producto por slug
	 */
	async getProductBySlug(slug: string): Promise<ProductDetail | null> {
		try {
			const response = await ApiClient.get<{ data: ProductDetail }>(
				API_ENDPOINTS.PRODUCTS.DETAILS_BY_SLUG(slug)
			);
			return response?.data || null;
		} catch (error) {
			console.error("❌ Error en ProductService.getProductBySlug:", error);
			return null;
		}
	}

	/**
	 * Obtiene productos destacados
	 */
	async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
		try {
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.FEATURED,
				{ limit }
			);
			return response?.data || [];
		} catch (error) {
			console.error("❌ Error en ProductService.getFeaturedProducts:", error);
			return [];
		}
	}

	/**
	 * Obtiene productos relacionados
	 */
	async getRelatedProducts(
		productId: number,
		limit: number = 4
	): Promise<Product[]> {
		try {
			// Obtener productos de la misma categoría o similares
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.LIST,
				{ limit, excludeId: productId }
			);
			return response?.data || [];
		} catch (error) {
			console.error("❌ Error en ProductService.getRelatedProducts:", error);
			return [];
		}
	}

	/**
	 * Busca productos por término
	 */
	async searchProducts(
		term: string,
		filterParams?: ExtendedProductFilterParams
	): Promise<ProductListResponse | null> {
		try {
			// Usar el endpoint de búsqueda con el término
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.SEARCH(term),
				filterParams
			);
			return response;
		} catch (error) {
			console.error("❌ Error en ProductService.searchProducts:", error);
			return null;
		}
	}

	/**
	 * Registra visualización de producto
	 */
	async trackProductView(productId: number): Promise<void> {
		try {
			await ApiClient.post(
				API_ENDPOINTS.PRODUCTS.INCREMENT_VIEW(productId),
				{
					timestamp: new Date().toISOString(),
				}
			);
		} catch (error) {
			console.error("❌ Error en ProductService.trackProductView:", error);
		}
	}

	/**
	 * Obtiene productos por categoría
	 */
	async getProductsByCategory(
		categoryId: number,
		limit: number = 12,
		offset: number = 0
	): Promise<ProductListResponse | null> {
		try {
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.BY_CATEGORY(categoryId),
				{ limit, offset }
			);
			return response;
		} catch (error) {
			console.error("❌ Error en ProductService.getProductsByCategory:", error);
			return null;
		}
	}
}