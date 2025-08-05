// src/presentation/contexts/NotificationContext.tsx - VERSIÓN SIN BUCLES

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
import {CacheService} from "../../infrastructure/services/CacheService";

// Cache keys simplificados
const CACHE_KEYS = {
	NOTIFICATIONS: "notifications_list",
	UNREAD_COUNT: "notifications_unread_count",
};

const CACHE_TIMES = {
	NOTIFICATIONS: 3 * 60 * 1000, // 3 minutos
	UNREAD_COUNT: 2 * 60 * 1000, // 2 minutos
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
	const fetchPromiseRef = useRef<Promise<any> | null>(null);

	// Función simplificada para limpiar cache específico
	const clearNotificationCache = useCallback(() => {
		CacheService.removeItem(CACHE_KEYS.UNREAD_COUNT);
		CacheService.removeItem(CACHE_KEYS.NOTIFICATIONS + "_1_false");
	}, []);

	// Obtener contador de notificaciones no leídas (SIMPLIFICADO)
	const refreshUnreadCount = useCallback(async (): Promise<void> => {
		if (!isAuthenticated) return;

		// Verificar cache específico primero
		const cachedCount = CacheService.getItem(CACHE_KEYS.UNREAD_COUNT);
		if (cachedCount !== null) {
			setUnreadCount(cachedCount);
			return;
		}

		try {
			const response = await ApiClient.get<{
				status: string;
				data: { unread_count: number };
			}>(API_ENDPOINTS.NOTIFICATIONS.COUNT);

			if (response.status === "success" && response.data) {
				const count = response.data.unread_count;
				setUnreadCount(count);
				CacheService.setItem(CACHE_KEYS.UNREAD_COUNT, count, CACHE_TIMES.UNREAD_COUNT);
			}
		} catch (err) {
			console.error("Error fetching notification count:", err);
		}
	}, [isAuthenticated]);

	// Obtener notificaciones (SIMPLIFICADO)
	const fetchNotifications = useCallback(
		async (page: number = 1, showUnreadOnly: boolean = false): Promise<void> => {
			if (!isAuthenticated) return;

			// Evitar múltiples llamadas simultáneas
			if (fetchPromiseRef.current && page === 1) {
				return fetchPromiseRef.current;
			}

			const cacheKey = `${CACHE_KEYS.NOTIFICATIONS}_${page}_${showUnreadOnly}`;

			// Verificar cache solo para primera página sin filtros
			if (page === 1 && !showUnreadOnly) {
				const cachedData = CacheService.getItem(cacheKey);
				if (cachedData) {
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
						const {notifications: newNotifications, unread_count, total} = response.data;
						const normalizedNotifications = normalizeNotifications(newNotifications);

						if (page === 1) {
							setNotifications(normalizedNotifications);
							// Guardar en cache solo primera página sin filtros
							if (!showUnreadOnly) {
								CacheService.setItem(cacheKey, {
									notifications: normalizedNotifications,
									unread_count,
									total,
								}, CACHE_TIMES.NOTIFICATIONS);
							}
						} else {
							setNotifications((prev) => [...prev, ...normalizedNotifications]);
						}

						setUnreadCount(unread_count);
						setTotalNotifications(total);
						setCurrentPage(page);
						setHasMore(newNotifications.length === 20);

						// Actualizar cache de contador
						CacheService.setItem(CACHE_KEYS.UNREAD_COUNT, unread_count, CACHE_TIMES.UNREAD_COUNT);
					}
				} catch (err) {
					setError(err instanceof Error ? err.message : "Error al cargar notificaciones");
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

	// Marcar como leída (SIMPLIFICADO)
	const markAsRead = useCallback(
		async (id: number): Promise<boolean> => {
			if (!isAuthenticated) return false;

			try {
				const response = await ApiClient.post<{
					status: string;
					data: { unread_count: number };
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
					const newCount = response.data?.unread_count !== undefined
						? response.data.unread_count
						: Math.max(0, unreadCount - 1);

					setUnreadCount(newCount);

					// Limpiar cache específico
					clearNotificationCache();

					return true;
				}
				return false;
			} catch (err) {
				setError(err instanceof Error ? err.message : "Error al marcar notificación como leída");
				console.error("Error marking notification as read:", err);
				return false;
			}
		},
		[isAuthenticated, unreadCount, clearNotificationCache]
	);

	// Marcar todas como leídas (SIMPLIFICADO)
	const markAllAsRead = useCallback(async (): Promise<boolean> => {
		if (!isAuthenticated) return false;

		setLoading(true);
		setError(null);

		try {
			const response = await ApiClient.post<{
				status: string;
				data: { unread_count: number };
			}>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);

			if (response.status === "success") {
				setNotifications((prev) =>
					prev.map((notif) => ({
						...notif,
						read: true,
						readAt: new Date().toISOString(),
					}))
				);

				setUnreadCount(0);
				clearNotificationCache();
				return true;
			}
			return false;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al marcar todas las notificaciones como leídas");
			console.error("Error marking all notifications as read:", err);
			return false;
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated, clearNotificationCache]);

	// Eliminar notificación (SIMPLIFICADO)
	const deleteNotification = useCallback(
		async (id: number): Promise<boolean> => {
			if (!isAuthenticated) return false;

			try {
				const response = await ApiClient.delete<{
					status: string;
					data: { unread_count: number };
				}>(`${API_ENDPOINTS.NOTIFICATIONS.DELETE(id)}`);

				if (response.status === "success") {
					const notification = notifications.find((n) => n.id === id);
					const wasUnread = notification && !notification.read;

					setNotifications((prev) => prev.filter((notif) => notif.id !== id));

					if (wasUnread) {
						const newCount = response.data?.unread_count !== undefined
							? response.data.unread_count
							: Math.max(0, unreadCount - 1);
						setUnreadCount(newCount);
					}

					setTotalNotifications((prev) => Math.max(0, prev - 1));
					clearNotificationCache();
					return true;
				}
				return false;
			} catch (err) {
				setError(err instanceof Error ? err.message : "Error al eliminar notificación");
				console.error("Error deleting notification:", err);
				return false;
			}
		},
		[isAuthenticated, notifications, unreadCount, clearNotificationCache]
	);

	// Initialize context but don't auto-fetch notifications (use header-counters for count)
	useEffect(() => {
		if (!isAuthenticated) {
			// Reset cuando no está autenticado
			setNotifications([]);
			setUnreadCount(0);
			setCurrentPage(1);
			setTotalNotifications(0);
			setHasMore(false);
			isInitialized.current = false;
			clearNotificationCache();
		} else {
			isInitialized.current = true;
		}
		// Don't auto-fetch - only fetch when explicitly requested (e.g., NotificationPage)
	}, [isAuthenticated]);

	// Obtener URL de destino según el tipo de notificación
	const getNotificationUrl = useCallback(
		(notification: Notification): string | null => {
			const {type, data} = notification;

			switch (type) {
				case "new_message":
					return data.chat_id ? `/chats/${data.chat_id}` : null;
				case "feedback_response":
					return data.feedback_id ? `/feedback/${data.feedback_id}` : "/feedback";
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
					return data.order_id ? `/seller/orders/${data.order_id}` : "/seller/orders";
				case "low_stock":
					return data.product_id ? `/seller/products/${data.product_id}` : "/seller/products";
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