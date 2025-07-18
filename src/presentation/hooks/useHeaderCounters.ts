// src/presentation/hooks/useHeaderCounters.ts - CORREGIDO SIN ERRORES TS

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

// ✅ INTERFACE SIMPLE SEGÚN LO QUE REALMENTE ENVÍA EL BACKEND
interface HeaderCountersResponse {
	status?: string;
	data?: {
		cart_count: number;
		favorites_count: number;
		notifications_count: number;
	};
}

// ✅ SINGLETON SIMPLIFICADO - UNA SOLA CONSULTA
class HeaderCountersManager {
	private static instance: HeaderCountersManager;
	private subscribers: Set<(counters: HeaderCounters) => void> = new Set();
	private currentCounters: HeaderCounters = {
		cartItemCount: 0,
		favoriteCount: 0,
		notificationCount: 0,
	};
	private isLoading = false;
	private error: string | null = null;
	private lastFetch = 0;
	private readonly CACHE_KEY = "header_counters";
	private readonly CACHE_TIME = 2 * 60 * 1000; // 2 minutos
	private readonly MIN_FETCH_INTERVAL = 30 * 1000; // 30 segundos mínimo

	static getInstance(): HeaderCountersManager {
		if (!HeaderCountersManager.instance) {
			HeaderCountersManager.instance = new HeaderCountersManager();
		}
		return HeaderCountersManager.instance;
	}

	subscribe(callback: (counters: HeaderCounters) => void): () => void {
		this.subscribers.add(callback);

		// Enviar datos actuales inmediatamente
		callback(this.currentCounters);

		return () => {
			this.subscribers.delete(callback);
		};
	}

	private notify() {
		console.log(
			"🔔 Notifying subscribers with counters:",
			this.currentCounters
		);
		this.subscribers.forEach((callback) => callback(this.currentCounters));
	}

	async fetchCounters(forceRefresh = false): Promise<void> {
		const now = Date.now();

		// Evitar fetches muy frecuentes
		if (!forceRefresh && now - this.lastFetch < this.MIN_FETCH_INTERVAL) {
			console.log("⏸️ Fetch demasiado reciente, saltando...");
			return;
		}

		// Verificar cache primero
		if (!forceRefresh) {
			const cached = CacheService.getItem(this.CACHE_KEY);
			if (cached) {
				console.log("📦 Using cached header counters");
				this.currentCounters = cached;
				this.notify();
				return;
			}
		}

		if (this.isLoading) {
			console.log("⏸️ Fetch ya en progreso");
			return;
		}

		this.isLoading = true;
		this.error = null;
		this.notify(); // Notificar que está cargando

		try {
			console.log("🌐 Fetching header counters from unified endpoint...");
			console.log("📍 Endpoint URL:", API_ENDPOINTS.HEADER_COUNTERS);

			// ✅ UNA SOLA CONSULTA AL ENDPOINT UNIFICADO
			const response = await ApiClient.get<HeaderCountersResponse>(
				API_ENDPOINTS.HEADER_COUNTERS
			);

			// ✅ LOGS DETALLADOS PARA DEBUG
			console.log("📡 RAW RESPONSE FROM BACKEND:", response);
			console.log("📊 Response type:", typeof response);
			console.log("📊 Response.data:", response?.data);
			console.log("📊 Response.data type:", typeof response?.data);

			// ✅ MAPEO CORRECTO SEGÚN LO QUE ENVÍA EL BACKEND
			let cartCount = 0;
			let favCount = 0;
			let notifCount = 0;

			if (response && response.data && typeof response.data === "object") {
				cartCount = response.data.cart_count || 0;
				favCount = response.data.favorites_count || 0;
				notifCount = response.data.notifications_count || 0;

				console.log("📦 Datos extraídos de response.data:");
				console.log("   - cart_count:", response.data.cart_count);
				console.log("   - favorites_count:", response.data.favorites_count);
				console.log(
					"   - notifications_count:",
					response.data.notifications_count
				);
			}

			console.log("🔄 Valores finales mapeados:");
			console.log("   - cartCount:", cartCount);
			console.log("   - favCount:", favCount);
			console.log("   - notifCount:", notifCount);

			this.currentCounters = {
				cartItemCount: cartCount,
				favoriteCount: favCount,
				notificationCount: notifCount,
			};

			this.lastFetch = now;

			// Guardar en cache
			CacheService.setItem(
				this.CACHE_KEY,
				this.currentCounters,
				this.CACHE_TIME
			);

			console.log("✅ Header counters set to:", this.currentCounters);
		} catch (error: any) {
			console.error("💥 Error fetching header counters:", error);

			// ✅ LOGGING DETALLADO DEL ERROR
			if (error instanceof Error) {
				console.error("📝 Error message:", error.message);
				console.error("📋 Error stack:", error.stack);
			}

			// Si es un error de Axios, mostrar más detalles
			if (error?.response) {
				console.error("🌐 Response status:", error.response.status);
				console.error("📊 Response data:", error.response.data);
			}

			this.error =
				error instanceof Error ? error.message : "Error al cargar contadores";

			// En caso de error, mantener valores en 0
			this.currentCounters = {
				cartItemCount: 0,
				favoriteCount: 0,
				notificationCount: 0,
			};
		} finally {
			this.isLoading = false;
			this.notify();
		}
	}

