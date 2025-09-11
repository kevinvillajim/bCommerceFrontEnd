import {useEffect, useCallback, useRef} from "react";
import PrefetchService from "../../infrastructure/services/PrefetchService";

/**
 * Hook para prefetch automático inteligente
 * Se integra con PrefetchService para optimizar cargas de datos
 */

interface AutoPrefetchOptions {
	enabled?: boolean;
	delay?: number; // ms antes de ejecutar prefetch
	prefetchImages?: boolean;
	onPrefetchStart?: () => void;
	onPrefetchComplete?: () => void;
	onPrefetchError?: (error: Error) => void;
}

interface PrefetchTask {
	name: string;
	execute: () => Promise<void>;
	priority: number; // 1 = alta, 2 = media, 3 = baja
	condition?: () => boolean; // condición para ejecutar
}

export const useAutoPrefetch = (options: AutoPrefetchOptions = {}) => {
	const {
		enabled = true,
		delay = 1000,
		onPrefetchStart,
		onPrefetchComplete,
		onPrefetchError,
	} = options;

	const prefetchExecutedRef = useRef(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * Verifica si ya se ejecutó prefetch en esta sesión
	 */
	const shouldExecutePrefetch = useCallback((): boolean => {
		if (!enabled) return false;
		if (prefetchExecutedRef.current) return false;

		// Verificar sessionStorage para evitar prefetch duplicado
		const sessionFlag = sessionStorage.getItem("autoprefetch_executed");
		return sessionFlag !== "true";
	}, [enabled]);

	/**
	 * Marca prefetch como ejecutado
	 */
	const markPrefetchExecuted = useCallback(() => {
		prefetchExecutedRef.current = true;
		sessionStorage.setItem("autoprefetch_executed", "true");
	}, []);

	/**
	 * Ejecuta prefetch con prioridades
	 */
	const executePrefetchTasks = useCallback(async (): Promise<void> => {
		if (!shouldExecutePrefetch()) {
			return;
		}

		try {
			onPrefetchStart?.();

			// Definir tareas de prefetch por prioridad
			const tasks: PrefetchTask[] = [
				// PRIORIDAD ALTA (1) - Datos críticos
				{
					name: "categories",
					execute: () => PrefetchService.prefetchCategories(),
					priority: 1,
					condition: () => true,
				},
				{
					name: "featured_products",
					execute: () => PrefetchService.prefetchFeaturedProducts(8),
					priority: 1,
					condition: () => true,
				},

				// PRIORIDAD MEDIA (2) - Datos importantes
				{
					name: "category_1_products",
					execute: () => PrefetchService.prefetchCategoryProducts(1, 6),
					priority: 2,
					condition: () => true,
				},
				{
					name: "category_2_products",
					execute: () => PrefetchService.prefetchCategoryProducts(2, 6),
					priority: 2,
					condition: () => true,
				},

				// PRIORIDAD BAJA (3) - Datos opcionales
				{
					name: "category_3_products",
					execute: () => PrefetchService.prefetchCategoryProducts(3, 4),
					priority: 3,
					condition: () => Math.random() > 0.3, // Solo 70% de las veces
				},
			];

			// Ejecutar tareas por prioridad
			const sortedTasks = tasks
				.filter((task) => !task.condition || task.condition())
				.sort((a, b) => a.priority - b.priority);

			console.log(
				"🚀 Iniciando prefetch automático con",
				sortedTasks.length,
				"tareas"
			);

			// Ejecutar tareas de prioridad alta inmediatamente
			const highPriorityTasks = sortedTasks.filter(
				(task) => task.priority === 1
			);
			await Promise.allSettled(
				highPriorityTasks.map((task) => {
					console.log(`⚡ Ejecutando tarea de alta prioridad: ${task.name}`);
					return task.execute();
				})
			);

			// Ejecutar tareas de prioridad media con pequeño delay
			const mediumPriorityTasks = sortedTasks.filter(
				(task) => task.priority === 2
			);
			if (mediumPriorityTasks.length > 0) {
				setTimeout(async () => {
					await Promise.allSettled(
						mediumPriorityTasks.map((task) => {
							console.log(
								`📦 Ejecutando tarea de prioridad media: ${task.name}`
							);
							return task.execute();
						})
					);
				}, 500);
			}

			// Ejecutar tareas de prioridad baja con delay mayor
			const lowPriorityTasks = sortedTasks.filter(
				(task) => task.priority === 3
			);
			if (lowPriorityTasks.length > 0) {
				setTimeout(async () => {
					await Promise.allSettled(
						lowPriorityTasks.map((task) => {
							console.log(
								`🐌 Ejecutando tarea de prioridad baja: ${task.name}`
							);
							return task.execute();
						})
					);
				}, 2000);
			}

			markPrefetchExecuted();
			onPrefetchComplete?.();
			console.log("✅ Prefetch automático completado");
		} catch (error) {
			console.error("❌ Error en prefetch automático:", error);
			onPrefetchError?.(
				error instanceof Error ? error : new Error("Unknown prefetch error")
			);
		}
	}, [
		shouldExecutePrefetch,
		onPrefetchStart,
		onPrefetchComplete,
		onPrefetchError,
		markPrefetchExecuted,
	]);

	/**
	 * Prefetch específico para productos relacionados
	 */
	const prefetchRelatedProducts = useCallback(
		async (productId: number): Promise<void> => {
			try {
				console.log(
					`🔗 Prefetching productos relacionados para producto ${productId}`
				);

				// Simular prefetch de productos relacionados
				// En una implementación real, esto llamaría a una API específica
				const categoryIds = [1, 2, 3]; // IDs de categorías populares
				const randomCategoryId =
					categoryIds[Math.floor(Math.random() * categoryIds.length)];

				await PrefetchService.prefetchCategoryProducts(randomCategoryId, 4);
			} catch (error) {
				console.error("Error prefetching related products:", error);
			}
		},
		[]
	);

	/**
	 * Prefetch específico para página de carrito
	 */
	const prefetchCartPageData = useCallback(async (): Promise<void> => {
		try {
			console.log("🛒 Prefetching datos para página de carrito");

			// Precargar productos destacados que podrían aparecer en "recomendados"
			await PrefetchService.prefetchFeaturedProducts(4);

			// Precargar categorías para navegación
			await PrefetchService.prefetchCategories();
		} catch (error) {
			console.error("Error prefetching cart page data:", error);
		}
	}, []);

	/**
	 * Prefetch específico para página de favoritos
	 */
	const prefetchFavoritesPageData = useCallback(async (): Promise<void> => {
		try {
			console.log("❤️ Prefetching datos para página de favoritos");

			// Precargar productos destacados para recomendaciones
			await PrefetchService.prefetchFeaturedProducts(6);
		} catch (error) {
			console.error("Error prefetching favorites page data:", error);
		}
	}, []);

	/**
	 * Limpia timeouts al desmontar
	 */
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, []);

	/**
	 * Ejecuta prefetch inicial con delay
	 */
	useEffect(() => {
		if (enabled && shouldExecutePrefetch()) {
			timeoutRef.current = setTimeout(() => {
				executePrefetchTasks();
			}, delay);
		}

		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
		};
	}, [enabled, shouldExecutePrefetch, executePrefetchTasks, delay]);

	/**
	 * Fuerza ejecución de prefetch
	 */
	const forcePrefetch = useCallback(async (): Promise<void> => {
		prefetchExecutedRef.current = false;
		sessionStorage.removeItem("autoprefetch_executed");
		await executePrefetchTasks();
	}, [executePrefetchTasks]);

	/**
	 * Resetea el estado de prefetch
	 */
	const resetPrefetchState = useCallback((): void => {
		prefetchExecutedRef.current = false;
		sessionStorage.removeItem("autoprefetch_executed");
	}, []);

	/**
	 * Obtiene estadísticas de prefetch
	 */
	const getPrefetchStats = useCallback(() => {
		return {
			executed: prefetchExecutedRef.current,
			sessionFlag: sessionStorage.getItem("autoprefetch_executed") === "true",
			enabled,
		};
	}, [enabled]);

	return {
		// Estados
		isEnabled: enabled,
		isPrefetchExecuted: prefetchExecutedRef.current,

		// Funciones específicas
		prefetchRelatedProducts,
		prefetchCartPageData,
		prefetchFavoritesPageData,

		// Control manual
		forcePrefetch,
		resetPrefetchState,
		getPrefetchStats,
	};
};
