import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {
	Package,
	Edit,
	Trash2,
	Search,
	Filter,
	PlusCircle,
	Eye,
	EyeOff,
} from "lucide-react";

// Example product type
interface Product {
	id: number;
	name: string;
	price: number;
	stock: number;
	category: string;
	status: "active" | "inactive" | "draft";
	createdAt: string;
}

const SellerProductsPage: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// Fetch products data - replace with actual API call
	useEffect(() => {
		// Simulate API call
		const fetchProducts = () => {
			setLoading(true);

			// Mock data
			const mockProducts: Product[] = [
				{
					id: 1,
					name: "Wireless Earbuds",
					price: 59.99,
					stock: 32,
					category: "Electronics",
					status: "active",
					createdAt: "2023-10-15",
				},
				{
					id: 2,
					name: "Smartphone Case",
					price: 19.99,
					stock: 65,
					category: "Accessories",
					status: "active",
					createdAt: "2023-10-12",
				},
				{
					id: 3,
					name: "Bluetooth Speaker",
					price: 49.99,
					stock: 18,
					category: "Electronics",
					status: "active",
					createdAt: "2023-10-05",
				},
				{
					id: 4,
					name: "Gaming Mouse",
					price: 29.99,
					stock: 42,
					category: "Computers",
					status: "active",
					createdAt: "2023-09-28",
				},
				{
					id: 5,
					name: "Desk Lamp",
					price: 24.99,
					stock: 27,
					category: "Home",
					status: "inactive",
					createdAt: "2023-09-20",
				},
				{
					id: 6,
					name: "USB-C Cable",
					price: 9.99,
					stock: 120,
					category: "Accessories",
					status: "active",
					createdAt: "2023-09-15",
				},
				{
					id: 7,
					name: "Mechanical Keyboard",
					price: 89.99,
					stock: 15,
					category: "Computers",
					status: "active",
					createdAt: "2023-09-10",
				},
				{
					id: 8,
					name: "Smart Watch",
					price: 129.99,
					stock: 8,
					category: "Electronics",
					status: "active",
					createdAt: "2023-09-05",
				},
				{
					id: 9,
					name: "External Hard Drive",
					price: 79.99,
					stock: 0,
					category: "Computers",
					status: "inactive",
					createdAt: "2023-08-28",
				},
				{
					id: 10,
					name: "Wireless Charger",
					price: 34.99,
					stock: 22,
					category: "Electronics",
					status: "draft",
					createdAt: "2023-08-20",
				},
			];

			setTimeout(() => {
				setProducts(mockProducts);
				setLoading(false);
			}, 500); // Simulate network delay
		};

		fetchProducts();
	}, []);

	// Filter products based on search term and status filter
	const filteredProducts = products.filter((product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.category.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || product.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// Format price
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(price);
	};

	// Handle product deletion
	const handleDelete = (id: number) => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			// In a real app, you would make an API call here
			setProducts(products.filter((product) => product.id !== id));
		}
	};

	// Toggle product status
	const toggleStatus = (id: number) => {
		setProducts(
			products.map((product) => {
				if (product.id === id) {
					const newStatus = product.status === "active" ? "inactive" : "active";
					return {...product, status: newStatus};
				}
				return product;
			})
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					My Products
				</h1>
				<Link
					to="/seller/products/create"
					className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
				>
					<PlusCircle size={18} className="mr-2" />
					Add New Product
				</Link>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Search products..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					</div>

					{/* Status Filter */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">All Status</option>
							<option value="active">Active</option>
							<option value="inactive">Inactive</option>
							<option value="draft">Draft</option>
						</select>
					</div>
				</div>
			</div>

			{/* Products Table */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
				{loading ? (
					<div className="p-8 flex justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="p-8 text-center">
						<Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							No products found
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-4">
							{searchTerm
								? "Try adjusting your search or filter to find what you're looking for."
								: "Get started by adding your first product."}
						</p>
						<Link
							to="/seller/products/create"
							className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						>
							<PlusCircle size={18} className="mr-2" />
							Add New Product
						</Link>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Product
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Category
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Price
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Stock
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
										Created
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
								{filteredProducts.map((product) => (
									<tr
										key={product.id}
										className="hover:bg-gray-50 dark:hover:bg-gray-700"
									>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
													<Package className="h-6 w-6 text-gray-500 dark:text-gray-400" />
												</div>
												<div className="ml-4">
													<div className="text-sm font-medium text-gray-900 dark:text-white">
														{product.name}
													</div>
													<div className="text-sm text-gray-500 dark:text-gray-400">
														ID: {product.id}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900 dark:text-white">
												{product.category}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900 dark:text-white">
												{formatPrice(product.price)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={`text-sm ${product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
											>
												{product.stock > 0 ? product.stock : "Out of stock"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
													product.status === "active"
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: product.status === "inactive"
															? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
															: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
												}`}
											>
												{product.status.charAt(0).toUpperCase() +
													product.status.slice(1)}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{product.createdAt}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() => toggleStatus(product.id)}
													className={`p-1 rounded-md ${
														product.status === "active"
															? "text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900"
															: "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
													}`}
													title={
														product.status === "active"
															? "Deactivate"
															: "Activate"
													}
												>
													{product.status === "active" ? (
														<EyeOff size={18} />
													) : (
														<Eye size={18} />
													)}
												</button>
												<Link
													to={`/seller/products/edit/${product.id}`}
													className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
													title="Edit product"
												>
													<Edit size={18} />
												</Link>
												<button
													onClick={() => handleDelete(product.id)}
													className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
													title="Delete product"
												>
													<Trash2 size={18} />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
};

export default SellerProductsPage;
