import React, { useState, useEffect } from "react";
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
import ApiClient from "@/infrastructure/api/apiClient";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

interface DashboardData {
	stats: {
		total_sales: number;
		total_orders: number;
		active_products: number;
		total_products: number;
		average_rating: number;
		pending_orders: number;
	};
	recent_orders: Order[];
	top_products: Product[];
}

const SellerDashboard: React.FC = () => {
	const navigate = useNavigate();
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			const response = await ApiClient.get<{status: string; data: DashboardData}>(API_ENDPOINTS.SELLER.DASHBOARD);
			if (response.status === 'success') {
				setDashboardData(response.data);
			} else {
				console.error('Dashboard API returned error:', response);
				// Mantener datos en cero si hay error
				setDashboardData(getDefaultDashboardData());
			}
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
			// En caso de error, mostrar datos en cero
			setDashboardData(getDefaultDashboardData());
		} finally {
			setLoading(false);
		}
	};

	// Función para datos por defecto en caso de error
	const getDefaultDashboardData = (): DashboardData => ({
		stats: {
			total_sales: 0,
			total_orders: 0,
			active_products: 0,
			total_products: 0,
			average_rating: 0,
			pending_orders: 0
		},
		recent_orders: [],
		top_products: []
	});

	const handleOrderClick = (order: Order) => {
		navigate(`/seller/orders/${order.id}`);
	};
	
	const handleProductClick = (product: Product) => {
		navigate(`/seller/products/${product.id}`);
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-gray-900">Panel del Vendedor</h1>
				<div className="text-center py-12">Cargando...</div>
			</div>
		);
	}

	// Usar datos por defecto si no hay dashboardData
	const data = dashboardData || getDefaultDashboardData();

	const cards = [
		{
			title: "Ventas Totales",
			value: formatCurrency(data.stats.total_sales),
			change: 0,
			icon: DollarSign,
			iconBgColor: "bg-primary-50",
			iconColor: "text-primary-600",
		},
		{
			title: "Pedidos Totales",
			value: data.stats.total_orders,
			change: 0,
			icon: ShoppingBag,
			iconBgColor: "bg-orange-50",
			iconColor: "text-orange-600",
		},
		{
			title: "Productos Activos",
			value: `${data.stats.active_products} / ${data.stats.total_products}`,
			change: 0,
			text: `${data.stats.active_products} productos activos`,
			icon: Package,
			iconBgColor: "bg-blue-50",
			iconColor: "text-blue-600",
		},
		{
			title: "Promedio de Valoraciones",
			value: data.stats.average_rating.toFixed(1),
			change: 0,
			text: (
				<RatingStars rating={data.stats.average_rating} size={15}/>
			),
			icon: Star,
			iconBgColor: "bg-yellow-50",
			iconColor: "text-yellow-600",
		},
	];

	const pendingCardItems = [
		{
			icon: ShoppingBag,
			iconBgColor: "bg-orange-50",
			iconColor: "text-orange-600",
			title: "Pedidos Pendientes",
			description:
				`Tienes ${data.stats.pending_orders} pedidos esperando ser procesados.`,
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
			linkTo: "/seller/earnings",
		},
	];

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
					orders={data.recent_orders}
					title="Pedidos Recientes"
					viewAllLink="/seller/orders"
					onOrderClick={handleOrderClick}
				/>
				{/* Top Products */}
				<TopProductsTable
					products={data.top_products}
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
