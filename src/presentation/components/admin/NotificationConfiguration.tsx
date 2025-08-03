import React, { useState, useEffect } from "react";
import { Bell, Save, AlertTriangle, Info, RefreshCw, Users, ShoppingBag, UserCheck } from "lucide-react";
import ConfigurationService, { type NotificationConfig } from "../../../core/services/ConfigurationService";

const NotificationConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [config, setConfig] = useState<NotificationConfig>({
    adminNewOrder: true,
    adminNewUser: true,
    adminLowStock: true,
    adminNewReview: false,
    adminFailedPayment: true,
    sellerNewOrder: true,
    sellerLowStock: true,
    sellerProductReview: true,
    sellerMessageReceived: true,
    sellerReturnRequest: true,
    userOrderStatus: true,
    userDeliveryUpdates: true,
    userPromotions: false,
    userAccountChanges: true,
    userPasswordChanges: true,
  });

  const configService = new ConfigurationService();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await configService.getNotificationConfigs();
      if (response?.status === "success" && response.data) {
        setConfig(response.data);
      } else {
        setError(response?.message || "No se pudieron cargar las configuraciones");
      }
    } catch (err) {
      console.error("Error al cargar configuraciones de notificaciones:", err);
      setError("No se pudieron cargar las configuraciones. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: keyof NotificationConfig, value: boolean) => {
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
      const response = await configService.updateNotificationConfigs(config);
      if (response?.status === "success") {
        setSuccess("Configuración de notificaciones guardada correctamente");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response?.message || "Error al guardar la configuración");
      }
    } catch (err) {
      console.error("Error al guardar configuraciones de notificaciones:", err);
      setError("No se pudo guardar la configuración. Por favor, inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAllAdmin = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      adminNewOrder: enabled,
      adminNewUser: enabled,
      adminLowStock: enabled,
      adminNewReview: enabled,
      adminFailedPayment: enabled,
    }));
  };

  const toggleAllSeller = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      sellerNewOrder: enabled,
      sellerLowStock: enabled,
      sellerProductReview: enabled,
      sellerMessageReceived: enabled,
      sellerReturnRequest: enabled,
    }));
  };

  const toggleAllUser = (enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      userOrderStatus: enabled,
      userDeliveryUpdates: enabled,
      userPromotions: enabled,
      userAccountChanges: enabled,
      userPasswordChanges: enabled,
    }));
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
            <Bell className="w-6 h-6 mr-2" />
            Configuración de Notificaciones
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure qué notificaciones se envían a administradores, vendedores y usuarios
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
            <h3 className="font-medium text-blue-900">Gestión de Notificaciones</h3>
            <p className="mt-1 text-blue-800">
              Configure qué eventos generan notificaciones por email para cada tipo de usuario.
              Las notificaciones ayudan a mantener informados a los usuarios sobre actividades importantes.
            </p>
          </div>
        </div>
      </div>

      {/* Notificaciones para Administradores */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Notificaciones para Administradores
          </h3>
          <div className="space-x-2">
            <button
              onClick={() => toggleAllAdmin(true)}
              className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Activar todas
            </button>
            <button
              onClick={() => toggleAllAdmin(false)}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Desactivar todas
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.adminNewOrder}
              onChange={(e) => handleConfigChange('adminNewOrder', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Nuevos pedidos</span>
              <p className="text-xs text-gray-500">Se notifica cuando se crea un nuevo pedido</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.adminNewUser}
              onChange={(e) => handleConfigChange('adminNewUser', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Nuevos usuarios</span>
              <p className="text-xs text-gray-500">Se notifica cuando se registra un nuevo usuario</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.adminLowStock}
              onChange={(e) => handleConfigChange('adminLowStock', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Stock bajo</span>
              <p className="text-xs text-gray-500">Se notifica cuando un producto tiene stock bajo</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.adminNewReview}
              onChange={(e) => handleConfigChange('adminNewReview', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Nuevas valoraciones</span>
              <p className="text-xs text-gray-500">Se notifica cuando se publica una valoración</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.adminFailedPayment}
              onChange={(e) => handleConfigChange('adminFailedPayment', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Pagos fallidos</span>
              <p className="text-xs text-gray-500">Se notifica cuando falla un pago</p>
            </span>
          </label>
        </div>
      </div>

      {/* Notificaciones para Vendedores */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Notificaciones para Vendedores
          </h3>
          <div className="space-x-2">
            <button
              onClick={() => toggleAllSeller(true)}
              className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Activar todas
            </button>
            <button
              onClick={() => toggleAllSeller(false)}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Desactivar todas
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.sellerNewOrder}
              onChange={(e) => handleConfigChange('sellerNewOrder', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Nuevos pedidos</span>
              <p className="text-xs text-gray-500">Se notifica cuando alguien compra sus productos</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.sellerLowStock}
              onChange={(e) => handleConfigChange('sellerLowStock', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Stock bajo</span>
              <p className="text-xs text-gray-500">Se notifica cuando sus productos tienen stock bajo</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.sellerProductReview}
              onChange={(e) => handleConfigChange('sellerProductReview', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Valoraciones de productos</span>
              <p className="text-xs text-gray-500">Se notifica cuando valoran sus productos</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.sellerMessageReceived}
              onChange={(e) => handleConfigChange('sellerMessageReceived', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Mensajes recibidos</span>
              <p className="text-xs text-gray-500">Se notifica cuando reciben mensajes</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.sellerReturnRequest}
              onChange={(e) => handleConfigChange('sellerReturnRequest', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Solicitudes de devolución</span>
              <p className="text-xs text-gray-500">Se notifica cuando solicitan devoluciones</p>
            </span>
          </label>
        </div>
      </div>

      {/* Notificaciones para Usuarios */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Notificaciones para Usuarios
          </h3>
          <div className="space-x-2">
            <button
              onClick={() => toggleAllUser(true)}
              className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              Activar todas
            </button>
            <button
              onClick={() => toggleAllUser(false)}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Desactivar todas
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.userOrderStatus}
              onChange={(e) => handleConfigChange('userOrderStatus', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Estado de pedidos</span>
              <p className="text-xs text-gray-500">Se notifica sobre cambios en el estado de pedidos</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.userDeliveryUpdates}
              onChange={(e) => handleConfigChange('userDeliveryUpdates', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Actualizaciones de entrega</span>
              <p className="text-xs text-gray-500">Se notifica sobre el progreso de entregas</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.userPromotions}
              onChange={(e) => handleConfigChange('userPromotions', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Promociones y ofertas</span>
              <p className="text-xs text-gray-500">Se notifica sobre ofertas especiales</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.userAccountChanges}
              onChange={(e) => handleConfigChange('userAccountChanges', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Cambios en la cuenta</span>
              <p className="text-xs text-gray-500">Se notifica sobre modificaciones de perfil</p>
            </span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.userPasswordChanges}
              onChange={(e) => handleConfigChange('userPasswordChanges', e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-3">
              <span className="text-sm font-medium text-gray-700">Cambios de contraseña</span>
              <p className="text-xs text-gray-500">Se notifica cuando cambian la contraseña</p>
            </span>
          </label>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Recomendaciones</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Mantenga activadas las notificaciones críticas (pagos fallidos, stock bajo)</li>
          <li>• Las promociones pueden generar muchos emails - úselas con moderación</li>
          <li>• Los vendedores necesitan saber sobre nuevos pedidos y mensajes inmediatamente</li>
          <li>• Los usuarios aprecian las actualizaciones de estado de sus pedidos</li>
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

export default NotificationConfiguration;