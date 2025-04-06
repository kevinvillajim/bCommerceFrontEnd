import React, {useState, useEffect} from "react";
import Table from "../../components/dashboard/Table";
import {
	Package,
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
} from "lucide-react";
import {Link} from "react-router-dom";
import type {Product} from "../../../core/domain/entities/Product";

// Datos simulados para productos
const mockProducts: Product[] = [
	{
		id: 1,
		name: "Laptop HP Pavilion",
		slug: "laptop-hp-pavilion",
		description: "Laptop con procesador i7, 16GB RAM y 512GB SSD",
		price: 899.99,
		stock: 25,
		featured: true,
		published: true,
		status: "active",
		viewCount: 1245,
		salesCount: 87,
		discountPercentage: 10,
		finalPrice: 809.99,
		isInStock: true,
		rating: 4.5,
		rating_count: 38,
		categoryId: 3,
		images: [
			"https://picsum.photos/seed/laptophp/600/400",
			"https://picsum.photos/seed/hp-pavilion/600/400",
		],
	},
	{
		id: 2,
		name: "Smartphone Samsung Galaxy S22",
		slug: "smartphone-samsung-galaxy-s22",
		description: "Smartphone con pantalla AMOLED, 128GB de almacenamiento",
		price: 799.99,
		stock: 42,
		featured: true,
		published: true,
		status: "active",
		viewCount: 2300,
		salesCount: 156,
		discountPercentage: 5,
		finalPrice: 759.99,
		isInStock: true,
		rating: 4.7,
		rating_count: 84,
		categoryId: 2,
		images: ["https://picsum.photos/seed/samsunggalaxy/600/400"],
	},
	{
		id: 3,
		name: "Audífonos Sony WH-1000XM4",
		slug: "audifonos-sony-wh-1000xm4",
		description: "Audífonos inalámbricos con cancelación de ruido",
		price: 349.99,
		stock: 15,
		featured: false,
		published: true,
		status: "active",
		viewCount: 980,
		salesCount: 45,
		discountPercentage: 0,
		finalPrice: 349.99,
		isInStock: true,
		rating: 4.8,
		rating_count: 27,
		categoryId: 4,
		images: ["https://picsum.photos/seed/sonyheadphones/600/400"],
	},
	{
		id: 4,
		name: "Monitor LG UltraWide",
		slug: "monitor-lg-ultrawide",
		description: "Monitor curvo de 34 pulgadas, resolución 4K",
		price: 499.99,
		stock: 8,
		featured: false,
		published: true,
		status: "active",
		viewCount: 560,
		salesCount: 23,
		discountPercentage: 15,
		finalPrice: 424.99,
		isInStock: true,
		rating: 4.6,
		rating_count: 19,
		categoryId: 3,
		images: ["https://picsum.photos/seed/monitorlg/600/400"],
	},
	{
		id: 5,
		name: "Teclado Mecánico Logitech G Pro",
		slug: "teclado-mecanico-logitech-g-pro",
		description: "Teclado mecánico para gaming con retroiluminación RGB",
		price: 129.99,
		stock: 30,
		featured: false,
		published: true,
		status: "active",
		viewCount: 850,
		salesCount: 67,
		discountPercentage: 0,
		finalPrice: 129.99,
		isInStock: true,
		rating: 4.5,
		rating_count: 32,
		categoryId: 5,
		images: ["https://picsum.photos/seed/logitechkeyboard/600/400"],
	},
	{
		id: 6,
		name: "Tablet iPad Pro 11",
		slug: "tablet-ipad-pro-11",
		description:
			"Tablet con pantalla Liquid Retina, chip M2 y almacenamiento de 256GB",
		price: 899.99,
		stock: 0,
		featured: true,
		published: true,
		status: "active",
		viewCount: 1800,
		salesCount: 110,
		discountPercentage: 0,
		finalPrice: 899.99,
		isInStock: false,
		rating: 4.9,
		rating_count: 65,
		categoryId: 2,
		images: ["https://picsum.photos/seed/ipadpro/600/400"],
	},
	{
		id: 7,
		name: "Impresora Canon PIXMA",
		slug: "impresora-canon-pixma",
		description: "Impresora multifuncional a color con Wi-Fi",
		price: 179.99,
		stock: 12,
		featured: false,
		published: false,
		status: "draft",
		viewCount: 240,
		salesCount: 8,
		discountPercentage: 0,
		finalPrice: 179.99,
		isInStock: true,
		rating: 4.2,
		rating_count: 11,
		categoryId: 3,
		images: ["https://picsum.photos/seed/canonprinter/600/400"],
	},
	{
		id: 8,
		name: "Cámara Sony Alpha a7 III",
		slug: "camara-sony-alpha-a7-iii",
		description: "Cámara mirrorless con sensor full-frame de 24.2MP",
		price: 1999.99,
		stock: 5,
		featured: true,
		published: true,
		status: "active",
		viewCount: 760,
		salesCount: 14,
		discountPercentage: 8,
		finalPrice: 1839.99,
		isInStock: true,
		rating: 4.8,
		rating_count: 23,
		categoryId: 7,
		images: ["https://picsum.photos/seed/sonycamera/600/400"],
	},
	{
		id: 9,
		name: "Mouse Gaming Razer DeathAdder",
		slug: "mouse-gaming-razer-deathadder",
		description: "Mouse gaming con sensor óptico y 7 botones programables",
		price: 69.99,
		stock: 48,
		featured: false,
		published: true,
		status: "active",
		viewCount: 1100,
		salesCount: 92,
		discountPercentage: 0,
		finalPrice: 69.99,
		isInStock: true,
		rating: 4.7,
		rating_count: 48,
		categoryId: 5,
		images: ["https://picsum.photos/seed/razermouse/600/400"],
	},
	{
		id: 10,
		name: "Smartwatch Apple Watch Series 8",
		slug: "smartwatch-apple-watch-series-8",
		description:
			"Smartwatch con detección de caídas, GPS y sensor de oxígeno en sangre",
		price: 429.99,
		stock: 22,
		featured: true,
		published: true,
		status: "active",
		viewCount: 950,
		salesCount: 37,
		discountPercentage: 0,
		finalPrice: 429.99,
		isInStock: true,
		rating: 4.6,
		rating_count: 29,
		categoryId: 6,
		images: ["https://picsum.photos/seed/applewatch/600/400"],
	},
];



