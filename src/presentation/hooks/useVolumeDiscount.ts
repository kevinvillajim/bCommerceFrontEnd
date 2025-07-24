// src/presentation/hooks/useVolumeDiscounts.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { VolumeDiscountService } from "../../core/services/VolumeDiscountService";
import type {
	VolumeDiscountInfoResponse,
	UseVolumeDiscountsResult,
	CartVolumeDiscountSummary
} from "../../core/domain/entities/ShoppingCart";
import type { Product } from "../../core/domain/entities/Product";
import CacheService from "../../infrastructure/services/CacheService";

// Instancia del servicio
const volumeDiscountService = new VolumeDiscountService();

// Tiempos de cache
const CACHE_TIMES = {
	VOLUME_DISCOUNT_INFO: 5 * 60 * 1000, // 5 minutos
	VOLUME_DISCOUNT_CONFIG: 10 * 60 * 1000, // 10 minutos
};

/**
 * Hook para manejar descuentos por volumen
 */
export const useVolumeDiscounts = (
	productId?: number,
	initialQuantity: number = 1
): UseVolumeDiscountsResult => {
	const [volumeDiscountsEnabled, setVolumeDiscountsEnabled] = useState<boolean>(true);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [discountInfo, setDiscountInfo] = useState<VolumeDiscountInfoResponse['data'] | null>(null);
	const [cartSummary, setCartSummary] = useState<CartVolumeDiscountSummary | null>(null);

	/**
	 * Obtener información de descuentos por volumen para un producto
	 */
	const getVolumeDiscountInfo = useCallback(async (
		productIdParam: number,
		quantity: number = 1
	): Promise<void> => {
		const targetProductId = productIdParam || productId;
		
		if (!targetProductId) {
			console.warn("⚠️ useVolumeDiscounts: No se proporcionó productId");
			return;
		}

		try {
			setLoading(true);
			setError(null);

			// Verificar cache primero
			const cacheKey = `volume_discount_${targetProductId}_${quantity}`;
			const cachedInfo = CacheService.getItem(cacheKey);

			if (cachedInfo) {
				console.log("💾 useVolumeDiscounts: Usando información en cache");
				setDiscountInfo(cachedInfo);
				setVolumeDiscountsEnabled(cachedInfo.enabled);
				setLoading(false);
				return;
			}

			console.log(`🔍 useVolumeDiscounts: Obteniendo info para producto ${targetProductId}, cantidad ${quantity}`);

			const response = await volumeDiscountService.getProductVolumeDiscountInfo(
				targetProductId,
				quantity
			);

			if (response?.data) {
				// Guardar en cache
				CacheService.setItem(cacheKey, response.data, CACHE_TIMES.VOLUME_DISCOUNT_INFO);
				
				setDiscountInfo(response.data);
				setVolumeDiscountsEnabled(response.data.enabled);
				
				console.log("✅ useVolumeDiscounts: Info obtenida:", response.data);
			} else {
				setDiscountInfo(null);
				setVolumeDiscountsEnabled(false);
			}
		} catch (err) {
			console.error("❌ Error en useVolumeDiscounts.getVolumeDiscountInfo:", err);
			setError(err instanceof Error ? err.message : "Error al obtener descuentos por volumen");
			setVolumeDiscountsEnabled(false);
		} finally {
			setLoading(false);
		}
	}, [productId]);

	/**
	 * Calcular ahorros potenciales para una nueva cantidad
	 */
	const calculatePotentialSavings = useCallback(async (
		productIdParam: number,
		newQuantity: number
	): Promise<number> => {
		const targetProductId = productIdParam || productId;
		
		if (!targetProductId) {
			return 0;
		}

		try {
			const response = await volumeDiscountService.getProductVolumeDiscountInfo(
				targetProductId,
				newQuantity
			);

			if (!response?.data.enabled || !response.data.tiers.length) {
				return 0;
			}

			// Encontrar el tier aplicable
			const applicableTier = response.data.tiers
				.filter(tier => newQuantity >= tier.quantity)
				.pop();

			if (!applicableTier) {
				return 0;
			}

			const basePrice = response.data.product?.final_price || response.data.product?.base_price || 0;
			const savingsPerUnit = basePrice * (applicableTier.discount / 100);
			
			return savingsPerUnit * newQuantity;
		} catch (error) {
			console.error("❌ Error calculando ahorros potenciales:", error);
			return 0;
		}
	}, [productId]);

	/**
	 * Obtener el próximo nivel de descuento disponible
	 */
	const getNextDiscountTier = useCallback(async (
		productIdParam: number,
		currentQuantity: number
	): Promise<{
		quantity: number;
		discount: number;
		items_needed: number;
	} | null> => {
		const targetProductId = productIdParam || productId;
		
		if (!targetProductId) {
			return null;
		}

		try {
			const nextTier = await volumeDiscountService.getNextDiscountTier(
				targetProductId,
				currentQuantity
			);

			if (nextTier) {
				return {
					quantity: nextTier.quantity,
					discount: nextTier.discount,
					items_needed: nextTier.items_needed
				};
			}

			return null;
		} catch (error) {
			console.error("❌ Error obteniendo próximo tier:", error);
			return null;
		}
	}, [productId]);

	// Efecto para cargar información inicial si se proporciona productId
	useEffect(() => {
		if (productId && initialQuantity > 0) {
			getVolumeDiscountInfo(productId, initialQuantity);
		}
	}, [productId, initialQuantity, getVolumeDiscountInfo]);

	return {
		volumeDiscountsEnabled,
		loading,
		error,
		discountInfo,
		cartSummary,
		getVolumeDiscountInfo,
		calculatePotentialSavings,
		getNextDiscountTier
	};
};

