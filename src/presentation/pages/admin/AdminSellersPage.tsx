import React, {useState, useEffect} from "react";
import Table from "../../components/dashboard/Table";
import {
	Store,
	ShieldCheck,
	Star,
	Package,
	DollarSign,
	Filter,
	RefreshCw,
	Eye,
	Ban,
	CheckCircle,
	Clock,
} from "lucide-react";
import {Link} from "react-router-dom";
import type {Seller} from "../../../core/domain/entities/Seller";

// Datos simulados para vendedores
const mockSellers: Seller[] = [
	{
		id: 1,
		userId: 101,
		storeName: "TechGizmo Shop",
		description: "Tienda especializada en gadgets tecnológicos",
		status: "active",
		verificationLevel: "verified",
		commissionRate: 5.0,
		totalSales: 35420.5,
		isFeatured: true,
		averageRating: 4.8,
		totalRatings: 124,
		createdAt: "2023-05-15T10:30:00Z",
		updatedAt: "2023-11-02T14:22:00Z",
	},
	{
		id: 2,
		userId: 102,
		storeName: "Fashion Trends",
		description: "Ropa y accesorios de moda",
		status: "active",
		verificationLevel: "premium",
		commissionRate: 7.5,
		totalSales: 28950.25,
		isFeatured: true,
		averageRating: 4.6,
		totalRatings: 87,
		createdAt: "2023-04-22T09:15:00Z",
		updatedAt: "2023-11-03T11:45:00Z",
	},
	{
		id: 3,
		userId: 103,
		storeName: "Home Essentials",
		description: "Todo para el hogar",
		status: "active",
		verificationLevel: "basic",
		commissionRate: 4.0,
		totalSales: 22340.75,
		isFeatured: false,
		averageRating: 4.2,
		totalRatings: 56,
		createdAt: "2023-06-10T14:20:00Z",
		updatedAt: "2023-10-28T16:30:00Z",
	},
	{
		id: 4,
		userId: 104,
		storeName: "Sports Equipment",
		description: "Equipamiento deportivo profesional",
		status: "suspended",
		verificationLevel: "verified",
		commissionRate: 6.0,
		totalSales: 18750.3,
		isFeatured: false,
		averageRating: 4.5,
		totalRatings: 43,
		createdAt: "2023-03-05T08:40:00Z",
		updatedAt: "2023-10-15T13:25:00Z",
	},
	{
		id: 5,
		userId: 105,
		storeName: "Beauty World",
		description: "Productos de belleza y cuidado personal",
		status: "active",
		verificationLevel: "basic",
		commissionRate: 5.5,
		totalSales: 15670.45,
		isFeatured: false,
		averageRating: 4.3,
		totalRatings: 38,
		createdAt: "2023-07-18T11:10:00Z",
		updatedAt: "2023-11-01T09:50:00Z",
	},
	{
		id: 6,
		userId: 106,
		storeName: "Kitchen Masters",
		description: "Utensilios y electrodomésticos de cocina",
		status: "active",
		verificationLevel: "none",
		commissionRate: 4.5,
		totalSales: 12840.8,
		isFeatured: false,
		averageRating: 4.0,
		totalRatings: 21,
		createdAt: "2023-08-01T12:30:00Z",
		updatedAt: "2023-10-25T10:15:00Z",
	},
	{
		id: 7,
		userId: 107,
		storeName: "Pet Paradise",
		description: "Todo para mascotas",
		status: "pending",
		verificationLevel: "none",
		commissionRate: 4.0,
		totalSales: 0,
		isFeatured: false,
		averageRating: 0,
		totalRatings: 0,
		createdAt: "2023-11-02T15:45:00Z",
		updatedAt: "2023-11-02T15:45:00Z",
	},
	{
		id: 8,
		userId: 108,
		storeName: "Book Haven",
		description: "Librería online",
		status: "inactive",
		verificationLevel: "basic",
		commissionRate: 3.5,
		totalSales: 8950.2,
		isFeatured: false,
		averageRating: 4.4,
		totalRatings: 15,
		createdAt: "2023-06-20T13:50:00Z",
		updatedAt: "2023-09-18T11:20:00Z",
	},
	{
		id: 9,
		userId: 109,
		storeName: "Electronics Hub",
		description: "Electrónica y accesorios",
		status: "active",
		verificationLevel: "verified",
		commissionRate: 6.5,
		totalSales: 42680.15,
		isFeatured: true,
		averageRating: 4.7,
		totalRatings: 92,
		createdAt: "2023-02-15T10:15:00Z",
		updatedAt: "2023-11-04T14:10:00Z",
	},
	{
		id: 10,
		userId: 110,
		storeName: "Crafty Corner",
		description: "Artículos de manualidades y arte",
		status: "pending",
		verificationLevel: "none",
		commissionRate: 4.0,
		totalSales: 0,
		isFeatured: false,
		averageRating: 0,
		totalRatings: 0,
		createdAt: "2023-11-04T09:30:00Z",
		updatedAt: "2023-11-04T09:30:00Z",
	},
];

