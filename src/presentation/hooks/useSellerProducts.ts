import {useState, useCallback, useEffect} from "react";
import {ProductService} from "../../core/services/ProductService";
import type {
	Product,
	ProductFilterParams,
	ProductCreationData,
	ProductUpdateData,
} from "../../core/domain/entities/Product";
import {useAuth} from "../contexts/AuthContext";
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import {adaptProduct} from "../../utils/productAdapter";

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
	const [totalProducts, setTotalProducts] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const [itemsPerPage, setItemsPerPage] = useState<number>(10);

	/**
	 * Obtiene los productos del vendedor actual
	 */
	const fetchSellerProducts = useCallback(
		async (page = 1, limit = 10) => {
			setLoading(true);
			setError(null);

			try {
				// Usamos el endpoint de productos por vendedor, usando el ID del usuario actual
				const userId = user?.id;
				if (!userId) {
					throw new Error("No se pudo obtener el ID del vendedor");
				}

				// Usamos el endpoint específico de vendedor con filtrado
				const filterParams: ProductFilterParams = {
					limit,
					offset: (page - 1) * limit,
					sellerId: userId,
					sortBy: "created_at",
					sortDir: "desc",
				};

				const response = await productService.getProducts(filterParams);

				// Adaptar los productos a la estructura esperada
				if (response && response.data) {
					setProducts(response.data);
					setTotalProducts(response.meta?.total || 0);
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
			} finally {
				setLoading(false);
			}
		},
		[user]
	);

	/**
	 * Crea un nuevo producto
	 */
	const createProduct = useCallback(
		async (data: ProductCreationData) => {
			setLoading(true);
			setError(null);

			try {
				// Usamos el servicio existente para crear el producto
				const newProduct = await productService.createProduct(data);

				// Actualizar la lista de productos si se creó correctamente
				if (newProduct) {
					fetchSellerProducts(page, itemsPerPage);
				}

				return newProduct;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al crear producto";
				setError(errorMessage);
				console.error("Error al crear producto:", err);
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
				// Usamos el servicio existente para actualizar el producto
				const updatedProduct = await productService.updateProduct(data);

				// Actualizar la lista de productos si se actualizó correctamente
				if (updatedProduct) {
					fetchSellerProducts(page, itemsPerPage);
				}

				return updatedProduct;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Error al actualizar producto";
				setError(errorMessage);
				console.error("Error al actualizar producto:", err);
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
					fetchSellerProducts(page, itemsPerPage);
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

				// Obtener el producto actual para actualizarlo
				const productToUpdate = products.find((p) => p.id === id);
				if (!productToUpdate) {
					throw new Error("Producto no encontrado");
				}

				// Actualizar solo el estado
				const updatedProduct = await productService.updateProduct({
					id,
					status: newStatus,
				});

				// Actualizar la lista de productos si se actualizó correctamente
				if (updatedProduct) {
					fetchSellerProducts(page, itemsPerPage);
				}

				return true;
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
		[products, fetchSellerProducts, page, itemsPerPage]
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
		totalProducts,
		loading,
		error,
		page,
		itemsPerPage,
		fetchSellerProducts,
		createProduct,
		updateProduct,
		deleteProduct,
		toggleProductStatus,
		changePage,
		changeItemsPerPage,
	};
};

export default useSellerProducts;
