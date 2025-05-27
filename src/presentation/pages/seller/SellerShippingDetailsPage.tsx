import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {
	ArrowLeft,
	Truck,
	Package,
	PackageCheck,
	Printer,
	AlertTriangle,
	MapPin,
	RefreshCw,
	Calendar,
	Check,
	X,
	Clock,
	ExternalLink,
} from "lucide-react";
import ShippingServiceAdapter from "../../../core/adapters/ShippingServiceAdapter";
import type {
	ShippingItem,
	ShippingHistoryItem,
	ShippingRouteItem,
} from "../../../core/adapters/ShippingServiceAdapter";

const SellerShippingDetailsPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const [shipping, setShipping] = useState<ShippingItem | null>(null);
	const [shippingHistory, setShippingHistory] = useState<ShippingHistoryItem[]>(
		[]
	);
	const [shippingRoute, setShippingRoute] = useState<ShippingRouteItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);
	const [updateMessage, setUpdateMessage] = useState<string>("");

	// Instanciar el adaptador de servicio
	const shippingAdapter = new ShippingServiceAdapter();

	// Cargar detalles del envío
	useEffect(() => {
		if (!id) return;
		fetchShippingDetails();
	}, [id]);

	// Función para obtener detalles del envío
	const fetchShippingDetails = async () => {
		setLoading(true);
		setError(null);
		try {
			// Obtener detalles del envío
			const shipment = await shippingAdapter.getShippingDetails(id || "");

			if (!shipment) {
				throw new Error("No se pudo obtener la información del envío");
			}

			setShipping(shipment);

			// Si hay número de seguimiento, obtener también el historial y la ruta
			if (shipment.trackingNumber) {
				try {
					// Obtener historial
					const history = await shippingAdapter.getShippingHistory(
						shipment.trackingNumber
					);
					setShippingHistory(history);

					// Obtener ruta (si está disponible)
					try {
						const route = await shippingAdapter.getShippingRoute(
							shipment.trackingNumber
						);
						setShippingRoute(route);
					} catch (routeError) {
						console.warn("No se pudo obtener la ruta del envío:", routeError);
						// No establecemos error para no interrumpir la visualización de los detalles
					}
				} catch (historyError) {
					console.warn("No se pudo obtener historial de envío:", historyError);
					// También añadimos un historial básico para mostrar al menos el estado actual
					setShippingHistory([
						{
							date: new Date().toISOString(),
							status: shipment.status,
							description: `Estado actual: ${getStatusText(shipment.status)}`,
						},
					]);
				}
			} else {
				// Si no hay número de seguimiento, añadir un elemento al historial con el estado actual
				setShippingHistory([
					{
						date: new Date().toISOString(),
						status: shipment.status,
						description: `Estado actual: ${getStatusText(shipment.status)}`,
					},
				]);
			}
		} catch (err) {
			console.error("Error al cargar detalles del envío:", err);
			setError(
				"No se pudo cargar la información del envío. Intenta de nuevo más tarde."
			);
		} finally {
			setLoading(false);
		}
	};

	// Función para actualizar el estado del envío
	const updateShippingStatus = async (newStatus: ShippingItem["status"]) => {
		if (!shipping) return;

		setIsUpdating(true);
		setUpdateSuccess(null);
		setUpdateMessage("");

		try {
			const success = await shippingAdapter.updateShippingStatus(
				shipping.id,
				newStatus
			);

			if (success) {
				setUpdateSuccess(true);
				setUpdateMessage(`Estado actualizado a ${getStatusText(newStatus)}`);

				// Actualizar el estado local
				setShipping((prev) => {
					if (!prev) return null;
					return {...prev, status: newStatus};
				});

				// Agregar nueva entrada al historial local
				const newHistoryEntry: ShippingHistoryItem = {
					date: new Date().toISOString(),
					status: newStatus,
					description: `Actualización de estado a: ${getStatusText(newStatus)}`,
				};

				setShippingHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);

				// Recargar detalles después de un breve retraso
				setTimeout(() => {
					fetchShippingDetails();
					setUpdateSuccess(null);
				}, 3000);
			} else {
				throw new Error("No se pudo actualizar el estado");
			}
		} catch (error) {
			console.error(`Error al actualizar estado a ${newStatus}:`, error);
			setUpdateSuccess(false);
			setUpdateMessage("Error al actualizar estado. Intenta de nuevo.");
		} finally {
			setIsUpdating(false);
		}
	};

	// Función para imprimir etiqueta
	const printShippingLabel = () => {
		if (!shipping || !shipping.trackingNumber) return;

		// Aquí iría la lógica real para imprimir la etiqueta
		// Por ahora, solo mostraremos un mensaje
		alert(`Imprimiendo etiqueta para envío ${shipping.trackingNumber}`);
	};

	// Obtener texto según el estado
	const getStatusText = (status: ShippingItem["status"]): string => {
		switch (status) {
			case "pending":
				return "Pendiente";
			case "ready_to_ship":
				return "Listo para enviar";
			case "in_transit":
			case "shipped": // Añadido para compatibilidad
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
			case "shipped": // Añadido para compatibilidad
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

	// Obtener icono según el estado
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "pending":
				return (
					<Package className="h-5 w-5 text-yellow-600" />
				);
			case "ready_to_ship":
				return <Package className="h-5 w-5 text-blue-600" />;
			case "in_transit":
			case "shipped": // Añadido para compatibilidad
				return (
					<Truck className="h-5 w-5 text-indigo-600" />
				);
			case "delivered":
				return (
					<PackageCheck className="h-5 w-5 text-green-600" />
				);
			case "failed":
				return (
					<AlertTriangle className="h-5 w-5 text-red-600" />
				);
			case "returned":
				return (
					<MapPin className="h-5 w-5 text-orange-600" />
				);
			default:
				return <Clock className="h-5 w-5 text-gray-500" />;
		}
	};

	// Función para formatear fecha
	const formatDate = (dateString: string): string => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("es-ES", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			});
		} catch (error) {
			return dateString;
		}
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
				<p className="mt-4 text-gray-700">
					Cargando detalles del envío...
				</p>
			</div>
		);
	}

	if (error || !shipping) {
		return (
			<div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto my-8">
				<div className="text-center">
					<div className="text-red-500 text-5xl mb-4">
						<X className="h-16 w-16 mx-auto" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Error al cargar el envío
					</h2>
					<p className="text-gray-600 mb-6">
						{error || "No se pudo encontrar el envío solicitado"}
					</p>
					<button
						onClick={() => navigate(-1)}
						className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
					>
						Volver
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Encabezado y acciones */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<button
						onClick={() => navigate(-1)}
						className="flex items-center text-gray-600 hover:text-primary-600 mb-2"
					>
						<ArrowLeft size={16} className="mr-1" />
						<span>Volver a envíos</span>
					</button>
					<h1 className="text-2xl font-bold text-gray-900">
						Envío para Pedido #{shipping.orderNumber}
					</h1>
				</div>

				<div className="flex flex-wrap gap-2">
					{/* Botones de acción según el estado actual */}
					{shipping.status === "pending" && (
						<button
							onClick={() => updateShippingStatus("ready_to_ship")}
							disabled={isUpdating}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
						>
							<Package size={18} />
							<span>Preparar envío</span>
						</button>
					)}

					{shipping.status === "ready_to_ship" && shipping.trackingNumber && (
						<button
							onClick={() => updateShippingStatus("shipped")}
							disabled={isUpdating}
							className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
						>
							<Truck size={18} />
							<span>Marcar como enviado</span>
						</button>
					)}

					{(shipping.status === "in_transit" ||
						shipping.status === "shipped") && (
						<button
							onClick={() => updateShippingStatus("delivered")}
							disabled={isUpdating}
							className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
						>
							<Check size={18} />
							<span>Marcar como entregado</span>
						</button>
					)}

					{(shipping.status === "ready_to_ship" ||
						shipping.status === "in_transit" ||
						shipping.status === "shipped") && (
						<button
							onClick={() => updateShippingStatus("failed")}
							disabled={isUpdating}
							className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
						>
							<X size={18} />
							<span>Marcar como fallido</span>
						</button>
					)}

					{/* Imprimir etiqueta */}
					{shipping.trackingNumber && (
						<button
							onClick={printShippingLabel}
							disabled={isUpdating}
							className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
						>
							<Printer size={18} />
							<span>Imprimir etiqueta</span>
						</button>
					)}

					{/* Refrescar datos */}
					<button
						onClick={fetchShippingDetails}
						disabled={isUpdating}
						className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
					>
						<RefreshCw size={18} />
						<span>Actualizar</span>
					</button>
				</div>
			</div>

			{/* Mensajes de éxito/error */}
			{updateSuccess === true && (
				<div
					className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<span className="block sm:inline">{updateMessage}</span>
				</div>
			)}

			{updateSuccess === false && (
				<div
					className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<span className="block sm:inline">{updateMessage}</span>
				</div>
			)}

			{isUpdating && (
				<div
					className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<div className="flex items-center">
						<div className="animate-spin mr-2 h-4 w-4 border-t-2 border-blue-500"></div>
						<span className="block sm:inline">Actualizando estado...</span>
					</div>
				</div>
			)}

			{/* Contenido principal */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Información general y estado */}
				<div className="col-span-3 md:col-span-1 space-y-6">
					{/* Tarjeta de estado */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Estado del envío
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-gray-600">
									Estado:
								</span>
								<span
									className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(shipping.status)}`}
								>
									{getStatusText(shipping.status)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">
									Transportista:
								</span>
								<span className="text-gray-900">
									{shipping.carrier || "No asignado"}
								</span>
							</div>
							{shipping.trackingNumber && (
								<div className="flex justify-between items-center">
									<span className="text-gray-600">
										Nº Seguimiento:
									</span>
									<div className="flex items-center">
										<span className="text-gray-900 font-mono">
											{shipping.trackingNumber}
										</span>
										{shipping.carrier && (
											<a
												href="#"
												className="ml-2 text-blue-600 hover:text-blue-800"
												title={`Rastrear con ${shipping.carrier}`}
												onClick={(e) => {
													e.preventDefault();
													// Aquí iría la lógica para abrir el sitio de rastreo del transportista
													alert(
														`Redirigiendo al sitio de ${shipping.carrier} para rastrear ${shipping.trackingNumber}`
													);
												}}
											>
												<ExternalLink size={14} />
											</a>
										)}
									</div>
								</div>
							)}
							{shipping.estimatedDelivery && (
								<div className="flex justify-between items-center">
									<span className="text-gray-600">
										Entrega estimada:
									</span>
									<span className="text-gray-900">
										{new Date(shipping.estimatedDelivery).toLocaleDateString(
											"es-ES"
										)}
									</span>
								</div>
							)}
							<div className="flex justify-between items-center">
								<span className="text-gray-600">
									Fecha de pedido:
								</span>
								<span className="text-gray-900">
									{new Date(shipping.date).toLocaleDateString("es-ES")}
								</span>
							</div>
							{shipping.lastUpdate && (
								<div className="flex justify-between items-center">
									<span className="text-gray-600">
										Última actualización:
									</span>
									<span className="text-gray-900">
										{formatDate(shipping.lastUpdate)}
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Información del cliente */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-medium text-gray-900">
								Cliente
							</h2>
						</div>
						<div className="space-y-3">
							<div>
								<label className="block text-sm font-medium text-gray-600">
									Nombre:
								</label>
								<div className="mt-1 text-gray-900">
									{shipping.customer.name}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-600">
									Email:
								</label>
								<div className="mt-1 text-gray-900">
									{shipping.customer.email}
								</div>
							</div>
							<div>
								{shipping.customer.phone && (
									<div>
										<label className="block text-sm font-medium text-gray-600">
											Teléfono:
										</label>
										<div className="mt-1 text-gray-900">
											{shipping.customer.phone}
										</div>
									</div>
								)}
								<div>
									<label className="block text-sm font-medium text-gray-600">
										Dirección de envío:
									</label>
									<div className="mt-1 text-gray-900">
										{shipping.shippingAddress || "No disponible"}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Información del pedido */}
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-medium text-gray-900">
								Pedido
							</h2>
							<Link
								to={`/seller/orders/${shipping.orderId}`}
								className="text-sm text-primary-600 hover:underline"
							>
								Ver detalles
							</Link>
						</div>
						<div className="space-y-3">
							<div>
								<label className="block text-sm font-medium text-gray-600">
									Número de pedido:
								</label>
								<div className="mt-1 text-gray-900">
									{shipping.orderNumber}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-600">
									Método de envío:
								</label>
								<div className="mt-1 text-gray-900">
									{shipping.shippingMethod || "Estándar"}
								</div>
							</div>
							{shipping.weight && (
								<div>
									<label className="block text-sm font-medium text-gray-600">
										Peso:
									</label>
									<div className="mt-1 text-gray-900">
										{shipping.weight} kg
									</div>
								</div>
							)}
							{shipping.shippingCost !== undefined && (
								<div>
									<label className="block text-sm font-medium text-gray-600">
										Coste de envío:
									</label>
									<div className="mt-1 text-gray-900">
										{new Intl.NumberFormat("es-ES", {
											style: "currency",
											currency: "EUR",
										}).format(shipping.shippingCost)}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Historial y seguimiento */}
				<div className="col-span-3 md:col-span-2 space-y-6">
					{/* Historial de estados */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Historial de envío
						</h2>

						{shippingHistory.length === 0 ? (
							<div className="text-center py-6">
								<p className="text-gray-500">
									No hay historial disponible para este envío.
								</p>
							</div>
						) : (
							<div className="relative">
								{/* Línea de tiempo */}
								<div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200"></div>

								{/* Eventos */}
								<ul className="space-y-6">
									{shippingHistory.map((event, index) => (
										<li key={index} className="relative">
											<div className="flex items-start">
												<div className="flex items-center justify-center h-9 w-9 rounded-full bg-white border-2 border-primary-500 z-10">
													{getStatusIcon(event.status)}
												</div>
												<div className="ml-4">
													<div className="flex items-center">
														<h3 className="text-md font-medium text-gray-900">
															{getStatusText(
																event.status as ShippingItem["status"]
															)}
														</h3>
														<span className="ml-2 text-sm text-gray-500 flex items-center">
															<Calendar size={14} className="mr-1" />
															{formatDate(event.date)}
														</span>
													</div>
													<p className="mt-1 text-sm text-gray-600">
														{event.description}
													</p>
													{event.location && (
														<p className="mt-1 text-xs text-gray-500 flex items-center">
															<MapPin size={12} className="mr-1" />
															{event.location}
														</p>
													)}
												</div>
											</div>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>

					{/* Mapa de ruta (opcional) */}
					{shippingRoute.length > 0 && (
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Ruta de envío
							</h2>
							<div className="h-64 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
								{/* Aquí iría el componente de mapa */}
								<div className="text-center">
									<MapPin size={32} className="mx-auto mb-2 text-primary-500" />
									<p className="text-gray-600">
										Mapa de seguimiento disponible
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{shippingRoute.length} puntos de seguimiento disponibles
									</p>
								</div>
							</div>
							{/* Lista de ubicaciones */}
							<div className="mt-4">
								<h3 className="text-md font-medium text-gray-900 mb-2">
									Puntos de seguimiento:
								</h3>
								<ul className="space-y-2">
									{shippingRoute.map((point, index) => (
										<li key={index} className="flex items-start">
											<MapPin
												size={16}
												className="mt-0.5 mr-2 text-primary-500"
											/>
											<div>
												<div className="flex items-center">
													<span className="text-sm font-medium text-gray-900">
														{point.location}
													</span>
													<span className="ml-2 text-xs text-gray-500">
														{new Date(point.date).toLocaleDateString("es-ES")}
													</span>
												</div>
												<p className="text-xs text-gray-600">
													{getStatusText(
														point.status as ShippingItem["status"]
													)}
												</p>
											</div>
										</li>
									))}
								</ul>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SellerShippingDetailsPage;
