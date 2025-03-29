/**
 * Favorite entity
 */
export interface Favorite {
  id?: number;
  userId: number;
  productId: number;
  notifyPriceChange: boolean;
  notifyPromotion: boolean;
  notifyLowStock: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Campos relacionados que pueden ser útiles en el frontend
  product?: {
    id: number;
    name: string;
    price: number;
    image?: string;
    slug?: string;
  };
}

/**
 * Favorite creation data
 */
export interface FavoriteCreationData {
  productId: number;
  notifyPriceChange?: boolean;
  notifyPromotion?: boolean;
  notifyLowStock?: boolean;
}

/**
 * Favorite notification settings update
 */
export interface FavoriteNotificationUpdateData {
  id: number;
  notifyPriceChange?: boolean;
  notifyPromotion?: boolean;
  notifyLowStock?: boolean;
}

/**
 * Toggle favorite request
 */
export interface FavoriteToggleRequest {
  productId: number;
}

/**
 * Toggle favorite response
 */
export interface FavoriteToggleResponse {
  status: string;
  message: string;
  isFavorite: boolean;
  favorite?: Favorite;
}

/**
 * Favorite list response
 */
export interface FavoriteListResponse {
  data: Favorite[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Check favorite status response
 */
export interface FavoriteCheckResponse {
  isFavorite: boolean;
  favorite?: Favorite;
}