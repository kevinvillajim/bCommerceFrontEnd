// src/presentation/contexts/VolumeDiscountContext.tsx - ACTUALIZADO
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CartItem } from '../../core/domain/entities/ShoppingCart';

// Tipos para el contexto
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

interface CartItemDiscount {
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  savings: number;
  savingsTotal: number;
  hasDiscount: boolean;
}

interface VolumeDiscountContextType {
  // Estado
  isEnabled: boolean;
  config: VolumeDiscountConfig | null;
  loading: boolean;
  error: string | null;
  
  // Funciones principales
  calculateCartItemDiscount: (item: CartItem) => CartItemDiscount;
  calculateCartTotalDiscounts: (items: CartItem[]) => {
    totalSavings: number;
    appliedDiscounts: number;
  };
  
  // Funciones de configuración
  loadConfig: () => Promise<void>;
  updateConfig: (newConfig: VolumeDiscountConfig) => Promise<boolean>;
}

// Contexto
const VolumeDiscountContext = createContext<VolumeDiscountContextType | undefined>(undefined);

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

// Provider
export const VolumeDiscountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<VolumeDiscountConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ CARGAR CONFIGURACIÓN DESDE LOCALSTORAGE O USAR DEFAULTS
  const loadConfig = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Intentar cargar desde localStorage
      const stored = localStorage.getItem('volume_discount_config');
      if (stored) {
        try {
          const parsedConfig = JSON.parse(stored);
          setConfig(parsedConfig);
          console.log('✅ VolumeDiscountContext: Configuración cargada desde localStorage:', parsedConfig);
          return;
        } catch (parseError) {
          console.warn('⚠️ Error parsing stored config, using defaults');
        }
      }

      // Usar configuración por defecto
      setConfig(DEFAULT_CONFIG);
      console.log('✅ VolumeDiscountContext: Usando configuración por defecto:', DEFAULT_CONFIG);
      
    } catch (err) {
      console.error('❌ Error cargando configuración de descuentos por volumen:', err);
      setError('Error al cargar configuración de descuentos');
      setConfig(DEFAULT_CONFIG); // Fallback a configuración por defecto
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ACTUALIZAR CONFIGURACIÓN
  const updateConfig = useCallback(async (newConfig: VolumeDiscountConfig): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Guardar en localStorage
      localStorage.setItem('volume_discount_config', JSON.stringify(newConfig));
      
      // Actualizar estado
      setConfig(newConfig);
      
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('volumeDiscountConfigUpdated', { detail: newConfig }));
      
      console.log('✅ VolumeDiscountContext: Configuración actualizada:', newConfig);
      return true;
    } catch (err) {
      console.error('❌ Error actualizando configuración:', err);
      setError('Error al guardar configuración');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ CALCULAR DESCUENTO PARA UN ITEM DEL CARRITO
  const calculateCartItemDiscount = useCallback((item: CartItem): CartItemDiscount => {
    // Resultado por defecto sin descuento
    const defaultResult: CartItemDiscount = {
      originalPrice: item.price || 0,
      discountedPrice: item.price || 0,
      discountPercentage: 0,
      savings: 0,
      savingsTotal: 0,
      hasDiscount: false
    };

    // Si no hay configuración o no está habilitada
    if (!config || !config.enabled || !config.default_tiers.length) {
      return defaultResult;
    }

    // Obtener precio base del producto
    const basePrice = item.product?.final_price || item.product?.price || item.price || 0;
    const quantity = item.quantity || 1;

    if (basePrice <= 0 || quantity <= 0) {
      return defaultResult;
    }

    // Ordenar tiers por cantidad ascendente
    const sortedTiers = [...config.default_tiers].sort((a, b) => a.quantity - b.quantity);

    // Encontrar el tier aplicable más alto
    const applicableTier = sortedTiers
      .filter(tier => quantity >= tier.quantity)
      .pop();

    if (!applicableTier) {
      return defaultResult;
    }

    // Calcular precios con descuento
    const discountPercentage = applicableTier.discount;
    const discountedPrice = basePrice * (1 - discountPercentage / 100);
    const savings = basePrice - discountedPrice;
    const savingsTotal = savings * quantity;

    return {
      originalPrice: basePrice,
      discountedPrice,
      discountPercentage,
      savings,
      savingsTotal,
      hasDiscount: true
    };
  }, [config]);

  // ✅ CALCULAR TOTALES DE DESCUENTOS DEL CARRITO
  const calculateCartTotalDiscounts = useCallback((items: CartItem[]) => {
    if (!items || !items.length) {
      return {
        totalSavings: 0,
        appliedDiscounts: 0
      };
    }

    let totalSavings = 0;
    let appliedDiscounts = 0;

    items.forEach(item => {
      const discount = calculateCartItemDiscount(item);
      if (discount.hasDiscount) {
        totalSavings += discount.savingsTotal;
        appliedDiscounts++;
      }
    });

    return {
      totalSavings,
      appliedDiscounts
    };
  }, [calculateCartItemDiscount]);

  // ✅ CARGAR CONFIGURACIÓN AL MONTAR
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // ✅ ESCUCHAR CAMBIOS DE CONFIGURACIÓN
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      console.log('🔄 VolumeDiscountContext: Configuración actualizada por evento externo');
      setConfig(event.detail);
    };

    window.addEventListener('volumeDiscountConfigUpdated', handleConfigUpdate as EventListener);

    return () => {
      window.removeEventListener('volumeDiscountConfigUpdated', handleConfigUpdate as EventListener);
    };
  }, []);

  // ✅ MEMOIZAR VALOR DEL CONTEXTO
  const contextValue = useMemo(() => ({
    isEnabled: Boolean(config?.enabled),
    config,
    loading,
    error,
    calculateCartItemDiscount,
    calculateCartTotalDiscounts,
    loadConfig,
    updateConfig
  }), [config, loading, error, calculateCartItemDiscount, calculateCartTotalDiscounts, loadConfig, updateConfig]);

  return (
    <VolumeDiscountContext.Provider value={contextValue}>
      {children}
    </VolumeDiscountContext.Provider>
  );
};

// Hook para usar el contexto
export const useCartVolumeDiscounts = (): VolumeDiscountContextType => {
  const context = useContext(VolumeDiscountContext);
  if (context === undefined) {
    throw new Error('useCartVolumeDiscounts debe ser usado dentro de VolumeDiscountProvider');
  }
  return context;
};

// Hook simplificado para descuentos de productos individuales
export const useProductVolumeDiscountSimple = (productPrice: number, quantity: number) => {
  const { calculateCartItemDiscount, isEnabled } = useCartVolumeDiscounts();

  return useMemo(() => {
    if (!isEnabled || productPrice <= 0 || quantity <= 0) {
      return {
        originalPrice: productPrice,
        discountedPrice: productPrice,
        discountPercentage: 0,
        savings: 0,
        savingsTotal: 0,
        hasDiscount: false
      };
    }

    // Crear un mock de CartItem para el cálculo
    const mockCartItem: CartItem = {
      id: 0,
      productId: 0,
      quantity,
      price: productPrice,
      subtotal: productPrice * quantity,
      product: {
        id: 0,
        name: '',
        price: productPrice,
        final_price: productPrice,
        stockAvailable: 999,
        stock: 999,
        is_in_stock: true,
        discount_percentage: 0,
        rating: 0,
        rating_count: 0
      }
    };

    return calculateCartItemDiscount(mockCartItem);
  }, [calculateCartItemDiscount, isEnabled, productPrice, quantity]);
};

export default VolumeDiscountContext;