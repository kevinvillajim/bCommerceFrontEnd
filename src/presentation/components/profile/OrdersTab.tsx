import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {ShoppingBag, Gift, TrendingDown, Truck} from "lucide-react";
import {OrderServiceAdapter} from "../../../core/adapters/OrderServiceAdapter";
import {formatCurrency} from "../../../utils/formatters/formatCurrency";
import OrderStatusBadge from "../orders/OrderStatusBadge";

/**
 * Componente de pestaña de órdenes del usuario
 */
const OrdersTab: React.FC = () => {
	const [orders, setOrders] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [orderFilter, setOrderFilter] = useState<string | null>(null);

	const orderAdapter = new OrderServiceAdapter();

	// Cargar órdenes cuando cambia el filtro
	useEffect(() => {
		fetchOrders();
	}, [orderFilter]);

	// Función para obtener órdenes del usuario
	const fetchOrders = async () => {
		try {
			setIsLoading(true);

			const filters: any = {};

			// Aplicar filtros si existen
			if (orderFilter) {
				filters.status = orderFilter;
			}

			const result = await orderAdapter.getUserOrders(filters);

			// Asegurarse de que tenemos los datos
			if (result && result.orders) {
				setOrders(result.orders);
			} else {
				setOrders([]);
			}
		} catch (error) {
			console.error("Error al cargar órdenes:", error);
			setOrders([]); // Establecer un array vacío en caso de error
		} finally {
			setIsLoading(false);
		}
	};

	// Formatear fecha
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		}).format(date);
	};

	// Filtrar órdenes según el filtro seleccionado
	const getFilteredOrders = () => {
		if (!orderFilter) return orders;
		return orders.filter(
			(order) => order.status.toLowerCase() === orderFilter.toLowerCase()
		);
	};

	return (
		<div className="p-6">
			<h3 className="text-xl font-semibold mb-6">Mis Pedidos</h3>

			{/* Filtros */}
			<div className="flex flex-wrap gap-2 mb-6">
				<button
					onClick={() => setOrderFilter(null)}
					className={`px-4 py-2 ${!orderFilter ? "bg-primary-50 text-primary-600 font-medium" : "hover:bg-gray-100 text-gray-700"} rounded-lg`}
				>
					Todos
				</button>
				<button
					onClick={() => setOrderFilter("processing")}
					className={`px-4 py-2 ${orderFilter === "processing" ? "bg-primary-50 text-primary-600 font-medium" : "hover:bg-gray-100 text-gray-700"} rounded-lg`}
				>
					En proceso
				</button>
				<button
					onClick={() => setOrderFilter("shipped")}
					className={`px-4 py-2 ${orderFilter === "shipped" ? "bg-primary-50 text-primary-600 font-medium" : "hover:bg-gray-100 text-gray-700"} rounded-lg`}
				>
					Enviados
				</button>
				<button
					onClick={() => setOrderFilter("delivered")}
					className={`px-4 py-2 ${orderFilter === "delivered" ? "bg-primary-50 text-primary-600 font-medium" : "hover:bg-gray-100 text-gray-700"} rounded-lg`}
				>
					Entregados
				</button>
				<button
					onClick={() => setOrderFilter("cancelled")}
					className={`px-4 py-2 ${orderFilter === "cancelled" ? "bg-primary-50 text-primary-600 font-medium" : "hover:bg-gray-100 text-gray-700"} rounded-lg`}
				>
					Cancelados
				</button>
			</div>

			{isLoading ? (
				<div className="flex justify-center items-center h-32">
					<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
				</div>
			) : (
				<div className="space-y-4">
					{getFilteredOrders().length > 0 ? (
						getFilteredOrders().map((order) => (
							<div
								key={order.id}
								className="border border-gray-200 rounded-lg overflow-hidden"
							>
								<div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center">
									<div>
										<span className="text-gray-500">
											Pedido #{order.orderNumber}
										</span>
										<span className="mx-2">•</span>
										<span className="text-gray-500">
											{formatDate(order.date)}
										</span>
									</div>
									<div>
										<OrderStatusBadge status={order.status} />
									</div>
								</div>
								<div className="p-4">
									{order.items &&
										order.items.map((item: any, index: number) => (
											<div
												key={index}
												className="flex items-center mb-4 last:mb-0"
											>
												<div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
													{item.product?.image ? (
														<img
															src={item.product.image}
															alt={item.product.name || item.name}
															className="w-full h-full object-cover"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center text-gray-400">
															<ShoppingBag size={24} />
														</div>
													)}
												</div>
												<div>
													<h4 className="font-medium">
														{item.product?.name || item.name}
													</h4>
													<div className="text-gray-500 text-sm">
														Cantidad: {item.quantity}
													</div>
												</div>
												<div className="ml-auto font-medium">
													{formatCurrency(item.price)}
												</div>
											</div>
										))}
									<div className="border-t border-gray-100 pt-4">
										{/* ✅ Mostrar descuentos aplicados */}
										<div className="flex flex-wrap gap-2 mb-3">
											{order.seller_discount_savings > 0 && (
												<span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center">
													<Gift size={12} className="mr-1" />
													Vendedor: -{formatCurrency(order.seller_discount_savings)}
												</span>
											)}
											{order.volume_discount_savings > 0 && (
												<span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded flex items-center">
													<TrendingDown size={12} className="mr-1" />
													Volumen: -{formatCurrency(order.volume_discount_savings)}
												</span>
											)}
											{order.feedback_discount_amount > 0 && order.feedback_discount_code && (
												<span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded flex items-center">
													<Gift size={12} className="mr-1" />
													{order.feedback_discount_code}: -{formatCurrency(order.feedback_discount_amount)}
												</span>
											)}
											{order.free_shipping && (
												<span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded flex items-center">
													<Truck size={12} className="mr-1" />
													Envío gratis
												</span>
											)}
										</div>
										
										<div className="flex justify-between items-center">
											<div>
												{order.total_discounts > 0 && (
													<div className="text-xs text-green-600 mb-1">
														Ahorros: {formatCurrency(order.total_discounts)}
													</div>
												)}
												<div>
													<span className="text-gray-500 text-sm">Total:</span>
													<span className="ml-1 font-bold text-lg">
														{formatCurrency(order.total)}
													</span>
													{order.original_total > order.total && (
														<span className="ml-2 text-xs text-gray-400 line-through">
															{formatCurrency(order.original_total)}
														</span>
													)}
												</div>
											</div>
											<Link
												to={`/orders/${order.id}`}
												className="text-primary-600 hover:text-primary-700 text-sm font-medium"
											>
												Ver detalles
											</Link>
										</div>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="text-center py-10 bg-gray-50 rounded-lg">
							<ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
							{orderFilter ? (
								<>
									<h4 className="text-lg font-medium text-gray-700 mb-2">
										No tienes pedidos con este estado
									</h4>
									<p className="text-gray-500 mb-6">
										Prueba con otro filtro o revisa tus pedidos más tarde.
									</p>
								</>
							) : (
								<>
									<h4 className="text-lg font-medium text-gray-700 mb-2">
										No tienes pedidos aún
									</h4>
									<p className="text-gray-500 mb-6">
										¡Explora nuestros productos y realiza tu primera compra!
									</p>
								</>
							)}
							<Link
								to="/products"
								className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
							>
								Explorar productos
							</Link>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default OrdersTab;
