// src/presentation/hooks/useSecureAuth.ts

import {useCallback} from "react";
import {useAuth} from "./useAuth";
import {OptimizedRoleService} from "../../infrastructure/services/OptimizedRoleService";

// Interfaz para información de rol optimizada
export interface OptimizedUserRoleInfo {
	role: string | null;
	isAdmin: boolean;
	isSeller: boolean;
	sellerInfo?: any;
	adminInfo?: any;
	lastUpdated: number;
}

/**
 * Hook personalizado para manejo seguro y optimizado de roles
 * Simplificado y compatible con AuthContext existente
 */
export const useSecureAuth = () => {
	// Usar el hook useAuth mejorado existente
	const {
		roleInfo: contextRoleInfo,
		isLoadingRole: contextIsLoadingRole,
		refreshRoleInfo: contextRefreshRoleInfo,
		isAdmin: contextIsAdmin,
		isSeller: contextIsSeller,
		getDefaultRouteForRole: contextGetDefaultRoute,
		isAuthenticated: contextIsAuthenticated,
	} = useAuth();

	// Convertir roleInfo del contexto al formato optimizado
	const roleInfo: OptimizedUserRoleInfo = {
		role: contextRoleInfo.role,
		isAdmin: contextRoleInfo.isAdmin,
		isSeller: contextRoleInfo.isSeller,
		sellerInfo: contextRoleInfo.sellerInfo,
		adminInfo: contextRoleInfo.adminInfo,
		lastUpdated: Date.now(),
	};

	/**
	 * Función principal para obtener información de rol (usa el contexto)
	 */
	const fetchRoleInfo = useCallback(
		async (
			forceRefresh: boolean = false,
			criticalOperation: boolean = false
		): Promise<OptimizedUserRoleInfo | null> => {
			try {
				console.log("🔐 useSecureAuth: Delegando al AuthContext mejorado");

				// Usar el refresh del contexto
				await contextRefreshRoleInfo();

				console.log(
					"✅ useSecureAuth: Información de rol actualizada vía contexto"
				);
				return roleInfo;
			} catch (error) {
				console.error("❌ useSecureAuth: Error en fetchRoleInfo:", error);
				return null;
			}
		},
		[contextRefreshRoleInfo, roleInfo]
	);

	/**
	 * Funciones de verificación rápida (usan el contexto optimizado)
	 */
	const isAdmin = useCallback(
		async (critical: boolean = false): Promise<boolean> => {
			try {
				return await contextIsAdmin(critical);
			} catch (error) {
				console.warn(
					"⚠️ useSecureAuth: Error en isAdmin, usando fallback:",
					error
				);
				return roleInfo.isAdmin;
			}
		},
		[contextIsAdmin, roleInfo.isAdmin]
	);

	const isSeller = useCallback(
		async (critical: boolean = false): Promise<boolean> => {
			try {
				return await contextIsSeller(critical);
			} catch (error) {
				console.warn(
					"⚠️ useSecureAuth: Error en isSeller, usando fallback:",
					error
				);
				return roleInfo.isSeller;
			}
		},
		[contextIsSeller, roleInfo.isSeller]
	);

	/**
	 * Función para limpiar toda la cache (usa OptimizedRoleService directamente)
	 */
	const clearRoleCache = useCallback(() => {
		try {
			OptimizedRoleService.clearAllCache();
			console.log("🗑️ useSecureAuth: Cache de roles limpiada");
		} catch (error) {
			console.log(
				"⚠️ useSecureAuth: OptimizedRoleService no disponible para limpiar cache:",
				error
			);
		}
	}, []);

	/**
	 * Función para refrescar información de rol (usa el contexto)
	 */
	const refreshRoleInfo = useCallback(
		async (criticalOperation: boolean = false): Promise<void> => {
			await fetchRoleInfo(true, criticalOperation);
		},
		[fetchRoleInfo]
	);

	/**
	 * Función para obtener la ruta por defecto según el rol (usa el contexto)
	 */
	const getDefaultRouteForRole = useCallback((): string => {
		return contextGetDefaultRoute();
	}, [contextGetDefaultRoute]);

	return {
		// Estado (basado en el contexto)
		roleInfo,
		isLoadingRole: contextIsLoadingRole,
		roleError: null, // Simplificado

		// Funciones principales
		fetchRoleInfo,
		refreshRoleInfo,
		clearRoleCache,

		// Verificaciones rápidas (usan el contexto optimizado)
		isAdmin,
		isSeller,

		// Utilidades
		getDefaultRouteForRole,

		// Estados computados
		hasRole: roleInfo.role !== null,
		isAuthenticated: contextIsAuthenticated,
		lastUpdated: roleInfo.lastUpdated,
	};
};

export default useSecureAuth;
