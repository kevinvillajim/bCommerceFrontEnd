import React, {useState, useEffect, useCallback} from "react";
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
	Search,
} from "lucide-react";
import {Link} from "react-router-dom";
import type {Category} from "../../../core/domain/entities/Category";

// Hook personalizado
import {useAdminCategories} from "../../hooks/useAdminCategories";

const AdminCategoriesPage: React.FC = () => {
	// Hook de administración de categorías
	const {
		loading,
		error,
		categories,
		mainCategories,
		fetchAllCategories,
		fetchMainCategories,
		deleteCategory,
		toggleActive,
		toggleFeatured,
		clearCategoryCache,
	} = useAdminCategories();

	// Estado local para filtros y paginación
	const [parentFilter, setParentFilter] = useState<number | null>(null); // null = Todas
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [viewMode, setViewMode] = useState<"all" | "tree">("all");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage] = useState<number>(15);

	// Estado para mostrar confirmaciones
	const [loadingAction, setLoadingAction] = useState<number | null>(null);

	// Cargar datos iniciales
	useEffect(() => {
		loadData();
	}, []);

	// Recargar datos cuando cambien los filtros
	useEffect(() => {
		loadData();
	}, [parentFilter, statusFilter, searchTerm]);

	/**
	 * Carga las categorías
	 */
	const loadData = useCallback(async () => {
		try {
			// Preparar filtros
			const filters: any = {};

			if (parentFilter !== null) {
				filters.parent_id = parentFilter;
			}

			if (statusFilter !== "all") {
				filters.is_active = statusFilter === "active";
			}

			if (searchTerm) {
				filters.term = searchTerm;
			}

			// Cargar datos
			await fetchAllCategories(filters);

			// También cargar categorías principales para el filtro
			if (mainCategories.length === 0) {
				await fetchMainCategories(true);
			}
		} catch (error) {
			console.error("Error al cargar categorías:", error);
		}
	}, [
		fetchAllCategories,
		fetchMainCategories,
		parentFilter,
		statusFilter,
		searchTerm,
		mainCategories.length,
	]);

	/**
	 * Filtrar categorías localmente (para funcionalidad adicional)
	 */
	const filteredCategories = categories.filter((category) => {
		// Filtro de búsqueda local adicional si es necesario
		if (
			searchTerm &&
			!category.name.toLowerCase().includes(searchTerm.toLowerCase())
		) {
			return false;
		}

		return true;
	});

	/**
	 * Maneja el cambio de estado destacado
	 */
	const handleToggleFeatured = useCallback(
		async (categoryId: number, currentFeatured: boolean) => {
			setLoadingAction(categoryId);
			try {
				const success = await toggleFeatured(categoryId, !currentFeatured);
				if (!success) {
					alert("Error al cambiar estado destacado de la categoría");
				}
			} catch (error) {
				console.error("Error al cambiar estado destacado:", error);
				alert("Error al cambiar estado destacado de la categoría");
			} finally {
				setLoadingAction(null);
			}
		},
		[toggleFeatured]
	);

	/**
	 * Maneja el cambio de estado activo
	 */
	const handleToggleActive = useCallback(
		async (categoryId: number, currentActive: boolean) => {
			setLoadingAction(categoryId);
			try {
				const success = await toggleActive(categoryId, !currentActive);
				if (!success) {
					alert("Error al cambiar estado activo de la categoría");
				}
			} catch (error) {
				console.error("Error al cambiar estado activo:", error);
				alert("Error al cambiar estado activo de la categoría");
			} finally {
				setLoadingAction(null);
			}
		},
		[toggleActive]
	);

	/**
	 * Maneja la eliminación de una categoría
	 */
	const handleDeleteCategory = useCallback(
		async (categoryId: number, categoryName: string) => {
			// Verificar si hay categorías hijas
			const hasChildren = categories.some(
				(cat) => cat.parent_id === categoryId
			);

			if (hasChildren) {
				alert(
					"Esta categoría tiene subcategorías. Debes eliminar primero las subcategorías."
				);
				return;
			}

			const confirmed = window.confirm(
				`¿Estás seguro de que deseas eliminar la categoría "${categoryName}"?`
			);

			if (confirmed) {
				setLoadingAction(categoryId);
				try {
					const success = await deleteCategory(categoryId);
					if (success) {
						// Recargar datos
						loadData();
					} else {
						alert("Error al eliminar la categoría");
					}
				} catch (error) {
					console.error("Error al eliminar categoría:", error);
					alert("Error al eliminar la categoría");
				} finally {
					setLoadingAction(null);
				}
			}
		},
		[deleteCategory, categories, loadData]
	);

	/**
	 * Refrescar datos
	 */
	const refreshData = useCallback(() => {
		clearCategoryCache();
		loadData();
	}, [clearCategoryCache, loadData]);

	/**
	 * Manejar cambio de página
	 */
	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	/**
	 * Obtener el nombre de la categoría padre
	 */
	const getParentCategoryName = (parentId?: number): string => {
		if (!parentId) return "Sin categoría padre";
		const parent =
			categories.find((c) => c.id === parentId) ||
			mainCategories.find((c) => c.id === parentId);
		return parent ? parent.name : "Categoría padre desconocida";
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "category",
			header: "Categoría",
			sortable: true,
			render: (category: Category) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
						{category.image_url || category.image ? (
							<img
								src={category.image_url || category.image || ""}
								alt={category.name}
								className="h-10 w-10 object-cover"
								onError={(e) => {
									(e.target as HTMLImageElement).src =
										"https://via.placeholder.com/100?text=Categoría";
								}}
							/>
						) : (
							<Folder className="h-6 w-6 text-gray-500" />
						)}
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900 flex items-center">
							{category.name}
							{category.featured && (
								<span className="ml-2">
									<Star className="h-4 w-4 text-yellow-500 inline" />
								</span>
							)}
						</div>
						<div className="text-xs text-gray-500 flex items-center">
							ID: {category.id}
							{category.parent_id && (
								<span className="ml-2">
									Padre: {getParentCategoryName(category.parent_id)}
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
				<div className="text-sm text-gray-500 font-mono">{category.slug}</div>
			),
		},
		{
			key: "products",
			header: "Productos",
			sortable: true,
			render: (category: Category) => (
				<div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
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
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
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
						<button
							onClick={() => setParentFilter(category.id || null)}
							className="text-primary-600 hover:text-primary-800 underline flex items-center"
						>
							<FolderTree className="h-4 w-4 mr-1" />
							Ver subcategorías
						</button>
					) : (
						<span className="text-gray-500 text-sm">Sin subcategorías</span>
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
				<div className="flex justify-end space-x-1">
					{/* Botón para ver página de categoría */}
					<Link
						to={`/categories/${category.slug}`}
						target="_blank"
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
						title="Ver en tienda"
					>
						<ArrowUpRight size={16} />
					</Link>

					{/* Botón para editar categoría */}
					<Link
						to={`/admin/categories/edit/${category.id}`}
						className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-md"
						title="Editar categoría"
					>
						<Edit size={16} />
					</Link>

					{/* Botón para destacar/quitar destacado */}
					<button
						onClick={() =>
							handleToggleFeatured(category.id!, category.featured!)
						}
						disabled={loadingAction === category.id}
						className={`p-1 rounded-md transition-colors ${
							category.featured
								? "text-yellow-600 hover:bg-yellow-100"
								: "text-gray-600 hover:bg-gray-100"
						} ${loadingAction === category.id ? "opacity-50 cursor-not-allowed" : ""}`}
						title={
							category.featured ? "Quitar destacado" : "Destacar categoría"
						}
					>
						<Star size={16} />
					</button>

					{/* Botón para activar/desactivar */}
					<button
						onClick={() =>
							handleToggleActive(category.id!, category.is_active!)
						}
						disabled={loadingAction === category.id}
						className={`p-1 rounded-md transition-colors ${
							category.is_active
								? "text-green-600 hover:bg-green-100"
								: "text-red-600 hover:bg-red-100"
						} ${loadingAction === category.id ? "opacity-50 cursor-not-allowed" : ""}`}
						title={category.is_active ? "Desactivar" : "Activar"}
					>
						{category.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
					</button>

					{/* Botón para añadir subcategoría */}
					<Link
						to={`/admin/categories/create?parent=${category.id}`}
						className="p-1 text-green-600 hover:bg-green-100 rounded-md"
						title="Añadir subcategoría"
					>
						<Plus size={16} />
					</Link>

					{/* Botón para eliminar */}
					<button
						onClick={() => handleDeleteCategory(category.id!, category.name)}
						disabled={loadingAction === category.id}
						className={`p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors ${
							loadingAction === category.id
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						title="Eliminar categoría"
					>
						<Trash2 size={16} />
					</button>
				</div>
			),
		},
	];

	// Calcular paginación
	const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedCategories = filteredCategories.slice(
		startIndex,
		startIndex + itemsPerPage
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Gestión de Categorías
					</h1>
					<p className="text-sm text-gray-600 mt-1">
						{filteredCategories.length} categorías encontradas
					</p>
				</div>
				<div className="flex space-x-2">
					<Link
						to="/admin/categories/create"
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
					>
						<FolderPlus className="w-4 h-4 mr-2" />
						Nueva Categoría
					</Link>
					<button
						onClick={refreshData}
						disabled={loading}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-50"
					>
						<RefreshCw
							size={16}
							className={`mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Actualizar
					</button>
				</div>
			</div>

			{/* Mostrar errores */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					Error: {error}
				</div>
			)}

			{/* Filtros */}
			<div className="bg-white rounded-lg shadow-sm p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Búsqueda */}
					<div className="flex items-center space-x-2">
						<Search className="h-5 w-5 text-gray-500" />
						<input
							type="text"
							placeholder="Buscar categorías..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
						/>
					</div>

					{/* Filtro de Categoría Padre */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
							value={parentFilter === null ? "null" : parentFilter}
							onChange={(e) =>
								setParentFilter(
									e.target.value === "null" ? null : Number(e.target.value)
								)
							}
						>
							<option value="null">Todas las categorías</option>
							<option value={0}>Categorías principales</option>
							{mainCategories.map((category) => (
								<option key={category.id} value={category.id}>
									Subcategorías de {category.name}
								</option>
							))}
						</select>
					</div>

					{/* Filtro de Estado */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los Estados</option>
							<option value="active">Activas</option>
							<option value="inactive">Inactivas</option>
						</select>
					</div>

					{/* Selector de modo de vista */}
					<div className="flex items-center space-x-2">
						<span className="text-sm text-gray-600 whitespace-nowrap">
							Vista:
						</span>
						<div className="flex border border-gray-300 rounded-lg overflow-hidden">
							<button
								className={`px-3 py-1 text-sm ${
									viewMode === "all"
										? "bg-primary-600 text-white"
										: "bg-white text-gray-700"
								}`}
								onClick={() => setViewMode("all")}
							>
								Tabla
							</button>
							<button
								className={`px-3 py-1 text-sm ${
									viewMode === "tree"
										? "bg-primary-600 text-white"
										: "bg-white text-gray-700"
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
			{viewMode === "tree" ? (
				<div className="bg-white rounded-lg shadow-sm p-4">
					<h3 className="text-lg font-medium mb-4">
						Vista de árbol de categorías
					</h3>
					<p className="text-gray-500">
						Esta vista está en desarrollo. Por favor, utilice la vista de tabla.
					</p>
				</div>
			) : (
				<Table
					data={paginatedCategories}
					columns={columns}
					searchFields={[]} // Búsqueda se maneja externamente
					loading={loading}
					emptyMessage="No se encontraron categorías"
					pagination={{
						currentPage: currentPage,
						totalPages: totalPages,
						totalItems: filteredCategories.length,
						itemsPerPage: itemsPerPage,
						onPageChange: handlePageChange,
					}}
				/>
			)}
		</div>
	);
};

export default AdminCategoriesPage;
