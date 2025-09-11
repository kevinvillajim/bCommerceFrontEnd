import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
	ArrowLeft,
	User,
	Package,
	Store,
	Calendar,
	CheckCircle,
	XCircle,
	Clock,
	AlertTriangle,
	MessageSquare,
	Flag,
	Shield,
	ExternalLink,
	RefreshCw,
} from "lucide-react";

import StarRating from "../components/rating/StarRating";
import { formatDate } from "../../utils/formatters/formatDate";
import { useAuth } from "../hooks/useAuth";
import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

// Interfaces
interface RatingDetail {
	id: number;
	rating: number;
	title?: string;
	comment?: string;
	type: string;
	status: "pending" | "approved" | "rejected" | "flagged";
	user_id: number;
	seller_id?: number;
	product_id?: number;
	order_id: number;
	created_at: string;
	updated_at: string;
	is_verified_purchase?: boolean;
	user?: {
		id: number;
		name: string;
		avatar?: string;
		email?: string; // Solo para admins
	};
	seller?: {
		id: number;
		store_name: string;
		user_id?: number;
		status?: string;
	};
	product?: {
		id: number;
		name: string;
		image?: string;
		price?: number;
		status?: string;
	};
	order_details?: {
		id: number;
		order_number: string;
		status: string;
		total?: number;
		created_at: string;
	};
	seller_response?: {
		id: number;
		text: string;
		created_at: string;
	};
	// Campos específicos para admins
	user_details?: any;
	seller_details?: any;
	product_details?: any;
	status_history?: any[];
}

