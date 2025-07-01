// src/core/useCases/admin/category/UpdateAnyCategoryUseCase.ts

import {AdminCategoryService} from "../../../services/AdminCategoryService";
import type {
    Category,
    CategoryUpdateData,
} from "../../../domain/entities/Category";

export class UpdateAnyCategoryUseCase {
    private adminCategoryService: AdminCategoryService;

    constructor(adminCategoryService: AdminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    async execute(data: CategoryUpdateData): Promise<Category | null> {
        console.log(
            `UpdateAnyCategoryUseCase: Actualizando categoría ${data.id} como admin:`,
            data
        );
        try {
            const category = await this.adminCategoryService.updateCategory(data);
            console.log(
                "UpdateAnyCategoryUseCase: Categoría actualizada correctamente:",
                category
            );
            return category;
        } catch (error) {
            console.error(
                "UpdateAnyCategoryUseCase: Error al actualizar categoría:",
                error
            );
            throw error;
        }
    }
}