// src/presentation/contexts/FavoriteContext.tsx - OPTIMIZADO
import React, {createContext, useState, useCallback} from "react";
import type {ReactNode} from "react";
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {
	Favorite,
	FavoriteListResponse,
} from "../../core/domain/entities/Favorite";
import {useAuth} from "../hooks/useAuth";
import {
	useReactiveCache,
	useCacheInvalidation,
} from "../hooks/useReactiveCache";

interface FavoriteContextProps {
	favorites: Favorite[];
	loading: boolean;
	error: string | null;
	favoriteCount: number;
	toggleFavorite: (productId: number) => Promise<boolean>;
	checkIsFavorite: (productId: number) => boolean; // ✅ AHORA SINCRÓNICO usando cache
	fetchFavorites: () => Promise<void>;
	isProductFavorite: (productId: number) => boolean; // ✅ HELPER RÁPIDO
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
	const [favoriteCount, setFavoriteCount] = useState<number>(0);
	const {isAuthenticated} = useAuth();
	const {invalidateMany} = useCacheInvalidation();

	// ✅ USO DE CACHE REACTIVO para favoritos
	const {
		data: favoritesData,
		loading,
		error,
		refetch: fetchFavorites,
	} = useReactiveCache<Favorite[]>({
		key: "user_favorites",
		fetcher: async () => {
			if (!isAuthenticated) {
				return [];
			}

			console.log("🌐 Fetching favorites from API");
			const response = await ApiClient.get<FavoriteListResponse>(
				API_ENDPOINTS.FAVORITES.LIST
			);

			if (response && response.data) {
				const favoritesData = Array.isArray(response.data) ? response.data : [];
				console.log(`✅ Favoritos cargados: ${favoritesData.length}`);
				return favoritesData;
			}

			return [];
		},
		cacheTime: 10 * 60 * 1000, // 10 minutos de cache - más tiempo ya que no cambian tan frecuentemente
		invalidatePatterns: ["favorites_*", "header_counters"],
		dependencies: [isAuthenticated],
	});

	// ✅ ASEGURAR QUE SIEMPRE SEA ARRAY
	const favorites: Favorite[] = favoritesData || [];

	// Actualizar contador cuando cambien los favoritos
	React.useEffect(() => {
		setFavoriteCount(favorites.length);
	}, [favorites]);

	// ✅ CHECK SINCRÓNICO usando cache local
	const checkIsFavorite = useCallback(
		(productId: number): boolean => {
			return favorites.some((fav) => fav.productId === productId);
		},
		[favorites]
	);

	// Alias para mayor claridad
	const isProductFavorite = checkIsFavorite;

	// ✅ TOGGLE OPTIMIZADO con invalidación inteligente
	const toggleFavorite = useCallback(
		async (productId: number): Promise<boolean> => {
			if (!isAuthenticated) return false;

			const wasFavorite = checkIsFavorite(productId);

			try {
				console.log(
					`🔄 Toggling favorite for product ${productId} (was: ${wasFavorite})`
				);

				const response = await ApiClient.post<{isFavorite: boolean}>(
					API_ENDPOINTS.FAVORITES.TOGGLE,
					{productId}
				);

				// ✅ INVALIDAR CACHE para refetch automático
				invalidateMany(["favorites_*", "header_counters"]);

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
				return wasFavorite; // Mantener estado anterior en caso de error
			}
		},
		[isAuthenticated, checkIsFavorite, invalidateMany]
	);

	return (
		<FavoriteContext.Provider
			value={{
				favorites,
				loading,
				error: error || null,
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
