import {ProductService} from "../../services/ProductService";
import type {ProductDetail} from "../../domain/entities/Product";

/**
 * Caso de uso para obtener detalles de un producto por su ID
 */
export class GetProductDetailsUseCase {
	private productService: ProductService;

	constructor(productService: ProductService) {
		this.productService = productService;
	}

	/**
	 * Ejecuta el caso de uso para obtener un producto por su ID
	 * @param id ID del producto
	 * @returns Detalles del producto
	 */
	async execute(id: number): Promise<ProductDetail> {
		console.log(`GetProductDetailsUseCase: Obteniendo producto con ID ${id}`);
		try {
			console.log("ProductService instancia:", this.productService);
			console.log("Llamando a productService.getProductById()");

			const product = await this.productService.getProductById(id);

			// Verificar que el producto no sea null
			if (!product) {
				throw new Error(`Producto con ID ${id} no encontrado`);
			}

			console.log(
				`GetProductDetailsUseCase: Producto obtenido correctamente:`,
				product
			);
			return product;
		} catch (error) {
			console.error(
				`GetProductDetailsUseCase: Error al obtener producto ${id}:`,
				error
			);
			if (error instanceof Error) {
				console.error("Mensaje de error:", error.message);
				console.error("Stack trace:", error.stack);
			}
			throw error;
		}
	}

}
