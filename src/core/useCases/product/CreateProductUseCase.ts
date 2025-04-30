import {ProductService} from "../../services/ProductService";
import type {Product, ProductCreationData} from "../../domain/entities/Product";

export class CreateProductUseCase {
	private productService: ProductService;

	constructor(productService: ProductService) {
		this.productService = productService;
	}

	async execute(data: ProductCreationData): Promise<Product> {
		return this.productService.createProduct(data);
	}
}
