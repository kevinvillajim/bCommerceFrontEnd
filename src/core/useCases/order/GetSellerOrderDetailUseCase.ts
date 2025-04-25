import {SellerOrderService} from "../../services/SellerOrderService";
import type {OrderDetail} from "../../domain/entities/Order";

/**
 * Caso de uso para obtener el detalle de una orden como vendedor
 * Separado del caso de uso general para el cliente
 */
export class GetSellerOrderDetailUseCase {
	private sellerOrderService: SellerOrderService;

	constructor(sellerOrderService: SellerOrderService) {
		this.sellerOrderService = sellerOrderService;
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

			// Importante: Aquí usamos el método específico para vendedores
			return await this.sellerOrderService.getSellerOrderDetails(orderId);
		} catch (error) {
			console.error(
				`Error en GetSellerOrderDetailUseCase para orden ${orderId}:`,
				error
			);

			// Propagar el error para que pueda ser manejado en la capa superior
			throw error;
		}
	}
}

export default GetSellerOrderDetailUseCase;
