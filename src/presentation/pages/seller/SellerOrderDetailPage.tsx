import React, {useState, useEffect} from "react";
import {useParams, Link} from "react-router-dom";
import {ArrowLeft, Truck, Package, Check, X, FileText, Calculator} from "lucide-react";
import {formatDate} from "../../../utils/formatters/formatDate";
import SellerOrderServiceAdapter from "../../../core/adapters/SellerOrderServiceAdapter";
import ShippingFormModal from "../../components/shipping/ShippingFormModal";
import OrderEarningsInfo from "../../components/seller/OrderEarningsInfo";
import type {ShippingFormData} from "../../components/shipping/ShippingFormModal";
import type {OrderDetail} from "../../../core/domain/entities/Order";
import {
	canTransitionTo,
	type OrderStatus,
} from "../../../core/domain/entities/Order";

const SellerOrderDetailPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
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
			console.log("🛍️ Detalles de la orden del seller:", orderDetail);
			setOrder(orderDetail);
		} catch (error) {
			console.error("Error al cargar detalles de la orden:", error);
			setError("No se pudieron cargar los detalles de la orden");
		} finally {
			setLoading(false);
		}
	};

	const handleStatusUpdate = async (newStatus: OrderStatus) => {
		if (!order || !id) return;

		setIsUpdating(true);
		try {
			await sellerOrderAdapter.updateOrderStatus(id, newStatus);
			setOrder({...order, status: newStatus});
			setSuccessMessage("Estado de la orden actualizado correctamente");
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (error) {
			console.error("Error al actualizar estado:", error);
			setError("No se pudo actualizar el estado de la orden");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCreateShipping = async (shippingData: ShippingFormData) => {
		if (!order || !id) return;

		setIsUpdating(true);
		try {
			await sellerOrderAdapter.createShipping(id, shippingData);
			setIsShippingModalOpen(false);
			await fetchOrderDetails(); // Recargar para mostrar info de envío
			setSuccessMessage("Información de envío creada correctamente");
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (error) {
			console.error("Error al crear envío:", error);
			setError("No se pudo crear la información de envío");
		} finally {
			setIsUpdating(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Cargando detalles de la orden...</p>
				</div>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<X className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<p className="text-red-600 mb-4">{error || "Orden no encontrada"}</p>
					<Link
						to="/seller/orders"
						className="text-primary-600 hover:text-primary-800 font-medium"
					>
						← Volver a pedidos
					</Link>
				</div>
			</div>
		);
	}

	// ✅ CALCULAR DATOS ESPECÍFICOS DEL SELLER - LÓGICA CORREGIDA
	const calculateSellerData = () => {
		if (!order.orderSummary || !order.items) {
			return {
				totalQuantity: 0,
				subtotalOriginal: 0,
				subtotalFinal: 0,
				platformCommission: 0,
				shippingIncome: 0,
				totalToReceive: 0,
				sellerEarningsFromProducts: 0
			};
		}

		// ✅ DATOS CORRECTOS DEL BACKEND
		const totalQuantity = order.orderSummary.total_quantity || 0;
		const sellerEarningsFromProducts = order.orderSummary.total_seller_earnings_from_products || 0;
		const platformCommission = order.orderSummary.total_platform_commission || 0;
		const shippingIncome = order.orderSummary.shipping_distribution?.seller_amount || 0;
		
		// ✅ CÁLCULO CORRECTO: total vendido (ganancia + comisión) = lo que realmente se facturó
		const subtotalVendido = sellerEarningsFromProducts + platformCommission;
		const totalToReceive = sellerEarningsFromProducts + shippingIncome;

		return {
			totalQuantity,
			subtotalVendido,
			platformCommission,
			shippingIncome,
			totalToReceive,
			sellerEarningsFromProducts
		};
	};

	const sellerData = calculateSellerData();

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div className="flex items-center">
							<Link
								to="/seller/orders"
								className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
							>
								<ArrowLeft className="w-5 h-5 mr-1" />
								Volver a pedidos
							</Link>
							<h1 className="text-2xl font-bold text-gray-900">
								Pedido #{order.orderNumber}
							</h1>
						</div>

						<div className="flex space-x-3">
							{canTransitionTo(order.status, "shipped") && (
								<button
									onClick={() => setIsShippingModalOpen(true)}
									disabled={isUpdating}
									className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
								>
									<Truck className="w-4 h-4 mr-2 inline" />
									Marcar como enviado
								</button>
							)}

							{canTransitionTo(order.status, "cancelled") && (
								<button
									onClick={() => handleStatusUpdate("cancelled")}
									disabled={isUpdating}
									className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
								>
									<X className="w-4 h-4 mr-2 inline" />
									Cancelar pedido
								</button>
							)}

							<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
								<FileText className="w-4 h-4 mr-2 inline" />
								Generar factura
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Mensaje de éxito */}
			{successMessage && (
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
					<div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
						<Check className="w-5 h-5 inline mr-2" />
						{successMessage}
					</div>
				</div>
			)}

			{/* Contenido principal */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Información de la orden */}
					<div className="lg:col-span-1 space-y-6">
						{/* Estado del pedido */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">
								Estado del pedido
							</h2>
							<div className="space-y-3">
								<div>
									<span className="block text-sm font-medium text-gray-600">Estado:</span>
									<span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
										order.status === "completed" ? "bg-green-100 text-green-800" :
										order.status === "shipped" ? "bg-blue-100 text-blue-800" :
										order.status === "processing" ? "bg-yellow-100 text-yellow-800" :
										order.status === "cancelled" ? "bg-red-100 text-red-800" :
										"bg-gray-100 text-gray-800"
									}`}>
										{order.status === "pending" ? "Pendiente" :
										 order.status === "processing" ? "En proceso" :
										 order.status === "shipped" ? "Enviado" :
										 order.status === "delivered" ? "Entregado" :
										 order.status === "cancelled" ? "Cancelado" :
										 order.status === "completed" ? "Completado" : order.status}
									</span>
								</div>
								<div>
									<span className="block text-sm font-medium text-gray-600">Pago:</span>
									<span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
										order.paymentStatus === "completed" ? "bg-green-100 text-green-800" :
										order.paymentStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
										"bg-red-100 text-red-800"
									}`}>
										{order.paymentStatus === "completed" ? "Completado" :
										 order.paymentStatus === "pending" ? "Pendiente" : order.paymentStatus}
									</span>
								</div>
								<div>
									<span className="block text-sm font-medium text-gray-600">Método de pago:</span>
									<p className="text-gray-900">{order.paymentMethod || "No especificado"}</p>
								</div>
								<div>
									<span className="block text-sm font-medium text-gray-600">Fecha:</span>
									<p className="text-gray-900">{formatDate(order.createdAt)}</p>
								</div>
							</div>
						</div>

						{/* Cliente */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<h2 className="text-lg font-medium text-gray-900 mb-4">Cliente</h2>
							<div className="space-y-3">
								<div>
									<span className="block text-sm font-medium text-gray-600">Nombre:</span>
									<p className="text-gray-900">{order.customerName || "No especificado"}</p>
								</div>
								<div>
									<span className="block text-sm font-medium text-gray-600">Email:</span>
									<p className="text-gray-900">{order.customerEmail || "No especificado"}</p>
								</div>
								{order.shippingAddress && (
									<div>
										<span className="block text-sm font-medium text-gray-600">Dirección de envío:</span>
										<p className="text-gray-900">
											{order.shippingAddress.address}<br />
											{order.shippingAddress.city}, {order.shippingAddress.state}<br />
											{order.shippingAddress.country}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Información de envío */}
						{order.shippingData && (
							<div className="bg-white rounded-lg shadow-md p-6">
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
					<div className="lg:col-span-2 space-y-6">
						{/* ✅ PRODUCTOS DE TU TIENDA - ESPECÍFICO PARA SELLER */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="flex items-center mb-4">
								<Package className="w-5 h-5 text-gray-600 mr-2" />
								<h3 className="text-lg font-semibold text-gray-900">
									Productos de tu Tienda
								</h3>
								<span className="ml-2 text-sm text-gray-500">
									({sellerData.totalQuantity} {sellerData.totalQuantity === 1 ? 'producto' : 'productos'})
								</span>
							</div>

							<div className="space-y-4">
								{order.items && order.items.length > 0 ? (
									order.items.map((item, index) => (
										<div key={item.id || index} className="border border-gray-200 rounded-lg p-4">
											<div className="flex items-start space-x-4">
												{/* Imagen del Producto */}
												<div className="flex-shrink-0">
													{item.product_image ? (
														<img 
															src={item.product_image}
															alt={item.product_name}
															className="w-16 h-16 object-cover rounded-lg border border-gray-200"
														/>
													) : (
														<div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
															<Package className="w-8 h-8 text-gray-400" />
														</div>
													)}
												</div>

												{/* Información del Producto */}
												<div className="flex-1 min-w-0">
													<h4 className="text-lg font-medium text-gray-900">
														{item.product_name || 'Producto'}
													</h4>
													
													{/* ✅ SOLO LA CANTIDAD - SIMPLIFICADO COMO PIDIÓ EL USUARIO */}
													<div className="mt-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
														<div className="flex items-center justify-between">
															<span className="text-sm font-semibold text-gray-700">📦 Cantidad a enviar:</span>
															<p className="text-2xl font-bold text-primary-600">{item.quantity || 0}</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									))
								) : (
									<div className="text-center py-8 text-gray-500">
										No hay productos en esta orden
									</div>
								)}
							</div>

							{/* Nota informativa */}
							<div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
								<p className="text-sm text-blue-800">
									<strong>Información del Vendedor:</strong> Los precios mostrados son los finales 
									que se usaron para calcular tu comisión. Los descuentos ya están aplicados.
								</p>
							</div>
						</div>

						{/* ✅ RESUMEN DE VENTA - ESPECÍFICO PARA SELLER */}
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="flex items-center mb-4">
								<Calculator className="w-5 h-5 text-gray-600 mr-2" />
								<h3 className="text-lg font-semibold text-gray-900">Resumen de Venta</h3>
							</div>

							{/* Componente dinámico de ganancias con configuraciones reales */}
							<OrderEarningsInfo
								subtotal={sellerData.subtotalVendido || 0}
								shippingCost={order.shipping_cost || 0}
								sellerIds={[order.seller_id || order.sellerId || 0]}
								currentSellerId={order.seller_id || order.sellerId}
								showBreakdown={true}
								className="mb-4"
							/>


							<div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
								<p className="text-sm text-yellow-800">
									<strong>Nota:</strong> Los cupones de descuento NO afectan al seller (son asumidos por la tienda). 
									Solo se aplican descuentos de seller y por volumen. El envío se reparte entre sellers.
								</p>
							</div>
						</div>

						{/* ✅ DESGLOSE DE GANANCIAS */}
						<div className="bg-white rounded-lg shadow-md p-6">
							{/* Componente dinámico compacto para vista lateral */}
							<OrderEarningsInfo
								subtotal={sellerData.subtotalVendido || 0}
								shippingCost={order.shipping_cost || 0}
								sellerIds={[order.seller_id || order.sellerId || 0]}
								currentSellerId={order.seller_id || order.sellerId}
								showBreakdown={true}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Modal de envío */}
			<ShippingFormModal
				orderId={id || ""}
				orderNumber={order.orderNumber}
				isOpen={isShippingModalOpen}
				onClose={() => setIsShippingModalOpen(false)}
				onSubmit={handleCreateShipping}
				isLoading={isUpdating}
			/>
		</div>
	);
};

export default SellerOrderDetailPage;