const RatingDetailPage: React.FC = async () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { isAdmin, isSeller } = useAuth();

	// Estados
	const [rating, setRating] = useState<RatingDetail | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [isActionsLoading, setIsActionsLoading] = useState<boolean>(false);

	// Estados para formularios (admin/seller)
	const [showReplyForm, setShowReplyForm] = useState<boolean>(false);
	const [replyText, setReplyText] = useState<string>("");
	const [showReportForm, setShowReportForm] = useState<boolean>(false);
	const [reportReason, setReportReason] = useState<string>("");

	// Cargar datos al montar el componente
	useEffect(() => {
		if (id) {
			fetchRatingDetails(parseInt(id));
		}
	}, [id]);

	// Función para obtener detalles de la valoración
	const fetchRatingDetails = async (ratingId: number) => {
		setLoading(true);
		setError(null);

		try {
			let endpoint = "";
			
			// 🔧 CORREGIDO: Determinar endpoint según el rol usando las rutas correctas
			// ✅ CORREGIDO: Verificar valor booleano, no existencia de función
			if (await isAdmin() === true) {
				endpoint = `/admin/ratings/${ratingId}`;
			} else if (await isSeller() === true) {
				endpoint = `/ratings/${ratingId}`;
			} else {
				endpoint = `/ratings/${ratingId}`;
			}

			console.log("🔍 Obteniendo detalles de valoración desde:", endpoint);

			const response = await ApiClient.get<{
				status: string;
				data: RatingDetail;
				message?: string;
			}>(endpoint);

			console.log("📦 Respuesta del servidor:", response);

			if (response.status === "success" && response.data) {
				setRating(response.data);
			} else {
				throw new Error(response.message || "Error al obtener detalles de la valoración");
			}
		} catch (err) {
			console.error("❌ Error fetching rating details:", err);
			
			// Manejo específico de errores 403 y otros códigos de estado
			if (err instanceof Error && err.message.includes('403')) {
				setError("No tienes permiso para ver esta valoración");
			} else if (err instanceof Error && err.message.includes('404')) {
				setError("La valoración no fue encontrada");
			} else {
				setError(
					err instanceof Error 
						? err.message 
						: "Error al cargar los detalles de la valoración"
				);
			}
		} finally {
			setLoading(false);
		}
	};

	// Función para responder a una valoración (solo vendedores)
	const handleReply = async () => {
		if (!rating || !replyText.trim()) return;

		setIsActionsLoading(true);
		try {
			await ApiClient.post(API_ENDPOINTS.RATINGS.REPLY, {
				rating_id: rating.id,
				reply_text: replyText.trim(),
			});

			// Recargar datos
			await fetchRatingDetails(rating.id);
			setShowReplyForm(false);
			setReplyText("");
		} catch (err) {
			console.error("Error replying to rating:", err);
			alert("Error al enviar la respuesta");
		} finally {
			setIsActionsLoading(false);
		}
	};

	// Función para reportar una valoración
	const handleReport = async () => {
		if (!rating || !reportReason.trim()) return;

		setIsActionsLoading(true);
		try {
			await ApiClient.post(API_ENDPOINTS.RATINGS.REPORT, {
				rating_id: rating.id,
				reason: reportReason.trim(),
			});

			// Recargar datos
			await fetchRatingDetails(rating.id);
			setShowReportForm(false);
			setReportReason("");
			alert("Reporte enviado correctamente");
		} catch (err) {
			console.error("Error reporting rating:", err);
			alert("Error al enviar el reporte");
		} finally {
			setIsActionsLoading(false);
		}
	};

	// Función para moderar valoración (solo admins)
	const handleModeration = async (action: "approve" | "reject" | "flag", note?: string) => {
		if (!rating) return;

		setIsActionsLoading(true);
		try {
			const endpoint = `${API_ENDPOINTS.ADMIN.RATINGS.LIST}/${rating.id}/${action}`;
			await ApiClient.post(endpoint, note ? { note } : {});

			// Recargar datos
			await fetchRatingDetails(rating.id);
		} catch (err) {
			console.error(`Error ${action}ing rating:`, err);
			alert(`Error al ${action === "approve" ? "aprobar" : action === "reject" ? "rechazar" : "marcar"} la valoración`);
		} finally {
			setIsActionsLoading(false);
		}
	};

	// Mapeo de estados para UI
	const getStatusInfo = (status: string) => {
		const statusMap = {
			pending: {
				icon: Clock,
				color: "text-yellow-600 bg-yellow-100",
				label: "Pendiente",
			},
			approved: {
				icon: CheckCircle,
				color: "text-green-600 bg-green-100",
				label: "Aprobada",
			},
			rejected: {
				icon: XCircle,
				color: "text-red-600 bg-red-100",
				label: "Rechazada",
			},
			flagged: {
				icon: AlertTriangle,
				color: "text-orange-600 bg-orange-100",
				label: "Marcada",
			},
		};

		return statusMap[status as keyof typeof statusMap] || statusMap.pending;
	};

	// ✅ CORREGIDO: Verificar permisos para mostrar acciones - valores booleanos, no funciones
	const canReply = await isSeller() === true && rating?.type === "user_to_seller" && !rating?.seller_response;
	const canReport = await isAdmin() !== true && rating;
	const canModerate = await isAdmin() === true && rating;

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
					<p className="text-gray-600">Cargando detalles de la valoración...</p>
				</div>
			</div>
		);
	}

	if (error || !rating) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center max-w-md mx-auto">
					<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Error al cargar la valoración
					</h2>
					<p className="text-gray-600 mb-4">
						{error || "No se pudo encontrar la valoración solicitada"}
					</p>
					<button
						onClick={() => navigate(-1)}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
					>
						Volver atrás
					</button>
				</div>
			</div>
		);
	}

	const statusInfo = getStatusInfo(rating.status);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 py-6">
				{/* Header con navegación */}
				<div className="flex items-center justify-between mb-6">
					<button
						onClick={() => navigate(-1)}
						className="flex items-center text-gray-600 hover:text-gray-900"
					>
						<ArrowLeft className="h-5 w-5 mr-2" />
						Volver atrás
					</button>

					{/* ✅ CORREGIDO: Verificar valor booleano */}
					{await isAdmin() === true && (
						<div className="flex items-center space-x-2">
							<Shield className="h-5 w-5 text-blue-600" />
							<span className="text-sm font-medium text-blue-600">
								Vista Administrador
							</span>
						</div>
					)}
				</div>

				{/* Contenido principal */}
				<div className="bg-white rounded-lg shadow-sm overflow-hidden">
					{/* Header de la valoración */}
					<div className="px-6 py-4 border-b border-gray-200">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									Valoración #{rating.id}
								</h1>
								<div className="flex items-center mt-2 space-x-4">
									<StarRating value={rating.rating} readOnly size="medium" />
									<span className="text-lg font-semibold">
										{rating.rating}/5
									</span>
								</div>
							</div>

							{/* Estado */}
							<div className="mt-4 sm:mt-0">
								<span
									className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
								>
									<statusInfo.icon className="h-4 w-4 mr-2" />
									{statusInfo.label}
								</span>
							</div>
						</div>

						{/* Título de la valoración */}
						{rating.title && (
							<h2 className="text-lg font-medium text-gray-900 mt-4">
								{rating.title}
							</h2>
						)}
					</div>

					{/* Contenido de la valoración */}
					<div className="px-6 py-4">
						{/* Comentario */}
						{rating.comment && (
							<div className="mb-6">
								<h3 className="text-sm font-medium text-gray-700 mb-2">
									Comentario
								</h3>
								<div className="bg-gray-50 p-4 rounded-lg">
									<p className="text-gray-800 whitespace-pre-wrap">
										{rating.comment}
									</p>
								</div>
							</div>
						)}

						{/* Información del usuario */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							<div>
								<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
									<User className="h-4 w-4 mr-2" />
									Usuario
								</h3>
								<div className="flex items-center space-x-3">
									{rating.user?.avatar ? (
										<img
											src={rating.user.avatar}
											alt={rating.user.name}
											className="w-10 h-10 rounded-full object-cover"
										/>
									) : (
										<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
											<User className="h-6 w-6 text-gray-500" />
										</div>
									)}
									<div>
										<p className="font-medium text-gray-900">
											{rating.user?.name || `Usuario #${rating.user_id}`}
										</p>
										{rating.is_verified_purchase && (
											<p className="text-sm text-green-600 flex items-center">
												<CheckCircle className="h-4 w-4 mr-1" />
												Compra verificada
											</p>
										)}
										{/* ✅ CORREGIDO: Verificar valor booleano */}
										{await isAdmin() === true && rating.user_details?.email && (
											<p className="text-sm text-gray-500">
												{rating.user_details.email}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Información del producto/vendedor */}
							<div>
								{rating.product && (
									<>
										<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
											<Package className="h-4 w-4 mr-2" />
											Producto
										</h3>
										<div className="flex items-center space-x-3">
											{rating.product.image ? (
												<img
													src={rating.product.image}
													alt={rating.product.name}
													className="w-10 h-10 rounded object-cover"
												/>
											) : (
												<div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
													<Package className="h-6 w-6 text-gray-500" />
												</div>
											)}
											<div>
												<Link
													to={`/products/${rating.product.id}`}
													className="font-medium text-primary-600 hover:text-primary-800 flex items-center"
												>
													{rating.product.name}
													<ExternalLink className="h-4 w-4 ml-1" />
												</Link>
												{/* ✅ CORREGIDO: Verificar valor booleano */}
												{await isAdmin() === true && rating.product_details?.price && (
													<p className="text-sm text-gray-500">
														${rating.product_details.price}
													</p>
												)}
											</div>
										</div>
									</>
								)}

								{rating.seller && (
									<>
										<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center mt-4">
											<Store className="h-4 w-4 mr-2" />
											Vendedor
										</h3>
										<div className="flex items-center space-x-3">
											<div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
												<Store className="h-6 w-6 text-gray-500" />
											</div>
											<div>
												<p className="font-medium text-gray-900">
													{rating.seller.store_name}
												</p>
												{/* ✅ CORREGIDO: Verificar valor booleano */}
												{await isAdmin() === true && rating.seller_details?.status && (
													<p className="text-sm text-gray-500">
														Estado: {rating.seller_details.status}
													</p>
												)}
											</div>
										</div>
									</>
								)}
							</div>
						</div>

						{/* Información de la orden */}
						{rating.order_details && (
							<div className="mb-6">
								<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
									<Calendar className="h-4 w-4 mr-2" />
									Orden
								</h3>
								<div className="bg-gray-50 p-4 rounded-lg">
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
										<div>
											<span className="text-gray-500">Número:</span>
											<p className="font-medium">#{rating.order_details.order_number}</p>
										</div>
										<div>
											<span className="text-gray-500">Estado:</span>
											<p className="font-medium">{rating.order_details.status}</p>
										</div>
										{rating.order_details.total && (
											<div>
												<span className="text-gray-500">Total:</span>
												<p className="font-medium">${rating.order_details.total}</p>
											</div>
										)}
										<div>
											<span className="text-gray-500">Fecha:</span>
											<p className="font-medium">
												{formatDate(rating.order_details.created_at)}
											</p>
										</div>
									</div>
									<Link
										to={`/orders/${rating.order_id}`}
										className="inline-flex items-center mt-3 text-primary-600 hover:text-primary-800"
									>
										Ver orden completa
										<ExternalLink className="h-4 w-4 ml-1" />
									</Link>
								</div>
							</div>
						)}

						{/* Respuesta del vendedor */}
						{rating.seller_response && (
							<div className="mb-6">
								<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
									<MessageSquare className="h-4 w-4 mr-2" />
									Respuesta del vendedor
								</h3>
								<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
									<p className="text-gray-800 mb-2">{rating.seller_response.text}</p>
									<p className="text-sm text-gray-500">
										{formatDate(rating.seller_response.created_at)}
									</p>
								</div>
							</div>
						)}

						{/* Fechas */}
						<div className="mb-6">
							<h3 className="text-sm font-medium text-gray-700 mb-3">
								Información temporal
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-500">Creada:</span>
									<p className="font-medium">{formatDate(rating.created_at)}</p>
								</div>
								{rating.updated_at !== rating.created_at && (
									<div>
										<span className="text-gray-500">Actualizada:</span>
										<p className="font-medium">{formatDate(rating.updated_at)}</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Acciones */}
					{(canReply || canReport || canModerate) && (
						<div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
							<h3 className="text-sm font-medium text-gray-700 mb-4">
								Acciones disponibles
							</h3>

							<div className="flex flex-wrap gap-3">
								{/* Responder (vendedores) */}
								{canReply && (
									<button
										onClick={() => setShowReplyForm(!showReplyForm)}
										className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
									>
										<MessageSquare className="h-4 w-4 mr-2" />
										Responder
									</button>
								)}

								{/* Reportar */}
								{canReport && (
									<button
										onClick={() => setShowReportForm(!showReportForm)}
										className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
									>
										<Flag className="h-4 w-4 mr-2" />
										Reportar
									</button>
								)}

								{/* Acciones de admin */}
								{/* ✅ CORREGIDO: Verificar valor booleano */}
								{canModerate && rating.status === "pending" && (
									<>
										<button
											onClick={() => handleModeration("approve")}
											disabled={isActionsLoading}
											className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
										>
											<CheckCircle className="h-4 w-4 mr-2" />
											Aprobar
										</button>
										<button
											onClick={() => {
												const note = prompt("Razón del rechazo (obligatorio):");
												if (note) handleModeration("reject", note);
											}}
											disabled={isActionsLoading}
											className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
										>
											<XCircle className="h-4 w-4 mr-2" />
											Rechazar
										</button>
									</>
								)}

								{/* ✅ CORREGIDO: Verificar valor booleano */}
								{canModerate && (
									<button
										onClick={() => {
											const reason = prompt("Razón para marcar:");
											if (reason) handleModeration("flag", reason);
										}}
										disabled={isActionsLoading}
										className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
									>
										<AlertTriangle className="h-4 w-4 mr-2" />
										Marcar
									</button>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Formulario de respuesta */}
				{showReplyForm && (
					<div className="mt-6 bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Responder a la valoración
						</h3>
						<textarea
							value={replyText}
							onChange={(e) => setReplyText(e.target.value)}
							className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
							rows={4}
							placeholder="Escribe tu respuesta..."
						/>
						<div className="flex justify-end space-x-3 mt-4">
							<button
								onClick={() => {
									setShowReplyForm(false);
									setReplyText("");
								}}
								className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
								disabled={isActionsLoading}
							>
								Cancelar
							</button>
							<button
								onClick={handleReply}
								disabled={!replyText.trim() || isActionsLoading}
								className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
							>
								{isActionsLoading ? "Enviando..." : "Enviar respuesta"}
							</button>
						</div>
					</div>
				)}

				{/* Formulario de reporte */}
				{showReportForm && (
					<div className="mt-6 bg-white rounded-lg shadow-sm p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Reportar valoración
						</h3>
						<textarea
							value={reportReason}
							onChange={(e) => setReportReason(e.target.value)}
							className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
							rows={4}
							placeholder="Describe el motivo del reporte..."
						/>
						<div className="flex justify-end space-x-3 mt-4">
							<button
								onClick={() => {
									setShowReportForm(false);
									setReportReason("");
								}}
								className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
								disabled={isActionsLoading}
							>
								Cancelar
							</button>
							<button
								onClick={handleReport}
								disabled={!reportReason.trim() || isActionsLoading}
								className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
							>
								{isActionsLoading ? "Enviando..." : "Enviar reporte"}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default RatingDetailPage;