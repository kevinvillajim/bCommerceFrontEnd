// src/presentation/hooks/useReactiveCache.ts

import {useState, useEffect, useCallback, useRef} from "react";
import CacheService from "../../infrastructure/services/CacheService";

// Gestor global de eventos de cache
class CacheEventManager {
	private static instance: CacheEventManager;
	private listeners: Map<string, Set<() => void>> = new Map();

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
	const lastDependencies = useRef<any[]>([]);

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
				
				// ✅ INTENTAR FETCH Y MANEJAR ERRORES ESPECÍFICOS
				try {
					const result = await fetcher();

					if (!isMountedRef.current) return result;

					// Guardar en cache solo si el resultado es válido
					if (result !== null && result !== undefined) {
						CacheService.setItem(key, result, cacheTime);
						setData(result);
					}

					return result;
				} catch (fetchError) {
					// ✅ SI EL ERROR ES DE AUTENTICACIÓN, NO REINTENTAR
					if (fetchError instanceof Error) {
						const errorMsg = fetchError.message.toLowerCase();
						if (errorMsg.includes('token') || errorMsg.includes('unauthorized') || errorMsg.includes('401')) {
							console.log(`🚫 Auth error for ${key}, setting empty data`);
							setData(null);
							return null;
						}
					}
					throw fetchError; // Re-lanzar otros errores
				}
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
		// ✅ SOLO CARGAR DATOS AL INICIO SI HACE SENTIDO
		// Para user_favorites, no cargar si no hay token
		if (key === 'user_favorites') {
			// Buscar token en las claves más comunes
			const possibleTokenKeys = ['authToken', 'token', 'auth_token', 'access_token'];
			const hasToken = possibleTokenKeys.some(tokenKey => localStorage.getItem(tokenKey));
			
			if (!hasToken) {
				console.log(`🚫 No auth token found, skipping initial load for ${key}`);
				// ✅ NO LLAMAR setData - simplemente salir
				return;
			}
		}

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
	}, [loadData, invalidatePatterns, key]);

	// ✅ EFECTO MEJORADO PARA DEPENDENCIAS - EVITAR LOOPS
	useEffect(() => {
		// ✅ SOLO PROCESAR DEPENDENCIAS SI HAY ALGUNA
		if (dependencies.length === 0) return;

		// Verificar si las dependencias realmente cambiaron
		const dependenciesChanged = dependencies.some((dep, index) => {
			return dep !== lastDependencies.current[index];
		}) || dependencies.length !== lastDependencies.current.length;

		if (dependenciesChanged) {
			console.log(`🔄 Dependencies changed for ${key}:`, {
				old: lastDependencies.current,
				new: dependencies
			});
			
			lastDependencies.current = [...dependencies];
			
			// ✅ VERIFICACIÓN ESPECÍFICA PARA user_favorites
			if (key === 'user_favorites') {
				const isAuthenticated = dependencies[0]; // Asumiendo que es el primer dep
				if (!isAuthenticated) {
					console.log(`🚫 User not authenticated, skipping reload for ${key}`);
					// ✅ NO LLAMAR setData - simplemente salir
					return;
				}
			}
			
			// Solo recargar si realmente tiene sentido
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