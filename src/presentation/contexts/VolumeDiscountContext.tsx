// src/presentation/contexts/VolumeDiscountContext.tsx - CONTEXTO GLOBAL
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Tipos
interface VolumeDiscountTier {
	quantity: number;
	discount: number;
	label: string;
}

interface VolumeDiscountConfig {
	enabled: boolean;
	stackable: boolean;
	show_savings_message: boolean;
	default_tiers: VolumeDiscountTier[];
}

interface VolumeDiscountResult {
	originalPrice: number;
	discountedPrice: number;
	discountPercentage: number;
	savings: number;
	savingsTotal: number;
	currentTier: VolumeDiscountTier | null;
}

interface VolumeDiscountContextType {
	config: VolumeDiscountConfig;
	isEnabled: boolean;
	calculateDiscount: (price: number, quantity: number, productId?: number) => VolumeDiscountResult;
	updateConfig: (newConfig: VolumeDiscountConfig) => void;
	refreshConfig: () => void;
}

// Configuración por defecto
const DEFAULT_CONFIG: VolumeDiscountConfig = {
	enabled: true,
	stackable: false,
	show_savings_message: true,
	default_tiers: [
		{ quantity: 3, discount: 5, label: "Descuento 3+" },
		{ quantity: 6, discount: 10, label: "Descuento 6+" },
		{ quantity: 12, discount: 15, label: "Descuento 12+" }
	]
};

// Crear contexto
const VolumeDiscountContext = createContext<VolumeDiscountContextType | undefined>(undefined);

// Provider
export const VolumeDiscountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [config, setConfig] = useState<VolumeDiscountConfig>(DEFAULT_CONFIG);

	// Cargar configuración al iniciar
	useEffect(() => {
		loadConfig();
		
		// Escuchar cambios de configuración
		const handleConfigUpdate = (event: CustomEvent) => {
			setConfig(event.detail);
		};

		window.addEventListener('volumeDiscountConfigUpdated', handleConfigUpdate as EventListener);
		
		return () => {
			window.removeEventListener('volumeDiscountConfigUpdated', handleConfigUpdate as EventListener);
		};
	}, []);

	// Cargar configuración desde localStorage
	const loadConfig = useCallback(() => {
		try {
			const stored = localStorage.getItem('volume_discount_config');
			if (stored) {
				const parsedConfig = JSON.parse(stored);
				setConfig(parsedConfig);
			}
		} catch (error) {
			console.warn('Error loading volume discount config:', error);
			setConfig(DEFAULT_CONFIG);
		}
	}, []);

	// Actualizar configuración
	const updateConfig = useCallback((newConfig: VolumeDiscountConfig) => {
		setConfig(newConfig);
		localStorage.setItem('volume_discount_config', JSON.stringify(newConfig));
		
		// Disparar evento para notificar otros componentes
		window.dispatchEvent(new CustomEvent('volumeDiscountConfigUpdated', { detail: newConfig }));
	}, []);

	// Calcular descuento para un producto
	const calculateDiscount = useCallback((price: number, quantity: number, productId?: number): VolumeDiscountResult => {
		// Resultado por defecto (sin descuento)
		const defaultResult: VolumeDiscountResult = {
			originalPrice: price,
			discountedPrice: price,
			discountPercentage: 0,
			savings: 0,
			savingsTotal: 0,
			currentTier: null
		};

		// Si los descuentos están deshabilitados
		if (!config.enabled || !config.default_tiers.length || quantity < 1) {
			return defaultResult;
		}

		// Ordenar tiers por cantidad ascendente
		const sortedTiers = [...config.default_tiers].sort((a, b) => a.quantity - b.quantity);

		// Encontrar el tier aplicable más alto
		const currentTier = sortedTiers
			.filter(tier => quantity >= tier.quantity)
			.pop() || null;

		// Si no hay tier aplicable
		if (!currentTier) {
			return defaultResult;
		}

		// Calcular precios con descuento
		const discountPercentage = currentTier.discount;
		const discountedPrice = price * (1 - discountPercentage / 100);
		const savings = price - discountedPrice;
		const savingsTotal = savings * quantity;

		return {
			originalPrice: price,
			discountedPrice,
			discountPercentage,
			savings,
			savingsTotal,
			currentTier
		};
	}, [config]);

	const contextValue: VolumeDiscountContextType = {
		config,
		isEnabled: config.enabled,
		calculateDiscount,
		updateConfig,
		refreshConfig: loadConfig
	};

	return (
		<VolumeDiscountContext.Provider value={contextValue}>
			{children}
		</VolumeDiscountContext.Provider>
	);
};

// Hook para usar el contexto
export const useVolumeDiscountContext = () => {
	const context = useContext(VolumeDiscountContext);
	if (context === undefined) {
		throw new Error('useVolumeDiscountContext must be used within a VolumeDiscountProvider');
	}
	return context;
};

// Hook específico para cálculos de carrito
export const useCartVolumeDiscounts = () => {
	const { calculateDiscount, isEnabled } = useVolumeDiscountContext();

	const calculateCartItemDiscount = useCallback((item: any) => {
		if (!item || !isEnabled) {
			return {
				originalPrice: item?.price || 0,
				discountedPrice: item?.price || 0,
				discountPercentage: 0,
				savings: 0,
				savingsTotal: 0,
				hasDiscount: false
			};
		}

		const basePrice = item.product?.final_price || item.product?.price || item.price || 0;
		const result = calculateDiscount(basePrice, item.quantity, item.productId);

		return {
			...result,
			hasDiscount: result.discountPercentage > 0
		};
	}, [calculateDiscount, isEnabled]);

	const calculateCartTotalDiscounts = useCallback((cartItems: any[]) => {
		if (!cartItems || !cartItems.length || !isEnabled) {
			return {
				totalSavings: 0,
				hasDiscounts: false,
				itemsWithDiscounts: 0
			};
		}

		let totalSavings = 0;
		let itemsWithDiscounts = 0;

		cartItems.forEach(item => {
			const discount = calculateCartItemDiscount(item);
			if (discount.hasDiscount) {
				totalSavings += discount.savingsTotal;
				itemsWithDiscounts++;
			}
		});

		return {
			totalSavings,
			hasDiscounts: totalSavings > 0,
			itemsWithDiscounts
		};
	}, [calculateCartItemDiscount, isEnabled]);

	return {
		calculateCartItemDiscount,
		calculateCartTotalDiscounts,
		isEnabled
	};
};

export default VolumeDiscountContext;