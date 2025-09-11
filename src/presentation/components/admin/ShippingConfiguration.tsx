import React, { useState, useEffect } from "react";
import { Truck, Save, AlertTriangle, Info, RefreshCw, DollarSign, Package } from "lucide-react";
import ConfigurationManager from "../../../core/services/ConfigurationManager";
import ApiClient from "../../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";

// 🎯 JORDAN: Interface compatible mantenida
interface ShippingConfig {
  enabled: boolean;
  freeThreshold: number;
  defaultCost: number;
}

const ShippingConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [config, setConfig] = useState<ShippingConfig>({
    enabled: true,
    freeThreshold: 50.00,
    defaultCost: 5.00,
  });

  // 🎯 JORDAN: Usar ConfigurationManager unificado
  const configManager = ConfigurationManager.getInstance();
  
  // No necesitamos contexto complicado

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    setError(null);

    try {
      // 🎯 JORDAN: Usar ConfigurationManager para obtener configuración unificada
      const configResult = await configManager.getUnifiedConfig();
      const shippingConfig: ShippingConfig = {
        enabled: configResult.config.shipping.enabled,
        freeThreshold: configResult.config.shipping.free_threshold,
        defaultCost: configResult.config.shipping.default_cost
      };
      setConfig(shippingConfig);
    } catch (err) {
      console.error("Error al cargar configuraciones de envío:", err);
      setError("No se pudieron cargar las configuraciones. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: keyof ShippingConfig, value: string | number | boolean) => {
    setConfig(prev => {
      // Si se está deshabilitando el envío, poner valores en 0
      if (field === 'enabled' && value === false) {
        return {
          enabled: false,
          freeThreshold: 0,
          defaultCost: 0
        };
      }
      
      // Si se está habilitando el envío, poner valores por defecto
      if (field === 'enabled' && value === true) {
        return {
          enabled: true,
          freeThreshold: 50.00,
          defaultCost: 5.00
        };
      }
      
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const saveConfiguration = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // 🎯 JORDAN: Usar endpoint directo para actualizar configuraciones de shipping
      const response = await ApiClient.post<{status: string; message?: string}>(
        API_ENDPOINTS.ADMIN.CONFIGURATIONS.SHIPPING,
        config
      );
      
      if (response?.status === "success") {
        setSuccess("Configuración de envío guardada correctamente");
        
        // ✅ INVALIDAR CACHE de ConfigurationManager para forzar actualización
        configManager.invalidateCache();
        
        // ✅ NOTIFICAR A TODAS LAS PESTAÑAS/VENTANAS DEL CAMBIO
        localStorage.setItem('shipping_config_updated', Date.now().toString());
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || "Error al guardar la configuración");
      }
    } catch (err) {
      console.error("Error al guardar configuraciones de envío:", err);
      setError("No se pudo guardar la configuración. Por favor, inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Truck className="w-6 h-6 mr-2" />
            Configuración de Envíos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure los parámetros para el cálculo de costos de envío
          </p>
        </div>
        <button
          onClick={loadConfiguration}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center"
          disabled={loading}
        >
          <RefreshCw size={18} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Panel de información */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-primary-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-primary-900">Acerca de la Configuración de Envíos</h3>
            <p className="mt-1 text-primary-800">
              Estas configuraciones controlan cómo se calculan los costos de envío en la plataforma.
              El umbral de envío gratis determina el monto mínimo de compra para obtener envío gratuito,
              mientras que el costo por defecto se aplica a todas las compras por debajo de ese umbral.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración General */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Configuración General
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="shippingEnabled"
                checked={config.enabled}
                onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="shippingEnabled" className="ml-2 block text-sm text-gray-900">
                Habilitar cálculo de costos de envío
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Cuando está deshabilitado, el envío será GRATIS para todas las compras (promoción temporal)
            </p>
          </div>
        </div>

        {/* Configuración de Costos */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Costos de Envío
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral para envío gratis (USD)
              </label>
              <input
                type="text"
                value={config.freeThreshold === 0 || config.freeThreshold === null || config.freeThreshold === undefined ? '' : config.freeThreshold}
                onChange={(e) => {
                  const value = e.target.value;
                  // Solo permitir números y punto decimal
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleConfigChange('freeThreshold', value === '' ? 0 : parseFloat(value) || 0);
                  }
                }}
                disabled={!config.enabled}
                className={`w-full border rounded-md px-3 py-2 ${
                  config.enabled 
                    ? 'border-gray-300 focus:ring-primary-500 focus:border-primary-500' 
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                }`}
                placeholder="50.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Monto mínimo de compra para obtener envío gratuito
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo de envío por defecto (USD)
              </label>
              <input
                type="text"
                value={config.defaultCost === 0 || config.defaultCost === null || config.defaultCost === undefined ? '' : config.defaultCost}
                onChange={(e) => {
                  const value = e.target.value;
                  // Solo permitir números y punto decimal
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    handleConfigChange('defaultCost', value === '' ? 0 : parseFloat(value) || 0);
                  }
                }}
                disabled={!config.enabled}
                className={`w-full border rounded-md px-3 py-2 ${
                  config.enabled 
                    ? 'border-gray-300 focus:ring-primary-500 focus:border-primary-500' 
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                }`}
                placeholder="5.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Costo aplicado cuando no se alcanza el umbral de envío gratis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Información Importante</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Los precios están configurados en dólares estadounidenses (USD)</li>
          <li>• El cálculo de envío gratis se basa en el subtotal de la compra (sin impuestos)</li>
          <li>• Si el envío está deshabilitado, no se mostrará información de costos de envío</li>
          <li>• Los cambios se aplicarán inmediatamente a todas las nuevas compras</li>
        </ul>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          onClick={saveConfiguration}
          disabled={saving}
          className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save size={16} className="mr-2" />
          {saving ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>
    </div>
  );
};

export default ShippingConfiguration;