// src/presentation/hooks/useVolumeDiscount.ts - CORREGIDO ERRORES TYPESCRIPT
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Product } from "../../core/domain/entities/Product";
import ConfigurationService from "../../core/services/ConfigurationService";
import ApiClient from "../../infrastructure/api/apiClient";

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
export const useVolumeDiscountFixed = () => {
	const [discountInfo, setDiscountInfo] = useState<DiscountInfo>({ enabled: false, tiers: [] });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Obtener configuración por defecto (fallback)
	const getDefaultDiscountConfig = useCallback(() => {
		// CORREGIDO: Intentar obtener desde sessionStorage primero con la key correcta
		const stored = sessionStorage.getItem('bcommerce_volume_discount_config');
		if (stored) {
			try {
				return JSON.parse(stored);
			} catch (e) {
				console.warn("Error parsing stored config from sessionStorage");
			}
		}
		
		// Fallback a localStorage con key anterior por compatibilidad
		const localStored = localStorage.getItem('volume_discount_config');
		if (localStored) {
			try {
				return JSON.parse(localStored);
			} catch (e) {
				console.warn("Error parsing stored config from localStorage");
			}
		}

		// CORREGIDO: Configuración por defecto hardcodeada coincidente con backend actual
		return {
			enabled: true,
			default_tiers: [
				{ quantity: 3, discount: 50, label: "Nuevo descuento" }
			]
		};
	}, []);

	// Leer directamente de sessionStorage
	const loadDiscountInfo = useCallback(() => {
		try {
			setLoading(true);
			setError(null);
			
			const sessionConfig = sessionStorage.getItem('bcommerce_volume_discount_config');
			
			if (sessionConfig) {
				try {
					const parsed = JSON.parse(sessionConfig);
					const config = parsed.config || parsed; // Manejar estructura {config: {...}, timestamp: ...}
					
					let tiers: VolumeDiscountTier[] = [];
					if (config.default_tiers && Array.isArray(config.default_tiers)) {
						tiers = config.default_tiers.map((tier: any) => ({
							quantity: tier.quantity,
							discount: tier.discount,
							label: tier.label
						}));
					}
					
					setDiscountInfo({
						enabled: config.enabled !== false,
						tiers
					});
					
					setLoading(false);
					return;
				} catch (parseError) {
					// Ignorar error de parsing, usar fallback
				}
			}
			
			// Fallback si no hay sessionStorage
			const defaultConfig = getDefaultDiscountConfig();
			setDiscountInfo({
				enabled: defaultConfig.enabled,
				tiers: defaultConfig.default_tiers
			});

		} catch (err) {
			const defaultConfig = getDefaultDiscountConfig();
			setDiscountInfo({
				enabled: defaultConfig.enabled,
				tiers: defaultConfig.default_tiers
			});
			setError("Error al cargar descuentos por volumen");
		} finally {
			setLoading(false);
		}
	}, [getDefaultDiscountConfig]);

	// Cargar información de descuentos al inicializar y cuando cambia el productId
	useEffect(() => {
		// Cargar siempre la configuración para tener las etiquetas dinámicas disponibles
		loadDiscountInfo();
	}, [loadDiscountInfo]);

	// Escuchar eventos de actualización de configuración
	useEffect(() => {
		const handleConfigUpdate = () => {
			console.log('🔄 Configuración de descuentos por volumen actualizada, recargando...');
			loadDiscountInfo();
		};

		window.addEventListener('volumeDiscountConfigUpdated', handleConfigUpdate);
		
		return () => {
			window.removeEventListener('volumeDiscountConfigUpdated', handleConfigUpdate);
		};
	}, [loadDiscountInfo]);


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
		refreshDiscounts: () => loadDiscountInfo()
	};
};

/**
 * Hook específico para página de producto con estado de cantidad
 */
export const useProductVolumeDiscount = (product: Product | null, initialQuantity: number = 1) => {
	const [quantity, setQuantity] = useState(initialQuantity);
	const { discountInfo, loading, error, calculateDiscount } = useVolumeDiscountFixed();

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
			setError(null);
			
			// 🔧 CORREGIDO: Obtener configuración desde ruta pública
			const response = await ApiClient.get('/configurations/volume-discounts-public');
			
			const responseData = response as any;
			if (responseData.status === 'success' && responseData.data) {
				const config = responseData.data;
				
				// Procesar los tiers dinámicos desde la BD
				let default_tiers = [];
				
				if (config.volume_discounts?.default_tiers) {
					// Los tiers vienen como string JSON desde la BD
					const tiersData = typeof config.volume_discounts.default_tiers === 'string' 
						? JSON.parse(config.volume_discounts.default_tiers)
						: config.volume_discounts.default_tiers;
					
					default_tiers = tiersData;
				}
				
				return {
					enabled: config.volume_discounts?.enabled !== false,
					stackable: config.volume_discounts?.stackable || false,
					show_savings_message: config.volume_discounts?.show_savings_message !== false,
					default_tiers
				};
			}
			
			// Fallback a sessionStorage o localStorage antes de valores por defecto
			const sessionStored = sessionStorage.getItem('bcommerce_volume_discount_config');
			if (sessionStored) {
				return JSON.parse(sessionStored);
			}
			
			const localStored = localStorage.getItem('volume_discount_config');
			if (localStored) {
				return JSON.parse(localStored);
			}
			
			return {
				enabled: true,
				stackable: false,
				show_savings_message: true,
				default_tiers: [
					{ quantity: 3, discount: 50, label: "Nuevo descuento" }
				]
			};
		} catch (err) {
			console.error("❌ Error al obtener configuración desde backend:", err);
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
			
			// 🔧 CORREGIDO: Usar la API del backend
			const configService = new ConfigurationService();
			const response = await configService.updateVolumeDiscountConfigs(config);
			
			if (response.status === 'success') {
				// CORREGIDO: Guardar en sessionStorage con la key correcta como cache principal
				sessionStorage.setItem('bcommerce_volume_discount_config', JSON.stringify(config));
				
				// También guardar en localStorage como backup por compatibilidad
				localStorage.setItem('volume_discount_config', JSON.stringify(config));
				
				// Disparar evento personalizado para que otros componentes se actualicen
				window.dispatchEvent(new CustomEvent('volumeDiscountConfigUpdated', { detail: config }));
				
				console.log('✅ Configuración de descuentos por volumen actualizada en BD');
				return true;
			} else {
				setError("Error al guardar en base de datos: " + response.message);
				return false;
			}
		} catch (err) {
			console.error("❌ Error al guardar configuración en backend:", err);
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