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

interface HeaderCountersResponse {
	status?: string;
	data?: {
		cart_count: number;
		favorites_count: number;
		notifications_count: number;
	};
}

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
	private readonly CACHE_TIME = 2 * 60 * 1000;
	private readonly MIN_FETCH_INTERVAL = 30 * 1000;

	static getInstance(): HeaderCountersManager {
		if (!HeaderCountersManager.instance) {
			HeaderCountersManager.instance = new HeaderCountersManager();
		}
		return HeaderCountersManager.instance;
	}

	subscribe(callback: (counters: HeaderCounters) => void): () => void {
		this.subscribers.add(callback);
		callback(this.currentCounters);
		return () => this.subscribers.delete(callback);
	}

	private notify() {
		this.subscribers.forEach((callback) => callback(this.currentCounters));
	}

	async fetchCounters(forceRefresh = false): Promise<void> {
		const now = Date.now();

		if (!forceRefresh && now - this.lastFetch < this.MIN_FETCH_INTERVAL) {
			return;
		}

		if (!forceRefresh) {
			const cached = CacheService.getItem(this.CACHE_KEY);
			if (cached) {
				this.currentCounters = cached;
				this.notify();
				return;
			}
		}

		if (this.isLoading) return;

		this.isLoading = true;
		this.error = null;
		this.notify();

		try {
			const response = await ApiClient.get<HeaderCountersResponse>(
				API_ENDPOINTS.HEADER_COUNTERS
			);

			let cartCount = 0;
			let favCount = 0;
			let notifCount = 0;

			if (response?.data) {
				cartCount = response.data.cart_count || 0;
				favCount = response.data.favorites_count || 0;
				notifCount = response.data.notifications_count || 0;
			}

			this.currentCounters = {
				cartItemCount: cartCount,
				favoriteCount: favCount,
				notificationCount: notifCount,
			};

			this.lastFetch = now;
			CacheService.setItem(this.CACHE_KEY, this.currentCounters, this.CACHE_TIME);

		} catch (error: any) {
			this.error = error instanceof Error ? error.message : "Error al cargar contadores";
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

	updateCounter(type: keyof HeaderCounters, value: number) {
		this.currentCounters = {
			...this.currentCounters,
			[type]: Math.max(0, value),
		};
		CacheService.setItem(this.CACHE_KEY, this.currentCounters, this.CACHE_TIME);
		this.notify();
	}

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
		this.updateCounter("notificationCount", this.currentCounters.notificationCount - 1);
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
		const unsubscribe = manager.subscribe((counters) => {
			setState({
				counters,
				loading: manager.getState().loading,
				error: manager.getState().error,
			});
		});

		manager.fetchCounters();
		return unsubscribe;
	}, [isAuthenticated]);

	const refetch = useCallback(async () => {
		if (isAuthenticated) {
			await managerRef.current.fetchCounters(true);
		}
	}, [isAuthenticated]);

	return {
		counters: state.counters,
		loading: state.loading,
		error: state.error,
		refetch,
	};
};

export const useInvalidateCounters = () => {
	const manager = useRef(HeaderCountersManager.getInstance());

	return {
		invalidateCounters: () => manager.current.invalidateCache(),
		optimisticCartAdd: () => manager.current.incrementCart(),
		optimisticCartRemove: () => manager.current.decrementCart(),
		optimisticFavoriteAdd: () => manager.current.incrementFavorites(),
		optimisticFavoriteRemove: () => manager.current.decrementFavorites(),
		optimisticNotificationRead: () => manager.current.markNotificationAsRead(),
		forceRefresh: () => manager.current.fetchCounters(true),
	};
};
