import React from "react";
import { useNavigate } from 'react-router-dom';
import {
	DollarSign,
	Users,
	ShoppingBag,
	Package,
	AlertTriangle,
	Briefcase,
	Star,
	MessageSquare,
	RefreshCw,
	Clock,
} from "lucide-react";
import DashboardCardList from "../../components/dashboard/DashboardCardList";
import PendingCardList from "../../components/dashboard/PendingCardList";
import AlertCardList from "../../components/dashboard/AlertCardList";
import OrdersTable from '../../components/dashboard/OrdersSimpleTable';
import SellersTable from '../../components/dashboard/SellersSimpleTable';
import type { Order, Seller } from '../../types/dashboard/dataTable/DataTableTypes';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

// Component now uses real API data
  

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { transformedData, loading, error, refetch, lastUpdated } = useAdminDashboard(true, 300000); // Auto-refresh every 5 minutes

  const handleOrderClick = (order: Order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  const handleSellerClick = (seller: Seller) => {
    navigate(`/admin/sellers/${seller.id}`);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  // Loading state
  if (loading && !transformedData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
          <span className="text-gray-600">Cargando estadísticas del dashboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !transformedData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error cargando dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transformedData) {
    return null;
  }

  // Icon mapping helper
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      DollarSign,
      Users,
      ShoppingBag,
      Package,
      Star,
      Briefcase,
      MessageSquare,
      AlertTriangle,
    };
    return icons[iconName] || AlertTriangle;
  };

  // Map cards with real icons
  const cardsWithIcons = transformedData.cards.map(card => ({
    ...card,
    icon: getIcon(card.icon),
  }));

  // Map pending items with real icons
  const pendingItemsWithIcons = transformedData.pendingCardItems.map(item => ({
    ...item,
    icon: getIcon(item.icon),
  }));

  // Map alert items with real icons
  const alertItemsWithIcons = transformedData.alertItems.map(item => ({
    ...item,
    icon: getIcon(item.icon),
  }));

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              Actualizado: {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-md transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardCardList cards={cardsWithIcons} />

      {/* Pending Moderation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Moderación Pendiente
        </h2>
        <PendingCardList items={pendingItemsWithIcons} />
      </div>

      {/* Recent Orders & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <OrdersTable
          orders={transformedData.recentOrders}
          title="Pedidos Recientes"
          viewAllLink="/admin/orders"
          onOrderClick={handleOrderClick}
        />
        {/* Top Sellers */}
        <SellersTable
          sellers={transformedData.topSellers}
          title="Mejores Vendedores"
          viewAllLink="/admin/sellers"
          onSellerClick={handleSellerClick}
        />
      </div>

      {/* System Alerts */}
      {alertItemsWithIcons.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">
              Alertas del Sistema
            </h2>
          </div>
          <AlertCardList items={alertItemsWithIcons} />
        </div>
      )}

      {/* Performance Metrics Summary (Optional) */}
      {transformedData.performanceMetrics && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Métricas de Rendimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {transformedData.performanceMetrics.conversion_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Tasa de Conversión</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${transformedData.performanceMetrics.average_order_value.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Valor Promedio de Orden</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {transformedData.performanceMetrics.order_fulfillment_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Tasa de Cumplimiento</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {transformedData.performanceMetrics.customer_retention_rate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Retención de Clientes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
