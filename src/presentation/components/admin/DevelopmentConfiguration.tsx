import React, { useState, useEffect } from "react";
import { Settings, Save, AlertTriangle, Info, RefreshCw, Code, Shield, Mail, Clock } from "lucide-react";
import ConfigurationService, { type DevelopmentConfig } from "../../../core/services/ConfigurationService";

const DevelopmentConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [config, setConfig] = useState<DevelopmentConfig>({
    mode: false,
    allowAdminOnlyAccess: false,
    bypassEmailVerification: true,
    requireEmailVerification: false,
    emailVerificationTimeout: 24,
  });

  const configService = new ConfigurationService();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await configService.getDevelopmentConfigs();
      if (response?.status === "success" && response.data) {
        setConfig(response.data);
      } else {
        setError(response?.message || "No se pudieron cargar las configuraciones");
      }
    } catch (err) {
      console.error("Error al cargar configuraciones de desarrollo:", err);
      setError("No se pudieron cargar las configuraciones. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: keyof DevelopmentConfig, value: string | number | boolean) => {
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
      const response = await configService.updateDevelopmentConfigs(config);
      if (response?.status === "success") {
        setSuccess("Configuración de desarrollo guardada correctamente");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || "Error al guardar la configuración");
      }
    } catch (err) {
      console.error("Error al guardar configuraciones de desarrollo:", err);
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
            <Code className="w-6 h-6 mr-2" />
            Configuración de Desarrollo
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure parámetros para desarrollo, mantenimiento y verificación de email
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

      {/* Panel de advertencia */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-900">¡Configuraciones Críticas!</h3>
            <p className="mt-1 text-amber-800">
              Estas configuraciones afectan la seguridad y funcionalidad del sistema. 
              Solo modifícalas durante actualizaciones, mantenimiento o desarrollo.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuración de Desarrollo */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Modo Desarrollo
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="developmentMode"
                checked={config.mode}
                onChange={(e) => handleConfigChange('mode', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="developmentMode" className="ml-2 block text-sm text-gray-900">
                Activar modo desarrollo
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Habilita funciones especiales para desarrolladores y actualizaciones del sistema
            </p>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="adminOnlyAccess"
                checked={config.allowAdminOnlyAccess}
                onChange={(e) => handleConfigChange('allowAdminOnlyAccess', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="adminOnlyAccess" className="ml-2 block text-sm text-gray-900">
                Restringir acceso solo a administradores
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Cuando está activo, solo los administradores pueden acceder al sistema
            </p>
          </div>
        </div>

        {/* Configuración de Email */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Verificación de Email
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bypassEmailVerification"
                checked={config.bypassEmailVerification}
                onChange={(e) => handleConfigChange('bypassEmailVerification', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="bypassEmailVerification" className="ml-2 block text-sm text-gray-900">
                Bypass verificación de email (Desarrollo)
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Los usuarios se activan automáticamente sin verificar email
            </p>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={config.requireEmailVerification}
                onChange={(e) => handleConfigChange('requireEmailVerification', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-900">
                Requerir verificación de email
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Los usuarios deben verificar su email antes de acceder al sistema
            </p>

            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Timeout de verificación (horas)
              </label>
              <input
                type="number"
											onWheel={(e) => e.currentTarget.blur()}
                value={config.emailVerificationTimeout}
                onChange={(e) => handleConfigChange('emailVerificationTimeout', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                min="1"
                max="168"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiempo límite para que el usuario verifique su email
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-primary-500 mr-3 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-primary-900 mb-2">Configuraciones Recomendadas</h4>
            <ul className="text-sm text-primary-800 space-y-1">
              <li><strong>Desarrollo:</strong> Bypass email ON, Verificación OFF</li>
              <li><strong>Testing:</strong> Bypass email ON, Verificación ON (para probar flujo)</li>
              <li><strong>Producción:</strong> Bypass email OFF, Verificación ON</li>
              <li><strong>Mantenimiento:</strong> Admin Only Access ON</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Estado actual */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          Estado Actual del Sistema
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Modo Desarrollo:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${config.mode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {config.mode ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Solo Administradores:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${config.allowAdminOnlyAccess ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {config.allowAdminOnlyAccess ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Bypass Email:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${config.bypassEmailVerification ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-800'}`}>
              {config.bypassEmailVerification ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Verificación Requerida:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${config.requireEmailVerification ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}>
              {config.requireEmailVerification ? 'Sí' : 'No'}
            </span>
          </div>
        </div>
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

export default DevelopmentConfiguration;