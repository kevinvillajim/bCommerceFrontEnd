// src/core/useCases/admin/product/GetProductStatsUseCase.ts

import {AdminProductService} from "../../../services/AdminProductService";

export class GetProductStatsUseCase {
	private adminProductService: AdminProductService;

	constructor(adminProductService: AdminProductService) {
		this.adminProductService = adminProductService;
	}

	async execute(): Promise<any> {
		console.log("GetProductStatsUseCase: Obteniendo estadísticas de productos");
		try {
			const stats = await this.adminProductService.getProductStats();
			console.log(
				"GetProductStatsUseCase: Estadísticas obtenidas correctamente:",
				stats
			);
			return stats;
		} catch (error) {
			console.error(
				"GetProductStatsUseCase: Error al obtener estadísticas:",
				error
			);
			throw error;
		}
	}
}
