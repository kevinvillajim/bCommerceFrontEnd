import type {Seller} from "../../core/domain/entities/Seller";

/**
 * Adaptador para convertir entre formatos de datos del backend y frontend para vendedores
 */
export class SellerAdapter {
	/**
	 * Convierte datos del backend (snake_case) a formato de entidad Seller (camelCase)
	 */
	static toEntity(backendData: any): Seller {
		return {
			id: backendData.id,
			user_id: backendData.user_id,
			userId: backendData.user_id,
			storeName: backendData.store_name,
			description: backendData.description,
			status: backendData.status,
			verificationLevel: backendData.verification_level || "none",
			// commissionRate: backendData.commission_rate || 0, // TODO: Implementar comisiones individuales en el futuro - usar configuración global del admin
			// HARDCODEAR: No mapear commissionRate - propiedad comentada para forzar uso de configuración global
			totalSales: backendData.total_sales || 0,
			isFeatured: backendData.is_featured || false,
			averageRating: backendData.average_rating,
			totalRatings: backendData.total_ratings || 0,
			createdAt: backendData.created_at,
			updatedAt: backendData.updated_at,
			// Campos adicionales del API actual
			userName: backendData.user_name,
			email: backendData.email,
			displayName: backendData.display_name,
		};
	}

	/**
	 * Convierte múltiples vendedores desde el formato del backend
	 */
	static toEntityList(backendDataList: any[]): Seller[] {
		if (!Array.isArray(backendDataList)) {
			return [];
		}
		return backendDataList.map((data) => this.toEntity(data));
	}

	/**
	 * Convierte datos de entidad Seller (camelCase) a formato de API del backend (snake_case)
	 */
	static toBackend(entityData: Partial<Seller>): any {
		const result: any = {};

		if (entityData.userId !== undefined) result.user_id = entityData.userId;
		if (entityData.storeName !== undefined)
			result.store_name = entityData.storeName;
		if (entityData.description !== undefined)
			result.description = entityData.description;
		if (entityData.status !== undefined) result.status = entityData.status;
		if (entityData.verificationLevel !== undefined)
			result.verification_level = entityData.verificationLevel;
		// if (entityData.commissionRate !== undefined) // TODO: Implementar comisiones individuales en el futuro - usar configuración global del admin
		//	result.commission_rate = entityData.commissionRate;
		// HARDCODEAR: Nunca mapear commission_rate - siempre usar configuración global
		if (entityData.isFeatured !== undefined)
			result.is_featured = entityData.isFeatured;

		return result;
	}
}

export default SellerAdapter;