// Datos para los filtros de categorías
const categories = [
	{id: 1, name: "Todas"},
	{id: 2, name: "Móviles y Tablets"},
	{id: 3, name: "Informática"},
	{id: 4, name: "Audio"},
	{id: 5, name: "Accesorios"},
	{id: 6, name: "Wearables"},
	{id: 7, name: "Fotografía"},
];

const AdminProductsPage: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [categoryFilter, setCategoryFilter] = useState<number>(1); // 1 = Todas
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [stockFilter, setStockFilter] = useState<string>("all");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Cargar datos de productos
	useEffect(() => {
		const fetchProducts = () => {
			setLoading(true);
			// Simulación de llamada a API
			setTimeout(() => {
				setProducts(mockProducts);
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalItems: mockProducts.length,
					itemsPerPage: 10,
				});
				setLoading(false);
			}, 500);
		};

		fetchProducts();
	}, []);

	// Filtrar productos
	const filteredProducts = products.filter((product) => {
		const matchesCategory =
			categoryFilter === 1 || product.categoryId === categoryFilter;

		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "active" &&
				product.status === "active" &&
				product.published) ||
			(statusFilter === "draft" && product.status === "draft") ||
			(statusFilter === "inactive" && product.status === "inactive") ||
			!product.published;

		const matchesStock =
			stockFilter === "all" ||
			(stockFilter === "inStock" && product.stock > 0) ||
			(stockFilter === "lowStock" &&
				product.stock > 0 &&
				product.stock <= 10) ||
			(stockFilter === "outOfStock" && product.stock === 0);

		return matchesCategory && matchesStatus && matchesStock;
	});

	// Destacar/Quitar destacado de producto
	const toggleFeatured = (productId: number) => {
		setProducts((prevProducts) =>
			prevProducts.map((product) => {
				if (product.id === productId) {
					return {...product, featured: !product.featured};
				}
				return product;
			})
		);
	};

	// Cambiar estado de publicación
	const togglePublished = (productId: number) => {
		setProducts((prevProducts) =>
			prevProducts.map((product) => {
				if (product.id === productId) {
					return {...product, published: !product.published};
				}
				return product;
			})
		);
	};

	// Eliminar producto
	const deleteProduct = (productId: number) => {
		if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
			setProducts((prevProducts) =>
				prevProducts.filter((product) => product.id !== productId)
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

	// Formatear moneda
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-ES", {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 2,
		}).format(amount);
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "product",
			header: "Producto",
			sortable: true,
			render: (product: Product) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
						{product.images && product.images.length > 0 ? (
							<img
								src={product.images[0]}
								alt={product.name}
								className="h-10 w-10 object-cover"
								onError={(e) => {
									(e.target as HTMLImageElement).src =
										"https://via.placeholder.com/100?text=Producto";
								}}
							/>
						) : (
							<Package className="h-6 w-6 text-gray-500 dark:text-gray-400" />
						)}
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
							{product.name}
							{product.featured && (
								<span className="ml-2">
									<Star className="h-4 w-4 text-yellow-500 inline" />
								</span>
							)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							ID: {product.id} - SKU: {product.sku || "N/A"}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "category",
			header: "Categoría",
			sortable: true,
			render: (product: Product) => {
				const category = categories.find((c) => c.id === product.categoryId);
				return (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
						<Tag className="w-3 h-3 mr-1" />
						{category ? category.name : "Sin categoría"}
					</span>
				);
			},
		},
		{
			key: "price",
			header: "Precio",
			sortable: true,
			render: (product: Product) => (
				<div>
					{product.discountPercentage ? (
						<div>
							<span className="text-gray-500 dark:text-gray-400 line-through text-xs mr-1">
								{formatCurrency(product.price)}
							</span>
							<span className="font-semibold text-green-600 dark:text-green-400">
								{formatCurrency(
									product.finalPrice ||
										product.price * (1 - product.discountPercentage / 100)
								)}
							</span>
							<span className="ml-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold px-1.5 py-0.5 rounded">
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
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
							Agotado
						</span>
					) : product.stock <= 10 ? (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
							{product.stock} unidades
						</span>
					) : (
						<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
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
					statusColor =
						"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
					statusText = "No publicado";
					StatusIcon = Clock;
				} else if (product.status === "draft") {
					statusColor =
						"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
					statusText = "Borrador";
					StatusIcon = Archive;
				} else if (product.status === "active") {
					statusColor =
						"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
					statusText = "Activo";
					StatusIcon = CheckCircle;
				} else {
					statusColor =
						"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
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
			render: (product: Product) => (
				<div className="flex items-center">
					{(product.rating ?? 0) > 0 ? (
						<>
							<Star className="h-4 w-4 text-yellow-500 mr-1" />
							<span>{(product.rating ?? 0).toFixed(1)}</span>
							<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
								({product.rating_count ?? 0})
							</span>
						</>
					) : (
						<span className="text-xs text-gray-500 dark:text-gray-400">
							Sin valoraciones
						</span>
					)}
				</div>
			),
		},
		{
			key: "sales",
			header: "Ventas",
			sortable: true,
			render: (product: Product) => <span>{product.salesCount || 0} uds.</span>,
		},
		{
			key: "actions",
			header: "Acciones",
			render: (product: Product) => (
				<div className="flex justify-end space-x-2">
					{/* Botón para ver producto */}
					<Link
						to={`/admin/products/${product.id}`}
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
						title="Ver producto"
					>
						<Eye size={18} />
					</Link>

					{/* Botón para editar producto */}
					<Link
						to={`/admin/products/edit/${product.id}`}
						className="p-1 text-yellow-600 hover:bg-yellow-100 rounded-md dark:text-yellow-400 dark:hover:bg-yellow-900"
						title="Editar producto"
					>
						<Edit size={18} />
					</Link>

					{/* Botón para destacar/quitar destacado */}
					<button
						onClick={() => toggleFeatured(product.id || 0)}
						className={`p-1 rounded-md ${
							product.featured
								? "text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900"
								: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
						}`}
						title={product.featured ? "Quitar destacado" : "Destacar producto"}
					>
						<Star size={18} />
					</button>

					{/* Botón para publicar/despublicar */}
					<button
						onClick={() => togglePublished(product.id || 0)}
						className={`p-1 rounded-md ${
							product.published
								? "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
								: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
						}`}
						title={product.published ? "Despublicar" : "Publicar"}
					>
						<CheckCircle size={18} />
					</button>

					{/* Botón para eliminar */}
					<button
						onClick={() => deleteProduct(product.id || 0)}
						className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
						title="Eliminar producto"
					>
						<Trash2 size={18} />
					</button>
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Gestión de Productos
				</h1>
				<div className="flex space-x-2">
					<Link
						to="/admin/products/create"
						className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						<Package className="inline w-5 h-5 mr-1" />
						Nuevo Producto
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
					{/* Filtro de Categoría */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(Number(e.target.value))}
						>
							{categories.map((category) => (
								<option key={category.id} value={category.id}>
									{category.name}
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
							<option value="active">Activos</option>
							<option value="draft">Borrador</option>
							<option value="inactive">Inactivos</option>
						</select>
					</div>

					{/* Filtro de Stock */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={stockFilter}
							onChange={(e) => setStockFilter(e.target.value)}
						>
							<option value="all">Todo el Stock</option>
							<option value="inStock">En stock</option>
							<option value="lowStock">Stock bajo</option>
							<option value="outOfStock">Sin stock</option>
						</select>
					</div>
				</div>
			</div>

			{/* Tabla de Productos */}
			<Table
				data={filteredProducts}
				columns={columns}
				searchFields={["name", "description", "sku"]}
				loading={loading}
				emptyMessage="No se encontraron productos"
				pagination={{
					currentPage: pagination.currentPage,
					totalPages: pagination.totalPages,
					totalItems: pagination.totalItems,
					itemsPerPage: pagination.itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>
		</div>
	);
};

export default AdminProductsPage;
