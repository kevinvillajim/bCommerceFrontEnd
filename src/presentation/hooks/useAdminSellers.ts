// src/presentation/hooks/useAdminSellers.ts

import {useState, useCallback} from "react";
import {AdminSellerService, type AdminSeller} from "../../core/services/AdminSellerService";

const adminSellerService = new AdminSellerService();

/**
 * Hook para gestión de sellers desde admin
 */
export const useAdminSellers = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [sellers, setSellers] = useState<AdminSeller[]>([]);

	/**
	 * Obtiene todos los sellers activos
	 */
	const fetchAllSellers = useCallback(async (): Promise<AdminSeller[] | null> => {
		setLoading(true);
		setError(null);

		try {
			console.log("🌐 useAdminSellers: Obteniendo sellers desde API");
			const response = await adminSellerService.getAllSellers();

			if (response && response.data) {
				setSellers(response.data);
				return response.data;
			} else {
				setSellers([]);
				return [];
			}
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error al obtener sellers";
			console.error("❌ Error obteniendo sellers:", err);
			setError(errorMessage);
			setSellers([]);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		// Estado
		loading,
		error,
		sellers,

		// Métodos
		fetchAllSellers,

		// Utilidades
		setError: (error: string | null) => setError(error),
		setLoading: (loading: boolean) => setLoading(loading),
	};
};

export default useAdminSellers;