// src/presentation/components/layout/NotificationWrapper.tsx - OPTIMIZADO
import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import {NotificationToastContainer} from "../notifications/NotificationToast";
import {useAuth} from "../../hooks/useAuth";
import {useNotifications} from "../../hooks/useNotifications";
import type {Notification} from "../../../core/domain/entities/Notification";

interface NotificationWrapperProps {
	children: React.ReactNode;
}

/**
 * Wrapper optimizado para notificaciones en tiempo real
 * ✅ REDUCIDOS RE-RENDERIZADOS Y LOGS EXCESIVOS
 */
const NotificationWrapper: React.FC<NotificationWrapperProps> = ({
	children,
}) => {
	const [toastNotifications, setToastNotifications] = useState<Notification[]>(
		[]
	);

	const {isAuthenticated} = useAuth();
	const {unreadCount} = useNotifications();

	// ✅ REFS PARA EVITAR RE-RENDERS
	const lastUnreadCountRef = useRef<number>(0);
	const isInitializedRef = useRef<boolean>(false);
	const lastToastTimeRef = useRef<number>(0);
	const currentToastIdRef = useRef<number | null>(null);
	const autoRemoveTimerRef = useRef<NodeJS.Timeout | null>(null);

	// ✅ MEMOIZAR FUNCIONES PARA EVITAR RE-CREACIONES
	const removeToast = useCallback((id: number) => {
		setToastNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);

		// Limpiar la referencia del toast actual si es el que se está removiendo
		if (currentToastIdRef.current === id) {
			currentToastIdRef.current = null;
		}

		// Limpiar timer si existe
		if (autoRemoveTimerRef.current) {
			clearTimeout(autoRemoveTimerRef.current);
			autoRemoveTimerRef.current = null;
		}
	}, []);

	// ✅ FUNCIÓN OPTIMIZADA PARA CREAR TOAST (CONTROLADA)
	const showNewNotificationToast = useCallback(
		(newCount: number) => {
			const now = Date.now();

			// CONTROL 1: No mostrar si ya hay un toast activo
			if (currentToastIdRef.current !== null) {
				return;
			}

			// CONTROL 2: Throttling - mínimo 8 segundos entre toasts
			if (now - lastToastTimeRef.current < 8000) {
				return;
			}

			// CONTROL 3: No mostrar si estamos en la página de notificaciones
			if (window.location.pathname === "/notifications") {
				return;
			}

			// Crear el toast
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

			// Actualizar referencias de control
			lastToastTimeRef.current = now;
			currentToastIdRef.current = toastId;

			// Mostrar el toast
			setToastNotifications([newToast]);

			// Auto-remover después de 6 segundos
			autoRemoveTimerRef.current = setTimeout(() => {
				removeToast(toastId);
			}, 6000);
		},
		[removeToast]
	);

	// ✅ EFECTO PRINCIPAL OPTIMIZADO - Solo cambios reales
	useEffect(() => {
		if (!isAuthenticated) {
			// Reset completo cuando no está autenticado
			setToastNotifications([]);
			lastUnreadCountRef.current = 0;
			isInitializedRef.current = false;
			currentToastIdRef.current = null;

			if (autoRemoveTimerRef.current) {
				clearTimeout(autoRemoveTimerRef.current);
				autoRemoveTimerRef.current = null;
			}
			return;
		}

		// En la primera carga, solo establecer la línea base
		if (!isInitializedRef.current) {
			lastUnreadCountRef.current = unreadCount;
			isInitializedRef.current = true;
			return;
		}

		const previousCount = lastUnreadCountRef.current;
		const currentCount = unreadCount;

		// Solo procesar si hay cambios REALES
		if (currentCount !== previousCount) {
			// Solo mostrar toast si hay MÁS notificaciones que antes
			if (currentCount > previousCount && previousCount >= 0) {
				showNewNotificationToast(currentCount);
			}

			// Actualizar la referencia
			lastUnreadCountRef.current = currentCount;
		}
	}, [unreadCount, isAuthenticated, showNewNotificationToast]);

	// ✅ EFECTO PARA LIMPIAR TOASTS EN NAVEGACIÓN Y ACTUALIZAR CONTADOR (OPTIMIZADO)
	useEffect(() => {
		const handleRouteChange = () => {
			const currentPath = window.location.pathname;
			
			if (currentPath === "/notifications") {
				console.log("📍 Usuario en página de notificaciones - limpiando toasts y actualizando contador");
				
				// Limpiar todos los toasts inmediatamente
				setToastNotifications([]);
				currentToastIdRef.current = null;

				if (autoRemoveTimerRef.current) {
					clearTimeout(autoRemoveTimerRef.current);
					autoRemoveTimerRef.current = null;
				}

				// ✅ NUEVO: Actualizar contador inmediatamente al estar "viendo" las notificaciones
				// Esto hace que la campana se actualice de inmediato sin esperar
				setTimeout(() => {
					// Simular que el usuario está "viendo" las notificaciones
					// El hook useNotifications se encargará de la lógica real
					lastUnreadCountRef.current = 0; // Reset local para evitar toasts adicionales
				}, 100);
			}
		};

		// Verificar ruta actual
		handleRouteChange();

		// Monitorear cambios de ruta
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
	}, []);

	// ✅ CLEANUP AL DESMONTAR
	useEffect(() => {
		return () => {
			if (autoRemoveTimerRef.current) {
				clearTimeout(autoRemoveTimerRef.current);
			}
		};
	}, []);

	// ✅ MEMOIZAR TOAST CONTAINER PARA EVITAR RE-RENDERS
	const toastContainer = useMemo(() => {
		if (!isAuthenticated || toastNotifications.length === 0) {
			return null;
		}

		return (
			<NotificationToastContainer
				notifications={toastNotifications}
				onRemove={removeToast}
				maxToasts={1} // MÁXIMO 1 toast a la vez
			/>
		);
	}, [isAuthenticated, toastNotifications, removeToast]);

	return (
		<>
			{children}
			{toastContainer}
		</>
	);
};

export default NotificationWrapper;
