import React, {useState, useEffect, useRef} from "react";
import {
	ShoppingCart,
	User,
	Menu,
	X,
	Search,
	Heart,
	Bell,
	LogOut,
	Settings,
	ShoppingBag,
} from "lucide-react";
import {useAuth} from "../../hooks/useAuth";
import {useHeaderCounters} from "../../hooks/useHeaderCounters";
import ThemeToggle from "./ThemeToggle";

// Interfaz para el logo
interface Logo {
	img?: string;
	name: string;
}

interface HeaderProps {
	logo?: Logo;
	navLinks?: Array<{
		text: string;
		to: string;
	}>;
}

const Header: React.FC<HeaderProps> = ({
	logo = {
		img: undefined,
		name: "Comersia",
	},
	navLinks = [
		{text: "Inicio", to: "/"},
		{text: "Productos", to: "/products"},
		{text: "Categorías", to: "/categories"},
		{text: "Nosotros", to: "/about"},
		{text: "Contacto", to: "/contact"},
	],
}) => {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const userMenuRef = useRef<HTMLDivElement>(null);

	// Obtener información del usuario y estado de autenticación
	const {user, isAuthenticated, logout} = useAuth();

	// ✅ USAR EL HOOK UNIFICADO OPTIMIZADO
	const {
		counters,
		loading: countersLoading,
		error: countersError,
	} = useHeaderCounters();

	const {cartItemCount, favoriteCount, notificationCount} = counters;
	console.log("Header: Contadores unificados", {
		cartItemCount,
		favoriteCount,
		notificationCount,
		loading: countersLoading,
	});

	// Cerrar el menú de usuario al hacer clic fuera de él
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setUserMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const toggleUserMenu = () => {
		setUserMenuOpen(!userMenuOpen);
	};

	const handleLogout = async () => {
		await logout();
		setUserMenuOpen(false);
	};

	// Componente interno Link para simular react-router-dom
	const Link = ({
		to,
		className,
		children,
		onClick,
	}: {
		to: string;
		className?: string;
		children: React.ReactNode;
		onClick?: () => void;
	}) => (
		<a href={to} className={className} onClick={onClick}>
			{children}
		</a>
	);

	// Obtener la inicial del usuario para el avatar
	const getUserInitial = () => {
		if (user?.name) {
			return user.name.charAt(0).toUpperCase();
		}
		return "U";
	};

	const notificationCountSanitized =
		notificationCount > 99 ? "99" : notificationCount;

	return (
		<header className="bg-white shadow-md sticky top-0 z-50">
			{/* Top Bar */}
			<div className="bg-gray-900 text-white text-sm py-2 top-bar">
				<div className="container mx-auto px-4">
					<div className="flex justify-between items-center">
						<div className="hidden md:block">
							<span>Envío gratis en pedidos superiores a $50</span>
						</div>
						<div className="flex space-x-4 text-xs md:text-sm">
							<a href="tracking" className="hover:underline">
								Seguimiento de pedido
							</a>
							<span>|</span>
							<a href="faq" className="hover:underline">
								Ayuda
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Main Header */}
			<div className="container mx-auto px-4 py-4">
				<div className="flex justify-between items-center">
					{/* Logo */}
					<div className="flex items-center">
						<Link to="/" className="flex items-center">
							{logo.img ? (
								<img src={logo.img} alt={logo.name} className="h-10 w-auto" />
							) : (
								<span className="text-2xl font-bold text-gray-800">
									<span className="text-primary-600">
										{logo.name.charAt(0)}
									</span>
									{logo.name.slice(1)}
								</span>
							)}
						</Link>
					</div>

					{/* Search Bar - Only on desktop */}
					<div className="hidden md:flex flex-1 mx-16 relative">
						<input
							type="text"
							placeholder="Buscar productos..."
							className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
						/>
						<button className="absolute right-3 top-2 text-gray-400 hover:text-primary-600">
							<Search size={20} />
						</button>
					</div>

					{/* Icons - Desktop */}
					<div className="hidden md:flex items-center space-x-6">
						<ThemeToggle />

						{/* ✅ CONTADORES OPTIMIZADOS - Se cargan juntos */}
						{/* Favorites Icon */}
						<Link
							to="/favorites"
							className="text-gray-700 hover:text-primary-600 transition-colors relative"
						>
							<Heart size={22} />
							{favoriteCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
									{favoriteCount}
								</span>
							)}
						</Link>

						{/* Cart Icon */}
						<Link
							to="/cart"
							className="text-gray-700 hover:text-primary-600 transition-colors relative"
						>
							<ShoppingCart size={22} />
							{cartItemCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
									{cartItemCount}
								</span>
							)}
						</Link>

						{isAuthenticated ? (
							<>
								{/* Notifications Icon - Only visible when authenticated */}
								<Link
									to="/notifications"
									className="text-gray-700 hover:text-primary-600 transition-colors relative"
								>
									<Bell size={22} />
									{notificationCount > 0 && (
										<span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
											{notificationCountSanitized}
										</span>
									)}
								</Link>

								{/* User Menu */}
								<div className="relative" ref={userMenuRef}>
									<button
										onClick={toggleUserMenu}
										className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
									>
										<div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
											{getUserInitial()}
										</div>
										<span className="font-medium">
											{user?.name?.split(" ")[0]}
										</span>
									</button>

									{/* User Dropdown Menu */}
									{userMenuOpen && (
										<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100 dropdown-menu">
											<div className="px-4 py-2 border-b border-gray-100">
												<p className="text-sm font-medium">{user?.name}</p>
												<p className="text-xs text-gray-500 truncate">
													{user?.email}
												</p>
											</div>
											<Link
												to="/profile"
												className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dropdown-item"
											>
												<User size={16} className="mr-2" />
												Mi perfil
											</Link>
											<Link
												to="/orders"
												className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dropdown-item"
											>
												<ShoppingBag size={16} className="mr-2" />
												Mis pedidos
											</Link>
											<Link
												to="/favorites"
												className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dropdown-item"
											>
												<Heart size={16} className="mr-2" />
												Mis favoritos
											</Link>
											<button
												onClick={handleLogout}
												className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
											>
												<LogOut size={16} className="mr-2" />
												Cerrar sesión
											</button>
										</div>
									)}
								</div>
							</>
						) : (
							<>
								{/* Login and Register buttons when not authenticated */}
								<Link
									to="/login"
									className="text-gray-700 hover:text-primary-600 transition-colors font-medium"
								>
									Iniciar sesión
								</Link>
								<Link
									to="/register"
									className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm hover:shadow"
								>
									Registrarse
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center space-x-4">
						<ThemeToggle />
						{/* Cart Icon for Mobile */}
						<Link to="/cart" className="text-gray-700 relative">
							<ShoppingCart size={22} />
							{cartItemCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
									{cartItemCount}
								</span>
							)}
						</Link>
						{/* Favorites Icon for Mobile */}
						<Link
							to="/favorites"
							className="text-gray-700 hover:text-primary-600 transition-colors relative"
						>
							<Heart size={22} />
							{favoriteCount > 0 && (
								<span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
									{favoriteCount}
								</span>
							)}
						</Link>
						{/* User Icon for Mobile (only when authenticated) */}
						{isAuthenticated && (
							<div className="h-8 w-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
								{getUserInitial()}
							</div>
						)}

						{/* Menu Toggle Button */}
						<button onClick={toggleMobileMenu} className="text-gray-700">
							{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>
			</div>

			{/* Navigation - Desktop */}
			<nav className="hidden md:block border-t border-gray-100">
				<div className="container mx-auto px-4">
					<div className="flex justify-center items-center py-1">
						<ul className="flex space-x-8">
							{navLinks.map((link, index) => (
								<li key={index}>
									<Link
										to={link.to}
										className="text-gray-700 font-medium hover:text-primary-600 py-2 block transition-colors"
									>
										{link.text}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</nav>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 shadow-lg">
					{/* Mobile Search */}
					<div className="mb-4 relative">
						<input
							type="text"
							placeholder="Buscar productos..."
							className="w-full py-2 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
						/>
						<button className="absolute right-3 top-2 text-gray-400">
							<Search size={20} />
						</button>
					</div>

					{/* Mobile User Info (if authenticated) */}
					{isAuthenticated && (
						<div className="mb-6 pb-4 border-b border-gray-200">
							<div className="flex items-center space-x-3 mb-3">
								<div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
									{getUserInitial()}
								</div>
								<div>
									<p className="font-medium">{user?.name}</p>
									<p className="text-xs text-gray-500 truncate">
										{user?.email}
									</p>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-2 mb-2">
								<Link
									to="/profile"
									className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50"
									onClick={toggleMobileMenu}
								>
									<User size={20} className="mb-1 text-gray-700" />
									<span className="text-xs">Perfil</span>
								</Link>
								<Link
									to="/orders"
									className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50"
									onClick={toggleMobileMenu}
								>
									<ShoppingBag size={20} className="mb-1 text-gray-700" />
									<span className="text-xs">Pedidos</span>
								</Link>
								<Link
									to="/favorites"
									className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50"
									onClick={toggleMobileMenu}
								>
									<Heart size={20} className="mb-1 text-gray-700" />
									<span className="text-xs">Favoritos</span>
								</Link>
							</div>
						</div>
					)}

					{/* Mobile Navigation */}
					<ul className="space-y-3 mb-4">
						{navLinks.map((link, index) => (
							<li key={index}>
								<Link
									to={link.to}
									className="text-gray-700 font-medium hover:text-primary-600 py-2 block"
									onClick={toggleMobileMenu}
								>
									{link.text}
								</Link>
							</li>
						))}
					</ul>

					{/* Mobile Auth Buttons or Logout */}
					{isAuthenticated ? (
						<button
							onClick={() => {
								handleLogout();
								toggleMobileMenu();
							}}
							className="w-full text-center py-2 text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
						>
							<LogOut size={16} className="inline-block mr-2" />
							Cerrar sesión
						</button>
					) : (
						<div className="space-y-2">
							<Link
								to="/login"
								className="block text-center py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
								onClick={toggleMobileMenu}
							>
								Iniciar sesión
							</Link>
							<Link
								to="/register"
								className="block text-center py-2 bg-primary-600 rounded-lg text-white hover:bg-primary-700 transition-colors"
								onClick={toggleMobileMenu}
							>
								Registrarse
							</Link>
						</div>
					)}
				</div>
			)}

			{/* ✅ MOSTRAR ERROR DE CONTADORES SI EXISTE */}
			{countersError && (
				<div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 text-sm text-yellow-700">
					Error cargando contadores: {countersError}
				</div>
			)}
		</header>
	);
};

export default Header;
