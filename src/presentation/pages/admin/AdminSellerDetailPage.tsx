import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  ShoppingBag, 
  DollarSign, 
  Star, 
  Calendar, 
  Mail, 
  Package, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';
import { adminSellerService, type SellerDetail } from '../../../infrastructure/services/AdminSellerService';

const AdminSellerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      if (!id) {
        setError('ID de vendedor no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const sellerData = await adminSellerService.getSellerDetails(id);
        setSeller(sellerData);
      } catch (err) {
        console.error('Error fetching seller details:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar los detalles del vendedor');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [id]);

  const handleStatusUpdate = async (newStatus: 'pending' | 'active' | 'suspended', reason?: string) => {
    if (!seller || !id) return;

    try {
      setUpdating(true);
      await adminSellerService.updateSellerStatus(id, newStatus, reason);
      
      // Refresh seller data
      const updatedSeller = await adminSellerService.getSellerDetails(id);
      setSeller(updatedSeller);
      
      alert(`Estado del vendedor actualizado a: ${newStatus}`);
    } catch (err) {
      console.error('Error updating seller status:', err);
      alert('Error al actualizar el estado del vendedor');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle, text: 'Activo' };
      case 'pending':
        return { color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Clock, text: 'Pendiente' };
      case 'suspended':
        return { color: 'text-red-700', bg: 'bg-red-100', icon: XCircle, text: 'Suspendido' };
      default:
        return { color: 'text-gray-700', bg: 'bg-gray-100', icon: AlertCircle, text: 'Desconocido' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <ArrowLeft className="w-5 h-5" />
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Vendedor</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="ml-3 text-gray-600">Cargando detalles del vendedor...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/sellers')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Detalle del Vendedor</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <div>
              <h3 className="text-red-800 text-lg font-medium">Error al cargar vendedor</h3>
              <p className="text-red-700 mt-1">{error || 'Vendedor no encontrado'}</p>
              <Link 
                to="/admin/sellers"
                className="inline-flex items-center mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Vendedores
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(seller.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/admin/sellers')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Detalle del Vendedor
          </h1>
        </div>
      </div>

      {/* Seller Basic Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">{seller.name}</h2>
              <div className="flex items-center mt-1 text-gray-600">
                <Mail className="w-4 h-4 mr-1" />
                {seller.email}
              </div>
              <div className="flex items-center mt-1 text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                Registrado: {new Date(seller.joined_date).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end">
            <div className={`flex items-center px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.text}
            </div>
            {seller.is_blocked && (
              <span className="text-red-600 text-xs mt-1">Bloqueado</span>
            )}
          </div>
        </div>

        {/* Business Info */}
        {seller.seller_info && (
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información del Negocio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {seller.seller_info.business_name && (
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Nombre: </span>
                  <span className="ml-1 font-medium">{seller.seller_info.business_name}</span>
                </div>
              )}
              {seller.seller_info.description && (
                <div className="flex items-start md:col-span-2">
                  <User className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <span className="text-gray-600">Descripción: </span>
                    <p className="mt-1 text-gray-800">{seller.seller_info.description}</p>
                  </div>
                </div>
              )}
              {seller.seller_info.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Teléfono: </span>
                  <span className="ml-1 font-medium">{seller.seller_info.phone}</span>
                </div>
              )}
              {seller.seller_info.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Sitio web: </span>
                  <a href={seller.seller_info.website} target="_blank" rel="noopener noreferrer" 
                     className="ml-1 font-medium text-blue-600 hover:underline">
                    {seller.seller_info.website}
                  </a>
                </div>
              )}
              {seller.seller_info.address && (
                <div className="flex items-start md:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <span className="text-gray-600">Dirección: </span>
                  <span className="ml-1">{seller.seller_info.address}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{seller.total_orders}</div>
              <div className="text-sm text-gray-600">Pedidos Totales</div>
              <div className="text-xs text-gray-500 mt-1">
                Completados: {seller.completed_orders} | Pendientes: {seller.pending_orders}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                ${seller.total_revenue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Ingresos Totales</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {seller.average_rating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Rating Promedio</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{seller.products_count}</div>
              <div className="text-sm text-gray-600">Productos</div>
              <div className="text-xs text-gray-500 mt-1">
                Clientes únicos: {seller.customer_count}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pedidos Recientes</h3>
          {seller.recent_orders.length > 0 ? (
            <div className="space-y-3">
              {seller.recent_orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">#{order.id}</div>
                    <div className="text-sm text-gray-600">{order.customer_name}</div>
                    <div className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${order.formatted_total}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay pedidos recientes</p>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Productos Destacados</h3>
          {seller.top_products.length > 0 ? (
            <div className="space-y-3">
              {seller.top_products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-gray-600">${product.price.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{product.sales_count} ventas</div>
                    <div className="text-xs text-gray-500">{product.view_count} vistas</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay productos registrados</p>
          )}
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rendimiento Mensual (Últimos 6 Meses)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {seller.monthly_stats.map((month) => (
            <div key={month.month} className="text-center">
              <div className="text-sm font-medium text-gray-900">{month.month_name.split(' ')[0]}</div>
              <div className="text-lg font-bold text-blue-600">{month.orders}</div>
              <div className="text-xs text-gray-600">pedidos</div>
              <div className="text-sm font-medium text-green-600">${month.revenue.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones de Administrador</h3>
        <div className="flex flex-wrap gap-3">
          {seller.status !== 'active' && (
            <button
              onClick={() => handleStatusUpdate('active')}
              disabled={updating}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
            >
              {updating ? 'Actualizando...' : 'Activar Vendedor'}
            </button>
          )}
          {seller.status !== 'suspended' && (
            <button
              onClick={() => {
                const reason = prompt('Razón de la suspensión (opcional):');
                handleStatusUpdate('suspended', reason || undefined);
              }}
              disabled={updating}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
            >
              {updating ? 'Actualizando...' : 'Suspender Vendedor'}
            </button>
          )}
          {seller.status !== 'pending' && (
            <button
              onClick={() => handleStatusUpdate('pending')}
              disabled={updating}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg transition-colors"
            >
              {updating ? 'Actualizando...' : 'Marcar como Pendiente'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSellerDetailPage;