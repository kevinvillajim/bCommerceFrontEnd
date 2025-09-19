import React, { useEffect, useState } from 'react';
import { CreditCard, Search, Eye, X, DollarSign, User, Calendar, CheckCircle, XCircle, Timer, Clock, TrendingUp, Users } from 'lucide-react';
import { ApiClient } from '../../../infrastructure/api/apiClient';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { useToast } from '../../components/UniversalToast';
import { NotificationType } from '../../types/NotificationTypes';

interface PaymentLink {
  id: number;
  link_code: string;
  public_url: string;
  customer_name: string;
  amount: number;
  description: string | null;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  payment_method: string | null;
  transaction_id: string | null;
  payment_id: string | null;
  expires_at: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
  is_available: boolean;
  creator: {
    id: number;
    name: string;
    email: string;
  };
}

interface DashboardStats {
  stats: {
    total_links: number;
    pending_links: number;
    paid_links: number;
    expired_links: number;
    cancelled_links: number;
    total_amount_collected: number;
    active_links: number;
    total_payment_users: number;
  };
  top_users: Array<{
    id: number;
    name: string;
    email: string;
    total_links: number;
    total_collected: number;
  }>;
}

interface PaginatedResponse {
  data: PaymentLink[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Página de administración para ver TODOS los pagos externos
 */
const ExternalPayments: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadLinks();
  }, [currentPage, filters]);

  const loadDashboard = async () => {
    try {
      const response = await ApiClient.get<{ success: boolean; data: DashboardStats }>(
        API_ENDPOINTS.EXTERNAL_PAYMENT.ADMIN.DASHBOARD
      );

      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      console.error('Error loading admin dashboard:', err);
    }
  };

  const loadLinks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '15'
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await ApiClient.get<{ success: boolean; data: PaginatedResponse }>(
        `${API_ENDPOINTS.EXTERNAL_PAYMENT.ADMIN.LIST}?${params.toString()}`
      );

      if (response.success) {
        setLinks(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
        setError(null);
      } else {
        setError('Error cargando links');
      }
    } catch (err: any) {
      console.error('Error loading links:', err);
      setError(err.response?.data?.message || 'Error cargando links');
    } finally {
      setLoading(false);
    }
  };

  const cancelLink = async (linkId: number, linkCode: string) => {
    if (!confirm(`¿Estás seguro de cancelar el link ${linkCode}?`)) {
      return;
    }

    try {
      const response = await ApiClient.patch<{ success: boolean; message: string }>(
        `${API_ENDPOINTS.EXTERNAL_PAYMENT.ADMIN.CANCEL}/${linkId}`
      );

      if (response.success) {
        showToast(NotificationType.SUCCESS, 'Link cancelado exitosamente');
        loadLinks();
        loadDashboard();
      } else {
        showToast(NotificationType.ERROR, response.message || 'Error cancelando el link');
      }
    } catch (err: any) {
      console.error('Error cancelling link:', err);
      showToast(
        NotificationType.ERROR,
        err.response?.data?.message || 'Error cancelando el link'
      );
    }
  };

  const getStatusBadge = (link: PaymentLink) => {
    if (link.status === 'paid') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pagado
        </span>
      );
    }

    if (link.status === 'cancelled') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelado
        </span>
      );
    }

    if (link.is_expired) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <Timer className="h-3 w-3 mr-1" />
          Expirado
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Clock className="h-3 w-3 mr-1" />
        Pendiente
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const conversionRate = stats ?
    stats.stats.total_links > 0 ? ((stats.stats.paid_links / stats.stats.total_links) * 100).toFixed(1) : '0.0'
    : '0.0';

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => { loadDashboard(); loadLinks(); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pagos Externos</h1>
            <p className="text-gray-600">Administración global de todos los links de pago</p>
          </div>
        </div>
      </div>

      {/* Estadísticas globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Links</p>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.total_links}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pagados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.paid_links}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Recaudado</p>
                <p className="text-2xl font-bold text-gray-900">${Number(stats.stats.total_amount_collected).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Conversión</p>
                <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top usuarios */}
      {stats && stats.top_users.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Usuarios Más Activos
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Usuario</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Links Creados</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-500">Total Recaudado</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="py-2 text-sm text-gray-900">{user.total_links}</td>
                    <td className="py-2 text-sm text-gray-900">${Number(user.total_collected).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, código o descripción..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="expired">Expirado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de links */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : links.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron links</h3>
          <p className="text-gray-600">No hay links de pago que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{link.customer_name}</div>
                          {link.description && (
                            <div className="text-sm text-gray-500 truncate max-w-32">{link.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">${parseFloat(link.amount).toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(link)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{link.creator.name}</div>
                        <div className="text-sm text-gray-500">{link.creator.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">{link.link_code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(link.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedLink(link)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {link.status === 'pending' && !link.is_expired && (
                          <button
                            onClick={() => cancelLink(link.id, link.link_code)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                            title="Cancelar link"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Link</h3>
                <button
                  onClick={() => setSelectedLink(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cliente</label>
                    <p className="text-gray-900">{selectedLink.customer_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <p className="text-gray-900">${parseFloat(selectedLink.amount).toFixed(2)} USD</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    {getStatusBadge(selectedLink)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Código</label>
                    <p className="text-gray-900 font-mono">{selectedLink.link_code}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Creado por</label>
                  <div>
                    <p className="text-gray-900 font-medium">{selectedLink.creator.name}</p>
                    <p className="text-sm text-gray-500">{selectedLink.creator.email}</p>
                  </div>
                </div>

                {selectedLink.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-gray-900">{selectedLink.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">URL Pública</label>
                  <p className="text-gray-900 font-mono text-sm break-all">{selectedLink.public_url}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Creado</label>
                    <p className="text-gray-900 text-sm">{formatDate(selectedLink.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expira</label>
                    <p className="text-gray-900 text-sm">{formatDate(selectedLink.expires_at)}</p>
                  </div>
                </div>

                {selectedLink.paid_at && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Pagado el</label>
                      <p className="text-gray-900 text-sm">{formatDate(selectedLink.paid_at)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Método</label>
                      <p className="text-gray-900 text-sm capitalize">{selectedLink.payment_method}</p>
                    </div>
                  </div>
                )}

                {selectedLink.transaction_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID de Transacción</label>
                    <p className="text-gray-900 text-sm font-mono">{selectedLink.transaction_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExternalPayments;