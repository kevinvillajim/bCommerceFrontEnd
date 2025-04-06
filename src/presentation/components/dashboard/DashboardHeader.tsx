import React, {useState, useEffect, useContext} from "react";
import {Link} from "react-router-dom";
import {
	User,
	Settings,
	Bell,
	Menu,
	ChevronDown,
	LogOut,
	AlertTriangle,
} from "lucide-react";
import {AuthContext} from "../../contexts/AuthContext";
import ThemeToggle from "../common/ThemeToggle";
import {useDashboard} from "./DashboardContext";

/**
 * Tipos de notificaciones para mostrar en el panel
 */
export interface Notification {
	id: string;
	title: string;
	description: string;
	time: string;
	read: boolean;
	type?: "default" | "warning" | "error" | "success";
}

/**
 * Tipos de acciones pendientes para mostrar en la parte superior
 */
export interface PendingActions {
	[key: string]: number;
}

interface DashboardHeaderProps {
	toggleSidebar: () => void;
	isAdmin?: boolean;
	unreadNotifications?: number;
	notifications?: Notification[];
	pendingActions?: PendingActions;
	onReadAllNotifications?: () => void;
	visibleInMobile?: boolean;
}

/**
 * Componente Header reutilizable para dashboards
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	toggleSidebar,
	isAdmin = false,
	unreadNotifications = 0,
	notifications = [],
	pendingActions = {},
	onReadAllNotifications = () => {},
	visibleInMobile = true,
}) => {
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const {user, logout} = useContext(AuthContext);
	const {currentPageTitle} = useDashboard();

	// Calcular total de acciones pendientes
	const totalPendingActions = Object.values(pendingActions).reduce(
		(total, value) => total + (value || 0),
		0
	);

	const toggleProfileMenu = () => {
		setIsProfileMenuOpen(!isProfileMenuOpen);
		if (isNotificationsOpen) setIsNotificationsOpen(false);
	};

	const toggleNotifications = () => {
		setIsNotificationsOpen(!isNotificationsOpen);
		if (isProfileMenuOpen) setIsProfileMenuOpen(false);
	};

	// Obtener la inicial del nombre del usuario para el avatar
	const getInitial = () => {
		return user?.name?.charAt(0).toUpperCase() || (isAdmin ? "A" : "U");
	};

	// Cerrar menús al hacer clic fuera
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Element;

			if (
				!target.closest(".profile-menu") &&
				!target.closest(".profile-button")
			) {
				setIsProfileMenuOpen(false);
			}

			if (
				!target.closest(".notifications-menu") &&
				!target.closest(".notifications-button")
			) {
				setIsNotificationsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Obtener el color del avatar basado en el rol
	const getAvatarColor = () => {
		return isAdmin
			? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
			: "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300";
	};

	return (
		<header className="bg-white dark:bg-gray-800 shadow-sm z-20">
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex items-center">
					{visibleInMobile && (
						<button
							className="md:hidden text-gray-600 dark:text-gray-300 focus:outline-none mr-3"
							onClick={toggleSidebar}
						>
							<Menu size={24} />
						</button>
					)}

					{/* Indicador de acciones pendientes */}
					{totalPendingActions > 0 && (
						<div className="flex items-center mr-4">
							<span className="bg-red-500 text-white text-sm font-medium rounded-md px-2 py-1 flex items-center">
								<AlertTriangle size={16} className="mr-1" />
								{totalPendingActions} acción
								{totalPendingActions === 1 ? "" : "es"} pendiente
								{totalPendingActions === 1 ? "" : "s"}
							</span>
						</div>
					)}

					<h1 className="text-lg font-medium text-gray-800 dark:text-white">
						{currentPageTitle}
					</h1>
				</div>

				<div className="flex items-center space-x-4">
					{/* Theme toggle */}
					<ThemeToggle />

					{/* Visit store - Solo para administradores */}
					{isAdmin && (
						<a
							href="/"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hidden md:block"
						>
							<span className="text-sm">Visitar Tienda</span>
						</a>
					)}

					{/* Notifications */}
					<div className="relative">
						<button
							className="notifications-button text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1 rounded-full relative"
							onClick={toggleNotifications}
						>
							<Bell size={20} />
							{unreadNotifications > 0 && (
								<span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
									{unreadNotifications > 9 ? "9+" : unreadNotifications}
								</span>
							)}
						</button>

						{/* Dropdown de notificaciones */}
						{isNotificationsOpen && (
							<div className="notifications-menu absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-30 border border-gray-200 dark:border-gray-700">
								<div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
									<h3 className="text-sm font-semibold text-gray-800 dark:text-white">
										Notificaciones
									</h3>
									{unreadNotifications > 0 && (
										<button
											className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
											onClick={onReadAllNotifications}
										>
											Marcar todas como leídas
										</button>
									)}
								</div>
								<div className="max-h-96 overflow-y-auto">
									{notifications.length > 0 ? (
										notifications.map((notification) => (
											<div
												key={notification.id}
												className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
													!notification.read && notification.type === "warning"
														? "border-l-4 border-red-500"
														: !notification.read
															? "border-l-4 border-primary-500"
															: ""
												}`}
											>
												<p className="text-sm text-gray-800 dark:text-white font-medium">
													{notification.title}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{notification.description}
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
													{notification.time}
												</p>
											</div>
										))
									) : (
										<div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
											No hay notificaciones para mostrar
										</div>
									)}
								</div>
								<div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
									<Link
										to={
											isAdmin ? "/admin/notifications" : "/seller/notifications"
										}
										className="text-sm text-primary-600 dark:text-primary-400 hover:underline block text-center"
									>
										Ver todas las notificaciones
									</Link>
								</div>
							</div>
						)}
					</div>

					{/* User Profile */}
					<div className="relative">
						<button
							className="profile-button flex items-center space-x-2 text-gray-800 dark:text-white focus:outline-none"
							onClick={toggleProfileMenu}
						>
							<div
								className={`h-8 w-8 rounded-full ${getAvatarColor()} flex items-center justify-center font-medium`}
							>
								{getInitial()}
							</div>
							<span className="hidden md:block font-medium">
								{user?.name || (isAdmin ? "Admin" : "Usuario")}
							</span>
							<ChevronDown size={18} className="hidden md:block" />
						</button>

						{/* User Dropdown Menu */}
						{isProfileMenuOpen && (
							<div className="profile-menu absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-30 border border-gray-200 dark:border-gray-700">
								<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
									<p className="text-sm font-medium text-gray-800 dark:text-white">
										{user?.name || (isAdmin ? "Admin" : "Usuario")}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
										{user?.email ||
											(isAdmin ? "admin@ejemplo.com" : "usuario@ejemplo.com")}
									</p>
								</div>

								<Link
									to={isAdmin ? "/admin/profile" : "/seller/profile"}
									className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									onClick={() => setIsProfileMenuOpen(false)}
								>
									<div className="flex items-center">
										<User size={16} className="mr-2" />
										Mi Perfil
									</div>
								</Link>

								<Link
									to={isAdmin ? "/admin/settings" : "/seller/settings"}
									className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
									onClick={() => setIsProfileMenuOpen(false)}
								>
									<div className="flex items-center">
										<Settings size={16} className="mr-2" />
										Configuración
									</div>
								</Link>

								<button
									onClick={logout}
									className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<div className="flex items-center">
										<LogOut size={16} className="mr-2" />
										Cerrar Sesión
									</div>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default DashboardHeader;
