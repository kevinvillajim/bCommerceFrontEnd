// src/core/useCases/admin/product/UpdateProductStatusUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";

export class UpdateProductStatusUseCase {
    private adminProductService: AdminProductService;

    constructor(adminProductService: AdminProductService) {
        this.adminProductService = adminProductService;
    }

    async execute(id: number, status: string): Promise<boolean> {
        console.log(
            `UpdateProductStatusUseCase: Cambiando status del producto ${id} a ${status}`
        );
        try {
            const result = await this.adminProductService.updateStatus(id, status);
            console.log(
                "UpdateProductStatusUseCase: Status actualizado correctamente:",
                result
            );
            return result;
        } catch (error) {
            console.error(
                "UpdateProductStatusUseCase: Error al cambiar status:",
                error
            );
            throw error;
        }
    }
}