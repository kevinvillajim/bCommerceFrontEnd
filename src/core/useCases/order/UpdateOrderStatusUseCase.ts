import {OrderService} from "../../services/OrderService";
import {
	isValidOrderStatus,
	type Order,
	type OrderStatus,
} from "../../domain/entities/Order";

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

			// ✅ USAR LA FUNCIÓN HELPER IMPORTADA
			if (!isValidOrderStatus(status)) {
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

	// /**
	//  * Verifica si un estado es válido
	//  * @deprecated Usar isValidOrderStatus del dominio en su lugar
	//  */
	// private isValidStatus(status: string): boolean {
	// 	// ✅ USAR LA FUNCIÓN DEL DOMINIO
	// 	return isValidOrderStatus(status);
	// }
}
