import { ProductService } from '../../services/ProductService';
import type { ProductFilterParams, ProductListResponse } from '../../domain/entities/Product';

export class SearchProductsUseCase {
  private productService: ProductService;
  
  constructor(productService: ProductService) {
    this.productService = productService;
  }
  
  async execute(filterParams: ProductFilterParams): Promise<ProductListResponse> {
    // Aquí puedes añadir lógica adicional antes de llamar al servicio
    // Por ejemplo, validación, transformación de datos, etc.
    return this.productService.getProducts(filterParams);
  }
}