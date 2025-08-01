// src/presentation/pages/NotificationPage.tsx - CON SOPORTE PARA MODO OSCURO
import React, {useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {
	Bell,
	Check,
	CheckCheck,
	Trash2,
	Package,
	ShoppingCart,
	MessageCircle,
	Star,
	TrendingUp,
	AlertTriangle,
	Gift,
	Truck,
	FileText,
	MoreVertical,
	Shield,
	Ban,
} from "lucide-react";
import {useNotifications} from "../hooks/useNotifications";
import {useAuth} from "../hooks/useAuth";
import type {Notification} from "../../core/domain/entities/Notification";
import {formatRelativeTime} from "../../utils/dateUtils";
import CacheService from "../../infrastructure/services/CacheService";

// Función para obtener el icono según el tipo de notificación
const getNotificationIcon = (type: string) => {
	switch (type) {
		case "new_message":
			return <MessageCircle className="text-blue-500" size={20} />;
		case "order_status":
			return <Package className="text-green-500" size={20} />;
		case "shipping_update":
			return <Truck className="text-purple-500" size={20} />;
		case "product_update":
			return <TrendingUp className="text-orange-500" size={20} />;
		case "rating_received":
		case "seller_rated":
			return <Star className="text-yellow-500" size={20} />;
		case "new_order":
			return <ShoppingCart className="text-green-600" size={20} />;
		case "low_stock":
			return <AlertTriangle className="text-red-500" size={20} />;
		case "feedback_response":
			return <FileText className="text-indigo-500" size={20} />;
		case "promotion":
		case "discount":
			return <Gift className="text-pink-500" size={20} />;
		case "seller_strike":
			return <Shield className="text-orange-500" size={20} />;
		case "account_blocked":
			return <Ban className="text-red-500" size={20} />;
		default:
			return <Bell className="text-gray-500" size={20} />;
	}
};

// Función para obtener el color de fondo según el tipo - CON DARK MODE
const getNotificationColor = (type: string) => {
	switch (type) {
		case "new_message":
			return "bg-blue-50 border-blue-200";
		case "order_status":
			return "bg-green-50 border-green-200";
		case "shipping_update":
			return "bg-purple-50 border-purple-200";
		case "product_update":
			return "bg-orange-50 border-orange-200";
		case "rating_received":
		case "seller_rated":
			return "bg-yellow-50 border-yellow-200";
		case "new_order":
			return "bg-emerald-50 border-emerald-200";
		case "low_stock":
			return "bg-red-50 border-red-200";
		case "feedback_response":
			return "bg-indigo-50 border-indigo-200";
		case "promotion":
		case "discount":
			return "bg-pink-50 border-pink-200";
		case "seller_strike":
			return "bg-orange-50 border-orange-200";
		case "account_blocked":
			return "bg-red-50 border-red-200";
		default:
			return "bg-gray-50 border-gray-200/50";
	}
};

// Componente para el menú de acciones de notificación - CON DARK MODE
interface NotificationActionsProps {
	notification: Notification;
	onMarkAsRead: (id: number) => void;
	onDelete: (id: number) => void;
	isOpen: boolean;
	onToggle: () => void;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({
	notification,
	onMarkAsRead,
	onDelete,
	isOpen,
	onToggle,
}) => {
	return (
		<div className="relative">
			<button
				onClick={(e) => {
					e.stopPropagation();
					onToggle();
				}}
				className="p-1 rounded-full hover:bg-gray-200 transition-colors"
			>
				<MoreVertical size={16} className="text-gray-500" />
			</button>

			{isOpen && (
				<div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 z-10 min-w-[150px]">
					{!notification.read && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onMarkAsRead(notification.id!);
								onToggle();
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
						>
							<Check size={14} className="mr-2" />
							Marcar como leída
						</button>
					)}
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDelete(notification.id!);
							onToggle();
						}}
						className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
					>
						<Trash2 size={14} className="mr-2" />
						Eliminar
					</button>
				</div>
			)}
		</div>
	);
};

