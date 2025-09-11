import React, { useState, useEffect } from "react";
import Table from "../../components/dashboard/Table";
import {
  FileText,
  User,
  Store,
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
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Invoice } from "../../../core/domain/entities/Invoice";
import StatCardList from "../../components/dashboard/StatCardList";

// Datos simulados para facturas
const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: "INV-001-2023",
    orderId: 1001,
    userId: 101,
    sellerId: 201,
    issueDate: "2023-11-01T10:30:00Z",
    subtotal: 125.40,
    taxAmount: 15.05,
    totalAmount: 140.45,
    status: "AUTHORIZED",
    sriAuthorizationNumber: "2311202301179123400110010010000000011234567816",
    sriAccessKey: "2311202301179123400110010010000000011234567816",
    items: [
      {
        id: 1,
        productId: 501,
        description: "Smartphone Samsung Galaxy A53",
        quantity: 1,
        unitPrice: 120.99,
        discount: 0,
        taxRate: 12,
        taxAmount: 14.52,
        total: 135.51,
        product: {
          name: "Smartphone Samsung Galaxy A53",
          image: "samsung-a53.jpg"
        }
      },
      {
        id: 2,
        productId: 502,
        description: "Protector de pantalla",
        quantity: 1,
        unitPrice: 4.41,
        discount: 0,
        taxRate: 12,
        taxAmount: 0.53,
        total: 4.94,
        product: {
          name: "Protector de pantalla para Samsung Galaxy A53",
          image: "screen-protector.jpg"
        }
      }
    ],
    order: {
      orderNumber: "ORD-001-2023",
      createdAt: "2023-11-01T09:15:00Z"
    },
    user: {
      name: "Juan Pérez",
      email: "juan.perez@example.com"
    },
    seller: {
      storeName: "ElectroStore"
    }
  },
  {
    id: 2,
    invoiceNumber: "INV-002-2023",
    orderId: 1002,
    userId: 102,
    sellerId: 202,
    issueDate: "2023-11-02T15:45:00Z",
    subtotal: 350.00,
    taxAmount: 42.00,
    totalAmount: 392.00,
    status: "ISSUED",
    items: [
      {
        id: 3,
        productId: 601,
        description: "Laptop HP Pavilion",
        quantity: 1,
        unitPrice: 350.00,
        discount: 0,
        taxRate: 12,
        taxAmount: 42.00,
        total: 392.00,
        product: {
          name: "Laptop HP Pavilion 15-eg2xxx",
          image: "hp-pavilion.jpg"
        }
      }
    ],
    order: {
      orderNumber: "ORD-002-2023",
      createdAt: "2023-11-02T14:30:00Z"
    },
    user: {
      name: "María Rodríguez",
      email: "maria.rodriguez@example.com"
    },
    seller: {
      storeName: "TechWorld"
    }
  },
  {
    id: 3,
    invoiceNumber: "INV-003-2023",
    orderId: 1003,
    userId: 103,
    sellerId: 203,
    issueDate: "2023-11-03T09:20:00Z",
    subtotal: 75.00,
    taxAmount: 9.00,
    totalAmount: 84.00,
    status: "AUTHORIZED",
    sriAuthorizationNumber: "2311202301179123400110010010000000031234567811",
    sriAccessKey: "2311202301179123400110010010000000031234567811",
    items: [
      {
        id: 4,
        productId: 701,
        description: "Zapatillas deportivas Nike Air",
        quantity: 1,
        unitPrice: 75.00,
        discount: 0,
        taxRate: 12,
        taxAmount: 9.00,
        total: 84.00,
        product: {
          name: "Zapatillas Nike Air Max",
          image: "nike-air.jpg"
        }
      }
    ],
    order: {
      orderNumber: "ORD-003-2023",
      createdAt: "2023-11-03T08:45:00Z"
    },
    user: {
      name: "Carlos Sánchez",
      email: "carlos.sanchez@example.com"
    },
    seller: {
      storeName: "SportFashion"
    }
  },
  {
    id: 4,
    invoiceNumber: "INV-004-2023",
    orderId: 1004,
    userId: 104,
    sellerId: 204,
    issueDate: "2023-11-04T16:30:00Z",
    subtotal: 220.00,
    taxAmount: 26.40,
    totalAmount: 246.40,
    status: "CANCELLED",
    sriAuthorizationNumber: "2311202301179123400110010010000000041234567817",
    sriAccessKey: "2311202301179123400110010010000000041234567817",
    cancellationReason: "Producto agotado",
    cancelledAt: "2023-11-05T10:15:00Z",
    items: [
      {
        id: 5,
        productId: 801,
        description: "Smartwatch Apple Watch Series 7",
        quantity: 1,
        unitPrice: 220.00,
        discount: 0,
        taxRate: 12,
        taxAmount: 26.40,
        total: 246.40,
        product: {
          name: "Apple Watch Series 7",
          image: "apple-watch.jpg"
        }
      }
    ],
    order: {
      orderNumber: "ORD-004-2023",
      createdAt: "2023-11-04T15:00:00Z"
    },
    user: {
      name: "Ana Martínez",
      email: "ana.martinez@example.com"
    },
    seller: {
      storeName: "iPlace"
    }
  },
  {
    id: 5,
    invoiceNumber: "INV-005-2023",
    orderId: 1005,
    userId: 105,
    sellerId: 205,
    issueDate: "2023-11-05T11:20:00Z",
    subtotal: 150.00,
    taxAmount: 18.00,
    totalAmount: 168.00,
    status: "REJECTED",
    sriResponse: {
      errors: ["Datos de identificación incorrectos"],
      status: "REJECTED",
      timestamp: "2023-11-05T11:25:00Z"
    },
    items: [
      {
        id: 6,
        productId: 901,
        description: "Auriculares Sony WH-1000XM4",
        quantity: 1,
        unitPrice: 150.00,
        discount: 0,
        taxRate: 12,
        taxAmount: 18.00,
        total: 168.00,
        product: {
          name: "Sony WH-1000XM4",
          image: "sony-headphones.jpg"
        }
      }
    ],
    order: {
      orderNumber: "ORD-005-2023",
      createdAt: "2023-11-05T10:45:00Z"
    },
    user: {
      name: "Javier García",
      email: "javier.garcia@example.com"
    },
    seller: {
      storeName: "AudioWorld"
    }
  },
  {
    id: 6,
    invoiceNumber: "INV-006-2023",
    orderId: 1006,
    userId: 106,
    sellerId: 206,
    issueDate: "2023-11-06T13:40:00Z",
    subtotal: 89.99,
    taxAmount: 10.80,
    totalAmount: 100.79,
    status: "AUTHORIZED",
    sriAuthorizationNumber: "2311202301179123400110010010000000061234567813",
    sriAccessKey: "2311202301179123400110010010000000061234567813",
    items: [
      {
        id: 7,
        productId: 1001,
        description: "Cafetera Nespresso Essenza Mini",
        quantity: 1,
        unitPrice: 89.99,
        discount: 0,
        taxRate: 12,
        taxAmount: 10.80,
        total: 100.79,
        product: {
          name: "Nespresso Essenza Mini",
          image: "nespresso.jpg"
        }
      }
    ],
    order: {
      orderNumber: "ORD-006-2023",
      createdAt: "2023-11-06T12:30:00Z"
    },
    user: {
      name: "Lucía Fernández",
      email: "lucia.fernandez@example.com"
    },
    seller: {
      storeName: "HomeAppliances"
    }
  },
  {
    id: 7,
    invoiceNumber: "INV-007-2023",
    orderId: 1007,
    userId: 107,
    sellerId: 207,
    issueDate: "2023-11-07T09:50:00Z",
    subtotal: 45.50,
    taxAmount: 5.46,
    totalAmount: 50.96,
    status: "DRAFT",
    items: [
      {
        id: 8,
        productId: 1101,
        description: "Libro 'El Señor de los Anillos'",
        quantity: 1,
        unitPrice: 25.00,
        discount: 0,
        taxRate: 12,
        taxAmount: 3.00,
        total: 28.00,
        product: {
          name: "El Señor de los Anillos - Edición Especial",
          image: "lotr-book.jpg"
        }
      },
      {
        id: 9,
        productId: 1102,
        description: "Libro 'Harry Potter y la Piedra Filosofal'",
        quantity: 1,
        unitPrice: 20.50,
        discount: 0,
        taxRate: 12,
        taxAmount: 2.46,
        total: 22.96,
        product: {
          name: "Harry Potter y la Piedra Filosofal",
          image: "harry-potter.jpg"
        }
      }
    ],
    order: {
      orderNumber: "ORD-007-2023",
      createdAt: "2023-11-07T09:30:00Z"
    },
    user: {
      name: "David López",
      email: "david.lopez@example.com"
    },
    seller: {
      storeName: "BookWorld"
    }
  }
];

