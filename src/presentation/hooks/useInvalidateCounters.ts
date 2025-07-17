// src/presentation/hooks/useInvalidateCounters.ts
import {useCallback} from "react";
import CacheService from "../../infrastructure/services/CacheService";

export const useInvalidateCounters = () => {
	const invalidateCounters = useCallback(() => {
		console.log("🔄 Invalidating header counters cache");
		CacheService.removeItem("header_counters");
	}, []);

	const invalidateCart = useCallback(() => {
		console.log("🛒 Invalidating cart cache");
		CacheService.removeItem("header_counters");
		// También invalidar cache específico del carrito si existe
		CacheService.removeItem("cart_data");
	}, []);

	const invalidateFavorites = useCallback(() => {
		console.log("❤️ Invalidating favorites cache");
		CacheService.removeItem("header_counters");
		// También invalidar cache específico de favoritos si existe
		CacheService.removeItem("favorites_data");
	}, []);

	const invalidateNotifications = useCallback(() => {
		console.log("🔔 Invalidating notifications cache");
		CacheService.removeItem("header_counters");
		// También invalidar cache específico de notificaciones si existe
		CacheService.removeItem("notifications_data");
	}, []);

	return {
		invalidateCounters,
		invalidateCart,
		invalidateFavorites,
		invalidateNotifications,
	};
};
