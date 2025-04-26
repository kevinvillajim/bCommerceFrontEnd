import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {
	Truck,
	Search,
	Filter,
	RefreshCw,
	ExternalLink,
	PackageCheck,
	Printer,
	AlertTriangle,
	Package,
	MapPin,
	ClipboardList,
	BarChart2,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import {SellerStatCardList} from "../../components/dashboard/SellerStatCardList";
import ShippingServiceAdapter from "../../../core/adapters/ShippingServiceAdapter";
import type {ShippingItem} from "../../../core/adapters/ShippingServiceAdapter";
import ShippingFormModal from "../../components/shipping/ShippingFormModal";
import type {ShippingFormData} from "../../components/shipping/ShippingFormModal";

const SellerShippingPage: React.FC = () => {
	// Instanciar el adaptador de servicio
	const shippingAdapter = new ShippingServiceAdapter();

	// Estados
	const [shippingItems, setShippingItems] = useState<ShippingItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [carrierFilter, setCarrierFilter] = useState<string>("all");
	const [dateFilter, setDateFilter] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});
	const [dateRange, setDateRange] = useState({
		from: "",
		to: "",
	});
	const [isUpdateSuccess, setIsUpdateSuccess] = useState<boolean | null>(null);
	const [updateMessage, setUpdateMessage] = useState<string>("");
	const [isUpdating, setIsUpdating] = useState(false);

	// Estado para controlar el modal de asignación de tracking
	const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

	// Cargar datos de envíos
	useEffect(() => {
		fetchShippingItems();
	}, [
		statusFilter,
		carrierFilter,
		searchTerm,
		pagination.currentPage,
		dateFilter,
		dateRange,
	]);

	// Función para obtener envíos usando el adaptador
	const fetchShippingItems = async () => {
		setLoading(true);
		setError(null);
		try {
			// Preparar filtros para la API
			const filters: any = {
				page: pagination.currentPage,
				limit: pagination.itemsPerPage,
			};

			if (statusFilter !== "all") {
				filters.status = statusFilter;
			}

			if (carrierFilter !== "all") {
				filters.carrier = carrierFilter;
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

			// Obtener envíos del adaptador
			const result = await shippingAdapter.getShippingsList(filters);

			console.log("Datos de envío obtenidos:", result);

			// Establecer envíos y datos de paginación
			setShippingItems(result.items);
			setPagination(result.pagination);
		} catch (error) {
			console.error("Error al cargar envíos:", error);
			setError(
				"No se pudieron cargar los datos de envíos. Intenta de nuevo más tarde."
			);
		} finally {
			setLoading(false);
		}
	};

	// Manejar asignación de número de seguimiento
	const openShippingModal = (orderId: string) => {
		setSelectedOrderId(orderId);
		setIsShippingModalOpen(true);
	};

	// Procesar envío con datos del formulario
	const handleShippingSubmit = async (shippingData: ShippingFormData) => {
		if (!selectedOrderId) return;

		setIsUpdating(true);
		setIsUpdateSuccess(null);
		setUpdateMessage("");

		try {
			const success = await shippingAdapter.markAsShipped(
				selectedOrderId,
				shippingData
			);

			if (success) {
				setIsUpdateSuccess(true);
				setUpdateMessage("Envío procesado correctamente");

				// Actualizar el estado del envío en la lista local
				setShippingItems((prevItems) =>
					prevItems.map((item) => {
						if (item.id === selectedOrderId) {
							return {
								...item,
								status: "shipped", // Ajustado según el nuevo estado
								trackingNumber: shippingData.tracking_number,
								carrier: shippingData.shipping_company,
								estimatedDelivery: shippingData.estimated_delivery,
								lastUpdate: new Date().toISOString(),
							};
						}
						return item;
					})
				);

				// Cerrar el modal
				setIsShippingModalOpen(false);

				// Recargar los datos después de un breve retraso
				setTimeout(() => {
					fetchShippingItems();
					setIsUpdateSuccess(null);
				}, 3000);
			} else {
				throw new Error("No se pudo procesar el envío");
			}
		} catch (error) {
			console.error("Error al procesar envío:", error);
			setIsUpdateSuccess(false);
			setUpdateMessage("Error al procesar el envío. Intenta de nuevo.");
		} finally {
			setIsUpdating(false);
		}
	};

	// Función para actualizar estado de envío
	const updateShippingStatus = async (
		shippingId: string,
		newStatus: ShippingItem["status"]
	) => {
		setIsUpdating(true);
		setIsUpdateSuccess(null);
		setUpdateMessage("");

		try {
			const success = await shippingAdapter.updateShippingStatus(
				shippingId,
				newStatus
			);

			if (success) {
				setIsUpdateSuccess(true);
				setUpdateMessage(`Estado actualizado a ${getStatusText(newStatus)}`);

				// Actualizar el estado en la lista local
				setShippingItems((prevItems) =>
					prevItems.map((item) => {
						if (item.id === shippingId) {
							return {
								...item,
								status: newStatus,
								lastUpdate: new Date().toISOString(),
							};
						}
						return item;
					})
				);

				// Recargar los datos después de un breve retraso
				setTimeout(() => {
					fetchShippingItems();
					setIsUpdateSuccess(null);
				}, 3000);
			} else {
				throw new Error("No se pudo actualizar el estado");
			}
		} catch (error) {
			console.error(`Error al actualizar estado a ${newStatus}:`, error);
			setIsUpdateSuccess(false);
			setUpdateMessage("Error al actualizar estado. Intenta de nuevo.");
		} finally {
			setIsUpdating(false);
		}
	};

	// Función para asignar número de seguimiento
	const assignTrackingNumber = async (orderId: string) => {
		// Abrir el modal para capturar los datos de seguimiento
		openShippingModal(orderId);
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
	};

	// Refrescar datos
	const refreshData = () => {
		setLoading(true);
		fetchShippingItems();
	};

	// Obtener texto según el estado
	const getStatusText = (status: ShippingItem["status"]): string => {
		switch (status) {
			case "pending":
				return "Pendiente";
			case "ready_to_ship":
				return "Listo para enviar";
			case "in_transit":
			case "shipped": // Añadido para manejar el nuevo estado
				return "En tránsito";
			case "delivered":
				return "Entregado";
			case "failed":
				return "Fallido";
			case "returned":
				return "Devuelto";
			default:
				return "Desconocido";
		}
	};

	// Obtener clase CSS según el estado
	const getStatusClass = (status: ShippingItem["status"]): string => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "ready_to_ship":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "in_transit":
			case "shipped": // Añadido para manejar el nuevo estado
				return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
			case "delivered":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "failed":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			case "returned":
				return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	// Definir las columnas de la tabla
	const columns = [
		{
			key: "orderNumber",
			header: "Nº Pedido",
			sortable: true,
			render: (item: ShippingItem) => (
				<Link
					to={`/seller/orders/${item.orderId}`}
					className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
				>
					{item.orderNumber}
				</Link>
			),
		},
		{
			key: "trackingNumber",
			header: "Nº Seguimiento",
			sortable: true,
			render: (item: ShippingItem) => (
				<div>
					{item.trackingNumber ? (
						<div className="flex items-center">
							<span className="font-mono text-sm">{item.trackingNumber}</span>
							{item.carrier && (
								<a
									href="#"
									className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
									title={`Rastrear con ${item.carrier}`}
									onClick={(e) => {
										e.preventDefault();
										// Aquí se podría abrir una ventana de rastreo del transportista
										alert(
											`Redirigiendo al sitio de ${item.carrier} para rastrear ${item.trackingNumber}`
										);
									}}
								>
									<ExternalLink size={14} />
								</a>
							)}
						</div>
					) : (
						<span className="text-gray-500 dark:text-gray-400 text-sm">
							No asignado
						</span>
					)}
				</div>
			),
		},
		{
			key: "date",
			header: "Fecha de Pedido",
			sortable: true,
			render: (item: ShippingItem) => {
				const date = new Date(item.date);
				return (
					<span className="text-sm">{date.toLocaleDateString("es-ES")}</span>
				);
			},
		},
		{
			key: "customer",
			header: "Cliente",
			sortable: true,
			render: (item: ShippingItem) => (
				<div>
					<div className="font-medium text-sm">{item.customer.name}</div>
					<div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
						{item.shippingAddress}
					</div>
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (item: ShippingItem) => {
				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}
					>
						{getStatusText(item.status)}
					</span>
				);
			},
		},
		{
			key: "carrier",
			header: "Transportista",
			sortable: true,
			render: (item: ShippingItem) => (
				<span>{item.carrier || "No asignado"}</span>
			),
		},
		{
			key: "estimatedDelivery",
			header: "Entrega Estimada",
			sortable: true,
			render: (item: ShippingItem) => (
				<span>
					{item.estimatedDelivery
						? new Date(item.estimatedDelivery).toLocaleDateString("es-ES")
						: "No disponible"}
				</span>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (item: ShippingItem) => (
				<div className="flex justify-end space-x-2">
					{/* Ver detalles del envío */}
					<Link
						to={`/seller/shipping/${item.id}`}
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
						title="Ver detalles"
					>
						<ClipboardList size={18} />
					</Link>

					{/* Asignar número de seguimiento - solo para pendientes */}
					{(item.status === "pending" || item.status === "ready_to_ship") &&
						!item.trackingNumber && (
							<button
								onClick={() => assignTrackingNumber(item.id)}
								className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
								title="Asignar número de seguimiento"
								disabled={isUpdating}
							>
								<Package size={18} />
							</button>
						)}

					{/* Marcar como enviado - solo para listos para enviar con tracking */}
					{(item.status === "ready_to_ship" || item.status === "pending") &&
						item.trackingNumber && (
							<button
								onClick={() => updateShippingStatus(item.id, "shipped")}
								className="p-1 text-indigo-600 hover:bg-indigo-100 rounded-md dark:text-indigo-400 dark:hover:bg-indigo-900"
								title="Marcar como enviado"
								disabled={isUpdating}
							>
								<Truck size={18} />
							</button>
						)}

					{/* Imprimir etiqueta - solo para pedidos con número de seguimiento */}
					{item.trackingNumber &&
						(item.status === "shipped" || item.status === "in_transit") && (
							<button
								onClick={() =>
									alert(`Imprimiendo etiqueta para ${item.trackingNumber}`)
								}
								className="p-1 text-gray-600 hover:bg-gray-100 rounded-md dark:text-gray-400 dark:hover:bg-gray-800"
								title="Imprimir etiqueta"
								disabled={isUpdating}
							>
								<Printer size={18} />
							</button>
						)}

					{/* Marcar como entregado - solo para envíos en tránsito */}
					{(item.status === "in_transit" || item.status === "shipped") && (
						<button
							onClick={() => updateShippingStatus(item.id, "delivered")}
							className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
							title="Marcar como entregado"
							disabled={isUpdating}
						>
							<PackageCheck size={18} />
						</button>
					)}

					{/* Marcar como fallido - para envíos pendientes, listos o en tránsito */}
					{(item.status === "ready_to_ship" ||
						item.status === "in_transit" ||
						item.status === "shipped" ||
						item.status === "pending") && (
						<button
							onClick={() => updateShippingStatus(item.id, "failed")}
							className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
							title="Marcar como fallido"
							disabled={isUpdating}
						>
							<AlertTriangle size={18} />
						</button>
					)}
				</div>
			),
		},
	];

	// Calcular estadísticas de envíos
	const calculateShippingStats = () => {
		const stats = {
			pending: shippingItems.filter((item) => item.status === "pending").length,
			readyToShip: shippingItems.filter(
				(item) => item.status === "ready_to_ship"
			).length,
			inTransit: shippingItems.filter(
				(item) => item.status === "in_transit" || item.status === "shipped"
			).length,
			delivered: shippingItems.filter((item) => item.status === "delivered")
				.length,
			failed: shippingItems.filter((item) => item.status === "failed").length,
			returned: shippingItems.filter((item) => item.status === "returned")
				.length,
			// Calcular costo de envío total (si está disponible)
			totalShippingCost: shippingItems.reduce(
				(sum, item) => sum + (item.shippingCost || 0),
				0
			),
		};

		return [
			{
				label: "Pendientes",
				value: stats.pending,
				icon: (
					<Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
				),
				color: "yellow",
			},
			{
				label: "Listos",
				value: stats.readyToShip,
				icon: <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
				color: "blue",
			},
			{
				label: "En Tránsito",
				value: stats.inTransit,
				icon: (
					<Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
				),
				color: "indigo",
			},
			{
				label: "Entregados",
				value: stats.delivered,
				icon: (
					<PackageCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
				),
				color: "green",
			},
			{
				label: "Fallidos",
				value: stats.failed,
				icon: (
					<AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
				),
				color: "red",
			},
			{
				label: "Devueltos",
				value: stats.returned,
				icon: (
					<MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
				),
				color: "orange",
			},
			{
				label: "Coste Envíos",
				value: formatCurrency(stats.totalShippingCost),
				icon: (
					<BarChart2 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
				),
				color: "primary",
			},
		];
	};

	return (
		<div className="space-y-6">
			{/* Modal para asignación de número de seguimiento */}
			<ShippingFormModal
				orderId={selectedOrderId || ""}
				isOpen={isShippingModalOpen}
				onClose={() => setIsShippingModalOpen(false)}
				onSubmit={handleShippingSubmit}
				isLoading={isUpdating}
			/>

			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Gestión de Envíos
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						disabled={isUpdating}
					>
						<RefreshCw size={18} className="inline mr-2" />
						Actualizar
					</button>
				</div>
			</div>

			{/* Mensajes de éxito/error */}
			{isUpdateSuccess === true && (
				<div
					className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<span className="block sm:inline">{updateMessage}</span>
				</div>
			)}

			{isUpdateSuccess === false && (
				<div
					className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<span className="block sm:inline">{updateMessage}</span>
				</div>
			)}

			{error && (
				<div
					className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			{/* Panel de filtros */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Buscador */}
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Buscar por número de pedido, seguimiento, cliente..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					</div>

					{/* Filtro de Estado */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los estados</option>
							<option value="pending">Pendientes</option>
							<option value="ready_to_ship">Listos para enviar</option>
							<option value="shipped">En tránsito</option>
							<option value="delivered">Entregados</option>
							<option value="failed">Fallidos</option>
							<option value="returned">Devueltos</option>
						</select>
					</div>

					{/* Filtro de Transportista */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={carrierFilter}
							onChange={(e) => setCarrierFilter(e.target.value)}
						>
							<option value="all">Todos los transportistas</option>
							<option value="Correos Express">Correos Express</option>
							<option value="SEUR">SEUR</option>
							<option value="MRW">MRW</option>
							<option value="DHL">DHL</option>
							<option value="FedEx">FedEx</option>
							<option value="UPS">UPS</option>
						</select>
					</div>

					{/* Filtro de Fecha */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
									className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
									value={dateRange.from}
									onChange={(e) =>
										setDateRange({...dateRange, from: e.target.value})
									}
								/>
								<span className="text-gray-500 dark:text-gray-400">a</span>
								<input
									type="date"
									className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
							setCarrierFilter("all");
							setDateFilter("all");
							setSearchTerm("");
							setDateRange({from: "", to: ""});
						}}
						className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						Limpiar filtros
					</button>
				</div>
			</div>

			{/* Estadísticas resumidas */}
			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
				<SellerStatCardList items={calculateShippingStats()} />
			</div>

			{/* Tabla de Envíos */}
			<Table
				data={shippingItems}
				columns={columns}
				searchFields={[
					"orderNumber",
					"trackingNumber",
					"customer",
					"shippingAddress",
				]}
				loading={loading}
				emptyMessage="No se encontraron envíos"
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

export default SellerShippingPage;
