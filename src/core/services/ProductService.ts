// src/core/services/ProductService.ts
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Product,
	ProductDetail,
	ProductListResponse,
	ProductCreationData,
	ProductUpdateData,
	ProductFilterParams,
} from "../domain/entities/Product";
import type {IProductService} from "../domain/interfaces/IProductService";
import ApiClient from "../../infrastructure/api/apiClient";

/**
 * Implementación del servicio de productos
 */
export class ProductService implements IProductService {
	/**
	 * Obtiene una lista de productos con filtros opcionales
	 */
	async getProducts(
		filterParams?: ProductFilterParams
	): Promise<ProductListResponse> {
		try {
			console.log("Obteniendo productos con parámetros:", filterParams);

			// Adaptamos los nombres de los parámetros para la API
			const apiParams: Record<string, any> = {};

			if (filterParams) {
				// Mapeamos los parámetros de nuestra aplicación a los que espera la API
				if (filterParams.limit !== undefined)
					apiParams.limit = filterParams.limit;
				if (filterParams.offset !== undefined)
					apiParams.offset = filterParams.offset;
				if (filterParams.term) apiParams.term = filterParams.term;

				// Para filtros de categoría, usamos categoryId o categoryIds según corresponda
				if (filterParams.categoryIds && filterParams.categoryIds.length > 0) {
					// La API espera category_id como string separado por comas
					apiParams.category_id = filterParams.categoryIds.join(",");
				} else if (filterParams.categoryId) {
					apiParams.category_id = filterParams.categoryId;
				}

				if (filterParams.minPrice !== undefined)
					apiParams.min_price = filterParams.minPrice;
				if (filterParams.maxPrice !== undefined)
					apiParams.max_price = filterParams.maxPrice;
				if (filterParams.rating !== undefined)
					apiParams.rating = filterParams.rating;
				if (filterParams.featured !== undefined)
					apiParams.featured = filterParams.featured;
				if (filterParams.sellerId !== undefined)
					apiParams.seller_id = filterParams.sellerId;
				if (filterParams.status) apiParams.status = filterParams.status;
				if (filterParams.tags)
					apiParams.tags = Array.isArray(filterParams.tags)
						? filterParams.tags.join(",")
						: filterParams.tags;
				if (filterParams.colors)
					apiParams.colors = Array.isArray(filterParams.colors)
						? filterParams.colors.join(",")
						: filterParams.colors;
				if (filterParams.sizes)
					apiParams.sizes = Array.isArray(filterParams.sizes)
						? filterParams.sizes.join(",")
						: filterParams.sizes;
				if (filterParams.inStock !== undefined)
					apiParams.in_stock = filterParams.inStock;

				// Añadir parámetros de ordenamiento
				if (filterParams.sortBy) {
					apiParams.sort_by = filterParams.sortBy;
					if (filterParams.sortDir) {
						apiParams.sort_dir = filterParams.sortDir;
					}
				}
			}

			console.log("Parámetros de API:", apiParams);

			const response = await ApiClient.get<any>(
				API_ENDPOINTS.PRODUCTS.LIST,
				apiParams
			);

			console.log("Respuesta de API de productos:", response);

			// Verificar si la respuesta ya tiene la estructura esperada
			if (response && "data" in response && "meta" in response) {
				return response as ProductListResponse;
			}

			// Si la estructura es diferente, adaptarla al formato esperado
			if (response) {
				// Algunos backends devuelven los datos dentro de un objeto 'data'
				const productos = Array.isArray(response)
					? response
					: Array.isArray(response.data)
						? response.data
						: [];

				const meta = response.meta || {
					total: productos.length,
					limit: filterParams?.limit || 10,
					offset: filterParams?.offset || 0,
				};

				return {
					data: productos,
					meta: meta,
				};
			}

			// Devolver estructura vacía si no hay respuesta
			return {
				data: [],
				meta: {
					total: 0,
					limit: filterParams?.limit || 10,
					offset: filterParams?.offset || 0,
				},
			};
		} catch (error) {
			console.error("Error al obtener productos:", error);
			// Devolver objeto vacío en caso de error
			return {
				data: [],
				meta: {
					total: 0,
					limit: filterParams?.limit || 10,
					offset: filterParams?.offset || 0,
				},
			};
		}
	}

