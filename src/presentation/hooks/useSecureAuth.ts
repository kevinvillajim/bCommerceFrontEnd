// src/presentation/hooks/useSecureAuth.ts

import {useState, useCallback, useEffect, useRef} from "react";
import {OptimizedRoleService} from "../../infrastructure/services/OptimizedRoleService";
import type {RoleCheckResponse} from "../../infrastructure/services/OptimizedRoleService";

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
 */
export const useSecureAuth = () => {
	const [roleInfo, setRoleInfo] = useState<OptimizedUserRoleInfo>({
		role: null,
		isAdmin: false,
		isSeller: false,
		sellerInfo: null,
		adminInfo: null,
		lastUpdated: 0,
	});
	const [isLoadingRole, setIsLoadingRole] = useState<boolean>(false);
	const [roleError, setRoleError] = useState<string | null>(null);

	// Referencias para controlar actualizaciones
	const lastFetchTime = useRef<number>(0);
	const isMountedRef = useRef<boolean>(true);

	/**
	 * Función principal para obtener información de rol
	 */
	const fetchRoleInfo = useCallback(
		async (
			forceRefresh: boolean = false,
			criticalOperation: boolean = false
		): Promise<OptimizedUserRoleInfo | null> => {
			// Evitar consultas excesivas
			const now = Date.now();
			if (
				!forceRefresh &&
				!criticalOperation &&
				now - lastFetchTime.current < 5000
			) {
				return roleInfo;
			}

			if (isLoadingRole && !forceRefresh) {
				return roleInfo;
			}

			setIsLoadingRole(true);
			setRoleError(null);
			lastFetchTime.current = now;

			try {
				console.log(
					"🔐 Obteniendo información de rol con OptimizedRoleService"
				);

				const roleData: RoleCheckResponse | null =
					await OptimizedRoleService.checkUserRole(
						forceRefresh,
						criticalOperation
					);

				if (!isMountedRef.current) return null;

				if (roleData && roleData.success) {
					const newRoleInfo: OptimizedUserRoleInfo = {
						role: roleData.data.role,
						isAdmin: roleData.data.is_admin,
						isSeller: roleData.data.is_seller,
						sellerInfo: roleData.data.seller_info || null,
						adminInfo: roleData.data.admin_info || null,
						lastUpdated: now,
					};

					console.log("✅ Información de rol actualizada:", newRoleInfo);
					setRoleInfo(newRoleInfo);
					return newRoleInfo;
				} else {
					console.warn("⚠️ No se pudo obtener información de rol válida");
					const emptyRoleInfo: OptimizedUserRoleInfo = {
						role: null,
						isAdmin: false,
						isSeller: false,
						sellerInfo: null,
						adminInfo: null,
						lastUpdated: now,
					};
					setRoleInfo(emptyRoleInfo);
					return emptyRoleInfo;
				}
			} catch (error) {
				if (!isMountedRef.current) return null;

				const errorMessage =
					error instanceof Error
						? error.message
						: "Error al obtener información de rol";
				console.error("❌ Error en fetchRoleInfo:", error);
				setRoleError(errorMessage);
				return null;
			} finally {
				if (isMountedRef.current) {
					setIsLoadingRole(false);
				}
			}
		},
		[roleInfo, isLoadingRole]
	);

	/**
	 * Funciones de verificación rápida
	 */
	const isAdmin = useCallback(
		async (critical: boolean = false): Promise<boolean> => {
			if (critical) {
				return await OptimizedRoleService.isAdminCritical();
			}
			return await OptimizedRoleService.isAdmin();
		},
		[]
	);

	const isSeller = useCallback(
		async (critical: boolean = false): Promise<boolean> => {
			if (critical) {
				return await OptimizedRoleService.isSellerCritical();
			}
			return await OptimizedRoleService.isSeller();
		},
		[]
	);

	/**
	 * Función para limpiar toda la cache
	 */
	const clearRoleCache = useCallback(() => {
		OptimizedRoleService.clearAllCache();
		setRoleInfo({
			role: null,
			isAdmin: false,
			isSeller: false,
			sellerInfo: null,
			adminInfo: null,
			lastUpdated: 0,
		});
		setRoleError(null);
		lastFetchTime.current = 0;
		console.log("🗑️ Cache de roles limpiada desde useSecureAuth");
	}, []);

	/**
	 * Función para refrescar información de rol
	 */
	const refreshRoleInfo = useCallback(
		async (criticalOperation: boolean = false): Promise<void> => {
			await fetchRoleInfo(true, criticalOperation);
		},
		[fetchRoleInfo]
	);

	/**
	 * Función para obtener la ruta por defecto según el rol
	 */
	const getDefaultRouteForRole = useCallback((): string => {
		if (roleInfo.isAdmin) {
			return "/admin/dashboard";
		} else if (roleInfo.isSeller) {
			return "/seller/dashboard";
		}
		return "/";
	}, [roleInfo]);

	// Cleanup al desmontar
	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return {
		// Estado
		roleInfo,
		isLoadingRole,
		roleError,

		// Funciones principales
		fetchRoleInfo,
		refreshRoleInfo,
		clearRoleCache,

		// Verificaciones rápidas
		isAdmin,
		isSeller,

		// Utilidades
		getDefaultRouteForRole,

		// Estados computados
		hasRole: roleInfo.role !== null,
		isAuthenticated: roleInfo.role !== null,
		lastUpdated: roleInfo.lastUpdated,
	};
};

export default useSecureAuth;
