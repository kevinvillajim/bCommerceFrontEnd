import {OrderService} from "../../services/OrderService";
import type {
	OrderListResponse,
} from "../../domain/entities/Order";

/**
 * Caso de uso para obtener las órdenes del vendedor
 */
export class GetSellerOrdersUseCase {
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
		paymentStatus?: string;
		dateFrom?: string;
		dateTo?: string;
		search?: string;
		page?: number;
		limit?: number;
	}): Promise<OrderListResponse> {
		try {
			// Validar filtros si es necesario
			const validatedFilters = this.validateFilters(filters || {});

			// Llamar al servicio para obtener las órdenes
			return await this.orderService.getSellerOrders(validatedFilters);
		} catch (error) {
			console.error("Error en GetSellerOrdersUseCase:", error);

			// Propagar el error para que pueda ser manejado en la capa superior
			throw error;
		}
	}

	/**
	 * Valida los filtros de búsqueda
	 */
	private validateFilters(filters: any): any {
		const validatedFilters: any = {};

		// Validar estado
		if (
			filters.status &&
			[
				"pending",
				"processing",
				"paid",
				"shipped",
				"delivered",
				"completed",
				"cancelled",
			].includes(filters.status)
		) {
			validatedFilters.status = filters.status;
		}

		// Validar estado de pago
		if (
			filters.paymentStatus &&
			["pending", "completed", "failed"].includes(filters.paymentStatus)
		) {
			validatedFilters.paymentStatus = filters.paymentStatus;
		}

		// Validar fechas
		if (filters.dateFrom && this.isValidDate(filters.dateFrom)) {
			validatedFilters.dateFrom = filters.dateFrom;
		}

		if (filters.dateTo && this.isValidDate(filters.dateTo)) {
			validatedFilters.dateTo = filters.dateTo;
		}

		// Validar búsqueda
		if (filters.search && typeof filters.search === "string") {
			validatedFilters.search = filters.search.trim();
		}

		// Validar paginación
		if (
			filters.page &&
			Number.isInteger(Number(filters.page)) &&
			Number(filters.page) > 0
		) {
			validatedFilters.page = Number(filters.page);
		}

		if (
			filters.limit &&
			Number.isInteger(Number(filters.limit)) &&
			Number(filters.limit) > 0
		) {
			validatedFilters.limit = Number(filters.limit);
		}

		return validatedFilters;
	}

	/**
	 * Verifica si una cadena es una fecha válida
	 */
	private isValidDate(dateString: string): boolean {
		const date = new Date(dateString);
		return !isNaN(date.getTime());
	}
}
