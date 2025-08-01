import React, {
	createContext,
	useState,
	useContext,
	useEffect,
} from "react";
import type { ReactNode } from "react";
import {useLocation} from "react-router-dom";
import type {Notification, PendingActions, DashboardType} from "./index";

interface DashboardContextProps {
	// Estado del sidebar
	isSidebarOpen: boolean;
	toggleSidebar: () => void;

	// Estado de notificaciones
	notifications: Notification[];
	unreadNotificationsCount: number;
	addNotification: (notification: Omit<Notification, "id">) => void;
	markAllNotificationsAsRead: () => void;
	markNotificationAsRead: (id: string) => void;

	// Acciones pendientes
	pendingActions: PendingActions;
	setPendingAction: (key: string, value: number) => void;
	incrementPendingAction: (key: string) => void;
	decrementPendingAction: (key: string) => void;

	// Tipo de dashboard actual
	dashboardType: DashboardType;

	// Título dinámico de la página actual
	currentPageTitle: string;
	setPageTitle: (path: string, title: string) => void;
}

// Crear el contexto
const DashboardContext = createContext<DashboardContextProps | undefined>(
	undefined
);

// Props para el proveedor
interface DashboardProviderProps {
	children: ReactNode;
	initialType: DashboardType;
	initialPageTitles?: Record<string, string>;
}

// Generador de ID único para notificaciones
const generateId = (): string => {
	return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Proveedor del contexto del Dashboard
 */
export const DashboardProvider: React.FC<DashboardProviderProps> = ({
	children,
	initialType,
	initialPageTitles = {},
}) => {
	// Estado del sidebar
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	// Tipo de dashboard
	const [dashboardType] = useState<DashboardType>(initialType);

	// Estado de notificaciones
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

	// Acciones pendientes
	const [pendingActions, setPendingActions] = useState<PendingActions>({});

	// Títulos de página
	const [pageTitles, setPageTitles] =
		useState<Record<string, string>>(initialPageTitles);

	// Current pathname para determinar el título actual
	const location = useLocation();

	// Calcular el título actual basado en la ruta
	const getCurrentPageTitle = (): string => {
		const {pathname} = location;

		// Buscar coincidencias exactas primero
		if (pageTitles[pathname]) {
			return pageTitles[pathname];
		}

		// Buscar coincidencias parciales
		for (const [path, title] of Object.entries(pageTitles)) {
			if (pathname.includes(path)) {
				return title;
			}
		}

		// Título por defecto según el tipo de dashboard
		switch (dashboardType) {
			case "admin":
				return "Panel de Administración";
			case "seller":
				return "Portal del Vendedor";
			case "customer":
				return "Mi Cuenta";
			default:
				return "Dashboard";
		}
	};

	// Actualizar el contador de notificaciones no leídas
	useEffect(() => {
		const count = notifications.filter(
			(notification) => !notification.read
		).length;
		setUnreadNotificationsCount(count);
	}, [notifications]);

	// Utilidades y funciones para modificar estados
	const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

	const addNotification = (notification: Omit<Notification, "id">) => {
		const newNotification: Notification = {
			...notification,
			id: generateId(),
		};
		setNotifications((prev) => [newNotification, ...prev]);
	};

	const markAllNotificationsAsRead = () => {
		setNotifications((prev) =>
			prev.map((notification) => ({...notification, read: true}))
		);
	};

	const markNotificationAsRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((notification) =>
				notification.id === id ? {...notification, read: true} : notification
			)
		);
	};

	const setPendingAction = (key: string, value: number) => {
		setPendingActions((prev) => ({...prev, [key]: value}));
	};

	const incrementPendingAction = (key: string) => {
		setPendingActions((prev) => ({
			...prev,
			[key]: (prev[key] || 0) + 1,
		}));
	};

	const decrementPendingAction = (key: string) => {
		setPendingActions((prev) => ({
			...prev,
			[key]: Math.max(0, (prev[key] || 0) - 1),
		}));
	};

	const setPageTitle = (path: string, title: string) => {
		setPageTitles((prev) => ({...prev, [path]: title}));
	};

	// Valor del contexto
	const value: DashboardContextProps = {
		isSidebarOpen,
		toggleSidebar,
		notifications,
		unreadNotificationsCount,
		addNotification,
		markAllNotificationsAsRead,
		markNotificationAsRead,
		pendingActions,
		setPendingAction,
		incrementPendingAction,
		decrementPendingAction,
		dashboardType,
		currentPageTitle: getCurrentPageTitle(),
		setPageTitle,
	};

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
};

/**
 * Hook para usar el contexto del Dashboard
 */
export const useDashboard = () => {
	const context = useContext(DashboardContext);

	if (context === undefined) {
		throw new Error(
			"useDashboard debe ser usado dentro de un DashboardProvider"
		);
	}

	return context;
};

export default DashboardContext;
