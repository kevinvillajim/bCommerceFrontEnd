import React from "react";
import {
	DollarSign,
	Users,
	ShoppingBag,
	Package,
	ArrowUp,
	ArrowDown,
	AlertTriangle,
	ChevronRight,
	Briefcase,
	Star,
	MessageSquare,
} from "lucide-react";
import {Link} from "react-router-dom";

const AdminDashboard: React.FC = () => {
	// Sample data - would be fetched from your API
	const dashboardData = {
		totalSales: 426380.85,
		salesChange: 8.3,
		totalUsers: 2458,
		usersChange: 15.2,
		totalOrders: 3749,
		ordersChange: 5.7,
		totalProducts: 1284,
		activeProducts: 1186,
		pendingModeration: {
			ratings: 14,
			sellerRequests: 3,
			feedback: 8,
		},
		recentOrders: [
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
		],
		topSellers: [
			{id: 1, name: "TechGizmo Shop", orderCount: 285, revenue: 35420.5},
			{id: 2, name: "Fashion Trends", orderCount: 217, revenue: 28950.25},
			{id: 3, name: "Home Essentials", orderCount: 198, revenue: 22340.75},
			{id: 4, name: "Sports Equipment", orderCount: 156, revenue: 18750.3},
			{id: 5, name: "Beauty World", orderCount: 142, revenue: 15670.45},
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
				Admin Dashboard
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
					<div className="p-3 bg-green-50 dark:bg-green-900 rounded-lg">
						<DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
					</div>
				</div>

				{/* Total Users */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-start justify-between">
					<div>
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400">
							Total Users
						</p>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
							{dashboardData.totalUsers}
						</p>
						<div
							className={`flex items-center mt-2 ${dashboardData.usersChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
						>
							{dashboardData.usersChange >= 0 ? (
								<ArrowUp size={16} />
							) : (
								<ArrowDown size={16} />
							)}
							<span className="ml-1 text-sm font-medium">
								{Math.abs(dashboardData.usersChange)}% from last month
							</span>
						</div>
					</div>
					<div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
						<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
					<div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
						<ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
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
					<div className="p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
						<Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
					</div>
				</div>
			</div>

			{/* Pending Moderation Section */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
					Pending Moderation
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* Pending Ratings */}
					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start">
						<div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg mr-3">
							<Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
						</div>
						<div>
							<h3 className="font-medium text-gray-900 dark:text-white">
								Ratings & Reviews
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
								{dashboardData.pendingModeration.ratings} pending reviews need
								approval
							</p>
							<Link
								to="/admin/ratings?status=pending"
								className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline inline-flex items-center"
							>
								Moderate Reviews <ChevronRight size={16} />
							</Link>
						</div>
					</div>

					{/* Pending Seller Requests */}
					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start">
						<div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg mr-3">
							<Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
						</div>
						<div>
							<h3 className="font-medium text-gray-900 dark:text-white">
								Seller Requests
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
								{dashboardData.pendingModeration.sellerRequests} seller
								verification requests
							</p>
							<Link
								to="/admin/sellers?status=pending"
								className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline inline-flex items-center"
							>
								Review Requests <ChevronRight size={16} />
							</Link>
						</div>
					</div>

					{/* Pending Feedback */}
					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-start">
						<div className="p-2 bg-purple-50 dark:bg-purple-900 rounded-lg mr-3">
							<MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<h3 className="font-medium text-gray-900 dark:text-white">
								Customer Feedback
							</h3>
							<p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
								{dashboardData.pendingModeration.feedback} feedback items to
								review
							</p>
							<Link
								to="/admin/feedback?status=pending"
								className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline inline-flex items-center"
							>
								Review Feedback <ChevronRight size={16} />
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Orders & Top Sellers */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Recent Orders */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white">
							Recent Orders
						</h2>
						<Link
							to="/admin/orders"
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
											<Link to={`/admin/orders/${order.id}`}>#{order.id}</Link>
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

				{/* Top Sellers */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white">
							Top Sellers
						</h2>
						<Link
							to="/admin/sellers"
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
										Seller
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Orders
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Revenue
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{dashboardData.topSellers.map((seller) => (
									<tr
										key={seller.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline">
											<Link to={`/admin/sellers/${seller.id}`}>
												{seller.name}
											</Link>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{seller.orderCount}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{formatCurrency(seller.revenue)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* System Alerts */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
				<div className="flex items-center mb-4">
					<AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
					<h2 className="text-lg font-medium text-gray-900 dark:text-white">
						System Alerts
					</h2>
				</div>

				<div className="space-y-4">
					<div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 rounded-r-lg">
						<div className="flex">
							<div className="flex-shrink-0">
								<AlertTriangle className="h-5 w-5 text-amber-500" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
									Low Inventory Alert
								</h3>
								<div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
									<p>15 products have inventory levels below the threshold.</p>
								</div>
								<div className="mt-3">
									<Link
										to="/admin/products?lowStock=true"
										className="text-sm font-medium text-amber-800 dark:text-amber-200 hover:text-amber-600 dark:hover:text-amber-100"
									>
										View affected products
									</Link>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
						<div className="flex">
							<div className="flex-shrink-0">
								<AlertTriangle className="h-5 w-5 text-blue-500" />
							</div>
							<div className="ml-3">
								<h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
									System Update Available
								</h3>
								<div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
									<p>
										A new version (2.5.3) is available with security
										enhancements.
									</p>
								</div>
								<div className="mt-3">
									<Link
										to="/admin/settings/updates"
										className="text-sm font-medium text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-100"
									>
										View update details
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
