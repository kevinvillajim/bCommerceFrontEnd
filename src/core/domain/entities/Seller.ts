/**
 * Seller entity
 * Represents a seller in the system
 */
export interface Seller {
  id: number;
  userId: number;
  storeName: string;
  description?: string;
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium';
  commissionRate: number;
  totalSales: number;
  isFeatured: boolean;
  averageRating?: number;
  totalRatings?: number;
  createdAt?: string;
  updatedAt?: string;
  // Campos adicionales del API actual
  userName?: string;
  email?: string;
  displayName?: string;
}

/**
 * Seller detail
 * Expanded seller information typically used in detail views
 */
export interface SellerDetail extends Seller {
  user?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  products?: {
    count: number;
    featured?: number;
  };
  sales?: {
    thisMonth: number;
    lastMonth: number;
    total: number;
  };
  ratings?: {
    distribution: {
      '5': number;
      '4': number;
      '3': number;
      '2': number;
      '1': number;
    };
  };
}

/**
 * Basic seller data
 * Used for lists and cards
 */
export interface SellerBasic {
  id: number;
  userId: number;
  storeName: string;
  verificationLevel: 'none' | 'basic' | 'verified' | 'premium';
  averageRating?: number;
  totalRatings?: number;
  isFeatured: boolean;
  totalSales: number;
}

/**
 * Seller creation data
 * Used when registering a new seller
 */
export interface SellerCreationData {
  userId: number;
  storeName: string;
  description?: string;
}

/**
 * Seller update data
 * Used when updating seller information
 */
export interface SellerUpdateData {
  storeName?: string;
  description?: string;
}

/**
 * Top sellers response
 */
export interface TopSellersResponse {
  status: string;
  data: SellerBasic[];
  meta?: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Seller info response
 */
export interface SellerInfoResponse {
  status: string;
  data: SellerDetail;
}

/**
 * Seller filter params
 * Used for filtering seller listings
 */
export interface SellerFilterParams {
  status?: 'pending' | 'active' | 'suspended' | 'inactive';
  verificationLevel?: 'none' | 'basic' | 'verified' | 'premium';
  featured?: boolean;
  minRating?: number;
  minSales?: number;
  term?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
