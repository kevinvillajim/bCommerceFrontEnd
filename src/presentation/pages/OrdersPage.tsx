// src/presentation/pages/OrdersPage.tsx
import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {
	Search,
	Filter,
	RefreshCw,
	Eye,
	FileText,
	ShoppingBag,
} from "lucide-react";
import {formatCurrency} from "../../utils/formatters/formatCurrency";
import {formatDate} from "../../utils/formatters/formatDate";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import Table from "../components/dashboard/Table";
import OrderServiceAdapter from "../../core/adapters/OrderServiceAdapter";
import {useAuth} from "../hooks/useAuth";
import type {OrderUI} from "../../core/adapters/OrderServiceAdapter";

const OrdersPage: React.FC = () => {
	const {isAuthenticated} = useAuth();
	const orderAdapter = new OrderServiceAdapter();

	const [orders, setOrders] = useState<OrderUI[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Cargar datos de pedidos
	useEffect(() => {
		if (isAuthenticated) {
			fetchOrders();
		}
	}, [isAuthenticated, statusFilter, searchTerm, pagination.currentPage]);

	// Función para obtener órdenes
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

			// Obtener órdenes del adaptador
			const result = await orderAdapter.getUserOrders(filters);

			if (result && result.orders) {
				console.log("Órdenes recibidas:", result.orders);
				setOrders(result.orders);
				setPagination(result.pagination);
			} else {
				console.error("No se recibieron órdenes en la respuesta");
				setOrders([]);
				setError("No se pudieron cargar las órdenes");
			}
		} catch (error) {
			console.error("Error al cargar órdenes:", error);
			setError("Error al cargar órdenes");
			setOrders([]);
		} finally {
			setLoading(false);
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
	};

	// Filtrado local por término de búsqueda
	const filteredOrders = orders.filter((order) => {
		if (!searchTerm) return true;
		const searchLower = searchTerm.toLowerCase();
		return (
			order.orderNumber?.toLowerCase().includes(searchLower) ||
			order.shippingAddress?.toLowerCase().includes(searchLower) ||
			false
		);
	});

	// Definir las columnas de la tabla
	const columns = [
		{
			key: "orderNumber",
			header: "Número de Pedido",
			sortable: true,
			render: (order: OrderUI) => (
				<Link
					to={`/orders/${order.id}`}
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
			render: (order: OrderUI) => {
				// Asegurarse de que la fecha sea válida antes de formatearla
				return order.date ? formatDate(order.date) : "Fecha no disponible";
			},
		},
		{
			key: "total",
			header: "Total",
			sortable: true,
			render: (order: OrderUI) => (
				<span className="font-medium">{formatCurrency(order.total || 0)}</span>
			),
		},
		{
			key: "items",
			header: "Productos",
			render: (order: OrderUI) => (
				<div className="flex items-center justify-center">
					{order.items && order.items.length > 0 ? (
						<span className="text-center">{order.items.length}</span>
					) : (
						<Link
							to={`/orders/${order.id}`}
							className="flex items-center text-primary-600 hover:text-primary-800"
						>
							<ShoppingBag size={16} className="mr-1" />
							<span>Ver detalle</span>
						</Link>
					)}
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (order: OrderUI) => <OrderStatusBadge status={order.status} />,
		},
		{
			key: "payment",
			header: "Pago",
			sortable: true,
			render: (order: OrderUI) => (
				<OrderStatusBadge status={order.paymentStatus} type="payment" />
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (order: OrderUI) => (
				<div className="flex justify-end space-x-2">
					{/* Ver detalles */}
					<Link
						to={`/orders/${order.id}`}
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
						title="Ver detalles"
					>
						<Eye size={18} />
					</Link>

					{/* Ver factura - solo disponible si el pedido está completado */}
					{["completed", "delivered"].includes(order.status) && (
						<Link
							to={`/invoices/${order.id}`}
							className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md"
							title="Ver factura"
						>
							<FileText size={18} />
						</Link>
					)}
				</div>
			),
		},
	];

	return (
		<div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-800">
						Mis Pedidos
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

				{/* Mostrar error si existe */}
				{error && (
					<div
						className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
						role="alert"
					>
						<span className="block sm:inline">{error}</span>
					</div>
				)}

				{/* Panel de filtros */}
				<div className="bg-white rounded-lg shadow-sm p-4">
					<div className="flex flex-col md:flex-row gap-4">
						{/* Buscador */}
						<div className="relative flex-grow">
							<input
								type="text"
								placeholder="Buscar por número de pedido..."
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
								name="status"
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								value={statusFilter}
								onChange={(e) => setStatusFilter(e.target.value)}
							>
								<option value="all">Todos los estados</option>
								<option value="pending">Pendientes</option>
								<option value="processing">En Proceso</option>
								<option value="paid">Pagados</option>
								<option value="shipped">Enviados</option>
								<option value="delivered">Entregados</option>
								<option value="completed">Completados</option>
								<option value="cancelled">Cancelados</option>
							</select>
						</div>

						{/* Botón para limpiar filtros */}
						<button
							onClick={() => {
								setStatusFilter("all");
								setSearchTerm("");
							}}
							className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
						>
							Limpiar filtros
						</button>
					</div>
				</div>

				{/* Tabla de Pedidos */}
				<Table
					data={filteredOrders}
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
		</div>
	);
};

export default OrdersPage;
