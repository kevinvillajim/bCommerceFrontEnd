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
	ChevronDown,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import {SellerStatCardList} from "../../components/dashboard/SellerStatCardList";
import ShippingServiceAdapter from "../../../core/adapters/ShippingServiceAdapter";
import type {ShippingItem} from "../../../core/adapters/ShippingServiceAdapter";
import ShippingFormModal from "../../components/shipping/ShippingFormModal";
import type {ShippingFormData} from "../../components/shipping/ShippingFormModal";

// Componente Dropdown para cambiar estado de envío
const ShippingStatusDropdown: React.FC<{
	currentStatus: ShippingItem["status"];
	shippingId: string;
	onStatusChange: (id: string, status: ShippingItem["status"]) => Promise<void>;
	disabled?: boolean;
}> = ({ currentStatus, shippingId, onStatusChange, disabled = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);

	// Mapeo de estados con labels amigables
	const SHIPPING_STATUSES = [
		{ value: 'pending' as const, label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
		{ value: 'ready_to_ship' as const, label: 'Listo para enviar', color: 'bg-blue-100 text-blue-800' },
		{ value: 'shipped' as const, label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
		{ value: 'in_transit' as const, label: 'En tránsito', color: 'bg-indigo-100 text-indigo-800' },
		{ value: 'delivered' as const, label: 'Entregado', color: 'bg-green-100 text-green-800' },
		{ value: 'failed' as const, label: 'Fallido', color: 'bg-red-100 text-red-800' },
		{ value: 'returned' as const, label: 'Devuelto', color: 'bg-orange-100 text-orange-800' },
	];

	// Encontrar el estado actual para mostrar
	const currentStatusInfo = SHIPPING_STATUSES.find(s => s.value === currentStatus) || SHIPPING_STATUSES[0];

	const handleStatusChange = async (newStatus: ShippingItem["status"]) => {
		if (newStatus === currentStatus || isUpdating) return;
		
		setIsUpdating(true);
		setIsOpen(false);
		
		try {
			await onStatusChange(shippingId, newStatus);
		} catch (error) {
			console.error('Error al actualizar estado:', error);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="relative inline-block text-left">
			{/* Botón principal */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				disabled={disabled || isUpdating}
				className={`
					inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full
					${currentStatusInfo.color}
					${disabled || isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}
					transition-all duration-200
				`}
			>
				<span className={`w-2 h-2 rounded-full ${
					isUpdating ? 'animate-pulse bg-current' : 'bg-current'
				}`}></span>
				{isUpdating ? 'Actualizando...' : currentStatusInfo.label}
				
				{/* Icono de flecha */}
				<ChevronDown 
					className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>

			{/* Dropdown menu */}
			{isOpen && !disabled && !isUpdating && (
				<>
					{/* Overlay para cerrar */}
					<div 
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					></div>
					
					{/* Menu - CORREGIDO: posicionamiento absoluto hacia abajo */}
					<div className="absolute top-full left-0 z-20 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
						<div className="flex flex-col divide-y divide-gray-200">
							{SHIPPING_STATUSES.map((status) => (
								<button
									key={status.value}
									onClick={() => handleStatusChange(status.value)}
									className={`
										w-full cursor-pointer text-left px-4 py-2 text-sm transition-colors duration-150
										${status.value === currentStatus 
											? 'bg-gray-100 text-gray-900 font-medium' 
											: 'text-gray-700 hover:bg-gray-50'
										}
									`}
								>
									<div className="flex items-center gap-3">
										<span className={`w-2 h-2 rounded-full ${
											status.color.includes('bg-yellow') ? 'bg-yellow-500' :
											status.color.includes('bg-blue') ? 'bg-blue-500' :
											status.color.includes('bg-purple') ? 'bg-purple-500' :
											status.color.includes('bg-indigo') ? 'bg-indigo-500' :
											status.color.includes('bg-green') ? 'bg-green-500' :
											status.color.includes('bg-red') ? 'bg-red-500' :
											status.color.includes('bg-orange') ? 'bg-orange-500' :
											'bg-gray-400'
										}`}></span>
										<span>{status.label}</span>
										{status.value === currentStatus && (
											<span className="ml-auto text-xs text-gray-500">Actual</span>
										)}
									</div>
								</button>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

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

			console.log("Cargando envíos con filtros:", filters);

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
		if (!selectedOrderId) {
			setIsUpdateSuccess(false);
			setUpdateMessage("Error: No se ha seleccionado un pedido válido");
			return;
		}

		setIsUpdating(true);
		setIsUpdateSuccess(null);
		setUpdateMessage("");

		try {
			console.log("Procesando envío para orden:", selectedOrderId, shippingData);

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
						if (item.orderId === selectedOrderId) {
							return {
								...item,
								status: "shipped",
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
				setSelectedOrderId(null);

				// Recargar los datos después de un breve retraso
				setTimeout(() => {
					fetchShippingItems();
					setIsUpdateSuccess(null);
				}, 3000);
			} else {
				throw new Error("El servidor no pudo procesar el envío");
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
			console.log(`Actualizando estado del envío ${shippingId} a ${newStatus}`);

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
				throw new Error("El servidor no pudo actualizar el estado");
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
		setError(null);
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
			case "shipped":
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
				return "bg-yellow-100 text-yellow-800";
			case "ready_to_ship":
				return "bg-blue-100 text-blue-800";
			case "in_transit":
			case "shipped":
				return "bg-indigo-100 text-indigo-800";
			case "delivered":
				return "bg-green-100 text-green-800";
			case "failed":
				return "bg-red-100 text-red-800";
			case "returned":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
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
					className="font-medium text-primary-600 hover:underline"
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
								<button
									onClick={() => {
										alert(
											`Redirigiendo al sitio de ${item.carrier} para rastrear ${item.trackingNumber}`
										);
									}}
									className="ml-2 text-blue-600 hover:text-blue-800"
									title={`Rastrear con ${item.carrier}`}
								>
									<ExternalLink size={14} />
								</button>
							)}
						</div>
					) : (
						<span className="text-gray-500 text-sm">
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
					<div className="text-xs text-gray-500 truncate max-w-[150px]">
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
				// ✅ NUEVO: Usar el dropdown en lugar del badge estático
				return (
					<ShippingStatusDropdown
						currentStatus={item.status}
						shippingId={item.id}
						onStatusChange={updateShippingStatus}
						disabled={isUpdating}
					/>
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
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
						title="Ver detalles"
					>
						<ClipboardList size={18} />
					</Link>

					{/* Asignar número de seguimiento - solo para pendientes */}
					{(item.status === "pending" || item.status === "ready_to_ship") &&
						!item.trackingNumber && (
							<button
								onClick={() => assignTrackingNumber(item.orderId)}
								className="p-1 text-green-600 hover:bg-green-100 rounded-md"
								title="Asignar número de seguimiento"
								disabled={isUpdating}
							>
								<Package size={18} />
							</button>
						)}

					{/* Imprimir etiqueta - solo para pedidos con número de seguimiento */}
					{item.trackingNumber &&
						(item.status === "shipped" || item.status === "in_transit") && (
							<button
								onClick={() =>
									alert(`Imprimiendo etiqueta para ${item.trackingNumber}`)
								}
								className="p-1 text-gray-600 hover:bg-gray-100 rounded-md"
								title="Imprimir etiqueta"
								disabled={isUpdating}
							>
								<Printer size={18} />
							</button>
						)}

					{/* ✅ MANTENER: Marcar como fallido - para envíos pendientes, listos o en tránsito */}
					{(item.status === "ready_to_ship" ||
						item.status === "in_transit" ||
						item.status === "shipped" ||
						item.status === "pending") && (
						<button
							onClick={() => updateShippingStatus(item.id, "failed")}
							className="p-1 text-red-600 hover:bg-red-100 rounded-md"
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
					<Package className="h-5 w-5 text-yellow-600" />
				),
				color: "yellow",
			},
			{
				label: "Listos",
				value: stats.readyToShip,
				icon: <Package className="h-5 w-5 text-blue-600" />,
				color: "blue",
			},
			{
				label: "En Tránsito",
				value: stats.inTransit,
				icon: (
					<Truck className="h-5 w-5 text-indigo-600" />
				),
				color: "indigo",
			},
			{
				label: "Entregados",
				value: stats.delivered,
				icon: (
					<PackageCheck className="h-5 w-5 text-green-600" />
				),
				color: "green",
			},
			{
				label: "Fallidos",
				value: stats.failed,
				icon: (
					<AlertTriangle className="h-5 w-5 text-red-600" />
				),
				color: "red",
			},
			{
				label: "Devueltos",
				value: stats.returned,
				icon: (
					<MapPin className="h-5 w-5 text-orange-600" />
				),
				color: "orange",
			},
			{
				label: "Coste Envíos",
				value: formatCurrency(stats.totalShippingCost),
				icon: (
					<BarChart2 className="h-5 w-5 text-primary-600" />
				),
				color: "primary",
			},
		];
	};

	return (
		<div className="space-y-6">
			{/* Modal para asignación de número de seguimiento mejorado */}
			<ShippingFormModal
				orderId={selectedOrderId || ""}
				orderNumber={shippingItems.find(item => item.orderId === selectedOrderId)?.orderNumber}
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
					Gestión de Envíos
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						disabled={isUpdating || loading}
					>
						<RefreshCw size={18} className={`inline mr-2 ${loading ? "animate-spin" : ""}`} />
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
			<div className="bg-white rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Buscador */}
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Buscar por número de pedido, seguimiento, cliente..."
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
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

					{/* Botón para limpiar filtros */}
					<button
						onClick={() => {
							setStatusFilter("all");
							setCarrierFilter("all");
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