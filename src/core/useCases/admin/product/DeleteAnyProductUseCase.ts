// src/core/useCases/admin/product/DeleteAnyProductUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";

export class DeleteAnyProductUseCase {
    private adminProductService: AdminProductService;

    constructor(adminProductService: AdminProductService) {
        this.adminProductService = adminProductService;
    }

    async execute(id: number): Promise<boolean> {
        console.log(
            `DeleteAnyProductUseCase: Eliminando producto ${id} como admin`
        );
        try {
            const result = await this.adminProductService.deleteProduct(id);
            console.log(
                "DeleteAnyProductUseCase: Producto eliminado correctamente:",
                result
            );
            return result;
        } catch (error) {
            console.error(
                "DeleteAnyProductUseCase: Error al eliminar producto:",
                error
            );
            throw error;
        }
    }
}