// src/presentation/hooks/useSecureAuth.ts

import {useState, useEffect, useCallback, useMemo} from "react";
import {OptimizedRoleService} from "../../infrastructure/services/OptimizedRoleService";
import {useCacheInvalidation} from "./useReactiveCache";

interface SecureAuthHook {
	isAdmin: boolean;
	isSeller: boolean;
	role: string | null;
	loading: boolean;
	error: string | null;
	refreshRole: () => Promise<void>;
	checkAdminCritical: () => Promise<boolean>;
	checkSellerCritical: () => Promise<boolean>;
	invalidateRoleCache: () => void;
}

/**
 * Hook seguro para autenticación con cache optimizado
 */
export const useSecureAuth = (): SecureAuthHook => {
	const [isAdmin, setIsAdmin] = useState(false);
	const [isSeller, setIsSeller] = useState(false);
	const [role, setRole] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const {invalidate} = useCacheInvalidation();

	// Carga inicial de roles
	const loadRoleInfo = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const roleData = await OptimizedRoleService.checkUserRole();

			if (roleData?.success) {
				setIsAdmin(roleData.data.is_admin);
				setIsSeller(roleData.data.is_seller);
				setRole(roleData.data.role);
			} else {
				setIsAdmin(false);
				setIsSeller(false);
				setRole(null);
			}
		} catch (err) {
			const errorMsg =
				err instanceof Error ? err.message : "Error al cargar roles";
			setError(errorMsg);
			console.error("Error en useSecureAuth:", err);
		} finally {
			setLoading(false);
		}
	}, []);

	// Refresco forzado de roles
	const refreshRole = useCallback(async () => {
		await OptimizedRoleService.checkUserRole(true);
		await loadRoleInfo();
	}, [loadRoleInfo]);

	// Verificaciones críticas
	const checkAdminCritical = useCallback(async (): Promise<boolean> => {
		return await OptimizedRoleService.isAdminCritical();
	}, []);

	const checkSellerCritical = useCallback(async (): Promise<boolean> => {
		return await OptimizedRoleService.isSellerCritical();
	}, []);

	// Invalidar cache de roles
	const invalidateRoleCache = useCallback(() => {
		OptimizedRoleService.clearAllCache();
		invalidate("role_*");
		invalidate("auth_*");
	}, [invalidate]);

	// Cargar al montar
	useEffect(() => {
		loadRoleInfo();
	}, [loadRoleInfo]);

	return useMemo(
		() => ({
			isAdmin,
			isSeller,
			role,
			loading,
			error,
			refreshRole,
			checkAdminCritical,
			checkSellerCritical,
			invalidateRoleCache,
		}),
		[
			isAdmin,
			isSeller,
			role,
			loading,
			error,
			refreshRole,
			checkAdminCritical,
			checkSellerCritical,
			invalidateRoleCache,
		]
	);
};

export default useSecureAuth;
