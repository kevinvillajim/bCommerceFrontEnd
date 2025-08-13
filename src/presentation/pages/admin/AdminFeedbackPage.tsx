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
  Tag,
  Store,
  Gift,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCardList from "../../components/dashboard/StatCardList";
import ApiClient from "../../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../../constants/apiEndpoints";

interface User {
  id: number;
  name: string;
  email?: string;
}

interface Seller {
  id: number;
  store_name: string;
  user_id: number;
}

interface Admin {
  id: number;
  name: string;
}

interface Feedback {
  id: number;
  user_id: number;
  seller_id?: number;
  title: string;
  description: string;
  type: 'bug' | 'improvement' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  seller?: Seller;
  admin?: Admin;
  discount_code?: {
    code: string;
    discount_percentage: number;
    expires_at: string;
  };
  seller_featured?: {
    featured_at: string;
    featured_expires_at: string;
    featured_days: number;
    is_active: boolean;
  };
}

// Mapeo de estado para feedback
const feedbackStatusMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  pending: { 
    label: "Pendiente", 
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="w-3 h-3 mr-1" />
  },
  approved: { 
    label: "Aprobado", 
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-3 h-3 mr-1" />
  },
  rejected: { 
    label: "Rechazado", 
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-3 h-3 mr-1" />
  }
};