	invalidateCache() {
		console.log("🔄 Invalidating header counters cache");
		CacheService.removeItem(this.CACHE_KEY);
		this.lastFetch = 0;
	}

	getState() {
		return {
			counters: this.currentCounters,
			loading: this.isLoading,
			error: this.error,
		};
	}

	// ✅ MÉTODO PARA ACTUALIZAR UN CONTADOR ESPECÍFICO SIN REFETCH COMPLETO
	updateCounter(type: keyof HeaderCounters, value: number) {
		this.currentCounters = {
			...this.currentCounters,
			[type]: Math.max(0, value), // Asegurar que no sea negativo
		};

		// Actualizar cache también
		CacheService.setItem(this.CACHE_KEY, this.currentCounters, this.CACHE_TIME);
		this.notify();

		console.log(`📊 Counter updated: ${type} = ${value}`);
	}

	// ✅ MÉTODOS DE CONVENIENCIA PARA OPERACIONES COMUNES
	incrementCart() {
		this.updateCounter("cartItemCount", this.currentCounters.cartItemCount + 1);
	}

	decrementCart() {
		this.updateCounter("cartItemCount", this.currentCounters.cartItemCount - 1);
	}

	incrementFavorites() {
		this.updateCounter("favoriteCount", this.currentCounters.favoriteCount + 1);
	}

	decrementFavorites() {
		this.updateCounter("favoriteCount", this.currentCounters.favoriteCount - 1);
	}

	markNotificationAsRead() {
		this.updateCounter(
			"notificationCount",
			this.currentCounters.notificationCount - 1
		);
	}
}

export const useHeaderCounters = (): UseHeaderCountersReturn => {
	const [state, setState] = useState(() => {
		const manager = HeaderCountersManager.getInstance();
		return manager.getState();
	});

	const {isAuthenticated} = useAuth();
	const managerRef = useRef(HeaderCountersManager.getInstance());

	useEffect(() => {
		if (!isAuthenticated) {
			setState({
				counters: {cartItemCount: 0, favoriteCount: 0, notificationCount: 0},
				loading: false,
				error: null,
			});
			return;
		}

		const manager = managerRef.current;

		// Suscribirse a cambios
		const unsubscribe = manager.subscribe((counters) => {
			console.log("📨 useHeaderCounters recibió counters:", counters);
			console.log("📨 Manager state:", manager.getState());

			const newState = {
				counters,
				loading: manager.getState().loading,
				error: manager.getState().error,
			};

			console.log("📨 Setting new state:", newState);
			setState(newState);
		});

		// Fetch inicial
		manager.fetchCounters();

		return unsubscribe;
	}, [isAuthenticated]);

	const refetch = useCallback(async () => {
		if (isAuthenticated) {
			await managerRef.current.fetchCounters(true);
		}
	}, [isAuthenticated]);

	const returnValue = {
		counters: state.counters,
		loading: state.loading,
		error: state.error,
		refetch,
	};

	console.log("🚀 useHeaderCounters returning:", returnValue);

	return returnValue;
};

// ✅ HOOK PARA INVALIDACIÓN Y OPERACIONES OPTIMISTAS
export const useInvalidateCounters = () => {
	const manager = useRef(HeaderCountersManager.getInstance());

	return {
		// Invalidación completa
		invalidateCounters: () => {
			manager.current.invalidateCache();
		},

		// ✅ OPERACIONES OPTIMISTAS - Actualizar inmediatamente sin esperar refetch
		optimisticCartAdd: () => {
			manager.current.incrementCart();
		},

		optimisticCartRemove: () => {
			manager.current.decrementCart();
		},

		optimisticFavoriteAdd: () => {
			manager.current.incrementFavorites();
		},

		optimisticFavoriteRemove: () => {
			manager.current.decrementFavorites();
		},

		optimisticNotificationRead: () => {
			manager.current.markNotificationAsRead();
		},

		// ✅ FORZAR REFETCH COMPLETO
		forceRefresh: () => {
			manager.current.fetchCounters(true);
		},
	};
};
