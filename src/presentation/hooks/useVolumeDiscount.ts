// src/presentation/hooks/useVolumeDiscount.ts - CORREGIDO ERRORES TYPESCRIPT
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Product } from "../../core/domain/entities/Product";

// Tipos corregidos
interface VolumeDiscountTier {
	quantity: number;
	discount: number;
	label: string;
}

interface DiscountInfo {
	enabled: boolean;
	tiers: VolumeDiscountTier[];
}

interface ProductDiscountResult {
	originalPrice: number;
	discountedPrice: number;
	discountPercentage: number;
	savings: number;
	savingsTotal: number;
	currentTier: VolumeDiscountTier | null;
	nextTier: VolumeDiscountTier | null;
	itemsNeededForNext: number;
	promotionalMessage: string | null;
	savingsMessage: string | null;
}

/**
 * Hook principal para manejar descuentos por volumen
 */
export const useVolumeDiscountFixed = (productId?: number) => {
	const [discountInfo, setDiscountInfo] = useState<DiscountInfo>({ enabled: false, tiers: [] });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Cargar información de descuentos cuando cambia el productId
	useEffect(() => {
		if (!productId) return;

		loadDiscountInfo(productId);
	}, [productId]);

	const loadDiscountInfo = useCallback(async (productIdParam: number) => {
		try {
			setLoading(true);
			setError(null);

			// Usar configuración por defecto desde localStorage o API
			const defaultConfig = getDefaultDiscountConfig();
			
			setDiscountInfo({
				enabled: defaultConfig.enabled,
				tiers: defaultConfig.default_tiers.map((tier: VolumeDiscountTier) => ({
					quantity: tier.quantity,
					discount: tier.discount,
					label: tier.label
				}))
			});

		} catch (err) {
			console.error("Error cargando descuentos:", err);
			setError("Error al cargar descuentos por volumen");
		} finally {
			setLoading(false);
		}
	}, []);

	// Obtener configuración por defecto (simulada o desde localStorage)
	const getDefaultDiscountConfig = useCallback(() => {
		// Intentar obtener desde localStorage primero
		const stored = localStorage.getItem('volume_discount_config');
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch (e) {
				console.warn("Error parsing stored config");
			}
		}

		// Configuración por defecto
		return {
			enabled: true,
			default_tiers: [
				{ quantity: 3, discount: 5, label: "Descuento 3+" },
				{ quantity: 6, discount: 10, label: "Descuento 6+" },
				{ quantity: 12, discount: 15, label: "Descuento 12+" }
			]
		};
	}, []);

	// Calcular descuentos para una cantidad específica
	const calculateDiscount = useCallback((price: number, quantity: number): ProductDiscountResult => {
		// Resultado por defecto (sin descuento)
		const defaultResult: ProductDiscountResult = {
			originalPrice: price,
			discountedPrice: price,
			discountPercentage: 0,
			savings: 0,
			savingsTotal: 0,
			currentTier: null,
			nextTier: null,
			itemsNeededForNext: 0,
			promotionalMessage: null,
			savingsMessage: null
		};

		// Si los descuentos están deshabilitados
		if (!discountInfo.enabled || !discountInfo.tiers.length || quantity < 1) {
			return defaultResult;
		}

		// Ordenar tiers por cantidad ascendente
		const sortedTiers = [...discountInfo.tiers].sort((a, b) => a.quantity - b.quantity);

		// Encontrar el tier aplicable más alto
		const currentTier = sortedTiers
			.filter((tier: VolumeDiscountTier) => quantity >= tier.quantity)
			.pop() || null;

		// Encontrar el próximo tier
		const nextTier = sortedTiers.find((tier: VolumeDiscountTier) => tier.quantity > quantity) || null;

		// Si no hay tier aplicable
		if (!currentTier) {
			return {
				...defaultResult,
				nextTier,
				itemsNeededForNext: nextTier ? nextTier.quantity - quantity : 0,
				promotionalMessage: sortedTiers.length > 0 
					? `¡Descuentos por volumen! ${sortedTiers.map(t => `${t.quantity}+ = ${t.discount}% OFF`).join(' • ')}`
					: null,
				savingsMessage: nextTier && nextTier.quantity > quantity
					? `¡Añade ${nextTier.quantity - quantity} más y ahorra ${(price * (nextTier.discount / 100) * nextTier.quantity).toFixed(2)} adicionales!`
					: null
			};
		}

		// Calcular precios con descuento
		const discountPercentage = currentTier.discount;
		const discountedPrice = price * (1 - discountPercentage / 100);
		const savings = price - discountedPrice;
		const savingsTotal = savings * quantity;

		// Calcular items necesarios para el próximo descuento
		const itemsNeededForNext = nextTier ? nextTier.quantity - quantity : 0;

		// Generar mensajes
		const promotionalMessage = sortedTiers.length > 0 
			? `¡Descuentos por volumen! ${sortedTiers.map(t => `${t.quantity}+ = ${t.discount}% OFF`).join(' • ')}`
			: null;

		const savingsMessage = nextTier && itemsNeededForNext > 0
			? `¡Añade ${itemsNeededForNext} más y ahorra ${(price * (nextTier.discount / 100) * nextTier.quantity).toFixed(2)} adicionales!`
			: null;

		return {
			originalPrice: price,
			discountedPrice,
			discountPercentage,
			savings,
			savingsTotal,
			currentTier,
			nextTier,
			itemsNeededForNext,
			promotionalMessage,
			savingsMessage
		};
	}, [discountInfo]);

	return {
		discountInfo,
		loading,
		error,
		calculateDiscount,
		refreshDiscounts: () => productId && loadDiscountInfo(productId)
	};
};

