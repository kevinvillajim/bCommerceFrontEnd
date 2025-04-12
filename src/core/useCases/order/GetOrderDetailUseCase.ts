import {OrderService} from "../../services/OrderService";
import type {OrderDetail} from "../../domain/entities/Order";

/**
 * Caso de uso para obtener el detalle de una orden
 */
export class GetOrderDetailUseCase {
	private orderService: OrderService;

	constructor(orderService: OrderService) {
		this.orderService = orderService;
	}

	/**
	 * Ejecuta el caso de uso
	 * @param orderId ID de la orden a obtener
	 * @returns Detalle completo de la orden
	 */
	async execute(orderId: number): Promise<OrderDetail> {
		try {
			if (!orderId || orderId <= 0) {
				throw new Error("ID de orden inválido");
			}

			return await this.orderService.getOrderDetails(orderId);
		} catch (error) {
			console.error(
				`Error en GetOrderDetailUseCase para orden ${orderId}:`,
				error
			);

			// Propagar el error para que pueda ser manejado en la capa superior
			throw error;
		}
	}
}
