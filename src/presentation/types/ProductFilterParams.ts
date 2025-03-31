import type { ProductFilterParams as OriginalFilterParams } from '../../core/domain/entities/Product';

/**
 * Extendemos la interfaz ProductFilterParams para añadir parámetros adicionales que necesitamos
 */
export interface ExtendedProductFilterParams extends OriginalFilterParams {
  /**
   * Descuento mínimo para filtrar productos (en porcentaje)
   */
  minDiscount?: number;
  
  /**
   * Filtrar por productos destacados
   */
  featured?: boolean;
  
  /**
   * IDs de categorías para selección múltiple
   */
  categoryIds?: number[];

  /**
   * Operador para filtrar por múltiples categorías:
   * - 'and': Devuelve productos que están en TODAS las categorías seleccionadas (intersección)
   * - 'or': Devuelve productos que están en CUALQUIERA de las categorías seleccionadas (unión)
   */
  categoryOperator?: 'and' | 'or';
}
