import React from "react";
import { useAuth } from "../../hooks/useAuth";
import NotificationPage from "../NotificationPage";

/**
 * Página de notificaciones para administradores
 * Reutiliza el componente NotificationPage que ya maneja roles automáticamente
 */
const AdminNotificationsPage: React.FC = () => {
  const { roleInfo } = useAuth();

  // Verificar que el usuario sea admin
  if (!roleInfo.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acceso no autorizado
          </h1>
          <p className="text-gray-600">
            Esta página es solo para administradores.
          </p>
        </div>
      </div>
    );
  }

  return <NotificationPage />;
};

export default AdminNotificationsPage;
