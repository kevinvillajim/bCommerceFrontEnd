import React from "react";
import {
	Package,
	ShoppingBag,
	DollarSign,
	TrendingUp,
	Star,
	ChevronRight,
} from "lucide-react";
import {Link} from "react-router-dom";
import RatingStars from "@/presentation/components/common/RatingStars";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import DashboardCardList from "../../components/dashboard/DashboardCardList";

const cards = [
	{
	  title: "Ventas Totales",
	  value: formatCurrency(12580.45),
	  change: 12.5,
	  icon: DollarSign,
	  iconBgColor: "bg-primary-50 dark:bg-primary-900",
	  iconColor: "text-primary-600 dark:text-primary-400",
	},
	{
	  title: "Pedidos Totales",
	  value: 157,
	  change: 8.2,
	  icon: ShoppingBag,
	  iconBgColor: "bg-orange-50 dark:bg-orange-900",
	  iconColor: "text-orange-600 dark:text-orange-400",
	},
	{
	  title: "Productos Activos",
	  value: `42 / 48`,
	  change: 0,
	  text: `42 productos activos`,
	  icon: Package,
	  iconBgColor: "bg-blue-50 dark:bg-blue-900",
	  iconColor: "text-blue-600 dark:text-blue-400",
	},
	{
	  title: "Promedio de Valoraciones",
	  value: 4.7,
	  change: 0, // o puedes omitirlo si no aplica
	  text: (
		<RatingStars rating={4.7} size={15}/>
	  ),
	  icon: Star,
	  iconBgColor: "bg-yellow-50 dark:bg-yellow-900",
	  iconColor: "text-yellow-600 dark:text-yellow-400",
	},
  ];
  
const SellerDashboard: React.FC = () => {
	// Sample data - would be fetched from your API
	const dashboardData = {
		totalSales: 12580.45,
		salesChange: 12.5,
		totalOrders: 157,
		ordersChange: 8.2,
		totalProducts: 48,
		activeProducts: 42,
		pendingOrders: 12,
		averageRating: 4.7,
		recentOrders: [
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
		],
		topProducts: [
			{id: 1, name: "Wireless Headphones", sold: 42, revenue: 2520.0},
			{id: 2, name: "Smartphone Case", sold: 38, revenue: 569.99},
			{id: 3, name: "Portable Power Bank", sold: 35, revenue: 874.99},
			{id: 4, name: "Smart Watch", sold: 28, revenue: 3135.99},
			{id: 5, name: "Bluetooth Speaker", sold: 25, revenue: 1249.75},
		],
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 2,
		}).format(amount);
	};

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
				Panel del Vendedor
			</h1>

			{/* Stats Cards */}
			<DashboardCardList cards={cards} />

			{/* Recent Orders & Top Products */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Orders */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white">
							Pedidos Recientes
						</h2>
						<Link
							to="/seller/orders"
							className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center"
						>
							Ver Todos <ChevronRight size={16} />
						</Link>
					</div>
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										ID Pedido
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Fecha
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Cliente
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Total
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Estado
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{dashboardData.recentOrders.map((order) => (
									<tr
										key={order.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
											<Link to={`/seller/orders/${order.id}`}>#{order.id}</Link>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{order.date}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
											{order.customer}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{formatCurrency(order.total)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        						${
																			order.status === "Completed"
																				? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
																				: order.status === "Shipped"
																					? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
																					: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
																		}`}
											>
												{order.status === "Completed" && "Completado"}
												{order.status === "Shipped" && "Enviado"}
												{order.status === "Processing" && "En Proceso"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Top Products */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white">
							Productos Más Vendidos
						</h2>
						<Link
							to="/seller/products"
							className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center"
						>
							Ver Todos <ChevronRight size={16} />
						</Link>
					</div>
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Producto
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Unidades Vendidas
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Ingresos
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{dashboardData.topProducts.map((product) => (
									<tr
										key={product.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
											<Link to={`/seller/products/edit/${product.id}`}>
												{product.name}
											</Link>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{product.sold}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{formatCurrency(product.revenue)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Actions Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Pending Orders */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="flex items-center mb-4">
						<div className="p-2 bg-orange-50 dark:bg-orange-900 rounded-lg mr-4">
							<ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							Pedidos Pendientes
						</h3>
					</div>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Tienes{" "}
						<span className="font-semibold text-orange-600 dark:text-orange-400">
							{dashboardData.pendingOrders}
						</span>{" "}
						pedidos esperando ser procesados.
					</p>
					<Link
						to="/seller/orders?status=pending"
						className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center"
					>
						Procesar Pedidos <ChevronRight size={16} />
					</Link>
				</div>

				{/* Add Product */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="flex items-center mb-4">
						<div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg mr-4">
							<Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							Añadir Nuevo Producto
						</h3>
					</div>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Aumenta tu catálogo añadiendo nuevos productos a tu tienda.
					</p>
					<Link
						to="/seller/products/create"
						className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center"
					>
						Añadir Producto <ChevronRight size={16} />
					</Link>
				</div>

				{/* Sales Report */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="flex items-center mb-4">
						<div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg mr-4">
							<TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							Informes de Ventas
						</h3>
					</div>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Consulta informes detallados de ventas y análisis para tu tienda.
					</p>
					<Link
						to="/seller/reports"
						className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center"
					>
						Ver Informes <ChevronRight size={16} />
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SellerDashboard;
