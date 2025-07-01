import {useState, useCallback, useEffect} from "react";
import SellerAdminService from "../../core/services/SellerAdminService";
import type {
	SellerFilter,
	CreateSellerData,
	UpdateSellerData,
} from "../../core/services/SellerAdminService";
import type {Seller} from "../../core/domain/entities/Seller";
import {extractErrorMessage} from "../../utils/errorHandler";

/**
 * Hook para administrar vendedores desde el panel de administración
 */
export const useSellerAdmin = () => {
	const sellerService = new SellerAdminService();
	const [sellers, setSellers] = useState<Seller[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalItems, setTotalItems] = useState(0);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	/**
	 * Obtener la lista de vendedores
	 */
	const fetchSellers = useCallback(
		async (filters: SellerFilter = {}) => {
			setLoading(true);
			setError(null);

			try {
				const filtersWithPage = {
					...filters,
					page: filters.page || currentPage,
					per_page: filters.per_page || itemsPerPage,
				};

				const response = await sellerService.getSellers(filtersWithPage);

				// CORREGIDO: Acceder a la estructura correcta de la respuesta
				if (response && response.sellers) {
					setSellers(response.sellers);

					// Usar pagination si existe, sino usar meta
					if (response.pagination) {
						setTotalItems(response.pagination.totalItems);
						setCurrentPage(response.pagination.currentPage);
						setTotalPages(response.pagination.totalPages);
						setItemsPerPage(response.pagination.itemsPerPage);
					}

					return response.sellers;
				} else {
					setSellers([]);
					return [];
				}
			} catch (err) {
				const errorMessage = extractErrorMessage(
					err,
					"Error al obtener los vendedores"
				);
				setError(errorMessage);
				return [];
			} finally {
				setLoading(false);
			}
		},
		[currentPage, itemsPerPage, sellerService]
	);

	/**
	 * Actualizar el estado de un vendedor
	 */
	const updateSellerStatus = useCallback(
		async (
			sellerId: number,
			status: "pending" | "active" | "suspended" | "inactive",
			reason?: string
		) => {
			setLoading(true);
			setError(null);

			try {
				const response = await sellerService.updateSellerStatus(
					sellerId,
					status,
					reason
				);

				// Actualizar el vendedor en la lista local
				setSellers((prevSellers) =>
					prevSellers.map((seller) => {
						if (seller.id === sellerId) {
							return {...seller, status};
						}
						return seller;
					})
				);

				return response;
			} catch (err) {
				const errorMessage = extractErrorMessage(
					err,
					"Error al actualizar el estado del vendedor"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[sellerService]
	);

	/**
	 * Actualizar el nivel de verificación de un vendedor
	 */
	const updateVerificationLevel = useCallback(
		async (
			sellerId: number,
			level: "none" | "basic" | "verified" | "premium"
		) => {
			setLoading(true);
			setError(null);

			try {
				const response = await sellerService.updateVerificationLevel(
					sellerId,
					level
				);

				// Actualizar el vendedor en la lista local
				setSellers((prevSellers) =>
					prevSellers.map((seller) => {
						if (seller.id === sellerId) {
							return {...seller, verificationLevel: level};
						}
						return seller;
					})
				);

				return response;
			} catch (err) {
				const errorMessage = extractErrorMessage(
					err,
					"Error al actualizar el nivel de verificación"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[sellerService]
	);

	/**
	 * Cambiar el estado de destacado de un vendedor
	 */
	const toggleFeatured = useCallback(
		async (sellerId: number, isFeatured: boolean) => {
			setLoading(true);
			setError(null);

			try {
				const response = await sellerService.toggleFeatured(
					sellerId,
					isFeatured
				);

				// Actualizar el vendedor en la lista local
				setSellers((prevSellers) =>
					prevSellers.map((seller) => {
						if (seller.id === sellerId) {
							return {...seller, isFeatured};
						}
						return seller;
					})
				);

				return response;
			} catch (err) {
				const errorMessage = extractErrorMessage(
					err,
					"Error al cambiar estado de destacado"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[sellerService]
	);

	/**
	 * Crear un nuevo vendedor
	 */
	const createSeller = useCallback(
		async (data: CreateSellerData) => {
			setLoading(true);
			setError(null);

			try {
				const response = await sellerService.createSeller(data);

				// Refrescar la lista de vendedores
				await fetchSellers();

				return response;
			} catch (err) {
				const errorMessage = extractErrorMessage(
					err,
					"Error al crear el vendedor"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[fetchSellers, sellerService]
	);

	/**
	 * Actualizar los detalles de un vendedor
	 */
	const updateSeller = useCallback(
		async (sellerId: number, data: UpdateSellerData) => {
			setLoading(true);
			setError(null);

			try {
				const response = await sellerService.updateSeller(sellerId, data);

				// Actualizar el vendedor en la lista local
				setSellers((prevSellers) =>
					prevSellers.map((seller) => {
						if (seller.id === sellerId) {
							return {...seller, ...data};
						}
						return seller;
					})
				);

				return response;
			} catch (err) {
				const errorMessage = extractErrorMessage(
					err,
					"Error al actualizar el vendedor"
				);
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setLoading(false);
			}
		},
		[sellerService]
	);

	// Cambiar de página
	const changePage = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	// Cargar vendedores cuando cambia la página actual
	useEffect(() => {
		fetchSellers({page: currentPage, per_page: itemsPerPage});
	}, [currentPage, fetchSellers, itemsPerPage]);

	return {
		sellers,
		loading,
		error,
		totalItems,
		currentPage,
		totalPages,
		itemsPerPage,
		fetchSellers,
		updateSellerStatus,
		updateVerificationLevel,
		toggleFeatured,
		createSeller,
		updateSeller,
		changePage,
	};
};

export default useSellerAdmin;
