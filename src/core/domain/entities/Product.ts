// src/core/domain/entities/Product.ts - ACTUALIZADO CON VOLUME DISCOUNTS

/**
 * ✅ NUEVA: Interfaz para descuentos por volumen
 */
export interface VolumeDiscount {
	id?: number;
	quantity: number; // Cantidad mínima requerida
	discount: number; // Porcentaje de descuento
	label: string; // Etiqueta descriptiva
	price_per_unit?: number; // Precio por unidad con descuento
	total_price?: number; // Precio total para esa cantidad
	savings_per_unit?: number; // Ahorro por unidad
	total_savings?: number; // Ahorro total
	is_current?: boolean; // Si es el nivel actual aplicado
}

/**
 * ✅ NUEVA: Información de precios con descuentos por volumen
 */
export interface VolumePriceInfo {
	enabled: boolean;
	current_quantity: number;
	tiers: VolumeDiscount[];
	product: {
		id: number;
		name: string;
		base_price: number;
		final_price: number;
	};
}

/**
 * ✅ NUEVA: Configuración de descuentos por volumen
 */
export interface VolumeDiscountConfig {
	enabled: boolean;
	stackable: boolean; // Si se puede combinar con otros descuentos
	show_savings_message: boolean;
	default_tiers: Array<{
		quantity: number;
		discount: number;
		label: string;
	}>;
}

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
 * Interfaz base para productos - ACTUALIZADA con descuentos por volumen
 */
export interface Product {
	created_at: string;
	category_name: string;
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
	rating?: number | null; // ✅ CAMPO REQUERIDO POR CARRITO
	ratingCount?: number | null;
	rating_count?: number | null; // ✅ CAMPO REQUERIDO POR CARRITO
	
	// ✅ NUEVOS: Campos calculados desde tabla ratings (JOIN opcional)
	calculated_rating?: number | null; // Rating calculado desde ratings.rating
	calculated_rating_count?: number | null; // Count calculado desde ratings
	isInStock?: boolean;
	is_in_stock?: boolean; // Compatibilidad con API
	stockAvailable?: number; // ✅ CAMPO PARA STOCK DISPONIBLE
	createdAt?: string;
	updatedAt?: string;

	// ✅ NUEVOS: Campos para descuentos por volumen
	has_volume_discounts?: boolean;
	volume_discounts?: VolumeDiscount[];
	volume_discount_info?: VolumePriceInfo;

	// Relaciones
	category?: Category;
	seller?: Seller;
	user?: User;
}

/**
 * ✅ ACTUALIZADA: Interfaz detallada para productos (incluye descuentos por volumen)
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

	// ✅ NUEVOS: Descuentos por volumen en detalle
	volume_discount_tiers?: VolumeDiscount[];
	next_volume_discount?: {
		quantity: number;
		discount: number;
		label: string;
		items_needed: number;
	};
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
	
	// ✅ NUEVO: Descuentos por volumen en creación
	volume_discounts?: Array<{
		quantity: number;
		discount: number;
		label: string;
	}>;
}

/**
 * Datos para actualización de producto
 */
export interface ProductUpdateData extends Partial<ProductCreationData> {
	id: number;
	// Campos específicos para actualización de imágenes
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
 * ✅ ACTUALIZADA: Helper function para calcular precio final con descuentos por volumen
 */
export const calculateFinalPrice = (product: Product, quantity: number = 1): number => {
  // Si tiene descuentos por volumen, usar el precio correspondiente
  if (product.has_volume_discounts && product.volume_discounts && quantity > 1) {
    // Buscar el descuento aplicable para la cantidad
    let applicableDiscount: VolumeDiscount | null = null;
    
    for (const discount of product.volume_discounts) {
      if (quantity >= discount.quantity) {
        applicableDiscount = discount;
      } else {
        break; // Los descuentos están ordenados por cantidad
      }
    }
    
    if (applicableDiscount) {
      const basePrice = product.final_price || product.finalPrice || product.price || 0;
      return basePrice * (1 - applicableDiscount.discount / 100);
    }
  }
  
  // Fallback al cálculo normal
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
 * ✅ NUEVA: Helper function para obtener el mejor descuento disponible
 */
export const getBestVolumeDiscount = (product: Product, quantity: number): VolumeDiscount | null => {
  if (!product.has_volume_discounts || !product.volume_discounts) {
    return null;
  }
  
  let bestDiscount: VolumeDiscount | null = null;
  
  for (const discount of product.volume_discounts) {
    if (quantity >= discount.quantity) {
      bestDiscount = discount;
    } else {
      break;
    }
  }
  
  return bestDiscount;
};

/**
 * ✅ NUEVA: Helper function para obtener el próximo nivel de descuento
 */
export const getNextVolumeDiscount = (product: Product, currentQuantity: number): VolumeDiscount | null => {
  if (!product.has_volume_discounts || !product.volume_discounts) {
    return null;
  }
  
  for (const discount of product.volume_discounts) {
    if (currentQuantity < discount.quantity) {
      return discount;
    }
  }
  
  return null; // Ya tiene el máximo descuento
};

/**
 * ✅ NUEVA: Helper function para calcular ahorros totales
 */
export const calculateVolumeSavings = (product: Product, quantity: number): number => {
  const regularPrice = product.final_price || product.finalPrice || product.price || 0;
  const volumePrice = calculateFinalPrice(product, quantity);
  
  return (regularPrice - volumePrice) * quantity;
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