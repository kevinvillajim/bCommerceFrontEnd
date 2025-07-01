import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {
	ShoppingBag,
	User,
	Calendar,
	MapPin,
	Truck,
	Clock,
	CreditCard,
	CheckCircle,
	XCircle,
	ArrowLeft,
	Edit,
	RefreshCw,
	Package,
} from "lucide-react";
import {AdminOrderServiceAdapter} from "../../../core/adapters/AdminOrderServiceAdapter";
import OrderStatusBadge from "../../components/orders/OrderStatusBadge";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";

const AdminOrderDetailPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [orderDetail, setOrderDetail] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const orderAdapter = new AdminOrderServiceAdapter();

	// Estados para modal de actualización
	const [showStatusModal, setShowStatusModal] = useState(false);
	const [newStatus, setNewStatus] = useState("");
	const [updatingStatus, setUpdatingStatus] = useState(false);

	// Estados para modal de envío
	const [showShippingModal, setShowShippingModal] = useState(false);
	const [shippingInfo, setShippingInfo] = useState({
		tracking_number: "",
		shipping_company: "",
		estimated_delivery: "",
		notes: "",
	});
	const [updatingShipping, setUpdatingShipping] = useState(false);

	// Obtener datos de la orden
	useEffect(() => {
		if (!id) return;

		const fetchOrderDetail = async () => {
			setLoading(true);
			setError(null);
			try {
				const order = await orderAdapter.getOrderDetails(parseInt(id));
				if (order) {
					setOrderDetail(order);
				} else {
					setError("No se pudo obtener la información de la orden");
				}
			} catch (error) {
				console.error("Error al obtener detalles de la orden:", error);
				setError("Error al cargar los detalles de la orden");
			} finally {
				setLoading(false);
			}
		};

		fetchOrderDetail();
	}, [id]);

	// Mapeo de estados disponibles
	const availableStatuses = [
		{value: "pending", label: "Pendiente"},
		{value: "processing", label: "En proceso"},
		{value: "paid", label: "Pagado"},
		{value: "shipped", label: "Enviado"},
		{value: "delivered", label: "Entregado"},
		{value: "completed", label: "Completado"},
		{value: "cancelled", label: "Cancelado"},
	];

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

	// Actualizar estado de la orden
	const handleUpdateStatus = async () => {
		if (!newStatus || !orderDetail) return;

		setUpdatingStatus(true);
		try {
			const success = await orderAdapter.updateOrderStatus(
				orderDetail.id,
				newStatus as any
			);

			if (success) {
				// Actualizar estado local
				setOrderDetail({
					...orderDetail,
					status: newStatus,
					updatedAt: new Date().toISOString(),
				});
				setShowStatusModal(false);
			} else {
				alert("Error al actualizar el estado de la orden");
			}
		} catch (error) {
			console.error("Error al actualizar estado:", error);
			alert("Error al actualizar el estado de la orden");
		} finally {
			setUpdatingStatus(false);
		}
	};

	// Actualizar información de envío
	const handleUpdateShipping = async () => {
		if (!orderDetail) return;

		setUpdatingShipping(true);
		try {
			// Implementar la lógica para actualizar información de envío
			// Aquí deberías llamar al servicio correspondiente
			alert("Funcionalidad aún no implementada");

			setShowShippingModal(false);
		} catch (error) {
			console.error("Error al actualizar información de envío:", error);
			alert("Error al actualizar la información de envío");
		} finally {
			setUpdatingShipping(false);
		}
	};

	// Cancelar orden
	const handleCancelOrder = async () => {
		if (!orderDetail) return;

		if (window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
			setLoading(true);
			try {
				const success = await orderAdapter.cancelOrder(orderDetail.id);

				if (success) {
					// Actualizar estado local
					setOrderDetail({
						...orderDetail,
						status: "cancelled",
						updatedAt: new Date().toISOString(),
					});
				} else {
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

	if (loading) {
		return (
			<div className="p-6 flex justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6">
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
					<strong className="font-bold">Error!</strong>
					<span className="block sm:inline"> {error}</span>
				</div>
				<button
					onClick={() => navigate("/admin/orders")}
					className="flex items-center text-primary-600 hover:text-primary-800"
				>
					<ArrowLeft className="mr-2" size={16} />
					Volver a la lista de pedidos
				</button>
			</div>
		);
	}

	if (!orderDetail) {
		return (
			<div className="p-6">
				<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
					<strong className="font-bold">No encontrado.</strong>
					<span className="block sm:inline">
						{" "}
						No se encontró la orden solicitada.
					</span>
				</div>
				<button
					onClick={() => navigate("/admin/orders")}
					className="flex items-center text-primary-600 hover:text-primary-800"
				>
					<ArrowLeft className="mr-2" size={16} />
					Volver a la lista de pedidos
				</button>
			</div>
		);
	}

	// Determinar si se pueden realizar acciones de acuerdo al estado
	const canEditStatus = !["cancelled", "completed"].includes(
		orderDetail.status
	);
	const canCancel = ["pending", "processing", "paid"].includes(
		orderDetail.status
	);

	return (
		<div className="p-6 max-w-6xl mx-auto">
			{/* Cabecera */}
			<div className="flex justify-between items-center mb-6">
				<button
					onClick={() => navigate("/admin/orders")}
					className="flex items-center text-primary-600 hover:text-primary-800"
				>
					<ArrowLeft className="mr-2" size={16} />
					Volver a la lista de pedidos
				</button>

				<h1 className="text-2xl font-bold">
					Pedido {orderDetail.orderNumber || `#${orderDetail.id}`}
				</h1>

				<div className="flex space-x-2">
					{/* Acciones principales */}
					{canEditStatus && (
						<button
							onClick={() => {
								setNewStatus(orderDetail.status);
								setShowStatusModal(true);
							}}
							className="flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							<Edit size={16} className="mr-2" />
							Cambiar Estado
						</button>
					)}

					{canCancel && (
						<button
							onClick={handleCancelOrder}
							className="flex items-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
						>
							<XCircle size={16} className="mr-2" />
							Cancelar
						</button>
					)}
				</div>
			</div>

			{/* Contenido principal */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Información de la orden */}
				<div className="md:col-span-2 space-y-6">
					{/* Estado y fecha */}
					<div className="bg-white rounded-lg shadow-sm p-4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Información General</h2>
							<OrderStatusBadge status={orderDetail.status} />
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="flex items-center text-gray-600">
									<Calendar className="w-4 h-4 mr-2" />
									<span className="text-sm">Fecha del pedido:</span>
								</div>
								<p className="text-gray-900">
									{formatDate(orderDetail.date || orderDetail.createdAt)}
								</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center text-gray-600">
									<Clock className="w-4 h-4 mr-2" />
									<span className="text-sm">Última actualización:</span>
								</div>
								<p className="text-gray-900">
									{formatDate(orderDetail.updatedAt)}
								</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center text-gray-600">
									<CreditCard className="w-4 h-4 mr-2" />
									<span className="text-sm">Método de pago:</span>
								</div>
								<p className="text-gray-900">
									{orderDetail.paymentMethod || "No especificado"}
								</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center text-gray-600">
									<CreditCard className="w-4 h-4 mr-2" />
									<span className="text-sm">Estado de pago:</span>
								</div>
								<p className="text-gray-900">
									<OrderStatusBadge
										status={orderDetail.paymentStatus}
										type="payment"
									/>
								</p>
							</div>
						</div>
					</div>

					{/* Productos */}
					<div className="bg-white rounded-lg shadow-sm p-4">
						<h2 className="text-lg font-semibold mb-4">Productos</h2>

						<div className="space-y-4">
							{orderDetail.items &&
								orderDetail.items.map((item: any) => (
									<div
										key={item.id}
										className="flex border-b border-gray-200 pb-4 last:border-0 last:pb-0"
									>
										<div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
											{item.image ? (
												<img
													src={item.image}
													alt={item.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<ShoppingBag className="w-8 h-8 text-gray-400" />
												</div>
											)}
										</div>

										<div className="ml-4 flex-grow">
											<div className="flex justify-between">
												<div>
													<h3 className="text-sm font-medium text-gray-900">
														{item.name}
													</h3>
													<p className="text-sm text-gray-500">
														ID: {item.productId}
													</p>
												</div>
												<div className="text-right">
													<p className="text-sm font-medium text-gray-900">
														{formatCurrency(item.price)} x {item.quantity}
													</p>
													<p className="text-sm font-bold text-gray-900">
														{formatCurrency(item.subtotal)}
													</p>
												</div>
											</div>
										</div>
									</div>
								))}
						</div>

						{/* Resumen de totales */}
						<div className="mt-4 pt-4 border-t border-gray-200">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									Subtotal:
								</span>
								<span className="font-medium text-gray-900">
									{formatCurrency(
										orderDetail.items.reduce(
											(sum: number, item: any) => sum + (item.subtotal || 0),
											0
										)
									)}
								</span>
							</div>
							<div className="flex justify-between text-sm mt-2">
								<span className="text-gray-600">
									IVA (15%):
								</span>
								<span className="font-medium text-gray-900">
									{formatCurrency(
										orderDetail.items.reduce(
											(sum: number, item: any) => sum + (item.subtotal || 0),
											0
										) * 0.15
									)}
								</span>
							</div>
							<div className="flex justify-between font-bold text-lg mt-2">
								<span>Total:</span>
								<span>{formatCurrency(orderDetail.total)}</span>
							</div>
						</div>
					</div>

					{/* Historial de la orden (si hay disponible) */}
					{orderDetail.history && orderDetail.history.length > 0 && (
						<div className="bg-white rounded-lg shadow-sm p-4">
							<h2 className="text-lg font-semibold mb-4">
								Historial de la Orden
							</h2>

							<div className="space-y-3">
								{orderDetail.history.map((event: any, index: number) => (
									<div key={index} className="flex">
										<div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
											{event.status === "created" && <ShoppingBag size={12} />}
											{event.status === "paid" && <CreditCard size={12} />}
											{event.status === "processing" && <RefreshCw size={12} />}
											{event.status === "shipped" && <Truck size={12} />}
											{event.status === "delivered" && <Package size={12} />}
											{event.status === "completed" && (
												<CheckCircle size={12} />
											)}
											{event.status === "cancelled" && <XCircle size={12} />}
										</div>

										<div className="ml-3">
											<p className="text-sm font-medium text-gray-900">
												{event.status === "created" && "Orden creada"}
												{event.status === "paid" && "Pago realizado"}
												{event.status === "processing" && "Procesando orden"}
												{event.status === "shipped" && "Orden enviada"}
												{event.status === "delivered" && "Orden entregada"}
												{event.status === "completed" && "Orden completada"}
												{event.status === "cancelled" && "Orden cancelada"}
											</p>
											<p className="text-xs text-gray-500">
												{formatDate(event.timestamp)}
											</p>
											{event.description && (
												<p className="text-sm text-gray-600 mt-1">
													{event.description}
												</p>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Sidebar con información del cliente y envío */}
				<div className="space-y-6">
					{/* Cliente */}
					<div className="bg-white rounded-lg shadow-sm p-4">
						<h2 className="text-lg font-semibold mb-4">Cliente</h2>

						<div className="flex items-center mb-4">
							<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
								<User className="w-6 h-6 text-gray-500" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-900">
									{orderDetail.customer?.name || "Cliente"}
								</p>
								<p className="text-xs text-gray-500">
									ID: {orderDetail.customer?.id || orderDetail.userId}
								</p>
							</div>
						</div>

						<div className="space-y-2 text-sm">
							<p className="text-gray-600">
								<strong>Email:</strong>{" "}
								{orderDetail.customer?.email || "No disponible"}
							</p>

							{orderDetail.customer?.phone && (
								<p className="text-gray-600">
									<strong>Teléfono:</strong> {orderDetail.customer.phone}
								</p>
							)}
						</div>
					</div>

					{/* Vendedor */}
					<div className="bg-white rounded-lg shadow-sm p-4">
						<h2 className="text-lg font-semibold mb-4">Vendedor</h2>

						<div className="space-y-2 text-sm">
							<p className="text-gray-600">
								<strong>ID:</strong>{" "}
								{orderDetail.seller?.id ||
									orderDetail.sellerId ||
									"No disponible"}
							</p>

							<p className="text-gray-600">
								<strong>Nombre:</strong>{" "}
								{orderDetail.seller?.name || "Vendedor"}
							</p>
						</div>

						{/* Enlace a detalles del vendedor */}
						{(orderDetail.seller?.id || orderDetail.sellerId) && (
							<Link
								to={`/admin/sellers/${orderDetail.seller?.id || orderDetail.sellerId}`}
								className="mt-3 inline-flex items-center text-sm text-primary-600 hover:text-primary-800"
							>
								Ver detalles del vendedor
							</Link>
						)}
					</div>

					{/* Información de envío */}
					<div className="bg-white rounded-lg shadow-sm p-4">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-semibold">Información de Envío</h2>
							<button
								onClick={() => setShowShippingModal(true)}
								className="text-sm text-primary-600 hover:text-primary-800"
							>
								<Edit size={14} className="inline mr-1" />
								Editar
							</button>
						</div>

						{orderDetail.shippingData ? (
							<div className="space-y-2 text-sm">
								<p className="text-gray-600 flex items-start">
									<MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
									<span>
										{orderDetail.shippingData.address},<br />
										{orderDetail.shippingData.city},{" "}
										{orderDetail.shippingData.state}
										<br />
										{orderDetail.shippingData.postalCode},{" "}
										{orderDetail.shippingData.country}
									</span>
								</p>

								{orderDetail.shippingData.phone && (
									<p className="text-gray-600 mt-2">
										<strong>Teléfono:</strong> {orderDetail.shippingData.phone}
									</p>
								)}

								{orderDetail.shippingData.tracking_number && (
									<div className="mt-3 pt-3 border-t border-gray-200">
										<p className="text-gray-600">
											<strong>Número de seguimiento:</strong>
										</p>
										<p className="font-mono bg-gray-100 px-2 py-1 rounded mt-1">
											{orderDetail.shippingData.tracking_number}
										</p>
									</div>
								)}

								{orderDetail.shippingData.shipping_company && (
									<p className="text-gray-600 mt-2">
										<strong>Transportista:</strong>{" "}
										{orderDetail.shippingData.shipping_company}
									</p>
								)}

								{orderDetail.shippingData.estimated_delivery && (
									<p className="text-gray-600 mt-2">
										<strong>Entrega estimada:</strong>{" "}
										{formatDate(orderDetail.shippingData.estimated_delivery)}
									</p>
								)}
							</div>
						) : (
							<div className="text-gray-500 text-sm">
								No hay información de envío disponible.
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Modal para cambiar estado */}
			{showStatusModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h3 className="text-lg font-bold mb-4">
							Cambiar Estado del Pedido
						</h3>

						<div className="mb-4">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Nuevo Estado
							</label>
							<select
								value={newStatus}
								onChange={(e) => setNewStatus(e.target.value)}
								className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							>
								{availableStatuses.map((status) => (
									<option key={status.value} value={status.value}>
										{status.label}
									</option>
								))}
							</select>
						</div>

						<div className="flex justify-end space-x-3">
							<button
								onClick={() => setShowStatusModal(false)}
								className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
							>
								Cancelar
							</button>
							<button
								onClick={handleUpdateStatus}
								disabled={updatingStatus}
								className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
							>
								{updatingStatus ? "Actualizando..." : "Guardar"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Modal para editar información de envío */}
			{showShippingModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h3 className="text-lg font-bold mb-4">
							Editar Información de Envío
						</h3>

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Número de Seguimiento
								</label>
								<input
									type="text"
									value={shippingInfo.tracking_number}
									onChange={(e) =>
										setShippingInfo({
											...shippingInfo,
											tracking_number: e.target.value,
										})
									}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Empresa de Transporte
								</label>
								<input
									type="text"
									value={shippingInfo.shipping_company}
									onChange={(e) =>
										setShippingInfo({
											...shippingInfo,
											shipping_company: e.target.value,
										})
									}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Fecha Estimada de Entrega
								</label>
								<input
									type="date"
									value={shippingInfo.estimated_delivery}
									onChange={(e) =>
										setShippingInfo({
											...shippingInfo,
											estimated_delivery: e.target.value,
										})
									}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Notas
								</label>
								<textarea
									value={shippingInfo.notes}
									onChange={(e) =>
										setShippingInfo({...shippingInfo, notes: e.target.value})
									}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
									rows={3}
								/>
							</div>
						</div>

						<div className="flex justify-end space-x-3 mt-6">
							<button
								onClick={() => setShowShippingModal(false)}
								className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
							>
								Cancelar
							</button>
							<button
								onClick={handleUpdateShipping}
								disabled={updatingShipping}
								className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
							>
								{updatingShipping ? "Actualizando..." : "Guardar"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminOrderDetailPage;
