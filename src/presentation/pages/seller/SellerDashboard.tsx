import React from "react";
import {useNavigate} from "react-router" 
import {
	Package,
	ShoppingBag,
	DollarSign,
	TrendingUp,
	Star,
} from "lucide-react";
import RatingStars from "@/presentation/components/common/RatingStars";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import DashboardCardList from "../../components/dashboard/DashboardCardList";
import PendingCardList from "../../components/dashboard/PendingCardList";
import RecentOrdersTable from "../../components/dashboard/RecentOrdersTable";
import TopProductsTable from "../../components/dashboard/TopProductsTable";
import type {
	Order,
	Product,
} from "../../types/dashboard/dataTable/DataTableTypes";

const cards = [
	{
	  title: "Ventas Totales",
	  value: formatCurrency(12580.45),
	  change: 12.5,
	  icon: DollarSign,
	  iconBgColor: "bg-primary-50",
	  iconColor: "text-primary-600",
	},
	{
	  title: "Pedidos Totales",
	  value: 157,
	  change: 8.2,
	  icon: ShoppingBag,
	  iconBgColor: "bg-orange-50",
	  iconColor: "text-orange-600",
	},
	{
	  title: "Productos Activos",
	  value: `42 / 48`,
	  change: 0,
	  text: `42 productos activos`,
	  icon: Package,
	  iconBgColor: "bg-blue-50",
	  iconColor: "text-blue-600",
	},
	{
	  title: "Promedio de Valoraciones",
	  value: 4.7,
	  change: 0, // o puedes omitirlo si no aplica
	  text: (
		<RatingStars rating={4.7} size={15}/>
	  ),
	  icon: Star,
	  iconBgColor: "bg-yellow-50",
	  iconColor: "text-yellow-600",
	},
];
  
const pendingOrders = 12;
  
  const pendingCardItems = [
		{
			icon: ShoppingBag,
			iconBgColor: "bg-orange-50",
			iconColor: "text-orange-600",
			title: "Pedidos Pendientes",
			description:
				`Tienes ${pendingOrders} pedidos esperando ser procesados.`,
			linkText: "Procesar Pedidos",
			linkTo: "/seller/orders?status=pending",
		},
		{
			icon: Package,
			iconBgColor: "bg-blue-50",
			iconColor: "text-blue-600",
			title: "Añadir Nuevo Producto",
			description:
				"Aumenta tu catálogo añadiendo nuevos productos a tu tienda.",
			linkText: "Añadir Producto",
			linkTo: "/seller/products/create",
		},
		{
			icon: TrendingUp,
			iconBgColor: "bg-green-50",
			iconColor: "text-green-600",
			title: "Informes de Ventas",
			description:
				"Consulta informes detallados de ventas y análisis para tu tienda.",
			linkText: "Ver Informes",
			linkTo: "/seller/reports",
		},
];

	
const topProducts: Product[] = [
	{id: 101, name: "Auriculares Inalámbricos", sold: 340, revenue: 10200.75},
	{id: 102, name: "Smartwatch Pro", sold: 290, revenue: 17450.5},
	{id: 103, name: "Altavoz Bluetooth", sold: 250, revenue: 6250.0},
	{id: 104, name: "Cámara de Seguridad", sold: 180, revenue: 9450.2},
	{id: 105, name: "Teclado Mecánico RGB", sold: 150, revenue: 4875.99},
];

const recentOrders: Order[] = [
			{
				id: "12345",
				date: "2023-11-05",
				customer: "John Doe",
				total: 129.99,
				status: "Completed",
			},
			{
				id: "12344",
				date: "2023-11-05",
				customer: "Jane Smith",
				total: 79.95,
				status: "Processing",
			},
			{
				id: "12343",
				date: "2023-11-04",
				customer: "Mike Johnson",
				total: 55.5,
				status: "Processing",
			},
			{
				id: "12342",
				date: "2023-11-03",
				customer: "Sarah Williams",
				total: 199.99,
				status: "Shipped",
			},
			{
				id: "12341",
				date: "2023-11-02",
				customer: "Alex Brown",
				total: 45.25,
				status: "Completed",
			},
		]




const SellerDashboard: React.FC = () => {
	
	 const navigate = useNavigate();
		const handleOrderClick = (order: Order) => {
			navigate(`/admin/orders/${order.id}`);
	};
	
	  const handleProductClick = (product: Product) => {
			navigate(`/seller/${product.id}`);
		};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-gray-900">
				Panel del Vendedor
			</h1>

			{/* Stats Cards */}
			<DashboardCardList cards={cards} />

			{/* Recent Orders & Top Products */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Orders */}
				<RecentOrdersTable
					orders={recentOrders}
					title="Pedidos Recientes"
					viewAllLink="/seller/orders"
					onOrderClick={handleOrderClick}
				/>
				{/* Top Products */}
				<TopProductsTable
					products={topProducts}
					title="Productos Más Vendidos"
					viewAllLink="/seller/products"
					onProductClick={handleProductClick}
				/>
			</div>

			{/* Actions Cards */}
			<PendingCardList items={pendingCardItems} color={true} />
		</div>
	);
};

export default SellerDashboard;
