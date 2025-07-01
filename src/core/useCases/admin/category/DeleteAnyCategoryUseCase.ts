// src/core/useCases/admin/category/DeleteAnyCategoryUseCase.ts

import {AdminCategoryService} from "../../../services/AdminCategoryService";

export class DeleteAnyCategoryUseCase {
    private adminCategoryService: AdminCategoryService;

    constructor(adminCategoryService: AdminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    async execute(id: number): Promise<boolean> {
        console.log(
            `DeleteAnyCategoryUseCase: Eliminando categoría ${id} como admin`
        );
        try {
            const result = await this.adminCategoryService.deleteCategory(id);
            console.log(
                "DeleteAnyCategoryUseCase: Categoría eliminada correctamente:",
                result
            );
            return result;
        } catch (error) {
            console.error(
                "DeleteAnyCategoryUseCase: Error al eliminar categoría:",
                error
            );
            throw error;
        }
    }
}