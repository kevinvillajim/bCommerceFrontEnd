// src/core/useCases/admin/product/CreateProductAsAdminUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";
import type {
    Product,
    ProductCreationData,
} from "../../../domain/entities/Product";

export class CreateProductAsAdminUseCase {
    private adminProductService: AdminProductService;

    constructor(adminProductService: AdminProductService) {
        this.adminProductService = adminProductService;
    }

    async execute(
        data: ProductCreationData,
        sellerId?: number
    ): Promise<Product | null> {
        console.log(
            "CreateProductAsAdminUseCase: Creando producto como admin:",
            data
        );
        try {
            const product = await this.adminProductService.createProduct(
                data,
                sellerId
            );
            console.log(
                "CreateProductAsAdminUseCase: Producto creado correctamente:",
                product
            );
            return product;
        } catch (error) {
            console.error(
                "CreateProductAsAdminUseCase: Error al crear producto:",
                error
            );
            throw error;
        }
    }
}