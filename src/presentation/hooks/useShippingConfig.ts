import { useState, useEffect } from 'react';
import ShippingConfigService from '../../core/services/ShippingConfigService';
import type { ShippingConfigData } from '../../core/services/ShippingConfigService';

interface UseShippingConfigReturn {
  config: ShippingConfigData | null;
  loading: boolean;
  error: string | null;
  freeThreshold: number;
  defaultCost: number;
  isEnabled: boolean;
  calculateShipping: (subtotal: number) => Promise<{
    cost: number;
    isFree: boolean;
    threshold: number;
  }>;
  refreshConfig: () => void;
}

export const useShippingConfig = (): UseShippingConfigReturn => {
  const [config, setConfig] = useState<ShippingConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shippingService = ShippingConfigService.getInstance();

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = await shippingService.getShippingConfig();
      setConfig(configData);
    } catch (err) {
      setError('Error al cargar configuración de envío');
      console.error('🚢 useShippingConfig: Error loading shipping config:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshConfig = () => {
    shippingService.clearCache();
    loadConfig();
  };

  const calculateShipping = async (subtotal: number) => {
    return await shippingService.calculateShippingCost(subtotal);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loading,
    error,
    freeThreshold: config?.freeThreshold || 60,
    defaultCost: config?.defaultCost || 8,
    isEnabled: config?.enabled ?? true,
    calculateShipping,
    refreshConfig
  };
};

export default useShippingConfig;