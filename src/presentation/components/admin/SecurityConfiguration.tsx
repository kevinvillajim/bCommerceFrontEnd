import React, { useState, useEffect } from "react";
import { Lock, Save, AlertTriangle, Info, RefreshCw, Shield, Key, Clock } from "lucide-react";
import ConfigurationService, { type SecurityConfig } from "../../../core/services/ConfigurationService";

const SecurityConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [config, setConfig] = useState<SecurityConfig>({
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    accountLockAttempts: 5,
    sessionTimeout: 120,
    enableTwoFactor: false,
    requireEmailVerification: true,
    adminIpRestriction: "",
    enableCaptcha: false,
  });

  const configService = new ConfigurationService();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await configService.getSecurityConfigs();
      if (response?.status === "success" && response.data) {
        setConfig(response.data);
      } else {
        setError(response?.message || "No se pudieron cargar las configuraciones");
      }
    } catch (err) {
      console.error("Error al cargar configuraciones de seguridad:", err);
      setError("No se pudieron cargar las configuraciones. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: keyof SecurityConfig, value: string | number | boolean) => {
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
      const response = await configService.updateSecurityConfigs(config);
      if (response?.status === "success") {
        setSuccess("Configuración de seguridad guardada correctamente");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || "Error al guardar la configuración");
      }
    } catch (err) {
      console.error("Error al guardar configuraciones de seguridad:", err);
      setError("No se pudo guardar la configuración. Por favor, inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const getPasswordStrengthLevel = () => {
    let score = 0;
    if (Number(config.passwordMinLength) >= 8) score++;
    if (config.passwordRequireSpecial) score++;
    if (config.passwordRequireUppercase) score++;
    if (config.passwordRequireNumbers) score++;
    
    if (score >= 4) return { level: "Fuerte", color: "text-green-600", bg: "bg-green-100" };
    if (score >= 3) return { level: "Moderada", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "Débil", color: "text-red-600", bg: "bg-red-100" };
  };

  const passwordStrength = getPasswordStrengthLevel();

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
            <Lock className="w-6 h-6 mr-2" />
            Configuración de Seguridad
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure las políticas de seguridad, autenticación y protección del sistema
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
            <h3 className="font-medium text-primary-900">Configuración de Seguridad</h3>
            <p className="mt-1 text-primary-800">
              Estas configuraciones afectan la seguridad de toda la plataforma. Cambios muy restrictivos
              pueden impactar la experiencia del usuario, mientras que configuraciones muy permisivas 
              pueden comprometer la seguridad.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Políticas de Contraseña */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Políticas de Contraseña
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud mínima de contraseña
              </label>
              <input
                type="text"
                value={config.passwordMinLength}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir vacío o solo números
                  if (value === '' || /^\d+$/.test(value)) {
                    // Si está vacío, mantener vacío, si no convertir a número
                    handleConfigChange('passwordMinLength', value === '' ? '' : parseInt(value));
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  // Al perder el foco, validar rangos y asignar valor por defecto si está vacío
                  if (value === '') {
                    handleConfigChange('passwordMinLength', 6);
                  } else {
                    const numValue = parseInt(value);
                    if (numValue < 6) {
                      handleConfigChange('passwordMinLength', 6);
                    } else if (numValue > 50) {
                      handleConfigChange('passwordMinLength', 50);
                    }
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="6-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número mínimo de caracteres requeridos (recomendado: 8+)
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.passwordRequireSpecial}
                  onChange={(e) => handleConfigChange('passwordRequireSpecial', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Requerir caracteres especiales (!@#$%^&*)
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.passwordRequireUppercase}
                  onChange={(e) => handleConfigChange('passwordRequireUppercase', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Requerir letras mayúsculas (A-Z)
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.passwordRequireNumbers}
                  onChange={(e) => handleConfigChange('passwordRequireNumbers', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Requerir números (0-9)
                </span>
              </label>
            </div>

            {/* Indicador de fortaleza */}
            <div className={`p-3 rounded-lg ${passwordStrength.bg}`}>
              <div className="flex items-center">
                <Shield className={`w-4 h-4 mr-2 ${passwordStrength.color}`} />
                <span className={`text-sm font-medium ${passwordStrength.color}`}>
                  Seguridad de contraseña: {passwordStrength.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Autenticación y Sesiones */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Autenticación y Sesiones
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intentos fallidos antes de bloqueo
              </label>
              <input
                type="text"
                value={config.accountLockAttempts}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir vacío o solo números
                  if (value === '' || /^\d+$/.test(value)) {
                    handleConfigChange('accountLockAttempts', value === '' ? '' : parseInt(value));
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  // Al perder el foco, validar rangos y asignar valor por defecto si está vacío
                  if (value === '') {
                    handleConfigChange('accountLockAttempts', 3);
                  } else {
                    const numValue = parseInt(value);
                    if (numValue < 3) {
                      handleConfigChange('accountLockAttempts', 3);
                    } else if (numValue > 10) {
                      handleConfigChange('accountLockAttempts', 10);
                    }
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="3-10"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de intentos de login fallidos antes de bloquear temporalmente la cuenta
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo de sesión (minutos)
              </label>
              <input
                type="text"
                value={config.sessionTimeout}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir vacío o solo números
                  if (value === '' || /^\d+$/.test(value)) {
                    handleConfigChange('sessionTimeout', value === '' ? '' : parseInt(value));
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  // Al perder el foco, validar rangos y asignar valor por defecto si está vacío
                  if (value === '') {
                    handleConfigChange('sessionTimeout', 30);
                  } else {
                    const numValue = parseInt(value);
                    if (numValue < 30) {
                      handleConfigChange('sessionTimeout', 30);
                    } else if (numValue > 480) {
                      handleConfigChange('sessionTimeout', 480);
                    }
                  }
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="30-480"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tiempo de inactividad antes de cerrar sesión automáticamente
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.enableTwoFactor}
                  onChange={(e) => handleConfigChange('enableTwoFactor', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Habilitar autenticación de dos factores
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.requireEmailVerification}
                  onChange={(e) => handleConfigChange('requireEmailVerification', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Requerir verificación de email
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Información de seguridad */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Recomendaciones de Seguridad</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Use contraseñas de al menos 8 caracteres con caracteres especiales, mayúsculas y números</li>
          <li>• Limite los intentos de login a 5 o menos para prevenir ataques de fuerza bruta</li>
          <li>• Configure sesiones de máximo 240 minutos (4 horas) para cuentas administrativas</li>
          <li>• Habilite la verificación de email para prevenir registros con emails falsos</li>
          <li>• Use restricciones de IP solo si su organización tiene IPs fijas</li>
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

export default SecurityConfiguration;