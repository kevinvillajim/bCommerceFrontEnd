import React, {useState, useEffect} from "react";
import {useParams, useNavigate, Link} from "react-router-dom";
import {ArrowLeft, FileText, Truck, Package} from "lucide-react";
import {formatCurrency} from "../../utils/formatters/formatCurrency";
import {formatDate} from "../../utils/formatters/formatDate";
import OrderStatusBadge from "../components/orders/OrderStatusBadge";
import OrderServiceAdapter from "../../core/adapters/OrderServiceAdapter";
import {getProductMainImage} from "../../utils/imageManager";
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

	// Función auxiliar para calcular subtotales
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
              Pedido #{order.orderNumber || order.orderNumber}
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
                    {order.payment_method === "datafast" && "Dastafast"}
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
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Precio
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    {(() => {
                      console.log("🎨 Renderizando productos...");
                      console.log("📦 order.items antes del map:", order.items);
                      return order.items.map((item, index) => {
                        console.log(`🏷️ Renderizando item ${index + 1}:`, item);

                        // Crear objeto para el sistema de imágenes
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
                          <tr
                            key={`item-${item.id || index}-${item.productId || "unknown"}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12 mr-3">
                                  <img
                                    className="h-12 w-12 rounded-md object-cover"
                                    src={imageUrl}
                                    alt={item.product_name || "Producto"}
                                    onError={(_e) => {
                                      console.log(
                                        "❌ Error cargando imagen:",
                                        imageUrl
                                      );
                                      console.log("📦 Item con error:", item);
                                    }}
                                    onLoad={() => {
                                      console.log(
                                        "✅ Imagen cargada correctamente:",
                                        imageUrl
                                      );
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailClientPage;