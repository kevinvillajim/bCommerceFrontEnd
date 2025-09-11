import {ProductService} from "../../services/ProductService";
import type {
	ProductFilterParams,
	ProductListResponse,
} from "../../domain/entities/Product";
import type {ExtendedProductFilterParams} from "../../../presentation/types/ProductFilterParams";

export class SearchProductsUseCase {
	private productService: ProductService;

	constructor(productService: ProductService) {
		this.productService = productService;
	}

	async execute(
		filterParams: ProductFilterParams
	): Promise<ProductListResponse> {
		// CORREGIDO: Asegurar que el resultado no sea null
		const result = await this.productService.getProducts(
			filterParams as ExtendedProductFilterParams
		);

		if (!result) {
			// Retornar una respuesta vacía en lugar de null
			return {
				data: [],
				meta: {
					total: 0,
					count: 0,
					limit: filterParams.limit || 10,
					offset: filterParams.offset || 0,
					page: filterParams.page || 1,
					pages: 1,
				},
			};
		}

		return result;
	}
}
