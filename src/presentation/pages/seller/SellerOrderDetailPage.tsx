import React, {useState, useEffect, useCallback} from "react";
import {useParams, Link} from "react-router-dom";
import {ArrowLeft, Truck, Package, Check, X, Calculator} from "lucide-react";
import {formatDate} from "../../../utils/formatters/formatDate";
import SellerOrderServiceAdapter from "../../../core/adapters/SellerOrderServiceAdapter";
import {useAuth} from "../../contexts/AuthContext";
import ShippingFormModal from "../../components/shipping/ShippingFormModal";
import OrderEarningsInfo from "../../components/seller/OrderEarningsInfo";
import OrderBreakdownService from "../../../core/services/OrderBreakdownService";
import type {ShippingFormData} from "../../components/shipping/ShippingFormModal";
import type {OrderDetail} from "../../../core/domain/entities/Order";
import type {OrderBreakdownResponse} from "../../../core/services/OrderBreakdownService";
import {
	canTransitionTo,
	type OrderStatus,
} from "../../../core/domain/entities/Order";

const SellerOrderDetailPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const {user} = useAuth();
	const [order, setOrder] = useState<OrderDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isUpdating, setIsUpdating] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
	const [itemsBreakdown, setItemsBreakdown] = useState<OrderBreakdownResponse | null>(null);
	const [breakdownLoading, setBreakdownLoading] = useState(false);

	const sellerOrderAdapter = new SellerOrderServiceAdapter();
	const breakdownService = OrderBreakdownService.getInstance();

	useEffect(() => {
		fetchOrderDetails();
	}, [id]);

	// ✅ FUNCIÓN para cargar breakdown de productos
	const loadItemsBreakdown = useCallback(async () => {
		console.log('🔍 loadItemsBreakdown ejecutándose con order:', order?.id, 'sellerId:', order?.sellerId, 'user.id:', user?.id);
		if (!order?.id) {
			console.log('❌ No se puede cargar breakdown - falta order.id:', {id: order?.id});
			return;
		}
		
		// ✅ USAR sellerId del order o del usuario autenticado como fallback
		const effectiveSellerId = order?.sellerId || user?.id;
		console.log('🔍 effectiveSellerId calculado:', effectiveSellerId);

		console.log('✅ Iniciando carga de breakdown para orden:', order.id);
		setBreakdownLoading(true);
		try {
			const breakdown = await breakdownService.getOrderItemsBreakdown(
				order.id,
				'seller' // viewType específico para seller
			);
			setItemsBreakdown(breakdown);
		} catch (error) {
			console.error('❌ ERROR DETALLADO al cargar breakdown para orden', order.id, ':', error);
			console.error('❌ URL del endpoint usado:', `/seller/orders/${order.id}`);
			console.error('❌ Detalles del error:', error instanceof Error ? error.message : error);
			// En caso de error, mantener el estado actual
		} finally {
			setBreakdownLoading(false);
		}
	}, [order?.id, order?.sellerId, user?.id, breakdownService]);

	// ✅ CARGAR breakdown cuando cambie la orden
	useEffect(() => {
		console.log('🔍 useEffect para loadItemsBreakdown ejecutándose, order cambió:', order?.id);
		loadItemsBreakdown();
	}, [loadItemsBreakdown]);

	const fetchOrderDetails = async () => {
		if (!id) return;

		setLoading(true);
		try {
			const orderDetail = await sellerOrderAdapter.getOrderDetails(id);
			console.log("🛍️ Detalles de la orden del seller:", orderDetail);
			console.log("🔍 VERIFICAR: order.sellerId =", orderDetail?.sellerId);
			console.log("🔍 VERIFICAR: order.id =", orderDetail?.id);
			console.log("🔍 VERIFICAR: user.id del contexto =", user?.id);
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
													
													{/* ✅ GANANCIAS POR PRODUCTO usando breakdown centralizado */}
													{breakdownLoading ? (
														<div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
															<div className="flex items-center justify-center">
																<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
																<span className="ml-2 text-sm text-gray-500">Calculando ganancias...</span>
															</div>
														</div>
													) : (
														<div className="mt-3 space-y-2">
															{/* Cantidad a enviar */}
															<div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
																<div className="flex items-center justify-between">
																	<span className="text-sm font-medium text-gray-700">Cantidad a enviar:</span>
																	<span className="text-xl font-bold text-primary-600">{item.quantity || 0}</span>
																</div>
															</div>
															
															{/* Ganancias por producto */}
															<div className="bg-green-50 p-3 rounded-lg border border-green-200">
																<div className="flex items-center justify-between">
																	<span className="text-sm font-medium text-gray-700">Ganancia por este producto:</span>
																	<span className="text-xl font-bold text-green-600">
																		{itemsBreakdown ? (
																			(() => {
																				const breakdownItem = itemsBreakdown.items.find(bi => bi.product_id === item.productId);
																				if (breakdownItem) {
																					// ✅ USAR DIRECTAMENTE LA GANANCIA CALCULADA POR EL BACKEND SI ESTÁ DISPONIBLE
																					if (breakdownItem.seller_net_earning_per_unit && breakdownItem.seller_net_earning_per_unit > 0) {
																						return `$${(breakdownItem.seller_net_earning_per_unit * item.quantity).toFixed(2)}`;
																					}
																					// ✅ FALLBACK: calcular ganancia = final_price - comision_plataforma 
																					else if (itemsBreakdown.summary?.seller_commission_info) {
																						const commissionRate = itemsBreakdown.summary.seller_commission_info.platform_commission_rate / 100;
																						const sellerEarningPerUnit = breakdownItem.final_price_per_unit * (1 - commissionRate);
																						return `$${(sellerEarningPerUnit * item.quantity).toFixed(2)}`;
																					}
																				}
																				return '$0.00';
																			})()
																		) : '$0.00'}
																	</span>
																</div>
																<div className="text-xs text-gray-500 mt-1">
																	({item.quantity} x ${itemsBreakdown ? (() => {
																		const breakdownItem = itemsBreakdown.items.find(bi => bi.product_id === item.productId);
																		if (breakdownItem) {
																			// ✅ USAR DIRECTAMENTE LA GANANCIA POR UNIDAD SI ESTÁ DISPONIBLE
																			if (breakdownItem.seller_net_earning_per_unit && breakdownItem.seller_net_earning_per_unit > 0) {
																				return breakdownItem.seller_net_earning_per_unit.toFixed(2);
																			}
																			// ✅ FALLBACK: calcular ganancia por unidad
																			else if (itemsBreakdown.summary?.seller_commission_info) {
																				const commissionRate = itemsBreakdown.summary.seller_commission_info.platform_commission_rate / 100;
																				const sellerEarningPerUnit = breakdownItem.final_price_per_unit * (1 - commissionRate);
																				return sellerEarningPerUnit.toFixed(2);
																			}
																		}
																		return '0.00';
																	})() : '0.00'} c/u)
																</div>
															</div>
														</div>
													)}
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

							{/* ✅ RESUMEN usando breakdown centralizado */}
							{breakdownLoading ? (
								<div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
									<div className="flex items-center justify-center">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
										<span className="ml-2 text-sm text-gray-500">Calculando resumen...</span>
									</div>
								</div>
							) : itemsBreakdown && itemsBreakdown.summary?.seller_commission_info ? (
								<OrderEarningsInfo
									grossEarnings={itemsBreakdown.summary.total_final_amount}
									platformCommission={itemsBreakdown.summary.seller_commission_info.total_commission}
									netEarnings={itemsBreakdown.summary.seller_commission_info.seller_earnings_from_products}
									shippingEarnings={itemsBreakdown.summary.seller_commission_info.shipping_distribution?.seller_amount || 0}
									totalEarnings={itemsBreakdown.summary.seller_commission_info.seller_earnings_from_products + (itemsBreakdown.summary.seller_commission_info.shipping_distribution?.seller_amount || 0)}
									commissionRate={itemsBreakdown.summary.seller_commission_info.platform_commission_rate}
									sellerCount={1}
									showBreakdown={true}
									className="mb-4"
								/>
							) : (
								<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
									<p className="text-sm text-yellow-800">
										<strong>Nota:</strong> No se pudieron cargar los cálculos centralizados. 
										Usando datos del backend como respaldo.
									</p>
									<OrderEarningsInfo
										grossEarnings={sellerData.subtotalVendido || 0}
										platformCommission={sellerData.platformCommission || 0}
										netEarnings={sellerData.sellerEarningsFromProducts || 0}
										shippingEarnings={sellerData.shippingIncome || 0}
										totalEarnings={sellerData.totalToReceive || 0}
										commissionRate={(sellerData.platformCommission ?? 0) > 0 && (sellerData.subtotalVendido ?? 0) > 0 ? ((sellerData.platformCommission ?? 0) / (sellerData.subtotalVendido ?? 1)) * 100 : 10.0}
										sellerCount={1}
										showBreakdown={true}
										className="mt-2"
									/>
								</div>
							)}


							<div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
								<p className="text-sm text-yellow-800">
									<strong>Nota:</strong> Los cupones de descuento NO afectan al seller (son asumidos por la tienda). 
									Solo se aplican descuentos de seller y por volumen. El envío se reparte entre sellers.
								</p>
							</div>
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