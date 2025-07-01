// src/core/useCases/admin/category/GetCategoryByIdUseCase.ts

import {AdminCategoryService} from "../../../services/AdminCategoryService";
import type {Category} from "../../../domain/entities/Category";

export class GetCategoryByIdUseCase {
	private adminCategoryService: AdminCategoryService;

	constructor(adminCategoryService: AdminCategoryService) {
		this.adminCategoryService = adminCategoryService;
	}

	async execute(id: number): Promise<Category | null> {
		console.log(
			`GetCategoryByIdUseCase: Obteniendo categoría ${id} como admin`
		);
		try {
			const category = await this.adminCategoryService.getCategoryById(id);
			console.log(
				"GetCategoryByIdUseCase: Categoría obtenida correctamente:",
				category
			);
			return category;
		} catch (error) {
			console.error(
				"GetCategoryByIdUseCase: Error al obtener categoría:",
				error
			);
			throw error;
		}
	}
}
