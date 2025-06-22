import type { Category } from '../core/domain/entities/Category';
import type { Product } from '../core/domain/entities/Product';

/**
 * Calcula el número de productos por categoría
 * @param categories Lista de categorías
 * @param products Lista de productos (opcional, si está disponible)
 * @returns Un objeto con el nombre de la categoría como clave y la cantidad de productos como valor
 */
export const calculateProductCountByCategory = (
  categories: Category[],
  products?: Product[]
): Record<string, number> => {
  const productCountMap: Record<string, number> = {};
  
  // Inicializar contador para todas las categorías
  categories.forEach(category => {
    productCountMap[category.name] = category.product_count || 0;
  });
  
  // Si tenemos productos, actualizar contadores basados en ellos
  if (products && products.length > 0) {
    products.forEach(product => {
      const categoryId = product.categoryId;
      const category = categories.find(c => c.id === categoryId);
      
      if (category) {
        productCountMap[category.name] = (productCountMap[category.name] || 0) + 1;
      }
    });
  }
  
  return productCountMap;
};

/**
 * Ordena las categorías por cantidad de productos
 * @param categories Lista de categorías
 * @param productCountMap Mapa de conteo de productos por categoría
 * @returns Lista ordenada de categorías (de mayor a menor cantidad)
 */
export const sortCategoriesByProductCount = (
  categories: Category[],
  productCountMap: Record<string, number>
): Category[] => {
  return [...categories].sort((a, b) => {
    const countA = productCountMap[a.name] || 0;
    const countB = productCountMap[b.name] || 0;
    return countB - countA; // Ordenar de mayor a menor
  });
};