// Mapeo de estado para facturas
const invoiceStatusMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  DRAFT: { 
    label: "Borrador", 
    color: "bg-gray-100 text-gray-800",
    icon: <Clock className="w-3 h-3 mr-1" />
  },
  ISSUED: { 
    label: "Emitida", 
    color: "bg-blue-100 text-blue-800",
    icon: <FileText className="w-3 h-3 mr-1" />
  },
  AUTHORIZED: { 
    label: "Autorizada", 
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-3 h-3 mr-1" />
  },
  CANCELLED: { 
    label: "Anulada", 
    color: "bg-orange-100 text-orange-800",
    icon: <XCircle className="w-3 h-3 mr-1" />
  },
  REJECTED: { 
    label: "Rechazada", 
    color: "bg-red-100 text-red-800",
    icon: <AlertTriangle className="w-3 h-3 mr-1" />
  }
};

const AdminInvoicesPage: React.FC = () => {
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [dateRangeFilter, setDateRangeFilter] = useState<{
		from: string;
		to: string;
	}>({
		from: "",
		to: "",
	});
	const [amountFilter, setAmountFilter] = useState<{
		min: string;
		max: string;
	}>({
		min: "",
		max: "",
	});
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});
	const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	const [showPrintOptions, setShowPrintOptions] = useState(false);
	const [_showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

	// Cargar datos
	useEffect(() => {
		const fetchInvoices = () => {
			setLoading(true);
			// Simulación de llamada a API
			setTimeout(() => {
				setInvoices(mockInvoices);
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalItems: mockInvoices.length,
					itemsPerPage: 10,
				});
				setLoading(false);
			}, 500);
		};

		fetchInvoices();
	}, []);

	// Filtrar facturas
	const filteredInvoices = invoices.filter((invoice) => {
		// Filtro por estado
		const matchesStatus =
			statusFilter === "all" || invoice.status === statusFilter;

		// Filtro por rango de fechas
		let matchesDateRange = true;
		if (dateRangeFilter.from) {
			const invoiceDate = new Date(invoice.issueDate);
			const fromDate = new Date(dateRangeFilter.from);
			matchesDateRange = invoiceDate >= fromDate;
		}
		if (dateRangeFilter.to && matchesDateRange) {
			const invoiceDate = new Date(invoice.issueDate);
			const toDate = new Date(dateRangeFilter.to);
			// Ajustar a final del día
			toDate.setHours(23, 59, 59, 999);
			matchesDateRange = invoiceDate <= toDate;
		}

		// Filtro por monto
		let matchesAmount = true;
		if (amountFilter.min) {
			const minAmount = parseFloat(amountFilter.min);
			matchesAmount = invoice.totalAmount >= minAmount;
		}
		if (amountFilter.max && matchesAmount) {
			const maxAmount = parseFloat(amountFilter.max);
			matchesAmount = invoice.totalAmount <= maxAmount;
		}

		return matchesStatus && matchesDateRange && matchesAmount;
	});

	// Abrir modal de factura
	const openInvoiceModal = (invoice: Invoice) => {
		setSelectedInvoice(invoice);
		setShowInvoiceModal(true);
		setShowPrintOptions(false);
	};

	// Cerrar modal
	const closeInvoiceModal = () => {
		setShowInvoiceModal(false);
		setSelectedInvoice(null);
		setShowPrintOptions(false);
		setShowDeleteConfirmation(false);
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

	// Descargar factura
	const downloadInvoice = (invoiceId: number, format: "pdf" | "xml") => {
		// En una aplicación real, se redirigiría a la API para descargar
		alert(
			`Descargando factura #${invoiceId} en formato ${format.toUpperCase()}`
		);

		if (showPrintOptions) {
			setShowPrintOptions(false);
		}
	};

	// Enviar factura por correo electrónico
	const sendInvoiceByEmail = (invoiceId: number) => {
		alert(`Enviando factura #${invoiceId} por correo electrónico al cliente`);

		if (showPrintOptions) {
			setShowPrintOptions(false);
		}
	};

	// Anular factura
	const cancelInvoice = (invoiceId: number) => {
		// En una aplicación real, se enviaría una solicitud a la API
		const reason = prompt("¿Cuál es el motivo de la anulación?");

		if (reason) {
			setInvoices((prevInvoices) =>
				prevInvoices.map((invoice) =>
					invoice.id === invoiceId
						? {
								...invoice,
								status: "CANCELLED",
								cancellationReason: reason,
								cancelledAt: new Date().toISOString(),
							}
						: invoice
				)
			);

			alert(`Factura #${invoiceId} anulada con éxito.`);
			closeInvoiceModal();
		}
	};

	// Autorizar factura (SRI)
	const authorizeInvoice = (invoiceId: number) => {
		// En una aplicación real, se enviaría una solicitud a la API
		setInvoices((prevInvoices) =>
			prevInvoices.map((invoice) =>
				invoice.id === invoiceId
					? {
							...invoice,
							status: "AUTHORIZED",
							sriAuthorizationNumber: `23112023011791234001100100100000000${invoiceId}1234567813`,
							sriAccessKey: `23112023011791234001100100100000000${invoiceId}1234567813`,
						}
					: invoice
			)
		);

		alert(`Factura #${invoiceId} autorizada con éxito.`);
		closeInvoiceModal();
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
		// En una app real, aquí obtendrías los datos para la nueva página
	};

	// Refrescar datos
	const refreshData = () => {
		setLoading(true);
		// Simular recarga de datos
		setTimeout(() => {
			setLoading(false);
		}, 500);
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "invoice",
			header: "Factura",
			sortable: true,
			render: (invoice: Invoice) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
						<FileText className="h-5 w-5 text-blue-600" />
					</div>
					<div className="ml-4">
						<div className="text-sm font-medium text-gray-900">
							{invoice.invoiceNumber}
						</div>
						<div className="text-xs text-gray-500">
							Pedido: {invoice.order?.orderNumber || `#${invoice.orderId}`}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "client",
			header: "Cliente",
			sortable: true,
			render: (invoice: Invoice) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
						<User className="h-4 w-4 text-gray-500" />
					</div>
					<div className="ml-3">
						<div className="text-sm font-medium text-gray-900">
							{invoice.user?.name || `Usuario #${invoice.userId}`}
						</div>
						<div className="text-xs text-gray-500">
							{invoice.user?.email}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "seller",
			header: "Vendedor",
			sortable: true,
			render: (invoice: Invoice) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
						<Store className="h-4 w-4 text-gray-500" />
					</div>
					<div className="ml-3">
						<div className="text-sm font-medium text-gray-900">
							{invoice.seller?.storeName || `Vendedor #${invoice.sellerId}`}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "amount",
			header: "Monto",
			sortable: true,
			render: (invoice: Invoice) => (
				<div className="text-sm font-medium text-gray-900">
					{formatCurrency(invoice.totalAmount)}
					<div className="text-xs text-gray-500">
						Subtotal: {formatCurrency(invoice.subtotal)}
					</div>
					<div className="text-xs text-gray-500">
						IVA: {formatCurrency(invoice.taxAmount)}
					</div>
				</div>
			),
		},
		{
			key: "date",
			header: "Fecha",
			sortable: true,
			render: (invoice: Invoice) => (
				<div className="text-sm text-gray-500">
					{formatDate(invoice.issueDate)}
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (invoice: Invoice) => {
				const status = invoiceStatusMap[invoice.status] || {
					label: invoice.status,
					color:
						"bg-gray-100 text-gray-800",
					icon: <AlertTriangle className="w-3 h-3 mr-1" />,
				};

				return (
					<div>
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
						>
							{status.icon}
							{status.label}
						</span>
						{invoice.cancellationReason && (
							<div className="text-xs text-red-500 mt-1">
								Motivo: {invoice.cancellationReason}
							</div>
						)}
					</div>
				);
			},
		},
		{
			key: "actions",
			header: "Acciones",
			render: (invoice: Invoice) => {
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

						{/* Descargar */}
						<button
							onClick={() => downloadInvoice(invoice.id || 0, "pdf")}
							className="p-1 text-green-600 hover:bg-green-100 rounded-md"
							title="Descargar"
						>
							<Download size={18} />
						</button>

						{/* Anular (solo si está en estado ISSUED o AUTHORIZED) */}
						{(invoice.status === "ISSUED" ||
							invoice.status === "AUTHORIZED") && (
							<button
								onClick={() => cancelInvoice(invoice.id || 0)}
								className="p-1 text-red-600 hover:bg-red-100 rounded-md"
								title="Anular factura"
							>
								<XCircle size={18} />
							</button>
						)}
					</div>
				);
			},
		},
	];

	const flattenedInvoices = filteredInvoices.map((invoice) => ({
		...invoice,
		// Añade propiedades adicionales para búsqueda
		userName: invoice.user?.name || "",
		sellerStoreName: invoice.seller?.storeName || "",
	}));

	const statItems = [
		{ 
		  title: "Total", 
		  value: invoices.length, 
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
		  value: invoices.filter((i) => i.status === "AUTHORIZED").length, 
		  description: "En regla", 
		  icon: CheckCircle, 
		  bgColor: "bg-green-50/20", 
		  textColor: "text-green-800", 
		  valueColor: "text-green-900", 
		  descriptionColor: "text-green-700", 
		  iconColor: "text-green-600", 
		},
		{ 
		  title: "Pendientes", 
		  value: invoices.filter((i) => i.status === "DRAFT" || i.status === "ISSUED").length, 
		  description: "Requieren atención", 
		  icon: Clock, 
		  bgColor: "bg-yellow-50", 
		  textColor: "text-yellow-800", 
		  valueColor: "text-yellow-900", 
		  descriptionColor: "text-yellow-700", 
		  iconColor: "text-yellow-600", 
		},
		{ 
		  title: "Problemas", 
		  value: invoices.filter((i) => i.status === "REJECTED" || i.status === "CANCELLED").length, 
		  description: "Anuladas o rechazadas", 
		  icon: AlertTriangle, 
		  bgColor: "bg-red-50/20", 
		  textColor: "text-red-800", 
		  valueColor: "text-red-900", 
		  descriptionColor: "text-red-700", 
		  iconColor: "text-red-600", 
		}
	  ];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					Gestión de Facturas
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
					>
						<RefreshCw size={18} className="inline mr-2" />
						Actualizar
					</button>
				</div>
			</div>

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
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los Estados</option>
							<option value="DRAFT">Borrador</option>
							<option value="ISSUED">Emitida</option>
							<option value="AUTHORIZED">Autorizada</option>
							<option value="CANCELLED">Anulada</option>
							<option value="REJECTED">Rechazada</option>
						</select>
					</div>

					{/* Filtro de Fecha */}
					<div className="flex items-center space-x-2">
						<Calendar className="h-5 w-5 text-gray-500" />
						<input
							type="date"
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={dateRangeFilter.from}
							onChange={(e) =>
								setDateRangeFilter({...dateRangeFilter, from: e.target.value})
							}
							placeholder="Desde"
						/>
						<input
							type="date"
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={dateRangeFilter.to}
							onChange={(e) =>
								setDateRangeFilter({...dateRangeFilter, to: e.target.value})
							}
							placeholder="Hasta"
						/>
					</div>

					{/* Filtro de Monto */}
					<div className="flex items-center space-x-2">
						<DollarSign className="h-5 w-5 text-gray-500" />
						<input
							type="number"
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-24"
							value={amountFilter.min}
							onChange={(e) =>
								setAmountFilter({...amountFilter, min: e.target.value})
							}
							placeholder="Min $"
							min="0"
							step="0.01"
						/>
						<input
							type="number"
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-24"
							value={amountFilter.max}
							onChange={(e) =>
								setAmountFilter({...amountFilter, max: e.target.value})
							}
							placeholder="Max $"
							min="0"
							step="0.01"
						/>
					</div>
				</div>
			</div>

			{/* Tabla de Facturas */}
			<Table
				data={flattenedInvoices}
				columns={columns}
				searchFields={["invoiceNumber", "userName", "sellerStoreName"]}
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

			{/* Modal de Detalle de Factura */}
			{showInvoiceModal && selectedInvoice && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
							<h3 className="text-lg font-medium text-gray-900">
								Detalle de Factura {selectedInvoice.invoiceNumber}
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
											<span className="text-gray-600">
												Número:
											</span>
											<span className="font-medium text-gray-900">
												{selectedInvoice.invoiceNumber}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">
												Pedido:
											</span>
											<Link
												to={`/admin/orders/${selectedInvoice.orderId}`}
												className="font-medium text-primary-600 hover:text-primary-700"
											>
												{selectedInvoice.order?.orderNumber ||
													`#${selectedInvoice.orderId}`}
											</Link>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">
												Fecha emisión:
											</span>
											<span className="font-medium text-gray-900">
												{formatDate(selectedInvoice.issueDate)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">
												Estado:
											</span>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoiceStatusMap[selectedInvoice.status]?.color}`}
											>
												{invoiceStatusMap[selectedInvoice.status]?.icon}
												{invoiceStatusMap[selectedInvoice.status]?.label}
											</span>
										</div>
									</div>
								</div>

								{/* Información del cliente */}
								<div>
									<h4 className="text-sm font-medium text-gray-500 mb-2">
										Cliente
									</h4>
									<div className="flex items-center mb-3">
										<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
											<User className="h-4 w-4 text-gray-500" />
										</div>
										<div className="ml-3">
											<Link
												to={`/admin/users/${selectedInvoice.userId}`}
												className="text-sm font-medium text-primary-600 hover:text-primary-700"
											>
												{selectedInvoice.user?.name ||
													`Usuario #${selectedInvoice.userId}`}
											</Link>
										</div>
									</div>
									<div className="space-y-1 text-sm pl-11">
										<div>
											<span className="text-gray-600">
												Email:
											</span>
											<span className="ml-1 text-gray-900">
												{selectedInvoice.user?.email}
											</span>
										</div>
									</div>
								</div>

								{/* Información del vendedor */}
								<div>
									<h4 className="text-sm font-medium text-gray-500 mb-2">
										Vendedor
									</h4>
									<div className="flex items-center mb-3">
										<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
											<Store className="h-4 w-4 text-gray-500" />
										</div>
										<div className="ml-3">
											<Link
												to={`/admin/sellers/${selectedInvoice.sellerId}`}
												className="text-sm font-medium text-primary-600 hover:text-primary-700"
											>
												{selectedInvoice.seller?.storeName ||
													`Vendedor #${selectedInvoice.sellerId}`}
											</Link>
										</div>
									</div>
								</div>
							</div>

							{/* Información SRI (si está autorizada) */}
							{selectedInvoice.status === "AUTHORIZED" &&
								selectedInvoice.sriAuthorizationNumber && (
									<div className="bg-green-50/20 p-4 rounded-lg mb-6">
										<h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
											<CheckCircle className="h-4 w-4 mr-1" />
											Información de Autorización SRI
										</h4>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<span className="text-xs text-green-700">
													Número de Autorización:
												</span>
												<p className="text-sm text-green-900 font-mono break-all mt-1">
													{selectedInvoice.sriAuthorizationNumber}
												</p>
											</div>
											<div>
												<span className="text-xs text-green-700">
													Clave de Acceso:
												</span>
												<p className="text-sm text-green-900 font-mono break-all mt-1">
													{selectedInvoice.sriAccessKey}
												</p>
											</div>
										</div>
									</div>
								)}

							{/* Información de rechazo (si fue rechazada) */}
							{selectedInvoice.status === "REJECTED" &&
								selectedInvoice.sriResponse && (
									<div className="bg-red-50/20 p-4 rounded-lg mb-6">
										<h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											Motivo de Rechazo
										</h4>
										<div>
											<ul className="list-disc list-inside text-sm text-red-700 space-y-1">
												{Array.isArray(selectedInvoice.sriResponse.errors) ? (
													selectedInvoice.sriResponse.errors.map(
														(error, idx) => <li key={idx}>{error}</li>
													)
												) : (
													<li>Error desconocido</li>
												)}
											</ul>
										</div>
									</div>
								)}

							{/* Información de cancelación (si fue anulada) */}
							{selectedInvoice.status === "CANCELLED" &&
								selectedInvoice.cancellationReason && (
									<div className="bg-orange-50/20 p-4 rounded-lg mb-6">
										<h4 className="text-sm font-medium text-orange-800 mb-2 flex items-center">
											<XCircle className="h-4 w-4 mr-1" />
											Información de Anulación
										</h4>
										<div>
											<span className="text-xs text-orange-700">
												Motivo:
											</span>
											<p className="text-sm text-orange-900 mt-1">
												{selectedInvoice.cancellationReason}
											</p>
											{selectedInvoice.cancelledAt && (
												<div className="mt-2 text-xs text-orange-700">
													Fecha de anulación:{" "}
													{formatDate(selectedInvoice.cancelledAt)}
												</div>
											)}
										</div>
									</div>
								)}

							{/* Tabla de artículos */}
							<div className="mb-6">
								<h4 className="text-sm font-medium text-gray-500 mb-2">
									Artículos
								</h4>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													Descripción
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
													Precio Unit.
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
														{item.description}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{item.quantity}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{formatCurrency(item.unitPrice)}
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
													IVA (12%):
												</td>
												<td
													colSpan={2}
													className="px-6 py-4 text-sm text-gray-900"
												>
													{formatCurrency(selectedInvoice.taxAmount)}
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
													{formatCurrency(selectedInvoice.totalAmount)}
												</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>

							{/* Acciones */}
							<div className="flex flex-wrap justify-end gap-2 mt-6">
								{/* Opción para imprimir/descargar */}
								<div className="relative">
									<button
										onClick={() => setShowPrintOptions(!showPrintOptions)}
										className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
									>
										<Download className="h-4 w-4 mr-2" />
										Descargar/Imprimir
									</button>

									{showPrintOptions && (
										<div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
											<div
												className="py-1"
												role="menu"
												aria-orientation="vertical"
												aria-labelledby="options-menu"
											>
												<button
													onClick={() =>
														downloadInvoice(selectedInvoice.id || 0, "pdf")
													}
													className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
													role="menuitem"
												>
													<FileText className="h-4 w-4 mr-2 text-gray-500" />
													Descargar PDF
												</button>
												<button
													onClick={() =>
														downloadInvoice(selectedInvoice.id || 0, "xml")
													}
													className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
													role="menuitem"
												>
													<FileText className="h-4 w-4 mr-2 text-gray-500" />
													Descargar XML
												</button>
												<button
													onClick={() =>
														sendInvoiceByEmail(selectedInvoice.id || 0)
													}
													className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
													role="menuitem"
												>
													<Send className="h-4 w-4 mr-2 text-gray-500" />
													Enviar por email
												</button>
											</div>
										</div>
									)}
								</div>

								{/* Anular factura (solo si está en ISSUED o AUTHORIZED) */}
								{(selectedInvoice.status === "ISSUED" ||
									selectedInvoice.status === "AUTHORIZED") && (
									<button
										onClick={() => cancelInvoice(selectedInvoice.id || 0)}
										className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
									>
										<XCircle className="h-4 w-4 mr-2" />
										Anular Factura
									</button>
								)}

								{/* Autorizar factura (solo si está en ISSUED) */}
								{selectedInvoice.status === "ISSUED" && (
									<button
										onClick={() => authorizeInvoice(selectedInvoice.id || 0)}
										className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
									>
										<CheckCircle className="h-4 w-4 mr-2" />
										Autorizar SRI
									</button>
								)}

								{/* Ver orden relacionada */}
								<Link
									to={`/admin/orders/${selectedInvoice.orderId}`}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
								>
									<ShoppingBag className="h-4 w-4 mr-2" />
									Ver Orden
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminInvoicesPage;