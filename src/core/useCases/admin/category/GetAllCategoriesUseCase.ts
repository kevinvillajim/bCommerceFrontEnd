// src/core/useCases/admin/category/GetAllCategoriesUseCase.ts

import {AdminCategoryService} from "../../../services/AdminCategoryService";
import type {
	CategoryListResponse,
	CategoryFilterParams,
} from "../../../domain/entities/Category";

export class GetAllCategoriesUseCase {
	private adminCategoryService: AdminCategoryService;

	constructor(adminCategoryService: AdminCategoryService) {
		this.adminCategoryService = adminCategoryService;
	}

	async execute(
		filterParams?: CategoryFilterParams
	): Promise<CategoryListResponse | null> {
		console.log(
			"GetAllCategoriesUseCase: Obteniendo todas las categorías como admin"
		);
		try {
			const categories =
				await this.adminCategoryService.getAllCategories(filterParams);
			console.log(
				"GetAllCategoriesUseCase: Categorías obtenidas correctamente:",
				categories
			);
			return categories;
		} catch (error) {
			console.error(
				"GetAllCategoriesUseCase: Error al obtener categorías:",
				error
			);
			throw error;
		}
	}
}
