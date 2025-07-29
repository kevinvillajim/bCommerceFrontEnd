import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {ArrowLeft, Truck, Package, Check, X, FileText} from "lucide-react";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import {formatDate} from "../../../utils/formatters/formatDate";
import SellerOrderServiceAdapter from "../../../core/adapters/SellerOrderServiceAdapter";
import ShippingFormModal from "../../components/shipping/ShippingFormModal";
import {getProductMainImage} from "../../../utils/imageManager";
import type {ShippingFormData} from "../../components/shipping/ShippingFormModal";
import {
	canTransitionTo,
	isValidOrderStatus,
	type OrderStatus,
} from "../../../core/domain/entities/Order";
import type {OrderDetail} from "../../../core/domain/entities/Order";

const OrderDetailPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const [order, setOrder] = useState<OrderDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

	const sellerOrderAdapter = new SellerOrderServiceAdapter();

	useEffect(() => {
		fetchOrderDetails();
	}, [id]);

	const fetchOrderDetails = async () => {
		if (!id) return;

		setLoading(true);
		try {
			const orderDetail = await sellerOrderAdapter.getOrderDetails(id);
			console.log("🛍️ Detalles de la orden recibidos (seller):", orderDetail);
			console.log("📦 Items de la orden:", orderDetail?.items);
			console.log("🔢 Cantidad de items:", orderDetail?.items?.length);
			
			orderDetail?.items?.forEach((item, index) => {
				console.log(`📋 Item ${index + 1}:`, {
					id: item.id,
					product_name: item.product_name,
					product_image: item.product_image,
					price: item.price,
					quantity: item.quantity,
					productId: item.productId,
					completeItem: item
				});
			});
			
			setOrder(orderDetail);
			setError(null);
		} catch (err) {
			setError("No se pudo cargar el detalle de la orden");
			console.error("Error al cargar detalles de orden:", err);
		} finally {
			setLoading(false);
		}
	};

	// Función auxiliar para calcular subtotales (igual que en OrderDetailClientPage)
	const calculateSubtotal = () => {
		if (!order || !order.items || order.items.length === 0) {
			console.log("💰 calculateSubtotal: No hay items o order");
			return 0;
		}
		
		console.log("💰 calculateSubtotal - Items para calcular:", order.items);
		const subtotal = order.items.reduce((sum, item, index) => {
			const itemTotal = item.price * item.quantity;
			console.log(`💰 Item ${index + 1}: ${item.product_name} - ${item.price} × ${item.quantity} = ${itemTotal}`);
			return sum + itemTotal;
		}, 0);
		
		console.log("💰 Subtotal total calculado:", subtotal);
		return subtotal;
	};

	// Función auxiliar para calcular el IVA (15%)
	const calculateTax = () => {
		const subtotal = calculateSubtotal();
		const tax = subtotal * 0.15;
		console.log("🧾 Impuesto calculado (15%):", tax, "sobre subtotal:", subtotal);
		return tax;
	};

	// Función auxiliar para calcular el total (subtotal + IVA)
	const calculateTotal = () => {
		const subtotal = calculateSubtotal();
		const tax = calculateTax();
		const total = subtotal + tax;
		console.log("🎯 Total final:", total, "(subtotal:", subtotal, "+ tax:", tax, ")");
		return total;
	};

	const handleStatusChange = async (newStatus: OrderStatus) => {
		if (!id || !order) return;

		if (!canTransitionTo(order.status, newStatus)) {
			setError(`No se puede cambiar de "${order.status}" a "${newStatus}"`);
			return;
		}

		if (newStatus === "shipped") {
			setIsShippingModalOpen(true);
			return;
		}

		setIsUpdating(true);
		setSuccessMessage(null);
		setError(null);

		try {
			if (!isValidOrderStatus(newStatus)) {
				throw new Error(`Estado inválido: ${newStatus}`);
			}

			const success = await sellerOrderAdapter.updateOrderStatus(id, newStatus);

			if (success) {
				setOrder((prev) => (prev ? {...prev, status: newStatus} : null));
				setSuccessMessage(
					`El estado del pedido ha sido actualizado a ${getStatusText(newStatus)}`
				);

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

	const handleShippingSubmit = async (shippingData: ShippingFormData) => {
		if (!id || !order) return;

		setIsUpdating(true);
		setSuccessMessage(null);
		setError(null);

		try {
			const success = await sellerOrderAdapter.updateShippingInfo(Number(id), shippingData);

			if (success) {
				setIsShippingModalOpen(false);

				setOrder((prev) => {
					if (!prev) return null;

					return {
						...prev,
						status: "shipped",
						shippingData: {
							...prev.shippingData,
							tracking_number: shippingData.tracking_number,
							shipping_company: shippingData.shipping_company,
							estimated_delivery: shippingData.estimated_delivery,
							notes: shippingData.notes,
						}
					};
				});

				setSuccessMessage(
					`El pedido ha sido marcado como enviado y se ha registrado la información de envío`
				);

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
			case "rejected":
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
			case "rejected":
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
		if (!isValidOrderStatus(currentStatus) || !isValidOrderStatus(newStatus)) {
			return false;
		}

		return canTransitionTo(
			currentStatus as OrderStatus,
			newStatus as OrderStatus
		);
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
					<div className="text-red-500 text-5xl mb-4">❌</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Error al cargar el pedido
					</h2>
					<p className="text-gray-700 mb-6">
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
		<div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
			<div className="space-y-6">
				{/* Modal de envío */}
				<ShippingFormModal
					orderId={id || ""}
					orderNumber={order.orderNumber}
					isOpen={isShippingModalOpen}
					onClose={() => setIsShippingModalOpen(false)}
					onSubmit={handleShippingSubmit}
					isLoading={isUpdating}
				/>

				{/* Encabezado */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<button
							onClick={() => navigate(-1)}
							className="cursor-pointer flex items-center text-gray-600 hover:text-primary-600 mb-2"
						>
							<ArrowLeft size={16} className="mr-1" />
							<span>Volver a pedidos</span>
						</button>
						<h1 className="text-2xl font-bold text-gray-800">
							Pedido #{order.orderNumber || order.id}
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
					<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
						<span className="block sm:inline">{successMessage}</span>
					</div>
				)}

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
						<span className="block sm:inline">{error}</span>
					</div>
				)}

				{isUpdating && (
					<div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
						<div className="flex items-center">
							<div className="animate-spin mr-2 h-4 w-4 border-t-2 border-blue-500"></div>
							<span className="block sm:inline">Actualizando estado del pedido...</span>
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
									<span className="text-gray-600">Estado:</span>
									<span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
										{getStatusText(order.status)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Pago:</span>
									<span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusClass(order.payment.status)}`}>
										{getPaymentStatusText(order.payment.status)}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Método de pago:</span>
									<span className="text-gray-900">
										{order.payment.method === "credit_card" && "Tarjeta de crédito"}
										{order.payment.method === "datafast" && "Datafast"}
										{order.payment_method === "transfer" && "Transferencia"}
										{order.payment_method === "other" && "Otro"}
										{(order.payment_method === null) && "No especificado"}

									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Fecha:</span>
									<span className="text-gray-900">
										{order.orderDate ? formatDate(order.orderDate) : "Sin fecha"}
									</span>
								</div>
							</div>
						</div>

						{/* Información del cliente */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Cliente
							</h2>
							<div className="space-y-3">
								<div>
									<span className="block text-sm font-medium text-gray-600 mb-1">
										Nombre:
									</span>
									<p className="text-gray-900">
										{order.customer?.name || "No disponible"}
									</p>
								</div>
								<div>
									<span className="block text-sm font-medium text-gray-600 mb-1">
										Email:
									</span>
									<p className="text-gray-900">
										{order.customer?.email || "No disponible"}
									</p>
								</div>
								{order.shippingData && (
									<div>
										<span className="block text-sm font-medium text-gray-600 mb-1">
											Dirección de envío:
										</span>
										<p className="text-gray-900">
											{order.shippingData.address}
										</p>
										<p className="text-gray-900">
											{order.shippingData.city}, {order.shippingData.state}
										</p>
										<p className="text-gray-900">
											{order.shippingData.country}, {order.shippingData.postalCode}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Información de envío */}
						{order.shippingData?.tracking_number && (
							<div className="bg-white rounded-lg shadow p-6">
								<h2 className="text-lg font-medium text-gray-900 mb-4">
									Información de envío
								</h2>
								<div className="space-y-3">
									<div>
										<span className="block text-sm font-medium text-gray-600">
											Número de seguimiento:
										</span>
										<p className="text-primary-600 font-medium">
											{order.shippingData.tracking_number}
										</p>
									</div>
									{order.shippingData.shipping_company && (
										<div>
											<span className="block text-sm font-medium text-gray-600">
												Empresa de transporte:
											</span>
											<p className="text-gray-900">
												{order.shippingData.shipping_company}
											</p>
										</div>
									)}
									{order.shippingData.estimated_delivery && (
										<div>
											<span className="block text-sm font-medium text-gray-600">
												Entrega estimada:
											</span>
											<p className="text-gray-900">
												{formatDate(order.shippingData.estimated_delivery)}
											</p>
										</div>
									)}
								</div>
							</div>
						)}
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
											<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
												Producto
											</th>
											<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
												Precio
											</th>
											<th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
												Cantidad
											</th>
											<th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
												Subtotal
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{(() => {
											console.log("🎨 Renderizando productos (seller)...");
											console.log("📦 order.items antes del map:", order.items);
											return order.items.map((item, index) => {
												console.log(`🏷️ Renderizando item ${index + 1}:`, item);

												const productForImage = {
													id: item.productId,
													image: item.product_image,
													main_image: item.product_image,
													product_image: item.product_image,
												};

												console.log("🖼️ Objeto para imagen:", productForImage);
												const imageUrl = getProductMainImage(productForImage);
												console.log("🎯 URL final de imagen:", imageUrl);

												return (
													<tr key={`item-${item.id || index}-${item.productId || "unknown"}`}>
														<td className="px-6 py-4 whitespace-nowrap">
															<div className="flex items-center">
																<div className="flex-shrink-0 h-12 w-12 mr-3">
																	<img
																		className="h-12 w-12 rounded-md object-cover"
																		src={imageUrl}
																		alt={item.product_name || "Producto"}
																		onError={(_e) => {
																			console.log("❌ Error cargando imagen:", imageUrl);
																			console.log("📦 Item con error:", item);
																		}}
																		onLoad={() => {
																			console.log("✅ Imagen cargada correctamente:", imageUrl);
																		}}
																	/>
																</div>
																<div>
																	<div className="text-sm font-medium text-gray-900">
																		{item.product_name || "Producto"}
																	</div>
																	{item.productId && (
																		<Link
																			to={`/products/${item.productId}`}
																			className="text-xs text-primary-600 hover:underline"
																		>
																			Ver producto
																		</Link>
																	)}
																</div>
															</div>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
															{formatCurrency(item.price)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
															{item.quantity}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
															{formatCurrency(item.price * item.quantity)}
														</td>
													</tr>
												);
											});
										})()}
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
									<span className="text-gray-600">Subtotal:</span>
									<span className="text-gray-900">
										{formatCurrency(calculateSubtotal())}
									</span>
								</div>
								<div className="flex justify-between items-center pb-2">
									<span className="text-gray-600">IVA (15%):</span>
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
		</div>
	);
};

export default OrderDetailPage;