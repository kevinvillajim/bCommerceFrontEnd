// src/presentation/hooks/useRealTimeNotifications.ts - OPTIMIZADO
import {useState, useEffect, useCallback, useRef} from "react";
import {useNotifications} from "./useNotifications";
import {useAuth} from "./useAuth";
import type {Notification} from "../../core/domain/entities/Notification";

interface UseRealTimeNotificationsReturn {
	toastNotifications: Notification[];
	removeToast: (id: number) => void;
	clearAllToasts: () => void;
}

/**
 * Hook optimizado para notificaciones en tiempo real
 * ✅ ELIMINADO POLLING INNECESARIO - USA CACHE DEL CONTEXTO
 */
export const useRealTimeNotifications = (): UseRealTimeNotificationsReturn => {
	const [toastNotifications, setToastNotifications] = useState<Notification[]>(
		[]
	);
	const {isAuthenticated} = useAuth();
	const {unreadCount, refreshUnreadCount} = useNotifications();

	// ✅ REFS OPTIMIZADOS
	const lastUnreadCountRef = useRef<number>(0);
	const isInitializedRef = useRef<boolean>(false);
	const autoRemoveTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
	const lastRefreshRef = useRef<number>(0);

	// ✅ FUNCIÓN OPTIMIZADA PARA REMOVER TOAST
	const removeToast = useCallback((id: number) => {
		setToastNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);

		// Limpiar timer de auto-remove si existe
		const timer = autoRemoveTimersRef.current.get(id);
		if (timer) {
			clearTimeout(timer);
			autoRemoveTimersRef.current.delete(id);
		}
	}, []);

	// ✅ FUNCIÓN OPTIMIZADA PARA LIMPIAR TODOS LOS TOASTS
	const clearAllToasts = useCallback(() => {
		setToastNotifications([]);

		// Limpiar todos los timers de auto-remove
		autoRemoveTimersRef.current.forEach((timer) => clearTimeout(timer));
		autoRemoveTimersRef.current.clear();
	}, []);

	// ✅ FUNCIÓN OPTIMIZADA PARA AGREGAR TOAST
	const addToastNotification = useCallback(
		(notification: Notification) => {
			setToastNotifications((prev) => {
				// Evitar duplicados
				const exists = prev.some((n) => n.id === notification.id);
				if (exists) return prev;

				// Añadir nueva notificación al inicio y limitar a 2
				const updated = [notification, ...prev].slice(0, 2);

				// Configurar auto-remove para la nueva notificación
				if (notification.id) {
					const timer = setTimeout(() => {
						removeToast(notification.id!);
					}, 6000); // 6 segundos
					autoRemoveTimersRef.current.set(notification.id, timer);
				}

				return updated;
			});
		},
		[removeToast]
	);

	// ✅ FUNCIÓN OPTIMIZADA PARA REFRESH (CON THROTTLING)
	const checkForNewNotifications = useCallback(async () => {
		if (!isAuthenticated) return;

		const now = Date.now();
		// Throttling: máximo 1 refresh cada 30 segundos
		if (now - lastRefreshRef.current < 30000) {
			return;
		}

		try {
			lastRefreshRef.current = now;
			await refreshUnreadCount();
		} catch (error) {
			console.error("Error refreshing notification count:", error);
		}
	}, [isAuthenticated, refreshUnreadCount]);

	// ✅ EFECTO PRINCIPAL OPTIMIZADO - Solo cambios reales
	useEffect(() => {
		if (!isAuthenticated) {
			// Reset completo
			setToastNotifications([]);
			lastUnreadCountRef.current = 0;
			isInitializedRef.current = false;
			autoRemoveTimersRef.current.forEach((timer) => clearTimeout(timer));
			autoRemoveTimersRef.current.clear();
			return;
		}

		// Configurar el contador inicial sin mostrar toasts
		if (!isInitializedRef.current) {
			lastUnreadCountRef.current = unreadCount;
			isInitializedRef.current = true;
			return;
		}

		const previousCount = lastUnreadCountRef.current;
		const currentCount = unreadCount;

		// Solo procesar si hay cambios REALES
		if (currentCount !== previousCount) {
			// Si hay nuevas notificaciones no leídas
			if (currentCount > previousCount && previousCount >= 0) {
				// Solo mostrar toast si no estamos en la página de notificaciones
				if (window.location.pathname !== "/notifications") {
					// Crear una notificación toast genérica
					const newToast: Notification = {
						id: Date.now(), // ID temporal único
						userId: 0,
						type: "info",
						title: "Nueva notificación",
						message: `Tienes ${currentCount} notificación${currentCount > 1 ? "es" : ""} sin leer`,
						data: {action_url: "/notifications"},
						read: false,
						createdAt: new Date().toISOString(),
					};

					addToastNotification(newToast);
				}
			}

			// Actualizar la referencia
			lastUnreadCountRef.current = currentCount;
		}
	}, [unreadCount, isAuthenticated, addToastNotification]);

	// ✅ EFECTO PARA REFRESH PERIÓDICO (REDUCIDO)
	useEffect(() => {
		if (!isAuthenticated) return;

		// Refresh cada 2 minutos (en lugar de cada 1 minuto)
		const interval = setInterval(() => {
			checkForNewNotifications();
		}, 120000); // 2 minutos

		return () => clearInterval(interval);
	}, [isAuthenticated, checkForNewNotifications]);

	// ✅ EFECTO PARA LIMPIAR TOASTS EN NAVEGACIÓN (OPTIMIZADO)
	useEffect(() => {
		const handleRouteChange = () => {
			if (window.location.pathname === "/notifications") {
				clearAllToasts();
			}
		};

		// Verificar ruta actual
		handleRouteChange();

		// Monitorear cambios de ruta (simplificado)
		const originalPushState = window.history.pushState;
		const originalReplaceState = window.history.replaceState;

		window.history.pushState = function (...args) {
			originalPushState.apply(window.history, args);
			setTimeout(handleRouteChange, 0);
		};

		window.history.replaceState = function (...args) {
			originalReplaceState.apply(window.history, args);
			setTimeout(handleRouteChange, 0);
		};

		window.addEventListener("popstate", handleRouteChange);

		return () => {
			window.history.pushState = originalPushState;
			window.history.replaceState = originalReplaceState;
			window.removeEventListener("popstate", handleRouteChange);
		};
	}, [clearAllToasts]);

	// ✅ CLEANUP AL DESMONTAR
	useEffect(() => {
		return () => {
			autoRemoveTimersRef.current.forEach((timer) => clearTimeout(timer));
			autoRemoveTimersRef.current.clear();
		};
	}, []);

	return {
		toastNotifications,
		removeToast,
		clearAllToasts,
	};
};
