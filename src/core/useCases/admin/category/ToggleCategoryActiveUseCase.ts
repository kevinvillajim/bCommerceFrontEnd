// src/core/useCases/admin/category/ToggleCategoryActiveUseCase.ts

import {AdminCategoryService} from "../../../services/AdminCategoryService";

export class ToggleCategoryActiveUseCase {
    private adminCategoryService: AdminCategoryService;

    constructor(adminCategoryService: AdminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    async execute(id: number, is_active: boolean): Promise<boolean> {
        console.log(
            `ToggleCategoryActiveUseCase: Cambiando estado activo de categoría ${id} a ${is_active}`
        );
        try {
            const result = await this.adminCategoryService.toggleActive(
                id,
                is_active
            );
            console.log(
                "ToggleCategoryActiveUseCase: Estado activo actualizado correctamente:",
                result
            );
            return result;
        } catch (error) {
            console.error(
                "ToggleCategoryActiveUseCase: Error al cambiar estado activo:",
                error
            );
            throw error;
        }
    }
}