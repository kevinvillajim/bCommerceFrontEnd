// src/core/useCases/admin/category/ToggleCategoryFeaturedUseCase.ts

import {AdminCategoryService} from "../../../services/AdminCategoryService";

export class ToggleCategoryFeaturedUseCase {
    private adminCategoryService: AdminCategoryService;

    constructor(adminCategoryService: AdminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    async execute(id: number, featured: boolean): Promise<boolean> {
        console.log(
            `ToggleCategoryFeaturedUseCase: Cambiando estado destacado de categoría ${id} a ${featured}`
        );
        try {
            const result = await this.adminCategoryService.toggleFeatured(
                id,
                featured
            );
            console.log(
                "ToggleCategoryFeaturedUseCase: Estado destacado actualizado correctamente:",
                result
            );
            return result;
        } catch (error) {
            console.error(
                "ToggleCategoryFeaturedUseCase: Error al cambiar estado destacado:",
                error
            );
            throw error;
        }
    }
}