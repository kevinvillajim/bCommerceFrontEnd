import React, { useState, useEffect } from "react";
import Table from "../../components/dashboard/Table";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Eye,
  Download,
  ShoppingBag,
  Clock,
  Send,
  X,
  RotateCcw,
  CreditCard,
  Phone,
  MapPin,
  Edit
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCardList from "../../components/dashboard/StatCardList";
import { HttpInvoiceRepository } from "../../../infrastructure/repositories/HttpInvoiceRepository";
import { GetAllInvoicesUseCase, type AdminInvoice, type InvoiceFilters } from "../../../core/useCases/admin/invoice/GetAllInvoicesUseCase";
import { GetInvoiceByIdUseCase, type InvoiceDetail } from "../../../core/useCases/admin/invoice/GetInvoiceByIdUseCase";
import { RetryInvoiceUseCase } from "../../../core/useCases/admin/invoice/RetryInvoiceUseCase";
import { CheckInvoiceStatusUseCase } from "../../../core/useCases/admin/invoice/CheckInvoiceStatusUseCase";
import { GetInvoiceStatsUseCase, type InvoiceStats } from "../../../core/useCases/admin/invoice/GetInvoiceStatsUseCase";
import { UpdateInvoiceUseCase, type UpdateInvoiceRequest } from "../../../core/useCases/admin/invoice/UpdateInvoiceUseCase";

// Estados válidos de facturas SRI
const validStatuses = [
  'DRAFT',
  'SENT_TO_SRI', 
  'PENDING',
  'PROCESSING',
  'RECEIVED',
  'AUTHORIZED',
  'REJECTED',
  'NOT_AUTHORIZED',
  'RETURNED',
  'SRI_ERROR',
  'FAILED',
  'DEFINITIVELY_FAILED'
];

