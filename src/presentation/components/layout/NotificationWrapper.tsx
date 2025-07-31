// src/presentation/components/layout/NotificationWrapper.tsx - VERSIÓN SIMPLIFICADA SIN BUCLES
import React, {useState, useEffect, useRef, useCallback} from "react";
import {NotificationToastContainer} from "../notifications/NotificationToast";
import {useAuth} from "../../hooks/useAuth";
import {useNotifications} from "../../hooks/useNotifications";
import type {Notification} from "../../../core/domain/entities/Notification";

interface NotificationWrapperProps {
	children: React.ReactNode;
}

/**
 * Wrapper simplificado para notificaciones SIN bucles infinitos
 */
const NotificationWrapper: React.FC<NotificationWrapperProps> = ({
	children,
}) => {
	const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
	const {isAuthenticated} = useAuth();
	const {unreadCount} = useNotifications();

	// Referencias para control
	const lastUnreadCountRef = useRef<number>(0);
	const isInitializedRef = useRef<boolean>(false);
	const currentToastIdRef = useRef<number | null>(null);
	const isOnNotificationsPageRef = useRef<boolean>(false);

	// Verificar si estamos en página de notificaciones (SIN USAR EFFECTS)
	const isOnNotificationsPage = window.location.pathname === "/notifications";

	// Función para remover toast
	const removeToast = useCallback((id: number) => {
		setToastNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);

		if (currentToastIdRef.current === id) {
			currentToastIdRef.current = null;
		}
	}, []);

	// Función para mostrar toast (SIMPLIFICADA)
	const showNewNotificationToast = useCallback(
		(newCount: number) => {
			// NO mostrar toasts si estamos en página de notificaciones
			if (isOnNotificationsPage || !isAuthenticated) {
				return;
			}

			// NO mostrar si ya hay un toast activo
			if (currentToastIdRef.current !== null) {
				return;
			}

			const toastId = Date.now();
			const newToast: Notification = {
				id: toastId,
				userId: 0,
				type: "info",
				title: "Nueva notificación",
				message: `Tienes ${newCount} notificación${newCount > 1 ? "es" : ""} sin leer`,
				data: {action_url: "/notifications"},
				read: false,
				createdAt: new Date().toISOString(),
			};

			currentToastIdRef.current = toastId;
			setToastNotifications([newToast]);

			// Auto-remover después de 5 segundos
			setTimeout(() => {
				removeToast(toastId);
			}, 5000);
		},
		[removeToast, isOnNotificationsPage, isAuthenticated]
	);

	// Efecto principal SIMPLIFICADO
	useEffect(() => {
		if (!isAuthenticated) {
			// Reset al desautenticar
			setToastNotifications([]);
			lastUnreadCountRef.current = 0;
			isInitializedRef.current = false;
			currentToastIdRef.current = null;
			return;
		}

		// Actualizar flag de página de notificaciones
		isOnNotificationsPageRef.current = isOnNotificationsPage;

		// Limpiar toasts si estamos en página de notificaciones
		if (isOnNotificationsPage) {
			setToastNotifications([]);
			currentToastIdRef.current = null;
			return;
		}

		// Primera carga: establecer baseline SIN mostrar toast
		if (!isInitializedRef.current) {
			lastUnreadCountRef.current = unreadCount;
			isInitializedRef.current = true;
			console.log(`📊 Sesión iniciada con ${unreadCount} notificaciones`);
			return;
		}

		const previousCount = lastUnreadCountRef.current;
		const currentCount = unreadCount;

		// Solo mostrar toast si hay un AUMENTO REAL
		if (currentCount > previousCount) {
			console.log(`📊 Nuevas notificaciones: ${previousCount} → ${currentCount}`);
			showNewNotificationToast(currentCount);
		}

		// Actualizar referencia
		lastUnreadCountRef.current = currentCount;
	}, [unreadCount, isAuthenticated, showNewNotificationToast, isOnNotificationsPage]);

	// Renderizar toasts solo si no estamos en página de notificaciones
	if (!isAuthenticated || isOnNotificationsPage || toastNotifications.length === 0) {
		return <>{children}</>;
	}

	return (
		<>
			{children}
			<NotificationToastContainer
				notifications={toastNotifications}
				onRemove={removeToast}
				maxToasts={1}
			/>
		</>
	);
};

export default NotificationWrapper;