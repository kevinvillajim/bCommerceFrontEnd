// src/presentation/contexts/NotificationContext.tsx (OPTIMIZADO)

import React, {
	createContext,
	useState,
	useEffect,
	useCallback,
	useRef,
} from "react";
import type {ReactNode} from "react";
import ApiClient from "../../infrastructure/api/apiClient";
import {API_ENDPOINTS} from "../../constants/apiEndpoints";
import type {Notification} from "../../core/domain/entities/Notification";
import {useAuth} from "../hooks/useAuth";
import {useInvalidateCounters} from "../hooks/useInvalidateCounters";
import {CacheService} from "../../infrastructure/services/CacheService";

// Cache keys y tiempos
const CACHE_KEYS = {
	NOTIFICATIONS: "notifications_list",
	UNREAD_COUNT: "notifications_unread_count",
};

const CACHE_TIMES = {
	NOTIFICATIONS: 2 * 60 * 1000, // 2 minutos
	UNREAD_COUNT: 1 * 60 * 1000, // 1 minuto
};

interface NotificationContextProps {
	notifications: Notification[];
	loading: boolean;
	error: string | null;
	unreadCount: number;
	hasMore: boolean;
	currentPage: number;
	totalNotifications: number;
	fetchNotifications: (
		page?: number,
		showUnreadOnly?: boolean
	) => Promise<void>;
	markAsRead: (id: number) => Promise<boolean>;
	markAllAsRead: () => Promise<boolean>;
	deleteNotification: (id: number) => Promise<boolean>;
	refreshUnreadCount: () => Promise<void>;
	getNotificationUrl: (notification: Notification) => string | null;
}

/**
 * Normaliza una notificación desde el formato del backend
 */
const normalizeNotification = (notification: any): Notification => {
	return {
		...notification,
		createdAt: notification.createdAt || notification.created_at || "",
		readAt: notification.readAt || notification.read_at || undefined,
		created_at: notification.created_at,
		read_at: notification.read_at,
	};
};

const normalizeNotifications = (notifications: any[]): Notification[] => {
	return notifications.map(normalizeNotification);
};

export const NotificationContext = createContext<NotificationContextProps>({
	notifications: [],
	loading: false,
	error: null,
	unreadCount: 0,
	hasMore: false,
	currentPage: 1,
	totalNotifications: 0,
	fetchNotifications: async () => {},
	markAsRead: async () => false,
	markAllAsRead: async () => false,
	deleteNotification: async () => false,
	refreshUnreadCount: async () => {},
	getNotificationUrl: () => null,
});

