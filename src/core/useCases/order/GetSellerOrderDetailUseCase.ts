import {SellerOrderService} from "../../services/SellerOrderService";
import type {OrderDetail} from "../../domain/entities/Order";

/**
 * Caso de uso para obtener el detalle de una orden como vendedor
 * SIMPLIFICADO: Pasa directamente los datos del servicio sin modificaciones
 */
export class GetSellerOrderDetailUseCase {
	private sellerOrderService: SellerOrderService;

	constructor(sellerOrderService: SellerOrderService) {
		this.sellerOrderService = sellerOrderService;
	}

	/**
	 * Ejecuta el caso de uso
	 * @param orderId ID de la orden a obtener
	 * @returns Detalle completo de la orden tal como viene del backend
	 */
	async execute(orderId: number): Promise<OrderDetail> {
		try {
			if (!orderId || orderId <= 0) {
				throw new Error("ID de orden inválido");
			}

			// SIMPLIFICADO: Devolver directamente los datos del servicio
			// Sin transformaciones adicionales que puedan causar problemas
			const orderDetail = await this.sellerOrderService.getSellerOrderDetails(orderId);
			
			console.log(
				`GetSellerOrderDetailUseCase: Datos obtenidos para orden ${orderId}:`,
				orderDetail
			);

			return orderDetail;
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