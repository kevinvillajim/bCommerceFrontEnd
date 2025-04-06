import React, {useState, useEffect} from "react";
import Table from "../../components/dashboard/Table";
import {
	Folder,
	FolderPlus,
	Edit,
	Trash2,
	Star,
	Filter,
	RefreshCw,
	EyeOff,
	Eye,
	ArrowUpRight,
	FolderTree,
	Plus,
} from "lucide-react";
import {Link} from "react-router-dom";
import type {Category} from "../../../core/domain/entities/Category";

// Datos simulados para categorías
const mockCategories: Category[] = [
	{
		id: 1,
		name: "Electrónica",
		slug: "electronica",
		description: "Categoría principal de productos electrónicos",
		parent_id: null || 0,
		icon: "device",
		image: "electronics.jpg",
		order: 1,
		is_active: true,
		featured: true,
		created_at: "2023-01-10T10:00:00Z",
		updated_at: "2023-11-01T14:30:00Z",
		product_count: 156,
		has_children: true,
	},
	{
		id: 2,
		name: "Móviles y Tablets",
		slug: "moviles-y-tablets",
		description: "Smartphones, tablets y accesorios",
		parent_id: 1,
		icon: "phone",
		image: "mobile.jpg",
		order: 1,
		is_active: true,
		featured: true,
		created_at: "2023-01-12T11:20:00Z",
		updated_at: "2023-10-15T09:40:00Z",
		product_count: 48,
		has_children: false,
	},
	{
		id: 3,
		name: "Informática",
		slug: "informatica",
		description: "Ordenadores, componentes y periféricos",
		parent_id: 1,
		icon: "laptop",
		image: "computers.jpg",
		order: 2,
		is_active: true,
		featured: false,
		created_at: "2023-01-15T14:00:00Z",
		updated_at: "2023-10-20T16:15:00Z",
		product_count: 72,
		has_children: true,
	},
	{
		id: 4,
		name: "Audio",
		slug: "audio",
		description: "Equipos de audio, auriculares y accesorios",
		parent_id: 1,
		icon: "headphones",
		image: "audio.jpg",
		order: 3,
		is_active: true,
		featured: false,
		created_at: "2023-01-18T09:30:00Z",
		updated_at: "2023-09-05T11:10:00Z",
		product_count: 36,
		has_children: false,
	},
	{
		id: 5,
		name: "Accesorios",
		slug: "accesorios",
		description: "Accesorios para dispositivos electrónicos",
		parent_id: 1,
		icon: "cable",
		image: "accessories.jpg",
		order: 4,
		is_active: true,
		featured: false,
		created_at: "2023-01-20T15:45:00Z",
		updated_at: "2023-10-10T08:20:00Z",
		product_count: 94,
		has_children: false,
	},
	{
		id: 6,
		name: "Moda",
		slug: "moda",
		description: "Ropa, calzado y accesorios de moda",
		parent_id: null || 0,
		icon: "shirt",
		image: "fashion.jpg",
		order: 2,
		is_active: true,
		featured: true,
		created_at: "2023-02-05T10:15:00Z",
		updated_at: "2023-10-18T13:25:00Z",
		product_count: 210,
		has_children: true,
	},
	{
		id: 7,
		name: "Ropa Hombre",
		slug: "ropa-hombre",
		description: "Ropa y calzado para hombre",
		parent_id: 6,
		icon: "man",
		image: "menswear.jpg",
		order: 1,
		is_active: true,
		featured: false,
		created_at: "2023-02-08T11:30:00Z",
		updated_at: "2023-09-12T14:40:00Z",
		product_count: 85,
		has_children: false,
	},
	{
		id: 8,
		name: "Ropa Mujer",
		slug: "ropa-mujer",
		description: "Ropa y calzado para mujer",
		parent_id: 6,
		icon: "woman",
		image: "womenswear.jpg",
		order: 2,
		is_active: true,
		featured: false,
		created_at: "2023-02-10T09:20:00Z",
		updated_at: "2023-09-15T16:50:00Z",
		product_count: 125,
		has_children: false,
	},
	{
		id: 9,
		name: "Portátiles",
		slug: "portatiles",
		description: "Ordenadores portátiles y accesorios",
		parent_id: 3,
		icon: "laptop",
		image: "laptops.jpg",
		order: 1,
		is_active: true,
		featured: false,
		created_at: "2023-03-15T13:40:00Z",
		updated_at: "2023-10-05T15:20:00Z",
		product_count: 45,
		has_children: false,
	},
	{
		id: 10,
		name: "Componentes PC",
		slug: "componentes-pc",
		description: "Componentes para ordenadores de sobremesa",
		parent_id: 3,
		icon: "cpu",
		image: "components.jpg",
		order: 2,
		is_active: false,
		featured: false,
		created_at: "2023-03-20T10:30:00Z",
		updated_at: "2023-08-25T09:15:00Z",
		product_count: 27,
		has_children: false,
	},
];

