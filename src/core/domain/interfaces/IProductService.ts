import type {
  Product,
  ProductDetail,
  ProductListResponse,
  ProductCreationData,
  ProductUpdateData,
  ProductFilterParams
} from '../entities/Product';

/**
 * Interface for Product Service
 */
export interface IProductService {
  /**
   * Get products with filtering, pagination and sorting
   */
  getProducts(filterParams?: ProductFilterParams): Promise<ProductListResponse>;
  
  /**
   * Get product detail by ID
   */
  getProductById(id: number): Promise<ProductDetail>;
  
  /**
   * Get product by slug
   */
  getProductBySlug(slug: string): Promise<ProductDetail>;
  
  /**
   * Create new product
   */
  createProduct(data: ProductCreationData): Promise<Product>;
  
  /**
   * Update existing product
   */
  updateProduct(data: ProductUpdateData): Promise<Product>;
  
  /**
   * Delete product
   */
  deleteProduct(id: number): Promise<boolean>;
  
  /**
   * Get featured products
   */
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  
  /**
   * Get related products
   */
  getRelatedProducts(productId: number, limit?: number): Promise<Product[]>;
  
  /**
   * Track product view
   */
  trackProductView(productId: number): Promise<void>;
}