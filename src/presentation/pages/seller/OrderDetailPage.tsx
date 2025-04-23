import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {ArrowLeft, Truck, Package, Check, X, FileText} from "lucide-react";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import {formatDate} from "../../../utils/formatters/formatDate";
import OrderServiceAdapter from "../../../core/adapters/OrderServiceAdapter";
import type {
	OrderDetail,
	OrderStatus,
} from "../../../core/domain/entities/Order";

const OrderDetailPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const [order, setOrder] = useState<OrderDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);

	const orderAdapter = new OrderServiceAdapter();

	useEffect(() => {
		fetchOrderDetails();
	}, [id]);

	const fetchOrderDetails = async () => {
		if (!id) return;

		setLoading(true);
		try {
			// Para seller, pasar isUser=false explícitamente
			const orderDetail = await orderAdapter.getOrderDetails(id, false);
			setOrder(orderDetail);
			setError(null);
		} catch (err) {
			setError("No se pudo cargar el detalle de la orden");
			console.error("Error al cargar detalles de orden:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (newStatus: OrderStatus) => {
		if (!id || !order) return;

		setIsUpdating(true);
		try {
			const success = await orderAdapter.updateOrderStatus(id, newStatus);

			if (success) {
				// Actualizar el estado de la orden localmente
				setOrder((prev) => (prev ? {...prev, status: newStatus} : null));
			} else {
				throw new Error("No se pudo actualizar el estado");
			}
		} catch (err) {
			setError("Error al actualizar el estado del pedido");
			console.error("Error al actualizar estado:", err);
		} finally {
			setIsUpdating(false);
		}
	};

	const getStatusClass = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "processing":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "paid":
				return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
			case "shipped":
				return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
			case "delivered":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
			case "completed":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "cancelled":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	const getPaymentStatusClass = (status: string | null | undefined) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "completed":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "failed":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	const canUpdateToStatus = (currentStatus: string, newStatus: string) => {
		// Lógica para determinar si se puede cambiar de un estado a otro
		const statusFlow: Record<string, string[]> = {
			pending: ["processing", "cancelled"],
			processing: ["shipped", "cancelled"],
			shipped: ["delivered", "cancelled"],
			delivered: ["completed"],
			completed: [],
			cancelled: [],
			paid: ["processing", "cancelled"],
		};

		return statusFlow[currentStatus]?.includes(newStatus) || false;
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
				<p className="mt-4 text-gray-700 dark:text-gray-300">
					Cargando detalles del pedido...
				</p>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto my-8">
				<div className="text-center">
					<div className="text-red-500 text-5xl mb-4">
						<X className="h-16 w-16 mx-auto" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
						Error al cargar el pedido
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						{error || "No se pudo encontrar el pedido solicitado"}
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
						className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-2"
					>
						<ArrowLeft size={16} className="mr-1" />
						<span>Volver a pedidos</span>
					</button>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Pedido #{order.orderNumber}
					</h1>
				</div>

				<div className="flex flex-wrap gap-2">
					{/* Botones de acción según el estado actual */}
					{canUpdateToStatus(order.status, "processing") && (
						<button
							onClick={() => handleStatusChange("processing")}
							disabled={isUpdating}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
						>
							<Package size={18} />
							<span>Preparar pedido</span>
						</button>
					)}

					{canUpdateToStatus(order.status, "shipped") && (
						<button
							onClick={() => handleStatusChange("shipped")}
							disabled={isUpdating}
							className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
						>
							<Truck size={18} />
							<span>Marcar como enviado</span>
						</button>
					)}

					{canUpdateToStatus(order.status, "delivered") && (
						<button
							onClick={() => handleStatusChange("delivered")}
							disabled={isUpdating}
							className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
						>
							<Check size={18} />
							<span>Marcar como entregado</span>
						</button>
					)}

					{canUpdateToStatus(order.status, "completed") && (
						<button
							onClick={() => handleStatusChange("completed")}
							disabled={isUpdating}
							className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
						>
							<Check size={18} />
							<span>Completar pedido</span>
						</button>
					)}

					{canUpdateToStatus(order.status, "cancelled") && (
						<button
							onClick={() => handleStatusChange("cancelled")}
							disabled={isUpdating}
							className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
						>
							<X size={18} />
							<span>Cancelar pedido</span>
						</button>
					)}

					{/* Generar factura */}
					<Link
						to={`/seller/invoices/generate/${order.id}`}
						className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
					>
						<FileText size={18} />
						<span>Generar factura</span>
					</Link>
				</div>
			</div>

			{/* Contenido principal */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Información general y estado */}
				<div className="col-span-3 md:col-span-1 space-y-6">
					{/* Tarjeta de estado */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
							Estado del pedido
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-gray-600 dark:text-gray-400">
									Estado:
								</span>
								<span
									className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}
								>
									{order.status === "pending" && "Pendiente"}
									{order.status === "processing" && "En proceso"}
									{order.status === "paid" && "Pagado"}
									{order.status === "shipped" && "Enviado"}
									{order.status === "delivered" && "Entregado"}
									{order.status === "completed" && "Completado"}
									{order.status === "cancelled" && "Cancelado"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600 dark:text-gray-400">Pago:</span>
								<span
									className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusClass(order.paymentStatus)}`}
								>
									{order.paymentStatus === "pending" && "Pendiente"}
									{order.paymentStatus === "completed" && "Completado"}
									{order.paymentStatus === "failed" && "Fallido"}
									{!order.paymentStatus && "No disponible"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600 dark:text-gray-400">
									Método de pago:
								</span>
								<span className="text-gray-900 dark:text-gray-100">
									{order.paymentMethod === "credit_card" &&
										"Tarjeta de crédito"}
									{order.paymentMethod === "paypal" && "PayPal"}
									{order.paymentMethod === "transfer" && "Transferencia"}
									{order.paymentMethod === "other" && "Otro"}
									{!order.paymentMethod && "No especificado"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600 dark:text-gray-400">Fecha:</span>
								<span className="text-gray-900 dark:text-gray-100">
									{formatDate(order.createdAt || "")}
								</span>
							</div>
						</div>
					</div>

					{/* Información del cliente */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-lg font-medium text-gray-900 dark:text-white">
								Cliente
							</h2>
						</div>
						<div className="space-y-3">
							<div>
								<label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
									Nombre:
								</label>
								<div className="mt-1 text-gray-900 dark:text-gray-100">
									{order.user_name || "No disponible"}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
									Email:
								</label>
								<div className="mt-1 text-gray-900 dark:text-gray-100">
									{order.user_email || "No disponible"}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
									Dirección de envío:
								</label>
								<div className="mt-1 text-gray-900 dark:text-gray-100">
									{order.shippingData ? (
										<div>
											<p>{order.shippingData.address}</p>
											<p>
												{order.shippingData.city}, {order.shippingData.state}
											</p>
											<p>
												{order.shippingData.country},{" "}
												{order.shippingData.postalCode}
											</p>
											{order.shippingData.phone && (
												<p>Tel: {order.shippingData.phone}</p>
											)}
										</div>
									) : (
										<p>No disponible</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Productos y resumen */}
				<div className="col-span-3 md:col-span-2 space-y-6">
					{/* Productos */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white p-6 pb-3">
							Productos
						</h2>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Producto
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											SKU
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Precio
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Cantidad
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
										>
											Subtotal
										</th>
									</tr>
								</thead>
								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{order.items.map((item) => (
										<tr key={item.id}>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													{(item.product?.image || item.product_image) && (
														<div className="flex-shrink-0 h-10 w-10 mr-3">
															<img
																className="h-10 w-10 rounded-md object-cover"
																src={item.product?.image || item.product_image}
																alt={
																	item.product?.name ||
																	item.product_name ||
																	"Producto"
																}
															/>
														</div>
													)}
													<div>
														<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
															{item.product?.name ||
																item.product_name ||
																"Producto"}
														</div>
														{/* Link al producto si es necesario */}
														{item.product?.slug && (
															<Link
																to={`/products/${item.product.slug}`}
																className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
															>
																Ver producto
															</Link>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{item.product?.sku || item.product_sku || "N/A"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
												{formatCurrency(item.price)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right">
												{item.quantity}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
												{formatCurrency(item.subtotal)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Resumen de precios */}
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
							Resumen
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between items-center pb-2">
								<span className="text-gray-600 dark:text-gray-400">
									Subtotal:
								</span>
								<span className="text-gray-900 dark:text-gray-100">
									{formatCurrency(
										order.items.reduce(
											(sum, item) => sum + item.price * item.quantity,
											0
										)
									)}
								</span>
							</div>
							{/* Añadir impuestos u otros cargos si es necesario */}
							<div className="flex justify-between items-center pb-2">
								<span className="text-gray-600 dark:text-gray-400">
									IVA (15%):
								</span>
								<span className="text-gray-900 dark:text-gray-100">
									{formatCurrency(
										order.items.reduce(
											(sum, item) => sum + item.price * item.quantity,
											0
										) * 0.15
									)}
								</span>
							</div>
							<div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 font-medium">
								<span className="text-gray-900 dark:text-gray-100">Total:</span>
								<span className="text-lg text-gray-900 dark:text-gray-100">
									{formatCurrency(order.total)}
								</span>
							</div>
						</div>
					</div>

					{/* Notas y seguimiento */}
					{order.shippingData?.tracking_number && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
								Información de envío
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-gray-600 dark:text-gray-400">
										Número de seguimiento:
									</span>
									<span className="text-primary-600 dark:text-primary-400 font-medium">
										{order.shippingData.tracking_number}
									</span>
								</div>
								{order.shippingData.shipping_company && (
									<div className="flex justify-between items-center">
										<span className="text-gray-600 dark:text-gray-400">
											Transportista:
										</span>
										<span className="text-gray-900 dark:text-gray-100">
											{order.shippingData.shipping_company}
										</span>
									</div>
								)}
								{order.shippingData.estimated_delivery && (
									<div className="flex justify-between items-center">
										<span className="text-gray-600 dark:text-gray-400">
											Entrega estimada:
										</span>
										<span className="text-gray-900 dark:text-gray-100">
											{formatDate(order.shippingData.estimated_delivery)}
										</span>
									</div>
								)}
								<div className="mt-3">
									<Link
										to={`/seller/shipping/${order.id}`}
										className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 inline-flex items-center mt-2"
									>
										<Truck size={16} className="mr-2" />
										<span>Gestionar envío</span>
									</Link>
								</div>
							</div>
						</div>
					)}

					{/* Mostrar notas si existen */}
					{order.shippingData?.notes && (
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
								Notas
							</h2>
							<p className="text-gray-600 dark:text-gray-400">
								{order.shippingData.notes}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrderDetailPage;
