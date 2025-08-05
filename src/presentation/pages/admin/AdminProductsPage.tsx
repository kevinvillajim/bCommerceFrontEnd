import React, {useState, useEffect, useCallback} from "react";
import Table from "../../components/dashboard/Table";
import {
	Tag,
	Eye,
	Edit,
	Trash2,
	Star,
	Filter,
	RefreshCw,
	Archive,
	Clock,
	CheckCircle,
	Plus,
	Search,
} from "lucide-react";
import {Link, useLocation} from "react-router-dom";
import type {Product} from "../../../core/domain/entities/Product";
import type {ExtendedProductFilterParams} from "../../types/ProductFilterParams";

// Hooks personalizados
import {useAdminProducts} from "../../hooks/useAdminProducts";
import {useAdminCategories} from "../../hooks/useAdminCategories";

// Utilities corregidas - USAR SOLO UNA FUENTE
import {getProductMainImage} from "../../../utils/imageManager";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";

const AdminProductsPage: React.FC = () => {
	const location = useLocation();
	
	// Extraer sellerId de la URL si está presente
	const urlParams = new URLSearchParams(location.search);
	const sellerIdFromUrl = urlParams.get('sellerId');
	
	// Hooks de administración
	const {
		loading: productsLoading,
		error: productsError,
		products,
		meta,
		fetchAllProducts,
		deleteProduct,
		toggleFeatured,
		togglePublished,
		clearProductCache,
	} = useAdminProducts();

	const {
		loading: categoriesLoading,
		categories,
		fetchAllCategories,
	} = useAdminCategories();

	// Estado local para filtros y paginación
	const [categoryFilter, setCategoryFilter] = useState<number>(0); // 0 = Todas
	const [sellerFilter, setSellerFilter] = useState<number>(sellerIdFromUrl ? parseInt(sellerIdFromUrl) : 0); // 0 = Todos los vendedores
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [stockFilter, setStockFilter] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [itemsPerPage] = useState<number>(15);

	// Estado para mostrar confirmaciones
	const [loadingAction, setLoadingAction] = useState<number | null>(null);

	// Cargar datos iniciales
	useEffect(() => {
		loadData();
		loadCategories();
	}, []);

	// Cargar datos cuando cambien los filtros
	useEffect(() => {
		loadData();
	}, [categoryFilter, sellerFilter, statusFilter, stockFilter, searchTerm, currentPage]);

	// Actualizar sellerFilter cuando cambie la URL
	useEffect(() => {
		const urlParams = new URLSearchParams(location.search);
		const newSellerId = urlParams.get('sellerId');
		const newSellerIdInt = newSellerId ? parseInt(newSellerId) : 0;
		
		if (newSellerIdInt !== sellerFilter) {
			setSellerFilter(newSellerIdInt);
			setCurrentPage(1); // Reset to first page when filter changes
		}
	}, [location.search, sellerFilter]);

	/**
	 * Carga las categorías
	 */
	const loadCategories = useCallback(async () => {
		try {
			await fetchAllCategories({with_counts: true});
		} catch (error) {
			console.error("Error al cargar categorías:", error);
		}
	}, [fetchAllCategories]);

	/**
	 * Carga los productos con filtros aplicados
	 */
	const loadData = useCallback(async () => {
		console.log("🚀 AdminProductsPage: Iniciando loadData...");
		console.log("📍 AdminProductsPage: Página actual:", currentPage);
		console.log("📍 AdminProductsPage: Items por página:", itemsPerPage);
		try {
			const filterParams: ExtendedProductFilterParams = {
				limit: itemsPerPage,
				offset: (currentPage - 1) * itemsPerPage,
				// NO incluir filtros por defecto - admin debe ver TODOS los productos
			};
			console.log("🔧 AdminProductsPage: FilterParams inicial:", filterParams);

			// Aplicar filtros
			if (searchTerm) {
				filterParams.term = searchTerm;
			}

			if (categoryFilter && categoryFilter > 0) {
				filterParams.categoryId = categoryFilter;
			}

			if (sellerFilter && sellerFilter > 0) {
				filterParams.sellerId = sellerFilter;
			}

			// Filtros de estado - SOLO si se especifica explícitamente
			switch (statusFilter) {
				case "active":
					filterParams.status = "active";
					filterParams.published = true;
					break;
				case "draft":
					filterParams.status = "draft";
					break;
				case "inactive":
					filterParams.published = false;
					break;
				// "all" NO añade filtros - admin ve todo
			}

			// Filtros de stock
			switch (stockFilter) {
				case "inStock":
					filterParams.inStock = true;
					break;
				case "lowStock":
					filterParams.inStock = true;
					// Este filtro se podría implementar en el backend
					break;
				case "outOfStock":
					filterParams.inStock = false;
					break;
				// "all" no añade filtros
			}

			console.log(
				"🔧 AdminProductsPage: Cargando productos con filtros:",
				filterParams
			);
			await fetchAllProducts(filterParams);
		} catch (error) {
			console.error("Error al cargar productos:", error);
		}
	}, [
		fetchAllProducts,
		categoryFilter,
		sellerFilter,
		statusFilter,
		stockFilter,
		searchTerm,
		currentPage,
		itemsPerPage,
	]);

	/**
	 * Maneja la eliminación de un producto
	 */
	const handleDeleteProduct = useCallback(
		async (productId: number, productName: string) => {
			const confirmed = window.confirm(
				`¿Estás seguro de que deseas eliminar el producto "${productName}"?`
			);

			if (confirmed) {
				setLoadingAction(productId);
				try {
					const success = await deleteProduct(productId);
					if (success) {
						// Recargar datos para reflejar cambios
						loadData();
					} else {
						alert("Error al eliminar el producto");
					}
				} catch (error) {
					console.error("Error al eliminar producto:", error);
					alert("Error al eliminar el producto");
				} finally {
					setLoadingAction(null);
				}
			}
		},
		[deleteProduct, loadData]
	);

	/**
	 * Maneja el cambio de estado destacado
	 */
	const handleToggleFeatured = useCallback(
		async (productId: number, currentFeatured: boolean) => {
			setLoadingAction(productId);
			try {
				// PASAR EL VALOR OPUESTO PARA HACER EL TOGGLE
				const newFeaturedValue = !currentFeatured;
				console.log(
					`🌟 Toggling featured for product ${productId}: ${currentFeatured} -> ${newFeaturedValue}`
				);

				const success = await toggleFeatured(productId, newFeaturedValue);
				if (!success) {
					alert("Error al cambiar estado destacado");
				}
			} catch (error) {
				console.error("Error al cambiar estado destacado:", error);
				alert("Error al cambiar estado destacado");
			} finally {
				setLoadingAction(null);
			}
		},
		[toggleFeatured]
	);

	/**
	 * Maneja el cambio de estado de publicación
	 */
	const handleTogglePublished = useCallback(
		async (productId: number, currentPublished: boolean) => {
			setLoadingAction(productId);
			try {
				// PASAR EL VALOR OPUESTO PARA HACER EL TOGGLE
				const newPublishedValue = !currentPublished;
				console.log(
					`📢 Toggling published for product ${productId}: ${currentPublished} -> ${newPublishedValue}`
				);

				const success = await togglePublished(productId, newPublishedValue);
				if (!success) {
					alert("Error al cambiar estado de publicación");
				}
			} catch (error) {
				console.error("Error al cambiar estado de publicación:", error);
				alert("Error al cambiar estado de publicación");
			} finally {
				setLoadingAction(null);
			}
		},
		[togglePublished]
	);

	/**
	 * Refrescar datos
	 */
	const refreshData = useCallback(() => {
		clearProductCache();
		loadData();
	}, [clearProductCache, loadData]);

	/**
	 * Manejar cambio de página
	 */
	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	/**
	 * Obtener el nombre de la categoría por ID
	 */
	const getCategoryName = (categoryId?: number): string => {
		if (!categoryId) return "Sin categoría";
		const category = categories.find((c) => c.id === categoryId);
		return category ? category.name : "Categoría desconocida";
	};

	/**
	 * Componente de imagen mejorado con manejo de errores
	 */
	const ProductImage: React.FC<{product: Product}> = ({product}) => {
		const [imageSrc, setImageSrc] = useState<string>(
			getProductMainImage(product)
		);
		const [hasError, setHasError] = useState<boolean>(false);
		const [errorCount, setErrorCount] = useState<number>(0);

		useEffect(() => {
			setImageSrc(getProductMainImage(product));
			setHasError(false);
			setErrorCount(0);
		}, [product]);

		const handleImageError = useCallback(() => {
			console.warn(
				`Error cargando imagen para producto ${product.id}:`,
				imageSrc
			);

			// Evitar loops infinitos de error
			if (errorCount >= 2) {
				console.warn(
					`Demasiados errores para producto ${product.id}, manteniendo placeholder`
				);
				return;
			}

			setErrorCount((prev) => prev + 1);

			if (!hasError) {
				setHasError(true);
				// Intentar con placeholder pequeño
				setImageSrc(getProductMainImage(null));
			}
		}, [imageSrc, hasError, errorCount, product.id]);

		return (
			<div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
				<img
					src={imageSrc}
					alt={product.name}
					className="h-10 w-10 object-cover"
					onError={handleImageError}
					loading="lazy"
				/>
			</div>
		);
	};

	// Filtrar productos localmente para manejar filtros adicionales
	const filteredProducts = products.filter((product) => {
		// Filtro de stock bajo (ya que no se implementó en backend)
		if (stockFilter === "lowStock") {
			return product.stock > 0 && product.stock <= 10;
		}
		return true;
	});

	// Definir columnas de la tabla
	const columns = [
		{
			key: "product",
			header: "Producto",
			sortable: true,
			render: (product: Product) => (
				<div className="flex items-center">
					<ProductImage product={product} />
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900 flex items-center">
							{product.name}
							{product.featured && (
								<span className="ml-2">
									<Star className="h-4 w-4 text-yellow-500 inline" />
								</span>
							)}
						</div>
						<div className="text-xs text-gray-500">
							ID: {product.id}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "category",
			header: "Categoría",
			sortable: true,
			render: (product: Product) => (
				<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
					<Tag className="w-3 h-3 mr-1" />
					{getCategoryName(product.categoryId)}
				</span>
			),
		},
		{
			key: "seller",
			header: "Vendedor",
			sortable: true,
			render: (product: Product) => {
				// Con la nueva API, los datos de seller y user vienen completos
				const storeName = product.seller?.store_name || product.seller?.name || 'Tienda desconocida';
				const userName = product.user?.name || 'Usuario desconocido';
				const sellerId = product.seller_id || product.seller?.id;
				
				return (
					<div className="text-sm">
						<div className="font-medium text-gray-900">
							{storeName}
						</div>
						<div className="text-xs text-gray-500">
							Vendedor ID: {sellerId || 'N/A'} - {userName}
						</div>
					</div>
				);
			},
		},
		{
			key: "price",
			header: "Precio",
			sortable: true,
			render: (product: Product) => (
				<div>
					{product.discountPercentage && product.discountPercentage > 0 ? (
						<div>
							<span className="text-gray-500 line-through text-xs mr-1">
								{formatCurrency(product.price)}
							</span>
							<span className="font-semibold text-green-600">
								{formatCurrency(
									product.finalPrice ||
										product.price * (1 - product.discountPercentage / 100)
								)}
							</span>
							<span className="ml-1 bg-green-100 text-green-800 text-xs font-semibold px-1.5 py-0.5 rounded">
								-{product.discountPercentage}%
							</span>
						</div>
					) : (
						<span className="font-semibold">
							{formatCurrency(product.price)}
						</span>
					)}
				</div>
			),
		},
		{
			key: "stock",
			header: "Stock",
			sortable: true,
			render: (product: Product) => (
				<div>
					{product.stock === 0 ? (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
							Agotado
						</span>
					) : product.stock <= 10 ? (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
							{product.stock} unidades
						</span>
					) : (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
							{product.stock} unidades
						</span>
					)}
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (product: Product) => {
				let statusColor = "";
				let statusText = "";
				let StatusIcon = CheckCircle;

				if (!product.published) {
					statusColor = "bg-yellow-100 text-yellow-800";
					statusText = "No publicado";
					StatusIcon = Clock;
				} else if (product.status === "draft") {
					statusColor = "bg-gray-100 text-gray-800";
					statusText = "Borrador";
					StatusIcon = Archive;
				} else if (product.status === "active") {
					statusColor = "bg-green-100 text-green-800";
					statusText = "Activo";
					StatusIcon = CheckCircle;
				} else {
					statusColor = "bg-red-100 text-red-800";
					statusText = "Inactivo";
					StatusIcon = Archive;
				}

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
					>
						<StatusIcon className="w-3 h-3 mr-1" />
						{statusText}
					</span>
				);
			},
		},
		{
			key: "rating",
			header: "Valoración",
			sortable: true,
			render: (product: Product) => {
				// Con la nueva API, usar los ratings calculados directamente
				const displayRating = (product as any).calculated_rating ?? product.rating ?? 0;
				const displayCount = (product as any).calculated_rating_count ?? product.ratingCount ?? (product as any).rating_count ?? 0;
				
				return (
					<div className="flex items-center">
						{displayRating > 0 ? (
							<>
								<Star className="h-4 w-4 text-yellow-500 mr-1" />
								<span>{parseFloat(displayRating).toFixed(1)}</span>
								<span className="text-xs text-gray-500 ml-1">
									({displayCount})
								</span>
							</>
						) : (
							<span className="text-xs text-gray-500">Sin valoraciones</span>
						)}
					</div>
				);
			},
		},
		{
			key: "sales",
			header: "Ventas",
			sortable: true,
			render: (product: Product) => {
				// Con la nueva API, los datos de ventas vienen calculados
				const salesCount = (product as any).sales_count ?? 0;
				const totalQuantity = (product as any).total_quantity_sold ?? 0;
				
				return (
					<div className="text-sm">
						<div className="font-medium">{salesCount} órdenes</div>
						<div className="text-xs text-gray-500">{totalQuantity} uds.</div>
					</div>
				);
			},
		},
		{
			key: "actions",
			header: "Acciones",
			render: (product: Product) => (
				<div className="flex justify-end space-x-1">
					{/* Botón para ver producto en la tienda - USAR ID EN LUGAR DE SLUG */}
					<Link
						to={`/products/${product.id}`}
						target="_blank"
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
						title="Ver en tienda"
					>
						<Eye size={16} />
					</Link>

					{/* Botón para editar producto - USAR ID NO SLUG */}
					<Link
						to={`/admin/products/edit/${product.id}`}
						className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-md"
						title="Editar producto"
					>
						<Edit size={16} />
					</Link>

					{/* Botón para destacar/quitar destacado */}
					<button
						onClick={() =>
							handleToggleFeatured(product.id!, product.featured || false)
						}
						disabled={loadingAction === product.id}
						className={`p-1 rounded-md transition-colors ${
							product.featured
								? "text-yellow-500 hover:bg-yellow-100"
								: "text-gray-600 hover:bg-gray-100"
						} ${loadingAction === product.id ? "opacity-50 cursor-not-allowed" : ""}`}
						title={product.featured ? "Quitar destacado" : "Destacar producto"}
					>
						<Star
							size={16}
							className={product.featured ? "fill-current" : ""}
						/>
					</button>

					{/* Botón para publicar/despublicar */}
					<button
						onClick={() =>
							handleTogglePublished(product.id!, product.published || false)
						}
						disabled={loadingAction === product.id}
						className={`p-1 rounded-md transition-colors ${
							product.published
								? "text-green-600 hover:bg-green-100"
								: "text-gray-600 hover:bg-gray-100"
						} ${loadingAction === product.id ? "opacity-50 cursor-not-allowed" : ""}`}
						title={product.published ? "Despublicar" : "Publicar"}
					>
						<CheckCircle size={16} />
					</button>

					{/* Botón para eliminar */}
					<button
						onClick={() => handleDeleteProduct(product.id!, product.name)}
						disabled={loadingAction === product.id}
						className={`p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors ${
							loadingAction === product.id
								? "opacity-50 cursor-not-allowed"
								: ""
						}`}
						title="Eliminar producto"
					>
						<Trash2 size={16} />
					</button>
				</div>
			),
		},
	];

	const loading = productsLoading || categoriesLoading;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Gestión de Productos
						{sellerFilter > 0 && (
							<span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
								Vendedor ID: {sellerFilter}
							</span>
						)}
					</h1>
					{meta && (
						<p className="text-sm text-gray-600 mt-1">
							{meta.total} productos encontrados
							{sellerFilter > 0 && " para este vendedor"}
						</p>
					)}
				</div>
				<div className="flex space-x-2">
					<Link
						to="/admin/products/create"
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
					>
						<Plus className="w-4 h-4 mr-2" />
						Nuevo Producto
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
			{productsError && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
					Error: {productsError}
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
							placeholder="Buscar productos..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
						/>
					</div>

					{/* Filtro de Categoría */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(Number(e.target.value))}
						>
							<option value={0}>Todas las categorías</option>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name} ({category.product_count || 0})
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
							<option value="active">Activos</option>
							<option value="draft">Borrador</option>
							<option value="inactive">Inactivos</option>
						</select>
					</div>

					{/* Filtro de Stock */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
							value={stockFilter}
							onChange={(e) => setStockFilter(e.target.value)}
						>
							<option value="all">Todo el Stock</option>
							<option value="inStock">En stock</option>
							<option value="lowStock">Stock bajo (≤10)</option>
							<option value="outOfStock">Sin stock</option>
						</select>
					</div>
				</div>
			</div>

			{/* Tabla de Productos */}
			<Table
				data={filteredProducts}
				columns={columns}
				searchFields={[]} // Búsqueda se maneja externamente
				loading={loading}
				emptyMessage="No se encontraron productos"
				pagination={{
					currentPage: currentPage,
					totalPages: Math.ceil((meta?.total || 0) / itemsPerPage),
					totalItems: meta?.total || 0,
					itemsPerPage: itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>
		</div>
	);
};

export default AdminProductsPage;