interface NotificationProviderProps {
	children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
	children,
}) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [unreadCount, setUnreadCount] = useState<number>(0);
	const [hasMore, setHasMore] = useState<boolean>(false);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalNotifications, setTotalNotifications] = useState<number>(0);

	const {isAuthenticated} = useAuth();
	const isInitialized = useRef(false);
	const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const fetchPromiseRef = useRef<Promise<any> | null>(null);
	const countPromiseRef = useRef<Promise<any> | null>(null);
	const {invalidateNotifications} = useInvalidateCounters();

	// Limpiar timeouts al desmontar
	useEffect(() => {
		return () => {
			if (refreshTimeoutRef.current) {
				clearTimeout(refreshTimeoutRef.current);
			}
		};
	}, []);

	// OPTIMIZADO: Obtener contador de no leídas con cache
	const refreshUnreadCount = useCallback(async (): Promise<void> => {
		if (!isAuthenticated) return;

		// Evitar múltiples llamadas simultáneas
		if (countPromiseRef.current) {
			return countPromiseRef.current;
		}

		// Verificar cache primero
		const cachedCount = CacheService.getItem(CACHE_KEYS.UNREAD_COUNT);
		if (cachedCount !== null) {
			console.log("📊 Usando unread count desde cache:", cachedCount);
			setUnreadCount(cachedCount);
			return;
		}

		countPromiseRef.current = (async () => {
			try {
				console.log("📊 Consultando unread count desde API");
				const response = await ApiClient.get<{
					status: string;
					data: {
						unread_count: number;
					};
				}>(API_ENDPOINTS.NOTIFICATIONS.COUNT);

				if (response.status === "success" && response.data) {
					const count = response.data.unread_count;
					setUnreadCount(count);

					// Guardar en cache
					CacheService.setItem(
						CACHE_KEYS.UNREAD_COUNT,
						count,
						CACHE_TIMES.UNREAD_COUNT
					);
					console.log("📊 Unread count guardado en cache:", count);
				}
			} catch (err) {
				console.error("Error fetching notification count:", err);
			} finally {
				countPromiseRef.current = null;
			}
		})();

		return countPromiseRef.current;
	}, [isAuthenticated]);

	// OPTIMIZADO: Obtener notificaciones con cache
	const fetchNotifications = useCallback(
		async (
			page: number = 1,
			showUnreadOnly: boolean = false
		): Promise<void> => {
			if (!isAuthenticated) return;

			// Evitar múltiples llamadas simultáneas para la misma página
			const cacheKey = `${CACHE_KEYS.NOTIFICATIONS}_${page}_${showUnreadOnly}`;

			if (fetchPromiseRef.current && page === 1) {
				return fetchPromiseRef.current;
			}

			// Verificar cache solo para página 1 y no showUnreadOnly
			if (page === 1 && !showUnreadOnly) {
				const cachedData = CacheService.getItem(cacheKey);
				if (cachedData) {
					console.log("📋 Usando notificaciones desde cache");
					setNotifications(cachedData.notifications);
					setUnreadCount(cachedData.unread_count);
					setTotalNotifications(cachedData.total);
					setCurrentPage(page);
					setHasMore(cachedData.notifications.length === 20);
					return;
				}
			}

			setLoading(true);
			setError(null);

			fetchPromiseRef.current = (async () => {
				try {
					console.log("📋 Consultando notificaciones desde API", {
						page,
						showUnreadOnly,
					});

					const endpoint = showUnreadOnly
						? API_ENDPOINTS.NOTIFICATIONS.UNREAD
						: API_ENDPOINTS.NOTIFICATIONS.LIST;

					const params = {
						page,
						limit: 20,
						...(showUnreadOnly && {unread: true}),
					};

					const response = await ApiClient.get<{
						status: string;
						data: {
							notifications: Notification[];
							unread_count: number;
							total: number;
						};
					}>(endpoint, params);

					if (response.status === "success" && response.data) {
						const {
							notifications: newNotifications,
							unread_count,
							total,
						} = response.data;
						const normalizedNotifications =
							normalizeNotifications(newNotifications);

						if (page === 1) {
							setNotifications(normalizedNotifications);

							// Guardar en cache solo página 1 sin filtros
							if (!showUnreadOnly) {
								CacheService.setItem(
									cacheKey,
									{
										notifications: normalizedNotifications,
										unread_count,
										total,
									},
									CACHE_TIMES.NOTIFICATIONS
								);
								console.log("📋 Notificaciones guardadas en cache");
							}
						} else {
							setNotifications((prev) => [...prev, ...normalizedNotifications]);
						}

						setUnreadCount(unread_count);
						setTotalNotifications(total);
						setCurrentPage(page);
						setHasMore(newNotifications.length === 20);

						// Actualizar cache de contador también
						CacheService.setItem(
							CACHE_KEYS.UNREAD_COUNT,
							unread_count,
							CACHE_TIMES.UNREAD_COUNT
						);
					}
				} catch (err) {
					setError(
						err instanceof Error
							? err.message
							: "Error al cargar notificaciones"
					);
					console.error("Error fetching notifications:", err);
				} finally {
					setLoading(false);
					if (page === 1) {
						fetchPromiseRef.current = null;
					}
				}
			})();

			return fetchPromiseRef.current;
		},
		[isAuthenticated]
	);

	// OPTIMIZADO: Marcar como leída con invalidación de cache
	const markAsRead = useCallback(
		async (id: number): Promise<boolean> => {
			if (!isAuthenticated) return false;

			try {
				const response = await ApiClient.post<{
					status: string;
					data: {
						unread_count: number;
					};
				}>(`${API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)}`);

				if (response.status === "success") {
					// Actualizar estado local
					setNotifications((prev) =>
						prev.map((notif) =>
							notif.id === id
								? normalizeNotification({
										...notif,
										read: true,
										readAt: new Date().toISOString(),
									})
								: notif
						)
					);

					// Actualizar contador
					const newCount =
						response.data?.unread_count !== undefined
							? response.data.unread_count
							: Math.max(0, unreadCount - 1);

					setUnreadCount(newCount);

					// Invalidar cache
					CacheService.removeItem(CACHE_KEYS.UNREAD_COUNT);
					// Invalidar cache de notificaciones
					Object.keys(localStorage).forEach((key) => {
						if (key.includes(CACHE_KEYS.NOTIFICATIONS)) {
							CacheService.removeItem(key);
						}
					});

					invalidateNotifications();
					return true;
				}

				return false;
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Error al marcar notificación como leída"
				);
				console.error("Error marking notification as read:", err);
				return false;
			}
		},
		[isAuthenticated, unreadCount, invalidateNotifications]
	);

	// OPTIMIZADO: Marcar todas como leídas con invalidación de cache
	const markAllAsRead = useCallback(async (): Promise<boolean> => {
		if (!isAuthenticated) return false;

		setLoading(true);
		setError(null);

		try {
			const response = await ApiClient.post<{
				status: string;
				data: {
					unread_count: number;
				};
			}>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);

			if (response.status === "success") {
				// Actualizar lista local
				setNotifications((prev) =>
					prev.map((notif) => ({
						...notif,
						read: true,
						readAt: new Date().toISOString(),
					}))
				);

				// Reset contador
				setUnreadCount(0);

				// Invalidar todo el cache de notificaciones
				CacheService.removeItem(CACHE_KEYS.UNREAD_COUNT);
				Object.keys(localStorage).forEach((key) => {
					if (key.includes(CACHE_KEYS.NOTIFICATIONS)) {
						CacheService.removeItem(key);
					}
				});

				invalidateNotifications();
				return true;
			}

			return false;
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Error al marcar todas las notificaciones como leídas"
			);
			console.error("Error marking all notifications as read:", err);
			return false;
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated, invalidateNotifications]);

	// OPTIMIZADO: Eliminar notificación con invalidación de cache
	const deleteNotification = useCallback(
		async (id: number): Promise<boolean> => {
			if (!isAuthenticated) return false;

			try {
				const response = await ApiClient.delete<{
					status: string;
					data: {
						unread_count: number;
					};
				}>(`${API_ENDPOINTS.NOTIFICATIONS.DELETE(id)}`);

				if (response.status === "success") {
					// Encontrar la notificación antes de eliminarla
					const notification = notifications.find((n) => n.id === id);
					const wasUnread = notification && !notification.read;

					// Remover de la lista local
					setNotifications((prev) => prev.filter((notif) => notif.id !== id));

					// Actualizar contador si era no leída
					if (wasUnread) {
						const newCount =
							response.data?.unread_count !== undefined
								? response.data.unread_count
								: Math.max(0, unreadCount - 1);
						setUnreadCount(newCount);
					}

					// Actualizar total
					setTotalNotifications((prev) => Math.max(0, prev - 1));

					// Invalidar cache
					CacheService.removeItem(CACHE_KEYS.UNREAD_COUNT);
					Object.keys(localStorage).forEach((key) => {
						if (key.includes(CACHE_KEYS.NOTIFICATIONS)) {
							CacheService.removeItem(key);
						}
					});

					invalidateNotifications();
					return true;
				}

				return false;
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Error al eliminar notificación"
				);
				console.error("Error deleting notification:", err);
				return false;
			}
		},
		[isAuthenticated, notifications, unreadCount, invalidateNotifications]
	);

	// OPTIMIZADO: Cargar cuando el usuario está autenticado
	useEffect(() => {
		if (isAuthenticated) {
			if (!isInitialized.current) {
				// Cargar desde cache primero, luego refrescar si es necesario
				fetchNotifications(1);
				refreshUnreadCount();
				isInitialized.current = true;
			}
		} else {
			// Reset cuando no está autenticado
			setNotifications([]);
			setUnreadCount(0);
			setCurrentPage(1);
			setTotalNotifications(0);
			setHasMore(false);
			isInitialized.current = false;

			// Limpiar cache
			CacheService.removeItem(CACHE_KEYS.UNREAD_COUNT);
			Object.keys(localStorage).forEach((key) => {
				if (key.includes(CACHE_KEYS.NOTIFICATIONS)) {
					CacheService.removeItem(key);
				}
			});
		}
	}, [isAuthenticated, fetchNotifications, refreshUnreadCount]);

	// Obtener URL de destino según el tipo de notificación
	const getNotificationUrl = useCallback(
		(notification: Notification): string | null => {
			const {type, data} = notification;

			switch (type) {
				case "new_message":
					return data.chat_id ? `/chats/${data.chat_id}` : null;
				case "feedback_response":
					return data.feedback_id
						? `/feedback/${data.feedback_id}`
						: "/feedback";
				case "order_status":
					return data.order_id ? `/orders/${data.order_id}` : "/orders";
				case "product_update":
					return data.product_id ? `/products/${data.product_id}` : null;
				case "shipping_update":
					return data.tracking_number
						? `/tracking/${data.tracking_number}`
						: data.order_id
							? `/orders/${data.order_id}`
							: null;
				case "rating_received":
				case "seller_rated":
					return data.rating_id ? `/ratings/${data.rating_id}` : "/profile";
				case "new_order":
					return data.order_id
						? `/seller/orders/${data.order_id}`
						: "/seller/orders";
				case "low_stock":
					return data.product_id
						? `/seller/products/${data.product_id}`
						: "/seller/products";
				default:
					return null;
			}
		},
		[]
	);

	return (
		<NotificationContext.Provider
			value={{
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
				getNotificationUrl,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};