const AdminInvoicesPage: React.FC = () => {
  // Inicializar repositorios y use cases una sola vez
  const [getAllInvoicesUseCase] = useState(() => {
    const repository = new HttpInvoiceRepository();
    return new GetAllInvoicesUseCase(repository);
  });
  const [getInvoiceByIdUseCase] = useState(() => {
    const repository = new HttpInvoiceRepository();
    return new GetInvoiceByIdUseCase(repository);
  });
  const [retryInvoiceUseCase] = useState(() => {
    const repository = new HttpInvoiceRepository();
    return new RetryInvoiceUseCase(repository);
  });
  const [checkInvoiceStatusUseCase] = useState(() => {
    const repository = new HttpInvoiceRepository();
    return new CheckInvoiceStatusUseCase(repository);
  });
  const [getInvoiceStatsUseCase] = useState(() => {
    const repository = new HttpInvoiceRepository();
    return new GetInvoiceStatsUseCase(repository);
  });
  const [updateInvoiceUseCase] = useState(() => {
    const repository = new HttpInvoiceRepository();
    return new UpdateInvoiceUseCase(repository);
  });

  // Estado de la aplicación
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    per_page: 20
  });

  // Paginación
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  // Modal de detalle
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  // Modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<AdminInvoice | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateInvoiceRequest>({});

  // Estado de acciones
  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [invoicesResponse, statsResponse] = await Promise.all([
        getAllInvoicesUseCase.execute(filters),
        getInvoiceStatsUseCase.execute()
      ]);

      // Asegurar que data sea siempre un array
      const invoicesData = Array.isArray(invoicesResponse.data) ? invoicesResponse.data : [];
      
      setInvoices(invoicesData);
      setPagination({
        currentPage: invoicesResponse.meta?.current_page || 1,
        totalPages: invoicesResponse.meta?.last_page || 1,
        totalItems: invoicesResponse.meta?.total || 0,
        itemsPerPage: invoicesResponse.meta?.per_page || 20,
      });

      if (statsResponse) {
        setStats(statsResponse);
      }
    } catch (error) {
      console.error('Error cargando facturas:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos');
      setInvoices([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = (key: keyof InvoiceFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset página si cambia otro filtro
    }));
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    handleFilterChange('page', page);
  };

  // Abrir modal de detalle
  const openInvoiceModal = async (invoice: AdminInvoice) => {
    try {
      setShowInvoiceModal(true);
      const detail = await getInvoiceByIdUseCase.execute(invoice.id);
      setSelectedInvoice(detail);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      alert('Error al cargar los detalles de la factura');
      setShowInvoiceModal(false);
    }
  };

  // Cerrar modal
  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setSelectedInvoice(null);
    setShowPrintOptions(false);
  };

  // Reintentar factura
  const retryInvoice = async (invoiceId: number) => {
    try {
      setActionLoading(prev => ({...prev, [invoiceId]: true}));
      await retryInvoiceUseCase.execute(invoiceId);
      alert('Reintento iniciado correctamente');
      fetchData(); // Recargar datos
    } catch (error) {
      console.error('Error reintentando factura:', error);
      alert(error instanceof Error ? error.message : 'Error al reintentar la factura');
    } finally {
      setActionLoading(prev => ({...prev, [invoiceId]: false}));
    }
  };

  // Consultar estado en SRI
  const checkSriStatus = async (invoiceId: number) => {
    try {
      setActionLoading(prev => ({...prev, [invoiceId]: true}));
      const result = await checkInvoiceStatusUseCase.execute(invoiceId);
      alert(`Estado actual: ${result.current_status}\nEstado SRI: ${JSON.stringify(result.sri_status, null, 2)}`);
    } catch (error) {
      console.error('Error consultando estado:', error);
      alert(error instanceof Error ? error.message : 'Error al consultar el estado');
    } finally {
      setActionLoading(prev => ({...prev, [invoiceId]: false}));
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Descargar factura (placeholder)
  const downloadInvoice = (invoiceId: number, format: "pdf" | "xml") => {
    alert(`Funcionalidad de descarga ${format.toUpperCase()} en desarrollo`);
    if (showPrintOptions) {
      setShowPrintOptions(false);
    }
  };

  // Enviar por email (placeholder)
  const sendInvoiceByEmail = (invoiceId: number) => {
    alert('Funcionalidad de envío por email en desarrollo');
    if (showPrintOptions) {
      setShowPrintOptions(false);
    }
  };

  // Abrir modal de edición
  const openEditModal = (invoice: AdminInvoice) => {
    setEditingInvoice(invoice);
    setEditFormData({
      customer_name: invoice.customer?.name || '',
      customer_identification: invoice.customer?.identification || '',
      customer_email: invoice.customer?.email || '',
      customer_address: invoice.customer?.address || '',
      customer_phone: invoice.customer?.phone || '',
    });
    setShowEditModal(true);
  };

  // Cerrar modal de edición
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingInvoice(null);
    setEditFormData({});
  };

  // Guardar cambios de edición
  const saveEditChanges = async () => {
    if (!editingInvoice) return;

    try {
      setActionLoading(prev => ({...prev, [editingInvoice.id]: true}));
      
      // Filtrar solo campos que han cambiado y no están vacíos
      const changedData: UpdateInvoiceRequest = {};
      if (editFormData.customer_name && editFormData.customer_name !== editingInvoice.customer?.name) {
        changedData.customer_name = editFormData.customer_name;
      }
      if (editFormData.customer_identification && editFormData.customer_identification !== editingInvoice.customer?.identification) {
        changedData.customer_identification = editFormData.customer_identification;
      }
      if (editFormData.customer_email !== editingInvoice.customer?.email) {
        changedData.customer_email = editFormData.customer_email || undefined;
      }
      if (editFormData.customer_address && editFormData.customer_address !== editingInvoice.customer?.address) {
        changedData.customer_address = editFormData.customer_address;
      }
      if (editFormData.customer_phone !== editingInvoice.customer?.phone) {
        changedData.customer_phone = editFormData.customer_phone || undefined;
      }

      // Solo actualizar si hay cambios
      if (Object.keys(changedData).length === 0) {
        alert('No se detectaron cambios para guardar');
        return;
      }

      await updateInvoiceUseCase.execute(editingInvoice.id, changedData);
      
      alert('Factura actualizada correctamente');
      closeEditModal();
      fetchData(); // Recargar datos
      
    } catch (error) {
      console.error('Error actualizando factura:', error);
      alert(error instanceof Error ? error.message : 'Error al actualizar la factura');
    } finally {
      setActionLoading(prev => ({...prev, [editingInvoice.id]: false}));
    }
  };

  // Definir columnas de la tabla
  const columns = [
    {
      key: "invoice",
      header: "Factura",
      sortable: true,
      render: (invoice: AdminInvoice) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {invoice.invoice_number}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(invoice.created_at)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Cliente",
      sortable: true,
      render: (invoice: AdminInvoice) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {invoice.customer?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <CreditCard className="h-3 w-3 mr-1" />
              {invoice.customer?.identification || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "order",
      header: "Pedido",
      sortable: true,
      render: (invoice: AdminInvoice) => (
        <div>
          {invoice.order ? (
            <Link
              to={`/admin/orders/${invoice.order.id}`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              {invoice.order.order_number}
            </Link>
          ) : (
            <span className="text-sm text-gray-500">N/A</span>
          )}
          <div className="text-xs text-gray-500">
            {invoice.items_count} items
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      sortable: true,
      render: (invoice: AdminInvoice) => (
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(invoice.total_amount)}
          <div className="text-xs text-gray-500">
            Subtotal: {formatCurrency(invoice.subtotal)}
          </div>
          <div className="text-xs text-gray-500">
            IVA: {formatCurrency(invoice.tax_amount)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (invoice: AdminInvoice) => (
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
            style={{
              backgroundColor: getStatusBgColor(invoice.status_color),
              color: getStatusTextColor(invoice.status_color)
            }}
          >
            {getStatusIcon(invoice.status)}
            {invoice.status_label}
          </span>
          {invoice.retry_count > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              Reintentos: {invoice.retry_count}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (invoice: AdminInvoice) => {
        const isActionLoading = actionLoading[invoice.id];
        
        return (
          <div className="flex justify-end space-x-2">
            {/* Ver detalles */}
            <button
              onClick={() => openInvoiceModal(invoice)}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
              title="Ver detalles"
            >
              <Eye size={18} />
            </button>

            {/* Editar (solo si no está autorizada) */}
            {invoice.status !== 'AUTHORIZED' && (
              <button
                onClick={() => openEditModal(invoice)}
                disabled={isActionLoading}
                className="p-1 text-green-600 hover:bg-green-100 rounded-md disabled:opacity-50"
                title="Editar datos de cliente"
              >
                <Edit size={18} />
              </button>
            )}

            {/* Reintentar (solo si está fallida y puede reintentarse) */}
            {invoice.status === 'FAILED' && invoice.retry_count < 12 && (
              <button
                onClick={() => retryInvoice(invoice.id)}
                disabled={isActionLoading}
                className="p-1 text-orange-600 hover:bg-orange-100 rounded-md disabled:opacity-50"
                title="Reintentar envío"
              >
                {isActionLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <RotateCcw size={18} />
                )}
              </button>
            )}

            {/* Consultar estado SRI */}
            {invoice.sri_access_key && (
              <button
                onClick={() => checkSriStatus(invoice.id)}
                disabled={isActionLoading}
                className="p-1 text-purple-600 hover:bg-purple-100 rounded-md disabled:opacity-50"
                title="Consultar estado SRI"
              >
                {isActionLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <RefreshCw size={18} />
                )}
              </button>
            )}

            {/* Descargar */}
            <button
              onClick={() => downloadInvoice(invoice.id, "pdf")}
              className="p-1 text-green-600 hover:bg-green-100 rounded-md"
              title="Descargar PDF"
            >
              <Download size={18} />
            </button>
          </div>
        );
      },
    },
  ];

  // Funciones auxiliares para colores de estado
  const getStatusBgColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': '#f3f4f6',
      'blue': '#dbeafe',
      'yellow': '#fef3c7',
      'indigo': '#e0e7ff', 
      'green': '#d1fae5',
      'red': '#fee2e2',
      'orange': '#fed7aa',
    };
    return colorMap[color] || colorMap['gray'];
  };

  const getStatusTextColor = (color: string) => {
    const colorMap: Record<string, string> = {
      'gray': '#374151',
      'blue': '#1e40af',
      'yellow': '#92400e',
      'indigo': '#3730a3',
      'green': '#059669',
      'red': '#dc2626', 
      'orange': '#ea580c',
    };
    return colorMap[color] || colorMap['gray'];
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'DRAFT': <Clock className="w-3 h-3 mr-1" />,
      'SENT_TO_SRI': <Send className="w-3 h-3 mr-1" />,
      'PENDING': <Clock className="w-3 h-3 mr-1" />,
      'PROCESSING': <RefreshCw className="w-3 h-3 mr-1 animate-spin" />,
      'RECEIVED': <CheckCircle className="w-3 h-3 mr-1" />,
      'AUTHORIZED': <CheckCircle className="w-3 h-3 mr-1" />,
      'REJECTED': <XCircle className="w-3 h-3 mr-1" />,
      'NOT_AUTHORIZED': <XCircle className="w-3 h-3 mr-1" />,
      'RETURNED': <RotateCcw className="w-3 h-3 mr-1" />,
      'SRI_ERROR': <AlertTriangle className="w-3 h-3 mr-1" />,
      'FAILED': <XCircle className="w-3 h-3 mr-1" />,
      'DEFINITIVELY_FAILED': <XCircle className="w-3 h-3 mr-1" />,
    };
    return iconMap[status] || <AlertTriangle className="w-3 h-3 mr-1" />;
  };

  // Preparar datos de estadísticas
  const statItems = stats ? [
    { 
      title: "Total", 
      value: stats.sri_stats.total_invoices, 
      description: "Facturas", 
      icon: FileText, 
      bgColor: "bg-blue-50/20", 
      textColor: "text-blue-800", 
      valueColor: "text-blue-900", 
      descriptionColor: "text-blue-700", 
      iconColor: "text-blue-600", 
    },
    { 
      title: "Autorizadas", 
      value: stats.sri_stats.authorized, 
      description: `${stats.sri_stats.success_rate}% éxito`, 
      icon: CheckCircle, 
      bgColor: "bg-green-50/20", 
      textColor: "text-green-800", 
      valueColor: "text-green-900", 
      descriptionColor: "text-green-700", 
      iconColor: "text-green-600", 
    },
    { 
      title: "Pendientes", 
      value: stats.sri_stats.pending, 
      description: "En proceso", 
      icon: Clock, 
      bgColor: "bg-yellow-50", 
      textColor: "text-yellow-800", 
      valueColor: "text-yellow-900", 
      descriptionColor: "text-yellow-700", 
      iconColor: "text-yellow-600", 
    },
    { 
      title: "Fallidas", 
      value: stats.sri_stats.failed + stats.sri_stats.definitively_failed, 
      description: `${stats.additional_stats.pending_retries} pueden reintentarse`, 
      icon: AlertTriangle, 
      bgColor: "bg-red-50/20", 
      textColor: "text-red-800", 
      valueColor: "text-red-900", 
      descriptionColor: "text-red-700", 
      iconColor: "text-red-600", 
    }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Facturas SRI
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={`inline mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Panel de estadísticas */}
      <StatCardList items={statItems} />
      
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Filtro de Estado */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              {validStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Fecha */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
              placeholder="Desde"
            />
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
              placeholder="Hasta"
            />
          </div>

          {/* Filtro de Cliente */}
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.customer_name || ''}
              onChange={(e) => handleFilterChange('customer_name', e.target.value || undefined)}
              placeholder="Nombre cliente"
            />
          </div>

          {/* Filtro de Identificación */}
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={filters.customer_identification || ''}
              onChange={(e) => handleFilterChange('customer_identification', e.target.value || undefined)}
              placeholder="Cédula/RUC"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Facturas */}
      <Table
        data={invoices}
        columns={columns}
        searchFields={["invoice_number", "customer.name", "customer.identification"]}
        loading={loading}
        emptyMessage="No se encontraron facturas"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: handlePageChange,
        }}
      />

      {/* Modal de Edición de Factura */}
      {showEditModal && editingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Editar Factura {editingInvoice.invoice_number}
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500"
                disabled={actionLoading[editingInvoice.id]}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Nombre del cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del cliente
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={editFormData.customer_name || ''}
                    onChange={(e) => setEditFormData(prev => ({...prev, customer_name: e.target.value}))}
                    placeholder="Nombre completo del cliente"
                  />
                </div>

                {/* Identificación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula/RUC
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={editFormData.customer_identification || ''}
                    onChange={(e) => setEditFormData(prev => ({...prev, customer_identification: e.target.value}))}
                    placeholder="Cédula (10 dígitos) o RUC (13 dígitos)"
                    maxLength={13}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cédula: 10 dígitos | RUC: 13 dígitos terminado en 001
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (opcional)
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={editFormData.customer_email || ''}
                    onChange={(e) => setEditFormData(prev => ({...prev, customer_email: e.target.value}))}
                    placeholder="email@ejemplo.com"
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={editFormData.customer_address || ''}
                    onChange={(e) => setEditFormData(prev => ({...prev, customer_address: e.target.value}))}
                    placeholder="Dirección completa del cliente"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={editFormData.customer_phone || ''}
                    onChange={(e) => setEditFormData(prev => ({...prev, customer_phone: e.target.value}))}
                    placeholder="0999999999"
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeEditModal}
                  disabled={actionLoading[editingInvoice.id]}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditChanges}
                  disabled={actionLoading[editingInvoice.id]}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {actionLoading[editingInvoice.id] ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Factura */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Detalle de Factura {selectedInvoice.invoice_number}
              </h3>
              <button
                onClick={closeInvoiceModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {/* Información de cabecera */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Información general */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Información General
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número:</span>
                      <span className="font-medium text-gray-900">
                        {selectedInvoice.invoice_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha emisión:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedInvoice.issue_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                        style={{
                          backgroundColor: getStatusBgColor(selectedInvoice.status_color),
                          color: getStatusTextColor(selectedInvoice.status_color)
                        }}
                      >
                        {getStatusIcon(selectedInvoice.status)}
                        {selectedInvoice.status_label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del cliente */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    Cliente
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium text-gray-900">
                        {selectedInvoice.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {selectedInvoice.customer.identification}
                        <span className="text-xs text-gray-500 ml-1">
                          ({selectedInvoice.customer.identification_type_label})
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {selectedInvoice.customer.phone || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-700 text-xs">
                        {selectedInvoice.customer.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información SRI */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    SRI
                  </h4>
                  <div className="space-y-1 text-sm">
                    {selectedInvoice.sri.access_key && (
                      <div>
                        <span className="text-gray-600">Clave de acceso:</span>
                        <p className="text-xs text-gray-900 font-mono break-all mt-1">
                          {selectedInvoice.sri.access_key}
                        </p>
                      </div>
                    )}
                    {selectedInvoice.sri.authorization_number && (
                      <div>
                        <span className="text-gray-600">N° autorización:</span>
                        <p className="text-xs text-gray-900 font-mono break-all mt-1">
                          {selectedInvoice.sri.authorization_number}
                        </p>
                      </div>
                    )}
                    {selectedInvoice.retry_info.count > 0 && (
                      <div className="text-orange-600">
                        <span className="text-xs">
                          Reintentos: {selectedInvoice.retry_info.count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de error SRI (si existe) */}
              {selectedInvoice.sri.error_message && (
                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Error del SRI
                  </h4>
                  <p className="text-sm text-red-700">
                    {selectedInvoice.sri.error_message}
                  </p>
                </div>
              )}

              {/* Tabla de artículos */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Artículos ({selectedInvoice.items.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Precio Unit.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IVA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.product_name}
                            <div className="text-xs text-gray-500">
                              Código: {item.product_code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.tax_amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-right text-sm font-medium text-gray-500"
                        >
                          Subtotal:
                        </td>
                        <td
                          colSpan={2}
                          className="px-6 py-4 text-sm text-gray-900"
                        >
                          {formatCurrency(selectedInvoice.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-right text-sm font-medium text-gray-500"
                        >
                          IVA (15%):
                        </td>
                        <td
                          colSpan={2}
                          className="px-6 py-4 text-sm text-gray-900"
                        >
                          {formatCurrency(selectedInvoice.tax_amount)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={3}
                          className="px-6 py-4 text-right text-sm font-medium text-gray-900"
                        >
                          Total:
                        </td>
                        <td
                          colSpan={2}
                          className="px-6 py-4 text-sm font-bold text-gray-900"
                        >
                          {formatCurrency(selectedInvoice.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap justify-end gap-2 mt-6">
                {/* Opción para descargar */}
                <div className="relative">
                  <button
                    onClick={() => setShowPrintOptions(!showPrintOptions)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </button>

                  {showPrintOptions && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => downloadInvoice(selectedInvoice.id, "pdf")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          Descargar PDF
                        </button>
                        <button
                          onClick={() => downloadInvoice(selectedInvoice.id, "xml")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          Descargar XML
                        </button>
                        <button
                          onClick={() => sendInvoiceByEmail(selectedInvoice.id)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Send className="h-4 w-4 mr-2 text-gray-500" />
                          Enviar por email
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ver orden relacionada */}
                {selectedInvoice.order && (
                  <Link
                    to={`/admin/orders/${selectedInvoice.order.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Ver Orden
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoicesPage;