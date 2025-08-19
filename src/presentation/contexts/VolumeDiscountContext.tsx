// src/presentation/contexts/VolumeDiscountContext.tsx - ACTUALIZADO CON BD
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { CartItem } from '../../core/domain/entities/ShoppingCart';
import VolumeDiscountConfigService from '../../core/services/VolumeDiscountConfigService';

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

// Servicio para obtener configuración desde BD
const volumeDiscountService = VolumeDiscountConfigService.getInstance();

// Configuración por defecto (solo como fallback si BD falla)
const DEFAULT_CONFIG: VolumeDiscountConfig = {
  enabled: true,
  stackable: true,
  show_savings_message: true,
  default_tiers: [
    { quantity: 5, discount: 5, label: "Descuento 5+" },
    { quantity: 6, discount: 10, label: "Descuento 10+" },
    { quantity: 19, discount: 15, label: "Descuento 15+" }
  ]
};

// Provider
export const VolumeDiscountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<VolumeDiscountConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ CARGAR CONFIGURACIÓN DESDE BD (con cache en sessionStorage)
  const loadConfig = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Cargar configuración desde el servicio (que consulta BD con cache)
      const bdConfig = await volumeDiscountService.getVolumeDiscountConfig();
      
      // Transformar el formato de la BD al formato del contexto
      const formattedConfig: VolumeDiscountConfig = {
        enabled: bdConfig.enabled,
        stackable: bdConfig.stackable,
        show_savings_message: bdConfig.show_savings_message,
        default_tiers: bdConfig.default_tiers || []
      };
      
      setConfig(formattedConfig);
      console.log('✅ VolumeDiscountContext: Configuración cargada desde BD:', formattedConfig);
      
    } catch (err) {
      console.error('❌ Error cargando configuración de descuentos por volumen desde BD:', err);
      setError('Error al cargar configuración de descuentos');
      setConfig(DEFAULT_CONFIG); // Fallback a configuración por defecto
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ACTUALIZAR CONFIGURACIÓN (solo actualiza cache local, admin debe actualizar BD)
  const updateConfig = useCallback(async (newConfig: VolumeDiscountConfig): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Actualizar cache del servicio
      volumeDiscountService.updateCache({
        enabled: newConfig.enabled,
        stackable: newConfig.stackable,
        default_tiers: newConfig.default_tiers,
        show_savings_message: newConfig.show_savings_message
      });
      
      // Actualizar estado
      setConfig(newConfig);
      
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('volumeDiscountConfigUpdated', { detail: newConfig }));
      
      console.log('✅ VolumeDiscountContext: Configuración actualizada en cache:', newConfig);
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

  // ✅ ESCUCHAR CAMBIOS DE CONFIGURACIÓN Y RECARGAR DESDE BD
  useEffect(() => {
    const handleConfigUpdate = (event: CustomEvent) => {
      console.log('🔄 VolumeDiscountContext: Configuración actualizada por evento externo');
      setConfig(event.detail);
    };

    const handleAdminConfigUpdate = () => {
      console.log('🔄 VolumeDiscountContext: Admin actualizó configuración, recargando desde BD...');
      volumeDiscountService.clearCache(); // Limpiar cache para forzar recarga desde BD
      loadConfig(); // Recargar desde BD
    };

    window.addEventListener('volumeDiscountConfigUpdated', handleConfigUpdate as EventListener);
    window.addEventListener('adminVolumeDiscountConfigUpdated', handleAdminConfigUpdate);

    return () => {
      window.removeEventListener('volumeDiscountConfigUpdated', handleConfigUpdate as EventListener);
      window.removeEventListener('adminVolumeDiscountConfigUpdated', handleAdminConfigUpdate);
    };
  }, [loadConfig]);

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