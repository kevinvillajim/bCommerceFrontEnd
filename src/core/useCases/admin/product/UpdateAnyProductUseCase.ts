// src/core/useCases/admin/product/UpdateAnyProductUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";
import type {
    Product,
    ProductUpdateData,
} from "../../../domain/entities/Product";

export class UpdateAnyProductUseCase {
    private adminProductService: AdminProductService;

    constructor(adminProductService: AdminProductService) {
        this.adminProductService = adminProductService;
    }

    async execute(data: ProductUpdateData): Promise<Product | null> {
        console.log(
            `UpdateAnyProductUseCase: Actualizando producto ${data.id} como admin:`,
            data
        );
        try {
            const product = await this.adminProductService.updateProduct(data);
            console.log(
                "UpdateAnyProductUseCase: Producto actualizado correctamente:",
                product
            );
            return product;
        } catch (error) {
            console.error(
                "UpdateAnyProductUseCase: Error al actualizar producto:",
                error
            );
            throw error;
        }
    }
}