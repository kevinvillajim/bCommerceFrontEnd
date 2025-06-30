// src/core/useCases/admin/product/ToggleProductFeaturedUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";

export class ToggleProductFeaturedUseCase {
    private adminProductService: AdminProductService;

    constructor(adminProductService: AdminProductService) {
        this.adminProductService = adminProductService;
    }

    async execute(id: number, featured: boolean): Promise<boolean> {
        console.log(
            `ToggleProductFeaturedUseCase: Cambiando featured del producto ${id} a ${featured}`
        );
        try {
            const result = await this.adminProductService.toggleFeatured(
                id,
                featured
            );
            console.log(
                "ToggleProductFeaturedUseCase: Featured actualizado correctamente:",
                result
            );
            return result;
        } catch (error) {
            console.error(
                "ToggleProductFeaturedUseCase: Error al cambiar featured:",
                error
            );
            throw error;
        }
    }
}