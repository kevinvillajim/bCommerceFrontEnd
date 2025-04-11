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
import useSellerProducts from "../../hooks/useSellerProducts";
import useCategories from "../../hooks/useCategories";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";

// Adaptador para productos en la tabla
interface ProductTableItem {
	id: number;
	name: string;
	price: number;
	stock: number;
	category: string;
	categoryId: number;
	status: "active" | "inactive" | "draft";
	createdAt: string;
}

const SellerProductsPage: React.FC = () => {
	// Estado y hooks
	const {
		products,
		loading,
		error,
		fetchSellerProducts,
		deleteProduct,
		toggleProductStatus,
	} = useSellerProducts();

	const {categories, fetchCategories} = useCategories();
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [adaptedProducts, setAdaptedProducts] = useState<ProductTableItem[]>(
		[]
	);

	// Cargar categorías al iniciar
	useEffect(() => {
		fetchCategories();
	}, [fetchCategories]);

	// Adaptar productos de la API al formato de la tabla
	useEffect(() => {
		if (products && products.length > 0) {
			// Crear un mapa de IDs de categoría a nombres para búsqueda rápida
			const categoryMap = new Map();
			categories.forEach((category) => {
				if (category.id) {
					categoryMap.set(category.id, category.name);
				}
			});

			const tableProducts = products.map((product) => {
				// Obtener categoría del mapa o mostrar el ID si no se encuentra
				const categoryId = product.category_id || 0;
				const categoryName =
					categoryMap.get(categoryId) || `Categoría ${categoryId}`;

				return {
					id: product.id || 0,
					name: product.name,
					price:
						typeof product.price === "number"
							? product.price
							: parseFloat(String(product.price)) || 0,
					stock:
						typeof product.stock === "number"
							? product.stock
							: parseInt(String(product.stock)) || 0,
					categoryId: categoryId,
					category: categoryName,
					status:
						(product.status as "active" | "inactive" | "draft") || "inactive",
					createdAt:
						product.created_at ||
						new Date().toISOString().split("T")[0],
				};
			});
			setAdaptedProducts(tableProducts);
		} else {
			setAdaptedProducts([]);
		}
	}, [products, categories]);

	// Filtrar productos basados en búsqueda y estado
	const filteredProducts = adaptedProducts.filter((product) => {
		const matchesSearch =
			product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.category.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesStatus =
			statusFilter === "all" || product.status === statusFilter;

		return matchesSearch && matchesStatus;
	});

	// Manejar eliminación de producto
	const handleDelete = async (id: number) => {
		if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
			const success = await deleteProduct(id);
			if (!success) {
				// Manejar error de eliminación
				alert("No se pudo eliminar el producto. Inténtalo de nuevo más tarde.");
			}
		}
	};

	// Cambiar estado del producto (activar/desactivar)
	const handleToggleStatus = async (
		id: number,
		currentStatus: "active" | "inactive" | "draft"
	) => {
		const success = await toggleProductStatus(id, currentStatus);
		if (!success) {
			alert(
				"No se pudo cambiar el estado del producto. Inténtalo de nuevo más tarde."
			);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Mis Productos
				</h1>
				<Link
					to="/seller/products/create"
					className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
				>
					<PlusCircle size={18} className="mr-2" />
					Añadir Nuevo Producto
				</Link>
			</div>

			{/* Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Search */}
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Buscar productos..."
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
							<option value="all">Todos los Estados</option>
							<option value="active">Activo</option>
							<option value="inactive">Inactivo</option>
							<option value="draft">Borrador</option>
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
				) : error ? (
					<div className="p-8 text-center">
						<Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							Error al cargar productos
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
						<button
							onClick={() => fetchSellerProducts()}
							className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						>
							Intentar de nuevo
						</button>
					</div>
				) : filteredProducts.length === 0 ? (
					<div className="p-8 text-center">
						<Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
							No se encontraron productos
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-4">
							{searchTerm || statusFilter !== "all"
								? "Intenta ajustar tu búsqueda o filtro para encontrar lo que buscas."
								: "Comienza agregando tu primer producto."}
						</p>
						<Link
							to="/seller/products/create"
							className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						>
							<PlusCircle size={18} className="mr-2" />
							Añadir Nuevo Producto
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
										Producto
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Categoría
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Precio
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
										Estado
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Creado
									</th>
									<th
										scope="col"
										className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Acciones
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
												{product.category || "Sin categoría"}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900 dark:text-white">
												{formatCurrency(product.price)}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div
												className={`text-sm ${product.stock > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
											>
												{product.stock > 0 ? product.stock : "Sin stock"}
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
												{product.status === "active" && "Activo"}
												{product.status === "inactive" && "Inactivo"}
												{product.status === "draft" && "Borrador"}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{product.createdAt}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex justify-end space-x-2">
												<button
													onClick={() =>
														handleToggleStatus(product.id, product.status)
													}
													className={`p-1 rounded-md ${
														product.status === "active"
															? "text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900"
															: "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
													}`}
													title={
														product.status === "active"
															? "Desactivar"
															: "Activar"
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
													title="Editar producto"
												>
													<Edit size={18} />
												</Link>
												<button
													onClick={() => handleDelete(product.id)}
													className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
													title="Eliminar producto"
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
