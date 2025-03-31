import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import ApiClient from '../../../infrastructure/api/apiClient';

interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  image?: string;
}

interface Order {
  id: number;
  order_number: string;
  date: string;
  status: string;
  total: number;
  payment_status: string;
  shipping_status: string;
  items: OrderItem[];
}

interface OrdersResponse {
  data: Order[];
}

/**
 * Componente de pestaña de órdenes del usuario
 */
const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState<string | null>(null);

  // Cargar órdenes cuando cambia el filtro
  useEffect(() => {
    fetchOrders();
  }, [orderFilter]);

  // Función para obtener órdenes del usuario
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      let endpoint = API_ENDPOINTS.ORDERS.LIST;
      const params: Record<string, any> = {};
      
      // Aplicar filtros si existen
      if (orderFilter) {
        params.status = orderFilter;
      }
      
      const response = await ApiClient.get<OrdersResponse>(endpoint, params);
      
      // Asegurarse de que la respuesta tiene el formato esperado
      if (response && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setOrders([]); // Establecer un array vacío en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Filtrar órdenes según el filtro seleccionado
  const getFilteredOrders = () => {
    if (!orderFilter) return orders;
    return orders.filter(order => order.status.toLowerCase() === orderFilter.toLowerCase());
  };

  // Obtener estado formateado para la orden
  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      'processing': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En proceso' },
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
      'shipped': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Enviado' },
      'delivered': { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado' }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`${statusInfo.bg} ${statusInfo.text} text-xs px-2 py-1 rounded-full`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-6">Mis Pedidos</h3>
      
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setOrderFilter(null)}
          className={`px-4 py-2 ${!orderFilter ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-100 text-gray-700'} rounded-lg`}
        >
          Todos
        </button>
        <button 
          onClick={() => setOrderFilter('processing')}
          className={`px-4 py-2 ${orderFilter === 'processing' ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-100 text-gray-700'} rounded-lg`}
        >
          En proceso
        </button>
        <button 
          onClick={() => setOrderFilter('shipped')}
          className={`px-4 py-2 ${orderFilter === 'shipped' ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-100 text-gray-700'} rounded-lg`}
        >
          Enviados
        </button>
        <button 
          onClick={() => setOrderFilter('delivered')}
          className={`px-4 py-2 ${orderFilter === 'delivered' ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-100 text-gray-700'} rounded-lg`}
        >
          Entregados
        </button>
        <button 
          onClick={() => setOrderFilter('cancelled')}
          className={`px-4 py-2 ${orderFilter === 'cancelled' ? 'bg-primary-50 text-primary-600 font-medium' : 'hover:bg-gray-100 text-gray-700'} rounded-lg`}
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
              <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center">
                  <div>
                    <span className="text-gray-500">Pedido #{order.order_number}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-500">{formatDate(order.date)}</span>
                  </div>
                  <div>
                    {getOrderStatusBadge(order.status)}
                  </div>
                </div>
                <div className="p-4">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="flex items-center mb-4 last:mb-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="text-gray-500 text-sm">Cantidad: {item.quantity}</div>
                      </div>
                      <div className="ml-auto font-medium">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <div>
                      <span className="text-gray-500 text-sm">Total:</span>
                      <span className="ml-1 font-bold">${order.total.toFixed(2)}</span>
                    </div>
                    <a 
                      href={`/orders/${order.id}`} 
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver detalles
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              {orderFilter ? (
                <>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No tienes pedidos con este estado</h4>
                  <p className="text-gray-500 mb-6">Prueba con otro filtro o revisa tus pedidos más tarde.</p>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">No tienes pedidos aún</h4>
                  <p className="text-gray-500 mb-6">¡Explora nuestros productos y realiza tu primera compra!</p>
                </>
              )}
              <a href="/products" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Explorar productos
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;