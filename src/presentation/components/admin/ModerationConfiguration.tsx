import React, { useState, useEffect } from "react";
import { Shield, Save, AlertTriangle, Info, RefreshCw, MessageCircle, Users } from "lucide-react";
import ConfigurationService, { type ModerationConfig } from "../../../core/services/ConfigurationService";

const ModerationConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [config, setConfig] = useState<ModerationConfig>({
    userStrikesThreshold: 3,
    contactScorePenalty: 3,
    businessScoreBonus: 15,
    contactPenaltyHeavy: 20,
    minimumContactScore: 8,
    scoreDifferenceThreshold: 5,
    consecutiveNumbersLimit: 7,
    numbersWithContextLimit: 3,
    lowStockThreshold: 5,
  });

  const configService = new ConfigurationService();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await configService.getModerationConfigs();
      if (response?.status === "success" && response.data) {
        setConfig(response.data);
      } else {
        setError(response?.message || "No se pudieron cargar las configuraciones");
      }
    } catch (err) {
      console.error("Error al cargar configuraciones de moderación:", err);
      setError("No se pudieron cargar las configuraciones. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: keyof ModerationConfig, value: number) => {
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
      const response = await configService.updateModerationConfigs(config);
      if (response?.status === "success") {
        setSuccess("Configuración de moderación guardada correctamente");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || "Error al guardar la configuración");
      }
    } catch (err) {
      console.error("Error al guardar configuraciones de moderación:", err);
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
            <Shield className="w-6 h-6 mr-2" />
            Configuración de Moderación
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure los parámetros para la moderación automática de mensajes y contenido
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
            <h3 className="font-medium text-primary-900">Acerca de la Moderación Automática</h3>
            <p className="mt-1 text-primary-800">
              El sistema analiza automáticamente los mensajes entre usuarios para detectar patrones sospechosos
              como intercambio de información de contacto fuera de la plataforma. Los valores aquí configurados 
              determinan la sensibilidad de la detección.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de Usuario */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Sistema de Strikes de Usuario
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strikes antes de bloqueo
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.userStrikesThreshold}
                onChange={(e) => handleConfigChange('userStrikesThreshold', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de strikes que puede acumular un usuario antes de ser bloqueado automáticamente
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral de stock bajo
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.lowStockThreshold}
                onChange={(e) => handleConfigChange('lowStockThreshold', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad mínima de productos en stock antes de mostrar aviso de stock bajo
              </p>
            </div>
          </div>
        </div>

        {/* Configuración de Detección de Contacto */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Detección de Información de Contacto
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penalización por patrones sospechosos
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.contactScorePenalty}
                onChange={(e) => handleConfigChange('contactScorePenalty', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puntos añadidos al score de contacto por patrones sospechosos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bonus por indicadores de negocio
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.businessScoreBonus}
                onChange={(e) => handleConfigChange('businessScoreBonus', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="5"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puntos añadidos al score de negocio cuando se detectan términos comerciales legítimos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penalización fuerte por contacto
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.contactPenaltyHeavy}
                onChange={(e) => handleConfigChange('contactPenaltyHeavy', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="10"
                max="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Penalización severa aplicada cuando se detectan indicadores claros de contacto
              </p>
            </div>
          </div>
        </div>

        {/* Configuración de Scores */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Umbrales de Score
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score mínimo de contacto
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.minimumContactScore}
                onChange={(e) => handleConfigChange('minimumContactScore', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="5"
                max="20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Score mínimo para considerar que un mensaje contiene información de contacto
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diferencia de score requerida
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.scoreDifferenceThreshold}
                onChange={(e) => handleConfigChange('scoreDifferenceThreshold', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="3"
                max="15"
              />
              <p className="text-xs text-gray-500 mt-1">
                Diferencia mínima entre score de contacto y negocio para activar moderación
              </p>
            </div>
          </div>
        </div>

        {/* Configuración de Números */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Detección de Números
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de números consecutivos
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.consecutiveNumbersLimit}
                onChange={(e) => handleConfigChange('consecutiveNumbersLimit', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="5"
                max="15"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de dígitos consecutivos que activan la detección de teléfonos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Números con contexto de contacto
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.numbersWithContextLimit}
                onChange={(e) => handleConfigChange('numbersWithContextLimit', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="2"
                max="8"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de dígitos que, junto con palabras de contacto, activan la detección
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Recomendaciones</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Un número bajo de strikes (1-2) puede ser muy restrictivo para usuarios legítimos</li>
          <li>• Scores altos de penalización pueden generar falsos positivos</li>
          <li>• El bonus de negocio debe ser significativamente mayor que las penalizaciones</li>
          <li>• Ajusta los límites de números según el tipo de productos vendidos</li>
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

export default ModerationConfiguration;