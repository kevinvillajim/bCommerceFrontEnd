import {OrderService} from "../../services/OrderService";
import type {OrderStats} from "../../domain/entities/Order";

/**
 * Caso de uso para obtener estadísticas de órdenes
 */
export class GetOrderStatsUseCase {
	private orderService: OrderService;

	constructor(orderService: OrderService) {
		this.orderService = orderService;
	}

	/**
	 * Ejecuta el caso de uso
	 * @returns Estadísticas de órdenes
	 */
	async execute(): Promise<OrderStats> {
		try {
			// Obtener estadísticas del servicio
			const stats = await this.orderService.getOrderStats();

			// Asegurarse de que todos los campos estén presentes
			return {
				totalOrders: stats.totalOrders || 0,
				pendingOrders: stats.pendingOrders || 0,
				processingOrders: stats.processingOrders || 0,
				shippedOrders: stats.shippedOrders || 0,
				deliveredOrders: stats.deliveredOrders || 0,
				completedOrders: stats.completedOrders || 0,
				cancelledOrders: stats.cancelledOrders || 0,
				totalSales: stats.totalSales || 0,
			};
		} catch (error) {
			console.error("Error en GetOrderStatsUseCase:", error);

			// Devolver valores por defecto en caso de error
			return {
				totalOrders: 0,
				pendingOrders: 0,
				processingOrders: 0,
				shippedOrders: 0,
				deliveredOrders: 0,
				completedOrders: 0,
				cancelledOrders: 0,
				totalSales: 0,
			};
		}
	}
}
