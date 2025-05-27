import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Download,
  Filter,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  ExternalLink,
  Clock,
  FileCheck,
  TrendingUp
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import { formatCurrency } from "../../../utils/formatters/formatCurrency";
import type { Invoice } from "../../../core/domain/entities/Invoice";
import {SellerStatCardList} from "../../components/dashboard/SellerStatCardList";

// Datos de ejemplo para facturas
const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-2023-001",
    orderId: 1001,
    userId: 101,
    sellerId: 2,
    issueDate: "2023-10-15T14:30:00Z",
    subtotal: 199.99,
    taxAmount: 24.00,
    totalAmount: 223.99,
    status: "AUTHORIZED",
    sriAuthorizationNumber: "1234567890",
    sriAccessKey: "0123456789ABCDEF0123456789ABCDEF01234567",
    items: [
      {
        id: 1,
        productId: 201,
        description: "Smartphone Samsung Galaxy A52",
        quantity: 1,
        unitPrice: 199.99,
        discount: 0,
        taxRate: 12,
        taxAmount: 24.00,
        total: 223.99,
        product: {
          name: "Smartphone Samsung Galaxy A52",
          image: "https://via.placeholder.com/50"
        }
      }
    ],
    order: {
      orderNumber: "ORD-2023-1001",
      createdAt: "2023-10-15T10:15:00Z"
    },
    user: {
      name: "Juan Pérez",
      email: "juan.perez@example.com"
    }
  },
  {
    id: 2,
    invoiceNumber: "INV-2023-002",
    orderId: 1002,
    userId: 102,
    sellerId: 2,
    issueDate: "2023-10-18T09:45:00Z",
    subtotal: 349.98,
    taxAmount: 42.00,
    totalAmount: 391.98,
    status: "ISSUED",
    items: [
      {
        id: 2,
        productId: 202,
        description: "Audífonos Bluetooth Sony WH-1000XM4",
        quantity: 2,
        unitPrice: 174.99,
        discount: 0,
        taxRate: 12,
        taxAmount: 42.00,
        total: 391.98,
        product: {
          name: "Audífonos Bluetooth Sony WH-1000XM4",
          image: "https://via.placeholder.com/50"
        }
      }
    ],
    order: {
      orderNumber: "ORD-2023-1002",
      createdAt: "2023-10-18T08:30:00Z"
    },
    user: {
      name: "María Rodríguez",
      email: "maria.rodriguez@example.com"
    }
  },
  {
    id: 3,
    invoiceNumber: "INV-2023-003",
    orderId: 1003,
    userId: 103,
    sellerId: 2,
    issueDate: "2023-10-20T16:20:00Z",
    subtotal: 599.99,
    taxAmount: 72.00,
    totalAmount: 671.99,
    status: "AUTHORIZED",
    sriAuthorizationNumber: "0987654321",
    sriAccessKey: "FEDCBA9876543210FEDCBA9876543210FEDCBA98",
    items: [
      {
        id: 3,
        productId: 203,
        description: "Laptop Lenovo ThinkPad X1",
        quantity: 1,
        unitPrice: 599.99,
        discount: 0,
        taxRate: 12,
        taxAmount: 72.00,
        total: 671.99,
        product: {
          name: "Laptop Lenovo ThinkPad X1",
          image: "https://via.placeholder.com/50"
        }
      }
    ],
    order: {
      orderNumber: "ORD-2023-1003",
      createdAt: "2023-10-20T15:10:00Z"
    },
    user: {
      name: "Carlos López",
      email: "carlos.lopez@example.com"
    }
  },
  {
    id: 4,
    invoiceNumber: "INV-2023-004",
    orderId: 1004,
    userId: 104,
    sellerId: 2,
    issueDate: "2023-10-25T11:30:00Z",
    subtotal: 129.99,
    taxAmount: 15.60,
    totalAmount: 145.59,
    status: "REJECTED",
    items: [
      {
        id: 4,
        productId: 204,
        description: "Teclado Mecánico Logitech G Pro",
        quantity: 1,
        unitPrice: 129.99,
        discount: 0,
        taxRate: 12,
        taxAmount: 15.60,
        total: 145.59,
        product: {
          name: "Teclado Mecánico Logitech G Pro",
          image: "https://via.placeholder.com/50"
        }
      }
    ],
    order: {
      orderNumber: "ORD-2023-1004",
      createdAt: "2023-10-25T10:05:00Z"
    },
    user: {
      name: "Laura Martínez",
      email: "laura.martinez@example.com"
    }
  },
  {
    id: 5,
    invoiceNumber: "INV-2023-005",
    orderId: 1005,
    userId: 105,
    sellerId: 2,
    issueDate: "2023-11-02T14:15:00Z",
    subtotal: 879.98,
    taxAmount: 105.60,
    totalAmount: 985.58,
    status: "CANCELLED",
    cancellationReason: "Cliente solicitó cancelación por cambio de producto",
    cancelledAt: "2023-11-03T09:30:00Z",
    items: [
      {
        id: 5,
        productId: 205,
        description: "Monitor LG UltraWide 34",
        quantity: 2,
        unitPrice: 439.99,
        discount: 0,
        taxRate: 12,
        taxAmount: 105.60,
        total: 985.58,
        product: {
          name: "Monitor LG UltraWide 34",
          image: "https://via.placeholder.com/50"
        }
      }
    ],
    order: {
      orderNumber: "ORD-2023-1005",
      createdAt: "2023-11-02T13:45:00Z"
    },
    user: {
      name: "Pedro Sánchez",
      email: "pedro.sanchez@example.com"
    }
  },
  {
    id: 6,
    invoiceNumber: "INV-2023-006",
    orderId: 1006,
    userId: 106,
    sellerId: 2,
    issueDate: "2023-11-05T10:30:00Z",
    subtotal: 499.99,
    taxAmount: 60.00,
    totalAmount: 559.99,
    status: "DRAFT",
    items: [
      {
        id: 6,
        productId: 206,
        description: "Consola PlayStation 5",
        quantity: 1,
        unitPrice: 499.99,
        discount: 0,
        taxRate: 12,
        taxAmount: 60.00,
        total: 559.99,
        product: {
          name: "Consola PlayStation 5",
          image: "https://via.placeholder.com/50"
        }
      }
    ],
    order: {
      orderNumber: "ORD-2023-1006",
      createdAt: "2023-11-05T09:15:00Z"
    },
    user: {
      name: "Ana Gómez",
      email: "ana.gomez@example.com"
    }
  }
];

