import React, {useState, useEffect, useContext} from "react";
import {Outlet, Link, useNavigate, useLocation} from "react-router-dom";
import {
	Users,
	Package,
	ShoppingBag,
	Tag,
	User,
	FileText,
	Shield,
	Star,
	Settings,
	Bell,
	Menu,
	X,
	ChevronDown,
	LogOut,
	BarChart2,
	DollarSign,
	MessageSquare,
	AlertTriangle,
	Truck,
	Briefcase,
} from "lucide-react";
import {AuthContext} from "../contexts/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";

/**
 * Admin Layout Component
 * Layout for authenticated admin dashboard
 */
const AdminLayout: React.FC = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [unreadNotifications, setUnreadNotifications] = useState(0);
	const [pendingActions, setPendingActions] = useState({
		ratings: 0,
		feedback: 0,
		sellerRequests: 0,
	});
	const {user, isAuthenticated, logout} = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();

	// Fetch unread notifications count on mount
	useEffect(() => {
		// This would be replaced with your actual notification fetching logic
		const fetchNotificationCount = async () => {
			try {
				// Example API call
				// const response = await axios.get('/api/admin/notifications/count');
				// setUnreadNotifications(response.data.count);

				// Temporarily set to a random number between 0 and 10 for demonstration
				setUnreadNotifications(Math.floor(Math.random() * 11));
			} catch (error) {
				console.error("Error fetching notifications:", error);
			}
		};

		// Fetch pending actions counts
		const fetchPendingActions = async () => {
			try {
				// Example API calls
				// const ratingsResponse = await axios.get('/api/admin/ratings/pending/count');
				// const feedbackResponse = await axios.get('/api/admin/feedback/pending/count');
				// const sellerResponse = await axios.get('/api/admin/sellers/pending/count');

				// Temporarily set to random numbers for demonstration
				setPendingActions({
					ratings: Math.floor(Math.random() * 6),
					feedback: Math.floor(Math.random() * 4),
					sellerRequests: Math.floor(Math.random() * 3),
				});
			} catch (error) {
				console.error("Error fetching pending actions:", error);
			}
		};

		if (isAuthenticated) {
			fetchNotificationCount();
			fetchPendingActions();
		}
	}, [isAuthenticated]);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const toggleProfileMenu = () => {
		setIsProfileMenuOpen(!isProfileMenuOpen);
		if (isNotificationsOpen) setIsNotificationsOpen(false);
	};

	const toggleNotifications = () => {
		setIsNotificationsOpen(!isNotificationsOpen);
		if (isProfileMenuOpen) setIsProfileMenuOpen(false);
	};

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	// Get the first letter of the user's name for the avatar
	const getInitial = () => {
		return user?.name?.charAt(0).toUpperCase() || "A";
	};

	// Check if a navigation item is active
	const isActive = (path: string) => {
		return location.pathname.startsWith(path);
	};

	// Calculate total pending actions
	const totalPendingActions =
		pendingActions.ratings +
		pendingActions.feedback +
		pendingActions.sellerRequests;

	// Close menus when clicking outside
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

	return (
		<div className="flex h-screen bg-gray-100 dark:bg-gray-900">
			{/* Sidebar */}
			<aside
				className={`bg-gray-900 text-white w-64 transition-all duration-300 ease-in-out ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} fixed md:relative inset-y-0 left-0 z-30 flex flex-col`}
			>
				{/* Logo and brand */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
					<Link to="/admin/dashboard" className="flex items-center space-x-2">
						<Shield className="w-7 h-7 text-primary-400" />
						<span className="text-xl font-bold">
							Panel de Administración (Admin)
						</span>
					</Link>
					<button
						className="md:hidden text-gray-400 hover:text-white"
						onClick={toggleSidebar}
					>
						<X size={20} />
					</button>
				</div>

				{/* Navigation links */}
				<nav className="flex-1 px-4 py-6 overflow-y-auto">
					<div className="space-y-8">
						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-400 uppercase">
								Principal
							</h3>

							<Link
								to="/admin/dashboard"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/dashboard")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<BarChart2 className="w-5 h-5 mr-3" />
								Dashboard
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-400 uppercase">
								Gestión de Usuario
							</h3>

							<Link
								to="/admin/users"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/users")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<Users className="w-5 h-5 mr-3" />
								Usuarios
							</Link>

							<Link
								to="/admin/sellers"
								className={`flex items-center justify-between px-3 py-2 rounded-md ${
									isActive("/admin/sellers")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<div className="flex items-center">
									<Briefcase className="w-5 h-5 mr-3" />
									Vendedores
								</div>
								{pendingActions.sellerRequests > 0 && (
									<span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
										{pendingActions.sellerRequests}
									</span>
								)}
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-400 uppercase">
								Productos
							</h3>

							<Link
								to="/admin/products"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/products")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<Package className="w-5 h-5 mr-3" />
								Productos
							</Link>

							<Link
								to="/admin/categories"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/categories")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<Tag className="w-5 h-5 mr-3" />
								Categorías
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-400 uppercase">
								Pedidos
							</h3>

							<Link
								to="/admin/orders"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/orders")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<ShoppingBag className="w-5 h-5 mr-3" />
								Pedidos
							</Link>

							<Link
								to="/admin/shipping"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/shipping")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<Truck className="w-5 h-5 mr-3" />
								Envíos
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-400 uppercase">
								Contenido
							</h3>

							<Link
								to="/admin/ratings"
								className={`flex items-center justify-between px-3 py-2 rounded-md ${
									isActive("/admin/ratings")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<div className="flex items-center">
									<Star className="w-5 h-5 mr-3" />
									Valoraciones y Reseñas
								</div>
								{pendingActions.ratings > 0 && (
									<span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
										{pendingActions.ratings}
									</span>
								)}
							</Link>

							<Link
								to="/admin/feedback"
								className={`flex items-center justify-between px-3 py-2 rounded-md ${
									isActive("/admin/feedback")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<div className="flex items-center">
									<MessageSquare className="w-5 h-5 mr-3" />
									Feedback y Comentarios
								</div>
								{pendingActions.feedback > 0 && (
									<span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
										{pendingActions.feedback}
									</span>
								)}
							</Link>

							<Link
								to="/admin/discounts"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/discounts")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<DollarSign className="w-5 h-5 mr-3" />
								Descuentos
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-400 uppercase">
								Finanzas
							</h3>

							<Link
								to="/admin/invoices"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/invoices")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<FileText className="w-5 h-5 mr-3" />
								Facturas
							</Link>

							<Link
								to="/admin/accounting"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/accounting")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<DollarSign className="w-5 h-5 mr-3" />
								Contabilidad
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-400 uppercase">
								Sistema
							</h3>

							<Link
								to="/admin/settings"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/settings")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<Settings className="w-5 h-5 mr-3" />
								Configuración
							</Link>

							<Link
								to="/admin/logs"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/admin/logs")
										? "bg-gray-800 text-white"
										: "text-gray-300 hover:bg-gray-800 hover:text-white"
								}`}
							>
								<AlertTriangle className="w-5 h-5 mr-3" />
								Registros de Errores
							</Link>
						</div>
					</div>
				</nav>
			</aside>

			{/* Main Content */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Header */}
				<header className="bg-white dark:bg-gray-800 shadow-sm z-20">
					<div className="flex items-center justify-between px-4 py-3">
						<div className="flex items-center">
							<button
								className="md:hidden text-gray-600 dark:text-gray-300 focus:outline-none mr-3"
								onClick={toggleSidebar}
							>
								<Menu size={24} />
							</button>

							{/* Pending actions indicator */}
							{totalPendingActions > 0 && (
								<div className="flex items-center mr-4">
									<span className="bg-red-500 text-white text-sm font-medium rounded-md px-2 py-1 flex items-center">
										<AlertTriangle size={16} className="mr-1" />
										{totalPendingActions} pending {totalPendingActions} acción
										{totalPendingActions === 1 ? "" : "es"} pendiente
										{totalPendingActions === 1 ? "" : "s"}
									</span>
								</div>
							)}

							<h1 className="text-lg font-medium text-gray-800 dark:text-white">
								{/* Dynamic section title based on current path */}
								{location.pathname.includes("/admin/dashboard") && "Dashboard"}
								{location.pathname.includes("/admin/users") &&
									"Gestión de Usuarios"}
								{location.pathname.includes("/admin/sellers") &&
									"Gestión de Vendedores"}
								{location.pathname.includes("/admin/products") &&
									"Gestión de Productos"}
								{location.pathname.includes("/admin/categories") &&
									"Gestión de Categorías"}
								{location.pathname.includes("/admin/orders") &&
									"Gestión de Pedidos"}
								{location.pathname.includes("/admin/ratings") &&
									"Moderación de Valoraciones y Reseñas"}
								{location.pathname.includes("/admin/feedback") &&
									"Gestión de Comentarios"}
								{location.pathname.includes("/admin/discounts") &&
									"Códigos de Descuento"}
								{location.pathname.includes("/admin/invoices") && "Facturas"}
								{location.pathname.includes("/admin/accounting") &&
									"Contabilidad"}
								{location.pathname.includes("/admin/settings") &&
									"Configuración del Sistema"}
								{location.pathname.includes("/admin/logs") && "Registro de Errores"}
							</h1>
						</div>

						<div className="flex items-center space-x-4">
							{/* Theme toggle */}
							<ThemeToggle />

							{/* Visit store */}
							<a
								href="/"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hidden md:block"
							>
								<span className="text-sm">Visitar Tienda</span>
							</a>

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

								{/* Notifications Dropdown */}
								{isNotificationsOpen && (
									<div className="notifications-menu absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-30 border border-gray-200 dark:border-gray-700">
										<div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
											<h3 className="text-sm font-semibold text-gray-800 dark:text-white">
												Notificaciones
											</h3>
											{unreadNotifications > 0 && (
												<button className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
													Marcar todas como leídas
												</button>
											)}
										</div>
										<div className="max-h-96 overflow-y-auto">
											{/* Sample notifications - replace with actual data */}
											<div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-red-500">
												<p className="text-sm text-gray-800 dark:text-white font-medium">
													Nueva solicitud de verificación de vendedor
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													El vendedor "TechGadgets" necesita aprobación
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
													Hace 5 minutos
												</p>
											</div>
											<div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
												<p className="text-sm text-gray-800 dark:text-white font-medium">
													Reseña necesita moderación
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													Nueva valoración de 1 estrella para "Auriculares
													Inalámbricos"
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
													Hace 30 minutos
												</p>
											</div>
											<div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
												<p className="text-sm text-gray-800 dark:text-white font-medium">
													Alerta del sistema
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													Problemas de conectividad con la pasarela de pago
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
													Hace 1 hora
												</p>
											</div>
										</div>
										<div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
											<Link
												to="/admin/notifications"
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
									<div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-300 font-medium">
										{getInitial()}
									</div>
									<span className="hidden md:block font-medium">
										{user?.name || "Admin"}
									</span>
									<ChevronDown size={18} className="hidden md:block" />
								</button>

								{/* User Dropdown Menu */}
								{isProfileMenuOpen && (
									<div className="profile-menu absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-30 border border-gray-200 dark:border-gray-700">
										<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
											<p className="text-sm font-medium text-gray-800 dark:text-white">
												{user?.name || "Admin"}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
												{user?.email || "admin@ejemplo.com"}
											</p>
										</div>

										<Link
											to="/admin/profile"
											className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
											onClick={() => setIsProfileMenuOpen(false)}
										>
											<div className="flex items-center">
												<User size={16} className="mr-2" />
												Mi Perfil
											</div>
										</Link>

										<Link
											to="/admin/settings"
											className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
											onClick={() => setIsProfileMenuOpen(false)}
										>
											<div className="flex items-center">
												<Settings size={16} className="mr-2" />
												Configuración
											</div>
										</Link>

										<button
											onClick={handleLogout}
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

				{/* Main Content */}
				<main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
					<Outlet />
				</main>

				{/* Footer */}
				<footer className="bg-white dark:bg-gray-800 py-3 px-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
					<p>
						&copy; {new Date().getFullYear()} Panel de Administración BCommerce.
						Todos los derechos reservados.
					</p>
				</footer>
			</div>
		</div>
	);
};

export default AdminLayout;
