/**
 * Rating entity
 */
export interface Rating {
  id?: number;
  userId: number;
  sellerId?: number;
  orderId?: number;
  productId?: number;
  rating: number;
  title?: string;
  comment?: string;
  status: 'pending' | 'approved' | 'rejected';
  type: 'product' | 'seller' | 'user';
  createdAt?: string;
  updatedAt?: string;
  // Campos adicionales útiles para el frontend
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
  isVerifiedPurchase?: boolean;
}

/**
 * Product rating creation data
 */
export interface ProductRatingCreationData {
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
  orderId?: number;
}

/**
 * Seller rating creation data
 */
export interface SellerRatingCreationData {
  sellerId: number;
  rating: number;
  title?: string;
  comment?: string;
  orderId?: number;
}

/**
 * User rating creation data (for sellers rating buyers)
 */
export interface UserRatingCreationData {
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  orderId?: number;
}

/**
 * Rating response
 */
export interface RatingResponse {
  status: string;
  message: string;
  data: Rating;
}

/**
 * Ratings list response
 */
export interface RatingsListResponse {
  data: Rating[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    average_rating?: number;
    rating_counts?: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
    };
  };
}

/**
 * Rating moderation request (for admin)
 */
export interface RatingModerationRequest {
  id: number;
  status: 'approved' | 'rejected';
  moderationNotes?: string;
}

/**
 * Rating filter params
 */
export interface RatingFilterParams {
  userId?: number;
  sellerId?: number;
  productId?: number;
  orderId?: number;
  minRating?: number;
  maxRating?: number;
  status?: string;
  type?: string;
  verifiedOnly?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}