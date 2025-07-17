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
import {useHeaderCounters} from "../../hooks/useHeaderCounters";
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
 * Componente Header reutilizable para dashboards OPTIMIZADO
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({
	toggleSidebar,
	isAdmin = false,
	unreadNotifications,
	notifications = [],
	pendingActions = {},
	onReadAllNotifications = () => {},
	visibleInMobile = true,
}) => {
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const {user, logout} = useContext(AuthContext);
	const {currentPageTitle} = useDashboard();

	// ✅ USAR EL HOOK UNIFICADO OPTIMIZADO - CORRECCIÓN PRINCIPAL
	const {counters, loading: countersLoading} = useHeaderCounters();

	// ✅ USAR EL CONTADOR DE NOTIFICACIONES DEL HOOK OPTIMIZADO
	// Si se pasa unreadNotifications como prop, usar eso, sino usar del hook
	const finalUnreadNotifications =
		unreadNotifications !== undefined
			? unreadNotifications
			: counters.notificationCount;

	console.log("DashboardHeader: Contadores optimizados", {
		finalUnreadNotifications,
		propsUnread: unreadNotifications,
		hookUnread: counters.notificationCount,
		isAdmin,
		loading: countersLoading,
	});

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
			? "bg-red-100 text-red-600"
			: "bg-primary-100 text-primary-600";
	};

	return (
		<header className="bg-white shadow-sm z-20">
			<div className="flex items-center justify-between px-4 py-3">
				<div className="flex items-center">
					{visibleInMobile && (
						<button
							className="md:hidden text-gray-600 focus:outline-none mr-3"
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

					<h1 className="text-lg font-medium text-gray-800">
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
							className="text-gray-600 hover:text-gray-900 hidden md:block"
						>
							<span className="text-sm">Visitar Tienda</span>
						</a>
					)}

					{/* ✅ NOTIFICACIONES OPTIMIZADAS - CORRECCIÓN PRINCIPAL */}
					<div className="relative">
						<button
							className="notifications-button text-gray-600 hover:text-gray-900 p-1 rounded-full relative"
							onClick={toggleNotifications}
						>
							<Bell size={20} />
							{finalUnreadNotifications > 0 && (
								<span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
									{finalUnreadNotifications > 9
										? "9+"
										: finalUnreadNotifications}
								</span>
							)}
							{/* ✅ INDICADOR DE LOADING PARA CONTADORES */}
							{countersLoading && (
								<span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
									<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
								</span>
							)}
						</button>

						{/* Dropdown de notificaciones */}
						{isNotificationsOpen && (
							<div className="notifications-menu absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-30 border border-gray-200">
								<div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
									<h3 className="text-sm font-semibold text-gray-800">
										Notificaciones
									</h3>
									{finalUnreadNotifications > 0 && (
										<button
											className="text-xs text-primary-600 hover:underline"
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
												className={`px-4 py-3 hover:bg-gray-50 ${
													!notification.read && notification.type === "warning"
														? "border-l-4 border-red-500"
														: !notification.read
															? "border-l-4 border-primary-500"
															: ""
												}`}
											>
												<p className="text-sm text-gray-800 font-medium">
													{notification.title}
												</p>
												<p className="text-xs text-gray-500">
													{notification.description}
												</p>
												<p className="text-xs text-gray-400 mt-1">
													{notification.time}
												</p>
											</div>
										))
									) : (
										<div className="px-4 py-8 text-center">
											{countersLoading ? (
												<div className="flex items-center justify-center">
													<div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 mr-2"></div>
													<span className="text-gray-500 text-sm">
														Cargando notificaciones...
													</span>
												</div>
											) : (
												<div className="text-gray-500">
													<Bell size={24} className="mx-auto mb-2 opacity-50" />
													<p className="text-sm">
														No hay notificaciones para mostrar
													</p>
												</div>
											)}
										</div>
									)}
								</div>
								<div className="px-4 py-2 border-t border-gray-200">
									<Link
										to={
											isAdmin ? "/admin/notifications" : "/seller/notifications"
										}
										className="text-sm text-primary-600 hover:underline block text-center"
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
							className="profile-button flex items-center space-x-2 text-gray-800 focus:outline-none"
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
							<div className="profile-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-30 border border-gray-200">
								<div className="px-4 py-3 border-b border-gray-200">
									<p className="text-sm font-medium text-gray-800">
										{user?.name || (isAdmin ? "Admin" : "Usuario")}
									</p>
									<p className="text-xs text-gray-500 truncate">
										{user?.email ||
											(isAdmin ? "admin@ejemplo.com" : "usuario@ejemplo.com")}
									</p>
								</div>

								<Link
									to={isAdmin ? "/admin/profile" : "/seller/profile"}
									className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									onClick={() => setIsProfileMenuOpen(false)}
								>
									<div className="flex items-center">
										<User size={16} className="mr-2" />
										Mi Perfil
									</div>
								</Link>

								<Link
									to={isAdmin ? "/admin/settings" : "/seller/settings"}
									className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
									onClick={() => setIsProfileMenuOpen(false)}
								>
									<div className="flex items-center">
										<Settings size={16} className="mr-2" />
										Configuración
									</div>
								</Link>

								<button
									onClick={logout}
									className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
