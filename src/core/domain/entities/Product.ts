import type { Category } from './Category';
import type { Seller } from './Seller';

/**
 * Product entity
 */
export interface Product {
  id?: number;
  userId: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight?: number;
  width?: number;
  height?: number;
  depth?: number;
  dimensions?: string;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  sku?: string;
  attributes?: Record<string, any>;
  images?: string[];
  featured: boolean;
  published: boolean;
  status: string;
  viewCount: number;
  salesCount: number;
  discountPercentage: number;
  finalPrice?: number;
  isInStock?: boolean;
  ratingAvg?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Product with related data
 */
export interface ProductDetail extends Omit<Product, 'categoryId'> {
  category: Category;
  seller: Seller;
  reviewCount?: number;
}

/**
 * Product list response
 */
export interface ProductListResponse {
  data: Product[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

/**
 * Product creation data
 */
export interface ProductCreationData {
  name: string;
  categoryId: number;
  description: string;
  price: number;
  stock: number;
  weight?: number;
  dimensions?: string;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  sku?: string;
  attributes?: Record<string, any>;
  images?: File[];
  featured?: boolean;
  published?: boolean;
  status?: string;
  discountPercentage?: number;
}

/**
 * Product update data
 */
export interface ProductUpdateData extends Partial<ProductCreationData> {
  id: number;
}

/**
 * Product filter params
 */
export interface ProductFilterParams {
  term?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  featured?: boolean;
  sellerId?: number;
  status?: string;
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  inStock?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
