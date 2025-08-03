// src/core/services/ProductService.ts

import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import type {
	Product,
	ProductDetail,
	ProductCreationData,
	ProductListResponse,
} from "../domain/entities/Product";
import type { ExtendedProductFilterParams } from "../../presentation/types/ProductFilterParams";
import type { ServiceResponse } from "../../presentation/types/admin/ProductFilterParams";

export class ProductService {
	/**
	 * Obtiene productos con filtros opcionales
	 */
	async getProducts(
		filterParams?: ExtendedProductFilterParams
	): Promise<ProductListResponse | null> {
		try {
			console.log(
				"📤 ProductService: Enviando petición con parámetros:",
				filterParams
			);

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
	 * Elimina un producto
	 */
	async deleteProduct(id: number): Promise<boolean> {
		try {
			const response = await ApiClient.delete<ServiceResponse>(
				API_ENDPOINTS.PRODUCTS.DELETE(id)
			);
			return response?.success === true;
		} catch (error) {
			console.error(`Error al eliminar producto ${id}:`, error);
			return false;
		}
	}
	/**
	 * Crea un nuevo producto
	 */
	async createProduct(data: ProductCreationData): Promise<Product> {
		try {
			console.log("📤 ProductService: Creando producto:", data);

			const formData = new FormData();

			// Campos básicos
			formData.append("name", data.name);
			formData.append("description", data.description);
			formData.append("price", String(data.price));
			formData.append("stock", String(data.stock));
			formData.append("category_id", String(data.category_id));

			// Campos opcionales
			if (data.shortDescription)
				formData.append("short_description", data.shortDescription);
			if (data.weight !== undefined)
				formData.append("weight", String(data.weight));
			if (data.width !== undefined)
				formData.append("width", String(data.width));
			if (data.height !== undefined)
				formData.append("height", String(data.height));
			if (data.depth !== undefined)
				formData.append("depth", String(data.depth));
			if (data.dimensions) formData.append("dimensions", data.dimensions);
			if (data.sku) formData.append("sku", data.sku);
			if (data.status) formData.append("status", data.status);
			if (data.featured !== undefined)
				formData.append("featured", String(data.featured));
			if (data.published !== undefined)
				formData.append("published", String(data.published));
			if (data.discount_percentage !== undefined) {
				formData.append(
					"discount_percentage",
					String(data.discount_percentage)
				);
			}

			// Arrays
			if (data.colors) {
				const colorsValue =
					typeof data.colors === "string"
						? data.colors
						: JSON.stringify(data.colors);
				formData.append("colors", colorsValue);
			}
			if (data.sizes) {
				const sizesValue =
					typeof data.sizes === "string"
						? data.sizes
						: JSON.stringify(data.sizes);
				formData.append("sizes", sizesValue);
			}
			if (data.tags) {
				const tagsValue =
					typeof data.tags === "string" ? data.tags : JSON.stringify(data.tags);
				formData.append("tags", tagsValue);
			}

			// Atributos
			if (data.attributes && Object.keys(data.attributes).length > 0) {
				formData.append("attributes", JSON.stringify(data.attributes));
			}

			// Imágenes
			if (data.images && data.images.length > 0) {
				data.images.forEach((file, index) => {
					formData.append(`images[${index}]`, file);
				});
			}

			const response = await ApiClient.uploadFile<Product>(
				API_ENDPOINTS.PRODUCTS.CREATE,
				formData
			);

			console.log("✅ ProductService: Producto creado:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en ProductService.createProduct:", error);
			throw error;
		}
	}

	/**
	 * Obtiene un producto por ID
	 */
	async getProductById(id: number): Promise<ProductDetail | null> {
		try {
			const response = await ApiClient.get<{data: ProductDetail}>(
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
			const response = await ApiClient.get<{data: ProductDetail}>(
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
				{limit}
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
				{limit, excludeId: productId}
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
			await ApiClient.post(API_ENDPOINTS.PRODUCTS.INCREMENT_VIEW(productId), {
				timestamp: new Date().toISOString(),
			});
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
				{limit, offset}
			);
			return response;
		} catch (error) {
			console.error("❌ Error en ProductService.getProductsByCategory:", error);
			return null;
		}
	}

	/**
	 * Obtiene productos destacados aleatorios
	 */
	static async getFeaturedRandom(limit: number = 6): Promise<ProductListResponse> {
		try {
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.FEATURED_RANDOM,
				{limit}
			);
			return response || { data: [], meta: { total: 0, count: 0 } };
		} catch (error) {
			console.error("❌ Error en ProductService.getFeaturedRandom:", error);
			return { data: [], meta: {
				total: 0, count: 0,
				limit: 0,
				offset: 0
			} };
		}
	}

	/**
	 * Obtiene productos trending y ofertas
	 */
	static async getTrendingAndOffers(limit: number = 12): Promise<ProductListResponse> {
		try {
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.TRENDING_OFFERS,
				{limit}
			);
			return response || { data: [], meta: { total: 0, count: 0 } };
		} catch (error) {
			console.error("❌ Error en ProductService.getTrendingAndOffers:", error);
			return { data: [], meta: {
				total: 0, count: 0,
				limit: 0,
				offset: 0
			} };
		}
	}

	/**
	 * Obtiene productos personalizados para el usuario
	 */
	static async getPersonalizedProducts(limit: number = 10): Promise<ProductListResponse> {
		try {
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.PERSONALIZED,
				{limit}
			);
			return response || { data: [], meta: { total: 0, count: 0 } };
		} catch (error) {
			console.error("❌ Error en ProductService.getPersonalizedProducts:", error);
			return { data: [], meta: {
				total: 0, count: 0,
				limit: 0,
				offset: 0
			} };
		}
	}

	/**
	 * Obtiene productos con descuento
	 */
	static async getDiscountedProducts(limit: number = 12): Promise<ProductListResponse> {
		try {
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.DISCOUNTED,
				{limit}
			);
			return response || { data: [], meta: { total: 0, count: 0 } };
		} catch (error) {
			console.error("❌ Error en ProductService.getDiscountedProducts:", error);
			return { data: [], meta: {
				total: 0, count: 0,
				limit: 0,
				offset: 0
			} };
		}
	}

	/**
	 * Obtiene productos populares
	 */
	static async getPopularProducts(limit: number = 12): Promise<ProductListResponse> {
		try {
			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.POPULAR,
				{limit}
			);
			return response || { data: [], meta: { total: 0, count: 0 } };
		} catch (error) {
			console.error("❌ Error en ProductService.getPopularProducts:", error);
			return { data: [], meta: {
				total: 0, count: 0,
				limit: 0,
				offset: 0
			} };
		}
	}
}