// Componente principal
const SellerInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateRangeFilter, setDateRangeFilter] = useState<{start: string; end: string}>({
    start: "",
    end: ""
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState<boolean>(false);

  // Cargar facturas al montar el componente
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Función para cargar facturas (simulación de API)
  const fetchInvoices = () => {
    setLoading(true);
    // Simulación de carga desde API
    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 800);
  };

  // Filtrar las facturas según los filtros aplicados
  const filteredInvoices = invoices.filter((invoice) => {
    // Filtro por estado
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "authorized" && invoice.status === "AUTHORIZED") ||
      (statusFilter === "issued" && invoice.status === "ISSUED") ||
      (statusFilter === "draft" && invoice.status === "DRAFT") ||
      (statusFilter === "rejected" && invoice.status === "REJECTED") ||
      (statusFilter === "cancelled" && invoice.status === "CANCELLED");

    // Filtro por búsqueda (número de factura, cliente, o número de pedido)
    const matchesSearch =
      searchTerm === "" ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.order?.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por rango de fechas
    const invoiceDate = new Date(invoice.issueDate);
    const matchesDateRange =
      (dateRangeFilter.start === "" || 
        new Date(dateRangeFilter.start) <= invoiceDate) &&
      (dateRangeFilter.end === "" || 
        new Date(dateRangeFilter.end) >= invoiceDate);

    return matchesStatus && matchesSearch && matchesDateRange;
  });

  // Obtener estadísticas de facturas
  const invoiceStats = {
    total: invoices.length,
    authorized: invoices.filter(inv => inv.status === "AUTHORIZED").length,
    issued: invoices.filter(inv => inv.status === "ISSUED").length,
    draft: invoices.filter(inv => inv.status === "DRAFT").length,
    rejected: invoices.filter(inv => inv.status === "REJECTED").length,
    cancelled: invoices.filter(inv => inv.status === "CANCELLED").length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  };

  // Abrir el modal de detalles de factura
  const openInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetails(true);
  };

  // Cerrar el modal de detalles
  const closeInvoiceDetails = () => {
    setShowInvoiceDetails(false);
    setSelectedInvoice(null);
  };

  // Manejar la solicitud de autorización (simulada)
  const handleRequestAuthorization = (invoiceId: number) => {
    setLoading(true);
    // Simulación de llamada a API
    setTimeout(() => {
      setInvoices(prevInvoices => 
        prevInvoices.map(inv => 
          inv.id === invoiceId 
            ? {...inv, 
               status: "AUTHORIZED", 
               sriAuthorizationNumber: `AUTH-${Math.floor(Math.random() * 10000000)}`,
               sriAccessKey: `KEY-${Math.floor(Math.random() * 100000000)}`
              } 
            : inv
        )
      );
      
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice(prev => prev ? {
          ...prev, 
          status: "AUTHORIZED", 
          sriAuthorizationNumber: `AUTH-${Math.floor(Math.random() * 10000000)}`,
          sriAccessKey: `KEY-${Math.floor(Math.random() * 100000000)}`
        } : null);
      }
      
      setLoading(false);
    }, 1500);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Descargar factura (simulado)
  const downloadInvoice = (invoice: Invoice, format: 'pdf' | 'xml') => {
    // Simulación de descarga
    alert(`Descargando factura ${invoice.invoiceNumber} en formato ${format.toUpperCase()}`);
  };

  // Definir las columnas de la tabla
  const columns = [
    {
      key: "invoiceNumber",
      header: "Factura Nº",
      sortable: true,
      render: (invoice: Invoice) => (
        <button
          className="text-primary-600 hover:underline font-medium flex items-center"
          onClick={() => openInvoiceDetails(invoice)}
        >
          {invoice.invoiceNumber}
          <ExternalLink className="w-4 h-4 ml-1" />
        </button>
      )
    },
    {
      key: "order",
      header: "Pedido",
      sortable: true,
      render: (invoice: Invoice) => (
        <Link
          to={`/seller/orders/${invoice.orderId}`}
          className="text-primary-600 hover:underline"
        >
          {invoice.order?.orderNumber}
        </Link>
      )
    },
    {
      key: "customer",
      header: "Cliente",
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="text-sm text-gray-900">
          {invoice.user?.name}
          <div className="text-xs text-gray-500">
            {invoice.user?.email}
          </div>
        </div>
      )
    },
    {
      key: "issueDate",
      header: "Fecha",
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="text-sm text-gray-500 flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {formatDate(invoice.issueDate)}
        </div>
      )
    },
    {
      key: "totalAmount",
      header: "Total",
      sortable: true,
      render: (invoice: Invoice) => (
        <div className="text-sm font-semibold">
          {formatCurrency(invoice.totalAmount)}
        </div>
      )
    },
    {
      key: "status",
      header: "Estado",
      sortable: true,
      render: (invoice: Invoice) => {
        let statusContent;
        
        switch (invoice.status) {
          case "AUTHORIZED":
            statusContent = (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Autorizada
              </span>
            );
            break;
          case "ISSUED":
            statusContent = (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                Emitida
              </span>
            );
            break;
          case "DRAFT":
            statusContent = (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <FileText className="w-3 h-3 mr-1" />
                Borrador
              </span>
            );
            break;
          case "REJECTED":
            statusContent = (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <XCircle className="w-3 h-3 mr-1" />
                Rechazada
              </span>
            );
            break;
          case "CANCELLED":
            statusContent = (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Cancelada
              </span>
            );
            break;
          default:
            statusContent = <span>Desconocido</span>;
        }
        
        return statusContent;
      }
    },
    {
      key: "actions",
      header: "Acciones",
      render: (invoice: Invoice) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => downloadInvoice(invoice, 'pdf')}
            className="p-1 text-gray-600 hover:bg-gray-100 rounded-md"
            title="Descargar PDF"
          >
            <Download className="w-5 h-5" />
          </button>
          
          {invoice.status === "ISSUED" && (
            <button 
              onClick={() => handleRequestAuthorization(invoice.id || 0)}
              className="p-1 text-primary-600 hover:bg-primary-100 rounded-md"
              title="Solicitar autorización"
            >
              <FileCheck className="w-5 h-5" />
            </button>
          )}
        </div>
      )
    }
  ];

  const statsData = [
  {
    label: "Total de Facturas",
    value: invoiceStats.total,
    icon: (
      <FileText className="w-6 h-6 text-primary-600" />
    ),
    color: "primary",
  },
  {
    label: "Autorizadas",
    value: invoiceStats.authorized,
    icon: (
      <CheckCircle className="w-6 h-6 text-green-600" />
    ),
    color: "green",
  },
  {
    label: "Emitidas",
    value: invoiceStats.issued,
    icon: <Clock className="w-6 h-6 text-blue-600" />,
    color: "blue",
  },
  {
    label: "Borradores",
    value: invoiceStats.draft,
    icon: (
      <FileText className="w-6 h-6 text-gray-600" />
    ),
    color: "gray",
  },
  {
    label: "Problemas",
    value: invoiceStats.rejected + invoiceStats.cancelled,
    icon: (
      <AlertTriangle className="w-6 h-6 text-red-600" />
    ),
    color: "red",
  },
  {
    label: "Total Ventas",
    value: formatCurrency(invoiceStats.totalAmount),
    icon: (
      <TrendingUp className="w-6 h-6 text-indigo-600" />
    ),
    color: "indigo",
  },
];

  return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 flex items-center">
					<FileText className="w-6 h-6 mr-2" />
					Facturas
				</h1>
				<button
					onClick={fetchInvoices}
					className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
				>
					<RefreshCw size={18} className="mr-2" />
					Actualizar
				</button>
			</div>

			{/* Tarjetas de estadísticas */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
				<SellerStatCardList items={statsData} />
			</div>

			{/* Filtros */}
			<div className="bg-white rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Búsqueda */}
					<div className="md:w-1/3 lg:w-1/4 relative">
						<input
							type="text"
							placeholder="Buscar facturas..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					</div>

					{/* Filtros */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500" />
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los estados</option>
							<option value="authorized">Autorizadas</option>
							<option value="issued">Emitidas</option>
							<option value="draft">Borradores</option>
							<option value="rejected">Rechazadas</option>
							<option value="cancelled">Canceladas</option>
						</select>
					</div>

					{/* Rango de fecha */}
					<div className="flex items-center space-x-2">
						<Calendar className="h-5 w-5 text-gray-500" />
						<input
							type="date"
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={dateRangeFilter.start}
							onChange={(e) =>
								setDateRangeFilter((prev) => ({...prev, start: e.target.value}))
							}
						/>
						<span className="text-gray-500">a</span>
						<input
							type="date"
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={dateRangeFilter.end}
							onChange={(e) =>
								setDateRangeFilter((prev) => ({...prev, end: e.target.value}))
							}
						/>
					</div>
				</div>
			</div>

			{/* Tabla de facturas */}
			<Table
				data={filteredInvoices}
				columns={columns}
				searchFields={[
					"invoiceNumber",
					"order.orderNumber",
					"user.name",
					"user.email",
				]}
				loading={loading}
				emptyMessage="No se encontraron facturas con los filtros aplicados"
				pagination={{
					currentPage: 1,
					totalPages: 1,
					totalItems: filteredInvoices.length,
					itemsPerPage: 10,
					onPageChange: () => {},
				}}
			/>

			{/* Modal de detalles de factura */}
			{showInvoiceDetails && selectedInvoice && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-start mb-6">
								<h2 className="text-xl font-bold text-gray-900 flex items-center">
									<FileText className="w-5 h-5 mr-2" />
									Factura {selectedInvoice.invoiceNumber}
								</h2>
								<button
									onClick={closeInvoiceDetails}
									className="text-gray-500 hover:text-gray-700"
								>
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M6 18L18 6M6 6l12 12"
										></path>
									</svg>
								</button>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<div>
									<h3 className="text-sm font-medium text-gray-500 mb-2">
										Información de Factura
									</h3>
									<div className="bg-gray-50 rounded-lg p-4">
										<div className="mb-3">
											<span className="text-xs text-gray-500">
												Nombre:
											</span>
											<p className="text-sm font-medium text-gray-900 mt-1">
												{selectedInvoice.user?.name}
											</p>
										</div>
										<div className="mb-3">
											<span className="text-xs text-gray-500">
												Email:
											</span>
											<p className="text-sm font-medium text-gray-900 mt-1">
												{selectedInvoice.user?.email}
											</p>
										</div>
										<span className="text-xs text-gray-500">
											Estado:
										</span>
										<div className="mt-1">
											{selectedInvoice.status === "AUTHORIZED" && (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
													<CheckCircle className="w-3 h-3 mr-1" />
													Autorizada
												</span>
											)}
											{selectedInvoice.status === "ISSUED" && (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
													<Clock className="w-3 h-3 mr-1" />
													Emitida
												</span>
											)}
											{selectedInvoice.status === "DRAFT" && (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
													<FileText className="w-3 h-3 mr-1" />
													Borrador
												</span>
											)}
											{selectedInvoice.status === "REJECTED" && (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
													<XCircle className="w-3 h-3 mr-1" />
													Rechazada
												</span>
											)}
											{selectedInvoice.status === "CANCELLED" && (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
													<AlertTriangle className="w-3 h-3 mr-1" />
													Cancelada
												</span>
											)}
										</div>
									</div>
									<div className="mb-3">
										<span className="text-xs text-gray-500">
											Fecha de emisión:
										</span>
										<p className="text-sm font-medium text-gray-900 mt-1">
											{formatDate(selectedInvoice.issueDate)}
										</p>
									</div>
									<div className="mb-3">
										<span className="text-xs text-gray-500">
											Pedido relacionado:
										</span>
										<p className="text-sm font-medium text-primary-600 mt-1">
											<Link to={`/seller/orders/${selectedInvoice.orderId}`}>
												{selectedInvoice.order?.orderNumber}
											</Link>
										</p>
									</div>
									{selectedInvoice.sriAuthorizationNumber && (
										<div className="mb-3">
											<span className="text-xs text-gray-500">
												Número de autorización:
											</span>
											<p className="text-sm font-medium text-gray-900 mt-1">
												{selectedInvoice.sriAuthorizationNumber}
											</p>
										</div>
									)}
									{selectedInvoice.cancellationReason && (
										<div className="mb-3">
											<span className="text-xs text-gray-500">
												Motivo de cancelación:
											</span>
											<p className="text-sm font-medium text-gray-900 mt-1">
												{selectedInvoice.cancellationReason}
											</p>
										</div>
									)}
								</div>

								<div>
									<h3 className="text-sm font-medium text-gray-500 mb-2">
										Resumen de Factura
									</h3>
									<div className="bg-gray-50 rounded-lg p-4">
										<div className="mb-4">
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-500">
													Subtotal:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(selectedInvoice.subtotal)}
												</span>
											</div>
											<div className="flex justify-between mb-2">
												<span className="text-sm text-gray-500">
													IVA (12%):
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(selectedInvoice.taxAmount)}
												</span>
											</div>
											<div className="border-t border-gray-200 my-2 pt-2 flex justify-between">
												<span className="text-sm font-bold text-gray-700">
													Total:
												</span>
												<span className="text-sm font-bold text-gray-900">
													{formatCurrency(selectedInvoice.totalAmount)}
												</span>
											</div>
										</div>

										<div className="flex space-x-2 mt-4">
											<button
												onClick={() => downloadInvoice(selectedInvoice, "pdf")}
												className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center text-sm"
											>
												<Download className="w-4 h-4 mr-1" />
												Descargar PDF
											</button>
											<button
												onClick={() => downloadInvoice(selectedInvoice, "xml")}
												className="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center text-sm"
											>
												<Download className="w-4 h-4 mr-1" />
												Descargar XML
											</button>

											{selectedInvoice.status === "ISSUED" && (
												<button
													onClick={() => {
														handleRequestAuthorization(selectedInvoice.id || 0);
													}}
													className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
												>
													<FileCheck className="w-4 h-4 mr-1" />
													Solicitar Autorización
												</button>
											)}
										</div>
									</div>
								</div>
							</div>

							<h3 className="text-sm font-medium text-gray-500 mb-2">
								Detalle de Productos
							</h3>
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
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Cantidad
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Precio Unitario
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Descuento
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												IVA
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Total
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{selectedInvoice.items.map((item) => (
											<tr
												key={item.id}
												className="hover:bg-gray-50"
											>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													<div className="flex items-center">
														{item.product?.image && (
															<img
																src={item.product.image}
																alt={item.description}
																className="w-10 h-10 object-cover rounded-md mr-3"
															/>
														)}
														<div>
															<div className="font-medium">
																{item.product?.name || item.description}
															</div>
															<div className="text-xs text-gray-500">
																ID: {item.productId}
															</div>
														</div>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{item.quantity}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatCurrency(item.unitPrice)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatCurrency(item.discount)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatCurrency(item.taxAmount)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{formatCurrency(item.total)}
												</td>
											</tr>
										))}
									</tbody>
									<tfoot className="bg-gray-50">
										<tr>
											<td
												colSpan={4}
												className="px-6 py-4 text-right text-sm font-medium text-gray-500"
											>
												Subtotal:
											</td>
											<td
												colSpan={2}
												className="px-6 py-4 text-right text-sm font-medium text-gray-900"
											>
												{formatCurrency(selectedInvoice.subtotal)}
											</td>
										</tr>
										<tr>
											<td
												colSpan={4}
												className="px-6 py-4 text-right text-sm font-medium text-gray-500"
											>
												IVA (12%):
											</td>
											<td
												colSpan={2}
												className="px-6 py-4 text-right text-sm font-medium text-gray-900"
											>
												{formatCurrency(selectedInvoice.taxAmount)}
											</td>
										</tr>
										<tr>
											<td
												colSpan={4}
												className="px-6 py-4 text-right text-sm font-bold text-gray-700"
											>
												Total:
											</td>
											<td
												colSpan={2}
												className="px-6 py-4 text-right text-sm font-bold text-gray-900"
											>
												{formatCurrency(selectedInvoice.totalAmount)}
											</td>
										</tr>
									</tfoot>
								</table>
							</div>

							{/* Información de autorización SRI */}
							{selectedInvoice.status === "AUTHORIZED" &&
								selectedInvoice.sriAuthorizationNumber && (
									<div className="mt-6 bg-green-50/30 border border-green-200 rounded-lg p-4">
										<h3 className="text-sm font-medium text-green-800 flex items-center mb-2">
											<CheckCircle className="w-4 h-4 mr-1" />
											Información de Autorización SRI
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<span className="text-xs text-green-700">
													Número de Autorización:
												</span>
												<p className="text-sm font-medium text-green-900 mt-1">
													{selectedInvoice.sriAuthorizationNumber}
												</p>
											</div>
											{selectedInvoice.sriAccessKey && (
												<div>
													<span className="text-xs text-green-700">
														Clave de Acceso:
													</span>
													<p className="text-sm font-medium text-green-900 mt-1">
														{selectedInvoice.sriAccessKey}
													</p>
												</div>
											)}
										</div>
									</div>
								)}

							{/* Información de cancelación */}
							{selectedInvoice.status === "CANCELLED" &&
								selectedInvoice.cancellationReason && (
									<div className="mt-6 bg-yellow-50/30 border border-yellow-200 rounded-lg p-4">
										<h3 className="text-sm font-medium text-yellow-800 flex items-center mb-2">
											<AlertTriangle className="w-4 h-4 mr-1" />
											Información de Cancelación
										</h3>
										<div>
											<span className="text-xs text-yellow-700">
												Motivo de Cancelación:
											</span>
											<p className="text-sm font-medium text-yellow-900 mt-1">
												{selectedInvoice.cancellationReason}
											</p>
										</div>
										{selectedInvoice.cancelledAt && (
											<div className="mt-2">
												<span className="text-xs text-yellow-700">
													Fecha de Cancelación:
												</span>
												<p className="text-sm font-medium text-yellow-900 mt-1">
													{formatDate(selectedInvoice.cancelledAt)}
												</p>
											</div>
										)}
									</div>
								)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default SellerInvoicesPage;              