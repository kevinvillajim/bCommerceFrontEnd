import {OrderService} from "../../services/OrderService";
import type {Order, OrderStatus} from "../../domain/entities/Order";

/**
 * Caso de uso para actualizar el estado de una orden
 */
export class UpdateOrderStatusUseCase {
	private orderService: OrderService;

	constructor(orderService: OrderService) {
		this.orderService = orderService;
	}

	/**
	 * Ejecuta el caso de uso
	 * @param orderId ID de la orden a actualizar
	 * @param status Nuevo estado de la orden
	 * @returns Orden actualizada o null si falla
	 */
	async execute(orderId: number, status: OrderStatus): Promise<Order | null> {
		try {
			if (!orderId || orderId <= 0) {
				throw new Error("ID de orden inválido");
			}

			// Validar el estado
			if (!this.isValidStatus(status)) {
				throw new Error(`Estado de orden '${status}' no válido`);
			}

			// Actualizar el estado de la orden
			return await this.orderService.updateOrderStatus(orderId, {status});
		} catch (error) {
			console.error(
				`Error en UpdateOrderStatusUseCase para orden ${orderId}:`,
				error
			);

			// Propagar el error para que pueda ser manejado en la capa superior
			throw error;
		}
	}

	/**
	 * Verifica si un estado es válido
	 */
	private isValidStatus(status: string): boolean {
		const validStatuses: OrderStatus[] = [
			"pending",
			"processing",
			"paid",
			"shipped",
			"delivered",
			"completed",
			"cancelled",
		];

		return validStatuses.includes(status as OrderStatus);
	}
}
