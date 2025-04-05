import React, {useState, useEffect, useContext} from "react";
import {Outlet, Link, useNavigate, useLocation} from "react-router-dom";
import {
	Package,
	ShoppingBag,
	Star,
	User,
	FileText,
	MessageSquare,
	BarChart2,
	Settings,
	Bell,
	Menu,
	X,
	ChevronDown,
	LogOut,
	DollarSign,
	Truck,
} from "lucide-react";
import {AuthContext} from "../contexts/AuthContext";
import ThemeToggle from "../components/common/ThemeToggle";

/**
 * Seller Layout Component
 * Layout for authenticated seller dashboard
 */
const SellerLayout: React.FC = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [unreadNotifications, setUnreadNotifications] = useState(0);
	const {user, isAuthenticated, logout} = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();

	// Fetch unread notifications count on mount
	useEffect(() => {
		// This would be replaced with your actual notification fetching logic
		const fetchNotificationCount = async () => {
			try {
				// Example API call
				// const response = await axios.get('/api/seller/notifications/count');
				// setUnreadNotifications(response.data.count);

				// Temporarily set to a random number between 0 and 5 for demonstration
				setUnreadNotifications(Math.floor(Math.random() * 6));
			} catch (error) {
				console.error("Error fetching notifications:", error);
			}
		};

		if (isAuthenticated) {
			fetchNotificationCount();
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
		return user?.name?.charAt(0).toUpperCase() || "S";
	};

	// Check if a navigation item is active
	const isActive = (path: string) => {
		return location.pathname.startsWith(path);
	};

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
				className={`bg-white dark:bg-gray-800 shadow-lg w-64 transition-all duration-300 ease-in-out ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} fixed md:relative inset-y-0 left-0 z-30 flex flex-col`}
			>
				{/* Logo and brand */}
				<div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
					<Link to="/seller/dashboard" className="flex items-center space-x-2">
						<Package className="w-7 h-7 text-primary-600 dark:text-primary-400" />
						<span className="text-xl font-bold text-gray-900 dark:text-white">
							Portal del Vendedor
						</span>
					</Link>
					<button
						className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						onClick={toggleSidebar}
					>
						<X size={20} />
					</button>
				</div>

				{/* Navigation links */}
				<nav className="flex-1 px-4 py-6 overflow-y-auto">
					<div className="space-y-8">
						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
								Principal
							</h3>

							<Link
								to="/seller/dashboard"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/dashboard")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<BarChart2 className="w-5 h-5 mr-3" />
								Dashboard
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
								Productos
							</h3>

							<Link
								to="/seller/products"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/products") &&
									!isActive("/seller/products/create")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<Package className="w-5 h-5 mr-3" />
								Todos los Productos
							</Link>

							<Link
								to="/seller/products/create"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/products/create")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<Package className="w-5 h-5 mr-3" />
								Añadir Producto
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
								Pedidos
							</h3>

							<Link
								to="/seller/orders"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/orders")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<ShoppingBag className="w-5 h-5 mr-3" />
								Pedidos
							</Link>

							<Link
								to="/seller/shipping"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/shipping")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<Truck className="w-5 h-5 mr-3" />
								Envíos
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
								Clientes
							</h3>

							<Link
								to="/seller/ratings"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/ratings")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<Star className="w-5 h-5 mr-3" />
								Valoraciones y Reseñas
							</Link>

							<Link
								to="/seller/messages"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/messages")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<MessageSquare className="w-5 h-5 mr-3" />
								Mensajes
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
								Finanzas
							</h3>

							<Link
								to="/seller/invoices"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/invoices")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<FileText className="w-5 h-5 mr-3" />
								Facturas
							</Link>

							<Link
								to="/seller/earnings"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/earnings")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<DollarSign className="w-5 h-5 mr-3" />
								Ganancias
							</Link>
						</div>

						<div className="space-y-2">
							<h3 className="px-3 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">
								Cuenta
							</h3>

							<Link
								to="/seller/profile"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/profile")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<User className="w-5 h-5 mr-3" />
								Perfil
							</Link>

							<Link
								to="/seller/settings"
								className={`flex items-center px-3 py-2 rounded-md ${
									isActive("/seller/settings")
										? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
										: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
								}`}
							>
								<Settings className="w-5 h-5 mr-3" />
								Configuración
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
							<h1 className="text-lg font-medium text-gray-800 dark:text-white">
								{/* Dynamic section title based on current path */}
								{location.pathname.includes("/seller/dashboard") && "Dashboard"}
								{location.pathname.includes("/seller/products") &&
									!location.pathname.includes("/create") &&
									"Productos"}
								{location.pathname.includes("/seller/products/create") &&
									"Añadir Nuevo Producto"}
								{location.pathname.includes("/seller/orders") && "Pedidos"}
								{location.pathname.includes("/seller/ratings") &&
									"Valoraciones y Reseñas"}
								{location.pathname.includes("/seller/messages") && "Mensajes"}
								{location.pathname.includes("/seller/invoices") && "Facturas"}
								{location.pathname.includes("/seller/profile") && "Mi Perfil"}
								{location.pathname.includes("/seller/settings") &&
									"Configuración"}
								{location.pathname.includes("/seller/shipping") && "Envíos"}
								{location.pathname.includes("/seller/earnings") && "Ganancias"}
							</h1>
						</div>

						<div className="flex items-center space-x-4">
							{/* Theme toggle */}
							<ThemeToggle />

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
											<div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-primary-500">
												<p className="text-sm text-gray-800 dark:text-white font-medium">
													Nuevo pedido recibido
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													Pedido #12345 - 2 artículos
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
													hace 10 minutos
												</p>
											</div>
											<div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
												<p className="text-sm text-gray-800 dark:text-white font-medium">
													Nueva valoración
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													Alguien calificó tu producto con 5 estrellas
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
													hace 1 hora
												</p>
											</div>
											<div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
												<p className="text-sm text-gray-800 dark:text-white font-medium">
													Pago recibido
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													Pago para el pedido #12340 confirmado
												</p>
												<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
													hace 2 horas
												</p>
											</div>
										</div>
										<div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
											<Link
												to="/seller/notifications"
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
									<div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-medium">
										{getInitial()}
									</div>
									<span className="hidden md:block font-medium">
										{user?.name || "Seller"}
									</span>
									<ChevronDown size={18} className="hidden md:block" />
								</button>

								{/* User Dropdown Menu */}
								{isProfileMenuOpen && (
									<div className="profile-menu absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-30 border border-gray-200 dark:border-gray-700">
										<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
											<p className="text-sm font-medium text-gray-800 dark:text-white">
												{user?.name || "Vendedor"}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
												{user?.email || "vendedor@ejemplo.com"}
											</p>
										</div>

										<Link
											to="/seller/profile"
											className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
											onClick={() => setIsProfileMenuOpen(false)}
										>
											<div className="flex items-center">
												<User size={16} className="mr-2" />
												Mi Perfil
											</div>
										</Link>

										<Link
											to="/seller/settings"
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
						&copy; {new Date().getFullYear()} Portal de Vendedor BCommerce.
						Todos los derechos reservados.
					</p>
				</footer>
			</div>
		</div>
	);
};

export default SellerLayout;
