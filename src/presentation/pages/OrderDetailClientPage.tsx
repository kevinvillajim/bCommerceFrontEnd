import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {ArrowLeft, FileText, Truck, Package} from "lucide-react";
import {formatCurrency} from "../../utils/formatters/formatCurrency";
import {formatDate} from "../../utils/formatters/formatDate";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import {OrderServiceAdapter} from "../../core/adapters/OrderServiceAdapter";
import type {OrderDetail} from "../../core/domain/entities/Order";

const OrderDetailClientPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const [order, setOrder] = useState<OrderDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const orderAdapter = new OrderServiceAdapter();

	useEffect(() => {
		fetchOrderDetails();
	}, [id]);

	const fetchOrderDetails = async () => {
		if (!id) return;

		setLoading(true);
		try {
			const orderDetail = await orderAdapter.getOrderDetails(id);
			setOrder(orderDetail);
			setError(null);
		} catch (err) {
			setError("No se pudo cargar el detalle de la orden");
			console.error("Error al cargar detalles de orden:", err);
		} finally {
			setLoading(false);
		}
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
					<div className="text-red-500 text-5xl mb-4">❌</div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
						Error al cargar el pedido
					</h2>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						{error || "No se pudo encontrar el pedido solicitado"}
					</p>
					<button
						onClick={() => navigate("/orders")}
						className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
					>
						Volver a mis pedidos
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
			<div className="space-y-6">
				{/* Encabezado */}
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<button
							onClick={() => navigate("/orders")}
							className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 mb-2"
						>
							<ArrowLeft size={16} className="mr-1" />
							<span>Volver a mis pedidos</span>
						</button>
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
							Pedido #{order.orderNumber}
						</h1>
					</div>

					<div className="flex space-x-3">
						{/* Botones de acción según el estado */}
						{["completed", "delivered"].includes(order.status) && (
							<Link
								to={`/invoices/${order.id}`}
								className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
							>
								<FileText size={18} />
								<span>Ver factura</span>
							</Link>
						)}
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
									<OrderStatusBadge status={order.status} />
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600 dark:text-gray-400">
										Pago:
									</span>
									<OrderStatusBadge
										status={order.paymentStatus || "pending"}
										type="payment"
									/>
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
									<span className="text-gray-600 dark:text-gray-400">
										Fecha:
									</span>
									<span className="text-gray-900 dark:text-gray-100">
										{formatDate(order.createdAt || "")}
									</span>
								</div>
							</div>
						</div>

						{/* Información de envío */}
						<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
							<h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
								Información de envío
							</h2>
							<div className="space-y-3">
								{order.shippingData ? (
									<>
										<div>
											<span className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
												Dirección de envío:
											</span>
											<p className="text-gray-900 dark:text-gray-100">
												{order.shippingData.address}
											</p>
											<p className="text-gray-900 dark:text-gray-100">
												{order.shippingData.city}, {order.shippingData.state}
											</p>
											<p className="text-gray-900 dark:text-gray-100">
												{order.shippingData.country},{" "}
												{order.shippingData.postalCode}
											</p>
										</div>
										{order.shippingData.phone && (
											<div>
												<span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
													Teléfono:
												</span>
												<p className="text-gray-900 dark:text-gray-100">
													{order.shippingData.phone}
												</p>
											</div>
										)}
										{order.shippingData.tracking_number && (
											<div>
												<span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
													Número de seguimiento:
												</span>
												<p className="text-primary-600 dark:text-primary-400 font-medium">
													{order.shippingData.tracking_number}
												</p>
											</div>
										)}
										{order.shippingData.shipping_company && (
											<div>
												<span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
													Empresa de transporte:
												</span>
												<p className="text-gray-900 dark:text-gray-100">
													{order.shippingData.shipping_company}
												</p>
											</div>
										)}
										{order.shippingData.estimated_delivery && (
											<div>
												<span className="block text-sm font-medium text-gray-600 dark:text-gray-400">
													Entrega estimada:
												</span>
												<p className="text-gray-900 dark:text-gray-100">
													{formatDate(order.shippingData.estimated_delivery)}
												</p>
											</div>
										)}
									</>
								) : (
									<p className="text-gray-600 dark:text-gray-400">
										No hay información de envío disponible
									</p>
								)}
							</div>

							{/* Mostrar iconos de estado según la fase de envío */}
							<div className="mt-6">
								<div className="relative">
									<div className="flex items-center justify-between">
										<div className="flex flex-col items-center">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status !== "pending" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
											>
												<Package size={20} />
											</div>
											<span className="text-xs mt-1">Procesando</span>
										</div>
										<div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700"></div>
										<div className="flex flex-col items-center">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === "shipped" || order.status === "delivered" || order.status === "completed" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
											>
												<Truck size={20} />
											</div>
											<span className="text-xs mt-1">Enviado</span>
										</div>
										<div className="flex-1 h-1 mx-2 bg-gray-200 dark:bg-gray-700"></div>
										<div className="flex flex-col items-center">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === "delivered" || order.status === "completed" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
											>
												<Package size={20} />
											</div>
											<span className="text-xs mt-1">Entregado</span>
										</div>
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
														{item.product?.image && (
															<div className="flex-shrink-0 h-10 w-10 mr-3">
																<img
																	className="h-10 w-10 rounded-md object-cover"
																	src={item.product.image}
																	alt={item.product?.name || "Producto"}
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
																	to={`/product/${item.product.slug}`}
																	className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
																>
																	Ver producto
																</Link>
															)}
														</div>
													</div>
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
								{/* Mostrar impuestos, si aplica */}
								<div className="flex justify-between items-center pb-2">
									<span className="text-gray-600 dark:text-gray-400">
										IVA (16%):
									</span>
									<span className="text-gray-900 dark:text-gray-100">
										{formatCurrency(
											order.items.reduce(
												(sum, item) => sum + item.price * item.quantity * 0.16,
												0
											)
										)}
									</span>
								</div>
								<div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 font-medium">
									<span className="text-gray-900 dark:text-gray-100">
										Total:
									</span>
									<span className="text-lg text-gray-900 dark:text-gray-100">
										{formatCurrency(order.total)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderDetailClientPage;
