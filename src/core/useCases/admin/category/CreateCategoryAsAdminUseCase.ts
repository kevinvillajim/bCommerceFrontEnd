// src/core/useCases/admin/category/CreateCategoryAsAdminUseCase.ts

import {AdminCategoryService} from "../../../services/AdminCategoryService";
import type {
	Category,
	CategoryCreationData,
} from "../../../domain/entities/Category";

export class CreateCategoryAsAdminUseCase {
	private adminCategoryService: AdminCategoryService;

	constructor(adminCategoryService: AdminCategoryService) {
		this.adminCategoryService = adminCategoryService;
	}

	async execute(data: CategoryCreationData): Promise<Category | null> {
		console.log(
			"CreateCategoryAsAdminUseCase: Creando categoría como admin:",
			data
		);
		try {
			const category = await this.adminCategoryService.createCategory(data);
			console.log(
				"CreateCategoryAsAdminUseCase: Categoría creada correctamente:",
				category
			);
			return category;
		} catch (error) {
			console.error(
				"CreateCategoryAsAdminUseCase: Error al crear categoría:",
				error
			);
			throw error;
		}
	}
}
