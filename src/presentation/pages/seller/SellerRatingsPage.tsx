import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {
	Star,
	Search,
	Filter,
	RefreshCw,
	MessageSquare,
	AlertTriangle,
	Flag,
	Package,
	Eye,
	CheckCircle,
	XCircle,
	Clock,
} from "lucide-react";
import Table from "../../components/dashboard/Table";
import RatingStars from "../../components/common/RatingStars";
import RatingService, {
	Rating,
	RatingReplyRequest,
	RatingReportRequest,
} from "../../../core/services/RatingService";
import RatingCard from "../../components/rating/RatingCard";
import RatingsSummary from "../../components/rating/RatingsSummary";
import {formatDate} from "../../../utils/formatters/formatDate";
import {extractErrorMessage} from "../../../utils/errorHandler";

const SellerRatingsPage: React.FC = () => {
	// Servicio de valoraciones
	const ratingService = new RatingService();

	// Estados
	const [ratings, setRatings] = useState<Rating[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Estados de filtros
	const [ratingFilter, setRatingFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [productFilter, setProductFilter] = useState<string>("all");
	const [verifiedFilter, setVerifiedFilter] = useState<string>("all");
	const [searchTerm, setSearchTerm] = useState<string>("");

	// Estados para respuesta y reporte
	const [replyRatingId, setReplyRatingId] = useState<number | null>(null);
	const [replyText, setReplyText] = useState<string>("");
	const [reportRatingId, setReportRatingId] = useState<number | null>(null);
	const [reportReason, setReportReason] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	// Estado de paginación
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0,
		itemsPerPage: 10,
	});

	// Cargar datos de valoraciones
	useEffect(() => {
		fetchRatings();
	}, [pagination.currentPage, statusFilter]);

	// Función para obtener valoraciones
	const fetchRatings = async () => {
		try {
			setLoading(true);
			setError(null);

			// Preparar filtros para la API
			const params: {
				page: number;
				per_page: number;
				status?: string;
			} = {
				page: pagination.currentPage,
				per_page: pagination.itemsPerPage,
			};

			// Añadir filtro de estado si no es "all"
			if (statusFilter !== "all") {
				params.status = statusFilter;
			}

			// Llamar a la API
			const response = await ratingService.getMyReceivedRatings(
				params.page,
				params.per_page,
				params.status
			);

			// Verificar respuesta
			if (response.status !== "success") {
				throw new Error("Error al obtener las valoraciones");
			}

			// Actualizar datos
			setRatings(response.data);

			// Actualizar paginación
			setPagination({
				currentPage: response.meta.current_page,
				totalPages: response.meta.last_page,
				totalItems: response.meta.total,
				itemsPerPage: response.meta.per_page,
			});
		} catch (error) {
			console.error("Error al cargar valoraciones:", error);
			setError(
				extractErrorMessage(error, "No se pudieron cargar las valoraciones")
			);
		} finally {
			setLoading(false);
		}
	};

	// Filtrar valoraciones según los criterios de la UI
	const filteredRatings = ratings.filter((rating) => {
		// Filtrar por puntuación
		const matchesRating =
			ratingFilter === "all" || Number(ratingFilter) === rating.rating;

		// Filtrar por producto si hay un filtro seleccionado
		const matchesProduct =
			productFilter === "all" ||
			(rating.product_id && String(rating.product_id) === productFilter);

		// Filtrar por compra verificada
		const matchesVerified =
			verifiedFilter === "all" ||
			(verifiedFilter === "verified" && rating.is_verified_purchase) ||
			(verifiedFilter === "unverified" && !rating.is_verified_purchase);

		// Filtrar por término de búsqueda
		const matchesSearch =
			searchTerm === "" ||
			(rating.product?.name &&
				rating.product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(rating.user?.name &&
				rating.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(rating.title &&
				rating.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(rating.comment &&
				rating.comment.toLowerCase().includes(searchTerm.toLowerCase()));

		return matchesRating && matchesProduct && matchesVerified && matchesSearch;
	});

	// Obtener lista única de productos
	const uniqueProducts = Array.from(
		new Set(ratings.filter((r) => r.product_id).map((r) => r.product_id))
	).map((productId) => {
		const product = ratings.find((r) => r.product_id === productId);
		return {
			id: productId,
			name: product?.product?.name || `Producto ${productId}`,
		};
	});

	// Calcular estadísticas de valoraciones
	const ratingStats = {
		totalCount: ratings.length,
		averageRating:
			ratings.length > 0
				? Number(
						(
							ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
						).toFixed(1)
					)
				: 0,
		distribution: {
			"5": ratings.filter((r) => r.rating === 5).length,
			"4": ratings.filter((r) => r.rating === 4).length,
			"3": ratings.filter((r) => r.rating === 3).length,
			"2": ratings.filter((r) => r.rating === 2).length,
			"1": ratings.filter((r) => r.rating === 1).length,
		},
		statusCounts: {
			pending: ratings.filter((r) => r.status === "pending").length,
			approved: ratings.filter((r) => r.status === "approved").length,
			rejected: ratings.filter((r) => r.status === "rejected").length,
		},
		reportedCount: ratings.filter((r) => r.seller_response).length,
		verifiedPurchaseCount: ratings.filter((r) => r.is_verified_purchase).length,
		respondedCount: ratings.filter((r) => r.seller_response).length,
	};

	// Manejar respuesta a valoración
	const handleReplySubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!replyRatingId || !replyText.trim()) return;

		try {
			setIsSubmitting(true);

			// Preparar datos para la API
			const replyData: RatingReplyRequest = {
				rating_id: replyRatingId,
				reply_text: replyText.trim(),
			};

			// Enviar respuesta
			const response = await ratingService.replyToRating(replyData);

			// Verificar respuesta
			if (response.status !== "success") {
				throw new Error("Error al enviar respuesta");
			}

			// Actualizar la lista de valoraciones
			await fetchRatings();

			// Mostrar mensaje de éxito
			alert("Respuesta enviada con éxito");

			// Limpiar formulario
			setReplyRatingId(null);
			setReplyText("");
		} catch (error) {
			console.error("Error al responder valoración:", error);
			alert(extractErrorMessage(error, "Error al enviar la respuesta"));
		} finally {
			setIsSubmitting(false);
		}
	};

	// Manejar reportar valoración
	const handleReportSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!reportRatingId || !reportReason.trim()) return;

		try {
			setIsSubmitting(true);

			// Preparar datos para la API
			const reportData: RatingReportRequest = {
				rating_id: reportRatingId,
				reason: reportReason.trim(),
			};

			// Enviar reporte
			const response = await ratingService.reportRating(reportData);

			// Verificar respuesta
			if (response.status !== "success") {
				throw new Error("Error al enviar reporte");
			}

			// Actualizar la lista de valoraciones
			await fetchRatings();

			// Mostrar mensaje de éxito
			alert("Reporte enviado con éxito");

			// Limpiar formulario
			setReportRatingId(null);
			setReportReason("");
		} catch (error) {
			console.error("Error al reportar valoración:", error);
			alert(extractErrorMessage(error, "Error al enviar el reporte"));
		} finally {
			setIsSubmitting(false);
		}
	};

	// Cancelar respuesta o reporte
	const handleCancelAction = () => {
		setReplyRatingId(null);
		setReplyText("");
		setReportRatingId(null);
		setReportReason("");
	};

	// Manejar cambio de página
	const handlePageChange = (page: number) => {
		setPagination((prev) => ({...prev, currentPage: page}));
	};

	// Refrescar datos
	const refreshData = () => {
		fetchRatings();
	};

	// Definir columnas de la tabla
	const columns = [
		{
			key: "product",
			header: "Producto",
			sortable: true,
			render: (rating: Rating) => (
				<div className="flex items-center space-x-3">
					{rating.product?.image ? (
						<img
							src={rating.product.image}
							alt={rating.product.name}
							className="w-12 h-12 rounded-md object-cover"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.src = "https://via.placeholder.com/100?text=Producto";
							}}
						/>
					) : (
						<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
							<Package className="w-6 h-6 text-gray-500 dark:text-gray-400" />
						</div>
					)}
					<div>
						<Link
							to={`/seller/products/${rating.product_id}`}
							className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
						>
							{rating.product?.name || `Producto #${rating.product_id}`}
						</Link>
						<div className="text-xs text-gray-500 dark:text-gray-400">
							ID: {rating.product_id}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "rating",
			header: "Valoración",
			sortable: true,
			render: (rating: Rating) => (
				<div className="flex flex-col items-start space-y-1">
					<RatingStars rating={rating.rating} size={18} />
					<div className="text-sm font-medium">{rating.rating}/5</div>
				</div>
			),
		},
		{
			key: "user",
			header: "Cliente",
			sortable: true,
			render: (rating: Rating) => (
				<div className="flex items-center space-x-2">
					{rating.user?.avatar ? (
						<img
							src={rating.user.avatar}
							alt={rating.user.name}
							className="w-8 h-8 rounded-full object-cover"
							onError={(e) => {
								const target = e.target as HTMLImageElement;
								target.src = "https://via.placeholder.com/100?text=User";
							}}
						/>
					) : (
						<div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
							<span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
								{rating.user?.name
									? rating.user.name.charAt(0).toUpperCase()
									: "U"}
							</span>
						</div>
					)}
					<div>
						<div className="font-medium">
							{rating.user?.name || `Usuario #${rating.user_id}`}
						</div>
						<div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
							{rating.is_verified_purchase && (
								<span className="flex items-center text-green-600 dark:text-green-400">
									<CheckCircle size={12} className="mr-1" />
									Compra verificada
								</span>
							)}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "comment",
			header: "Comentario",
			render: (rating: Rating) => (
				<div>
					{rating.title && (
						<div className="font-medium text-gray-900 dark:text-white">
							{rating.title}
						</div>
					)}
					{rating.comment && (
						<div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
							{rating.comment}
						</div>
					)}
					<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
						{formatDate(rating.created_at)}
					</div>
				</div>
			),
		},
		{
			key: "status",
			header: "Estado",
			sortable: true,
			render: (rating: Rating) => {
				let statusData = {
					icon: Clock,
					colorClass:
						"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
					text: "Pendiente",
				};

				if (rating.status === "approved") {
					statusData = {
						icon: CheckCircle,
						colorClass:
							"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
						text: "Aprobada",
					};
				} else if (rating.status === "rejected") {
					statusData = {
						icon: XCircle,
						colorClass:
							"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
						text: "Rechazada",
					};
				}

				return (
					<div className="flex flex-col space-y-2">
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusData.colorClass}`}
						>
							<statusData.icon size={12} className="mr-1" />
							{statusData.text}
						</span>
					</div>
				);
			},
		},
		{
			key: "response",
			header: "Respuesta",
			render: (rating: Rating) => (
				<div>
					{rating.seller_response ? (
						<div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
							<div className="line-clamp-2">{rating.seller_response.text}</div>
							<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								{formatDate(rating.seller_response.created_at)}
							</div>
						</div>
					) : (
						<span className="text-gray-500 dark:text-gray-400 text-sm">
							Sin respuesta
						</span>
					)}
				</div>
			),
		},
		{
			key: "actions",
			header: "Acciones",
			render: (rating: Rating) => (
				<div className="flex justify-end space-x-2">
					{/* Ver detalles */}
					<Link
						to={`/seller/products/${rating.product_id}`}
						className="p-1 text-blue-600 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:hover:bg-blue-900"
						title="Ver producto"
					>
						<Eye size={18} />
					</Link>

					{/* Responder a valoración */}
					{!rating.seller_response && (
						<button
							onClick={() => {
								setReplyRatingId(rating.id || 0);
								setReplyText("");
							}}
							className="p-1 text-green-600 hover:bg-green-100 rounded-md dark:text-green-400 dark:hover:bg-green-900"
							title="Responder a la valoración"
						>
							<MessageSquare size={18} />
						</button>
					)}

					{/* Reportar valoración */}
					<button
						onClick={() => {
							setReportRatingId(rating.id || 0);
							setReportReason("");
						}}
						className="p-1 text-orange-600 hover:bg-orange-100 rounded-md dark:text-orange-400 dark:hover:bg-orange-900"
						title="Reportar valoración"
					>
						<Flag size={18} />
					</button>

					{/* Indicador de alerta para valoraciones negativas sin respuesta */}
					{rating.rating <= 2 && !rating.seller_response && (
						<span
							className="p-1 text-red-600 dark:text-red-400"
							title="Valoración negativa sin respuesta"
						>
							<AlertTriangle size={18} />
						</span>
					)}
				</div>
			),
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
					Valoraciones y Reseñas
				</h1>
				<div className="flex space-x-2">
					<button
						onClick={refreshData}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
						disabled={loading}
					>
						<RefreshCw
							size={18}
							className={`inline mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Actualizar
					</button>
				</div>
			</div>

			{/* Error message */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
					<strong className="font-bold">Error: </strong>
					<span className="block sm:inline">{error}</span>
				</div>
			)}

			{/* Panel de filtros */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
				<div className="flex flex-col md:flex-row gap-4">
					{/* Buscador */}
					<div className="relative flex-grow">
						<input
							type="text"
							placeholder="Buscar por producto, cliente, comentario..."
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
					</div>

					{/* Filtro de Puntuación */}
					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={ratingFilter}
							onChange={(e) => setRatingFilter(e.target.value)}
						>
							<option value="all">Todas las estrellas</option>
							<option value="5">5 estrellas</option>
							<option value="4">4 estrellas</option>
							<option value="3">3 estrellas</option>
							<option value="2">2 estrellas</option>
							<option value="1">1 estrella</option>
						</select>
					</div>

					{/* Filtro de Estado */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="all">Todos los estados</option>
							<option value="pending">Pendientes</option>
							<option value="approved">Aprobadas</option>
							<option value="rejected">Rechazadas</option>
						</select>
					</div>

					{/* Filtro de Producto */}
					{uniqueProducts.length > 0 && (
						<div className="flex items-center space-x-2">
							<select
								className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
								value={productFilter}
								onChange={(e) => setProductFilter(e.target.value)}
							>
								<option value="all">Todos los productos</option>
								{uniqueProducts.map((product) => (
									<option key={product.id} value={product.id}>
										{product.name}
									</option>
								))}
							</select>
						</div>
					)}

					{/* Filtro de Compra Verificada */}
					<div className="flex items-center space-x-2">
						<select
							className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
							value={verifiedFilter}
							onChange={(e) => setVerifiedFilter(e.target.value)}
						>
							<option value="all">Todas las compras</option>
							<option value="verified">Compras verificadas</option>
							<option value="unverified">Compras no verificadas</option>
						</select>
					</div>

					{/* Botón para limpiar filtros */}
					<button
						onClick={() => {
							setRatingFilter("all");
							setStatusFilter("all");
							setProductFilter("all");
							setVerifiedFilter("all");
							setSearchTerm("");
						}}
						className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
					>
						Limpiar filtros
					</button>
				</div>
			</div>

			{/* Estadísticas resumidas */}
			<RatingsSummary
				averageRating={ratingStats.averageRating}
				totalRatings={ratingStats.totalCount}
				distribution={ratingStats.distribution}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
					<div className="flex justify-between items-start">
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Pendientes
							</h3>
							<p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
								{ratingStats.statusCounts.pending}
							</p>
						</div>
						<div className="p-2 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
							<Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
					<div className="flex justify-between items-start">
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Aprobadas
							</h3>
							<p className="text-2xl font-bold text-green-600 dark:text-green-400">
								{ratingStats.statusCounts.approved}
							</p>
						</div>
						<div className="p-2 bg-green-50 dark:bg-green-900 rounded-lg">
							<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
					<div className="flex justify-between items-start">
						<div>
							<h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
								Respondidas
							</h3>
							<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{ratingStats.respondedCount}
							</p>
						</div>
						<div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
							<MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</div>
			</div>

			{/* Formulario para responder a una valoración */}
			{replyRatingId && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-green-500">
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Responder a la valoración
					</h3>
					<form onSubmit={handleReplySubmit} className="space-y-4">
						<div>
							<label
								htmlFor="reply-text"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Tu respuesta
							</label>
							<textarea
								id="reply-text"
								rows={4}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
								placeholder="Escribe tu respuesta a esta valoración..."
								value={replyText}
								onChange={(e) => setReplyText(e.target.value)}
								required
							></textarea>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Tu respuesta será visible públicamente para todos los usuarios.
							</p>
						</div>
						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={handleCancelAction}
								className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
								disabled={isSubmitting}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
								disabled={!replyText.trim() || isSubmitting}
							>
								{isSubmitting ? "Enviando..." : "Enviar respuesta"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Formulario para reportar una valoración */}
			{reportRatingId && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Reportar valoración
					</h3>
					<form onSubmit={handleReportSubmit} className="space-y-4">
						<div>
							<label
								htmlFor="report-reason"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Motivo del reporte
							</label>
							<textarea
								id="report-reason"
								rows={4}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
								placeholder="Describe por qué consideras que esta valoración debe ser revisada..."
								value={reportReason}
								onChange={(e) => setReportReason(e.target.value)}
								required
							></textarea>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
								Tu reporte será revisado por el equipo de moderación.
							</p>
						</div>
						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={handleCancelAction}
								className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
								disabled={isSubmitting}
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
								disabled={!reportReason.trim() || isSubmitting}
							>
								{isSubmitting ? "Enviando..." : "Enviar reporte"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Tabla de Valoraciones */}
			<Table
				data={filteredRatings}
				columns={columns}
				searchFields={["product.name", "user.name", "title", "comment"]}
				loading={loading}
				emptyMessage="No se encontraron valoraciones"
				pagination={{
					currentPage: pagination.currentPage,
					totalPages: pagination.totalPages,
					totalItems: pagination.totalItems,
					itemsPerPage: pagination.itemsPerPage,
					onPageChange: handlePageChange,
				}}
			/>
		</div>
	);
};

export default SellerRatingsPage;
