// src/core/domain/entities/Product.ts - CORREGIDO

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
	categoryOperator?: "and" | "or";

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
	sortBy?:
		| "price"
		| "rating"
		| "created_at"
		| "sales_count"
		| "name"
		| "featured";
	sortDir?: "asc" | "desc";
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
 * Interfaz para imágenes de productos - CORREGIDA
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
 * Interfaz base para productos - CORREGIDA con todos los campos necesarios
 */
export interface Product {
	id?: number;
	userId?: number;
	sellerId?: number;
	seller_id?: number; // Compatibilidad con API
	user_id?: number; // Compatibilidad con API
	categoryId?: number;
	category_id?: number; // Compatibilidad con API
	name: string;
	slug?: string;
	description: string;
	shortDescription?: string;
	short_description?: string; // Compatibilidad con API
	price: number;
	finalPrice?: number;
	final_price?: number; // ✅ CAMPO REQUERIDO POR CARRITO
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
	main_image?: string; // ✅ CAMPO PRINCIPAL DE IMAGEN
	image?: string; // Campo alternativo de imagen
	featured?: boolean;
	published?: boolean;
	status?: string;
	viewCount?: number;
	salesCount?: number;
	discountPercentage?: number;
	discount_percentage?: number; // ✅ CAMPO REQUERIDO POR CARRITO
	rating?: number; // ✅ CAMPO REQUERIDO POR CARRITO
	ratingCount?: number;
	rating_count?: number; // ✅ CAMPO REQUERIDO POR CARRITO
	isInStock?: boolean;
	is_in_stock?: boolean; // Compatibilidad con API
	stockAvailable?: number; // ✅ CAMPO PARA STOCK DISPONIBLE
	createdAt?: string;
	updatedAt?: string;

	// Relaciones
	category?: Category;
	seller?: Seller;
	user?: User;
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
	short_description?: string;
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
	parent_id?: number; // ✅ CAMPO REQUERIDO
	parentId?: number; // Versión camelCase
	icon?: string;
	color?: string;
	isActive?: boolean;
	is_active?: boolean;
	sortOrder?: number;
	sort_order?: number;
	metaTitle?: string;
	meta_title?: string;
	metaDescription?: string;
	meta_description?: string;
	createdAt?: string;
	updatedAt?: string;

	// Relaciones
	parent?: Category;
	children?: Category[];
	products?: Product[];
	productCount?: number;
	product_count?: number;
}

export interface Seller {
	id: number;
	name: string;
	storeName?: string; // ✅ CAMPO REQUERIDO POR ProductItemPage
	rating?: number;
	verified?: boolean;
	description?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	country?: string;
	postalCode?: string;
	logo?: string;
	banner?: string;
	socialMedia?: {
		website?: string;
		facebook?: string;
		instagram?: string;
		twitter?: string;
	};
}

export interface User {
	id: number;
	name: string;
	email: string;
	avatar?: string;
}

/**
 * Helper functions para validación de productos
 */
export const validateProduct = (product: Partial<Product>): string[] => {
  const errors: string[] = [];
  
  if (!product.name || product.name.trim().length === 0) {
    errors.push("El nombre del producto es requerido");
  }
  
  if (!product.description || product.description.trim().length === 0) {
    errors.push("La descripción del producto es requerida");
  }
  
  if (typeof product.price !== 'number' || product.price <= 0) {
    errors.push("El precio debe ser un número mayor a 0");
  }
  
  if (typeof product.stock !== 'number' || product.stock < 0) {
    errors.push("El stock debe ser un número mayor o igual a 0");
  }
  
  return errors;
};

/**
 * Helper function para calcular precio final
 */
export const calculateFinalPrice = (product: Product): number => {
  if (product.final_price !== undefined && product.final_price !== null) {
    return product.final_price;
  }
  
  if (product.finalPrice !== undefined && product.finalPrice !== null) {
    return product.finalPrice;
  }
  
  if (product.discount_percentage && product.discount_percentage > 0) {
    const discount = product.price * (product.discount_percentage / 100);
    return product.price - discount;
  }
  
  if (product.discountPercentage && product.discountPercentage > 0) {
    const discount = product.price * (product.discountPercentage / 100);
    return product.price - discount;
  }
  
  return product.price;
};

/**
 * Helper function para verificar disponibilidad
 */
export const isProductAvailable = (product: Product): boolean => {
  // Verificar si está en stock
  const inStock = product.is_in_stock ?? product.isInStock ?? (product.stock > 0);
  
  // Verificar si está publicado
  const published = product.published ?? (product.status === 'active');
  
  return inStock && published;
};

/**
 * Helper function para obtener la imagen principal
 */
export const getMainImage = (product: Product): string | undefined => {
  // Prioridad: main_image > image > primera imagen del array
  if (product.main_image) {
    return product.main_image;
  }
  
  if (product.image) {
    return product.image;
  }
  
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (typeof firstImage === 'string') {
      return firstImage;
    } else {
      return firstImage.original || firstImage.medium || firstImage.thumbnail;
    }
  }
  
  return undefined;
};
