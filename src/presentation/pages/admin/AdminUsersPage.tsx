import React, {useState, useEffect} from "react";
import {
	Search,
	Filter,
	User,
	Edit,
	Shield,
	Lock,
	Unlock,
	Mail,
	RefreshCw,
} from "lucide-react";

// Example user type
interface UserData {
	id: number;
	name: string;
	email: string;
	role: "customer" | "seller" | "admin";
	status: "active" | "blocked";
	lastLogin: string;
	registeredDate: string;
	ordersCount: number;
}

const AdminUsersPage: React.FC = () => {
	const [users, setUsers] = useState<UserData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 5,
		totalUsers: 0,
	});

	// Fetch users data - replace with actual API call
	useEffect(() => {
		// Simulate API call
		const fetchUsers = () => {
			setLoading(true);

			// Mock data
			const mockUsers: UserData[] = [
				{
					id: 1,
					name: "John Doe",
					email: "john@example.com",
					role: "customer",
					status: "active",
					lastLogin: "2023-11-05",
					registeredDate: "2023-01-15",
					ordersCount: 12,
				},
				{
					id: 2,
					name: "Jane Smith",
					email: "jane@example.com",
					role: "customer",
					status: "active",
					lastLogin: "2023-11-02",
					registeredDate: "2023-02-20",
					ordersCount: 8,
				},
				{
					id: 3,
					name: "Michael Brown",
					email: "michael@example.com",
					role: "seller",
					status: "active",
					lastLogin: "2023-11-04",
					registeredDate: "2023-03-10",
					ordersCount: 0,
				},
				{
					id: 4,
					name: "Sarah Johnson",
					email: "sarah@example.com",
					role: "customer",
					status: "blocked",
					lastLogin: "2023-10-28",
					registeredDate: "2023-04-05",
					ordersCount: 3,
				},
				{
					id: 5,
					name: "David Wilson",
					email: "david@example.com",
					role: "seller",
					status: "active",
					lastLogin: "2023-11-01",
					registeredDate: "2023-05-12",
					ordersCount: 0,
				},
				{
					id: 6,
					name: "Jennifer Lee",
					email: "jennifer@example.com",
					role: "customer",
					status: "active",
					lastLogin: "2023-11-03",
					registeredDate: "2023-06-22",
					ordersCount: 5,
				},
				{
					id: 7,
					name: "Robert Garcia",
					email: "robert@example.com",
					role: "admin",
					status: "active",
					lastLogin: "2023-11-05",
					registeredDate: "2023-07-18",
					ordersCount: 0,
				},
				{
					id: 8,
					name: "Emily Taylor",
					email: "emily@example.com",
					role: "customer",
					status: "active",
					lastLogin: "2023-10-30",
					registeredDate: "2023-08-14",
					ordersCount: 2,
				},
				{
					id: 9,
					name: "Kevin Martinez",
					email: "kevin@example.com",
					role: "customer",
					status: "blocked",
					lastLogin: "2023-10-15",
					registeredDate: "2023-09-28",
					ordersCount: 1,
				},
				{
					id: 10,
					name: "Amanda White",
					email: "amanda@example.com",
					role: "seller",
					status: "active",
					lastLogin: "2023-11-04",
					registeredDate: "2023-10-05",
					ordersCount: 0,
				},
			];

			setTimeout(() => {
				setUsers(mockUsers);
				setPagination({
					currentPage: 1,
					totalPages: 5,
					totalUsers: 48,
				});
				setLoading(false);
			}, 500); // Simulate network delay
		};

		fetchUsers();
	}, []);

	// Filter users based on search term, role filter, and status filter
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesRole = roleFilter === "all" || user.role === roleFilter;
		const matchesStatus =
			statusFilter === "all" || user.status === statusFilter;

		return matchesSearch && matchesRole && matchesStatus;
	});

	// Handle user blocking/unblocking
	const toggleUserStatus = (userId: number) => {
		setUsers((prevUsers) =>
			prevUsers.map((user) =>
				user.id === userId
					? {...user, status: user.status === "active" ? "blocked" : "active"}
					: user
			)
		);
	};

	// Handle send password reset
	const sendPasswordReset = (userId: number) => {
		// In a real app, you would make an API call here
		alert(`Password reset email sent to user #${userId}`);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					User Management
				</h1>
				<div className="flex space-x-2">
					<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
						<RefreshCw size={18} className="inline mr-2" />
						Refresh
					</button>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Search by name or email..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					</div>

					{/* Role Filter */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={roleFilter}
							onChange={(e) => setRoleFilter(e.target.value)}
						>
							<option value="all">All Roles</option>
							<option value="customer">Customer</option>
							<option value="seller">Seller</option>
							<option value="admin">Admin</option>
						</select>
					</div>

					{/* Status Filter */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="blocked">Blocked</option>
						</select>
					</div>
				</div>
			</div>

			{/* Users Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
				{loading ? (
					<div className="p-8 flex justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : filteredUsers.length === 0 ? (
					<div className="p-8 text-center">
						<User className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							No users found
						</h3>
						<p className="text-gray-500 dark:text-gray-400">
							Try adjusting your search or filter to find what you're looking
							for.
						</p>
					</div>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											User
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Role
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Status
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Last Login
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Registered
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Orders
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{filteredUsers.map((user) => (
										<tr
											key={user.id}
											className="hover:bg-gray-50 dark:hover:bg-gray-700"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
														<User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900 dark:text-white">
															{user.name}
														</div>
														<div className="text-sm text-gray-500 dark:text-gray-400">
															{user.email}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														user.role === "admin"
															? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
															: user.role === "seller"
																? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
																: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
													}`}
												>
													{user.role.charAt(0).toUpperCase() +
														user.role.slice(1)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														user.status === "active"
															? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
															: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
													}`}
												>
													{user.status.charAt(0).toUpperCase() +
														user.status.slice(1)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{user.lastLogin}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{user.registeredDate}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{user.ordersCount}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
												<div className="flex justify-end space-x-2">
													<button
														onClick={() => toggleUserStatus(user.id)}
														className={`p-1 rounded-md ${
															user.status === "active"
																? "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
																: "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
														}`}
														title={
															user.status === "active"
																? "Block User"
																: "Unblock User"
														}
													>
														{user.status === "active" ? (
															<Lock size={18} />
														) : (
															<Unlock size={18} />
														)}
													</button>
													<button
														onClick={() => sendPasswordReset(user.id)}
														className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
														title="Send Password Reset"
													>
														<Mail size={18} />
													</button>
													<button
														className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-md dark:text-yellow-400 dark:hover:bg-yellow-900"
														title="Edit User"
													>
														<Edit size={18} />
													</button>
													{user.role !== "admin" && (
														<button
															className="p-1 text-purple-600 hover:bg-purple-100 rounded-md dark:text-purple-400 dark:hover:bg-purple-900"
															title="Make Admin"
														>
															<Shield size={18} />
														</button>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						<div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
							<div className="flex-1 flex justify-between sm:hidden">
								<button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
									Previous
								</button>
								<button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700">
									Next
								</button>
							</div>
							<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
								<div>
									<p className="text-sm text-gray-700 dark:text-gray-300">
										Showing <span className="font-medium">1</span> to{" "}
										<span className="font-medium">{filteredUsers.length}</span>{" "}
										of{" "}
										<span className="font-medium">{pagination.totalUsers}</span>{" "}
										users
									</p>
								</div>
								<div>
									<nav
										className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
										aria-label="Pagination"
									>
										<button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
											<span className="sr-only">Previous</span>
											<svg
												className="h-5 w-5"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
										{[...Array(Math.min(5, pagination.totalPages))].map(
											(_, i) => (
												<button
													key={i}
													className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
														pagination.currentPage === i + 1
															? "z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-500 dark:text-primary-400"
															: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
													}`}
												>
													{i + 1}
												</button>
											)
										)}
										<button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700">
											<span className="sr-only">Next</span>
											<svg
												className="h-5 w-5"
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												aria-hidden="true"
											>
												<path
													fillRule="evenodd"
													d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</nav>
								</div>
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default AdminUsersPage;
