// src/presentation/hooks/useHeaderCounters.ts - VERSIÓN SIMPLIFICADA Y FUNCIONAL
import {useState, useEffect, useCallback, useRef} from "react";
import {useAuth} from "./useAuth";
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import CacheService from "../../infrastructure/services/CacheService";

interface HeaderCounters {
	cartItemCount: number;
	favoriteCount: number;
	notificationCount: number;
}

interface UseHeaderCountersReturn {
	counters: HeaderCounters;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

// Tipos para las respuestas de la API
interface CartApiResponse {
	status?: string;
	data?: {
		item_count?: number;
		items?: any[];
	};
}

interface FavoritesApiResponse {
	status?: string;
	data?: any[];
}

interface NotificationsApiResponse {
	status?: string;
	data?: {
		unread_count?: number;
	};
}

const CACHE_KEY = "header_counters";
const CACHE_TIME = 2 * 60 * 1000; // 2 minutos

export const useHeaderCounters = (): UseHeaderCountersReturn => {
	const [counters, setCounters] = useState<HeaderCounters>({
		cartItemCount: 0,
		favoriteCount: 0,
		notificationCount: 0,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {isAuthenticated} = useAuth();
	const isInitialized = useRef(false);
	const isFetching = useRef(false);

	// ✅ FUNCIÓN DE FETCH SIMPLIFICADA Y CONTROLADA
	const fetchCounters = useCallback(
		async (useCache = true) => {
			if (!isAuthenticated) {
				console.log("🚫 Usuario no autenticado, reseteando contadores");
				setCounters({cartItemCount: 0, favoriteCount: 0, notificationCount: 0});
				setError(null);
				return;
			}

			// Evitar múltiples fetches simultáneos
			if (isFetching.current) {
				console.log("⏸️ Fetch ya en progreso, saltando...");
				return;
			}

			// Verificar cache primero
			if (useCache) {
				const cached = CacheService.getItem(CACHE_KEY);
				if (cached) {
					console.log("📦 Cache hit: header_counters", cached);
					setCounters(cached);
					return;
				}
			}

			console.log("🌐 Fetching header counters - START");
			isFetching.current = true;
			setLoading(true);
			setError(null);

			try {
				// Hacer todas las consultas en paralelo
				const [cartResult, favoritesResult, notificationsResult] =
					await Promise.allSettled([
						ApiClient.get<CartApiResponse>(API_ENDPOINTS.CART.GET),
						ApiClient.get<FavoritesApiResponse>(API_ENDPOINTS.FAVORITES.LIST),
						ApiClient.get<NotificationsApiResponse>(
							API_ENDPOINTS.NOTIFICATIONS.COUNT
						),
					]);

				// ✅ EXTRAER CART COUNT
				let cartItemCount = 0;
				if (cartResult.status === "fulfilled" && cartResult.value) {
					const cartData = cartResult.value;
					cartItemCount = cartData.data?.item_count || 0;
					console.log("🛒 Cart count:", cartItemCount);
				} else {
					console.warn(
						"❌ Cart fetch failed:",
						cartResult.status === "rejected"
							? cartResult.reason
							: "Unknown error"
					);
				}

				// ✅ EXTRAER FAVORITES COUNT
				let favoriteCount = 0;
				if (favoritesResult.status === "fulfilled" && favoritesResult.value) {
					const favoritesData = favoritesResult.value;
					const favArray = favoritesData.data || favoritesData;
					favoriteCount = Array.isArray(favArray) ? favArray.length : 0;
					console.log("❤️ Favorites count:", favoriteCount);
				} else {
					console.warn(
						"❌ Favorites fetch failed:",
						favoritesResult.status === "rejected"
							? favoritesResult.reason
							: "Unknown error"
					);
				}

				// ✅ EXTRAER NOTIFICATIONS COUNT
				let notificationCount = 0;
				if (
					notificationsResult.status === "fulfilled" &&
					notificationsResult.value
				) {
					const notificationsData = notificationsResult.value;
					notificationCount = notificationsData.data?.unread_count || 0;
					console.log("🔔 Notifications count:", notificationCount);
				} else {
					console.warn(
						"❌ Notifications fetch failed:",
						notificationsResult.status === "rejected"
							? notificationsResult.reason
							: "Unknown error"
					);
				}

				const result: HeaderCounters = {
					cartItemCount,
					favoriteCount,
					notificationCount,
				};

				console.log("✅ Header counters fetched successfully:", result);

				// ✅ ACTUALIZAR ESTADO Y CACHE
				setCounters(result);
				CacheService.setItem(CACHE_KEY, result, CACHE_TIME);
			} catch (error) {
				console.error("💥 Error fetching header counters:", error);
				setError(
					error instanceof Error ? error.message : "Error al cargar contadores"
				);
			} finally {
				setLoading(false);
				isFetching.current = false;
				console.log("🏁 Header counters fetch - END");
			}
		},
		[isAuthenticated]
	);

	// ✅ REFETCH MANUAL
	const refetch = useCallback(async () => {
		await fetchCounters(false);
	}, [fetchCounters]);

	// ✅ EFECTO INICIAL - Solo se ejecuta una vez al autenticarse
	useEffect(() => {
		if (isAuthenticated && !isInitialized.current) {
			console.log("🚀 Inicializando header counters");
			fetchCounters();
			isInitialized.current = true;
		} else if (!isAuthenticated) {
			console.log("🚪 Usuario no autenticado, limpiando contadores");
			setCounters({cartItemCount: 0, favoriteCount: 0, notificationCount: 0});
			setError(null);
			isInitialized.current = false;
		}
	}, [isAuthenticated, fetchCounters]);

	// ✅ POLLING CADA 3 MINUTOS (OPCIONAL)
	useEffect(() => {
		if (!isAuthenticated) return;

		const interval = setInterval(
			() => {
				console.log("⏰ Polling header counters");
				fetchCounters();
			},
			3 * 60 * 1000
		);

		return () => clearInterval(interval);
	}, [isAuthenticated, fetchCounters]);

	console.log("📊 useHeaderCounters render:", {
		counters,
		loading,
		error,
		isAuthenticated,
	});

	return {
		counters,
		loading,
		error,
		refetch,
	};
};

// ✅ HOOK DE INVALIDACIÓN SIMPLIFICADO
export const useInvalidateCounters = () => {
	const invalidateCounters = useCallback(() => {
		console.log("🔄 Invalidating header counters cache");
		CacheService.removeItem(CACHE_KEY);
	}, []);

	return {
		invalidateCounters,
		invalidateCart: invalidateCounters,
		invalidateFavorites: invalidateCounters,
		invalidateNotifications: invalidateCounters,
	};
};
