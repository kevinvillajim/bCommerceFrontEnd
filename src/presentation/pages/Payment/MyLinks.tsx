import React, { useEffect, useState } from 'react';
import { List, Copy, Eye, X, Calendar, DollarSign, User, Clock, CheckCircle, XCircle, Timer, Plus } from 'lucide-react';
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
  expires_at: string;
  paid_at: string | null;
  created_at: string;
  is_expired: boolean;
  is_available: boolean;
}

interface PaginatedResponse {
  data: PaymentLink[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/**
 * Página para ver los links de pago del usuario actual
 */
const MyLinks: React.FC = () => {
  const { showToast } = useToast();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLink, setSelectedLink] = useState<PaymentLink | null>(null);

  useEffect(() => {
    loadLinks();
  }, [currentPage]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get<{ success: boolean; data: PaginatedResponse }>(
        `${API_ENDPOINTS.EXTERNAL_PAYMENT.LIST}?page=${currentPage}&per_page=10`
      );

      if (response.success) {
        setLinks(response.data.data);
        setCurrentPage(response.data.current_page);
        setTotalPages(response.data.last_page);
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

  const copyToClipboard = async (text: string, linkCode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(NotificationType.SUCCESS, `URL del link ${linkCode} copiada`);
    } catch (err) {
      showToast(NotificationType.ERROR, 'Error copiando la URL');
    }
  };

  const cancelLink = async (linkId: number, linkCode: string) => {
    if (!confirm(`¿Estás seguro de cancelar el link ${linkCode}?`)) {
      return;
    }

    try {
      const response = await ApiClient.patch<{ success: boolean; message: string }>(
        API_ENDPOINTS.EXTERNAL_PAYMENT.CANCEL(linkId)
      );

      if (response.success) {
        showToast(NotificationType.SUCCESS, 'Link cancelado exitosamente');
        loadLinks(); // Recargar la lista
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadLinks}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <List className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Links de Pago</h1>
              <p className="text-gray-600">Gestiona todos tus links de pago</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/payment/create'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Link
          </button>
        </div>
      </div>

      {/* Lista de links */}
      {links.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <List className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes links de pago</h3>
          <p className="text-gray-600 mb-6">Crea tu primer link para empezar a recibir pagos</p>
          <button
            onClick={() => window.location.href = '/payment/create'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Link
          </button>
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
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
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
                        <span className="text-sm font-medium text-gray-900">${link.amount.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(link)}
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
                        <button
                          onClick={() => copyToClipboard(
                            link.public_url || `${window.location.origin}/pay/${link.link_code}`,
                            link.link_code
                          )}
                          className="text-green-600 hover:text-green-900 inline-flex items-center"
                          title="Copiar URL"
                        >
                          <Copy className="h-4 w-4" />
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
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <p className="text-gray-900">{selectedLink.customer_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monto</label>
                    <p className="text-gray-900">${selectedLink.amount.toFixed(2)} USD</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    {getStatusBadge(selectedLink)}
                  </div>
                </div>

                {selectedLink.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-gray-900">{selectedLink.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <p className="text-gray-900 font-mono">{selectedLink.link_code}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">URL</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={selectedLink.public_url || `${window.location.origin}/pay/${selectedLink.link_code}`}
                      readOnly
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-mono bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(
                        selectedLink.public_url || `${window.location.origin}/pay/${selectedLink.link_code}`,
                        selectedLink.link_code
                      )}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
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

export default MyLinks;