const AdminSellersPage: React.FC = () => {
	const [sellers, setSellers] = useState<Seller[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [verificationFilter, setVerificationFilter] = useState<string>("all");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 5,
		totalItems: 48,
		itemsPerPage: 10,
	});

	// Cargar datos de vendedores
	useEffect(() => {
		const fetchSellers = () => {
			setLoading(true);
			// Simulación de llamada a API
			setTimeout(() => {
				setSellers(mockSellers);
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalItems: mockSellers.length,
					itemsPerPage: 10,
				});
				setLoading(false);
			}, 500);
		};

		fetchSellers();
	}, []);

	// Filtrar vendedores basado en estado y nivel de verificación
	const filteredSellers = sellers.filter((seller) => {
		const matchesStatus =
			statusFilter === "all" || seller.status === statusFilter;
		const matchesVerification =
			verificationFilter === "all" ||
			seller.verificationLevel === verificationFilter;
		return matchesStatus && matchesVerification;
	});

	// Manejar cambio de estado de vendedor
	const toggleSellerStatus = (sellerId: number) => {
		setSellers((prevSellers) =>
			prevSellers.map((seller) => {
				if (seller.id === sellerId) {
					let newStatus: "pending" | "active" | "suspended" | "inactive";

					// Ciclo de estados: active -> suspended -> inactive -> active
					if (seller.status === "active") newStatus = "suspended";
					else if (seller.status === "suspended") newStatus = "inactive";
					else newStatus = "active"; // Si está inactivo o pendiente, activar

					return {...seller, status: newStatus};
				}
				return seller;
			})
		);
	};

	// Aprobar vendedor pendiente
	const approveSeller = (sellerId: number) => {
		setSellers((prevSellers) =>
			prevSellers.map((seller) => {
				if (seller.id === sellerId && seller.status === "pending") {
					return {...seller, status: "active"};
				}
				return seller;
			})
		);
		alert(`Vendedor #${sellerId} ha sido aprobado`);
	};

	// Cambiar nivel de verificación
	const updateVerificationLevel = (
		sellerId: number,
		level: "none" | "basic" | "verified" | "premium"
	) => {
		setSellers((prevSellers) =>
			prevSellers.map((seller) => {
				if (seller.id === sellerId) {
					return {...seller, verificationLevel: level};
				}
				return seller;
			})
		);
		alert(
			`Nivel de verificación actualizado a "${level}" para vendedor #${sellerId}`
		);
	};

	// Destacar/Quitar destacado de vendedor
	const toggleFeatured = (sellerId: number) => {
		setSellers((prevSellers) =>
			prevSellers.map((seller) => {
				if (seller.id === sellerId) {
					return {...seller, isFeatured: !seller.isFeatured};
				}
				return seller;
			})
		);
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
			key: "store",
			header: "Tienda",
			sortable: true,
			render: (seller: Seller) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center overflow-hidden">
						<Store className="h-6 w-6 text-primary-600 dark:text-primary-400" />
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
							{seller.storeName}
							{seller.isFeatured && (
								<span className="ml-2">
									<Star className="h-4 w-4 text-yellow-500 inline" />
								</span>
							)}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							ID: {seller.id} - User ID: {seller.userId}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (seller: Seller) => {
				let statusColor = "";
				let statusText = "";
				let StatusIcon: any = null;

				switch (seller.status) {
					case "active":
						statusColor =
							"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
						statusText = "Activo";
						StatusIcon = CheckCircle;
						break;
					case "pending":
						statusColor =
							"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
						statusText = "Pendiente";
						StatusIcon = Clock;
						break;
					case "suspended":
						statusColor =
							"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
						statusText = "Suspendido";
						StatusIcon = Ban;
						break;
					case "inactive":
						statusColor =
							"bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
						statusText = "Inactivo";
						StatusIcon = Eye;
						break;
				}

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
					>
						{StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
						{statusText}
					</span>
				);
			},
		},
		{
			key: "verification",
			header: "Verificación",
			sortable: true,
			render: (seller: Seller) => {
				let verificationColor = "";
				let verificationText = "";

				switch (seller.verificationLevel) {
					case "none":
						verificationColor =
							"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
						verificationText = "Sin verificar";
						break;
					case "basic":
						verificationColor =
							"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
						verificationText = "Básica";
						break;
					case "verified":
						verificationColor =
							"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
						verificationText = "Verificada";
						break;
					case "premium":
						verificationColor =
							"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
						verificationText = "Premium";
						break;
				}

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${verificationColor}`}
					>
						{verificationText}
					</span>
				);
			},
		},
		{
			key: "rating",
			header: "Valoración",
			sortable: true,
			render: (seller: Seller) => (
				<div className="flex items-center">
					{(seller.averageRating ?? 0) > 0 ? (
						<>
							<Star className="h-4 w-4 text-yellow-500 mr-1" />
							<span>{(seller.averageRating ?? 0).toFixed(1)}</span>
							<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
								({seller.totalRatings ?? 0})
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
			render: (seller: Seller) => (
				<div className="flex items-center">
					<DollarSign className="h-4 w-4 text-green-500 mr-1" />
					<span>{formatCurrency(seller.totalSales)}</span>
				</div>
			),
		},
		{
			key: "products",
			header: "Productos",
			render: (seller: Seller) => (
				<Link
					to={`/admin/products?sellerId=${seller.id}`}
					className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline flex items-center"
				>
					<Package className="h-4 w-4 mr-1" />
					Ver productos
				</Link>
			),
		},
		{
			key: "createdAt",
			header: "Creado",
			sortable: true,
			render: (seller: Seller) => {
				const date = new Date(seller.createdAt || "");
				return date.toLocaleDateString();
			},
		},
		{
			key: "actions",
			header: "Acciones",
			render: (seller: Seller) => (
				<div className="flex justify-end space-x-2">
					{/* Botón para cambiar estado */}
					<button
						onClick={() => toggleSellerStatus(seller.id)}
						className={`p-1 rounded-md ${
							seller.status === "active"
								? "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
								: "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900"
						}`}
						title={
							seller.status === "active"
								? "Suspender vendedor"
								: seller.status === "suspended"
									? "Desactivar vendedor"
									: "Activar vendedor"
						}
					>
						{seller.status === "active" ? (
							<Ban size={18} />
						) : (
							<CheckCircle size={18} />
						)}
					</button>

					{/* Botón de aprobación para vendedores pendientes */}
					{seller.status === "pending" && (
						<button
							onClick={() => approveSeller(seller.id)}
							className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
							title="Aprobar vendedor"
						>
							<CheckCircle size={18} />
						</button>
					)}

					{/* Botón para alternar destacado */}
					<button
						onClick={() => toggleFeatured(seller.id)}
						className={`p-1 rounded-md ${
							seller.isFeatured
								? "text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900"
								: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
						}`}
						title={seller.isFeatured ? "Quitar destacado" : "Destacar vendedor"}
					>
						<Star size={18} />
					</button>

					{/* Botones para niveles de verificación (menú desplegable en una app real) */}
					<div className="relative group">
						<button
							className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
							title="Actualizar nivel de verificación"
						>
							<ShieldCheck size={18} />
						</button>

						{/* En una app real, esto sería un menú desplegable */}
						<div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
							<div className="py-1">
								<button
									onClick={() => updateVerificationLevel(seller.id, "none")}
									className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									Sin verificar
								</button>
								<button
									onClick={() => updateVerificationLevel(seller.id, "basic")}
									className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									Verificación básica
								</button>
								<button
									onClick={() => updateVerificationLevel(seller.id, "verified")}
									className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									Verificado
								</button>
								<button
									onClick={() => updateVerificationLevel(seller.id, "premium")}
									className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									Verificación premium
								</button>
							</div>
						</div>
					</div>

					{/* Ver detalles del vendedor */}
					<Link
						to={`/admin/sellers/${seller.id}`}
						className="p-1 text-primary-600 hover:bg-primary-100 rounded-md dark:text-primary-400 dark:hover:bg-primary-900"
						title="Ver detalles"
					>
						<Eye size={18} />
					</Link>
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Gestión de Vendedores
				</h1>
				<div className="flex space-x-2">
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
					{/* Filtro de Estado */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los Estados</option>
							<option value="active">Activos</option>
							<option value="pending">Pendientes</option>
							<option value="suspended">Suspendidos</option>
							<option value="inactive">Inactivos</option>
						</select>
					</div>

					{/* Filtro de Nivel de Verificación */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={verificationFilter}
							onChange={(e) => setVerificationFilter(e.target.value)}
						>
							<option value="all">Todos los Niveles de Verificación</option>
							<option value="none">Sin verificar</option>
							<option value="basic">Verificación básica</option>
							<option value="verified">Verificados</option>
							<option value="premium">Verificación premium</option>
						</select>
					</div>
				</div>
			</div>

			{/* Tabla de Vendedores */}
			<Table
				data={filteredSellers}
				columns={columns}
				searchFields={["storeName", "description"]}
				loading={loading}
				emptyMessage="No se encontraron vendedores"
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

export default AdminSellersPage;
