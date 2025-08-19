import React, {useState, useEffect, useMemo} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {ArrowLeft, FileText, Truck, Package} from "lucide-react";
import {formatDate} from "../../utils/formatters/formatDate";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import OrderServiceAdapter from "../../core/adapters/OrderServiceAdapter";
import OrderPricingBreakdown from "../components/orders/OrderPricingBreakdown";
import OrderItemsList from "../components/orders/OrderItemsList";
import type {OrderDetail} from "../../core/domain/entities/Order";
import type {OrderUI} from "../../core/adapters/OrderServiceAdapter";

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
			console.log("🛍️ Detalles de la orden recibidos:", orderDetail);
			console.log("📦 Items de la orden:", orderDetail?.items);
			console.log("🔢 Cantidad de items:", orderDetail?.items?.length);
			
			// Debuggear cada item individualmente
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

	// ✅ CORREGIDO: Priorizar pricing_breakdown si está disponible
	const orderTotals = useMemo(() => {
		if (!order) return null;
		
		console.log("🔍 OrderDetailClientPage - Analizando totales:");
		console.log("📊 order.pricing_breakdown:", order.pricing_breakdown);
		console.log("📊 order.original_total (directo):", order.original_total);
		console.log("📊 order.total_discounts (directo):", order.total_discounts);
		console.log("📊 order.volume_discount_savings (directo):", order.volume_discount_savings);
		
		// Priorizar datos del pricing_breakdown si están disponibles
		// 🔧 CORREGIDO: Parsear JSON si pricing_breakdown es string
		let pricingData: any = {};
		if (order.pricing_breakdown) {
			try {
				pricingData = typeof order.pricing_breakdown === 'string' 
					? JSON.parse(order.pricing_breakdown) 
					: order.pricing_breakdown;
			} catch (e) {
				console.warn("⚠️ Error parsing pricing_breakdown:", e);
				pricingData = {};
			}
		}
		
		const totals = {
			// ✅ Usar subtotal_with_discounts del pricing_breakdown
			subtotal_products: pricingData.subtotal_with_discounts ?? order.subtotal_products ?? 0,
			// ✅ Usar subtotal_original del pricing_breakdown para el precio original
			original_total: pricingData.subtotal_original ?? order.original_total ?? 0,
			// ✅ Usar valores del pricing_breakdown
			iva_amount: pricingData.iva_amount ?? order.iva_amount ?? 0,
			shipping_cost: pricingData.shipping_cost ?? order.shipping_cost ?? 0,
			// ✅ Usar final_total del pricing_breakdown
			total: pricingData.final_total ?? order.total ?? 0,
			// ✅ Descuentos del pricing_breakdown
			seller_discount_savings: pricingData.seller_discounts ?? order.volume_discount_savings ?? 0,
			volume_discount_savings: pricingData.volume_discounts ?? order.volume_discount_savings ?? 0,
			feedback_discount_amount: 0, // Esta propiedad no existe en OrderDetail
			total_discounts: pricingData.total_discounts ?? order.total_discounts ?? 0,
			// Códigos y flags
			feedback_discount_code: null, // Esta propiedad no existe en OrderDetail
			volume_discounts_applied: order.volume_discounts_applied || false,
			free_shipping: pricingData.free_shipping ?? order.free_shipping ?? false
		};
		
		console.log("🎯 Totales finales calculados:", totals);
		return totals;
	}, [order]);

	// ✅ NUEVO: Convertir OrderDetail a OrderUI para compatibilidad con componentes
	const orderForComponents: OrderUI | null = useMemo(() => {
		if (!order || !orderTotals) return null;

		return {
			id: String(order.id),
			orderNumber: order.orderNumber || String(order.id),
			date: order.created_at || new Date().toISOString(),
			customer: {
				id: order.userId || 0,
				name: order.user_name || "Cliente",
				email: order.user_email || "email@example.com",
			},
			subtotal: orderTotals.subtotal_products,
			taxAmount: orderTotals.iva_amount,
			total: orderTotals.total,
			items: (order.items || []).map((item) => ({
				id: item.id || 0,
				productId: (item as any).product_id || item.productId || 0,
				name: item.product_name || "Producto",
				quantity: item.quantity || 1,
				price: item.price || 0, // Este es el precio total del item (quantity * precio_por_unidad)
				subtotal: item.price || 0, // CORREGIDO: item.price ya es el subtotal correcto
				image: item.product_image,
				originalPrice: item.original_price || item.price,
				volumeDiscountPercentage: item.volume_discount_percentage || 0,
				volumeSavings: item.volume_savings || 0,
				discountLabel: item.discount_label || null,
				hasVolumeDiscount: (item.volume_discount_percentage || 0) > 0
			})),
			status: order.status || "pending",
			paymentStatus: (order.payment_status as any) || "pending",
			shippingAddress: order.shippingData ? 
				`${order.shippingData.address}, ${order.shippingData.city}, ${order.shippingData.state}` : 
				undefined,
			notes: order.shippingData?.notes,
			itemCount: order.items?.length,
			originalTotal: orderTotals.original_total,
			volumeDiscountSavings: orderTotals.volume_discount_savings,
			volumeDiscountsApplied: orderTotals.volume_discounts_applied,
			shippingCost: orderTotals.shipping_cost,
			freeShipping: orderTotals.free_shipping,
			totalDiscounts: orderTotals.total_discounts,
			pricingBreakdown: order.pricing_breakdown
		};
	}, [order, orderTotals]);

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
              className="cursor-pointer flex items-center text-gray-600 hover:text-primary-600 mb-2"
            >
              <ArrowLeft
                size={16}
                className="mr-1"
              />
              <span>Volver a mis pedidos</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Pedido #{order.orderNumber || order.id}
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
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Estado del pedido
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estado:</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pago:</span>
                  <OrderStatusBadge
                    status={order.payment_status}
                    type="payment"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Método de pago:</span>
                  <span className="text-gray-900">
                    {order.payment_method === "credit_card" &&
                      "Tarjeta de crédito"}
                    {order.payment_method === "datafast" && "Datafast"}
                    {order.payment_method === "deuna" && "DeUna"}
                    {order.payment_method === "transfer" && "Transferencia"}
                    {order.payment_method === "other" && "Otro"}
                    {!order.payment_method && "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="text-gray-900">
                    {order.created_at
                      ? formatDate(order.created_at)
                      : "Sin fecha"}
                  </span>
                </div>
              </div>
            </div>

            {/* Información de envío */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información de envío
              </h2>
              <div className="space-y-3">
                {order.shippingData ? (
                  <>
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
                        {order.shippingData.country},{" "}
                        {order.shippingData.postalCode}
                      </p>
                    </div>
                    {order.shippingData.phone && (
                      <div>
                        <span className="block text-sm font-medium text-gray-600">
                          Teléfono:
                        </span>
                        <p className="text-gray-900">
                          {order.shippingData.phone}
                        </p>
                      </div>
                    )}
                    {order.shippingData.tracking_number && (
                      <div>
                        <span className="block text-sm font-medium text-gray-600">
                          Número de seguimiento:
                        </span>
                        <p className="text-primary-600 font-medium">
                          {order.shippingData.tracking_number}
                        </p>
                      </div>
                    )}
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
                  </>
                ) : (
                  <p className="text-gray-600">
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          order.status !== "pending"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Package size={20} />
                      </div>
                      <span className="text-xs mt-1">
                        {order.status !== "pending"
                          ? "Procesando"
                          : "Pendiente"}
                      </span>
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          order.status === "shipped" ||
                          order.status === "delivered" ||
                          order.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Truck size={20} />
                      </div>
                      <span className="text-xs mt-1">Enviado</span>
                    </div>
                    <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          order.status === "delivered" ||
                          order.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
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
            {/* ✅ NUEVOS COMPONENTES: Lista de productos con descuentos detallados */}
            {orderForComponents && (
              <OrderItemsList 
                order={orderForComponents} 
                viewType="customer" 
              />
            )}

            {/* ✅ NUEVO: Desglose detallado de precios */}
            {orderTotals && (
              <OrderPricingBreakdown
                originalSubtotal={orderTotals.original_total}
                sellerDiscounts={orderTotals.seller_discount_savings}
                volumeDiscounts={orderTotals.volume_discount_savings}
                couponDiscount={orderTotals.feedback_discount_amount}
                couponCode={orderTotals.feedback_discount_code || undefined}
                subtotalAfterDiscounts={orderTotals.subtotal_products}
                shipping={orderTotals.shipping_cost}
                freeShipping={orderTotals.free_shipping}
                tax={orderTotals.iva_amount}
                total={orderTotals.total}
                isSellerView={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailClientPage;