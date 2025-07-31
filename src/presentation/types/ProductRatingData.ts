// src/presentation/types/ProductRatingData.ts

export interface ProductRatingData {
  rating?: number;
  ratingCount?: number;
  rating_count?: number; // Para compatibilidad con API
}

// Función helper para extraer datos de rating de manera consistente
export const extractRatingData = (product: any): ProductRatingData => {
  return {
    rating: product.rating || product.averageRating || 0,
    ratingCount: product.ratingCount || product.rating_count || product.reviews || 0,
    rating_count: product.rating_count || product.ratingCount || product.reviews || 0
  };
};

// Función helper para normalizar el campo de rating count
export const normalizeRatingCount = (product: any): number => {
  return product.ratingCount || product.rating_count || product.reviews || 0;
};

// Función helper para normalizar el campo de rating
export const normalizeRating = (product: any): number => {
  const rating = product.rating || product.averageRating || 0;
  return typeof rating === 'number' && !isNaN(rating) ? rating : 0;
};