// Mapeo de tipo de feedback
const feedbackTypeMap: Record<string, { label: string, color: string, icon: React.ReactNode }> = {
  improvement: { 
    label: "Mejora", 
    color: "bg-blue-100 text-blue-800",
    icon: <Tag className="w-3 h-3 mr-1" />
  },
  bug: { 
    label: "Error/Bug", 
    color: "bg-red-100 text-red-800",
    icon: <AlertTriangle className="w-3 h-3 mr-1" />
  },
  other: { 
    label: "Otro", 
    color: "bg-gray-100 text-gray-800",
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
	const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
	const [showFeedbackModal, setShowFeedbackModal] = useState(false);
	const [adminNote, setAdminNote] = useState("");
	const [generateDiscountCode, setGenerateDiscountCode] = useState(true);
	const [validityDays, setValidityDays] = useState(30);
	const [isProcessing, setIsProcessing] = useState(false);

	// Cargar datos de feedback
	useEffect(() => {
		fetchFeedback();
	}, [pagination.currentPage, statusFilter, typeFilter, dateRangeFilter]);

	const fetchFeedback = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams({
				limit: pagination.itemsPerPage.toString(),
				offset: ((pagination.currentPage - 1) * pagination.itemsPerPage).toString()
			});

			// Aplicar filtros
			if (statusFilter !== 'all') {
				params.append('status', statusFilter);
			}
			if (typeFilter !== 'all') {
				params.append('type', typeFilter);
			}
			if (dateRangeFilter.from) {
				params.append('from_date', dateRangeFilter.from);
			}
			if (dateRangeFilter.to) {
				params.append('to_date', dateRangeFilter.to);
			}

			const response = await ApiClient.get(`${API_ENDPOINTS.ADMIN.PENDING_FEEDBACK}?${params.toString()}`) as {
				status: string;
				data: Feedback[];
				meta?: { total: number };
			};
			
			if (response.status === 'success') {
				setFeedback(response.data || []);
				setPagination(prev => ({
					...prev,
					totalItems: response.meta?.total || 0,
					totalPages: Math.ceil((response.meta?.total || 0) / pagination.itemsPerPage)
				}));
			}
		} catch (error) {
			console.error('Error fetching feedback:', error);
			setFeedback([]);
		} finally {
			setLoading(false);
		}
	};

	// ✅ El filtrado ahora se hace en el backend, no necesitamos filtrar en el frontend
	const filteredFeedback = feedback;

	// Abrir modal de feedback
	const openFeedbackModal = (item: Feedback) => {
		setSelectedFeedback(item);
		setAdminNote(item.admin_notes || "");
		setGenerateDiscountCode(true);
		setValidityDays(30);
		setShowFeedbackModal(true);
	};

	// Cerrar modal de feedback
	const closeFeedbackModal = () => {
		setSelectedFeedback(null);
		setShowFeedbackModal(false);
		setAdminNote("");
		setGenerateDiscountCode(true);
		setValidityDays(30);
		setIsProcessing(false);
	};

	// Aprobar feedback
	const approveFeedback = async (feedbackId: number) => {
		if (!adminNote.trim()) {
			alert("Por favor, proporciona una nota de administrador para la aprobación.");
			return;
		}

		try {
			setIsProcessing(true);
			
			const approvalData = {
				status: 'approved',
				admin_notes: adminNote,
				generate_discount: generateDiscountCode,
				validity_days: generateDiscountCode ? validityDays : undefined
			};

			const response = await ApiClient.post(
				`${API_ENDPOINTS.ADMIN.REVIEW_FEEDBACK(feedbackId)}`,
				approvalData
			) as {
				status: string;
				data?: {
					discount_code?: { code: string; discount_percentage: number; expires_at: string };
					seller_featured?: { featured_at: string; featured_expires_at: string; featured_days: number; is_active: boolean };
				};
				message?: string;
			};

			if (response.status === 'success') {
				// Actualizar lista local
				setFeedback((prevFeedback) =>
					prevFeedback.map((item) => {
						if (item.id === feedbackId) {
							return {
								...item,
								status: "approved" as const,
								admin_notes: adminNote,
								reviewed_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
								discount_code: response.data?.discount_code,
								seller_featured: response.data?.seller_featured
							};
						}
						return item;
					})
				);

				// Mostrar mensaje de éxito
				let message = `Feedback #${feedbackId} aprobado correctamente.`;
				if (response.data?.discount_code && !selectedFeedback?.seller_id) {
					message += ` Se ha generado el código de descuento '${response.data.discount_code.code}' para el usuario.`;
				}
				if (response.data?.seller_featured && selectedFeedback?.seller_id) {
					message += ` La tienda ha sido destacada por 15 días.`;
				}

				alert(message);
				closeFeedbackModal();
				
				// Recargar datos
				await fetchFeedback();
			} else {
				alert(response.message || 'Error al aprobar feedback');
			}
		} catch (error: any) {
			console.error('Error approving feedback:', error);
			const errorMessage = error.response?.data?.message || error.message || 'Error al aprobar feedback';
			alert(errorMessage);
		} finally {
			setIsProcessing(false);
		}
	};

	// Rechazar feedback
	const rejectFeedback = async (feedbackId: number) => {
		if (!adminNote.trim()) {
			alert("Por favor, proporciona una nota de administrador para el rechazo.");
			return;
		}

		try {
			setIsProcessing(true);
			
			const rejectionData = {
				status: 'rejected',
				admin_notes: adminNote
			};

			const response = await ApiClient.post(
				`${API_ENDPOINTS.ADMIN.REVIEW_FEEDBACK(feedbackId)}`,
				rejectionData
			) as {
				status: string;
				message?: string;
			};

			if (response.status === 'success') {
				// Actualizar lista local
				setFeedback((prevFeedback) =>
					prevFeedback.map((item) => {
						if (item.id === feedbackId) {
							return {
								...item,
								status: "rejected" as const,
								admin_notes: adminNote,
								reviewed_at: new Date().toISOString(),
								updated_at: new Date().toISOString(),
							};
						}
						return item;
					})
				);

				alert(`Feedback #${feedbackId} rechazado.`);
				closeFeedbackModal();
				
				// Recargar datos
				await fetchFeedback();
			} else {
				alert(response.message || 'Error al rechazar feedback');
			}
		} catch (error: any) {
			console.error('Error rejecting feedback:', error);
			const errorMessage = error.response?.data?.message || error.message || 'Error al rechazar feedback';
			alert(errorMessage);
		} finally {
			setIsProcessing(false);
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

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
	};

	// Refrescar datos
	const refreshData = async () => {
		await fetchFeedback();
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "user",
			header: "Usuario",
			sortable: true,
			render: (feedback: Feedback) => (
				<div className="flex items-center">
					<div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
						<User className="h-4 w-4 text-gray-500" />
					</div>
					<div className="ml-3">
						<div className="text-sm font-medium text-gray-900">
							{feedback.user?.name || `Usuario #${feedback.user_id}`}
						</div>
						<div className="text-xs text-gray-500">
							ID: {feedback.user_id}
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
				if (feedback.seller_id && feedback.seller) {
					return (
						<Link
							to={`/admin/sellers/${feedback.seller_id}`}
							className="flex items-center text-primary-600 hover:text-primary-800"
						>
							<Store className="h-4 w-4 mr-1" />
							{feedback.seller.store_name}
						</Link>
					);
				}
				return <span className="text-gray-500">N/A</span>;
			},
		},
		{
			key: "type",
			header: "Tipo",
			sortable: true,
			render: (feedback: Feedback) => {
				const type = feedbackTypeMap[feedback.type] || {
					label: feedback.type,
					color: "bg-gray-100 text-gray-800",
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
				<div className="text-sm font-medium text-gray-900 line-clamp-2">
					{feedback.title}
				</div>
			),
		},
		{
			key: "date",
			header: "Fecha",
			sortable: true,
			render: (feedback: Feedback) => (
				<div className="text-xs text-gray-500">
					{formatDate(feedback.created_at)}
					{feedback.reviewed_at && (
						<div>Revisado: {formatDate(feedback.reviewed_at)}</div>
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
					color: "bg-gray-100 text-gray-800",
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
							className="p-1 text-blue-600 hover:bg-blue-100 rounded-md"
							title="Ver detalles"
						>
							<Eye size={18} />
						</button>

						{/* Solo mostrar botones para feedback pendiente */}
						{feedback.status === "pending" && (
							<>
								<button
									onClick={() => openFeedbackModal(feedback)}
									className="p-1 text-green-600 hover:bg-green-100 rounded-md"
									title="Revisar y aprobar"
								>
									<CheckCircle size={18} />
								</button>
								<button
									onClick={() => openFeedbackModal(feedback)}
									className="p-1 text-red-600 hover:bg-red-100 rounded-md"
									title="Revisar y rechazar"
								>
									<XCircle size={18} />
								</button>
							</>
						)}

						{/* Mostrar recompensas si está aprobado */}
						{feedback.status === "approved" && (
							<>
								{feedback.discount_code && (
									<div className="p-1 text-blue-600" title="Cupón generado">
										<Gift size={18} />
									</div>
								)}
								{feedback.seller_featured && (
									<div className="p-1 text-yellow-600" title="Tienda destacada">
										<Star size={18} />
									</div>
								)}
							</>
						)}
					</div>
				);
			},
		},
	];

	// ✅ Estadísticas basadas en los datos actuales (pueden estar filtrados)
	const statItems = [
		{
		  title: "Total",
		  value: feedback.length,
		  description: statusFilter !== "all" || typeFilter !== "all" || dateRangeFilter.from || dateRangeFilter.to 
		    ? "En filtros aplicados" 
		    : "Comentarios y sugerencias",
		  icon: MessageSquare,
		  bgColor: "bg-blue-50/20",
		  textColor: "text-blue-800",
		  valueColor: "text-blue-900",
		  descriptionColor: "text-blue-700",
		  iconColor: "text-blue-600",
		},
		{
		  title: "Pendientes",
		  value: feedback.filter((f) => f.status === "pending").length,
		  description: "Esperando revisión",
		  icon: Clock,
		  bgColor: "bg-yellow-50/20",
		  textColor: "text-yellow-800",
		  valueColor: "text-yellow-900",
		  descriptionColor: "text-yellow-700",
		  iconColor: "text-yellow-600",
		},
		{
		  title: "Aprobados",
		  value: feedback.filter((f) => f.status === "approved").length,
		  description: "Implementados o en proceso",
		  icon: CheckCircle,
		  bgColor: "bg-green-50/20",
		  textColor: "text-green-800",
		  valueColor: "text-green-900",
		  descriptionColor: "text-green-700",
		  iconColor: "text-green-600",
		},
		{
		  title: "Rechazados",
		  value: feedback.filter((f) => f.status === "rejected").length,
		  description: "No considerados",
		  icon: XCircle,
		  bgColor: "bg-red-50/20",
		  textColor: "text-red-800",
		  valueColor: "text-red-900",
		  descriptionColor: "text-red-700",
		  iconColor: "text-red-600",
		},
	  ];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
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
						disabled={loading}
					>
						<RefreshCw size={18} className={`inline mr-2 ${loading ? 'animate-spin' : ''}`} />
						Actualizar
					</button>
				</div>
			</div>
			
			{/* StatCards */}
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
							<option value="pending">Pendientes</option>
							<option value="approved">Aprobados</option>
							<option value="rejected">Rechazados</option>
						</select>
					</div>

					{/* Filtro de Tipo */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value)}
						>
							<option value="all">Todos los Tipos</option>
							<option value="improvement">Mejoras</option>
							<option value="bug">Errores/Bugs</option>
							<option value="other">Otros</option>
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
					<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
						<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
							<h3 className="text-lg font-medium text-gray-900">
								Detalles de Feedback #{selectedFeedback.id}
							</h3>
							<button
								onClick={closeFeedbackModal}
								className="text-gray-400 hover:text-gray-500"
							>
								<XCircle className="h-5 w-5" />
							</button>
						</div>
						<div className="p-6">
							{/* Información de Usuario */}
							<div className="mb-6">
								<h4 className="text-sm font-medium text-gray-500 mb-2">Usuario</h4>
								<div className="flex items-center">
									<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
										<User className="h-6 w-6 text-gray-500" />
									</div>
									<div className="ml-4">
										<div className="text-sm font-medium text-gray-900">
											{selectedFeedback.user?.name || `Usuario #${selectedFeedback.user_id}`}
										</div>
										<div className="text-xs text-gray-500">
											ID: {selectedFeedback.user_id}
										</div>
									</div>
								</div>
							</div>

							{/* Si es de un seller, mostrar información del seller */}
							{selectedFeedback.seller_id && selectedFeedback.seller && (
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-500 mb-2">Vendedor</h4>
									<div className="flex items-center">
										<Store className="h-5 w-5 text-gray-500 mr-2" />
										<Link
											to={`/admin/sellers/${selectedFeedback.seller_id}`}
											className="text-primary-600 hover:text-primary-800"
										>
											{selectedFeedback.seller.store_name}
										</Link>
									</div>
								</div>
							)}

							{/* Información del Feedback */}
							<div className="mb-6">
								<div className="flex justify-between items-start mb-2">
									<h4 className="text-sm font-medium text-gray-500">Detalles</h4>
									<div>
										{(() => {
											const type = feedbackTypeMap[selectedFeedback.type] || {
												label: selectedFeedback.type,
												color: "bg-gray-100 text-gray-800",
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
								<div className="text-lg font-medium text-gray-900 mb-2">
									{selectedFeedback.title}
								</div>
								<div className="bg-gray-50 p-4 rounded-lg text-gray-800 mb-2 whitespace-pre-wrap">
									{selectedFeedback.description}
								</div>
								<div className="text-sm text-gray-500">
									<div>Enviado: {formatDate(selectedFeedback.created_at)}</div>
									{selectedFeedback.updated_at !== selectedFeedback.created_at && (
										<div>Actualizado: {formatDate(selectedFeedback.updated_at)}</div>
									)}
								</div>
							</div>

							{/* Estado Actual */}
							<div className="mb-6">
								<h4 className="text-sm font-medium text-gray-500 mb-2">Estado Actual</h4>
								<div className="flex items-center">
									{(() => {
										const status = feedbackStatusMap[selectedFeedback.status] || {
											label: selectedFeedback.status,
											color: "bg-gray-100 text-gray-800",
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
							{selectedFeedback.admin_notes && (
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-500 mb-2">Notas de Administración</h4>
									<div className="bg-gray-50 p-3 rounded-lg text-gray-800 mb-2">
										{selectedFeedback.admin_notes}
									</div>
									{selectedFeedback.reviewed_at && (
										<div className="text-sm text-gray-500">
											Revisado: {formatDate(selectedFeedback.reviewed_at)}
										</div>
									)}
								</div>
							)}

							{/* Información de recompensas si está aprobado */}
							{selectedFeedback.status === "approved" && (
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-500 mb-2">Recompensas Otorgadas</h4>
									
									{selectedFeedback.discount_code && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
											<div className="flex items-center gap-2 mb-2">
												<Gift className="w-4 h-4 text-blue-600" />
												<h6 className="font-medium text-blue-900 text-sm">Código de Descuento Generado</h6>
											</div>
											<div className="grid grid-cols-2 gap-2 text-xs">
												<div>
													<span className="text-blue-700 font-medium">Código:</span>
													<p className="font-bold text-blue-900">{selectedFeedback.discount_code.code}</p>
												</div>
												<div>
													<span className="text-blue-700 font-medium">Descuento:</span>
													<p className="font-bold text-blue-900">{selectedFeedback.discount_code.discount_percentage}%</p>
												</div>
											</div>
										</div>
									)}

									{selectedFeedback.seller_featured && (
										<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
											<div className="flex items-center gap-2 mb-2">
												<Star className="w-4 h-4 text-yellow-600" />
												<h6 className="font-medium text-yellow-900 text-sm">Tienda Destacada Activada</h6>
											</div>
											<div className="grid grid-cols-3 gap-2 text-xs">
												<div>
													<span className="text-yellow-700 font-medium">Activada:</span>
													<p className="font-bold text-yellow-900">{formatDate(selectedFeedback.seller_featured.featured_at)}</p>
												</div>
												<div>
													<span className="text-yellow-700 font-medium">Duración:</span>
													<p className="font-bold text-yellow-900">{selectedFeedback.seller_featured.featured_days} días</p>
												</div>
												<div>
													<span className="text-yellow-700 font-medium">Válido hasta:</span>
													<p className="text-yellow-900">{formatDate(selectedFeedback.seller_featured.featured_expires_at)}</p>
												</div>
											</div>
											{selectedFeedback.seller_featured.is_active ? (
												<p className="text-yellow-600 text-xs mt-1 font-medium">✨ Tienda actualmente destacada</p>
											) : (
												<p className="text-gray-600 text-xs mt-1 font-medium">⏰ Destacado expirado</p>
											)}
										</div>
									)}
								</div>
							)}

							{/* Acciones de Administración */}
							{selectedFeedback.status === "pending" && (
								<div className="mb-6">
									<h4 className="text-sm font-medium text-gray-500 mb-2">Revisión de Administrador</h4>

									<div className="mb-4">
										<label htmlFor="adminNote" className="block text-sm font-medium text-gray-700 mb-1">
											Nota de Administrador (obligatoria)
										</label>
										<textarea
											id="adminNote"
											rows={3}
											className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
											placeholder="Notas adicionales o respuesta al usuario..."
											value={adminNote}
											onChange={(e) => setAdminNote(e.target.value)}
											disabled={isProcessing}
										></textarea>
									</div>

									{/* Opción de código de descuento/featured store */}
									<div className="mb-4">
										<div className="flex items-center mb-2">
											<input
												id="generateDiscount"
												type="checkbox"
												className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
												checked={generateDiscountCode}
												onChange={(e) => setGenerateDiscountCode(e.target.checked)}
												disabled={isProcessing}
											/>
											<label htmlFor="generateDiscount" className="ml-2 block text-sm text-gray-700">
												{selectedFeedback.seller_id 
													? "Activar tienda destacada por 15 días" 
													: "Generar código de descuento para el usuario"
												}
											</label>
										</div>

										{generateDiscountCode && !selectedFeedback.seller_id && (
											<div className="ml-6">
												<label htmlFor="validityDays" className="block text-sm font-medium text-gray-700 mb-1">
													Días de validez del cupón
												</label>
												<input
													type="number"
													id="validityDays"
													min="1"
													max="365"
													value={validityDays}
													onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
													className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
													disabled={isProcessing}
												/>
												<span className="ml-2 text-sm text-gray-500">días</span>
											</div>
										)}
									</div>

									<div className="flex space-x-2">
										<button
											onClick={() => approveFeedback(selectedFeedback.id || 0)}
											className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
											disabled={!adminNote.trim() || isProcessing}
										>
											<CheckCircle size={18} className="mr-2" />
											{isProcessing ? "Procesando..." : "Aprobar"}
										</button>
										<button
											onClick={() => rejectFeedback(selectedFeedback.id || 0)}
											className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
											disabled={!adminNote.trim() || isProcessing}
										>
											<XCircle size={18} className="mr-2" />
											{isProcessing ? "Procesando..." : "Rechazar"}
										</button>
									</div>
								</div>
							)}

						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminFeedbackPage;