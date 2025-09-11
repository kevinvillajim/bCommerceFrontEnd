// src/core/services/VolumeDiscountService.ts - SIMPLIFICADO Y CORREGIDO

import ApiClient from "../../infrastructure/api/apiClient";
import type {
	VolumeDiscountInfoResponse,
	AdminVolumeDiscountConfig,
	ProductVolumeDiscountsAdmin,
	VolumeDiscountStats
} from "../domain/entities/ShoppingCart";

/**
 * Servicio para gestionar descuentos por volumen
 * ✅ SIMPLIFICADO: El backend es la fuente de verdad para cálculos
 */
export class VolumeDiscountService {
	/**
	 * ✅ SIMPLIFICADO: Solo obtener información de descuentos, sin calcular precios
	 */
	async getProductVolumeDiscountInfo(
		productId: number,
		quantity: number = 1
	): Promise<VolumeDiscountInfoResponse | null> {
		try {
			console.log(`🔍 VolumeDiscountService: Obteniendo info de descuentos para producto ${productId}, cantidad ${quantity}`);

			const response = await ApiClient.get<VolumeDiscountInfoResponse>(
				`/volume-discounts/product/${productId}`,
				{ quantity }
			);

			console.log("✅ VolumeDiscountService: Info de descuentos obtenida:", response);
			return response;
		} catch (error) {
			console.error("❌ Error en VolumeDiscountService.getProductVolumeDiscountInfo:", error);
			return null;
		}
	}

	/**
	 * ✅ OBSOLETO: Ya no calculamos precios en frontend, el backend los proporciona
	 * @deprecated Usar precios que vienen del backend con descuentos ya aplicados
	 */
	async calculateVolumePrice(
		basePrice: number	): Promise<{
		original_price: number;
		discounted_price: number;
		discount_percentage: number;
		savings: number;
		discount_label: string | null;
	}> {
		console.warn("⚠️ VolumeDiscountService.calculateVolumePrice está obsoleto. Usar precios del backend.");
		
		// Fallback simple sin API call
		return {
			original_price: basePrice,
			discounted_price: basePrice,
			discount_percentage: 0,
			savings: 0,
			discount_label: null
		};
	}

	/**
	 * ✅ NUEVO: Solicitar al backend que recalcule precios del carrito
	 */
	async requestCartPricingUpdate(): Promise<any> {
		try {
			console.log("🔄 VolumeDiscountService: Solicitando actualización de precios del carrito");

			const response = await ApiClient.post<any>(
				"/cart/update-pricing"
			);

			console.log("✅ VolumeDiscountService: Precios del carrito actualizados");
			return response;
		} catch (error) {
			console.error("❌ Error actualizando precios del carrito:", error);
			return null;
		}
	}

	/**
	 * Obtener el próximo nivel de descuento disponible
	 */
	async getNextDiscountTier(
		productId: number,
		currentQuantity: number
	): Promise<{
		quantity: number;
		discount: number;
		items_needed: number;
		potential_savings: number;
	} | null> {
		try {
			const discountInfo = await this.getProductVolumeDiscountInfo(productId, currentQuantity);
			
			if (!discountInfo?.data.enabled || !discountInfo.data.tiers.length) {
				return null;
			}

			// Buscar el próximo tier disponible
			const nextTier = discountInfo.data.tiers.find(
				tier => tier.quantity > currentQuantity
			);

			if (!nextTier) {
				return null; // Ya tiene el máximo descuento
			}

			const itemsNeeded = nextTier.quantity - currentQuantity;
			const currentPrice = discountInfo.data.product?.final_price || 0;
			const potentialSavings = (currentPrice * nextTier.discount / 100) * nextTier.quantity;

			return {
				quantity: nextTier.quantity,
				discount: nextTier.discount,
				items_needed: itemsNeeded,
				potential_savings: potentialSavings
			};
		} catch (error) {
			console.error("❌ Error obteniendo próximo tier de descuento:", error);
			return null;
		}
	}

	// ===== MÉTODOS DE ADMINISTRACIÓN =====

	/**
	 * Obtener configuración general de descuentos por volumen (ADMIN)
	 */
	async getAdminConfiguration(): Promise<AdminVolumeDiscountConfig | null> {
		try {
			const response = await ApiClient.get<{
				status: string;
				data: AdminVolumeDiscountConfig;
			}>("/admin/volume-discounts/configuration");

			return response?.data || null;
		} catch (error) {
			console.error("❌ Error obteniendo configuración de admin:", error);
			return null;
		}
	}

	/**
	 * Actualizar configuración general de descuentos por volumen (ADMIN)
	 */
	async updateAdminConfiguration(config: AdminVolumeDiscountConfig): Promise<boolean> {
		try {
			const response = await ApiClient.post<{ status: string; message: string }>(
				"/admin/volume-discounts/configuration",
				config
			);

			return response?.status === "success";
		} catch (error) {
			console.error("❌ Error actualizando configuración de admin:", error);
			return false;
		}
	}

	/**
	 * Obtener descuentos por volumen de un producto específico (ADMIN)
	 */
	async getProductDiscounts(productId: number): Promise<ProductVolumeDiscountsAdmin | null> {
		try {
			const response = await ApiClient.get<{
				status: string;
				data: ProductVolumeDiscountsAdmin;
			}>(`/admin/volume-discounts/product/${productId}`);

			return response?.data || null;
		} catch (error) {
			console.error("❌ Error obteniendo descuentos de producto:", error);
			return null;
		}
	}

