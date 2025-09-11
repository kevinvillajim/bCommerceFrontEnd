// src/core/useCases/admin/product/GetProductsBySellerUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";
import type {ProductListResponse} from "../../../domain/entities/Product";
import type {ExtendedProductFilterParams} from "../../../../presentation/types/ProductFilterParams";

export class GetProductsBySellerUseCase {
	private adminProductService: AdminProductService;

	constructor(adminProductService: AdminProductService) {
		this.adminProductService = adminProductService;
	}

	async execute(
		sellerId: number,
		filterParams?: ExtendedProductFilterParams
	): Promise<ProductListResponse | null> {
		console.log(
			`GetProductsBySellerUseCase: Obteniendo productos del vendedor ${sellerId}`
		);
		try {
			const products = await this.adminProductService.getProductsBySeller(
				sellerId,
				filterParams
			);
			console.log(
				"GetProductsBySellerUseCase: Productos obtenidos correctamente:",
				products
			);
			return products;
		} catch (error) {
			console.error(
				"GetProductsBySellerUseCase: Error al obtener productos del vendedor:",
				error
			);
			throw error;
		}
	}
}
