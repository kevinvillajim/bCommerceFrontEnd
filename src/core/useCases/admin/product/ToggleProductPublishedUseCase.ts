// src/core/useCases/admin/product/ToggleProductPublishedUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";

export class ToggleProductPublishedUseCase {
    private adminProductService: AdminProductService;

    constructor(adminProductService: AdminProductService) {
        this.adminProductService = adminProductService;
    }

    async execute(id: number, published: boolean): Promise<boolean> {
        console.log(
            `ToggleProductPublishedUseCase: Cambiando published del producto ${id} a ${published}`
        );
        try {
            const result = await this.adminProductService.togglePublished(
                id,
                published
            );
            console.log(
                "ToggleProductPublishedUseCase: Published actualizado correctamente:",
                result
            );
            return result;
        } catch (error) {
            console.error(
                "ToggleProductPublishedUseCase: Error al cambiar published:",
                error
            );
            throw error;
        }
    }
}