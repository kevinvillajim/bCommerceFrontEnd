import {OrderService} from "../../services/OrderService";
import type {OrderListResponse} from "../../domain/entities/Order";

/**
 * Caso de uso para obtener las órdenes del cliente
 */
export class GetUserOrdersUseCase {
	private orderService: OrderService;

	constructor(orderService: OrderService) {
		this.orderService = orderService;
	}

	/**
	 * Ejecuta el caso de uso
	 * @param filters Filtros para la búsqueda de órdenes
	 * @returns Lista de órdenes y metadatos de paginación
	 */
	async execute(filters?: {
		status?: string;
		page?: number;
		limit?: number;
	}): Promise<OrderListResponse> {
		try {
			return await this.orderService.getUserOrders(filters);
		} catch (error) {
			console.error("Error en GetUserOrdersUseCase:", error);
			throw error;
		}
	}
}
