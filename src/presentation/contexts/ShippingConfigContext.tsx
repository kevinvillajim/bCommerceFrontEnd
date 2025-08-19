import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import ShippingConfigService from '../../core/services/ShippingConfigService';
import type { ShippingConfigData } from '../../core/services/ShippingConfigService';

interface ShippingConfigContextType {
  config: ShippingConfigData | null;
  loading: boolean;
  error: string | null;
  freeThreshold: number;
  defaultCost: number;
  isEnabled: boolean;
  refreshConfig: () => Promise<void>;
  updateConfig: (newConfig: Partial<ShippingConfigData>) => void;
}

const ShippingConfigContext = createContext<ShippingConfigContextType | undefined>(undefined);

interface ShippingConfigProviderProps {
  children: ReactNode;
}

export const ShippingConfigProvider: React.FC<ShippingConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<ShippingConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const shippingService = ShippingConfigService.getInstance();

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const configData = await shippingService.getShippingConfig();
      setConfig(configData);
    } catch (err) {
      setError('Error al cargar configuración de envío');
      console.error('🚢 ShippingConfigProvider: Error loading shipping config:', err);
      
      // En caso de error, usar valores por defecto para no bloquear la UI
      setConfig({
        enabled: true,
        freeThreshold: 60,
        defaultCost: 8
      });
    } finally {
      setLoading(false);
    }
  }, [shippingService]);

  const refreshConfig = useCallback(async () => {
    shippingService.clearCache();
    await loadConfig();
  }, [shippingService, loadConfig]);

  // Función para actualizar la configuración inmediatamente (llamada desde admin)
  const updateConfig = useCallback((newConfig: Partial<ShippingConfigData>) => {
    setConfig(currentConfig => {
      if (currentConfig) {
        const updatedConfig = { ...currentConfig, ...newConfig };
        shippingService.updateCache(updatedConfig);
        return updatedConfig;
      }
      return currentConfig;
    });
    setLastUpdate(Date.now());
  }, [shippingService]);

  // Polling muy ocasional - solo cada 6 horas para casos extremos
  useEffect(() => {
    if (!config) return;

    const checkForUpdates = async () => {
      try {
        // Solo verificar si han pasado más de 2 horas desde la última actualización
        const timeSinceUpdate = Date.now() - lastUpdate;
        if (timeSinceUpdate < 2 * 60 * 60 * 1000) return; // 2 horas mínimo

        // Forzar una verificación sin cache (solo en casos muy extremos)
        shippingService.clearCache();
        const latestConfig = await shippingService.getShippingConfig();
        
        // Comparar si hay cambios reales
        const hasChanges = (
          latestConfig.enabled !== config.enabled ||
          latestConfig.freeThreshold !== config.freeThreshold ||
          latestConfig.defaultCost !== config.defaultCost
        );

        if (hasChanges) {
          setConfig(latestConfig);
          setLastUpdate(Date.now());
        }
      } catch (error) {
        // Silencioso - no mostrar errores de polling de fondo
      }
    };

    // Verificar cada 6 horas (muy ocasional)
    const interval = setInterval(checkForUpdates, 6 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [config, lastUpdate, shippingService]);

  useEffect(() => {
    loadConfig();
  }, []);

  // Detectar cambios desde admin y sessionStorage desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Detectar actualización desde admin
      if (e.key === 'shipping_config_updated') {
        console.log('🔄 ShippingConfigContext: Admin actualizó config, recargando...');
        refreshConfig();
        return;
      }

      // Detectar cambios en sessionStorage desde otras pestañas
      if (e.key === 'bcommerce_shipping_config' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data.config) {
            setConfig(data.config);
            setLastUpdate(Date.now());
          }
        } catch (error) {
          console.warn('Error parsing storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshConfig]);

  const value: ShippingConfigContextType = {
    config,
    loading,
    error,
    freeThreshold: config?.freeThreshold || 0,
    defaultCost: config?.defaultCost || 0,
    isEnabled: config?.enabled ?? true,
    refreshConfig,
    updateConfig
  };

  return (
    <ShippingConfigContext.Provider value={value}>
      {children}
    </ShippingConfigContext.Provider>
  );
};

export const useShippingConfig = (): ShippingConfigContextType => {
  const context = useContext(ShippingConfigContext);
  if (context === undefined) {
    throw new Error('useShippingConfig must be used within a ShippingConfigProvider');
  }
  return context;
};

export default ShippingConfigProvider;