/**
 * Hook especializado para usar descuentos por volumen en página de producto
 */
export const useProductVolumeDiscounts = (product: Product | null, quantity: number = 1) => {
	const {
		volumeDiscountsEnabled,
		loading,
		error,
		discountInfo,
		getVolumeDiscountInfo,
		calculatePotentialSavings,
		getNextDiscountTier
	} = useVolumeDiscounts(product?.id, quantity);

	// Información calculada específica para la página de producto
	const productDiscountInfo = useMemo(() => {
		if (!product || !volumeDiscountsEnabled || !discountInfo?.tiers.length) {
			return null;
		}

		// Encontrar el tier actual aplicable
		const currentTier = discountInfo.tiers
			.filter(tier => quantity >= tier.quantity)
			.pop();

		// Calcular precios
		const basePrice = product.final_price || product.price || 0;
		const discountedPrice = currentTier 
			? basePrice * (1 - currentTier.discount / 100)
			: basePrice;
		const savings = (basePrice - discountedPrice) * quantity;

		return {
			hasDiscount: !!currentTier,
			currentTier,
			basePrice,
			discountedPrice,
			totalSavings: savings,
			savingsPerUnit: basePrice - discountedPrice,
			allTiers: discountInfo.tiers,
			nextTier: discountInfo.tiers.find(tier => tier.quantity > quantity) || null
		};
	}, [product, quantity, volumeDiscountsEnabled, discountInfo]);

	// Mensaje promocional para mostrar en la UI
	const promotionalMessage = useMemo(() => {
		if (!productDiscountInfo?.allTiers.length) {
			return null;
		}

		const tierMessages = productDiscountInfo.allTiers
			.map(tier => `${tier.quantity}+ = ${tier.discount}% OFF`)
			.join(" • ");

		return `¡Descuentos por volumen! ${tierMessages}`;
	}, [productDiscountInfo]);

	// Mensaje de ahorro potencial
	const savingsMessage = useMemo(() => {
		if (!productDiscountInfo?.nextTier) {
			return null;
		}

		const itemsNeeded = productDiscountInfo.nextTier.quantity - quantity;
		const basePrice = product?.final_price || product?.price || 0;
		const additionalSavings = basePrice * (productDiscountInfo.nextTier.discount / 100) * itemsNeeded;

		return `¡Añade ${itemsNeeded} más y ahorra $${additionalSavings.toFixed(2)} adicionales!`;
	}, [productDiscountInfo, quantity, product]);

	return {
		volumeDiscountsEnabled,
		loading,
		error,
		productDiscountInfo,
		promotionalMessage,
		savingsMessage,
		getVolumeDiscountInfo,
		calculatePotentialSavings,
		getNextDiscountTier
	};
};

