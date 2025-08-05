// src/presentation/contexts/FavoriteContext.tsx - SOLUCIÓN SIMPLE SIN LOOPS
import React, {createContext, useState, useCallback, useEffect} from "react";
import type {ReactNode} from "react";
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Favorite,
	FavoriteListResponse,
} from "../../core/domain/entities/Favorite";
import {useAuth} from "../hooks/useAuth";
import CacheService from "../../infrastructure/services/CacheService";

interface FavoriteContextProps {
	favorites: Favorite[];
	loading: boolean;
	error: string | null;
	favoriteCount: number;
	toggleFavorite: (productId: number) => Promise<boolean>;
	checkIsFavorite: (productId: number) => boolean;
	fetchFavorites: () => Promise<void>;
	isProductFavorite: (productId: number) => boolean;
}

export const FavoriteContext = createContext<FavoriteContextProps>({
	favorites: [],
	loading: false,
	error: null,
	favoriteCount: 0,
	toggleFavorite: async () => false,
	checkIsFavorite: () => false,
	fetchFavorites: async () => {},
	isProductFavorite: () => false,
});

interface FavoriteProviderProps {
	children: ReactNode;
}

export const FavoriteProvider: React.FC<FavoriteProviderProps> = ({
	children,
}) => {
	const [favorites, setFavorites] = useState<Favorite[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [favoriteCount, setFavoriteCount] = useState<number>(0);
	const {isAuthenticated} = useAuth();

	// ✅ FUNCIÓN SIMPLE PARA FETCH SIN LOOPS
	const fetchFavorites = useCallback(async () => {
		if (!isAuthenticated) {
			setFavorites([]);
			setFavoriteCount(0);
			return;
		}

		// Verificar cache primero
		const cachedFavorites = CacheService.getItem("user_favorites");
		if (cachedFavorites) {
			console.log("📦 Using cached favorites");
			setFavorites(cachedFavorites);
			setFavoriteCount(cachedFavorites.length);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			console.log("🌐 Fetching favorites from API");
			const response = await ApiClient.get<FavoriteListResponse>(
				API_ENDPOINTS.FAVORITES.LIST
			);

			if (response && response.data) {
				const favoritesData = Array.isArray(response.data) ? response.data : [];
				console.log(`✅ Favoritos cargados: ${favoritesData.length}`);
				
				setFavorites(favoritesData);
				setFavoriteCount(favoritesData.length);
				
				// Guardar en cache por 10 minutos
				CacheService.setItem("user_favorites", favoritesData, 10 * 60 * 1000);
			} else {
				setFavorites([]);
				setFavoriteCount(0);
			}
		} catch (err) {
			console.error("Error fetching favorites:", err);
			setError(err instanceof Error ? err.message : "Error al cargar favoritos");
			setFavorites([]);
			setFavoriteCount(0);
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated]);

	// Initialize context but don't auto-fetch favorites (use header-counters for count)
	useEffect(() => {
		if (!isAuthenticated) {
			setFavorites([]);
			setFavoriteCount(0);
		}
		// Don't auto-fetch - only fetch when explicitly requested (e.g., FavoritePage)
	}, [isAuthenticated]);

	// ✅ CHECK SINCRÓNICO
	const checkIsFavorite = useCallback(
		(productId: number): boolean => {
			if (!isAuthenticated) return false;
			return favorites.some((fav) => fav.productId === productId);
		},
		[favorites, isAuthenticated]
	);

	// Alias para mayor claridad
	const isProductFavorite = checkIsFavorite;

	// ✅ TOGGLE SIMPLE
	const toggleFavorite = useCallback(
		async (productId: number): Promise<boolean> => {
			if (!isAuthenticated) {
				console.log("🚫 No autenticado, no se puede toggle favorite");
				return false;
			}

			const wasFavorite = checkIsFavorite(productId);

			try {
				console.log(
					`🔄 Toggling favorite for product ${productId} (was: ${wasFavorite})`
				);

				const response = await ApiClient.post<{isFavorite: boolean}>(
					API_ENDPOINTS.FAVORITES.TOGGLE,
					{productId}
				);

				// Invalidar cache y refetch
				CacheService.removeItem("user_favorites");
				CacheService.removeItem("header_counters");
				await fetchFavorites();

				const newState =
					response?.isFavorite !== undefined
						? response.isFavorite
						: !wasFavorite;

				console.log(
					`✅ Favorite toggled: product ${productId} is now ${newState ? "favorited" : "unfavorited"}`
				);

				return newState;
			} catch (err) {
				console.error("Error toggling favorite:", err);
				return wasFavorite;
			}
		},
		[isAuthenticated, checkIsFavorite, fetchFavorites]
	);

	return (
		<FavoriteContext.Provider
			value={{
				favorites,
				loading,
				error,
				favoriteCount,
				toggleFavorite,
				checkIsFavorite,
				fetchFavorites,
				isProductFavorite,
			}}
		>
			{children}
		</FavoriteContext.Provider>
	);
};