/**
 * Hook específico para página de producto con estado de cantidad
 */
export const useProductVolumeDiscount = (product: Product | null, initialQuantity: number = 1) => {
	const [quantity, setQuantity] = useState(initialQuantity);
	const { discountInfo, loading, error, calculateDiscount } = useVolumeDiscountFixed(product?.id);

	// Actualizar cantidad cuando cambia la prop
	useEffect(() => {
		setQuantity(initialQuantity);
	}, [initialQuantity]);

	// Calcular descuentos en tiempo real
	const discountResult = useMemo(() => {
		if (!product) return null;
		
		const basePrice = product.final_price || product.price || 0;
		return calculateDiscount(basePrice, quantity);
	}, [product, quantity, calculateDiscount]);

	// Función para cambiar cantidad
	const updateQuantity = useCallback((newQuantity: number) => {
		if (newQuantity >= 1 && newQuantity <= 50) { // Límite máximo
			setQuantity(newQuantity);
		}
	}, []);

	return {
		quantity,
		setQuantity: updateQuantity,
		discountResult,
		discountInfo,
		loading,
		error,
		// Helpers con validación de undefined
		hasDiscount: (discountResult?.discountPercentage ?? 0) > 0,
		finalPrice: discountResult?.discountedPrice ?? product?.price ?? 0,
		totalSavings: discountResult?.savingsTotal ?? 0
	};
};

/**
 * Hook para administración (simplificado)
 */
export const useVolumeDiscountsAdmin = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const getAdminConfiguration = useCallback(async () => {
		try {
			setLoading(true);
			// Obtener desde localStorage o valores por defecto
			const stored = localStorage.getItem('volume_discount_config');
			if (stored) {
				return JSON.parse(stored);
			}
			
			return {
				enabled: true,
				stackable: false,
				show_savings_message: true,
				default_tiers: [
					{ quantity: 3, discount: 5, label: "Descuento 3+" },
					{ quantity: 6, discount: 10, label: "Descuento 6+" },
					{ quantity: 12, discount: 15, label: "Descuento 12+" }
				]
			};
		} catch (err) {
			setError("Error al obtener configuración");
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	const updateAdminConfiguration = useCallback(async (config: any) => {
		try {
			setLoading(true);
			setError(null);
			
			// Guardar en localStorage
			localStorage.setItem('volume_discount_config', JSON.stringify(config));
			
			// Disparar evento personalizado para que otros componentes se actualicen
			window.dispatchEvent(new CustomEvent('volumeDiscountConfigUpdated', { detail: config }));
			
			return true;
		} catch (err) {
			setError("Error al guardar configuración");
			return false;
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		error,
		getAdminConfiguration,
		updateAdminConfiguration
	};
};

export default useVolumeDiscountFixed;