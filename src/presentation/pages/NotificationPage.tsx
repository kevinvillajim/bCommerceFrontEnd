// src/presentation/pages/NotificationPage.tsx - CORREGIDO con soporte para rating_request
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Bell,
	Check,
	X,
	Trash2,
	MessageCircle,
	Package,
	Truck,
	Star,
	Tag,
	AlertTriangle,
	ShoppingBag,
	CreditCard,
	Store,
	RefreshCw,
	Filter,
	Search,
	CheckCircle,
	Calendar,
	User,
	ExternalLink,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import ApiClient from "../../infrastructure/api/apiClient";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

interface Notification {
	id: number;
	type: string;
	title: string;
	message: string;
	data: any;
	read: boolean;
	read_at: string | null;
	created_at: string;
	updated_at: string;
}

interface NotificationListResponse {
	success: boolean;
	data: Notification[];
	pagination?: {
		current_page: number;
		last_page: number;
		total: number;
		per_page: number;
	};
	message?: string;
}

const NotificationPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, isSeller } = useAuth();

	// Estados
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [filters, setFilters] = useState({
		type: "all",
		read: "all",
		dateFrom: "",
		dateTo: "",
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [showFilters, setShowFilters] = useState(false);

	// Cargar notificaciones al montar el componente
	useEffect(() => {
		fetchNotifications();
	}, [currentPage, filters, searchTerm]);

	// ✅ FUNCIÓN ACTUALIZADA: getNotificationIcon con casos de rating_request y rating_reminder
	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "new_message":
				return <MessageCircle className="text-blue-500" size={20} />;
			case "order_status":
				return <Package className="text-green-500" size={20} />;
			case "shipping_update":
				return <Truck className="text-indigo-500" size={20} />;
			case "product_update":
				return <Tag className="text-purple-500" size={20} />;
			case "low_stock":
				return <AlertTriangle className="text-orange-500" size={20} />;
			case "new_order":
				return <ShoppingBag className="text-green-600" size={20} />;
			case "payment_received":
				return <CreditCard className="text-green-600" size={20} />;
			case "rating_received":
			case "seller_rated":
				return <Star className="text-yellow-500" size={20} />;
			// ✅ NUEVOS CASOS AGREGADOS:
			case "rating_request":
			case "rating_reminder":
				return <Star className="text-blue-500" size={20} />;
			default:
				return <Bell className="text-gray-500" size={20} />;
		}
	};

	// ✅ FUNCIÓN ACTUALIZADA: getNotificationColor con casos de rating_request y rating_reminder
	const getNotificationColor = (type: string) => {
		switch (type) {
			case "new_message":
				return "bg-blue-50 border-blue-200";
			case "order_status":
				return "bg-green-50 border-green-200";
			case "shipping_update":
				return "bg-indigo-50 border-indigo-200";
			case "product_update":
				return "bg-purple-50 border-purple-200";
			case "low_stock":
				return "bg-orange-50 border-orange-200";
			case "new_order":
				return "bg-green-50 border-green-200";
			case "payment_received":
				return "bg-green-50 border-green-200";
			case "rating_received":
			case "seller_rated":
				return "bg-yellow-50 border-yellow-200";
			// ✅ NUEVOS CASOS AGREGADOS:
			case "rating_request":
			case "rating_reminder":
				return "bg-blue-50 border-blue-200";
			default:
				return "bg-gray-50 border-gray-200";
		}
	};

	// ✅ FUNCIÓN ACTUALIZADA: getNotificationUrl con casos de rating_request y rating_reminder
	const getNotificationUrl = (notification: Notification) => {
		const { type, data } = notification;

		switch (type) {
			case "new_message":
				if (data.chat_id) {
					return `/messages/${data.chat_id}`;
				}
				return "/messages";

			case "order_status":
			case "new_order":
				if (data.order_id) {
					return isSeller 
						? `/seller/orders/${data.order_id}` 
						: `/orders/${data.order_id}`;
				}
				return isSeller ? "/seller/orders" : "/orders";

			case "shipping_update":
				if (data.tracking_number) {
					return `/shipping/track/${data.tracking_number}`;
				}
				if (data.order_id) {
					return isSeller 
						? `/seller/orders/${data.order_id}` 
						: `/orders/${data.order_id}`;
				}
				return isSeller ? "/seller/orders" : "/orders";

			case "product_update":
			case "low_stock":
				if (data.product_id) {
					return isSeller 
						? `/seller/products/${data.product_id}` 
						: `/products/${data.product_id}`;
				}
				return isSeller ? "/seller/products" : "/products";

			case "payment_received":
				if (data.order_id) {
					return `/seller/orders/${data.order_id}`;
				}
				return "/seller/orders";

			case "rating_received":
			case "seller_rated":
				if (data.rating_id) {
					return `/ratings/${data.rating_id}`;
				}
				return isSeller ? "/seller/ratings" : "/ratings";

			// ✅ NUEVOS CASOS AGREGADOS:
			case "rating_request":
			case "rating_reminder":
				if (data.order_id) {
					return isSeller 
						? `/seller/orders/${data.order_id}` 
						: `/orders/${data.order_id}/rate`;
				}
				return isSeller ? "/seller/orders" : "/orders";

			default:
				return "/";
		}
	};

	const fetchNotifications = async () => {
		try {
			setLoading(true);
			setError(null);

			// Construir parámetros de consulta
			const queryParams = new URLSearchParams({
				page: currentPage.toString(),
				per_page: "20",
			});

			// Agregar filtros si están definidos
			if (filters.type !== "all") {
				queryParams.append("type", filters.type);
			}
			if (filters.read !== "all") {
				queryParams.append("read", filters.read === "read" ? "1" : "0");
			}
			if (filters.dateFrom) {
				queryParams.append("date_from", filters.dateFrom);
			}
			if (filters.dateTo) {
				queryParams.append("date_to", filters.dateTo);
			}
			if (searchTerm) {
				queryParams.append("search", searchTerm);
			}

			const response = await ApiClient.get<NotificationListResponse>(
				`${API_ENDPOINTS.NOTIFICATIONS.LIST}?${queryParams.toString()}`
			);

			if (response.success && response.data) {
				setNotifications(response.data);
				
				// Actualizar información de paginación
				if (response.pagination) {
					setTotalPages(response.pagination.last_page);
					setTotalItems(response.pagination.total);
				}
			} else {
				throw new Error(response.message || "Error al cargar notificaciones");
			}
		} catch (err) {
			console.error("Error fetching notifications:", err);
			setError(
				err instanceof Error
					? err.message
					: "Error al cargar las notificaciones"
			);
		} finally {
			setLoading(false);
		}
	};

	const markAsRead = async (notificationId: number) => {
		try {
			await ApiClient.patch(
				API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId)
			);

			// Actualizar el estado local
			setNotifications(prevNotifications =>
				prevNotifications.map(notification =>
					notification.id === notificationId
						? { ...notification, read: true, read_at: new Date().toISOString() }
						: notification
				)
			);
		} catch (error) {
			console.error("Error marking notification as read:", error);
		}
	};

	const markAsUnread = async (notificationId: number) => {
		try {
			await ApiClient.patch(
				API_ENDPOINTS.NOTIFICATIONS.MARK_AS_UNREAD(notificationId)
			);

			// Actualizar el estado local
			setNotifications(prevNotifications =>
				prevNotifications.map(notification =>
					notification.id === notificationId
						? { ...notification, read: false, read_at: null }
						: notification
				)
			);
		} catch (error) {
			console.error("Error marking notification as unread:", error);
		}
	};

	const deleteNotification = async (notificationId: number) => {
		try {
			await ApiClient.delete(
				API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId)
			);

			// Actualizar el estado local
			setNotifications(prevNotifications =>
				prevNotifications.filter(notification => notification.id !== notificationId)
			);
		} catch (error) {
			console.error("Error deleting notification:", error);
		}
	};

	const markAllAsRead = async () => {
		try {
			await ApiClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
			
			// Actualizar el estado local
			setNotifications(prevNotifications =>
				prevNotifications.map(notification => ({
					...notification,
					read: true,
					read_at: new Date().toISOString()
				}))
			);
		} catch (error) {
			console.error("Error marking all notifications as read:", error);
		}
	};

	const deleteSelected = async () => {
		if (selectedNotifications.length === 0) return;

		try {
			await ApiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE_MULTIPLE, {
				data: { ids: selectedNotifications }
			});

			// Actualizar el estado local
			setNotifications(prevNotifications =>
				prevNotifications.filter(notification => 
					!selectedNotifications.includes(notification.id)
				)
			);
			setSelectedNotifications([]);
		} catch (error) {
			console.error("Error deleting selected notifications:", error);
		}
	};

	const handleNotificationClick = async (notification: Notification) => {
		// Marcar como leída si no lo está
		if (!notification.read) {
			await markAsRead(notification.id);
		}

		// Navegar a la URL correspondiente
		const url = getNotificationUrl(notification);
		if (url && url !== "/") {
			navigate(url);
		}
	};

	const toggleSelectNotification = (notificationId: number) => {
		setSelectedNotifications(prev => {
			if (prev.includes(notificationId)) {
				return prev.filter(id => id !== notificationId);
			} else {
				return [...prev, notificationId];
			}
		});
	};

	const selectAllNotifications = () => {
		if (selectedNotifications.length === notifications.length) {
			setSelectedNotifications([]);
		} else {
			setSelectedNotifications(notifications.map(n => n.id));
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			const minutes = Math.floor(diffInHours * 60);
			return minutes <= 1 ? "Ahora mismo" : `${minutes} minutos`;
		} else if (diffInHours < 24) {
			const hours = Math.floor(diffInHours);
			return hours === 1 ? "1 hora" : `${hours} horas`;
		} else {
			const days = Math.floor(diffInHours / 24);
			return days === 1 ? "1 día" : `${days} días`;
		}
	};

	const getTypeLabel = (type: string): string => {
		const typeLabels: Record<string, string> = {
			new_message: "Nuevo mensaje",
			order_status: "Estado de pedido",
			shipping_update: "Actualización de envío",
			product_update: "Actualización de producto",
			low_stock: "Stock bajo",
			new_order: "Nuevo pedido",
			payment_received: "Pago recibido",
			rating_received: "Valoración recibida",
			seller_rated: "Vendedor valorado",
			// ✅ NUEVAS ETIQUETAS AGREGADAS:
			rating_request: "Solicitud de valoración",
			rating_reminder: "Recordatorio de valoración",
		};
		return typeLabels[type] || type;
	};

	const unreadCount = notifications.filter(n => !n.read).length;

	if (loading && notifications.length === 0) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
					<p className="text-gray-600">Cargando notificaciones...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center max-w-md mx-auto">
					<AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						Error al cargar notificaciones
					</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={() => {
							setError(null);
							fetchNotifications();
						}}
						className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
					>
						Intentar de nuevo
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 py-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
					<div className="flex items-center mb-4 sm:mb-0">
						<Bell className="h-6 w-6 text-primary-600 mr-3" />
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Notificaciones
							</h1>
							{unreadCount > 0 && (
								<p className="text-sm text-gray-600">
									{unreadCount} sin leer de {notifications.length} total
								</p>
							)}
						</div>
					</div>

					<div className="flex space-x-2">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							<Filter className="h-4 w-4 mr-2" />
							Filtros
						</button>
						<button
							onClick={fetchNotifications}
							disabled={loading}
							className="flex items-center px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
						>
							<RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
							Actualizar
						</button>
						{unreadCount > 0 && (
							<button
								onClick={markAllAsRead}
								className="flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
							>
								<CheckCircle className="h-4 w-4 mr-2" />
								Marcar todas como leídas
							</button>
						)}
					</div>
				</div>

				{/* Filtros */}
				{showFilters && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Tipo
								</label>
								<select
									value={filters.type}
									onChange={(e) => setFilters({ ...filters, type: e.target.value })}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="all">Todos los tipos</option>
									<option value="new_message">Mensajes</option>
									<option value="order_status">Estados de pedido</option>
									<option value="shipping_update">Envíos</option>
									<option value="rating_request">Solicitudes de valoración</option>
									<option value="rating_received">Valoraciones recibidas</option>
									<option value="new_order">Nuevos pedidos</option>
									<option value="payment_received">Pagos</option>
									<option value="product_update">Productos</option>
									<option value="low_stock">Stock bajo</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Estado
								</label>
								<select
									value={filters.read}
									onChange={(e) => setFilters({ ...filters, read: e.target.value })}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
								>
									<option value="all">Todas</option>
									<option value="unread">No leídas</option>
									<option value="read">Leídas</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Desde
								</label>
								<input
									type="date"
									value={filters.dateFrom}
									onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Hasta
								</label>
								<input
									type="date"
									value={filters.dateTo}
									onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
									className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>
						</div>

						<div className="mt-4">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Buscar
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
								<input
									type="text"
									placeholder="Buscar en título o mensaje..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
								/>
							</div>
						</div>
					</div>
				)}

				{/* Acciones masivas */}
				{selectedNotifications.length > 0 && (
					<div className="bg-white rounded-lg shadow-sm p-4 mb-6">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-600">
								{selectedNotifications.length} notificaciones seleccionadas
							</span>
							<div className="flex space-x-2">
								<button
									onClick={deleteSelected}
									className="flex items-center px-3 py-1 text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100"
								>
									<Trash2 className="h-4 w-4 mr-1" />
									Eliminar
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Lista de notificaciones */}
				{notifications.length === 0 ? (
					<div className="bg-white rounded-lg shadow-sm p-8 text-center">
						<Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No hay notificaciones
						</h3>
						<p className="text-gray-600">
							Cuando tengas notificaciones, aparecerán aquí.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{/* Header de selección */}
						<div className="bg-white rounded-lg shadow-sm px-4 py-2">
							<label className="flex items-center">
								<input
									type="checkbox"
									checked={selectedNotifications.length === notifications.length}
									onChange={selectAllNotifications}
									className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
								/>
								<span className="ml-2 text-sm text-gray-600">
									Seleccionar todas
								</span>
							</label>
						</div>

						{/* Notificaciones */}
						{notifications.map((notification) => (
							<div
								key={notification.id}
								className={`
									bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md
									${getNotificationColor(notification.type)}
									${!notification.read ? 'ring-2 ring-primary-100' : ''}
								`}
							>
								<div className="p-4">
									<div className="flex items-start space-x-3">
										{/* Checkbox */}
										<input
											type="checkbox"
											checked={selectedNotifications.includes(notification.id)}
											onChange={() => toggleSelectNotification(notification.id)}
											className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
										/>

										{/* Icono */}
										<div className="flex-shrink-0">
											{getNotificationIcon(notification.type)}
										</div>

										{/* Contenido */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center space-x-2 mb-1">
														<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
															{getTypeLabel(notification.type)}
														</span>
														{!notification.read && (
															<span className="w-2 h-2 bg-primary-600 rounded-full"></span>
														)}
													</div>
													
													<h3 className={`text-sm font-medium mb-1 ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
														{notification.title}
													</h3>
													
													<p className="text-sm text-gray-600 mb-2">
														{notification.message}
													</p>
													
													<div className="flex items-center space-x-4 text-xs text-gray-500">
														<span className="flex items-center">
															<Calendar className="h-3 w-3 mr-1" />
															{formatDate(notification.created_at)}
														</span>
														{notification.read && notification.read_at && (
															<span className="flex items-center">
																<CheckCircle className="h-3 w-3 mr-1" />
																Leída
															</span>
														)}
													</div>
												</div>

												{/* Acciones */}
												<div className="flex items-center space-x-1 ml-4">
													<button
														onClick={() => handleNotificationClick(notification)}
														className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
														title="Abrir"
													>
														<ExternalLink className="h-4 w-4" />
													</button>
													
													{notification.read ? (
														<button
															onClick={() => markAsUnread(notification.id)}
															className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
															title="Marcar como no leída"
														>
															<Bell className="h-4 w-4" />
														</button>
													) : (
														<button
															onClick={() => markAsRead(notification.id)}
															className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
															title="Marcar como leída"
														>
															<Check className="h-4 w-4" />
														</button>
													)}
													
													<button
														onClick={() => deleteNotification(notification.id)}
														className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
														title="Eliminar"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Paginación */}
				{totalPages > 1 && (
					<div className="mt-6 flex items-center justify-between">
						<p className="text-sm text-gray-600">
							Mostrando {notifications.length} de {totalItems} notificaciones
						</p>
						
						<div className="flex space-x-2">
							<button
								onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
							>
								Anterior
							</button>
							
							<span className="px-3 py-2 text-sm text-gray-600">
								Página {currentPage} de {totalPages}
							</span>
							
							<button
								onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
								disabled={currentPage === totalPages}
								className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
							>
								Siguiente
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default NotificationPage;