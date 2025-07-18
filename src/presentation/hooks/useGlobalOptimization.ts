import {useCallback, useEffect, useRef} from "react";
import {useImageCache} from "./useImageCache";
import {useAutoPrefetch} from "./useAutoPrefetch";
import CacheService from "../../infrastructure/services/CacheService";
import {
	clearRelativeTimeCache,
	getRelativeTimeCacheStats,
} from "../../utils/dateUtils";

/**
 * Hook coordinador global para todas las optimizaciones
 * Centraliza el control de cache, prefetch e imágenes
 */

interface GlobalOptimizationStats {
	cacheService: {
		total: number;
		active: number;
		expired: number;
		totalSize: number;
	};
	dateCache: {
		total: number;
		active: number;
		expired: number;
		maxSize: number;
		cacheDuration: number;
	};
	imageCache: {
		total: number;
		active: number;
		expired: number;
		cacheDuration: number;
	};
	prefetch: {
		executed: boolean;
		sessionFlag: boolean;
		enabled: boolean;
	};
}

interface GlobalOptimizationOptions {
	enableAutoPrefetch?: boolean;
	enableImageCache?: boolean;
	autoCleanupInterval?: number; // minutos
	maxCacheSize?: number;
	onOptimizationComplete?: () => void;
	onCacheCleanup?: (stats: GlobalOptimizationStats) => void;
}

