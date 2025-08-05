import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Filter, 
  RefreshCw,
  User,
  Store,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Table from '../../components/dashboard/Table';
import ApiClient from '../../../infrastructure/api/apiClient';

interface SellerApplication {
  id: number;
  user_id: number;
  store_name: string;
  business_activity: string;
  products_to_sell: string;
  ruc: string;
  contact_email: string;
  phone: string;
  physical_address: string;
  business_description?: string;
  experience?: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  admin_notes?: string;
  reviewed_at?: string;
  reviewed_by?: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  recent: number;
}

const AdminSolicitudesPage: React.FC = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    recent: 0
  });
  const [selectedApplication, setSelectedApplication] = useState<SellerApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [statusFilter, pagination.currentPage]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.currentPage,
        per_page: pagination.itemsPerPage,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await ApiClient.get('/admin/seller-applications', params);
      
      if (response && 'status' in response && response.status === 'success' && 'data' in response && response.data) {
        const responseData = response.data as any;
        setApplications(responseData.data || []);
        setPagination({
          currentPage: responseData.current_page || 1,
          totalPages: responseData.last_page || 1,
          totalItems: responseData.total || 0,
          itemsPerPage: responseData.per_page || 10,
        });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Error al cargar las solicitudes. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ApiClient.get('/admin/seller-applications/stats');
      if (response && 'status' in response && response.status === 'success' && 'data' in response) {
        setStats(response.data as ApplicationStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = async (application: SellerApplication) => {
    setError(null);
    setSuccess(null);
    
    try {
      const response = await ApiClient.post(`/admin/seller-applications/${application.id}/approve`, {
        admin_notes: adminNotes
      });
      
      if (response && 'status' in response && response.status === 'success') {
        setSuccess('Solicitud aprobada exitosamente. Se ha creado la cuenta de vendedor y el usuario ha sido notificado.');
        await fetchApplications();
        await fetchStats();
        setShowDetailModal(false);
        setAdminNotes('');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al aprobar la solicitud');
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      setError('El motivo del rechazo es obligatorio');
      return;
    }

    setError(null);
    setSuccess(null);
    
    try {
      const response = await ApiClient.post(`/admin/seller-applications/${selectedApplication.id}/reject`, {
        rejection_reason: rejectionReason,
        admin_notes: adminNotes
      });
      
      if (response && 'status' in response && response.status === 'success') {
        setSuccess('Solicitud rechazada exitosamente. El usuario ha sido notificado con el motivo del rechazo.');
        await fetchApplications();
        await fetchStats();
        setShowRejectModal(false);
        setShowDetailModal(false);
        setRejectionReason('');
        setAdminNotes('');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al rechazar la solicitud');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Desconocido';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const applicationColumns = [
    {
      key: 'user',
      header: 'Usuario',
      render: (application: SellerApplication) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-400" />
          <div>
            <div className="font-medium text-sm">{application.user?.name || 'N/A'}</div>
            <div className="text-xs text-gray-500">{application.user?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'store_name',
      header: 'Tienda',
      render: (application: SellerApplication) => (
        <div className="flex items-center">
          <Store className="h-4 w-4 mr-2 text-gray-400" />
          <span className="font-medium">{application.store_name}</span>
        </div>
      )
    },
    {
      key: 'ruc',
      header: 'RUC',
      render: (application: SellerApplication) => (
        <span className="text-sm font-mono">{application.ruc}</span>
      )
    },
    {
      key: 'status',
      header: 'Estado',
      render: (application: SellerApplication) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
          {getStatusIcon(application.status)}
          <span className="ml-1">{getStatusText(application.status)}</span>
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Solicitud',
      render: (application: SellerApplication) => (
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          {new Date(application.created_at).toLocaleDateString('es-ES')}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (application: SellerApplication) => (
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedApplication(application);
              setShowDetailModal(true);
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Solicitudes de Vendedor</h1>
            <p className="text-gray-600">Gestiona las solicitudes para convertirse en vendedor</p>
          </div>
          <button
            onClick={fetchApplications}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Aprobadas</p>
                <p className="text-xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Rechazadas</p>
                <p className="text-xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Esta semana</p>
                <p className="text-xl font-semibold text-gray-900">{stats.recent}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center">
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 mr-2">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          data={applications}
          columns={applicationColumns}
          loading={loading}
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: (page: number) => 
              setPagination(prev => ({ ...prev, currentPage: page }))
          }}
          emptyMessage="No se encontraron solicitudes"
        />
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Detalles de Solicitud</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Información del Usuario</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Nombre:</span> {selectedApplication.user?.name}</div>
                  <div><span className="font-medium">Email:</span> {selectedApplication.user?.email}</div>
                  <div><span className="font-medium">Estado:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusBadgeClass(selectedApplication.status)}`}>
                      {getStatusText(selectedApplication.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Información Comercial</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Tienda:</span> {selectedApplication.store_name}</div>
                  <div><span className="font-medium">RUC:</span> {selectedApplication.ruc}</div>
                  <div><span className="font-medium">Email contacto:</span> {selectedApplication.contact_email}</div>
                  <div><span className="font-medium">Teléfono:</span> {selectedApplication.phone}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Detalles del Negocio</h4>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium">Actividad comercial:</span>
                  <p className="mt-1 text-gray-700">{selectedApplication.business_activity}</p>
                </div>
                <div>
                  <span className="font-medium">Productos a vender:</span>
                  <p className="mt-1 text-gray-700">{selectedApplication.products_to_sell}</p>
                </div>
                <div>
                  <span className="font-medium">Dirección física:</span>
                  <p className="mt-1 text-gray-700">{selectedApplication.physical_address}</p>
                </div>
                {selectedApplication.business_description && (
                  <div>
                    <span className="font-medium">Descripción del negocio:</span>
                    <p className="mt-1 text-gray-700">{selectedApplication.business_description}</p>
                  </div>
                )}
                {selectedApplication.experience && (
                  <div>
                    <span className="font-medium">Experiencia:</span>
                    <p className="mt-1 text-gray-700">{selectedApplication.experience}</p>
                  </div>
                )}
                {selectedApplication.additional_info && (
                  <div>
                    <span className="font-medium">Información adicional:</span>
                    <p className="mt-1 text-gray-700">{selectedApplication.additional_info}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection reason if rejected */}
            {selectedApplication.status === 'rejected' && selectedApplication.rejection_reason && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Motivo del rechazo:</h4>
                <p className="text-red-700 text-sm">{selectedApplication.rejection_reason}</p>
              </div>
            )}

            {/* Admin notes */}
            {selectedApplication.status === 'pending' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del administrador (opcional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Notas internas sobre la solicitud..."
                />
              </div>
            )}

            {/* Actions */}
            {selectedApplication.status === 'pending' && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aprobar
                </button>
              </div>
            )}

            {selectedApplication.status !== 'pending' && (
              <div className="text-center text-gray-500 text-sm">
                Esta solicitud ya ha sido procesada
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-600">Rechazar Solicitud</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Explica por qué se rechaza la solicitud..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rechazar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSolicitudesPage;