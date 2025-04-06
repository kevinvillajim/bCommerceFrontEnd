import React, { useState, useEffect } from "react";
import Table from "../../components/dashboard/Table";
import {
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Filter,
  Calendar,
  BarChart2,
  Eye,
  Flag,
  Tag,
  Store
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Feedback } from "../../../core/domain/entities/Feedback";

// Datos simulados para feedback
const mockFeedback: Feedback[] = [
  {
    id: 1,
    userId: 101,
    sellerId: 2,
    title: "Mejora sugerida para la navegación",
    description: "Sería genial si pudieran añadir filtros más específicos en la sección de categorías. A veces es difícil encontrar productos específicos.",
    type: "improvement",
    status: "pending",
    createdAt: "2023-11-05T14:30:00Z",
    updatedAt: "2023-11-05T14:30:00Z",
    user: {
      id: 101,
      name: "Juan Pérez"
    }
  },
  {
    id: 2,
    userId: 102,
    sellerId: 3,
    title: "Error al cargar imágenes de productos",
    description: "He notado que algunas imágenes de productos no se cargan correctamente en dispositivos móviles, especialmente en iOS. Esto ocurre regularmente en la sección de ofertas.",
    type: "bug",
    status: "approved",
    adminNotes: "Verificado y enviado al equipo de desarrollo. Se está trabajando en una solución.",
    reviewedBy: 201,
    reviewedAt: "2023-11-06T10:15:00Z",
    createdAt: "2023-11-04T09:20:00Z",
    updatedAt: "2023-11-06T10:15:00Z",
    user: {
      id: 102,
      name: "María Rodríguez"
    },
    admin: {
      id: 201,
      name: "Admin Principal"
    }
  },
  {
    id: 3,
    userId: 103,
    title: "Sugerencia para nuevas categorías",
    description: "Me encantaría ver una categoría específica para productos ecológicos o sostenibles. Creo que sería muy útil para los consumidores que buscan alternativas más respetuosas con el medio ambiente.",
    type: "feature",
    status: "pending",
    createdAt: "2023-11-03T16:45:00Z",
    updatedAt: "2023-11-03T16:45:00Z",
    user: {
      id: 103,
      name: "Carlos Sánchez"
    }
  },
  {
    id: 4,
    userId: 104,
    sellerId: 5,
    title: "Problema con el tiempo de carga",
    description: "El sitio se ha vuelto extremadamente lento en los últimos días, especialmente al buscar productos o cambiar entre categorías. Por favor, mejoren el rendimiento.",
    type: "bug",
    status: "approved",
    adminNotes: "Confirmado, estamos optimizando la carga de imágenes y recursos.",
    reviewedBy: 202,
    reviewedAt: "2023-11-05T11:30:00Z",
    createdAt: "2023-11-02T13:20:00Z",
    updatedAt: "2023-11-05T11:30:00Z",
    user: {
      id: 104,
      name: "Ana Martínez"
    },
    admin: {
      id: 202,
      name: "Admin Técnico"
    }
  },
  {
    id: 5,
    userId: 105,
    sellerId: 1,
    title: "Queja sobre vendedor no profesional",
    description: "Tuve una experiencia muy negativa con el vendedor 'ElectroStore'. No respondieron a mis mensajes, enviaron un producto diferente al que compré y ahora no quieren aceptar la devolución.",
    type: "complaint",
    status: "pending",
    createdAt: "2023-11-06T09:10:00Z",
    updatedAt: "2023-11-06T09:10:00Z",
    user: {
      id: 105,
      name: "Javier García"
    },
    seller: {
      id: 1,
      storeName: "ElectroStore"
    }
  },
  {
    id: 6,
    userId: 106,
    title: "Sugerencia para proceso de checkout",
    description: "El proceso de pago tiene demasiados pasos. Sería genial si pudieran simplificarlo y ofrecer la opción de guardar información para futuras compras.",
    type: "improvement",
    status: "rejected",
    adminNotes: "Actualmente no es viable reducir pasos debido a requisitos de seguridad. Lo reconsideraremos en futuras actualizaciones.",
    reviewedBy: 201,
    reviewedAt: "2023-11-04T14:30:00Z",
    createdAt: "2023-11-01T10:45:00Z",
    updatedAt: "2023-11-04T14:30:00Z",
    user: {
      id: 106,
      name: "Lucía Fernández"
    },
    admin: {
      id: 201,
      name: "Admin Principal"
    }
  },
  {
    id: 7,
    userId: 107,
    title: "Solicitud de nueva función de comparación",
    description: "Sería muy útil poder comparar varios productos lado a lado. Muchos otros sitios de e-commerce ofrecen esta función y realmente ayuda a tomar decisiones informadas.",
    type: "feature",
    status: "approved",
    adminNotes: "Excelente idea, incluida en el roadmap para el próximo trimestre.",
    reviewedBy: 203,
    reviewedAt: "2023-11-06T13:45:00Z",
    createdAt: "2023-11-04T18:30:00Z",
    updatedAt: "2023-11-06T13:45:00Z",
    user: {
      id: 107,
      name: "David López"
    },
    admin: {
      id: 203,
      name: "Admin Producto"
    }
  },
  {
    id: 8,
    userId: 108,
    sellerId: 4,
    title: "Problema con cupones de descuento",
    description: "Los cupones de descuento no se aplican correctamente cuando el carrito tiene productos de múltiples vendedores. El sistema muestra un error y no permite completar la compra.",
    type: "bug",
    status: "pending",
    createdAt: "2023-11-05T20:15:00Z",
    updatedAt: "2023-11-05T20:15:00Z",
    user: {
      id: 108,
      name: "Elena Gómez"
    }
  }
];

// Mapeo de estado para feedback
const feedbackStatusMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  pending: { 
    label: "Pendiente", 
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: <Clock className="w-3 h-3 mr-1" />
  },
  approved: { 
    label: "Aprobado", 
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: <CheckCircle className="w-3 h-3 mr-1" />
  },
  rejected: { 
    label: "Rechazado", 
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <XCircle className="w-3 h-3 mr-1" />
  }
};

// Mapeo de tipo de feedback
const feedbackTypeMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  improvement: { 
    label: "Mejora", 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: <Tag className="w-3 h-3 mr-1" />
  },
  bug: { 
    label: "Error", 
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: <AlertTriangle className="w-3 h-3 mr-1" />
  },
  feature: { 
    label: "Función", 
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: <Tag className="w-3 h-3 mr-1" />
  },
  complaint: { 
    label: "Queja", 
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    icon: <Flag className="w-3 h-3 mr-1" />
  },
  other: { 
    label: "Otro", 
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    icon: <MessageSquare className="w-3 h-3 mr-1" />
  }
};

const AdminFeedbackPage: React.FC = () => {
	const [feedback, setFeedback] = useState<Feedback[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [dateRangeFilter, setDateRangeFilter] = useState<{
		from: string;
		to: string;
	}>({
		from: "",
		to: "",
	});
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});
	const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
		null
	);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [adminNote, setAdminNote] = useState("");
	const [generateDiscountCode, setGenerateDiscountCode] = useState(false);
	const [discountPercentage, setDiscountPercentage] = useState(10); // Valor por defecto: 10%

	// Cargar datos de feedback
	useEffect(() => {
		const fetchFeedback = () => {
			setLoading(true);
			// Simulación de llamada a API
			setTimeout(() => {
				setFeedback(mockFeedback);
				setPagination({
					currentPage: 1,
					totalPages: 1,
					totalItems: mockFeedback.length,
					itemsPerPage: 10,
				});
				setLoading(false);
			}, 500);
		};

		fetchFeedback();
	}, []);

	// Filtrar feedback
	const filteredFeedback = feedback.filter((item) => {
		// Filtro por estado
		const matchesStatus =
			statusFilter === "all" || item.status === statusFilter;

		// Filtro por tipo
		const matchesType = typeFilter === "all" || item.type === typeFilter;

		// Filtro por rango de fechas
		let matchesDateRange = true;
		if (dateRangeFilter.from) {
			const feedbackDate = new Date(item.createdAt || "");
			const fromDate = new Date(dateRangeFilter.from);
			matchesDateRange = feedbackDate >= fromDate;
		}
		if (dateRangeFilter.to && matchesDateRange) {
			const feedbackDate = new Date(item.createdAt || "");
			const toDate = new Date(dateRangeFilter.to);
			// Ajustar a final del día
			toDate.setHours(23, 59, 59, 999);
			matchesDateRange = feedbackDate <= toDate;
		}

		return matchesStatus && matchesType && matchesDateRange;
	});

	// Abrir modal de feedback
	const openFeedbackModal = (item: Feedback) => {
		setSelectedFeedback(item);
		setAdminNote(item.adminNotes || "");
		setGenerateDiscountCode(false);
		setDiscountPercentage(10);
		setShowFeedbackModal(true);
	};

	// Cerrar modal de feedback
	const closeFeedbackModal = () => {
		setSelectedFeedback(null);
		setShowFeedbackModal(false);
		setAdminNote("");
		setGenerateDiscountCode(false);
		setDiscountPercentage(10);
	};

	// Aprobar feedback
	const approveFeedback = (feedbackId: number) => {
		if (selectedFeedback) {
			if (!adminNote) {
				alert(
					"Por favor, proporciona una nota de administrador para la aprobación."
				);
				return;
			}

			// En un caso real, aquí enviarías la solicitud al servidor con el código de descuento si está seleccionado
			const approvalData = {
				id: feedbackId,
				status: "approved",
				adminNotes: adminNote,
				generateDiscountCode,
				discountPercentage: generateDiscountCode
					? discountPercentage
					: undefined,
			};

			console.log("Datos de aprobación:", approvalData);

			closeFeedbackModal();
		}

		// Actualizar el estado local
		setFeedback((prevFeedback) =>
			prevFeedback.map((item) => {
				if (item.id === feedbackId) {
					return {
						...item,
						status: "approved",
						adminNotes: adminNote,
						reviewedBy: 201, // ID del admin actual (en un caso real vendría del contexto)
						reviewedAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};
				}
				return item;
			})
		);

		// Mostrar mensaje de aprobación
		let message = `Feedback #${feedbackId} aprobado correctamente.`;
		if (generateDiscountCode) {
			message += ` Se ha generado un código de descuento del ${discountPercentage}% para el usuario.`;
		}

		alert(message);
	};

	// Rechazar feedback
	const rejectFeedback = (feedbackId: number) => {
		if (selectedFeedback) {
			if (!adminNote) {
				alert(
					"Por favor, proporciona una nota de administrador para el rechazo."
				);
				return;
			}

			closeFeedbackModal();
		}

		// Actualizar el estado local
		setFeedback((prevFeedback) =>
			prevFeedback.map((item) => {
				if (item.id === feedbackId) {
					return {
						...item,
						status: "rejected",
						adminNotes: adminNote,
						reviewedBy: 201, // ID del admin actual (en un caso real vendría del contexto)
						reviewedAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					};
				}
				return item;
			})
		);

		alert(`Feedback #${feedbackId} rechazado.`);
	};

	// Reportar como inapropiado
	const reportFeedback = (feedbackId: number) => {
		alert(
			`El feedback #${feedbackId} ha sido reportado para revisión adicional.`
		);
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
			key: "user",
			header: "Usuario",
			sortable: true,
			render: (feedback: Feedback) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
						<User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
					</div>
					<div className="ml-3">
						<div className="text-sm font-medium text-gray-900 dark:text-white">
							{feedback.user?.name || `Usuario #${feedback.userId}`}
						</div>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							ID: {feedback.userId}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "seller",
			header: "Vendedor",
			sortable: true,
			render: (feedback: Feedback) => {
				if (feedback.sellerId && feedback.seller) {
					return (
						<Link
							to={`/admin/sellers/${feedback.sellerId}`}
							className="flex items-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
						>
							<Store className="h-4 w-4 mr-1" />
							{feedback.seller.storeName}
						</Link>
					);
				}
				return <span className="text-gray-500 dark:text-gray-400">N/A</span>;
			},
		},
		{
			key: "type",
			header: "Tipo",
			sortable: true,
			render: (feedback: Feedback) => {
				const type = feedbackTypeMap[feedback.type] || {
					label: feedback.type,
					color:
						"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
					icon: <AlertTriangle className="w-3 h-3 mr-1" />,
				};

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type.color}`}
					>
						{type.icon}
						{type.label}
					</span>
				);
			},
		},
		{
			key: "title",
			header: "Título",
			sortable: true,
			render: (feedback: Feedback) => (
				<div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
					{feedback.title}
				</div>
			),
		},
		{
			key: "date",
			header: "Fecha",
			sortable: true,
			render: (feedback: Feedback) => (
				<div className="text-xs text-gray-500 dark:text-gray-400">
					{formatDate(feedback.createdAt)}
					{feedback.reviewedAt && (
						<div>Revisado: {formatDate(feedback.reviewedAt)}</div>
					)}
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (feedback: Feedback) => {
				const status = feedbackStatusMap[feedback.status] || {
					label: feedback.status,
					color:
						"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
					icon: <AlertTriangle className="w-3 h-3 mr-1" />,
				};

				return (
					<span
						className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
					>
						{status.icon}
						{status.label}
					</span>
				);
			},
		},
		{
			key: "actions",
			header: "Acciones",
			render: (feedback: Feedback) => {
				return (
					<div className="flex justify-end space-x-2">
						{/* Ver detalles */}
						<button
							onClick={() => openFeedbackModal(feedback)}
							className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
							title="Ver detalles"
						>
							<Eye size={18} />
						</button>

						{/* Aprobar feedback (si está pendiente) */}
						{feedback.status === "pending" && (
							<button
								onClick={() => approveFeedback(feedback.id || 0)}
								className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
								title="Aprobar feedback"
							>
								<CheckCircle size={18} />
							</button>
						)}

						{/* Rechazar feedback (si está pendiente) */}
						{feedback.status === "pending" && (
							<button
								onClick={() => rejectFeedback(feedback.id || 0)}
								className="p-1 text-red-600 hover:bg-red-100 rounded-md dark:text-red-400 dark:hover:bg-red-900"
								title="Rechazar feedback"
							>
								<XCircle size={18} />
							</button>
						)}

						{/* Reportar feedback */}
						<button
							onClick={() => reportFeedback(feedback.id || 0)}
							className="p-1 text-orange-600 hover:bg-orange-100 rounded-md dark:text-orange-400 dark:hover:bg-orange-900"
							title="Reportar feedback"
						>
							<Flag size={18} />
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Gestión de Feedback y Comentarios
				</h1>
				<div className="flex space-x-2">
					<Link
						to="/admin/feedback/dashboard"
						className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
					>
						<BarChart2 size={18} className="inline mr-2" />
						Estadísticas
					</Link>
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
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">
								Total
							</h3>
							<MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
						<p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
							{feedback.length}
						</p>
						<p className="text-sm text-blue-700 dark:text-blue-300">
							Comentarios y sugerencias
						</p>
					</div>

					<div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
								Pendientes
							</h3>
							<Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
						</div>
						<p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
							{feedback.filter((f) => f.status === "pending").length}
						</p>
						<p className="text-sm text-yellow-700 dark:text-yellow-300">
							Esperando revisión
						</p>
					</div>

					<div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-green-800 dark:text-green-200">
								Aprobados
							</h3>
							<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
						<p className="text-2xl font-bold text-green-900 dark:text-green-100">
							{feedback.filter((f) => f.status === "approved").length}
						</p>
						<p className="text-sm text-green-700 dark:text-green-300">
							Implementados o en proceso
						</p>
					</div>

					<div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-medium text-red-800 dark:text-red-200">
								Rechazados
							</h3>
							<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
						</div>
						<p className="text-2xl font-bold text-red-900 dark:text-red-100">
							{feedback.filter((f) => f.status === "rejected").length}
						</p>
						<p className="text-sm text-red-700 dark:text-red-300">
							No considerados
						</p>
					</div>
				</div>
			</div>

			{/* Filtros */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Filtro de Estado */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los Estados</option>
							<option value="pending">Pendientes</option>
							<option value="approved">Aprobados</option>
							<option value="rejected">Rechazados</option>
						</select>
					</div>

					{/* Filtro de Tipo */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
						>
							<option value="all">Todos los Tipos</option>
							<option value="improvement">Mejoras</option>
							<option value="bug">Errores</option>
							<option value="feature">Nuevas Funciones</option>
							<option value="complaint">Quejas</option>
							<option value="other">Otros</option>
						</select>
					</div>

					{/* Filtro de Fecha */}
					<div className="flex items-center space-x-2">
						<Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<input
							type="date"
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={dateRangeFilter.from}
							onChange={(e) =>
								setDateRangeFilter({...dateRangeFilter, from: e.target.value})
							}
							placeholder="Desde"
						/>
						<input
							type="date"
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={dateRangeFilter.to}
							onChange={(e) =>
								setDateRangeFilter({...dateRangeFilter, to: e.target.value})
							}
							placeholder="Hasta"
						/>
					</div>
				</div>
			</div>

			{/* Tabla de Feedback */}
			<Table
				data={filteredFeedback}
				columns={columns}
				searchFields={["title", "description"]}
				loading={loading}
				emptyMessage="No se encontraron comentarios o sugerencias"
				pagination={{
					currentPage: pagination.currentPage,
					totalPages: pagination.totalPages,
					totalItems: pagination.totalItems,
					itemsPerPage: pagination.itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>

			{/* Modal de Detalle de Feedback */}
			{showFeedbackModal && selectedFeedback && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
						<div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
							<h3 className="text-lg font-medium text-gray-900 dark:text-white">
								Detalles de Feedback
							</h3>
							<button
								onClick={closeFeedbackModal}
								className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
							>
								<XCircle className="h-5 w-5" />
							</button>
						</div>
						<div className="p-6">
							{/* Información de Usuario */}
							<div className="mb-6">
								<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
									Usuario
								</h4>
								<div className="flex items-center">
									<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
										<User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
									</div>
									<div className="ml-4">
										<div className="text-sm font-medium text-gray-900 dark:text-white">
											{selectedFeedback.user?.name ||
												`Usuario #${selectedFeedback.userId}`}
										</div>
										<div className="text-xs text-gray-500 dark:text-gray-400">
											ID: {selectedFeedback.userId}
										</div>
									</div>
								</div>
							</div>

							{/* Información del Feedback */}
							<div className="mb-6">
								<div className="flex justify-between items-start mb-2">
									<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Detalles
									</h4>
									<div>
										{(() => {
											const type = feedbackTypeMap[selectedFeedback.type] || {
												label: selectedFeedback.type,
												color:
													"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
												icon: <AlertTriangle className="w-4 h-4 mr-1" />,
											};

											return (
												<span
													className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${type.color}`}
												>
													{type.icon}
													{type.label}
												</span>
											);
										})()}
									</div>
								</div>
								<div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
									{selectedFeedback.title}
								</div>
								<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-gray-800 dark:text-gray-200 mb-2 whitespace-pre-wrap">
									{selectedFeedback.description}
								</div>
								<div className="text-sm text-gray-500 dark:text-gray-400">
									<div>Enviado: {formatDate(selectedFeedback.createdAt)}</div>
									{selectedFeedback.updatedAt !==
										selectedFeedback.createdAt && (
										<div>
											Actualizado: {formatDate(selectedFeedback.updatedAt)}
										</div>
									)}
								</div>
							</div>

							{/* Si es una queja sobre un vendedor, mostrar información del vendedor */}
							{selectedFeedback.sellerId && selectedFeedback.seller && (
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
										Vendedor Relacionado
									</h4>
									<div className="flex items-center">
										<Store className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
										<Link
											to={`/admin/sellers/${selectedFeedback.sellerId}`}
											className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
										>
											{selectedFeedback.seller.storeName}
										</Link>
									</div>
								</div>
							)}

							{/* Estado Actual */}
							<div className="mb-6">
								<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
									Estado Actual
								</h4>
								<div className="flex items-center">
									{(() => {
										const status = feedbackStatusMap[
											selectedFeedback.status
										] || {
											label: selectedFeedback.status,
											color:
												"bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
											icon: <AlertTriangle className="w-4 h-4 mr-1" />,
										};

										return (
											<span
												className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
											>
												{status.icon}
												{status.label}
											</span>
										);
									})()}
								</div>
							</div>

							{/* Notas de Administración existentes */}
							{selectedFeedback.adminNotes && (
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
										Notas de Administración
									</h4>
									<div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-gray-200 mb-2">
										{selectedFeedback.adminNotes}
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">
										{selectedFeedback.admin && (
											<span>Por: {selectedFeedback.admin.name}</span>
										)}
										{selectedFeedback.reviewedAt && (
											<span className="ml-2">
												({formatDate(selectedFeedback.reviewedAt)})
											</span>
										)}
									</div>
								</div>
							)}

							{/* Acciones de Administración */}
							{selectedFeedback.status === "pending" && (
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
										Revisión de Administrador
									</h4>

									<div className="mb-4">
										<label
											htmlFor="adminNote"
											className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
										>
											Nota de Administrador (obligatoria)
										</label>
										<textarea
											id="adminNote"
											rows={3}
											className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
											placeholder="Notas adicionales o respuesta al usuario..."
											value={adminNote}
											onChange={(e) => setAdminNote(e.target.value)}
										></textarea>
									</div>

									{/* Opción de código de descuento (solo para aprobación) */}
									<div className="mb-4">
										<div className="flex items-center mb-2">
											<input
												id="generateDiscount"
												type="checkbox"
												className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
												checked={generateDiscountCode}
												onChange={(e) =>
													setGenerateDiscountCode(e.target.checked)
												}
											/>
											<label
												htmlFor="generateDiscount"
												className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
											>
												Generar código de descuento para el usuario
											</label>
										</div>

										{generateDiscountCode && (
											<div className="ml-6">
												<label
													htmlFor="discountPercentage"
													className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
												>
													Porcentaje de descuento
												</label>
												<div className="flex items-center">
													<input
														type="range"
														id="discountPercentage"
														min="5"
														max="50"
														step="5"
														value={discountPercentage}
														onChange={(e) =>
															setDiscountPercentage(parseInt(e.target.value))
														}
														className="mr-3 w-40"
													/>
													<span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10">
														{discountPercentage}%
													</span>
												</div>
											</div>
										)}
									</div>

									<div className="flex space-x-2">
										<button
											onClick={() => approveFeedback(selectedFeedback.id || 0)}
											className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
											disabled={!adminNote}
										>
											<CheckCircle size={18} className="mr-2" />
											Aprobar
										</button>
										<button
											onClick={() => rejectFeedback(selectedFeedback.id || 0)}
											className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
											disabled={!adminNote}
										>
											<XCircle size={18} className="mr-2" />
											Rechazar
										</button>
									</div>
								</div>
							)}

							{/* Enlaces rápidos (según el tipo de feedback) */}
							<div>
								<h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
									Enlaces Rápidos
								</h4>
								<div className="flex flex-wrap gap-2">
									{selectedFeedback.sellerId && (
										<Link
											to={`/admin/sellers/${selectedFeedback.sellerId}`}
											className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm"
										>
											<Store className="w-4 h-4 mr-1" />
											Perfil del Vendedor
										</Link>
									)}

									<Link
										to={`/admin/users/${selectedFeedback.userId}`}
										className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm"
									>
										<User className="w-4 h-4 mr-1" />
										Ver Usuario
									</Link>

									{selectedFeedback.type === "bug" && (
										<Link
											to="/admin/bugs"
											className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full text-sm"
										>
											<AlertTriangle className="w-4 h-4 mr-1" />
											Lista de Errores
										</Link>
									)}

									{selectedFeedback.type === "feature" && (
										<Link
											to="/admin/roadmap"
											className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm"
										>
											<Tag className="w-4 h-4 mr-1" />
											Roadmap de Funciones
										</Link>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminFeedbackPage;