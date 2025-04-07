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
} from "lucide-react";
import DashboardCardList from "../../components/dashboard/DashboardCardList";
import PendingCardList from "../../components/dashboard/PendingCardList";
import AlertCardList from "../../components/dashboard/AlertCardList";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import OrdersTable from '../../components/dashboard/OrdersSimpleTable';
import SellersTable from '../../components/dashboard/SellersSimpleTable';
import type { Order, Seller } from '../../types/dashboard/dataTable/DataTableTypes';

  const cards = [
    {
      title: "Ventas Totales",
      value: formatCurrency(426380.85),
      change: 8.3,
      icon: DollarSign,
      iconBgColor: "bg-green-50 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Usuarios Totales",
      value: 2458,
      change: 15.2,
      icon: Users,
      iconBgColor: "bg-blue-50 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Pedidos Totales",
      value: 3749,
      change: 5.7,
      icon: ShoppingBag,
      iconBgColor: "bg-purple-50 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Productos Activos",
      value: `1186 / 1284`,
      change: Number(((1186 / 1284) * 100).toFixed(1)),
      icon: Package,
      iconBgColor: "bg-yellow-50 dark:bg-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
  ];

  const pendingCardItems = [
	{
	  icon: Star,
	  iconBgColor: "bg-yellow-50 dark:bg-yellow-900",
	  iconColor: "text-yellow-600 dark:text-yellow-400",
	  title: "Valoraciones y Reseñas",
	  description: "14 reseñas pendientes requieren aprobación",
	  linkText: "Moderar Reseñas",
	  linkTo: "/admin/ratings?status=pending",
	},
	{
	  icon: Briefcase,
	  iconBgColor: "bg-blue-50 dark:bg-blue-900",
	  iconColor: "text-blue-600 dark:text-blue-400",
	  title: "Solicitudes de Vendedores",
	  description: "3 solicitudes de verificación de vendedores",
	  linkText: "Ver solicitudes",
	  linkTo: "/admin/sellers?status=pending",
	},
	{
	  icon: MessageSquare,
	  iconBgColor: "bg-purple-50 dark:bg-purple-900",
	  iconColor: "text-purple-600 dark:text-purple-400",
	  title: "Customer Feedback",
	  description: "8 comentarios para revisar",
	  linkText: "Revisar Comentarios",
	  linkTo: "/admin/feedback?status=pending",
	},
  ];

  const alertItems = [
	{
	  icon: AlertTriangle,
	  borderColor: "border-amber-500",
	  bgColor: "bg-amber-50 dark:bg-amber-900/30",
	  iconColor: "text-amber-500",
	  title: "Alerta de Inventario Bajo",
	  description: "15 productos tienen el inventario por debajo del umbral mínimo.",
	  linkText: "Ver productos",
	  linkTo: "/admin/products?lowStock=true",
	  textColor: "text-amber-800 dark:text-amber-200",
	  hoverTextColor: "text-amber-600 dark:hover:text-amber-100",
	},
	{
	  icon: AlertTriangle,
	  borderColor: "border-blue-500",
	  bgColor: "bg-blue-50 dark:bg-blue-900/30",
	  iconColor: "text-blue-500",
	  title: "Mensaje del Desarrollador",
	  description: "La nueva versión (1.0.1) está ya disponible con mejoras de seguridad.",
	  linkText: "Ver detalles de la actualización",
	  linkTo: "/admin/settings/updates",
	  textColor: "text-blue-800 dark:text-blue-200",
	  hoverTextColor: "text-blue-600 dark:hover:text-blue-100",
	},
  ];

  const recentOrders: Order[] = [
    {
      id: "23456",
      date: "2023-11-05",
      customer: "John Doe",
      total: 129.99,
      status: "Completed",
    },
    {
      id: "23455",
      date: "2023-11-05",
      customer: "Jane Smith",
      total: 79.95,
      status: "Processing",
    },
    {
      id: "23454",
      date: "2023-11-04",
      customer: "Mike Johnson",
      total: 55.5,
      status: "Processing",
    },
    {
      id: "23453",
      date: "2023-11-04",
      customer: "Sarah Williams",
      total: 199.99,
      status: "Shipped",
    },
    {
      id: "23452",
      date: "2023-11-03",
      customer: "Alex Brown",
      total: 45.25,
      status: "Completed",
    },
  ];

  const topSellers: Seller[] = [
    {id: 1, name: "TechGizmo Shop", orderCount: 285, revenue: 35420.5},
    {id: 2, name: "Fashion Trends", orderCount: 217, revenue: 28950.25},
    {id: 3, name: "Home Essentials", orderCount: 198, revenue: 22340.75},
    {id: 4, name: "Sports Equipment", orderCount: 156, revenue: 18750.3},
    {id: 5, name: "Beauty World", orderCount: 142, revenue: 15670.45},
  ];
  

const AdminDashboard: React.FC = () => {

  const navigate = useNavigate();
	  const handleOrderClick = (order: Order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  const handleSellerClick = (seller: Seller) => {
    navigate(`/admin/sellers/${seller.id}`);
  };



	return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard Admin
      </h1>
      {/* Stats Cards */}
      <DashboardCardList cards={cards} />
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Pending Moderation
        </h2>
        {/* Pending Moderation Section */}
        <PendingCardList items={pendingCardItems} />
      </div>
      {/* Recent Orders & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <OrdersTable
        orders={recentOrders}
        title="Pedidos Recientes"
        viewAllLink="/admin/orders"
        onOrderClick={handleOrderClick}
        />
        {/* Top Sellers */}
        <SellersTable
        sellers={topSellers}
        title="Mejores Vendedores"
        viewAllLink="/admin/sellers"
        onSellerClick={handleSellerClick}
        />
      </div>
      {/* System Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Alertas del Sistema
          </h2>
        </div>
        <AlertCardList items={alertItems} />
      </div>
    </div>
  );
};

export default AdminDashboard;
