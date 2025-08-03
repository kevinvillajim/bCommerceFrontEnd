import React, { useState, useEffect } from "react";
import { Settings, Save, AlertTriangle, Info, RefreshCw, ShoppingCart, Clock, Search } from "lucide-react";
import ConfigurationService, { type SystemLimitsConfig } from "../../../core/services/ConfigurationService";

const SystemLimitsConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [config, setConfig] = useState<SystemLimitsConfig>({
    cartMaxItems: 100,
    cartMaxQuantityPerItem: 99,
    orderTimeout: 15,
    recommendationLimit: 10,
    maxRecommendationResults: 10000,
    tokenRefreshThreshold: 15,
  });

  const configService = new ConfigurationService();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await configService.getSystemLimitsConfigs();
      if (response?.status === "success" && response.data) {
        setConfig(response.data);
      } else {
        setError(response?.message || "No se pudieron cargar las configuraciones");
      }
    } catch (err) {
      console.error("Error al cargar configuraciones de límites:", err);
      setError("No se pudieron cargar las configuraciones. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: keyof SystemLimitsConfig, value: number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveConfiguration = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await configService.updateSystemLimitsConfigs(config);
      if (response?.status === "success") {
        setSuccess("Configuración de límites guardada correctamente");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || "Error al guardar la configuración");
      }
    } catch (err) {
      console.error("Error al guardar configuraciones de límites:", err);
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
            <Settings className="w-6 h-6 mr-2" />
            Límites del Sistema
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure los límites operativos del sistema para optimizar rendimiento y experiencia
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900">Configuración de Límites</h3>
            <p className="mt-1 text-blue-800">
              Los límites del sistema ayudan a prevenir abuso, optimizar rendimiento y garantizar 
              una experiencia estable para todos los usuarios.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Límites del Carrito de Compras */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Carrito de Compras
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de productos en carrito
              </label>
              <input
                type="number"
                value={config.cartMaxItems}
                onChange={(e) => handleConfigChange('cartMaxItems', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="10"
                max="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número máximo de productos diferentes que puede tener un carrito
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad máxima por producto
              </label>
              <input
                type="number"
                value={config.cartMaxQuantityPerItem}
                onChange={(e) => handleConfigChange('cartMaxQuantityPerItem', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="999"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad máxima que se puede agregar de un mismo producto
              </p>
            </div>
          </div>
        </div>

        {/* Límites de Tiempo */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Límites de Tiempo
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeout de pedidos (minutos)
              </label>
              <input
                type="number"
                value={config.orderTimeout}
                onChange={(e) => handleConfigChange('orderTimeout', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="5"
                max="60"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiempo límite para completar el proceso de pago
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral de renovación de token (minutos)
              </label>
              <input
                type="number"
                value={config.tokenRefreshThreshold}
                onChange={(e) => handleConfigChange('tokenRefreshThreshold', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="5"
                max="30"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minutos antes de expiración para renovar tokens automáticamente
              </p>
            </div>
          </div>
        </div>

        {/* Límites del Sistema de Recomendaciones */}
        <div className="bg-white rounded-lg shadow-sm border p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Sistema de Recomendaciones
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de recomendaciones por defecto
              </label>
              <input
                type="number"
                value={config.recommendationLimit}
                onChange={(e) => handleConfigChange('recommendationLimit', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="5"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de productos recomendados mostrados por defecto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de resultados de recomendación
              </label>
              <input
                type="number"
                value={config.maxRecommendationResults}
                onChange={(e) => handleConfigChange('maxRecommendationResults', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="1000"
                max="50000"
                step="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Límite máximo de resultados que puede procesar el sistema de recomendaciones
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa del impacto */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Vista Previa del Impacto</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <span className="text-gray-600">Carrito máximo:</span>
            <p className="font-medium">{config.cartMaxItems} productos × {config.cartMaxQuantityPerItem} unidades</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <span className="text-gray-600">Timeout de pago:</span>
            <p className="font-medium">{config.orderTimeout} minutos</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <span className="text-gray-600">Recomendaciones:</span>
            <p className="font-medium">{config.recommendationLimit} por vista</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <span className="text-gray-600">Renovación token:</span>
            <p className="font-medium">{config.tokenRefreshThreshold} min antes</p>
          </div>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Recomendaciones</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Carritos muy grandes (&gt;200 items) pueden afectar el rendimiento</li>
          <li>• Timeouts muy cortos (&lt;10 min) pueden frustrar a usuarios con pagos lentos</li>
          <li>• Muchas recomendaciones (&gt;20) pueden abrumar a los usuarios</li>
          <li>• Máximos de recomendación muy altos pueden sobrecargar el servidor</li>
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

export default SystemLimitsConfiguration;