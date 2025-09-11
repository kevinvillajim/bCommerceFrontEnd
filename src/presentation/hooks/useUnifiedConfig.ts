/**
 * 🎯 JORDAN FASE 1: HOOK PARA CONFIGURACIÓN UNIFICADA
 * Reemplaza todos los hooks de configuración existentes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import ConfigurationManager, { 
  type UnifiedConfig, 
  type ConfigurationResult 
} from '../../core/services/ConfigurationManager';

interface UseUnifiedConfigReturn {
  config: UnifiedConfig | null;
  loading: boolean;
  error: string | null;
  warnings: string[];
  source: 'cache' | 'api' | 'fallback';
  isStale: boolean;
  refetch: () => Promise<void>;
  stats: any;
}

/**
 * 🔧 HOOK PRINCIPAL - Reemplaza useShippingConfig, useVolumeDiscount, etc.
 */
export const useUnifiedConfig = (autoRefresh: boolean = true): UseUnifiedConfigReturn => {
  const [result, setResult] = useState<ConfigurationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const managerRef = useRef(ConfigurationManager.getInstance());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 📡 OBTENER CONFIGURACIÓN
  const fetchConfig = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      const configResult = await managerRef.current.getUnifiedConfig(forceRefresh);
      setResult(configResult);
      
      console.log('✅ JORDAN useUnifiedConfig - Configuración cargada:', {
        source: configResult.source,
        isStale: configResult.is_stale,
        errors: configResult.errors.length,
        warnings: configResult.warnings.length
      });
      
    } catch (error) {
      console.error('❌ JORDAN useUnifiedConfig - Error:', error);
      setResult({
        config: managerRef.current.getConfigSync() || managerRef.current['getSecureFallbackConfig'](),
        source: 'fallback',
        is_stale: true,
        errors: [error instanceof Error ? error.message : 'Error desconocido'],
        warnings: ['Hook usando configuración de emergencia']
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔄 REFETCH MANUAL
  const refetch = useCallback(async () => {
    await fetchConfig(true);
  }, [fetchConfig]);

  // 📊 OBTENER ESTADÍSTICAS
  const getStats = useCallback(() => {
    return managerRef.current.getStats();
  }, []);

  // 🚀 INICIALIZACIÓN
  useEffect(() => {
    fetchConfig();

    // 🔄 AUTO-REFRESH (opcional)
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        console.log('🔄 JORDAN - Auto-refresh de configuración');
        fetchConfig();
      }, 5 * 60 * 1000); // Cada 5 minutos
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchConfig, autoRefresh]);

  return {
    config: result?.config || null,
    loading,
    error: result?.errors?.[0] || null,
    warnings: result?.warnings || [],
    source: result?.source || 'fallback',
    isStale: result?.is_stale || false,
    refetch,
    stats: getStats
  };
};

/**
 * 🎯 HOOKS ESPECÍFICOS - Para compatibilidad gradual
 */

// 🚚 HOOK DE ENVÍO (reemplaza useShippingConfig)
export const useShippingConfig = () => {
  const { config, loading, error } = useUnifiedConfig();
  
  return {
    config: config?.shipping || null,
    loading,
    error,
    // Métodos de conveniencia
    calculateShipping: (subtotal: number) => {
      if (!config?.shipping) return 0;
      return subtotal >= config.shipping.free_threshold ? 0 : config.shipping.default_cost;
    },
    isFreeShipping: (subtotal: number) => {
      if (!config?.shipping) return false;
      return subtotal >= config.shipping.free_threshold;
    }
  };
};

// 📦 HOOK DE DESCUENTOS POR VOLUMEN (reemplaza useVolumeDiscount)
export const useVolumeDiscounts = () => {
  const { config, loading, error } = useUnifiedConfig();
  
  return {
    tiers: config?.volume_discounts || [],
    loading,
    error,
    // Métodos de conveniencia
    getDiscountForQuantity: (quantity: number) => {
      if (!config?.volume_discounts) return 0;
      
      const sortedTiers = [...config.volume_discounts].sort((a, b) => b.quantity - a.quantity);
      for (const tier of sortedTiers) {
        if (quantity >= tier.quantity) {
          return tier.discount / 100; // ✅ CORREGIDO: Convertir porcentaje a decimal
        }
      }
      return 0;
    },
    getApplicableTier: (quantity: number) => {
      if (!config?.volume_discounts) return null;
      
      const sortedTiers = [...config.volume_discounts].sort((a, b) => b.quantity - a.quantity);
      for (const tier of sortedTiers) {
        if (quantity >= tier.quantity) {
          return tier;
        }
      }
      return null;
    }
  };
};

// 💰 HOOK DE CONFIGURACIÓN FINANCIERA (reemplaza FinancialConfigurationService)
export const useFinancialConfig = () => {
  const { config, loading, error } = useUnifiedConfig();
  
  return {
    taxRate: config?.tax_rate || 0.15,
    platformCommissionRate: config?.platform_commission_rate || 0.10,
    loading,
    error,
    // Métodos de conveniencia
    calculateTax: (amount: number) => amount * (config?.tax_rate || 0.15),
    calculateCommission: (subtotal: number) => {
      const rate = config?.platform_commission_rate || 0.10;
      return {
        rate: rate * 100, // Para mostrar como porcentaje
        amount: subtotal * rate,
        sellerEarnings: subtotal * (1 - rate)
      };
    }
  };
};

/**
 * 🔍 HOOK DE DEBUG - Para desarrollo
 */
export const useConfigurationDebug = () => {
  const { config, stats, source, isStale, warnings } = useUnifiedConfig();
  
  return {
    config,
    stats,
    source,
    isStale,
    warnings,
    // Helper para mostrar estado en UI de desarrollo
    getDebugInfo: () => {
      const statsData = typeof stats === 'function' ? stats() : stats;
      return {
        manager_stats: statsData,
        current_source: source,
        is_stale: isStale,
        warnings_count: warnings.length,
        config_version: config?.version,
        config_updated: config?.updated_at,
        cache_valid: statsData?.cache_valid
      };
    }
  };
};

export default useUnifiedConfig;