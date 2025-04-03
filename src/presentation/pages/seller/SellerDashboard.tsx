import React from "react";
import {
	Package,
	ShoppingBag,
	DollarSign,
	TrendingUp,
	Star,
	ArrowUp,
	ArrowDown,
	ChevronRight,
} from "lucide-react";
import {Link} from "react-router-dom";

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
				Seller Dashboard
			</h1>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{/* Total Sales */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Total Sales
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{formatCurrency(dashboardData.totalSales)}
						</p>
						<div
							className={`flex items-center mt-2 ${dashboardData.salesChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
						>
							{dashboardData.salesChange >= 0 ? (
								<ArrowUp size={16} />
							) : (
								<ArrowDown size={16} />
							)}
							<span className="ml-1 text-sm font-medium">
								{Math.abs(dashboardData.salesChange)}% from last month
							</span>
						</div>
					</div>
					<div className="p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
						<DollarSign className="w-6 h-6 text-primary-600 dark:text-primary-400" />
					</div>
				</div>

				{/* Total Orders */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Total Orders
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{dashboardData.totalOrders}
						</p>
						<div
							className={`flex items-center mt-2 ${dashboardData.ordersChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
						>
							{dashboardData.ordersChange >= 0 ? (
								<ArrowUp size={16} />
							) : (
								<ArrowDown size={16} />
							)}
							<span className="ml-1 text-sm font-medium">
								{Math.abs(dashboardData.ordersChange)}% from last month
							</span>
						</div>
					</div>
					<div className="p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
						<ShoppingBag className="w-6 h-6 text-orange-600 dark:text-orange-400" />
					</div>
				</div>

				{/* Product Stats */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Products
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{dashboardData.activeProducts}/{dashboardData.totalProducts}
						</p>
						<div className="flex items-center mt-2 text-gray-600 dark:text-gray-400">
							<span className="text-sm font-medium">
								{dashboardData.activeProducts} active products
							</span>
						</div>
					</div>
					<div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
						<Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
					</div>
				</div>

				{/* Average Rating */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Average Rating
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{dashboardData.averageRating}
						</p>
						<div className="flex items-center mt-2 text-yellow-600 dark:text-yellow-400">
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									size={14}
									fill={
										i < Math.floor(dashboardData.averageRating)
											? "currentColor"
											: "none"
									}
									className={
										i < Math.floor(dashboardData.averageRating)
											? ""
											: "text-gray-300 dark:text-gray-600"
									}
								/>
							))}
						</div>
					</div>
					<div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
						<Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
					</div>
				</div>
			</div>

			{/* Recent Orders & Top Products */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Orders */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white">
							Recent Orders
						</h2>
						<Link
							to="/seller/orders"
							className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center"
						>
							View All <ChevronRight size={16} />
						</Link>
					</div>
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Order ID
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Customer
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Total
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Status
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
												{order.status}
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
							Top Products
						</h2>
						<Link
							to="/seller/products"
							className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center"
						>
							View All <ChevronRight size={16} />
						</Link>
					</div>
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Product
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Units Sold
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Revenue
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
							Pending Orders
						</h3>
					</div>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						You have{" "}
						<span className="font-semibold text-orange-600 dark:text-orange-400">
							{dashboardData.pendingOrders}
						</span>{" "}
						orders waiting to be processed.
					</p>
					<Link
						to="/seller/orders?status=pending"
						className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center"
					>
						Process Orders <ChevronRight size={16} />
					</Link>
				</div>

				{/* Add Product */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="flex items-center mb-4">
						<div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg mr-4">
							<Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							Add New Product
						</h3>
					</div>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Increase your catalog by adding new products to your store.
					</p>
					<Link
						to="/seller/products/create"
						className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center"
					>
						Add Product <ChevronRight size={16} />
					</Link>
				</div>

				{/* Sales Report */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<div className="flex items-center mb-4">
						<div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg mr-4">
							<TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 dark:text-white">
							Sales Reports
						</h3>
					</div>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						View detailed sales reports and analytics for your store.
					</p>
					<Link
						to="/seller/reports"
						className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center"
					>
						View Reports <ChevronRight size={16} />
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SellerDashboard;
