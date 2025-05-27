import React, {useState, useEffect} from "react";
import Table from "../../components/dashboard/Table";
import {
	ShoppingBag,
	User,
	Calendar,
	Truck,
	FileText,
	Eye,
	RefreshCw,
	Filter,
	Clock,
	CheckCircle,
	XCircle,
	RotateCcw,
	Package,
	AlertTriangle,
} from "lucide-react";
import {Link} from "react-router-dom";
import type {Order} from "../../../core/domain/entities/Order";
import type {
	AdminOrderUI,
} from "../../../core/adapters/AdminOrderServiceAdapter";
import AdminOrderServiceAdapter from "../../../core/adapters/AdminOrderServiceAdapter";

// Estado para filtros
interface OrderFilters {
	status: string;
	paymentStatus: string;
	sellerId: number | null;
	dateFrom?: string;
	dateTo?: string;
	search?: string;
}

const AdminOrdersPage: React.FC = () => {
	const [orders, setOrders] = useState<AdminOrderUI[]>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<OrderFilters>({
		status: "all",
		paymentStatus: "all",
		sellerId: null,
	});
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Crear instancia del adaptador
	const orderAdapter = new AdminOrderServiceAdapter();

	// Cargar datos de pedidos
	useEffect(() => {
		fetchOrders();
	}, [filters, pagination.currentPage]);

	// Función para obtener órdenes
	const fetchOrders = async () => {
		setLoading(true);
		try {
			// Preparar filtros para la API
			const apiFilters = {
				status: filters.status !== "all" ? filters.status : undefined,
				paymentStatus:
					filters.paymentStatus !== "all" ? filters.paymentStatus : undefined,
				sellerId: filters.sellerId,
				dateFrom: filters.dateFrom,
				dateTo: filters.dateTo,
				search: filters.search,
				page: pagination.currentPage,
				limit: pagination.itemsPerPage,
			};

			// Llamar al servicio a través del adaptador
			const result = await orderAdapter.getAdminOrders(apiFilters);

			setOrders(result.orders);
			setPagination({
				currentPage: result.pagination.currentPage,
				totalPages: result.pagination.totalPages,
				totalItems: result.pagination.totalItems,
				itemsPerPage: result.pagination.itemsPerPage,
			});
		} catch (error) {
			console.error("Error al cargar órdenes:", error);
			// Mostrar mensaje de error o usar datos de fallback si es necesario
		} finally {
			setLoading(false);
		}
	};

	// Mapeo de estado para los pedidos
	const orderStatusMap: Record<
		string,
		{label: string; color: string; icon: React.ReactNode}
	> = {
		pending: {
			label: "Pendiente",
			color:
				"bg-yellow-100 text-yellow-800",
			icon: <Clock className="w-3 h-3 mr-1" />,
		},
		processing: {
			label: "En proceso",
			color: "bg-blue-100 text-blue-800",
			icon: <RefreshCw className="w-3 h-3 mr-1" />,
		},
		paid: {
			label: "Pagado",
			color: "bg-teal-100 text-teal-800",
			icon: <CheckCircle className="w-3 h-3 mr-1" />,
		},
		shipped: {
			label: "Enviado",
			color:
				"bg-indigo-100 text-indigo-800",
			icon: <Truck className="w-3 h-3 mr-1" />,
		},
		delivered: {
			label: "Entregado",
			color:
				"bg-purple-100 text-purple-800",
			icon: <Package className="w-3 h-3 mr-1" />,
		},
		completed: {
			label: "Completado",
			color:
				"bg-emerald-100 text-emerald-800",
			icon: <CheckCircle className="w-3 h-3 mr-1" />,
		},
		cancelled: {
			label: "Cancelado",
			color: "bg-red-100 text-red-800",
			icon: <XCircle className="w-3 h-3 mr-1" />,
		},
		returned: {
			label: "Devuelto",
			color:
				"bg-orange-100 text-orange-800",
			icon: <RotateCcw className="w-3 h-3 mr-1" />,
		},
		ready_for_pickup: {
			label: "Listo para recoger",
			color:
				"bg-purple-100 text-purple-800",
			icon: <ShoppingBag className="w-3 h-3 mr-1" />,
		},
	};

	// Mapeo de estado de pago
	const paymentStatusMap: Record<string, {label: string; color: string}> = {
		paid: {
			label: "Pagado",
			color:
				"bg-green-100 text-green-800",
		},
		completed: {
			label: "Completado",
			color:
				"bg-green-100 text-green-800",
		},
		pending: {
			label: "Pendiente",
			color:
				"bg-yellow-100 text-yellow-800",
		},
		refunded: {
			label: "Reembolsado",
			color: "bg-red-100 text-red-800",
		},
		failed: {
			label: "Fallido",
			color: "bg-gray-100 text-gray-800",
		},
	};

	// Mapeo de métodos de pago
	const paymentMethodMap: Record<string, string> = {
		credit_card: "Tarjeta de crédito",
		paypal: "PayPal",
		bank_transfer: "Transferencia bancaria",
		cash_on_delivery: "Contra reembolso",
	};

	// Obtener siguiente estado del pedido
	const getNextStatus = (currentStatus: string): string => {
		const statusFlow: Record<string, string> = {
			pending: "processing",
			processing: "shipped",
			shipped: "delivered",
			delivered: "completed",
		};

		return statusFlow[currentStatus] || currentStatus;
	};

	// Actualizar estado del pedido
	const updateOrderStatus = async (orderId: number, newStatus: string) => {
		setLoading(true);
		try {
			const success = await orderAdapter.updateOrderStatus(
				orderId,
				newStatus as any
			);

			if (success) {
				// Actualizar el estado localmente o recargar los datos
				setOrders((prevOrders) =>
					prevOrders.map((order) => {
						if (order.id === orderId) {
							return {
								...order,
								status: newStatus,
								updatedAt: new Date().toISOString(),
							};
						}
						return order;
					})
				);
			} else {
				// Mostrar mensaje de error
				alert("Error al actualizar el estado de la orden");
			}
		} catch (error) {
			console.error("Error al actualizar estado:", error);
			alert("Error al actualizar el estado de la orden");
		} finally {
			setLoading(false);
		}
	};

	// Avanzar al siguiente estado
	const advanceOrderStatus = (orderId: number, currentStatus: string) => {
		const nextStatus = getNextStatus(currentStatus);
		if (nextStatus !== currentStatus) {
			updateOrderStatus(orderId, nextStatus);
		}
	};

	// Cancelar pedido
	const cancelOrder = async (orderId: number) => {
		if (window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
			setLoading(true);
			try {
				const success = await orderAdapter.cancelOrder(orderId);

				if (success) {
					// Actualizar el estado localmente o recargar los datos
					setOrders((prevOrders) =>
						prevOrders.map((order) => {
							if (order.id === orderId) {
								return {
									...order,
									status: "cancelled",
									updatedAt: new Date().toISOString(),
								};
							}
							return order;
						})
					);
				} else {
					// Mostrar mensaje de error
					alert("Error al cancelar la orden");
				}
			} catch (error) {
				console.error("Error al cancelar orden:", error);
				alert("Error al cancelar la orden");
			} finally {
				setLoading(false);
			}
		}
	};

	// Formatear moneda
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("es-ES", {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 2,
		}).format(amount);
	};

	// Formatear fecha
	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return "N/A";

		const date = new Date(dateString);
		return new Intl.DateTimeFormat("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
	};

	// Refrescar datos
	const refreshData = () => {
		fetchOrders();
	};

	// Manejar cambios en filtros
	const handleFilterChange = (
		filterName: string,
		value: string | number | null
	) => {
		setFilters((prev) => ({
			...prev,
			[filterName]: value,
		}));

		// Resetear a la primera página al cambiar filtros
		setPagination((prev) => ({
			...prev,
			currentPage: 1,
		}));
	};

	// Limpiar filtros
	const clearFilters = () => {
		setFilters({
			status: "all",
			paymentStatus: "all",
			sellerId: null,
			dateFrom: undefined,
			dateTo: undefined,
			search: undefined,
		});
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "orderNumber",
			header: "Pedido",
			sortable: true,
			render: (order: AdminOrderUI) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
						<ShoppingBag className="h-6 w-6 text-primary-600" />
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900">
							{order.orderNumber}
						</div>
						<div className="text-xs text-gray-500 flex items-center">
							<Calendar className="w-3 h-3 mr-1" />
							{formatDate(order.date)}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "customer",
			header: "Cliente",
			sortable: true,
			render: (order: AdminOrderUI) => {
				const customerName =
					order.customer.name || `Usuario ${order.customer.id}`;
				return (
					<div className="flex items-center">
						<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
							<User className="h-4 w-4 text-gray-500" />
						</div>
						<div className="ml-3">
							<div className="text-sm font-medium text-gray-900">
								{customerName}
							</div>
							<div className="text-xs text-gray-500">
								ID: {order.customer.id}
							</div>
						</div>
					</div>
				);
			},
		},
		{
			key: "items",
			header: "Productos",
			render: (order: AdminOrderUI) => (
				<div className="text-sm">
					<span className="font-medium">{order.items.length}</span> producto(s)
					{order.items.length > 0 && (
						<div className="text-xs text-gray-500 mt-1">
							{order.items.slice(0, 2).map((item) => (
								<div key={item.id}>
									{item.quantity}x {item.name || `Producto ${item.productId}`}
								</div>
							))}
							{order.items.length > 2 && (
								<div>+ {order.items.length - 2} más...</div>
							)}
						</div>
					)}
				</div>
			),
		},
		{
			key: "total",
			header: "Total",
			sortable: true,
			render: (order: AdminOrderUI) => (
				<div className="font-medium text-gray-900">
					{formatCurrency(order.total)}
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (order: AdminOrderUI) => {
				const status = orderStatusMap[order.status] || {
					label: order.status,
					color:
						"bg-gray-100 text-gray-800",
					icon: <AlertTriangle className="w-3 h-3 mr-1" />,
				};

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
					>
						{status.icon}
						{status.label}
					</span>
				);
			},
		},
		{
			key: "payment",
			header: "Pago",
			sortable: true,
			render: (order: AdminOrderUI) => {
				const paymentMethod =
					paymentMethodMap[order.paymentMethod || ""] || order.paymentMethod;
				const paymentStatus = paymentStatusMap[
					order.paymentStatus || "pending"
				] || {
					label: order.paymentStatus,
					color:
						"bg-gray-100 text-gray-800",
				};

				return (
					<div>
						<div className="text-sm text-gray-500">
							{paymentMethod}
						</div>
						<span
							className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatus.color}`}
						>
							{paymentStatus.label}
						</span>
					</div>
				);
			},
		},
		{
			key: "actions",
			header: "Acciones",
			render: (order: AdminOrderUI) => {
				const canAdvance = [
					"pending",
					"processing",
					"shipped",
					"delivered",
				].includes(order.status);
				const canCancel = ["pending", "processing"].includes(order.status);

				return (
					<div className="flex justify-end space-x-2">
						{/* Ver detalles */}
						<Link
							to={`/admin/orders/${order.id}`}
							className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
							title="Ver detalles del pedido"
						>
							<Eye size={18} />
						</Link>

						{/* Ver factura si está completado */}
						{["completed", "delivered"].includes(order.status) && (
							<Link
								to={`/admin/invoices?orderId=${order.id}`}
								className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md"
								title="Ver factura"
							>
								<FileText size={18} />
							</Link>
						)}

						{/* Avanzar estado */}
						{canAdvance && (
							<button
								onClick={() => advanceOrderStatus(order.id, order.status)}
								className="p-1 text-green-600 hover:bg-green-100 rounded-md"
								title={`Avanzar a ${orderStatusMap[getNextStatus(order.status)]?.label || "siguiente estado"}`}
							>
								<CheckCircle size={18} />
							</button>
						)}

						{/* Cancelar pedido */}
						{canCancel && (
							<button
								onClick={() => cancelOrder(order.id)}
								className="p-1 text-red-600 hover:bg-red-100 rounded-md"
								title="Cancelar pedido"
							>
								<XCircle size={18} />
							</button>
						)}
					</div>
				);
			},
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					Gestión de Pedidos
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
			<div className="bg-white rounded-lg shadow-sm p-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Filtro de Estado */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600">
							Estado del pedido
						</label>
						<div className="flex items-center">
							<Filter className="h-5 w-5 text-gray-500 mr-2" />
							<select
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								value={filters.status}
								onChange={(e) => handleFilterChange("status", e.target.value)}
							>
								<option value="all">Todos los Estados</option>
								{Object.entries(orderStatusMap).map(([key, {label}]) => (
									<option key={key} value={key}>
										{label}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Filtro de Estado de Pago */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600">
							Estado de pago
						</label>
						<select
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={filters.paymentStatus}
							onChange={(e) =>
								handleFilterChange("paymentStatus", e.target.value)
							}
						>
							<option value="all">Todos los Estados</option>
							{Object.entries(paymentStatusMap).map(([key, {label}]) => (
								<option key={key} value={key}>
									{label}
								</option>
							))}
						</select>
					</div>

					{/* Filtro de Vendedor */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600">
							Vendedor
						</label>
						<select
							className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={filters.sellerId === null ? "null" : filters.sellerId}
							onChange={(e) =>
								handleFilterChange(
									"sellerId",
									e.target.value === "null" ? null : Number(e.target.value)
								)
							}
						>
							<option value="null">Todos los Vendedores</option>
							{/* Aquí deberíamos obtener la lista de vendedores de la API */}
							{/* Por ahora usamos los que venían en los datos de ejemplo */}
							{[1, 2, 3, 4, 5].map((sellerId) => (
								<option key={sellerId} value={sellerId}>
									Vendedor {sellerId}
								</option>
							))}
						</select>
					</div>

					{/* Filtro de Rango de Fechas */}
					<div className="flex flex-col space-y-1">
						<label className="text-sm text-gray-600">
							Rango de fechas
						</label>
						<div className="grid grid-cols-2 gap-2">
							<input
								type="date"
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								value={filters.dateFrom || ""}
								onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
								placeholder="Desde"
							/>
							<input
								type="date"
								className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								value={filters.dateTo || ""}
								onChange={(e) => handleFilterChange("dateTo", e.target.value)}
								placeholder="Hasta"
							/>
						</div>
					</div>
				</div>
				<div className="mt-4 flex justify-end">
					<button
						onClick={clearFilters}
						className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
					>
						Limpiar filtros
					</button>
				</div>
			</div>

			{/* Tabla de Pedidos */}
			<Table
				data={orders}
				columns={columns}
				searchFields={["orderNumber", "customer.name", "customer.email"]}
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

export default AdminOrdersPage;
