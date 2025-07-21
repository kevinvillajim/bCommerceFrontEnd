// src/presentation/contexts/FavoriteContext.tsx - OPTIMIZADO SIN LOOPS
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
	const [favoriteCount, setFavoriteCount] = useState<number>(0);
	const {isAuthenticated} = useAuth();
	const {invalidateMany} = useCacheInvalidation();

	// ✅ USO DE CACHE REACTIVO SIN DEPENDENCIAS QUE CAUSEN LOOPS
	const {
		data: favoritesData,
		loading,
		error,
		refetch: fetchFavorites,
	} = useReactiveCache<Favorite[]>({
		key: "user_favorites",
		fetcher: async () => {
			// ✅ VERIFICACIÓN INTERNA - No depender de dependencias externas
			if (!isAuthenticated) {
				console.log("🚫 No autenticado, no cargar favoritos");
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
		cacheTime: 10 * 60 * 1000,
		invalidatePatterns: ["favorites_*", "header_counters"],
		// ✅ SIN DEPENDENCIAS - Evitar loops infinitos
		dependencies: [],
	});

	// ✅ NO USEEFFECT - Dejar que useReactiveCache maneje todo internamente

	// ✅ SI NO AUTENTICADO, DEVOLVER DATOS VACÍOS
	const favorites: Favorite[] = isAuthenticated ? (favoritesData || []) : [];

	// Actualizar contador cuando cambien los favoritos
	React.useEffect(() => {
		setFavoriteCount(favorites.length);
	}, [favorites]);

	// ✅ CHECK SINCRÓNICO usando cache local
	const checkIsFavorite = useCallback(
		(productId: number): boolean => {
			if (!isAuthenticated) return false;
			return favorites.some((fav) => fav.productId === productId);
		},
		[favorites, isAuthenticated]
	);

	// Alias para mayor claridad
	const isProductFavorite = checkIsFavorite;

	// ✅ TOGGLE OPTIMIZADO con verificación de autenticación
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
				return wasFavorite;
			}
		},
		[isAuthenticated, checkIsFavorite, invalidateMany]
	);

	// ✅ FETCHFAVORITES QUE RESPETA AUTENTICACIÓN
	const safeFetchFavorites = useCallback(async () => {
		if (!isAuthenticated) {
			console.log("🚫 No autenticado, no fetch favoritos");
			return;
		}
		await fetchFavorites();
	}, [isAuthenticated, fetchFavorites]);

	return (
		<FavoriteContext.Provider
			value={{
				favorites,
				loading: isAuthenticated ? loading : false,
				error: isAuthenticated ? (error || null) : null,
				favoriteCount,
				toggleFavorite,
				checkIsFavorite,
				fetchFavorites: safeFetchFavorites,
				isProductFavorite,
			}}
		>
			{children}
		</FavoriteContext.Provider>
	);
};