export const useGlobalOptimization = (
	options: GlobalOptimizationOptions = {}
) => {
	const {
		enableAutoPrefetch = true,
		enableImageCache = true,
		autoCleanupInterval = 30, // 30 minutos
		maxCacheSize = 100,
		onOptimizationComplete,
		onCacheCleanup,
	} = options;

	const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

	// Hooks de optimización
	const {getCacheStats: getImageCacheStats, clearImageCache} = useImageCache();

	const {getPrefetchStats, resetPrefetchState, forcePrefetch} = useAutoPrefetch(
		{
			enabled: enableAutoPrefetch,
			onPrefetchComplete: () => {
				console.log("🎯 Global optimization: Prefetch completed");
				onOptimizationComplete?.();
			},
		}
	);

	/**
	 * Obtiene estadísticas completas de todas las optimizaciones
	 */
	const getGlobalStats = useCallback((): GlobalOptimizationStats => {
		return {
			cacheService: CacheService.getStats(),
			dateCache: getRelativeTimeCacheStats(),
			imageCache: getImageCacheStats(),
			prefetch: getPrefetchStats(),
		};
	}, [getImageCacheStats, getPrefetchStats]);

	/**
	 * Limpia automáticamente caches cuando están muy llenos
	 */
	const performAutoCleanup = useCallback((): void => {
		const stats = getGlobalStats();

		console.log("🧹 Iniciando limpieza automática de caches");

		let cleanupPerformed = false;

		// Limpiar cache de fechas si está muy lleno
		if (stats.dateCache.total > stats.dateCache.maxSize * 0.8) {
			console.log("🗑️ Limpiando cache de fechas relativas");
			clearRelativeTimeCache();
			cleanupPerformed = true;
		}

		// Limpiar cache de CacheService si está muy lleno
		if (stats.cacheService.total > maxCacheSize) {
			console.log("🗑️ Limpiando cache expirado de CacheService");
			CacheService.clearExpired();
			cleanupPerformed = true;
		}

		// Limpiar cache de imágenes si es necesario
		if (stats.imageCache.total > 150) {
			console.log("🗑️ Limpiando cache de imágenes");
			clearImageCache();
			cleanupPerformed = true;
		}

		if (cleanupPerformed) {
			const newStats = getGlobalStats();
			onCacheCleanup?.(newStats);
			console.log("✅ Limpieza automática completada", newStats);
		}
	}, [getGlobalStats, maxCacheSize, clearImageCache, onCacheCleanup]);

	/**
	 * Limpia todos los caches manualmente
	 */
	const clearAllCaches = useCallback((): void => {
		console.log("🧹 Limpiando todos los caches manualmente");

		// Limpiar cache de fechas
		clearRelativeTimeCache();

		// Limpiar cache de servicio principal
		CacheService.clearAll();

		// Limpiar cache de imágenes
		clearImageCache();

		// Resetear estado de prefetch
		resetPrefetchState();

		console.log("✅ Todos los caches limpiados");
	}, [clearImageCache, resetPrefetchState]);

	/**
	 * Optimiza el rendimiento previa carga de recursos críticos
	 */
	const optimizeForPage = useCallback(
		async (
			pageType: "home" | "products" | "cart" | "favorites" | "product-detail"
		): Promise<void> => {
			console.log(`🎯 Optimizando rendimiento para página: ${pageType}`);

			try {
				switch (pageType) {
					case "home":
						// Para página de inicio, forzar prefetch si no se ha ejecutado
						if (!getPrefetchStats().executed) {
							await forcePrefetch();
						}
						break;

					case "products":
						// Para página de productos, limpiar cache antiguo de productos
						const productKeys = ["products_featured", "products_default"];
						productKeys.forEach((key) => {
							if (!CacheService.hasValidItem(key)) {
								CacheService.removeItem(key);
							}
						});
						break;

					case "cart":
						// Para carrito, optimizar cache de imágenes para thumbnails
						console.log("🛒 Preparando cache para vista de carrito");
						break;

					case "favorites":
						// Para favoritos, preparar cache para imágenes medianas
						console.log("❤️ Preparando cache para vista de favoritos");
						break;

					case "product-detail":
						// Para detalles de producto, preparar para imágenes de alta calidad
						console.log("🔍 Preparando cache para vista de detalles");
						break;
				}
			} catch (error) {
				console.error(`❌ Error optimizando para página ${pageType}:`, error);
			}
		},
		[getPrefetchStats, forcePrefetch]
	);

	/**
	 * Configura limpieza automática periódica
	 */
	useEffect(() => {
		if (autoCleanupInterval > 0) {
			cleanupIntervalRef.current = setInterval(
				() => {
					performAutoCleanup();
				},
				autoCleanupInterval * 60 * 1000
			); // Convertir minutos a ms

			console.log(
				`⏰ Limpieza automática configurada cada ${autoCleanupInterval} minutos`
			);
		}

		return () => {
			if (cleanupIntervalRef.current) {
				clearInterval(cleanupIntervalRef.current);
				cleanupIntervalRef.current = null;
			}
		};
	}, [autoCleanupInterval, performAutoCleanup]);

	/**
	 * Verifica el estado de salud de las optimizaciones
	 */
	const getHealthStatus = useCallback(() => {
		const stats = getGlobalStats();

		const health = {
			overall: "good" as "good" | "warning" | "critical",
			issues: [] as string[],
			recommendations: [] as string[],
		};

		// Verificar cache de CacheService
		if (stats.cacheService.total > maxCacheSize * 1.2) {
			health.overall = "warning";
			health.issues.push("Cache principal muy lleno");
			health.recommendations.push("Ejecutar limpieza de cache");
		}

		// Verificar cache de fechas
		if (stats.dateCache.total > stats.dateCache.maxSize) {
			health.overall = "warning";
			health.issues.push("Cache de fechas al límite");
			health.recommendations.push("Reducir frecuencia de formateo de fechas");
		}

		// Verificar cache de imágenes
		if (stats.imageCache.total > 200) {
			if (health.overall === "good") health.overall = "warning";
			health.issues.push("Cache de imágenes muy grande");
			health.recommendations.push("Limpiar cache de imágenes");
		}

		// Verificar prefetch
		if (!stats.prefetch.executed && stats.prefetch.enabled) {
			health.recommendations.push(
				"Considerar ejecutar prefetch para mejor rendimiento"
			);
		}

		return health;
	}, [getGlobalStats, maxCacheSize]);

	/**
	 * Modo debug para estadísticas detalladas
	 */
	const debugStats = useCallback((): void => {
		const stats = getGlobalStats();
		const health = getHealthStatus();

		console.group("🔧 Debug: Estadísticas de Optimización Global");
		console.log("📊 Estadísticas completas:", stats);
		console.log("🏥 Estado de salud:", health);
		console.log("💾 Cache Service debug:");
		CacheService.debug();
		console.groupEnd();
	}, [getGlobalStats, getHealthStatus]);

	return {
		// Estados y estadísticas
		getGlobalStats,
		getHealthStatus,
		debugStats,

		// Limpieza manual
		clearAllCaches,
		performAutoCleanup,

		// Optimización específica
		optimizeForPage,

		// Control de configuración
		isAutoPrefetchEnabled: enableAutoPrefetch,
		isImageCacheEnabled: enableImageCache,
		autoCleanupIntervalMinutes: autoCleanupInterval,
	};
};
