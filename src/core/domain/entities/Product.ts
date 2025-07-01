// Fragmento para actualizar src/core/domain/entities/Product.ts
// Añadir o reemplazar estas interfaces:

/**
 * Parámetros de filtro para búsqueda de productos - VERSIÓN COMPLETA
 */
export interface ProductFilterParams {
	// Paginación
	limit?: number;
	offset?: number;
	page?: number;
  
	// Búsqueda
	term?: string;
  
	// Filtros de categoría
	categoryId?: number;
	categoryIds?: number[];
	categoryOperator?: 'and' | 'or';
  
	// Filtros de precio
	minPrice?: number;
	maxPrice?: number;
  
	// Filtros de valoración
	rating?: number;
  
	// Filtros de descuento
	minDiscount?: number;
	hasDiscount?: boolean;
  
	// Filtros booleanos
	featured?: boolean;
	published?: boolean;
	inStock?: boolean;
  
	// Filtros de vendedor
	sellerId?: number;
  
	// Filtros de atributos
	tags?: string | string[];
	colors?: string | string[];
	sizes?: string | string[];
  
	// Filtros de estado
	status?: string;
  
	// Ordenamiento
	sortBy?: 'price' | 'rating' | 'created_at' | 'sales_count' | 'name' | 'featured';
	sortDir?: 'asc' | 'desc';
  }
  
  /**
   * Respuesta de lista de productos
   */
  export interface ProductListResponse {
	data: Product[];
	meta: {
	  total: number;
	  count?: number;
	  limit: number;
	  offset: number;
	  page?: number;
	  pages?: number;
	};
  }
  
  /**
   * Interfaz base para productos
   */
  export interface Product {
	id?: number;
	userId?: number;
	sellerId?: number;
	categoryId?: number;
	name: string;
	slug: string;
	description: string;
	shortDescription?: string;
	price: number;
	finalPrice?: number;
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
	images?: string[] | ProductImage[];
	featured?: boolean;
	published?: boolean;
	status?: string;
	viewCount?: number;
	salesCount?: number;
	discountPercentage?: number;
	rating?: number;
	ratingCount?: number;
	isInStock?: boolean;
	createdAt?: string;
	updatedAt?: string;
	
	// Relaciones
	category?: Category;
	seller?: Seller;
	user?: User;
  }
  
  /**
   * Interfaz para imágenes de productos
   */
  export interface ProductImage {
	id?: number;
	url?: string;
	original?: string;
	medium?: string;
	thumbnail?: string;
	large?: string;
	alt?: string;
	position?: number;
  }
  
  /**
   * Interfaz detallada para productos (incluye relaciones)
   */
  export interface ProductDetail extends Product {
	// Campos adicionales para vista detallada
	related_products?: Product[];
	reviews?: ProductReview[];
	category?: Category;
	seller?: {
	  id: number;
	  name: string;
	  rating?: number;
	  verified?: boolean;
	};
	
	// Campos calculados
	is_in_stock?: boolean;
	final_price?: number;
	discount_percentage?: number;
	rating_count?: number;
	
	// Campos adicionales del backend
	user_id?: number;
	seller_id?: number;
	category_id?: number;
  }
  
  /**
   * Datos para creación de producto
   */
  export interface ProductCreationData {
	name: string;
	slug?: string;
	description: string;
	shortDescription?: string;
	price: number;
	stock: number;
	category_id: number;
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
	images?: File[];
	featured?: boolean;
	published?: boolean;
	status?: string;
	discount_percentage?: number;
  }
  
  /**
   * Datos para actualización de producto
   */
  export interface ProductUpdateData extends Partial<ProductCreationData> {
		id: number;
		// Campos específicos para actualización de imágenes - AGREGADOS
		replace_images?: boolean; // Si true, reemplaza todas las imágenes
		remove_images?: string[]; // URLs de imágenes a eliminar

		// Campos que pueden ser undefined en actualización
		category_id?: number;
		user_id?: number;
		seller_id?: number;
	}
  
  /**
   * Interfaz para reseñas de productos
   */
  export interface ProductReview {
	id: number;
	userId: number;
	productId: number;
	rating: number;
	comment?: string;
	verified?: boolean;
	helpful?: number;
	createdAt: string;
	user?: {
	  id: number;
	  name: string;
	  avatar?: string;
	};
  }
  
  /**
   * Interfaces auxiliares
   */
  export interface Category {
	id: number;
	name: string;
	slug: string;
	description?: string;
	image?: string;
  }
  
  export interface Seller {
	id: number;
	name: string;
	rating?: number;
	verified?: boolean;
	description?: string;
  }
  
  export interface User {
	id: number;
	name: string;
	email: string;
	avatar?: string;
  }