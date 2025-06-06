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
			userId: backendData.user_id,
			storeName: backendData.store_name,
			description: backendData.description || undefined,
			status: backendData.status,
			verificationLevel: backendData.verification_level,
			commissionRate: backendData.commission_rate,
			totalSales: backendData.total_sales || 0,
			isFeatured: backendData.is_featured || false,
			averageRating: backendData.average_rating,
			totalRatings: backendData.total_ratings,
			createdAt: backendData.created_at,
			updatedAt: backendData.updated_at,
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
		if (entityData.commissionRate !== undefined)
			result.commission_rate = entityData.commissionRate;
		if (entityData.isFeatured !== undefined)
			result.is_featured = entityData.isFeatured;

		return result;
	}
}

export default SellerAdapter;