	/**
	 * Actualizar descuentos por volumen de un producto (ADMIN)
	 */
	async updateProductDiscounts(
		productId: number,
		discounts: Array<{
			min_quantity: number;
			discount_percentage: number;
			label: string;
			active: boolean;
		}>
	): Promise<boolean> {
		try {
			const response = await ApiClient.post<{ status: string; message: string }>(
				`/admin/volume-discounts/product/${productId}`,
				{ discounts }
			);

			return response?.status === "success";
		} catch (error) {
			console.error("❌ Error actualizando descuentos de producto:", error);
			return false;
		}
	}

	/**
	 * Aplicar descuentos por defecto a un producto (ADMIN)
	 */
	async applyDefaultDiscounts(productId: number): Promise<boolean> {
		try {
			const response = await ApiClient.post<{ status: string; message: string }>(
				`/admin/volume-discounts/product/${productId}/apply-defaults`
			);

			return response?.status === "success";
		} catch (error) {
			console.error("❌ Error aplicando descuentos por defecto:", error);
			return false;
		}
	}

	/**
	 * Eliminar todos los descuentos de un producto (ADMIN)
	 */
	async removeProductDiscounts(productId: number): Promise<boolean> {
		try {
			const response = await ApiClient.delete<{ status: string; message: string }>(
				`/admin/volume-discounts/product/${productId}`
			);

			return response?.status === "success";
		} catch (error) {
			console.error("❌ Error eliminando descuentos de producto:", error);
			return false;
		}
	}

	/**
	 * Aplicar descuentos por defecto a múltiples productos (ADMIN)
	 */
	async bulkApplyDefaults(
		productIds: number[],
		overwriteExisting: boolean = false
	): Promise<{
		success: boolean;
		processed: number;
		skipped: number;
		total: number;
	}> {
		try {
			const response = await ApiClient.post<{
				status: string;
				message: string;
				data: {
					processed: number;
					skipped: number;
					total: number;
				};
			}>("/admin/volume-discounts/bulk/apply-defaults", {
				product_ids: productIds,
				overwrite_existing: overwriteExisting
			});

			if (response?.status === "success") {
				return {
					success: true,
					processed: response.data.processed,
					skipped: response.data.skipped,
					total: response.data.total
				};
			}

			return {
				success: false,
				processed: 0,
				skipped: 0,
				total: productIds.length
			};
		} catch (error) {
			console.error("❌ Error en aplicación masiva de descuentos:", error);
			return {
				success: false,
				processed: 0,
				skipped: 0,
				total: productIds.length
			};
		}
	}

	/**
	 * Obtener estadísticas de descuentos por volumen (ADMIN)
	 */
	async getStats(): Promise<VolumeDiscountStats | null> {
		try {
			const response = await ApiClient.get<{
				status: string;
				data: VolumeDiscountStats;
			}>("/admin/volume-discounts/stats");

			return response?.data || null;
		} catch (error) {
			console.error("❌ Error obteniendo estadísticas:", error);
			return null;
		}
	}

	// ===== MÉTODOS DE UTILIDAD =====

	/**
	 * Verificar si un producto tiene descuentos por volumen
	 */
	async hasVolumeDiscounts(productId: number): Promise<boolean> {
		try {
			const info = await this.getProductVolumeDiscountInfo(productId);
			return Boolean(info?.data?.enabled && info.data.tiers?.length > 0);
		} catch (error) {
			return false;
		}
	}

	/**
	 * Obtener mensaje de ahorro potencial
	 */
	async getSavingsMessage(
		productId: number,
		currentQuantity: number,
		basePrice: number
	): Promise<string | null> {
		try {
			const nextTier = await this.getNextDiscountTier(productId, currentQuantity);
			
			if (!nextTier) {
				return null;
			}

			const additionalSavings = basePrice * (nextTier.discount / 100) * nextTier.items_needed;
			
			return `¡Añade ${nextTier.items_needed} más y ahorra $${additionalSavings.toFixed(2)} adicionales!`;
		} catch (error) {
			return null;
		}
	}

	/**
	 * ✅ SIMPLIFICADO: Calcular ahorros totales usando datos del backend
	 */
	calculateTotalSavings(
		items: Array<{
			productId: number;
			quantity: number;
			originalPrice: number;
			discountedPrice: number;
		}>
	): number {
		return items.reduce((total, item) => {
			const itemSavings = (item.originalPrice - item.discountedPrice) * item.quantity;
			return total + itemSavings;
		}, 0);
	}

	/**
	 * Generar mensaje promocional para descuentos por volumen
	 */
	generatePromotionalMessage(tiers: Array<{ quantity: number; discount: number; label: string }>): string {
		if (!tiers.length) return "";
		
		const tierMessages = tiers.map(tier => 
			`${tier.quantity}+ unidades = ${tier.discount}% OFF`
		).join(", ");
		
		return `¡Descuentos por volumen disponibles! ${tierMessages}`;
	}

	/**
	 * ✅ NUEVO: Obtener precios calculados del backend para múltiples productos
	 */
	async getCalculatedPricing(
		items: Array<{
			product_id: number;
			quantity: number;
			base_price: number;
		}>
	): Promise<any> {
		try {
			console.log("💰 VolumeDiscountService: Obteniendo precios calculados del backend");

			const response = await ApiClient.post<any>(
				"/volume-discounts/calculate-pricing",
				{ items }
			);

			console.log("✅ VolumeDiscountService: Precios calculados obtenidos");
			return response;
		} catch (error) {
			console.error("❌ Error obteniendo precios calculados:", error);
			return null;
		}
	}
}

export default VolumeDiscountService;