const NotificationPage: React.FC = () => {
	const [filter, setFilter] = useState<"all" | "unread">("all");
	const [activeMenu, setActiveMenu] = useState<number | null>(null);
	const navigate = useNavigate();
	const {isAuthenticated, roleInfo} = useAuth();

	const {
		notifications,
		loading,
		error,
		unreadCount,
		hasMore,
		currentPage,
		totalNotifications,
		fetchNotifications,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		refreshUnreadCount,
	} = useNotifications();

	// ✅ FUNCIÓN PARA INVALIDAR CACHE DE NOTIFICACIONES
	const invalidateNotificationsCache = useCallback(() => {
		// Limpiar cache de ambos filtros y todas las páginas
		for (let page = 1; page <= 10; page++) {
			// Asumir máximo 10 páginas
			CacheService.removeItem(`notifications_all_${page}`);
			CacheService.removeItem(`notifications_unread_${page}`);
		}
		console.log("🗑️ Cache de notificaciones invalidado");
	}, []);

	// ✅ MARCAR NOTIFICACIONES COMO "VISTAS" AL ENTRAR A LA PÁGINA
	useEffect(() => {
		if (isAuthenticated && notifications.length > 0) {
			console.log("👀 Usuario viendo página de notificaciones - actualizando contador");
			
			// Pequeño delay para que se vea natural
			setTimeout(() => {
				refreshUnreadCount();
			}, 500);
		}
	}, [isAuthenticated, notifications.length, refreshUnreadCount]);

	// ✅ FUNCIÓN OPTIMIZADA PARA OBTENER NOTIFICACIONES CON CACHE
	const fetchNotificationsWithCache = useCallback(
		async (page: number = 1, unreadOnly: boolean = false) => {
			const cacheKey = `notifications_${unreadOnly ? "unread" : "all"}_${page}`;
			const cachedNotifications = CacheService.getItem(cacheKey);

			if (cachedNotifications && page === 1) {
				console.log("💾 Usando notificaciones desde cache");
				// No podemos setear el estado directamente aquí ya que viene del hook useNotifications
				// Pero podemos evitar hacer la llamada si hay cache válido

				// Opcional: refrescar en background si el cache es viejo (>1 minuto)
				const cacheAge = Date.now() - (cachedNotifications.timestamp || 0);
				if (cacheAge > 60 * 1000) {
					setTimeout(() => {
						fetchNotifications(page, unreadOnly);
					}, 100);
				}
				return;
			}

			console.log("🌐 Cargando notificaciones desde API");
			await fetchNotifications(page, unreadOnly);

			// Guardar resultado en cache (esto se hará en el useEffect después del fetch exitoso)
		},
		[fetchNotifications]
	);

	// ✅ FUNCIÓN PARA REFRESCAR MANUALMENTE (LIMPIAR CACHE)
	const forceRefresh = useCallback(() => {
		console.log("🔄 Forzando refresh de notificaciones");
		invalidateNotificationsCache();
		fetchNotifications(1, filter === "unread");
	}, [invalidateNotificationsCache, fetchNotifications, filter]);

	// Redirigir si no está autenticado
	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login", {state: {from: "/notifications"}});
		}
	}, [isAuthenticated, navigate]);

	// ✅ CARGAR NOTIFICACIONES INICIALES CON CACHE INTELIGENTE
	useEffect(() => {
		if (isAuthenticated) {
			// Verificar cache inmediatamente
			const cacheKey = `notifications_${filter === "unread" ? "unread" : "all"}_1`;
			const cachedNotifications = CacheService.getItem(cacheKey);

			if (cachedNotifications) {
				console.log("⚡ Carga instantánea de notificaciones desde cache");
				// El hook useNotifications manejará la lógica de estado

				// Opcional: refrescar en background si el cache es viejo
				const cacheAge = Date.now() - (cachedNotifications.timestamp || 0);
				if (cacheAge > 60 * 1000) {
					setTimeout(() => {
						fetchNotifications(1, filter === "unread");
					}, 100);
				}
			} else {
				fetchNotifications(1, filter === "unread");
			}
		}
	}, [isAuthenticated, filter, fetchNotifications]);

	// ✅ GUARDAR NOTIFICACIONES EN CACHE DESPUÉS DE CARGAR EXITOSAMENTE
	useEffect(() => {
		if (notifications.length > 0 && !loading && !error) {
			const cacheKey = `notifications_${filter === "unread" ? "unread" : "all"}_${currentPage}`;
			const cacheData = {
				notifications,
				meta: {
					total: totalNotifications,
					unreadCount,
					hasMore,
					currentPage,
				},
				timestamp: Date.now(),
			};

			// Guardar en cache por 2 minutos para notificaciones
			CacheService.setItem(cacheKey, cacheData, 2 * 60 * 1000);
			console.log(`💾 Notificaciones guardadas en cache: ${cacheKey}`);
		}
	}, [
		notifications,
		loading,
		error,
		filter,
		currentPage,
		totalNotifications,
		unreadCount,
		hasMore,
	]);

	useEffect(() => {
		if (notifications.length > 0) {
			console.log("📊 Notificaciones recibidas:", notifications.slice(0, 2));
		}
	}, [notifications]);

	// CORRECCIÓN: Función mejorada para obtener URL correcta según el rol del usuario
	const getNotificationUrl = (notification: Notification): string | null => {
		const {type, data} = notification;

		// Detectar si es seller y ajustar rutas
		const isSeller = roleInfo.isSeller;

		console.log(
			`🔀 Procesando notificación tipo: ${type}, isSeller: ${isSeller}`,
			data
		);

		switch (type) {
			case "new_message":
				if (data.chat_id) {
					// CORRECCIÓN: Redirigir a ruta correcta según el rol
					const chatUrl = isSeller
						? `/seller/messages/${data.chat_id}`
						: `/chats/${data.chat_id}`;
					console.log(`📧 Redirigiendo a chat: ${chatUrl}`);
					return chatUrl;
				}
				// Fallback a página principal de mensajes
				return isSeller ? "/seller/messages" : "/chats";

			case "feedback_response":
				return data.feedback_id ? `/feedback/${data.feedback_id}` : "/feedback";

			case "order_status":
				if (data.order_id) {
					return isSeller
						? `/seller/orders/${data.order_id}`
						: `/orders/${data.order_id}`;
				}
				return isSeller ? "/seller/orders" : "/orders";

			case "product_update":
				if (data.product_id) {
					return isSeller
						? `/seller/products/edit/${data.product_id}`
						: `/products/${data.product_id}`;
				}
				return isSeller ? "/seller/products" : null;

			case "shipping_update":
				if (data.tracking_number) {
					return `/tracking/${data.tracking_number}`;
				} else if (data.order_id) {
					return isSeller
						? `/seller/orders/${data.order_id}`
						: `/orders/${data.order_id}`;
				}
				return null;

			case "rating_received":
			case "seller_rated":
				if (data.rating_id) {
					return `/ratings/${data.rating_id}`;
				}
				return isSeller ? "/seller/ratings" : "/profile";

			case "new_order":
				if (data.order_id) {
					return isSeller ? `/seller/orders/${data.order_id}` : null;
				}
				return isSeller ? "/seller/orders" : null;

			case "low_stock":
				if (data.product_id) {
					return isSeller ? `/seller/products/edit/${data.product_id}` : null;
				}
				return isSeller ? "/seller/products" : null;

			// CORRECCIÓN: Casos específicos para strikes y bloqueos
			case "seller_strike":
			case "account_blocked":
				return isSeller ? "/seller/profile" : "/profile";

			// NUEVO: Manejo de solicitud de calificación
			case "rating_request":
				return notification.data.action_url || "/pending-rating";

			default:
				console.log(`❓ Tipo de notificación no reconocido: ${type}`);
				return null;
		}
	};

	// Manejar click en notificación
	const handleNotificationClick = useCallback(
		async (notification: Notification) => {
			console.log(
				`🖱️ Click en notificación ${notification.id} (tipo: ${notification.type})`
			);

			// Cerrar menú de acciones si está abierto
			setActiveMenu(null);

			// Marcar como leída si no lo está
			if (!notification.read) {
				await markAsRead(notification.id!);
				// ✅ INVALIDAR CACHE DESPUÉS DE MARCAR COMO LEÍDA
				invalidateNotificationsCache();
			}

			// Obtener URL de destino
			const url = getNotificationUrl(notification);
			if (url) {
				console.log(
					`🔀 Navegando a: ${url} (usuario ${roleInfo.isSeller ? "seller" : "normal"})`
				);
				navigate(url);
			} else {
				console.log("⚠️ No hay URL de destino para esta notificación");
			}
		},
		[
			markAsRead,
			invalidateNotificationsCache,
			getNotificationUrl,
			roleInfo.isSeller,
			navigate,
		]
	);

	// Manejar eliminación de notificación
	const handleDelete = useCallback(
		async (id: number) => {
			await deleteNotification(id);
			// ✅ INVALIDAR CACHE DESPUÉS DE ELIMINAR
			invalidateNotificationsCache();
		},
		[deleteNotification, invalidateNotificationsCache]
	);

	// Manejar marcar como leída
	const handleMarkAsRead = useCallback(
		async (id: number) => {
			await markAsRead(id);
			// ✅ INVALIDAR CACHE DESPUÉS DE MARCAR COMO LEÍDA
			invalidateNotificationsCache();
		},
		[markAsRead, invalidateNotificationsCache]
	);

	// Manejar marcar todas como leídas
	const handleMarkAllAsRead = useCallback(async () => {
		await markAllAsRead();
		// ✅ INVALIDAR CACHE DESPUÉS DE MARCAR TODAS COMO LEÍDAS
		invalidateNotificationsCache();
	}, [markAllAsRead, invalidateNotificationsCache]);

	// Cargar más notificaciones
	const loadMore = useCallback(() => {
		if (hasMore && !loading) {
			fetchNotificationsWithCache(currentPage + 1, filter === "unread");
		}
	}, [hasMore, loading, currentPage, filter, fetchNotificationsWithCache]);

	// Cambiar filtro
	const handleFilterChange = useCallback(
		(newFilter: "all" | "unread") => {
			setFilter(newFilter);
			setActiveMenu(null);
			// Usar cache inteligente al cambiar filtro
			fetchNotificationsWithCache(1, newFilter === "unread");
		},
		[fetchNotificationsWithCache]
	);

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 transition-colors">
			<div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
				{/* Header - CON DARK MODE */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
						<p className="text-gray-600 mt-1">
							{totalNotifications > 0 && (
								<>
									{totalNotifications}{" "}
									{totalNotifications === 1 ? "notificación" : "notificaciones"}
									{unreadCount > 0 && (
										<span className="text-primary-600 font-medium">
											, {unreadCount} sin leer
										</span>
									)}
								</>
							)}
						</p>
					</div>

					<div className="flex items-center space-x-3">
						{/* Filtros - CON DARK MODE */}
						<div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
							<button
								onClick={() => handleFilterChange("all")}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
									filter === "all"
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								Todas
							</button>
							<button
								onClick={() => handleFilterChange("unread")}
								className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors relative ${
									filter === "unread"
										? "bg-white text-gray-900 shadow-sm"
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								No leídas
								{unreadCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
										{unreadCount > 99 ? "99" : unreadCount}
									</span>
								)}
							</button>
						</div>

						{/* Marcar todas como leídas - CON DARK MODE */}
						{unreadCount > 0 && (
							<button
								onClick={handleMarkAllAsRead}
								disabled={loading}
								className="px-4 py-2 bg-primary-600  text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center"
							>
								<CheckCheck size={16} className="mr-2" />
								Marcar todas
							</button>
						)}

						{/* ✅ BOTÓN DE REFRESH OPCIONAL - CON DARK MODE */}
						{notifications.length > 0 && (
							<button
								onClick={forceRefresh}
								disabled={loading}
								className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
							>
								{loading ? "Actualizando..." : "Actualizar"}
							</button>
						)}
					</div>
				</div>

				{/* Error - CON DARK MODE */}
				{error && (
					<div className="bg-red-50 border border-red-200  text-red-700 px-4 py-3 rounded-lg mb-6">
						{error}
						<button className="ml-2 underline" onClick={forceRefresh}>
							Reintentar
						</button>
					</div>
				)}

				{/* Loading inicial */}
				{loading && notifications.length === 0 ? (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
					</div>
				) : notifications.length === 0 ? (
					/* Estado vacío - CON DARK MODE */
					<div className="text-center py-20 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md">
						<Bell className="mx-auto h-16 w-16 text-gray-300 mb-6" />
						<h2 className="text-2xl font-semibold text-gray-700 mb-3">
							{filter === "unread"
								? "No tienes notificaciones sin leer"
								: "No tienes notificaciones"}
						</h2>
						<p className="text-gray-500 mb-8 max-w-md mx-auto">
							{filter === "unread"
								? "Todas tus notificaciones están al día. Te avisaremos cuando tengas algo nuevo."
								: "Cuando tengas actualizaciones importantes, aparecerán aquí."}
						</p>
						{filter === "unread" && (
							<button
								onClick={() => handleFilterChange("all")}
								className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600  hover:bg-primary-700 shadow-sm hover:shadow transition-all"
							>
								Ver todas las notificaciones
							</button>
						)}
					</div>
				) : (
					/* Lista de notificaciones - CON DARK MODE */
					<div className="bg-white rounded-xl shadow-lg overflow-hidden">
						{notifications.map((notification, index) => (
							<div
								key={notification.id}
								onClick={() => handleNotificationClick(notification)}
								className={`
	                relative border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm
	                ${
										!notification.read
											? "bg-primary-50 border-l-primary-500 hover:bg-primary-100"
											: "bg-white border-l-gray-200 hover:bg-gray-50"
									}
	                ${index !== notifications.length - 1 ? "border-b border-gray-100" : ""}
	              `}
							>
								<div className="p-6">
									<div className="flex items-start justify-between">
										<div className="flex items-start space-x-4 flex-1">
											{/* Icono */}
											<div
												className={`
	                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
	                      ${getNotificationColor(notification.type)}
	                    `}
											>
												{getNotificationIcon(notification.type)}
											</div>

											{/* Contenido */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center space-x-2 mb-1">
													<h3
														className={`text-base font-medium ${
															!notification.read
																? "text-gray-900"
																: "text-gray-700"
														}`}
													>
														{notification.title}
													</h3>
													{!notification.read && (
														<div className="w-2 h-2 bg-primary-500rounded-full"></div>
													)}
												</div>

												<p
													className={`text-sm ${
														!notification.read ? "text-gray-700" : "text-gray-600"
													} mb-2`}
												>
													{notification.message}
												</p>

												<div className="flex items-center text-xs text-gray-500">
													<span>
														{formatRelativeTime(notification.createdAt)}
													</span>
													{notification.readAt && (
														<span className="ml-2 flex items-center">
															<Check size={12} className="mr-1" />
															Leída el {formatRelativeTime(notification.readAt)}
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Menú de acciones */}
										<NotificationActions
											notification={notification}
											onMarkAsRead={handleMarkAsRead}
											onDelete={handleDelete}
											isOpen={activeMenu === notification.id}
											onToggle={() =>
												setActiveMenu(
													activeMenu === notification.id ? null : notification.id!
												)
											}
										/>
									</div>
								</div>
							</div>
						))}

						{/* Botón cargar más - CON DARK MODE */}
						{hasMore && (
							<div className="p-6 bg-gray-50/50 border-t">
								<button
									onClick={loadMore}
									disabled={loading}
									className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400 mr-2"></div>
											Cargando...
										</div>
									) : (
										"Cargar más notificaciones"
									)}
								</button>
							</div>
						)}
					</div>
				)}

				{/* Click outside para cerrar menús */}
				{activeMenu !== null && (
					<div
						className="fixed inset-0 z-0"
						onClick={() => setActiveMenu(null)}
					/>
				)}
			</div>
		</div>
	);
};

export default NotificationPage;