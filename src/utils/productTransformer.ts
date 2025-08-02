import type { Product } from '../core/domain/entities/Product';

/**
 * Interfaz que espera el ProductCarousel
 */
export interface ProductCarouselType {
  id: number;
  name: string;
  price: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  image: string;
  category?: string;
  isNew?: boolean;
  stock?: number;
  slug?: string;
}

/**
 * Transforma un Product de la API al formato que espera ProductCarousel
 */
export const transformProductForCarousel = (product: Product): ProductCarouselType => {
  // Obtener la imagen principal
  const getMainImage = (): string => {
    if (product.main_image) return product.main_image;
    if (product.image) return product.image;
    
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      } else if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url;
      }
    }
    
    // Imagen por defecto si no hay ninguna
    return '/images/placeholder-product.jpg';
  };

  // Calcular discount percentage
  const getDiscountPercentage = (): number | undefined => {
    if (product.discount_percentage) return product.discount_percentage;
    if (product.discountPercentage) return product.discountPercentage;
    
    // Si no hay discount_percentage pero hay precio final, calculamos el descuento
    const finalPrice = product.final_price || product.finalPrice;
    if (finalPrice && finalPrice < product.price) {
      return Math.round(((product.price - finalPrice) / product.price) * 100);
    }
    
    return undefined;
  };

  // Obtener rating
  const getRating = (): number | undefined => {
    if (product.rating !== null && product.rating !== undefined) return product.rating;
    if (product.calculated_rating !== null && product.calculated_rating !== undefined) {
      return product.calculated_rating;
    }
    return undefined;
  };

  // Obtener número de reviews
  const getReviews = (): number | undefined => {
    if (product.rating_count !== null && product.rating_count !== undefined) return product.rating_count;
    if (product.ratingCount !== null && product.ratingCount !== undefined) return product.ratingCount;
    if (product.calculated_rating_count !== null && product.calculated_rating_count !== undefined) {
      return product.calculated_rating_count;
    }
    return undefined;
  };

  // Determinar si es nuevo (productos creados en los últimos 30 días)
  const getIsNew = (): boolean => {
    if (product.isNew !== undefined) return product.isNew;
    
    if (product.created_at || product.createdAt) {
      const createdDate = new Date(product.created_at || product.createdAt!);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }
    
    return false;
  };

  return {
    id: product.id!,
    name: product.name || 'Producto sin nombre',
    price: product.final_price || product.finalPrice || product.price || 0,
    discount: getDiscountPercentage(),
    rating: getRating(),
    reviews: getReviews(),
    image: getMainImage(),
    category: product.category_name || product.category?.name,
    isNew: getIsNew(),
    stock: product.stock || 0,
    slug: product.slug
  };
};

/**
 * Transforma un array de Products al formato que espera ProductCarousel
 */
export const transformProductsForCarousel = (products: Product[]): ProductCarouselType[] => {
  return products
    .filter(product => product.id !== undefined) // Filtrar productos sin ID
    .map(transformProductForCarousel);
};

/**
 * Función helper para obtener imagen de producto con fallback
 */
export const getProductImage = (product: Product, size: 'thumbnail' | 'medium' | 'large' | 'original' = 'medium'): string => {
  const defaultImage = '/images/placeholder-product.jpg';
  
  // Prioridad: main_image > image > images array
  if (product.main_image) return product.main_image;
  if (product.image) return product.image;
  
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (typeof firstImage === 'object') {
      // Si es un objeto ProductImage, usar el tamaño solicitado
      switch (size) {
        case 'thumbnail':
          return firstImage.thumbnail || firstImage.medium || firstImage.original || defaultImage;
        case 'medium':
          return firstImage.medium || firstImage.original || firstImage.thumbnail || defaultImage;
        case 'large':
          return firstImage.large || firstImage.original || firstImage.medium || defaultImage;
        case 'original':
          return firstImage.original || firstImage.large || firstImage.medium || defaultImage;
        default:
          return firstImage.url || firstImage.medium || firstImage.original || defaultImage;
      }
    }
  }
  
  return defaultImage;
};

/**
 * Función helper para calcular el precio final de un producto
 */
export const calculateProductFinalPrice = (product: Product): number => {
  // Si ya tiene final_price, usarlo
  if (product.final_price !== undefined && product.final_price !== null) {
    return product.final_price;
  }
  
  if (product.finalPrice !== undefined && product.finalPrice !== null) {
    return product.finalPrice;
  }
  
  // Si hay descuento, calcularlo
  const discountPercentage = product.discount_percentage || product.discountPercentage;
  if (discountPercentage && discountPercentage > 0) {
    return product.price * (1 - discountPercentage / 100);
  }
  
  // Precio base
  return product.price;
};

/**
 * Función helper para verificar si un producto está disponible
 */
export const isProductAvailable = (product: Product): boolean => {
  // Verificar stock
  const hasStock = product.stock > 0 || product.is_in_stock || product.isInStock;
  
  // Verificar si está publicado
  const isPublished = product.published !== false && product.status !== 'inactive';
  
  return hasStock && isPublished;
};

export default {
  transformProductForCarousel,
  transformProductsForCarousel,
  getProductImage,
  calculateProductFinalPrice,
  isProductAvailable
};
