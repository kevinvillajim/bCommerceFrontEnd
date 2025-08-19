import {useState, useCallback, useEffect} from "react";
import {ProductService} from "../../core/services/ProductService";
import type {
	Product,
	ProductDetail,
	ProductCreationData,
	ProductUpdateData,
} from "../../core/domain/entities/Product";
import {useAuth} from "../contexts/AuthContext";
import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";
import type {ExtendedProductFilterParams} from "../types/ProductFilterParams";

// Instancia del servicio de productos
const productService = new ProductService();

/**
 * Hook personalizado para gestionar los productos del vendedor
 */
export const useSellerProducts = () => {
	const {user} = useAuth();
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [productDetail, setProductDetail] = useState<ProductDetail | null>(
		null
	);
	const [totalProducts, setTotalProducts] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(10);

	/**
	 * Obtiene los productos del vendedor actual
	 */
	const fetchSellerProducts = useCallback(
		async (page = 1, limit = 10, forceRefresh = false) => {
			setLoading(true);
			setError(null);

			try {
				const sellerId = user?.id;
				if (!sellerId) {
					throw new Error("No se pudo obtener el ID del vendedor");
				}


				const filterParams: ExtendedProductFilterParams = {
					limit,
					offset: (page - 1) * limit,
					page,
					sellerId: sellerId,
					sortBy: "created_at",
					sortDir: "desc",
					featured: undefined,
					status: undefined,
					// Añadir timestamp para evitar cache cuando se fuerza refresh
					...(forceRefresh && { _t: Date.now() })
				};
				
				if (forceRefresh) {
					console.log("🔥 FORCE REFRESH - timestamp:", Date.now());
				}

				const response = await productService.getProducts(filterParams);

				if (response) {
					if (Array.isArray(response.data)) {
						setProducts(response.data);
						setTotalProducts(response.meta?.total || response.data.length);
					} else {
						setProducts([]);
						setTotalProducts(0);
					}
				} else {
					setProducts([]);
					setTotalProducts(0);
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener productos del vendedor";
				setError(errorMessage);
				console.error("Error al obtener productos del vendedor:", err);
				setProducts([]);
				setTotalProducts(0);
			} finally {
				setLoading(false);
			}
		},
		[user]
	);

	/**
	 * Obtiene los detalles de un producto específico por su ID
	 */
	const fetchProductById = useCallback(
		async (id: number): Promise<ProductDetail | null> => {
			setLoading(true);
			setError(null);

			try {
				const product = await productService.getProductById(id);
				setProductDetail(product);
				return product;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al obtener los detalles del producto";
				setError(errorMessage);
				console.error("Error al obtener detalles del producto:", err);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	/**
	 * Crea un nuevo producto
	 */
	const createProduct = useCallback(
		async (data: ProductCreationData) => {
			setLoading(true);
			setError(null);

			try {
				// Crear un FormData manualmente para asegurarnos de que todos los campos se envíen correctamente
				const formData = new FormData();

				// Añadir campos básicos - asegurando explícitamente el tipo de cada uno
				formData.append("name", data.name);
				formData.append("description", data.description);

				// Añadir descripción corta si existe
				if (data.shortDescription) {
					formData.append("short_description", data.shortDescription);
				}

				// Convertir números a string explícitamente
				formData.append("price", String(data.price));
				formData.append("stock", String(data.stock));

				// Añadir dimensiones si existen
				if (data.weight !== undefined)
					formData.append("weight", String(data.weight));
				if (data.width !== undefined)
					formData.append("width", String(data.width));
				if (data.height !== undefined)
					formData.append("height", String(data.height));
				if (data.depth !== undefined)
					formData.append("depth", String(data.depth));
				if (data.dimensions) formData.append("dimensions", data.dimensions);

				// Añadir categoría
				formData.append("category_id", String(data.category_id));

				// Campos adicionales
				if (data.sku) formData.append("sku", data.sku);
				if (data.status !== undefined) formData.append("status", data.status);
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

				// Añadir arrays como JSON string
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
						typeof data.tags === "string"
							? data.tags
							: JSON.stringify(data.tags);
					formData.append("tags", tagsValue);
				}

				// Añadir atributos si existen
				if (data.attributes && Object.keys(data.attributes).length > 0) {
					formData.append("attributes", JSON.stringify(data.attributes));
				}

				// Añadir imágenes
				if (data.images && data.images.length > 0) {
					data.images.forEach((file, index) => {
						formData.append(`images[${index}]`, file);
					});
				}

				// Enviar un log completo para depuración
				console.log("Enviando datos de producto para creación:");
				for (const [key, value] of formData.entries()) {
					// No loggear el contenido binario de las imágenes
					if (key.startsWith("images[")) {
						console.log(`${key}: (archivo binario)`);
					} else {
						console.log(`${key}: ${value}`);
					}
				}

				// Realizar la petición directamente usando ApiClient para subir archivos
				const response = await ApiClient.uploadFile(
					API_ENDPOINTS.PRODUCTS.CREATE,
					formData
				);

				// Verificar la respuesta y extraer el producto creado
				let newProduct = null;

				// Determinar el producto basado en la estructura de la respuesta
				if (response) {
					if (typeof response === "object") {
						newProduct = response;
					}
				}

				// Actualizar la lista de productos si se creó correctamente
				if (newProduct) {
					console.log("✅ Producto creado exitosamente:", newProduct);
					console.log("🔄 Iniciando refetch en 500ms...");
					
					// SOLUCIÓN 1: Refresh inmediato sin cache
					setTimeout(async () => {
						console.log("🔄 Ejecutando fetchSellerProducts después de crear...");
						await fetchSellerProducts(page, itemsPerPage, true); // forceRefresh = true
						console.log("✅ fetchSellerProducts completado");
					}, 100); // Reducir delay inicial
					
					// SOLUCIÓN 2: Refresh backup con más tiempo
					setTimeout(async () => {
						console.log("🔄 Refetch backup después de 1s...");
						await fetchSellerProducts(page, itemsPerPage, true);
					}, 1000);
				} else {
					console.error(
						"Respuesta de creación de producto no válida:",
						response
					);
					throw new Error(
						"No se pudo crear el producto. La respuesta del servidor no es válida."
					);
				}

				return newProduct;
			} catch (err: any) {
				let userMessage = "Error desconocido al crear producto";
				
				// Extraer mensaje de error específico del servidor
				if (err && typeof err === 'object') {
					// Si es un AxiosError con response
					if (err.response && err.response.data) {
						const responseData = err.response.data;
						// Extraer mensaje específico del backend
						if (responseData.message) {
							userMessage = responseData.message;
						} else if (responseData.error) {
							userMessage = responseData.error;
						} else if (err.message) {
							userMessage = err.message;
						}
					} else if (err.message) {
						userMessage = err.message;
					}
				}
				
				const fullErrorMessage = `Error al crear producto: ${userMessage}`;
				setError(fullErrorMessage);
				console.error("Error al crear producto:", err);
				
				// Mostrar mensaje específico y claro al usuario
				alert(userMessage);
				
				return null;
			} finally {
				setLoading(false);
			}
		},
		[fetchSellerProducts, page, itemsPerPage]
	);

	/**
	 * Actualiza un producto existente
	 */
	const updateProduct = useCallback(
		async (data: ProductUpdateData) => {
			setLoading(true);
			setError(null);

			try {
				console.log("Actualizando producto con datos:", data);
				// Crear un FormData manualmente
				const formData = new FormData();

				// Añadir campos básicos si existen
				if (data.name) formData.append("name", data.name);
				if (data.description) formData.append("description", data.description);
				if (data.shortDescription)
					formData.append("short_description", data.shortDescription);

				// Convertir números a string explícitamente
				if (data.price !== undefined)
					formData.append("price", String(data.price));
				if (data.stock !== undefined)
					formData.append("stock", String(data.stock));

				// Añadir dimensiones si existen
				if (data.weight !== undefined)
					formData.append("weight", String(data.weight));
				if (data.width !== undefined)
					formData.append("width", String(data.width));
				if (data.height !== undefined)
					formData.append("height", String(data.height));
				if (data.depth !== undefined)
					formData.append("depth", String(data.depth));
				if (data.dimensions) formData.append("dimensions", data.dimensions);

				// Añadir categoría si existe
				if (data.category_id)
					formData.append("category_id", String(data.category_id));

				// Estado del producto y otros campos
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

				// Añadir arrays como JSON string
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
						typeof data.tags === "string"
							? data.tags
							: JSON.stringify(data.tags);
					formData.append("tags", tagsValue);
				}

				// Añadir atributos si existen
				if (data.attributes && Object.keys(data.attributes).length > 0) {
					formData.append("attributes", JSON.stringify(data.attributes));
				}

				// Opciones de manejo de imágenes
				if (data.replace_images !== undefined) {
					formData.append("replace_images", String(data.replace_images));
				}

				if (data.remove_images && data.remove_images.length > 0) {
					formData.append("remove_images", JSON.stringify(data.remove_images));
				}

				// Añadir imágenes si existen
				if (data.images && data.images.length > 0) {
					data.images.forEach((file, index) => {
						formData.append(`images[${index}]`, file);
					});
				}

				// Realizar la petición directamente usando ApiClient
				const response = await ApiClient.updateFile(
					API_ENDPOINTS.PRODUCTS.UPDATE(data.id),
					formData,
				);

				// Verificar la respuesta y extraer el producto actualizado
				let updatedProduct = null;

				// Determinar el producto basado en la estructura de la respuesta
				if (response) {
					if (typeof response === "object") {
						updatedProduct = response;
					}
				}

				// Actualizar la lista de productos si se actualizó correctamente
				if (updatedProduct) {
					console.log("✅ Producto actualizado exitosamente:", updatedProduct);
					console.log("🔄 Iniciando refetch después de actualizar...");
					
					// SOLUCIÓN 1: Refresh inmediato sin cache
					setTimeout(async () => {
						console.log("🔄 Ejecutando fetchSellerProducts después de actualizar...");
						await fetchSellerProducts(page, itemsPerPage, true); // forceRefresh = true
						console.log("✅ fetchSellerProducts completado");
					}, 100); // Reducir delay inicial
					
					// SOLUCIÓN 2: Refresh backup con más tiempo
					setTimeout(async () => {
						console.log("🔄 Refetch backup después de 1s...");
						await fetchSellerProducts(page, itemsPerPage, true);
					}, 1000);
				} else {
					throw new Error("No se pudo actualizar el producto");
				}

				return updatedProduct;
			} catch (err: any) {
				let userMessage = "Error desconocido al actualizar producto";
				
				// Extraer mensaje de error específico del servidor
				if (err && typeof err === 'object') {
					// Si es un AxiosError con response
					if (err.response && err.response.data) {
						const responseData = err.response.data;
						// Extraer mensaje específico del backend
						if (responseData.message) {
							userMessage = responseData.message;
						} else if (responseData.error) {
							userMessage = responseData.error;
						} else if (err.message) {
							userMessage = err.message;
						}
					} else if (err.message) {
						userMessage = err.message;
					}
				}
				
				const fullErrorMessage = `Error al actualizar producto: ${userMessage}`;
				setError(fullErrorMessage);
				console.error("Error al actualizar producto:", err);
				
				// Mostrar mensaje específico y claro al usuario
				alert(userMessage);
				
				return null;
			} finally {
				setLoading(false);
			}
		},
		[fetchSellerProducts, page, itemsPerPage]
	);

	/**
	 * Elimina un producto
	 */
	const deleteProduct = useCallback(
		async (id: number) => {
			setLoading(true);
			setError(null);

			try {
				// Usamos el servicio existente para eliminar el producto
				const result = await productService.deleteProduct(id);

				// Actualizar la lista de productos si se eliminó correctamente
				if (result) {
					console.log("✅ Producto eliminado exitosamente");
					// Refresh inmediato después de eliminar
					setTimeout(async () => {
						await fetchSellerProducts(page, itemsPerPage, true);
					}, 100);
				}

				return result;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al eliminar producto";
				setError(errorMessage);
				console.error("Error al eliminar producto:", err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchSellerProducts, page, itemsPerPage]
	);

	/**
	 * Cambia el estado de un producto (active/inactive)
	 */
	const toggleProductStatus = useCallback(
		async (id: number, currentStatus: string) => {
			setLoading(true);
			setError(null);

			try {
				const newStatus = currentStatus === "active" ? "inactive" : "active";

				// Crear FormData con solo el campo status
				const formData = new FormData();
				formData.append("status", newStatus);

				// Enviar la actualización directamente
				const response = await ApiClient.uploadFile(
					API_ENDPOINTS.PRODUCTS.UPDATE(id),
					formData
				);

				// Actualizar la lista de productos si se actualizó correctamente
				if (response) {
					console.log("✅ Estado del producto cambiado exitosamente");
					// Refresh inmediato después de cambiar estado
					setTimeout(async () => {
						await fetchSellerProducts(page, itemsPerPage, true);
					}, 100);
					return true;
				} else {
					throw new Error("Error al cambiar estado del producto");
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Error al cambiar estado del producto";
				setError(errorMessage);
				console.error("Error al cambiar estado del producto:", err);
				return false;
			} finally {
				setLoading(false);
			}
		},
		[fetchSellerProducts, page, itemsPerPage]
	);

	// Cargar productos del vendedor al montar el componente o cuando cambie el usuario
	useEffect(() => {
		if (user) {
			fetchSellerProducts(page, itemsPerPage);
		}
	}, [user, page, itemsPerPage, fetchSellerProducts]);

	// Cambiar página
	const changePage = useCallback((newPage: number) => {
		setPage(newPage);
	}, []);

	// Cambiar ítems por página
	const changeItemsPerPage = useCallback((newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage);
		setPage(1); // Resetear a la primera página
	}, []);

	return {
		products,
		productDetail,
		totalProducts,
		loading,
		error,
		page,
		itemsPerPage,
		fetchSellerProducts,
		fetchProductById,
		createProduct,
		updateProduct,
		deleteProduct,
		toggleProductStatus,
		changePage,
		changeItemsPerPage,
	};
};

export default useSellerProducts;
