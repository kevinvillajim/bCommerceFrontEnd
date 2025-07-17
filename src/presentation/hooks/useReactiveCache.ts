// src/presentation/hooks/useReactiveCache.ts

import {useState, useEffect, useCallback, useRef} from "react";
import CacheService from "../../infrastructure/services/CacheService";

// Eventos de invalidación de cache
type CacheEvent = {
	pattern: string;
	timestamp: number;
};

// Gestor global de eventos de cache
class CacheEventManager {
	private static instance: CacheEventManager;
	private listeners: Map<string, Set<() => void>> = new Map();
	private eventEmitter: EventTarget = new EventTarget();

	static getInstance(): CacheEventManager {
		if (!CacheEventManager.instance) {
			CacheEventManager.instance = new CacheEventManager();
		}
		return CacheEventManager.instance;
	}

	/**
	 * Suscribirse a invalidaciones de cache por patrón
	 */
	subscribe(pattern: string, callback: () => void): () => void {
		if (!this.listeners.has(pattern)) {
			this.listeners.set(pattern, new Set());
		}

		this.listeners.get(pattern)!.add(callback);

		// Retornar función de limpieza
		return () => {
			const callbacks = this.listeners.get(pattern);
			if (callbacks) {
				callbacks.delete(callback);
				if (callbacks.size === 0) {
					this.listeners.delete(pattern);
				}
			}
		};
	}

	/**
	 * Invalidar cache por patrón
	 */
	invalidate(pattern: string): void {
		console.log(`🔄 Invalidando cache: ${pattern}`);

		// Eliminar items de localStorage que coincidan con el patrón
		const allKeys = Object.keys(localStorage);
		const matchingKeys = allKeys.filter((key) =>
			this.matchesPattern(key, pattern)
		);

		matchingKeys.forEach((key) => {
			CacheService.removeItem(key);
		});

		// Notificar a listeners
		const callbacks = this.listeners.get(pattern);
		if (callbacks) {
			callbacks.forEach((callback) => callback());
		}

		// También notificar patrones relacionados
		this.notifyRelatedPatterns(pattern);
	}

	private matchesPattern(key: string, pattern: string): boolean {
		// Convertir patrón en regex
		const regexPattern = pattern.replace(/\*/g, ".*").replace(/\?/g, ".");

		const regex = new RegExp(`^${regexPattern}$`);
		return regex.test(key);
	}

	private notifyRelatedPatterns(pattern: string): void {
		// Notificar patrones relacionados (ej: si se invalida "products_*", también invalidar "product_*")
		this.listeners.forEach((callbacks, listenerPattern) => {
			if (
				listenerPattern !== pattern &&
				this.areRelatedPatterns(pattern, listenerPattern)
			) {
				callbacks.forEach((callback) => callback());
			}
		});
	}

	private areRelatedPatterns(pattern1: string, pattern2: string): boolean {
		// Lógica simple: si comparten prefijo
		const base1 = pattern1.split("_")[0];
		const base2 = pattern2.split("_")[0];
		return base1 === base2;
	}
}

interface UseCacheOptions<T> {
	key: string;
	fetcher: () => Promise<T>;
	cacheTime?: number;
	invalidatePatterns?: string[]; // Patrones que invalidarán esta cache
	dependencies?: any[]; // Dependencias que forzarán refetch
}

/**
 * Hook reactivo para manejo de cache que se auto-invalida
 */
export function useReactiveCache<T>({
	key,
	fetcher,
	cacheTime = 10 * 60 * 1000, // 10 minutos por defecto
	invalidatePatterns = [],
	dependencies = [],
}: UseCacheOptions<T>) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const cacheManager = useRef(CacheEventManager.getInstance());
	const isMountedRef = useRef(true);

	// Función para cargar datos
	const loadData = useCallback(
		async (forceRefresh = false) => {
			if (!isMountedRef.current) return;

			setLoading(true);
			setError(null);

			try {
				// Verificar cache primero si no forzamos refresh
				if (!forceRefresh) {
					const cachedData = CacheService.getItem(key);
					if (cachedData) {
						console.log(`📦 Cache hit: ${key}`);
						setData(cachedData);
						setLoading(false);
						return cachedData;
					}
				}

				console.log(`🌐 Fetching: ${key}`);
				const result = await fetcher();

				if (!isMountedRef.current) return result;

				// Guardar en cache
				CacheService.setItem(key, result, cacheTime);
				setData(result);

				return result;
			} catch (err) {
				if (!isMountedRef.current) return null;

				const errorMessage =
					err instanceof Error ? err.message : "Error desconocido";
				console.error(`❌ Error loading ${key}:`, err);
				setError(errorMessage);
				return null;
			} finally {
				if (isMountedRef.current) {
					setLoading(false);
				}
			}
		},
		[key, fetcher, cacheTime]
	);

	// Efecto para cargar datos iniciales y suscribirse a invalidaciones
	useEffect(() => {
		loadData();

		// Suscribirse a invalidaciones
		const unsubscribeFunctions = invalidatePatterns.map((pattern) =>
			cacheManager.current.subscribe(pattern, () => {
				console.log(`🔄 Revalidating ${key} due to pattern: ${pattern}`);
				loadData(true);
			})
		);

		return () => {
			unsubscribeFunctions.forEach((unsub) => unsub());
		};
	}, [loadData, invalidatePatterns]);

	// Efecto para recargar cuando cambien las dependencias
	useEffect(() => {
		if (dependencies.length > 0) {
			loadData(true);
		}
	}, dependencies);

	// Cleanup al desmontar
	useEffect(() => {
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return {
		data,
		loading,
		error,
		refetch: () => loadData(true),
		isValidating: loading,
	};
}

/**
 * Hook para invalidar cache de forma programática
 */
export function useCacheInvalidation() {
	const cacheManager = useRef(CacheEventManager.getInstance());

	return {
		/**
		 * Invalida cache por patrón
		 */
		invalidate: (pattern: string) => {
			cacheManager.current.invalidate(pattern);
		},

		/**
		 * Invalida múltiples patrones
		 */
		invalidateMany: (patterns: string[]) => {
			patterns.forEach((pattern) => {
				cacheManager.current.invalidate(pattern);
			});
		},

		/**
		 * Invalida cache después de una mutación
		 */
		invalidateAfterMutation: (patterns: string[]) => {
			// Ejecutar invalidación en el próximo tick para asegurar que la mutación terminó
			setTimeout(() => {
				patterns.forEach((pattern) => {
					cacheManager.current.invalidate(pattern);
				});
			}, 0);
		},
	};
}

export default useReactiveCache;
