import {useState} from "react";
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {Favorite} from "../../core/domain/entities/Favorite";
import {useAuth} from "./useAuth";

// Interfaces para las respuestas de la API
interface ApiResponse<T> {
	status: string;
	data: T;
	message?: string;
	meta?: any;
}

interface FavoriteApiResponse {
	is_favorite: boolean;
	favorite_id: number | null;
	notification_preferences?: {
		notify_price_change: boolean;
		notify_promotion: boolean;
		notify_low_stock: boolean;
	} | null;
}

interface FavoritesResponse {
	favorites: Array<{
		favorite: Favorite;
		product?: any;
	}>;
	meta: {
		total: number;
		limit: number;
		offset: number;
		has_more: boolean;
	};
}

interface UseFavoriteApiReturn {
	loading: boolean;
	error: string | null;
	getUserFavorites: (
		limit?: number,
		offset?: number
	) => Promise<FavoritesResponse>;
	toggleFavorite: (
		productId: number,
		notificationPreferences?: {
			notify_price_change?: boolean;
			notify_promotion?: boolean;
			notify_low_stock?: boolean;
		}
	) => Promise<{
		is_favorite: boolean;
		favorite_id: number | null;
		message: string;
	}>;
	checkIsFavorite: (productId: number) => Promise<{
		is_favorite: boolean;
		favorite_id: number | null;
		notification_preferences: {
			notify_price_change: boolean;
			notify_promotion: boolean;
			notify_low_stock: boolean;
		} | null;
	}>;
	updateNotificationPreferences: (
		favoriteId: number,
		preferences: {
			notify_price_change: boolean;
			notify_promotion: boolean;
			notify_low_stock: boolean;
		}
	) => Promise<{
		success: boolean;
		message: string;
		favorite?: any;
	}>;
}

export const useFavoriteApi = (): UseFavoriteApiReturn => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const {isAuthenticated} = useAuth();

	const getUserFavorites = async (
		limit = 10,
		offset = 0
	): Promise<FavoritesResponse> => {
		try {
			setLoading(true);
			setError(null);

			if (!isAuthenticated) {
				throw new Error("User must be authenticated to get favorites");
			}

			const response = await ApiClient.get<ApiResponse<any[]>>(
				API_ENDPOINTS.FAVORITES.LIST,
				{
					limit,
					offset,
				}
			);

			return {
				favorites: response?.data || [],
				meta: response?.meta || {
					total: 0,
					limit,
					offset,
					has_more: false,
				},
			};
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to fetch favorites";
			setError(errorMessage);
			return {
				favorites: [],
				meta: {
					total: 0,
					limit,
					offset,
					has_more: false,
				},
			};
		} finally {
			setLoading(false);
		}
	};

	const toggleFavorite = async (
		productId: number,
		notificationPreferences?: {
			notify_price_change?: boolean;
			notify_promotion?: boolean;
			notify_low_stock?: boolean;
		}
	) => {
		try {
			setLoading(true);
			setError(null);

			if (!isAuthenticated) {
				throw new Error("User must be authenticated to toggle favorites");
			}

			// Establecer valores predeterminados si no se proporcionan
			const preferences = {
				notify_price_change:
					notificationPreferences?.notify_price_change !== undefined
						? notificationPreferences.notify_price_change
						: true,
				notify_promotion:
					notificationPreferences?.notify_promotion !== undefined
						? notificationPreferences.notify_promotion
						: true,
				notify_low_stock:
					notificationPreferences?.notify_low_stock !== undefined
						? notificationPreferences.notify_low_stock
						: true,
			};

			const response = await ApiClient.post<ApiResponse<FavoriteApiResponse>>(
				API_ENDPOINTS.FAVORITES.TOGGLE,
				{
					product_id: productId,
					notification_preferences: preferences,
				}
			);

			return {
				is_favorite: response?.data?.is_favorite || false,
				favorite_id: response?.data?.favorite_id || null,
				message: response?.message || "Favorite status updated",
			};
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to toggle favorite";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const checkIsFavorite = async (productId: number) => {
		try {
			setLoading(true);
			setError(null);

			if (!isAuthenticated) {
				return {
					is_favorite: false,
					favorite_id: null,
					notification_preferences: null,
				};
			}

			const response = await ApiClient.get<ApiResponse<FavoriteApiResponse>>(
				API_ENDPOINTS.FAVORITES.CHECK(productId)
			);

			return {
				is_favorite: response?.data?.is_favorite || false,
				favorite_id: response?.data?.favorite_id || null,
				notification_preferences:
					response?.data?.notification_preferences || null,
			};
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to check favorite status";
			setError(errorMessage);
			console.error(errorMessage);

			// Return a default response on error rather than throwing
			return {
				is_favorite: false,
				favorite_id: null,
				notification_preferences: null,
			};
		} finally {
			setLoading(false);
		}
	};

	const updateNotificationPreferences = async (
		favoriteId: number,
		preferences: {
			notify_price_change: boolean;
			notify_promotion: boolean;
			notify_low_stock: boolean;
		}
	) => {
		try {
			setLoading(true);
			setError(null);

			if (!isAuthenticated) {
				throw new Error(
					"User must be authenticated to update notification preferences"
				);
			}

			const response = await ApiClient.put<ApiResponse<any>>(
				API_ENDPOINTS.FAVORITES.UPDATE_NOTIFICATIONS(favoriteId),
				preferences
			);

			return {
				success: true,
				message: response?.message || "Notification preferences updated",
				favorite: response?.data,
			};
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Failed to update notification preferences";
			setError(errorMessage);
			throw new Error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		error,
		getUserFavorites,
		toggleFavorite,
		checkIsFavorite,
		updateNotificationPreferences,
	};
};

export default useFavoriteApi;
