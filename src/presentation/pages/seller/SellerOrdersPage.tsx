import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {
	ShoppingBag,
	Search,
	Filter,
	RefreshCw,
	Eye,
	Truck,
	Package,
	BarChart2,
	CheckCircle,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import {SellerStatCardList} from "../../components/dashboard/SellerStatCardList";
// Importar el adaptador actualizado
import SellerOrderServiceAdapter from "../../../core/adapters/SellerOrderServiceAdapter";
import type {
	SellerOrderUI,
	SellerOrderStatUI,
} from "../../../core/adapters/SellerOrderServiceAdapter";
import ShippingFormModal from "../../components/shipping/ShippingFormModal";
import type {ShippingFormData} from "../../components/shipping/ShippingFormModal";

// Esta función ayuda a extraer la dirección de envío desde el string JSON
const parseShippingAddress = (shippingAddressStr?: string): string => {
	if (!shippingAddressStr) return "";

	try {
		const shippingAddress = JSON.parse(shippingAddressStr);
		if (typeof shippingAddress === "object" && shippingAddress !== null) {
			const parts = [
				shippingAddress.address,
				shippingAddress.city,
				shippingAddress.state,
				shippingAddress.country,
			].filter(Boolean);
			return parts.join(", ");
		}
	} catch (e) {
		console.error("Error al parsear dirección de envío:", e);
	}

	return shippingAddressStr;
};

const SellerOrdersPage: React.FC = () => {
	// Instanciar el adaptador de servicio
	const orderAdapter = new SellerOrderServiceAdapter();

	// Usar las interfaces para los estados
	const [orders, setOrders] = useState<SellerOrderUI[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [paymentFilter, setPaymentFilter] = useState<string>("all");
	const [dateFilter, setDateFilter] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});
	const [statsData, setStatsData] = useState<SellerOrderStatUI[]>([]);
	const [dateRange, setDateRange] = useState({
		from: "",
		to: "",
	});
	const [isUpdating, setIsUpdating] = useState(false);

	// Estado para el modal de envío
	const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	// Cargar datos de pedidos
	useEffect(() => {
		fetchOrders();
		fetchStats();
	}, [
		statusFilter,
		paymentFilter,
		searchTerm,
		pagination.currentPage,
		dateFilter,
		dateRange,
	]);

	// Función para obtener órdenes usando el adaptador
	const fetchOrders = async () => {
		setLoading(true);
		try {
			// Preparar filtros para la API
			const filters: any = {
				page: pagination.currentPage,
				limit: pagination.itemsPerPage,
			};

			if (statusFilter !== "all") {
				filters.status = statusFilter;
			}

			if (paymentFilter !== "all") {
				filters.paymentStatus = paymentFilter;
			}

			if (searchTerm) {
				filters.search = searchTerm;
			}

			// Añadir filtros de fecha según la selección
			if (dateFilter === "today") {
				const today = new Date().toISOString().split("T")[0];
				filters.dateFrom = today;
				filters.dateTo = today;
			} else if (dateFilter === "week") {
				const today = new Date();
				const firstDay = new Date(
					today.setDate(today.getDate() - today.getDay())
				);
				filters.dateFrom = firstDay.toISOString().split("T")[0];
				filters.dateTo = new Date().toISOString().split("T")[0];
			} else if (dateFilter === "month") {
				const today = new Date();
				const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
				filters.dateFrom = firstDay.toISOString().split("T")[0];
				filters.dateTo = new Date().toISOString().split("T")[0];
			} else if (dateFilter === "custom" && dateRange.from && dateRange.to) {
				filters.dateFrom = dateRange.from;
				filters.dateTo = dateRange.to;
			}

			// Obtener órdenes del adaptador específico de vendedor
			const result = await orderAdapter.getSellerOrders(filters);

			// Establecer órdenes y datos de paginación
			setOrders(result.orders);
			setPagination(result.pagination);
		} catch (error) {
			console.error("Error al cargar órdenes:", error);
		} finally {
			setLoading(false);
		}
	};

	// Función para obtener estadísticas usando el adaptador
	const fetchStats = async () => {
		try {
			const stats = await orderAdapter.getOrderStats();

			// Añadir los iconos a las estadísticas
			const statsWithIcons = stats.map((stat: SellerOrderStatUI) => {
				let icon;
				switch (stat.label) {
					case "Total Pedidos":
						icon = (
							<ShoppingBag className="h-5 w-5 text-blue-600" />
						);
						break;
					case "Pendientes":
						icon = (
							<Package className="h-5 w-5 text-yellow-600" />
						);
						break;
					case "En Proceso":
						icon = (
							<ShoppingBag className="h-5 w-5 text-blue-600" />
						);
						break;
					case "Enviados":
						icon = (
							<Truck className="h-5 w-5 text-indigo-600" />
						);
						break;
					case "Total Ventas":
						icon = (
							<BarChart2 className="h-5 w-5 text-green-600" />
						);
						break;
					default:
						icon = (
							<ShoppingBag className="h-5 w-5 text-blue-600" />
						);
				}

				return {
					...stat,
					icon,
					// Si es currency y todavía es un número, lo formateamos
					value:
						stat.isCurrency && typeof stat.value === "number"
							? formatCurrency(stat.value)
							: stat.value,
				};
			});

			setStatsData(statsWithIcons);
		} catch (error) {
			console.error("Error al cargar estadísticas:", error);

			// Estadísticas por defecto en caso de error
			setStatsData([
				{
					label: "Total Pedidos",
					value: orders.length,
					icon: (
						<ShoppingBag className="h-5 w-5 text-blue-600" />
					),
					color: "blue",
				},
				{
					label: "Pendientes",
					value: orders.filter((order) => order.status === "pending").length,
					icon: (
						<Package className="h-5 w-5 text-yellow-600" />
					),
					color: "yellow",
				},
				{
					label: "En Proceso",
					value: orders.filter((order) => order.status === "processing").length,
					icon: (
						<ShoppingBag className="h-5 w-5 text-blue-600" />
					),
					color: "blue",
				},
				{
					label: "Total Ventas",
					value: formatCurrency(
						orders.reduce((sum, order) => sum + order.total, 0)
					),
					icon: (
						<BarChart2 className="h-5 w-5 text-green-600" />
					),
					color: "green",
				},
			]);
		}
	};

	// Actualizar estado de un pedido usando el adaptador
	const updateOrderStatus = async (
		orderId: string,
		newStatus: SellerOrderUI["status"]
	) => {
		try {
			setIsUpdating(true);
			const success = await orderAdapter.updateOrderStatus(orderId, newStatus);

			if (success) {
				// Actualizar el estado localmente para evitar una recarga completa
				setOrders((prevOrders) =>
					prevOrders.map((order) => {
						if (order.id === orderId) {
							return {...order, status: newStatus};
						}
						return order;
					})
				);

				// Actualizar estadísticas después de cambiar estado
				fetchStats();
			}
		} catch (error) {
			console.error(`Error al actualizar estado de orden ${orderId}:`, error);
		} finally {
			setIsUpdating(false);
		}
	};

	// Manejar apertura del modal de envío
	const handleShippingModal = (orderId: string) => {
		setSelectedOrderId(orderId);
		setIsShippingModalOpen(true);
	};

	// Manejar envío del formulario de shipping
	const handleShippingSubmit = async (shippingData: ShippingFormData) => {
		if (!selectedOrderId) return;

		try {
			setIsUpdating(true);

			// Actualizar información de envío usando el adaptador
			const success = await orderAdapter.updateShippingInfo(
				selectedOrderId,
				shippingData
			);

			if (success) {
				// Actualizar la orden localmente a "shipped"
				setOrders((prevOrders) =>
					prevOrders.map((order) => {
						if (order.id === selectedOrderId) {
							return {
								...order,
								status: "shipped" as SellerOrderUI["status"],
							};
						}
						return order;
					})
				);

				// Cerrar modal
				setIsShippingModalOpen(false);
				setSelectedOrderId(null);

				// Recargar datos
				fetchOrders();
				fetchStats();
			}
		} catch (error) {
			console.error("Error al procesar envío:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
	};

	// Refrescar datos
	const refreshData = () => {
		setLoading(true);
		fetchOrders();
		fetchStats();
	};

	// Definir las columnas de la tabla
	const columns = [
		{
			key: "orderNumber",
			header: "Número de Pedido",
			sortable: true,
			render: (order: SellerOrderUI) => (
				<Link
					to={`/seller/orders/${order.id}`}
					className="font-medium text-primary-600 hover:underline"
				>
					{order.orderNumber}
				</Link>
			),
		},
		{
			key: "date",
			header: "Fecha",
			sortable: true,
			render: (order: SellerOrderUI) => {
				const date = new Date(order.date);
				return (
					<span>
						{date.toLocaleDateString("es-ES")}{" "}
						{date.toLocaleTimeString("es-ES", {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</span>
				);
			},
		},
		{
			key: "customer",
			header: "Cliente",
			sortable: true,
			render: (order: SellerOrderUI) => (
				<div>
					<div className="font-medium">{order.customer.name}</div>
					<div className="text-xs text-gray-500">
						{order.customer.email}
					</div>
				</div>
			),
		},
		{
			key: "total",
			header: "Total",
			sortable: true,
			render: (order: SellerOrderUI) => (
				<span className="font-medium">{formatCurrency(order.total)}</span>
			),
		},
		{
			key: "items",
			header: "Productos",
			render: (order: SellerOrderUI) => (
				<span className="text-center">
					{order.items ? order.items.reduce((total, item) => total + item.quantity, 0) : 0}
				</span>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (order: SellerOrderUI) => {
				let statusClass = "";
				let statusText = "";

				switch (order.status) {
					case "pending":
						statusClass =
							"bg-yellow-100 text-yellow-800";
						statusText = "Pendiente";
						break;
					case "ready_to_ship":
						statusClass =
							"bg-blue-100 text-blue-800";
						statusText = "Listo para enviar";
						break;
					case "in_transit":
						statusClass =
							"bg-indigo-100 text-indigo-800";
						statusText = "En Tránsito";
						break;
					case "processing":
						statusClass =
							"bg-blue-100 text-blue-800";
						statusText = "En Proceso";
						break;
					case "paid":
						statusClass =
							"bg-cyan-100 text-cyan-800";
						statusText = "Pagado";
						break;
					case "shipped":
						statusClass =
							"bg-indigo-100 text-indigo-800";
						statusText = "Enviado";
						break;
					case "delivered":
						statusClass =
							"bg-green-100 text-green-800";
						statusText = "Entregado";
						break;
					case "completed":
						statusClass =
							"bg-emerald-100 text-emerald-800";
						statusText = "Completado";
						break;
					case "failed":
						statusClass =
							"bg-red-100 text-red-800";
						statusText = "Fallido";
						break;
					case "rejected":
						statusClass =
							"bg-orange-100 text-orange-800";
						statusText = "Devuelto";
						break;
					case "cancelled":
						statusClass =
							"bg-gray-100 text-gray-800";
						statusText = "Cancelado";
						break;
					case "returned":
						statusClass =
							"bg-orange-100 text-orange-800";
						statusText = "Devuelto";
						break;
					default:
						statusClass =
							"bg-gray-100 text-gray-800";
						statusText = "Desconocido";
						break;
				}

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
					>
						{statusText}
					</span>
				);
			},
		},
		{
			key: "payment",
			header: "Pago",
			sortable: true,
			render: (order: SellerOrderUI) => {
				let paymentClass = "";
				let paymentText = "";

				switch (order.paymentStatus) {
					case "pending":
						paymentClass =
							"bg-yellow-100 text-yellow-800";
						paymentText = "Pendiente";
						break;
					case "completed":
						paymentClass =
							"bg-green-100 text-green-800";
						paymentText = "Pagado";
						break;
					case "rejected":
						paymentClass =
							"bg-red-100 text-red-800";
						paymentText = "Rechazado";
						break;
				}

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${paymentClass}`}
					>
						{paymentText}
					</span>
				);
			},
		},
		{
			key: "address",
			header: "Dirección",
			render: (order: SellerOrderUI) => (
				<div
					className="truncate max-w-xs"
					title={parseShippingAddress(order.shippingAddress)}
				>
					{parseShippingAddress(order.shippingAddress)}
				</div>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (order: SellerOrderUI) => (
				<div className="flex justify-end space-x-2">
					{/* Ver detalles */}
					<Link
						to={`/seller/orders/${order.id}`}
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
						title="Ver detalles"
					>
						<Eye size={18} />
					</Link>

					{/* Gestionar envío - AHORA ABRE EL MODAL MEJORADO */}
					<button
						onClick={() => handleShippingModal(order.id)}
						disabled={!(order.status === "pending" || order.status === "processing") || isUpdating}
						className={`p-1 rounded-md ${
							order.status === "pending" || order.status === "processing"
								? "text-green-600 hover:bg-green-100"
								: "text-gray-400 cursor-not-allowed"
						} disabled:opacity-50`}
						title={
							order.status === "pending" || order.status === "processing"
								? "Gestionar envío"
								: "No se puede gestionar el envío en este estado"
						}
					>
						<Truck size={18} />
					</button>


					{/* Preparar pedido - solo visible para pedidos pendientes */}
					{order.status === "pending" && (
						<button
							onClick={() => updateOrderStatus(order.id, "processing")}
							disabled={isUpdating}
							className="p-1 text-orange-600 hover:bg-orange-100 rounded-md disabled:opacity-50"
							title="Preparar pedido"
						>
							<Package size={18} />
						</button>
					)}
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			{/* Modal de envío mejorado */}
			<ShippingFormModal
				orderId={selectedOrderId || ""}
				orderNumber={orders.find(o => o.id === selectedOrderId)?.orderNumber}
				isOpen={isShippingModalOpen}
				onClose={() => {
					setIsShippingModalOpen(false);
					setSelectedOrderId(null);
				}}
				onSubmit={handleShippingSubmit}
				isLoading={isUpdating}
			/>

			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					Gestión de Pedidos
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshData}
						disabled={loading}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
					>
						<RefreshCw size={18} className={`inline mr-2 ${loading ? "animate-spin" : ""}`} />
						Actualizar
					</button>
				</div>
			</div>

			{/* Panel de filtros */}
			<div className="bg-white rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Buscador */}
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Buscar por número de pedido, cliente..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					</div>

					{/* Filtro de Estado */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los estados</option>
							<option value="pending">Pendientes</option>
							<option value="processing">En Proceso</option>
							<option value="paid">Pagados</option>
							<option value="shipped">Enviados</option>
							<option value="in_transit">En Tránsito</option>
							<option value="delivered">Entregados</option>
							<option value="completed">Completados</option>
							<option value="failed">Fallidos</option>
							<option value="returned">Devueltos</option>
							<option value="cancelled">Cancelados</option>
						</select>
					</div>

					{/* Filtro de Pago */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={paymentFilter}
							onChange={(e) => setPaymentFilter(e.target.value)}
						>
							<option value="all">Todos los pagos</option>
							<option value="pending">Pago Pendiente</option>
							<option value="completed">Pagados</option>
							<option value="rejected">Rechazados</option>
						</select>
					</div>

					{/* Filtro de Fecha */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={dateFilter}
							onChange={(e) => setDateFilter(e.target.value)}
						>
							<option value="all">Todas las fechas</option>
							<option value="today">Hoy</option>
							<option value="week">Esta semana</option>
							<option value="month">Este mes</option>
							<option value="custom">Personalizado</option>
						</select>
						{dateFilter === "custom" && (
							<div className="flex items-center space-x-2">
								<input
									type="date"
									className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
									value={dateRange.from}
									onChange={(e) =>
										setDateRange({...dateRange, from: e.target.value})
									}
								/>
								<span className="text-gray-500">a</span>
								<input
									type="date"
									className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
									value={dateRange.to}
									onChange={(e) =>
										setDateRange({...dateRange, to: e.target.value})
									}
								/>
							</div>
						)}
					</div>

					{/* Botón para limpiar filtros */}
					<button
						onClick={() => {
							setStatusFilter("all");
							setPaymentFilter("all");
							setDateFilter("all");
							setSearchTerm("");
							setDateRange({from: "", to: ""});
						}}
						className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
					>
						Limpiar filtros
					</button>
				</div>
			</div>

			{/* Estadísticas resumidas */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<SellerStatCardList
					items={statsData}
				/>
			</div>

			{/* Tabla de Pedidos */}
			<Table
				data={orders}
				columns={columns}
				searchFields={["orderNumber"]}
				loading={loading}
				emptyMessage="No se encontraron pedidos"
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

export default SellerOrdersPage;