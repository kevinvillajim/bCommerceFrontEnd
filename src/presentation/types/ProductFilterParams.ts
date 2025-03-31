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
}