const AdminCategoriesPage: React.FC = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);
	const [parentFilter, setParentFilter] = useState<number | null>(null); // null = Todas
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [viewMode, setViewMode] = useState<"all" | "tree">("all");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Cargar datos de categorías
	useEffect(() => {
		const fetchCategories = () => {
			setLoading(true);
			// Simulación de llamada a API
			setTimeout(() => {
				setCategories(mockCategories);
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalItems: mockCategories.length,
					itemsPerPage: 10,
				});
				setLoading(false);
			}, 500);
		};

		fetchCategories();
	}, []);

	// Filtrar categorías
	const filteredCategories = categories.filter((category) => {
		const matchesParent =
			parentFilter === null || category.parent_id === parentFilter;
		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "active" && category.is_active) ||
			(statusFilter === "inactive" && !category.is_active);

		return matchesParent && matchesStatus;
	});

	// Obtener categorías padres para el filtro
	const parentCategories = categories.filter(
		(category) => category.parent_id === null
	);

	// Destacar/Quitar destacado de categoría
	const toggleFeatured = (categoryId: number) => {
		setCategories((prevCategories) =>
			prevCategories.map((category) => {
				if (category.id === categoryId) {
					return {...category, featured: !category.featured};
				}
				return category;
			})
		);
	};

	// Cambiar estado de activación
	const toggleActive = (categoryId: number) => {
		setCategories((prevCategories) =>
			prevCategories.map((category) => {
				if (category.id === categoryId) {
					return {...category, is_active: !category.is_active};
				}
				return category;
			})
		);
	};

	// Eliminar categoría
	const deleteCategory = (categoryId: number) => {
		// Verificar si hay categorías hijas
		const hasChildren = categories.some((cat) => cat.parent_id === categoryId);

		if (hasChildren) {
			alert(
				"Esta categoría tiene subcategorías. Debes eliminar primero las subcategorías."
			);
			return;
		}

		if (
			window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")
		) {
			setCategories((prevCategories) =>
				prevCategories.filter((category) => category.id !== categoryId)
			);
		}
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
		// En una app real, aquí obtendrías los datos para la nueva página
	};

	// Refrescar datos
	const refreshData = () => {
		setLoading(true);
		// Simular recarga de datos
		setTimeout(() => {
			setLoading(false);
		}, 500);
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "category",
			header: "Categoría",
			sortable: true,
			render: (category: Category) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
						{category.image ? (
							<img
								src={`/images/categories/${category.image}`}
								alt={category.name}
								className="h-10 w-10 object-cover"
								onError={(e) => {
									(e.target as HTMLImageElement).src =
										"https://via.placeholder.com/100?text=Categoría";
								}}
							/>
						) : (
							<Folder className="h-6 w-6 text-gray-500 dark:text-gray-400" />
						)}
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
							{category.name}
							{category.featured && (
								<span className="ml-2">
									<Star className="h-4 w-4 text-yellow-500 inline" />
								</span>
							)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
							ID: {category.id}
							{category.parent_id && (
								<span className="ml-2">
									Padre:{" "}
									{categories.find((c) => c.id === category.parent_id)?.name ||
										"Desconocido"}
								</span>
							)}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "slug",
			header: "Slug",
			sortable: true,
			render: (category: Category) => (
				<div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
					{category.slug}
				</div>
			),
		},
		{
			key: "products",
			header: "Productos",
			sortable: true,
			render: (category: Category) => (
				<div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
					{category.product_count || 0}
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (category: Category) => (
				<span
					className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
						category.is_active
							? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
							: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
					}`}
				>
					{category.is_active ? (
						<>
							<Eye className="w-3 h-3 mr-1" />
							Activa
						</>
					) : (
						<>
							<EyeOff className="w-3 h-3 mr-1" />
							Inactiva
						</>
					)}
				</span>
			),
		},
		{
			key: "children",
			header: "Subcategorías",
			render: (category: Category) => (
				<div>
					{category.has_children ? (
						<Link
							to="#"
							onClick={() => setParentFilter(category.id || null)}
							className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline flex items-center"
						>
							<FolderTree className="h-4 w-4 mr-1" />
							Ver subcategorías
						</Link>
					) : (
						<span className="text-gray-500 dark:text-gray-400 text-sm">
							Sin subcategorías
						</span>
					)}
				</div>
			),
		},
		{
			key: "order",
			header: "Orden",
			sortable: true,
			render: (category: Category) => (
				<div className="text-center">{category.order || "-"}</div>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (category: Category) => (
				<div className="flex justify-end space-x-2">
					{/* Botón para ver página de categoría */}
					<Link
						to={`/categories/${category.slug}`}
						target="_blank"
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
						title="Ver en tienda"
					>
						<ArrowUpRight size={18} />
					</Link>

					{/* Botón para editar categoría */}
					<Link
						to={`/admin/categories/edit/${category.id}`}
						className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-md dark:text-yellow-400 dark:hover:bg-yellow-900"
						title="Editar categoría"
					>
						<Edit size={18} />
					</Link>

					{/* Botón para destacar/quitar destacado */}
					<button
						onClick={() => toggleFeatured(category.id || 0)}
						className={`p-1 rounded-md ${
							category.featured
								? "text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900"
								: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
						}`}
						title={
							category.featured ? "Quitar destacado" : "Destacar categoría"
						}
					>
						<Star size={18} />
					</button>

					{/* Botón para activar/desactivar */}
					<button
						onClick={() => toggleActive(category.id || 0)}
						className={`p-1 rounded-md ${
							category.is_active
								? "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
								: "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
						}`}
						title={category.is_active ? "Desactivar" : "Activar"}
					>
						{category.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
					</button>

					{/* Botón para añadir subcategoría */}
					<Link
						to={`/admin/categories/create?parent=${category.id}`}
						className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
						title="Añadir subcategoría"
					>
						<Plus size={18} />
					</Link>

					{/* Botón para eliminar */}
					<button
						onClick={() => deleteCategory(category.id || 0)}
						className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
						title="Eliminar categoría"
					>
						<Trash2 size={18} />
					</button>
				</div>
			),
		},
	];

	// Renderizado condicional dependiendo del modo de vista (para futura implementación)
	const renderCategoriesView = () => {
		if (viewMode === "tree") {
			// En una implementación real, aquí renderizaríamos una vista de árbol
			return (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
					<h3 className="text-lg font-medium mb-4">
						Vista de árbol de categorías
					</h3>
					<p className="text-gray-500 dark:text-gray-400">
						Esta vista está en desarrollo. Por favor, utilice la vista de tabla.
					</p>
				</div>
			);
		}

		// Vista de tabla por defecto
		return (
			<Table
				data={filteredCategories}
				columns={columns}
				searchFields={["name", "slug", "description"]}
				loading={loading}
				emptyMessage="No se encontraron categorías"
				pagination={{
					currentPage: pagination.currentPage,
					totalPages: pagination.totalPages,
					totalItems: pagination.totalItems,
					itemsPerPage: pagination.itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>
		);
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Gestión de Categorías
				</h1>
				<div className="flex space-x-2">
					<Link
						to="/admin/categories/create"
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						<FolderPlus className="inline w-5 h-5 mr-1" />
						Nueva Categoría
					</Link>
					<button
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
					>
						<RefreshCw size={18} className="inline mr-2" />
						Actualizar
					</button>
				</div>
			</div>

			{/* Filtros */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Filtro de Categoría Padre */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={parentFilter === null ? "null" : parentFilter}
							onChange={(e) =>
								setParentFilter(
									e.target.value === "null" ? null : Number(e.target.value)
								)
							}
						>
							<option value="null">Todas las categorías</option>
							<option value="null">Categorías principales</option>
							{parentCategories.map((category) => (
								<option key={category.id} value={category.id}>
									Subcategorías de {category.name}
								</option>
							))}
						</select>
					</div>

					{/* Filtro de Estado */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los Estados</option>
							<option value="active">Activas</option>
							<option value="inactive">Inactivas</option>
						</select>
					</div>

					{/* Selector de modo de vista */}
					<div className="flex items-center space-x-2 ml-auto">
						<span className="text-sm text-gray-600 dark:text-gray-400">
							Vista:
						</span>
						<div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
							<button
								className={`px-3 py-1 text-sm ${
									viewMode === "all"
										? "bg-primary-600 text-white"
										: "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
								}`}
								onClick={() => setViewMode("all")}
							>
								Tabla
							</button>
							<button
								className={`px-3 py-1 text-sm ${
									viewMode === "tree"
										? "bg-primary-600 text-white"
										: "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
								}`}
								onClick={() => setViewMode("tree")}
							>
								Árbol
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Vista de Categorías */}
			{renderCategoriesView()}
		</div>
	);
};

export default AdminCategoriesPage;
