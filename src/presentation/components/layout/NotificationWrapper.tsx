// src/presentation/components/layout/NotificationWrapper.tsx - VERSIÓN SIMPLIFICADA SIN BUCLES
import React, {useEffect, useRef, useCallback} from "react";
import {useToast} from "../UniversalToast";
import { NotificationType } from '../../types/NotificationTypes';
import {useAuth} from "../../hooks/useAuth";
import {useNotifications} from "../../hooks/useNotifications";

interface NotificationWrapperProps {
	children: React.ReactNode;
}

/**
 * Wrapper simplificado para notificaciones SIN bucles infinitos
 */
const NotificationWrapper: React.FC<NotificationWrapperProps> = ({
	children,
}) => {
	const {showToast} = useToast();
	const {isAuthenticated} = useAuth();
	const {unreadCount} = useNotifications();

	// Referencias para control
	const lastUnreadCountRef = useRef<number>(0);
	const isInitializedRef = useRef<boolean>(false);
	const currentToastIdRef = useRef<string | null>(null);

	// Verificar si estamos en página de notificaciones (SIN USAR EFFECTS)
	const isOnNotificationsPage = window.location.pathname === "/notifications";

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

			const toastId = Date.now().toString();
			currentToastIdRef.current = toastId;

			showToast(NotificationType.INFO, `Tienes ${newCount} notificación${newCount > 1 ? "es" : ""} sin leer`, {
				duration: 5000,
				actionButton: {
					label: 'Ver notificaciones',
					onClick: () => {
						window.location.href = '/notifications';
					}
				}
			});

			// Limpiar referencia después de 5 segundos
			setTimeout(() => {
				if (currentToastIdRef.current === toastId) {
					currentToastIdRef.current = null;
				}
			}, 5000);
		},
		[showToast, isOnNotificationsPage, isAuthenticated]
	);

	// Efecto principal SIMPLIFICADO
	useEffect(() => {
		if (!isAuthenticated) {
			// Reset al desautenticar
			lastUnreadCountRef.current = 0;
			isInitializedRef.current = false;
			currentToastIdRef.current = null;
			return;
		}

		// Limpiar toast activo si estamos en página de notificaciones
		if (isOnNotificationsPage) {
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

	return <>{children}</>;
};

export default NotificationWrapper;