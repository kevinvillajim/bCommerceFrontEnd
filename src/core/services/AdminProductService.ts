// src/core/services/AdminProductService.ts

import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Product,
	ProductDetail,
	ProductListResponse,
	ProductCreationData,
	ProductUpdateData,
} from "../domain/entities/Product";
import type {ExtendedProductFilterParams} from "../../presentation/types/ProductFilterParams";

/**
 * Servicio de administración de productos - Solo para administradores
 * Permite gestionar cualquier producto en el sistema
 */
export class AdminProductService {
	/**
	 * Obtiene todos los productos del sistema (como admin)
	 */
	async getAllProducts(
		filterParams?: ExtendedProductFilterParams
	): Promise<ProductListResponse | null> {
		try {
			console.log(
				"📤 AdminProductService: Obteniendo todos los productos como admin:",
				filterParams
			);

			// Limpiar parámetros específicos de frontend que el backend no reconoce
			const cleanParams = {...filterParams};
			if (cleanParams && "admin_view" in cleanParams) {
				delete cleanParams.admin_view; // CORREGIDO: verificar si existe antes de eliminar
			}

			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.ADMIN.PRODUCTS.LIST,
				cleanParams
			);

			console.log("📥 AdminProductService: Respuesta del servidor:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en AdminProductService.getAllProducts:", error);
			return null;
		}
	}

	/**
	 * Obtiene un producto por ID (como admin)
	 */
	async getProductById(id: number): Promise<ProductDetail | null> {
		try {
			console.log(
				`📤 AdminProductService: Obteniendo producto ${id} como admin`
			);

			const response = await ApiClient.get<{data: ProductDetail}>(
				API_ENDPOINTS.PRODUCTS.DETAILS(id)
			);

			return response?.data || null;
		} catch (error) {
			console.error("❌ Error en AdminProductService.getProductById:", error);
			return null;
		}
	}

	/**
	 * Crea un producto (como admin para cualquier vendedor)
	 */
	async createProduct(
		data: ProductCreationData,
		sellerId?: number
	): Promise<Product | null> {
		try {
			console.log("📤 AdminProductService: Creando producto como admin:", data);

			const formData = new FormData();

			// Campos básicos
			formData.append("name", data.name);
			formData.append("description", data.description);
			formData.append("price", String(data.price));
			formData.append("stock", String(data.stock));
			formData.append("category_id", String(data.category_id));

			// Si se especifica un vendedor, asignarlo
			if (sellerId) {
				formData.append("seller_id", String(sellerId));
			}

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

			console.log("✅ AdminProductService: Producto creado:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en AdminProductService.createProduct:", error);
			return null;
		}
	}

	/**
	 * Actualiza cualquier producto (como admin)
	 */
	async updateProduct(data: ProductUpdateData): Promise<Product | null> {
		try {
			console.log(
				`📤 AdminProductService: Actualizando producto ${data.id} como admin:`,
				data
			);

			const formData = new FormData();

			// Campos opcionales para actualización
			if (data.name) formData.append("name", data.name);
			if (data.description) formData.append("description", data.description);
			if (data.shortDescription)
				formData.append("short_description", data.shortDescription);
			if (data.price !== undefined)
				formData.append("price", String(data.price));
			if (data.stock !== undefined)
				formData.append("stock", String(data.stock));
			if (data.category_id)
				formData.append("category_id", String(data.category_id));

			// Campos opcionales
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

			// Gestión de imágenes
			if (data.replace_images !== undefined) {
				formData.append("replace_images", String(data.replace_images));
			}
			if (data.remove_images && data.remove_images.length > 0) {
				formData.append("remove_images", JSON.stringify(data.remove_images));
			}
			if (data.images && data.images.length > 0) {
				data.images.forEach((file, index) => {
					formData.append(`images[${index}]`, file);
				});
			}

			const response = await ApiClient.updateFile<Product>(
				API_ENDPOINTS.PRODUCTS.UPDATE(data.id),
				formData
			);

			console.log("✅ AdminProductService: Producto actualizado:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en AdminProductService.updateProduct:", error);
			return null;
		}
	}

	/**
	 * Elimina cualquier producto (como admin)
	 */
	async deleteProduct(id: number): Promise<boolean> {
		try {
			console.log(
				`📤 AdminProductService: Eliminando producto ${id} como admin`
			);

			const response = await ApiClient.delete(
				API_ENDPOINTS.ADMIN.PRODUCTS.DELETE(id)
			);

			console.log("✅ AdminProductService: Producto eliminado:", response);
			return true;
		} catch (error) {
			console.error("❌ Error en AdminProductService.deleteProduct:", error);
			return false;
		}
	}

	/**
	 * Cambia el estado destacado de un producto - CORREGIDO
	 */
	async toggleFeatured(id: number, featured: boolean): Promise<boolean> {
		try {
			console.log(
				`📤 AdminProductService: Cambiando featured del producto ${id} a ${featured}`
			);

			// Usar PATCH en lugar de PUT para actualizaciones parciales
			const response = await ApiClient.patch(
				API_ENDPOINTS.ADMIN.PRODUCTS.PARTIAL_UPDATE(id),
				{featured: featured}
			);

			console.log("✅ AdminProductService: Featured actualizado:", response);
			return true;
		} catch (error) {
			console.error("❌ Error en AdminProductService.toggleFeatured:", error);
			if (error instanceof Error) {
				console.error("Error message:", error.message);
			}
			return false;
		}
	}

	/**
	 * Cambia el estado de publicación de un producto - CORREGIDO
	 */
	async togglePublished(id: number, published: boolean): Promise<boolean> {
		try {
			console.log(
				`📤 AdminProductService: Cambiando published del producto ${id} a ${published}`
			);

			// Usar PATCH en lugar de PUT para actualizaciones parciales
			const response = await ApiClient.patch(
				API_ENDPOINTS.ADMIN.PRODUCTS.PARTIAL_UPDATE(id),
				{published: published}
			);

			console.log("✅ AdminProductService: Published actualizado:", response);
			return true;
		} catch (error) {
			console.error("❌ Error en AdminProductService.togglePublished:", error);
			if (error instanceof Error) {
				console.error("Error message:", error.message);
			}
			return false;
		}
	}

	/**
	 * Cambia el estado de un producto - CORREGIDO
	 */
	async updateStatus(id: number, status: string): Promise<boolean> {
		try {
			console.log(
				`📤 AdminProductService: Cambiando status del producto ${id} a ${status}`
			);

			// Usar PATCH en lugar de PUT para actualizaciones parciales
			const response = await ApiClient.patch(
				API_ENDPOINTS.ADMIN.PRODUCTS.PARTIAL_UPDATE(id),
				{status: status}
			);

			console.log("✅ AdminProductService: Status actualizado:", response);
			return true;
		} catch (error) {
			console.error("❌ Error en AdminProductService.updateStatus:", error);
			if (error instanceof Error) {
				console.error("Error message:", error.message);
			}
			return false;
		}
	}

	/**
	 * Obtiene estadísticas de productos para admin
	 */
	async getProductStats(): Promise<any> {
		try {
			console.log(
				"📤 AdminProductService: Obteniendo estadísticas de productos"
			);

			const response = await ApiClient.get(API_ENDPOINTS.ADMIN.PRODUCTS.STATS);

			console.log("✅ AdminProductService: Estadísticas obtenidas:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en AdminProductService.getProductStats:", error);
			return null;
		}
	}

	/**
	 * Busca productos por vendedor (como admin)
	 */
	async getProductsBySeller(
		sellerId: number,
		filterParams?: ExtendedProductFilterParams
	): Promise<ProductListResponse | null> {
		try {
			console.log(
				`📤 AdminProductService: Obteniendo productos del vendedor ${sellerId}`
			);

			const response = await ApiClient.get<ProductListResponse>(
				API_ENDPOINTS.PRODUCTS.BY_SELLER(sellerId),
				filterParams
			);

			console.log(
				"✅ AdminProductService: Productos del vendedor obtenidos:",
				response
			);
			return response;
		} catch (error) {
			console.error(
				"❌ Error en AdminProductService.getProductsBySeller:",
				error
			);
			return null;
		}
	}
}

export default AdminProductService;
