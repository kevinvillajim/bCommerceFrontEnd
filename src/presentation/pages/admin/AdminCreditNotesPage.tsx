import React, { useState, useEffect, useRef } from "react";
import Table from "../../components/dashboard/Table";
import {
  FileText,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Eye,
  Download,
  Clock,
  Send,
  X,
  RotateCcw,
  CreditCard,
  Phone,
  MapPin,
  Edit,
  Minus,
  Plus,
  Trash2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import StatCardList from "../../components/dashboard/StatCardList";
import { HttpCreditNoteRepository } from "../../../infrastructure/repositories/HttpCreditNoteRepository";
import { GetAllCreditNotesUseCase, type AdminCreditNote, type CreditNoteFilters } from "../../../core/useCases/admin/creditNote/GetAllCreditNotesUseCase";
import { GetCreditNoteByIdUseCase, type CreditNoteDetail } from "../../../core/useCases/admin/creditNote/GetCreditNoteByIdUseCase";
import { RetryCreditNoteUseCase } from "../../../core/useCases/admin/creditNote/RetryCreditNoteUseCase";
import { CheckCreditNoteStatusUseCase } from "../../../core/useCases/admin/creditNote/CheckCreditNoteStatusUseCase";
import { GetCreditNoteStatsUseCase, type CreditNoteStats } from "../../../core/useCases/admin/creditNote/GetCreditNoteStatsUseCase";
import { UpdateCreditNoteUseCase, type UpdateCreditNoteRequest } from "../../../core/useCases/admin/creditNote/UpdateCreditNoteUseCase";
import { CreateCreditNoteUseCase, type SriCreditNoteRequest } from "../../../core/useCases/admin/creditNote/CreateCreditNoteUseCase";
import { GetAuthorizedInvoicesUseCase, type AuthorizedInvoice } from "../../../core/useCases/admin/creditNote/GetAuthorizedInvoicesUseCase";
import type { InvoiceDetail } from "../../../infrastructure/repositories/HttpCreditNoteRepository";
import { useToast } from "../../components/UniversalToast";
import { NotificationType } from "../../types/NotificationTypes";

// Estados válidos de notas de crédito SRI
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

// Motivos de nota de crédito según SRI
const creditNoteReasons = [
  { value: '01', label: 'Anulación de la operación' },
  { value: '02', label: 'Anulación por error en el RUC' },
  { value: '03', label: 'Corrección por error en la descripción' },
  { value: '04', label: 'Descuento otorgado' },
  { value: '05', label: 'Devolución de bienes' },
  { value: '06', label: 'Descuento por bonificación' },
  { value: '07', label: 'Descuento por avería' }
];

const AdminCreditNotesPage: React.FC = () => {
  // Hook para mostrar notificaciones usando el sistema correcto
  const { showToast } = useToast();
  const location = useLocation();

  // Inicializar repositorios y use cases una sola vez
  const [getAllCreditNotesUseCase] = useState(() => {
    const repository = new HttpCreditNoteRepository();
    return new GetAllCreditNotesUseCase(repository);
  });
  const [getCreditNoteByIdUseCase] = useState(() => {
    const repository = new HttpCreditNoteRepository();
    return new GetCreditNoteByIdUseCase(repository);
  });
  const [retryCreditNoteUseCase] = useState(() => {
    const repository = new HttpCreditNoteRepository();
    return new RetryCreditNoteUseCase(repository);
  });
  const [checkCreditNoteStatusUseCase] = useState(() => {
    const repository = new HttpCreditNoteRepository();
    return new CheckCreditNoteStatusUseCase(repository);
  });
  const [getCreditNoteStatsUseCase] = useState(() => {
    const repository = new HttpCreditNoteRepository();
    return new GetCreditNoteStatsUseCase(repository);
  });
  const [updateCreditNoteUseCase] = useState(() => {
    const repository = new HttpCreditNoteRepository();
    return new UpdateCreditNoteUseCase(repository);
  });

  const [createCreditNoteUseCase] = useState(() => {
    const repository = new HttpCreditNoteRepository();
    return new CreateCreditNoteUseCase(repository);
  });

  // Hook restaurado para búsqueda de facturas (UX)
  const [getAuthorizedInvoicesUseCase] = useState(() => {
    const repository = new HttpCreditNoteRepository();
    return new GetAuthorizedInvoicesUseCase(repository);
  });

  // Estado de la aplicación
  const [creditNotes, setCreditNotes] = useState<AdminCreditNote[]>([]);
  const [stats, setStats] = useState<CreditNoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filters, setFilters] = useState<CreditNoteFilters>({
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
  const [selectedCreditNote, setSelectedCreditNote] = useState<CreditNoteDetail | null>(null);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  // Modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCreditNote, setEditingCreditNote] = useState<AdminCreditNote | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateCreditNoteRequest>({});

  // Modal de creación (mantener UX pero con estado híbrido)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    invoice_id: 0, // Para UX de selección de factura
    motivo: 'Anulación de la operación',
    detalles: [] as InvoiceDetail[]
  });

  // Selector de facturas autorizadas (restaurado para UX)
  const [authorizedInvoices, setAuthorizedInvoices] = useState<AuthorizedInvoice[]>([]);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<AuthorizedInvoice | null>(null);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [invoiceSearchLoading, setInvoiceSearchLoading] = useState(false);

  // Ref para el dropdown de facturas
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estado de acciones
  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});

  // Cargar datos iniciales
  useEffect(() => {
    fetchData();
  }, [filters]);

  // Verificar si se debe crear nota de crédito desde factura
  useEffect(() => {
    if (location.state?.createFromInvoice && location.state?.invoiceData) {
      const invoiceData = location.state.invoiceData;

      // Crear objeto de factura mock para el selector
      const mockInvoice: AuthorizedInvoice = {
        id: invoiceData.id,
        invoice_number: invoiceData.invoice_number,
        display_label: `${invoiceData.invoice_number} - ${invoiceData.customer?.name || 'Cliente'} ($${Number(invoiceData.total_amount || 0).toFixed(2)})`,
        customer: {
          name: invoiceData.customer?.name || 'Cliente Sin Nombre',
          identification: invoiceData.customer?.identification || '',
          identification_type: invoiceData.customer?.identification_type || '05',
          email: invoiceData.customer?.email,
          address: invoiceData.customer?.address || '',
          phone: invoiceData.customer?.phone,
        },
        amounts: {
          total: Number(invoiceData.total_amount || 0),
          subtotal: Number(invoiceData.subtotal || 0),
          tax: Number(invoiceData.tax_amount || 0),
        },
        issue_date: invoiceData.issue_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };

      // Pre-seleccionar la factura
      setSelectedInvoice(mockInvoice);
      setInvoiceSearch(mockInvoice.display_label);

      setCreateFormData(prev => ({
        ...prev,
        invoice_id: invoiceData.id
      }));
      setShowCreateModal(true);

      // Limpiar el state después de usarlo
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showInvoiceDropdown && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowInvoiceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInvoiceDropdown]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [creditNotesResponse, statsResponse] = await Promise.all([
        getAllCreditNotesUseCase.execute(filters),
        getCreditNoteStatsUseCase.execute()
      ]);

      // Asegurar que data sea siempre un array
      const creditNotesData = Array.isArray(creditNotesResponse.data) ? creditNotesResponse.data : [];

      setCreditNotes(creditNotesData);
      setPagination({
        currentPage: creditNotesResponse.meta?.current_page || 1,
        totalPages: creditNotesResponse.meta?.last_page || 1,
        totalItems: creditNotesResponse.meta?.total || 0,
        itemsPerPage: creditNotesResponse.meta?.per_page || 20,
      });

      if (statsResponse) {
        setStats(statsResponse);
      }
    } catch (error) {
      console.error('Error cargando notas de crédito:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos');
      setCreditNotes([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Buscar facturas autorizadas con debounce
  const searchAuthorizedInvoices = async (searchTerm: string) => {
    try {
      setInvoiceSearchLoading(true);
      const response = await getAuthorizedInvoicesUseCase.execute(searchTerm, 20);
      setAuthorizedInvoices(response.data);
    } catch (error) {
      console.error('Error buscando facturas:', error);
      setAuthorizedInvoices([]);
    } finally {
      setInvoiceSearchLoading(false);
    }
  };

  // Debounce para búsqueda de facturas
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleInvoiceSearch = (value: string) => {
    setInvoiceSearch(value);
    setShowInvoiceDropdown(true);

    // Limpiar timeout anterior
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Si el valor está vacío, limpiar resultados
    if (!value.trim()) {
      setAuthorizedInvoices([]);
      return;
    }

    // Crear nuevo timeout
    const newTimeout = setTimeout(() => {
      searchAuthorizedInvoices(value.trim());
    }, 300); // 300ms de debounce

    setSearchTimeout(newTimeout);
  };

  // Seleccionar una factura
  const selectInvoice = (invoice: AuthorizedInvoice) => {
    setSelectedInvoice(invoice);
    setInvoiceSearch(invoice.display_label);
    setShowInvoiceDropdown(false);

    // Actualizar datos del formulario
    setCreateFormData(prev => ({
      ...prev,
      invoice_id: invoice.id
    }));
  };

  // Limpiar selección de factura
  const clearInvoiceSelection = () => {
    setSelectedInvoice(null);
    setInvoiceSearch('');
    setAuthorizedInvoices([]);
    setShowInvoiceDropdown(false);
    setCreateFormData(prev => ({
      ...prev,
      invoice_id: 0
    }));
  };

  // Manejar cambio de filtros
  const handleFilterChange = (key: keyof CreditNoteFilters, value: any) => {
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
  const openCreditNoteModal = async (creditNote: AdminCreditNote) => {
    try {
      setShowCreditNoteModal(true);
      const detail = await getCreditNoteByIdUseCase.execute(creditNote.id);
      setSelectedCreditNote(detail);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      showToast(NotificationType.ERROR, 'Error al cargar los detalles de la nota de crédito');
      setShowCreditNoteModal(false);
    }
  };

  // Cerrar modal
  const closeCreditNoteModal = () => {
    setShowCreditNoteModal(false);
    setSelectedCreditNote(null);
    setShowPrintOptions(false);
  };

  // Reintentar nota de crédito
  const retryCreditNote = async (creditNoteId: number) => {
    try {
      setActionLoading(prev => ({...prev, [creditNoteId]: true}));
      await retryCreditNoteUseCase.execute(creditNoteId);
      showToast(NotificationType.SUCCESS, 'Reintento de nota de crédito iniciado correctamente');
      fetchData(); // Recargar datos
    } catch (error) {
      const errorMessage = (error as any)?.response?.data?.error || 'Error al reintentar la nota de crédito';
      showToast(NotificationType.ERROR, errorMessage);
    } finally {
      setActionLoading(prev => ({...prev, [creditNoteId]: false}));
    }
  };

  // Consultar estado en SRI
  const checkSriStatus = async (creditNoteId: number) => {
    try {
      setActionLoading(prev => ({...prev, [creditNoteId]: true}));
      const result = await checkCreditNoteStatusUseCase.execute(creditNoteId);

      // Verificar si la respuesta tiene los datos requeridos
      if (result && result.credit_note_id) {
        const { current_status, sri_status, sri_access_key, sri_authorization_number } = result;
        const statusMessage = `Consulta exitosa\n\n` +
          `Nota de Crédito: ${creditNoteId}\n` +
          `Estado Actual: ${current_status}\n` +
          `Clave Acceso: ${sri_access_key}\n` +
          `N° Autorización: ${sri_authorization_number || 'N/A'}\n\n` +
          `Detalles SRI:\n${JSON.stringify(sri_status, null, 2)}`;

        showToast(NotificationType.SUCCESS, statusMessage);
      } else {
        showToast(NotificationType.WARNING, 'Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error consultando estado:', error);
      showToast(NotificationType.ERROR, error instanceof Error ? error.message : 'Error al consultar el estado');
    } finally {
      setActionLoading(prev => ({...prev, [creditNoteId]: false}));
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

  // Descargar nota de crédito
  const downloadCreditNote = async (creditNoteId: number, format: "pdf" | "xml") => {
    if (format === "xml") {
      showToast(NotificationType.INFO, 'Funcionalidad de descarga XML en desarrollo');
      if (showPrintOptions) {
        setShowPrintOptions(false);
      }
      return;
    }

    try {
      setActionLoading(prev => ({...prev, [creditNoteId]: true}));

      // Descargar PDF usando el repositorio
      const repository = new HttpCreditNoteRepository();
      const pdfBlob = await repository.downloadCreditNotePdf(creditNoteId);

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nota_credito_${creditNoteId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast(NotificationType.SUCCESS, 'PDF descargado correctamente');

    } catch (error) {
      console.error('Error descargando PDF:', error);
      showToast(NotificationType.ERROR, error instanceof Error ? error.message : 'Error al descargar el PDF');
    } finally {
      setActionLoading(prev => ({...prev, [creditNoteId]: false}));
      if (showPrintOptions) {
        setShowPrintOptions(false);
      }
    }
  };

  // Enviar por email (placeholder)
  const sendCreditNoteByEmail = (_creditNoteId: number) => {
    showToast(NotificationType.INFO, 'Funcionalidad de envío por email en desarrollo');
    if (showPrintOptions) {
      setShowPrintOptions(false);
    }
  };

  // Abrir modal de edición
  const openEditModal = (creditNote: AdminCreditNote) => {
    setEditingCreditNote(creditNote);
    setEditFormData({
      customer_name: creditNote.customer?.name || '',
      customer_identification: creditNote.customer?.identification || '',
      customer_email: creditNote.customer?.email || '',
      customer_address: creditNote.customer?.address || '',
      customer_phone: creditNote.customer?.phone || '',
    });
    setShowEditModal(true);
  };

  // Cerrar modal de edición
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingCreditNote(null);
    setEditFormData({});
  };

  // Guardar cambios de edición
  const saveEditChanges = async () => {
    if (!editingCreditNote) return;

    try {
      setActionLoading(prev => ({...prev, [editingCreditNote.id]: true}));

      // Filtrar solo campos que han cambiado y no están vacíos
      const changedData: UpdateCreditNoteRequest = {};
      if (editFormData.customer_name && editFormData.customer_name !== editingCreditNote.customer?.name) {
        changedData.customer_name = editFormData.customer_name;
      }
      if (editFormData.customer_identification && editFormData.customer_identification !== editingCreditNote.customer?.identification) {
        changedData.customer_identification = editFormData.customer_identification;
      }
      if (editFormData.customer_email !== editingCreditNote.customer?.email) {
        changedData.customer_email = editFormData.customer_email || undefined;
      }
      if (editFormData.customer_address && editFormData.customer_address !== editingCreditNote.customer?.address) {
        changedData.customer_address = editFormData.customer_address;
      }
      if (editFormData.customer_phone !== editingCreditNote.customer?.phone) {
        changedData.customer_phone = editFormData.customer_phone || undefined;
      }

      // Solo actualizar si hay cambios
      if (Object.keys(changedData).length === 0) {
        showToast(NotificationType.WARNING, 'No se detectaron cambios para guardar');
        return;
      }

      await updateCreditNoteUseCase.execute(editingCreditNote.id, changedData);

      showToast(NotificationType.SUCCESS, 'Nota de crédito actualizada correctamente');
      closeEditModal();
      fetchData(); // Recargar datos

    } catch (error) {
      console.error('Error actualizando nota de crédito:', error);
      showToast(NotificationType.ERROR, error instanceof Error ? error.message : 'Error al actualizar la nota de crédito');
    } finally {
      setActionLoading(prev => ({...prev, [editingCreditNote.id]: false}));
    }
  };

  // Cerrar modal de creación
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      invoice_id: 0,
      motivo: 'Anulación de la operación', // Descripción completa por defecto
      detalles: []
    });
    // Limpiar selector de facturas
    clearInvoiceSelection();
  };

  // Funciones para gestión de detalles
  const addDetailItem = () => {
    const newDetail = {
      product_code: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      discount: 0,
      codigo_iva: '4' // IVA 15% por defecto (vigente Ecuador 2024)
    };

    setCreateFormData(prev => ({
      ...prev,
      detalles: [...prev.detalles, newDetail]
    }));
  };

  const removeDetailItem = (index: number) => {
    setCreateFormData(prev => ({
      ...prev,
      detalles: prev.detalles.filter((_, i) => i !== index)
    }));
  };

  const updateDetailItem = (index: number, field: string, value: any) => {
    setCreateFormData(prev => ({
      ...prev,
      detalles: prev.detalles.map((detail, i) =>
        i === index ? { ...detail, [field]: value } : detail
      )
    }));
  };

  const calculateTotalAmount = () => {
    return createFormData.detalles.reduce((total, detail) => {
      const subtotal = (detail.quantity || 0) * (detail.unit_price || 0) - (detail.discount || 0);
      return total + subtotal;
    }, 0);
  };

  // Cargar detalles de la factura seleccionada
  const loadInvoiceDetails = async () => {
    if (!selectedInvoice) {
      showToast(NotificationType.WARNING, 'Debe seleccionar una factura primero');
      return;
    }

    try {
      setActionLoading(prev => ({...prev, 1: true}));

      const repository = new HttpCreditNoteRepository();
      const details = await repository.getInvoiceDetails(selectedInvoice.id);

      setCreateFormData(prev => ({
        ...prev,
        detalles: details
      }));

      showToast(NotificationType.SUCCESS, `Se cargaron ${details.length} detalles de la factura`);
    } catch (error) {
      console.error('Error cargando detalles de factura:', error);
      showToast(NotificationType.ERROR, 'Error al cargar los detalles de la factura');
    } finally {
      setActionLoading(prev => ({...prev, 1: false}));
    }
  };

  // Crear nota de crédito
  const createCreditNote = async () => {
    try {
      setActionLoading(prev => ({...prev, 0: true}));

      if (!createFormData.invoice_id) {
        showToast(NotificationType.WARNING, 'Debe seleccionar una factura para crear la nota de crédito');
        return;
      }

      if (!selectedInvoice) {
        showToast(NotificationType.WARNING, 'Debe seleccionar una factura válida');
        return;
      }

      if (createFormData.detalles.length === 0) {
        showToast(NotificationType.WARNING, 'Debe agregar al menos un detalle a la nota de crédito');
        return;
      }

      // Validar que todos los detalles tengan los campos requeridos
      const invalidDetails = createFormData.detalles.some(detail =>
        !detail.product_code?.trim() ||
        !detail.product_name?.trim() ||
        detail.quantity <= 0 ||
        detail.unit_price <= 0
      );

      if (invalidDetails) {
        showToast(NotificationType.WARNING, 'Todos los detalles deben tener código, nombre, cantidad y precio unitario válidos');
        return;
      }

      // DEBUG: Verificar contenido de selectedInvoice
      console.log('DEBUG selectedInvoice:', JSON.stringify(selectedInvoice, null, 2));
      console.log('DEBUG createFormData:', JSON.stringify(createFormData, null, 2));

      // Transformar datos BCommerce → formato SRI usando datos reales
      const sriData: SriCreditNoteRequest = {
        secuencial: '', // El backend generará el secuencial real
        fechaEmision: new Date().toISOString().split('T')[0],
        motivo: createFormData.motivo,
        documentoModificado: {
          tipo: '01', // Tipo factura
          numero: selectedInvoice.invoice_number, // Número REAL de la factura
          fechaEmision: selectedInvoice.issue_date // Fecha REAL de la factura
        },
        comprador: {
          tipoIdentificacion: selectedInvoice.customer.identification_type,
          identificacion: selectedInvoice.customer.identification,
          razonSocial: selectedInvoice.customer.name,
          direccion: selectedInvoice.customer.address,
          email: selectedInvoice.customer.email,
          telefono: selectedInvoice.customer.phone
        },
        detalles: createFormData.detalles.map(detalle => ({
          codigoInterno: detalle.product_code,
          descripcion: detalle.product_name,
          cantidad: detalle.quantity,
          precioUnitario: detalle.unit_price,
          descuento: detalle.discount || 0,
          codigoIva: detalle.codigo_iva as '0' | '2' | '3' | '4' | '5' | '6' | '7'
        })),
        informacionAdicional: {
          MotivoDetallado: createFormData.motivo,
          Observaciones: 'Nota de crédito generada desde sistema administrativo'
        }
      };

      // DEBUG: Verificar datos SRI que se van a enviar
      console.log('DEBUG sriData final:', JSON.stringify(sriData, null, 2));

      // Enviar en formato SRI
      await createCreditNoteUseCase.execute(sriData);

      showToast(NotificationType.SUCCESS, 'Nota de crédito creada correctamente');
      closeCreateModal();
      fetchData(); // Recargar datos

    } catch (error) {
      console.error('Error creando nota de crédito:', error);
      showToast(NotificationType.ERROR, error instanceof Error ? error.message : 'Error al crear la nota de crédito');
    } finally {
      setActionLoading(prev => ({...prev, 0: false}));
    }
  };

  // Definir columnas de la tabla
  const columns = [
    {
      key: "credit_note",
      header: "Nota de Crédito",
      sortable: true,
      render: (creditNote: AdminCreditNote) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Minus className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {creditNote.credit_note_number}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(creditNote.created_at)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Cliente",
      sortable: true,
      render: (creditNote: AdminCreditNote) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            <User className="h-4 w-4 text-gray-500" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {creditNote.customer?.name || 'N/A'}
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <CreditCard className="h-3 w-3 mr-1" />
              {creditNote.customer?.identification || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "invoice",
      header: "Factura Original",
      sortable: true,
      render: (creditNote: AdminCreditNote) => (
        <div>
          {creditNote.documento_modificado ? (
            <span className="text-sm font-medium text-gray-900">
              {creditNote.documento_modificado}
            </span>
          ) : (
            <span className="text-sm text-gray-500">N/A</span>
          )}
          <div className="text-xs text-gray-500">
            {creditNote.items_count} items
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Monto",
      sortable: true,
      render: (creditNote: AdminCreditNote) => (
        <div className="text-sm font-medium text-gray-900">
          {formatCurrency(creditNote.total_amount)}
          <div className="text-xs text-gray-500">
            Subtotal: {formatCurrency(creditNote.subtotal)}
          </div>
          <div className="text-xs text-gray-500">
            IVA: {formatCurrency(creditNote.tax_amount)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (creditNote: AdminCreditNote) => (
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
            style={{
              backgroundColor: getStatusBgColor(creditNote.status_color),
              color: getStatusTextColor(creditNote.status_color)
            }}
          >
            {getStatusIcon(creditNote.status)}
            {creditNote.status_label}
          </span>
          {creditNote.retry_count > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              Reintentos: {creditNote.retry_count}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      render: (creditNote: AdminCreditNote) => {
        const isActionLoading = actionLoading[creditNote.id];

        return (
          <div className="flex justify-end space-x-2">
            {/* Ver detalles */}
            <button
              onClick={() => openCreditNoteModal(creditNote)}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
              title="Ver detalles"
            >
              <Eye size={18} />
            </button>

            {/* Editar (solo si no está autorizada) */}
            {creditNote.status !== 'AUTHORIZED' && (
              <button
                onClick={() => openEditModal(creditNote)}
                disabled={isActionLoading}
                className="p-1 text-green-600 hover:bg-green-100 rounded-md disabled:opacity-50"
                title="Editar datos de cliente"
              >
                <Edit size={18} />
              </button>
            )}

            {/* Reintentar (solo si está fallida y puede reintentarse) */}
            {creditNote.status === 'FAILED' && creditNote.retry_count < 12 && (
              <button
                onClick={() => retryCreditNote(creditNote.id)}
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
            {creditNote.sri_access_key && (
              <button
                onClick={() => checkSriStatus(creditNote.id)}
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
              onClick={() => downloadCreditNote(creditNote.id, "pdf")}
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
      value: stats.sri_stats.total_credit_notes,
      description: "Notas de Crédito",
      icon: Minus,
      bgColor: "bg-indigo-50/20",
      textColor: "text-indigo-800",
      valueColor: "text-indigo-900",
      descriptionColor: "text-indigo-700",
      iconColor: "text-indigo-600",
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
          Gestión de Notas de Crédito SRI
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Minus size={18} className="inline mr-2" />
            Nueva Nota de Crédito
          </button>
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

      {/* Tabla de Notas de Crédito */}
      <Table
        data={creditNotes}
        columns={columns}
        searchFields={["credit_note_number"]}
        loading={loading}
        emptyMessage="No se encontraron notas de crédito"
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalItems: pagination.totalItems,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: handlePageChange,
        }}
      />

      {/* Modal de Creación de Nota de Crédito */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Nueva Nota de Crédito
              </h3>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-gray-500"
                disabled={actionLoading[0]}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Selector de Factura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar Factura
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={invoiceSearch}
                      onChange={(e) => handleInvoiceSearch(e.target.value)}
                      onFocus={() => setShowInvoiceDropdown(true)}
                      placeholder="Buscar por número de factura, cliente o cédula..."
                    />

                    {/* Botón limpiar selección */}
                    {selectedInvoice && (
                      <button
                        type="button"
                        onClick={clearInvoiceSelection}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    {/* Dropdown de resultados */}
                    {showInvoiceDropdown && (
                      <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {invoiceSearchLoading ? (
                          <div className="p-3 text-center text-gray-500 flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Buscando facturas...
                          </div>
                        ) : authorizedInvoices.length > 0 ? (
                          authorizedInvoices.map((invoice) => (
                            <button
                              key={invoice.id}
                              type="button"
                              onClick={() => selectInvoice(invoice)}
                              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {invoice.invoice_number}
                              </div>
                              <div className="text-sm text-gray-600">
                                {invoice.customer.name} - {invoice.customer.identification}
                              </div>
                              <div className="text-sm text-green-600 font-medium">
                                ${Number(invoice.amounts.total || 0).toFixed(2)}
                              </div>
                            </button>
                          ))
                        ) : invoiceSearch.length > 2 ? (
                          <div className="p-3 text-center text-gray-500">
                            No se encontraron facturas
                          </div>
                        ) : (
                          <div className="p-3 text-center text-gray-500">
                            Escribe al menos 3 caracteres para buscar
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Información de la factura seleccionada */}
                  {selectedInvoice && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Factura seleccionada: {selectedInvoice.invoice_number}
                      </div>
                      <div className="text-sm text-green-700">
                        Cliente: {selectedInvoice.customer.name} ({selectedInvoice.customer.identification})
                      </div>
                      <div className="text-sm text-green-700">
                        Total: ${Number(selectedInvoice.amounts.total || 0).toFixed(2)}
                      </div>
                    </div>
                  )}

                  {/* Información cuando viene desde navegación */}
                  {location.state?.invoiceData && !selectedInvoice && (
                    <p className="text-xs text-blue-600 mt-1">
                      Factura desde navegación: {location.state.invoiceData.invoice_number}
                    </p>
                  )}
                </div>

                {/* Motivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivo
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={creditNoteReasons.find(r => r.label === createFormData.motivo)?.value || '01'}
                    onChange={(e) => {
                      const selectedReason = creditNoteReasons.find(r => r.value === e.target.value);
                      setCreateFormData(prev => ({
                        ...prev,
                        motivo: selectedReason ? selectedReason.label : e.target.value
                      }));
                    }}
                  >
                    {creditNoteReasons.map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.value} - {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Gestión de detalles */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Detalles de la Nota de Crédito
                    </label>
                    <div className="flex gap-2">
                      {selectedInvoice && (
                        <button
                          type="button"
                          onClick={loadInvoiceDetails}
                          disabled={actionLoading[1]}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                        >
                          {actionLoading[1] ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                              Cargando...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              Cargar de Factura
                            </>
                          )}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={addDetailItem}
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Item
                      </button>
                    </div>
                  </div>

                  {createFormData.detalles.length === 0 ? (
                    <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500">
                      No hay detalles agregados. Haga clic en "Agregar Item" para comenzar.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {createFormData.detalles.map((detalle, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Item {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeDetailItem(index)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Código del producto */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Código del Producto *
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={detalle.product_code || ''}
                                onChange={(e) => updateDetailItem(index, 'product_code', e.target.value)}
                                placeholder="Ej: PROD001"
                              />
                            </div>

                            {/* Nombre del producto */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Nombre del Producto *
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={detalle.product_name || ''}
                                onChange={(e) => updateDetailItem(index, 'product_name', e.target.value)}
                                placeholder="Ej: Producto de ejemplo"
                              />
                            </div>

                            {/* Cantidad */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Cantidad *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={detalle.quantity || 0}
                                onChange={(e) => updateDetailItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            {/* Precio unitario */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Precio Unitario *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={detalle.unit_price || 0}
                                onChange={(e) => updateDetailItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            {/* Descuento */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Descuento
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={detalle.discount || 0}
                                onChange={(e) => updateDetailItem(index, 'discount', parseFloat(e.target.value) || 0)}
                              />
                            </div>

                            {/* Código IVA */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Código IVA *
                              </label>
                              <select
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={detalle.codigo_iva || '4'}
                                onChange={(e) => updateDetailItem(index, 'codigo_iva', e.target.value)}
                              >
                                <option value="4">4 - IVA 15% (Actual)</option>
                                <option value="0">0 - IVA 0%</option>
                                <option value="5">5 - IVA 5% (materiales construcción)</option>
                                <option value="2">2 - IVA 12% (obsoleto)</option>
                                <option value="3">3 - IVA 14%</option>
                                <option value="6">6 - No objeto de impuesto</option>
                                <option value="7">7 - Exento de IVA</option>
                              </select>
                            </div>
                          </div>

                          {/* Subtotal del item */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="text-right">
                              <span className="text-sm text-gray-600">Subtotal: </span>
                              <span className="text-sm font-medium text-gray-900">
                                ${((detalle.quantity || 0) * (detalle.unit_price || 0) - (detalle.discount || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Total general */}
                      <div className="border-t border-gray-300 pt-3">
                        <div className="text-right">
                          <span className="text-lg font-medium text-gray-900">
                            Total: ${calculateTotalAmount().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={closeCreateModal}
                  disabled={actionLoading[0]}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={createCreditNote}
                  disabled={actionLoading[0]}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {actionLoading[0] ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Nota de Crédito'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Nota de Crédito - Similar al de facturas */}
      {showEditModal && editingCreditNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Editar Nota de Crédito {editingCreditNote.credit_note_number}
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500"
                disabled={actionLoading[editingCreditNote.id]}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {/* Formulario similar al de facturas */}
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
                </div>

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
                  disabled={actionLoading[editingCreditNote.id]}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditChanges}
                  disabled={actionLoading[editingCreditNote.id]}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {actionLoading[editingCreditNote.id] ? (
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

      {/* Modal de Detalle de Nota de Crédito - Similar al de facturas */}
      {showCreditNoteModal && selectedCreditNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Detalle de Nota de Crédito {selectedCreditNote.credit_note_number}
              </h3>
              <button
                onClick={closeCreditNoteModal}
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
                        {selectedCreditNote.credit_note_number}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha emisión:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(selectedCreditNote.issue_date)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                        style={{
                          backgroundColor: getStatusBgColor(selectedCreditNote.status_color),
                          color: getStatusTextColor(selectedCreditNote.status_color)
                        }}
                      >
                        {getStatusIcon(selectedCreditNote.status)}
                        {selectedCreditNote.status_label}
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
                        {selectedCreditNote.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {selectedCreditNote.customer.identification}
                        <span className="text-xs text-gray-500 ml-1">
                          ({selectedCreditNote.customer.identification_type_label})
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-700">
                        {selectedCreditNote.customer.phone || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-700 text-xs">
                        {selectedCreditNote.customer.address}
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
                    {selectedCreditNote.sri.access_key && (
                      <div>
                        <span className="text-gray-600">Clave de acceso:</span>
                        <p className="text-xs text-gray-900 font-mono break-all mt-1">
                          {selectedCreditNote.sri.access_key}
                        </p>
                      </div>
                    )}
                    {selectedCreditNote.sri.authorization_number && (
                      <div>
                        <span className="text-gray-600">N° autorización:</span>
                        <p className="text-xs text-gray-900 font-mono break-all mt-1">
                          {selectedCreditNote.sri.authorization_number}
                        </p>
                      </div>
                    )}
                    {selectedCreditNote.retry_info.count > 0 && (
                      <div className="text-orange-600">
                        <span className="text-xs">
                          Reintentos: {selectedCreditNote.retry_info.count}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Información de error SRI (si existe) */}
              {selectedCreditNote.sri.error_message && (
                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Error del SRI
                  </h4>
                  <p className="text-sm text-red-700">
                    {selectedCreditNote.sri.error_message}
                  </p>
                </div>
              )}

              {/* Totales */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Totales
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Subtotal:</span>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(selectedCreditNote.subtotal)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">IVA (15%):</span>
                      <p className="font-medium text-gray-900">
                        {formatCurrency(selectedCreditNote.tax_amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <p className="font-bold text-gray-900 text-lg">
                        {formatCurrency(selectedCreditNote.total_amount)}
                      </p>
                    </div>
                  </div>
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
                          onClick={() => downloadCreditNote(selectedCreditNote.id, "pdf")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          Descargar PDF
                        </button>
                        <button
                          onClick={() => downloadCreditNote(selectedCreditNote.id, "xml")}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <FileText className="h-4 w-4 mr-2 text-gray-500" />
                          Descargar XML
                        </button>
                        <button
                          onClick={() => sendCreditNoteByEmail(selectedCreditNote.id)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Send className="h-4 w-4 mr-2 text-gray-500" />
                          Enviar por email
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ver factura relacionada */}
                {selectedCreditNote.invoice && (
                  <Link
                    to={`/admin/invoices/${selectedCreditNote.invoice.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Factura Original
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

export default AdminCreditNotesPage;