/**
 * Hook para administración de descuentos por volumen
 */
export const useVolumeDiscountsAdmin = () => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [config, setConfig] = useState<any>(null);

	/**
	 * Obtener configuración de administrador
	 */
	const getAdminConfiguration = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const configuration = await volumeDiscountService.getAdminConfiguration();
			setConfig(configuration);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al obtener configuración");
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Actualizar configuración de administrador
	 */
	const updateAdminConfiguration = useCallback(async (newConfig: any) => {
		try {
			setLoading(true);
			setError(null);

			const success = await volumeDiscountService.updateAdminConfiguration(newConfig);
			
			if (success) {
				setConfig(newConfig);
				// Invalidar cache relacionado
				CacheService.removeItem("volume_discount_config");
				return true;
			}
			
			throw new Error("No se pudo actualizar la configuración");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al actualizar configuración");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Obtener descuentos de un producto específico
	 */
	const getProductDiscounts = useCallback(async (productId: number) => {
		try {
			setLoading(true);
			setError(null);

			return await volumeDiscountService.getProductDiscounts(productId);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al obtener descuentos del producto");
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Actualizar descuentos de un producto
	 */
	const updateProductDiscounts = useCallback(async (
		productId: number,
		discounts: Array<{
			min_quantity: number;
			discount_percentage: number;
			label: string;
			active: boolean;
		}>
	) => {
		try {
			setLoading(true);
			setError(null);

			const success = await volumeDiscountService.updateProductDiscounts(productId, discounts);
			
			if (success) {
				// Invalidar cache del producto
				CacheService.removeItem(`volume_discount_${productId}_*`);
				return true;
			}
			
			throw new Error("No se pudieron actualizar los descuentos");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al actualizar descuentos");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Aplicar descuentos por defecto a un producto
	 */
	const applyDefaultDiscounts = useCallback(async (productId: number) => {
		try {
			setLoading(true);
			setError(null);

			const success = await volumeDiscountService.applyDefaultDiscounts(productId);
			
			if (success) {
				// Invalidar cache del producto
				CacheService.removeItem(`volume_discount_${productId}_*`);
				return true;
			}
			
			throw new Error("No se pudieron aplicar los descuentos por defecto");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al aplicar descuentos por defecto");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Aplicación masiva de descuentos por defecto
	 */
	const bulkApplyDefaults = useCallback(async (
		productIds: number[],
		overwriteExisting: boolean = false
	) => {
		try {
			setLoading(true);
			setError(null);

			const result = await volumeDiscountService.bulkApplyDefaults(productIds, overwriteExisting);
			
			if (result.success) {
				// Invalidar cache de todos los productos afectados
				productIds.forEach(id => {
					CacheService.removeItem(`volume_discount_${id}_*`);
				});
			}
			
			return result;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error en aplicación masiva");
			return {
				success: false,
				processed: 0,
				skipped: 0,
				total: productIds.length
			};
		} finally {
			setLoading(false);
		}
	}, []);

	/**
	 * Obtener estadísticas
	 */
	const getStats = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			return await volumeDiscountService.getStats();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al obtener estadísticas");
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		config,
		getAdminConfiguration,
		updateAdminConfiguration,
		getProductDiscounts,
		updateProductDiscounts,
		applyDefaultDiscounts,
		bulkApplyDefaults,
		getStats
	};
};

export default useVolumeDiscounts;