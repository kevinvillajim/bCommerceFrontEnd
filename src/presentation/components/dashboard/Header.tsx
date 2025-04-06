import React, {useState, useEffect, useContext} from "react";

const Header: React.FC = () => {

    const toggleSidebar = () => {
			setIsSidebarOpen(!isSidebarOpen);
		};

		// Calculate total pending actions
		const totalPendingActions =
			pendingActions.ratings +
			pendingActions.feedback +
			pendingActions.sellerRequests;


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

	return (
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
						{location.pathname.includes("/admin/accounting") && "Contabilidad"}
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
	);
};
