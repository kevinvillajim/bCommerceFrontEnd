// src/core/useCases/admin/product/GetAllProductsUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";
import type {ProductListResponse} from "../../../domain/entities/Product";
import type {ExtendedProductFilterParams} from "../../../../presentation/types/ProductFilterParams";

export class GetAllProductsUseCase {
	private adminProductService: AdminProductService;

	constructor(adminProductService: AdminProductService) {
		this.adminProductService = adminProductService;
	}

	async execute(
		filterParams?: ExtendedProductFilterParams
	): Promise<ProductListResponse | null> {
		console.log(
			"GetAllProductsUseCase: Obteniendo todos los productos como admin"
		);
		try {
			const products =
				await this.adminProductService.getAllProducts(filterParams);
			console.log(
				"GetAllProductsUseCase: Productos obtenidos correctamente:",
				products
			);
			return products;
		} catch (error) {
			console.error(
				"GetAllProductsUseCase: Error al obtener productos:",
				error
			);
			throw error;
		}
	}
}
