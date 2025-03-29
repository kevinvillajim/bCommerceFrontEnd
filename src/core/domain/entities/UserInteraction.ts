/**
 * User Interaction entity
 */
export interface UserInteraction {
  id?: number;
  userId: number;
  type: InteractionType;
  itemId: number;
  metadata: Record<string, any>;
  createdAt?: string;
}

/**
 * Interaction types
 */
export type InteractionType = 
  | 'view'
  | 'search'
  | 'add_to_cart'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  | 'purchase'
  | 'rate'
  | 'review'
  | 'share'
  | 'click'
  | 'filter'
  | 'sort';

/**
 * User Interaction creation data
 */
export interface UserInteractionCreationData {
  type: InteractionType;
  itemId: number;
  metadata?: Record<string, any>;
}

/**
 * Track interaction request
 */
export interface TrackInteractionRequest {
  type: InteractionType;
  itemId: number;
  metadata?: Record<string, any>;
}

/**
 * Track interaction response
 */
export interface TrackInteractionResponse {
  status: string;
  message: string;
  data?: {
    interaction: UserInteraction;
  };
}

/**
 * User profile based on interactions
 */
export interface UserInteractionProfile {
  userId: number;
  preferences: {
    categories: Array<{
      id: number;
      name: string;
      score: number;
    }>;
    priceRange: {
      min: number;
      max: number;
      avg: number;
    };
    brands: Array<{
      id: number;
      name: string;
      score: number;
    }>;
    features: Record<string, number>;
  };
  recentlyViewed: Array<{
    productId: number;
    timestamp: string;
  }>;
  searchHistory: Array<{
    term: string;
    timestamp: string;
  }>;
}

/**
 * User interaction list response
 */
export interface UserInteractionListResponse {
  data: UserInteraction[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * User interaction filter params
 */
export interface UserInteractionFilterParams {
  userId?: number;
  type?: InteractionType | InteractionType[];
  itemId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
  sortDir?: 'asc' | 'desc';
}

/**
 * Recommendation request based on interactions
 */
export interface RecommendationRequest {
  userId?: number;
  limit?: number;
  categoryId?: number;
  excludeIds?: number[];
}

/**
 * Recommendation response
 */
export interface RecommendationResponse {
  data: Array<{
    productId: number;
    score: number;
    reasons: string[];
  }>;
}