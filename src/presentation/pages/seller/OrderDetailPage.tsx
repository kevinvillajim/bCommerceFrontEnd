// src/presentation/pages/seller/OrderDetailPage.tsx - versión actualizada
import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {ArrowLeft, Truck, Package, Check, X, FileText} from "lucide-react";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import {formatDate} from "../../../utils/formatters/formatDate";
// Importar el adaptador específico para vendedores
import SellerOrderServiceAdapter from "../../../core/adapters/SellerOrderServiceAdapter";
// Importar el adaptador y modal de envío
import ShippingServiceAdapter from "../../../core/adapters/ShippingServiceAdapter";
import ShippingFormModal from "../../components/shipping/ShippingFormModal";
import type {ShippingFormData} from "../../components/shipping/ShippingFormModal";
import {
	canTransitionTo,
	isValidOrderStatus,
	type OrderDetail,
	type OrderStatus,
} from "../../../core/domain/entities/Order";

const OrderDetailPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const [order, setOrder] = useState<OrderDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	// Estado para controlar la visibilidad del modal de envío
	const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

	// Utilizar los adaptadores
	const sellerOrderAdapter = new SellerOrderServiceAdapter();
	const shippingAdapter = new ShippingServiceAdapter();

	useEffect(() => {
		fetchOrderDetails();
	}, [id]);

	const fetchOrderDetails = async () => {
		if (!id) return;

		setLoading(true);
		try {
			// Utilizar el método getOrderDetails del adaptador de vendedores
			const orderDetail = await sellerOrderAdapter.getOrderDetails(id);
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

		// ✅ VALIDACIÓN DE TRANSICIÓN AGREGADA
		if (!canTransitionTo(order.status, newStatus)) {
			setError(`No se puede cambiar de "${order.status}" a "${newStatus}"`);
			return;
		}

		// Si el nuevo estado es "shipped", abrir el modal de envío en lugar de procesar directamente
		if (newStatus === "shipped") {
			setIsShippingModalOpen(true);
			return;
		}

		setIsUpdating(true);
		setSuccessMessage(null);
		setError(null);

		try {
			// ✅ VERIFICACIÓN DE TIPO ANTES DE LLAMAR AL ADAPTADOR
			if (!isValidOrderStatus(newStatus)) {
				throw new Error(`Estado inválido: ${newStatus}`);
			}

			// Usar el método updateOrderStatus del adaptador de vendedores
			const success = await sellerOrderAdapter.updateOrderStatus(id, newStatus);

			if (success) {
				// Actualizar el estado de la orden localmente
				setOrder((prev) => (prev ? {...prev, status: newStatus} : null));
				setSuccessMessage(
					`El estado del pedido ha sido actualizado a ${getStatusText(newStatus)}`
				);

				// Si se completa o cancela, esperar 2 segundos y recargar para mostrar datos actualizados
				if (newStatus === "completed" || newStatus === "cancelled") {
					setTimeout(() => fetchOrderDetails(), 2000);
				}
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

	// Nueva función para procesar el envío con datos adicionales
	const handleShippingSubmit = async (shippingData: ShippingFormData) => {
		if (!id || !order) return;

		setIsUpdating(true);
		setSuccessMessage(null);
		setError(null);

		try {
			// Usar el adaptador de envío para marcar como enviado y actualizar la información
			const success = await shippingAdapter.markAsShipped(id, shippingData);

			if (success) {
				// Cerrar el modal
				setIsShippingModalOpen(false);

				// Actualizar el estado de la orden localmente
				setOrder((prev) => {
					if (!prev) return null;

					// Asegurarse de mantener los campos obligatorios de shippingData
					const updatedShippingData = {
						// Conservar valores obligatorios existentes
						address: prev.shippingData?.address || "",
						city: prev.shippingData?.city || "",
						state: prev.shippingData?.state || "",
						country: prev.shippingData?.country || "",
						postalCode: prev.shippingData?.postalCode || "",
						// Agregar nuevos valores del formulario
						tracking_number: shippingData.tracking_number,
						shipping_company: shippingData.shipping_company,
						estimated_delivery: shippingData.estimated_delivery,
						notes: shippingData.notes,
					};

					return {
						...prev,
						status: "shipped",
						shippingData: updatedShippingData,
					};
				});

				setSuccessMessage(
					`El pedido ha sido marcado como enviado y se ha registrado la información de envío`
				);

				// Recargar los detalles después de un breve delay
				setTimeout(() => fetchOrderDetails(), 2000);
			} else {
				throw new Error("No se pudo procesar el envío");
			}
		} catch (err) {
			setError("Error al procesar el envío. Por favor, inténtelo de nuevo.");
			console.error("Error al procesar envío:", err);
		} finally {
			setIsUpdating(false);
		}
	};

	const getStatusClass = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "processing":
				return "bg-blue-100 text-blue-800";
			case "paid":
				return "bg-cyan-100 text-cyan-800";
			case "shipped":
				return "bg-indigo-100 text-indigo-800";
			case "delivered":
				return "bg-purple-100 text-purple-800";
			case "completed":
				return "bg-green-100 text-green-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			case "rejected": // ✅ CASO AGREGADO
				return "bg-red-200 text-red-900";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "pending":
				return "Pendiente";
			case "processing":
				return "En proceso";
			case "paid":
				return "Pagado";
			case "shipped":
				return "Enviado";
			case "delivered":
				return "Entregado";
			case "completed":
				return "Completado";
			case "cancelled":
				return "Cancelado";
			case "rejected": // ✅ CASO AGREGADO
				return "Rechazado";
			default:
				return "Desconocido";
		}
	};

	const getPaymentStatusClass = (status: string | null | undefined) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "completed":
			case "paid":
				return "bg-green-100 text-green-800";
			case "failed":
			case "rejected":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getPaymentStatusText = (status: string | null | undefined) => {
		switch (status) {
			case "pending":
				return "Pendiente";
			case "completed":
			case "paid":
				return "Completado";
			case "failed":
			case "rejected":
				return "Fallido";
			default:
				return "Desconocido";
		}
	};

	const canUpdateToStatus = (
		currentStatus: string,
		newStatus: string
	): boolean => {
		// ✅ USAR LA FUNCIÓN HELPER IMPORTADA
		if (!isValidOrderStatus(currentStatus) || !isValidOrderStatus(newStatus)) {
			return false;
		}

		return canTransitionTo(
			currentStatus as OrderStatus,
			newStatus as OrderStatus
		);
	};

	// Función para calcular subtotal
	const calculateSubtotal = () => {
		if (!order || !order.items || order.items.length === 0) return 0;
		return order.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		);
	};

	// Función para calcular IVA (15%)
	const calculateTax = () => {
		return calculateSubtotal() * 0.15;
	};

	// Función para calcular total con IVA
	const calculateTotal = () => {
		return calculateSubtotal() + calculateTax();
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
				<p className="mt-4 text-gray-700">
					Cargando detalles del pedido...
				</p>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto my-8">
				<div className="text-center">
					<div className="text-red-500 text-5xl mb-4">
						<X className="h-16 w-16 mx-auto" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Error al cargar el pedido
					</h2>
					<p className="text-gray-600 mb-6">
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
			{/* Modal de envío */}
			<ShippingFormModal
				orderId={id || ""}
				isOpen={isShippingModalOpen}
				onClose={() => setIsShippingModalOpen(false)}
				onSubmit={handleShippingSubmit}
				isLoading={isUpdating}
			/>

			{/* Encabezado y acciones */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<button
						onClick={() => navigate(-1)}
						className="flex items-center text-gray-600 hover:text-primary-600 mb-2"
					>
						<ArrowLeft size={16} className="mr-1" />
						<span>Volver a pedidos</span>
					</button>
					<h1 className="text-2xl font-bold text-gray-900">
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

			{/* Mensajes de éxito/error */}
			{successMessage && (
				<div
					className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<span className="block sm:inline">{successMessage}</span>
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

			{isUpdating && (
				<div
					className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative"
					role="alert"
				>
					<div className="flex items-center">
						<div className="animate-spin mr-2 h-4 w-4 border-t-2 border-blue-500"></div>
						<span className="block sm:inline">
							Actualizando estado del pedido...
						</span>
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
							Estado del pedido
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-gray-600">
									Estado:
								</span>
								<span
									className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}
								>
									{getStatusText(order.status)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Pago:</span>
								<span
									className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusClass(order.paymentStatus)}`}
								>
									{getPaymentStatusText(order.paymentStatus)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">
									Método de pago:
								</span>
								<span className="text-gray-900">
									{order.paymentMethod === "credit_card" &&
										"Tarjeta de crédito"}
									{order.paymentMethod === "paypal" && "PayPal"}
									{order.paymentMethod === "transfer" && "Transferencia"}
									{order.paymentMethod === "other" && "Otro"}
									{!order.paymentMethod && "No especificado"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Fecha:</span>
								<span className="text-gray-900">
									{order.createdAt ? formatDate(order.createdAt) : "Sin fecha"}
								</span>
							</div>
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
									{order.user_name || "No disponible"}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-600">
									Email:
								</label>
								<div className="mt-1 text-gray-900">
									{order.user_email || "No disponible"}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-600">
									Dirección de envío:
								</label>
								<div className="mt-1 text-gray-900">
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
											{(order.shippingData.phone ||
												order.shippingData.phone) && (
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
					<div className="bg-white rounded-lg shadow overflow-hidden">
						<h2 className="text-lg font-medium text-gray-900 p-6 pb-3">
							Productos
						</h2>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Producto
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											SKU
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Precio
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Cantidad
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Subtotal
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
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
														<div className="text-sm font-medium text-gray-900">
															{item.product?.name ||
																item.product_name ||
																"Producto"}
														</div>
														{/* Link al producto si es necesario */}
														{item.product?.slug && (
															<Link
																to={`/products/${item.product.slug}`}
																className="text-xs text-primary-600 hover:underline"
															>
																Ver producto
															</Link>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
												{item.product?.sku || item.product_sku || "N/A"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
												{formatCurrency(item.price)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
												{item.quantity}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
												{formatCurrency(item.price * item.quantity)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Resumen de precios */}
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">
							Resumen
						</h2>
						<div className="space-y-3">
							<div className="flex justify-between items-center pb-2">
								<span className="text-gray-600">
									Subtotal:
								</span>
								<span className="text-gray-900">
									{formatCurrency(calculateSubtotal())}
								</span>
							</div>
							{/* Añadir impuestos u otros cargos si es necesario */}
							<div className="flex justify-between items-center pb-2">
								<span className="text-gray-600">
									IVA (15%):
								</span>
								<span className="text-gray-900">
									{formatCurrency(calculateTax())}
								</span>
							</div>
							<div className="flex justify-between items-center pt-3 border-t border-gray-200 font-medium">
								<span className="text-gray-900">Total:</span>
								<span className="text-lg text-gray-900">
									{formatCurrency(calculateTotal())}
								</span>
							</div>
						</div>
					</div>

					{/* Notas y seguimiento */}
					{order.shippingData?.tracking_number && (
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Información de envío
							</h2>
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="text-gray-600">
										Número de seguimiento:
									</span>
									<span className="text-primary-600 font-medium">
										{order.shippingData.tracking_number}
									</span>
								</div>
								{order.shippingData.shipping_company && (
									<div className="flex justify-between items-center">
										<span className="text-gray-600">
											Transportista:
										</span>
										<span className="text-gray-900">
											{order.shippingData.shipping_company}
										</span>
									</div>
								)}
								{order.shippingData.estimated_delivery && (
									<div className="flex justify-between items-center">
										<span className="text-gray-600">
											Entrega estimada:
										</span>
										<span className="text-gray-900">
											{formatDate(order.shippingData.estimated_delivery)}
										</span>
									</div>
								)}
								<div className="mt-3">
									<Link
										to={`/seller/shipping/${order.id}`}
										className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 inline-flex items-center mt-2"
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
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-2">
								Notas
							</h2>
							<p className="text-gray-600">
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
