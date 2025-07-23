// src/presentation/components/layout/NotificationWrapper.tsx - VERSIÓN FINAL CORREGIDA
import React, {useState, useEffect, useRef, useCallback, useMemo} from "react";
import {NotificationToastContainer} from "../notifications/NotificationToast";
import {useAuth} from "../../hooks/useAuth";
import {useNotifications} from "../../hooks/useNotifications";
import type {Notification} from "../../../core/domain/entities/Notification";

interface NotificationWrapperProps {
	children: React.ReactNode;
}

/**
 * Wrapper definitivamente corregido para notificaciones
 * ✅ TOASTS SOLO SE MUESTRAN PARA NOTIFICACIONES NUEVAS, NO EN CADA CARGA
 */
const NotificationWrapper: React.FC<NotificationWrapperProps> = ({
	children,
}) => {
	const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);
	const {isAuthenticated} = useAuth();
	const {unreadCount} = useNotifications();

	// ✅ REFS PARA CONTROL ESTRICTO
	const lastUnreadCountRef = useRef<number>(0);
	const isInitializedRef = useRef<boolean>(false);
	const sessionStartCountRef = useRef<number>(0); // Contador al iniciar sesión
	const currentToastIdRef = useRef<number | null>(null);
	const autoRemoveTimerRef = useRef<NodeJS.Timeout | null>(null);

	// ✅ FUNCIÓN PARA VERIFICAR SI LOS TOASTS ESTÁN DESHABILITADOS
	const areToastsDisabled = useCallback((): boolean => {
		// VERIFICACIÓN 1: Si estamos en /notifications
		if (window.location.pathname === "/notifications") {
			try {
				localStorage.setItem('notifications_toasts_disabled', 'true');
			} catch (error) {
				console.error('Error setting localStorage:', error);
			}
			return true;
		}
		
		// VERIFICACIÓN 2: localStorage
		try {
			const disabled = localStorage.getItem('notifications_toasts_disabled');
			return disabled === 'true';
		} catch (error) {
			console.error('Error checking localStorage:', error);
			return false;
		}
	}, []);

	// ✅ FUNCIÓN PARA REMOVER TOAST
	const removeToast = useCallback((id: number) => {
		setToastNotifications((prev) =>
			prev.filter((notification) => notification.id !== id)
		);

		if (currentToastIdRef.current === id) {
			currentToastIdRef.current = null;
		}

		if (autoRemoveTimerRef.current) {
			clearTimeout(autoRemoveTimerRef.current);
			autoRemoveTimerRef.current = null;
		}
	}, []);

	// ✅ FUNCIÓN MEJORADA PARA CREAR TOAST (SOLO PARA AUMENTOS REALES)
	const showNewNotificationToast = useCallback(
		(newCount: number, previousCount: number) => {
			// VERIFICACIÓN PRINCIPAL: Toasts deshabilitados
			if (areToastsDisabled()) {
				console.log("🚫 Toasts deshabilitados - no mostrar");
				return;
			}

			// VERIFICACIÓN CRÍTICA: Solo mostrar si es un AUMENTO REAL desde la sesión
			// No mostrar en cargas iniciales o si el contador baja
			if (previousCount === 0 && newCount > 0 && !isInitializedRef.current) {
				console.log("🚫 Carga inicial - no mostrar toast");
				return;
			}

			// VERIFICACIÓN: Solo aumentos reales
			if (newCount <= previousCount) {
				console.log(`🚫 No es aumento real: ${previousCount} → ${newCount}`);
				return;
			}

			// VERIFICACIÓN: No mostrar si ya hay un toast
			if (currentToastIdRef.current !== null) {
				console.log("🚫 Ya hay toast activo");
				return;
			}

			console.log(`✅ Mostrando toast: ${previousCount} → ${newCount} notificaciones`);

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
			currentToastIdRef.current = toastId;

			// Mostrar el toast
			setToastNotifications([newToast]);

			// Auto-remover después de 6 segundos
			autoRemoveTimerRef.current = setTimeout(() => {
				removeToast(toastId);
			}, 6000);
		},
		[removeToast, areToastsDisabled]
	);

	// ✅ EFECTO PRINCIPAL MEJORADO - SOLO AUMENTOS REALES
	useEffect(() => {
		if (!isAuthenticated) {
			// Reset completo cuando no está autenticado
			setToastNotifications([]);
			lastUnreadCountRef.current = 0;
			sessionStartCountRef.current = 0;
			isInitializedRef.current = false;
			currentToastIdRef.current = null;

			if (autoRemoveTimerRef.current) {
				clearTimeout(autoRemoveTimerRef.current);
				autoRemoveTimerRef.current = null;
			}
			
			// Limpiar localStorage cuando se desautentica
			try {
				localStorage.removeItem('notifications_toasts_disabled');
			} catch (error) {
				console.error('Error clearing localStorage:', error);
			}
			return;
		}

		// ✅ PRIMERA CARGA: Establecer línea base SIN mostrar toasts
		if (!isInitializedRef.current) {
			lastUnreadCountRef.current = unreadCount;
			sessionStartCountRef.current = unreadCount;
			isInitializedRef.current = true;
			console.log(`📊 Sesión iniciada con ${unreadCount} notificaciones (no mostrar toast)`);
			return;
		}

		const previousCount = lastUnreadCountRef.current;
		const currentCount = unreadCount;

		// Solo procesar si hay cambios REALES
		if (currentCount !== previousCount) {
			console.log(`📊 Cambio detectado: ${previousCount} → ${currentCount}`);
			
			// ✅ SOLO MOSTRAR TOAST SI ES UN AUMENTO REAL Y SIGNIFICATIVO
			// No mostrar para decrementos o si estamos en el contador inicial de la sesión
			if (currentCount > previousCount && 
				previousCount >= sessionStartCountRef.current) {
				showNewNotificationToast(currentCount, previousCount);
			} else {
				console.log(`🚫 No mostrar toast: ${previousCount} → ${currentCount} (sesión inició con ${sessionStartCountRef.current})`);
			}

			// Actualizar la referencia
			lastUnreadCountRef.current = currentCount;
		}
	}, [unreadCount, isAuthenticated, showNewNotificationToast]);

	// ✅ EFECTO PARA DESHABILITAR TOASTS AL VISITAR /notifications
	useEffect(() => {
		const handleRouteChange = () => {
			const currentPath = window.location.pathname;
			
			if (currentPath === "/notifications") {
				console.log("📍 Usuario visitó /notifications - deshabilitando toasts permanentemente");
				
				// ✅ DESHABILITAR TOASTS PERMANENTEMENTE
				try {
					localStorage.setItem('notifications_toasts_disabled', 'true');
				} catch (error) {
					console.error('Error setting localStorage:', error);
				}
				
				// Limpiar todos los toasts inmediatamente
				setToastNotifications([]);
				currentToastIdRef.current = null;

				if (autoRemoveTimerRef.current) {
					clearTimeout(autoRemoveTimerRef.current);
					autoRemoveTimerRef.current = null;
				}
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

	// ✅ LISTENER GLOBAL PARA DESHABILITAR TOASTS AL HACER CLICK EN BOTÓN DE NOTIFICACIONES
	useEffect(() => {
		const handleNotificationButtonClick = (event: Event) => {
			const target = event.target as HTMLElement;
			
			// Detectar click en botón de notificaciones
			// Buscar por clases, data attributes, o elementos específicos
			if (target.closest('[data-notification-button]') || 
				target.closest('.notification-button') ||
				target.closest('a[href="/notifications"]') ||
				target.closest('button[onclick*="notifications"]')) {
				
				console.log("🔔 Click en botón de notificaciones detectado - deshabilitando toasts");
				
				try {
					localStorage.setItem('notifications_toasts_disabled', 'true');
				} catch (error) {
					console.error('Error setting localStorage:', error);
				}
				
				// Limpiar toasts inmediatamente
				setToastNotifications([]);
				currentToastIdRef.current = null;

				if (autoRemoveTimerRef.current) {
					clearTimeout(autoRemoveTimerRef.current);
					autoRemoveTimerRef.current = null;
				}
			}
		};

		document.addEventListener('click', handleNotificationButtonClick, true);

		return () => {
			document.removeEventListener('click', handleNotificationButtonClick, true);
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

	// ✅ MEMOIZAR TOAST CONTAINER CON VERIFICACIÓN MEJORADA
	const toastContainer = useMemo(() => {
		// No mostrar si no está autenticado
		if (!isAuthenticated) {
			return null;
		}

		// No mostrar si los toasts están deshabilitados
		if (areToastsDisabled()) {
			return null;
		}

		// No mostrar si no hay toasts
		if (toastNotifications.length === 0) {
			return null;
		}

		return (
			<NotificationToastContainer
				notifications={toastNotifications}
				onRemove={removeToast}
				maxToasts={1}
			/>
		);
	}, [isAuthenticated, toastNotifications, removeToast, areToastsDisabled]);

	return (
		<>
			{children}
			{toastContainer}
		</>
	);
};

export default NotificationWrapper;