	/**
	 * Obtiene un producto por su ID
	 */
	async getProductById(id: number): Promise<ProductDetail> {
		try {
			console.log(`Obteniendo producto con ID ${id}`);
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.PRODUCTS.DETAILS(id)
			);

			console.log(`Respuesta para producto ${id}:`, response);

			// Manejar diferentes estructuras de respuesta
			let productData;
			if (response && response.data) {
				productData = response.data;
			} else if (response) {
				productData = response;
			} else {
				throw new Error("Respuesta vacía al obtener producto por ID");
			}

			return productData as ProductDetail;
		} catch (error) {
			console.error(`Error al obtener producto ${id}:`, error);
			throw error;
		}
	}

	/**
	 * Obtiene un producto por su slug
	 */
	async getProductBySlug(slug: string): Promise<ProductDetail> {
		try {
			console.log(`Obteniendo producto con slug ${slug}`);
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.PRODUCTS.DETAILS_BY_SLUG(slug)
			);

			console.log(`Respuesta para producto con slug ${slug}:`, response);

			// Manejar diferentes estructuras de respuesta
			let productData;
			if (response && response.data) {
				productData = response.data;
			} else if (response) {
				productData = response;
			} else {
				throw new Error("Respuesta vacía al obtener producto por slug");
			}

			return productData as ProductDetail;
		} catch (error) {
			console.error(`Error al obtener producto con slug ${slug}:`, error);
			throw error;
		}
	}

	/**
	 * Crea un nuevo producto
	 */
	async createProduct(data: ProductCreationData): Promise<Product> {
		try {
			console.log("Creando nuevo producto:", data);
			const formData = new FormData();

			// Agregamos todos los campos no-archivo al FormData
			Object.entries(data).forEach(([key, value]) => {
				if (key !== "images") {
					if (Array.isArray(value) || typeof value === "object") {
						formData.append(key, JSON.stringify(value));
					} else if (value !== undefined && value !== null) {
						formData.append(key, String(value));
					}
				}
			});

			// Adaptamos los nombres si es necesario
			if (data.categoryId !== undefined) {
				formData.append("category_id", String(data.categoryId));
			}

			// Agregamos los archivos de imágenes
			if (data.images && data.images.length > 0) {
				data.images.forEach((image, index) => {
					formData.append(`images[${index}]`, image);
				});
			}

			const response = await ApiClient.uploadFile<any>(
				API_ENDPOINTS.PRODUCTS.CREATE,
				formData
			);

			console.log("Respuesta de creación de producto:", response);

			// Manejar diferentes estructuras de respuesta
			let productData;
			if (response && response.data) {
				productData = response.data;
			} else if (response) {
				productData = response;
			} else {
				throw new Error("Respuesta vacía al crear producto");
			}

			return productData as Product;
		} catch (error) {
			console.error("Error al crear producto:", error);
			throw error;
		}
	}

	/**
	 * Actualiza un producto existente
	 */
	async updateProduct(data: ProductUpdateData): Promise<Product> {
		try {
			console.log(`Actualizando producto ${data.id}:`, data);
			const formData = new FormData();

			// Agregamos todos los campos no-archivo al FormData
			Object.entries(data).forEach(([key, value]) => {
				if (key !== "images") {
					if (Array.isArray(value) || typeof value === "object") {
						formData.append(key, JSON.stringify(value));
					} else if (value !== undefined && value !== null) {
						formData.append(key, String(value));
					}
				}
			});

			// Adaptamos los nombres si es necesario
			if (data.categoryId !== undefined) {
				formData.append("category_id", String(data.categoryId));
			}

			// Agregamos los archivos de imágenes
			if (data.images && data.images.length > 0) {
				data.images.forEach((image, index) => {
					formData.append(`images[${index}]`, image);
				});
			}

			const response = await ApiClient.uploadFile<any>(
				API_ENDPOINTS.PRODUCTS.UPDATE(data.id),
				formData
			);

			console.log(
				`Respuesta de actualización de producto ${data.id}:`,
				response
			);

			// Manejar diferentes estructuras de respuesta
			let productData;
			if (response && response.data) {
				productData = response.data;
			} else if (response) {
				productData = response;
			} else {
				throw new Error("Respuesta vacía al actualizar producto");
			}

			return productData as Product;
		} catch (error) {
			console.error(`Error al actualizar producto ${data.id}:`, error);
			throw error;
		}
	}

	/**
	 * Elimina un producto
	 */
	async deleteProduct(id: number): Promise<boolean> {
		try {
			console.log(`Eliminando producto ${id}`);
			const response = await ApiClient.delete<any>(
				API_ENDPOINTS.PRODUCTS.DELETE(id)
			);

			console.log(`Respuesta de eliminación de producto ${id}:`, response);

			// Verificar resultado
			const success =
				(response && response.success) ||
				(response && response.status === "success") ||
				(response && response.data && response.data.success) ||
				false;

			return success;
		} catch (error) {
			console.error(`Error al eliminar producto ${id}:`, error);
			return false;
		}
	}

	/**
	 * Obtiene productos destacados
	 */
	async getFeaturedProducts(limit = 8): Promise<Product[]> {
		try {
			console.log(`Obteniendo productos destacados (límite: ${limit})`);
			const response = await ApiClient.get<any>(
				API_ENDPOINTS.PRODUCTS.FEATURED,
				{limit}
			);

			console.log("Respuesta de productos destacados:", response);

			// Manejar diferentes estructuras de respuesta
			let featuredProducts = [];
			if (response && Array.isArray(response)) {
				featuredProducts = response;
			} else if (response && Array.isArray(response.data)) {
				featuredProducts = response.data;
			} else if (
				response &&
				response.data &&
				Array.isArray(response.data.data)
			) {
				featuredProducts = response.data.data;
			}

			return featuredProducts;
		} catch (error) {
			console.error("Error al obtener productos destacados:", error);
			return [];
		}
	}

	/**
	 * Obtiene productos relacionados a un producto específico
	 */
	async getRelatedProducts(productId: number, limit = 4): Promise<Product[]> {
		try {
			console.log(
				`Obteniendo productos relacionados para ${productId} (límite: ${limit})`
			);
			const response = await ApiClient.get<any>(
				`${API_ENDPOINTS.PRODUCTS.DETAILS(productId)}/related`,
				{limit}
			);

			console.log(
				`Respuesta de productos relacionados para ${productId}:`,
				response
			);

			// Manejar diferentes estructuras de respuesta
			let relatedProducts = [];
			if (response && Array.isArray(response)) {
				relatedProducts = response;
			} else if (response && Array.isArray(response.data)) {
				relatedProducts = response.data;
			} else if (
				response &&
				response.data &&
				Array.isArray(response.data.data)
			) {
				relatedProducts = response.data.data;
			}

			return relatedProducts;
		} catch (error) {
			console.error(
				`Error al obtener productos relacionados para ${productId}:`,
				error
			);
			return [];
		}
	}

	/**
	 * Registra una visualización de producto
	 */
	async trackProductView(productId: number): Promise<void> {
		try {
			console.log(`Registrando visualización de producto ${productId}`);
			await ApiClient.post(API_ENDPOINTS.PRODUCTS.INCREMENT_VIEW(productId));
			console.log(
				`Visualización de producto ${productId} registrada correctamente`
			);
		} catch (error) {
			console.error(
				`Error al registrar visualización del producto ${productId}:`,
				error
			);
		}
	}
}
