import React, {useState, useEffect, useRef, useMemo, memo} from "react";
import {
	ShoppingCart,
	User,
	Menu,
	X,
	Heart,
	Bell,
	LogOut,
	ShoppingBag,
} from "lucide-react";
import {useAuth} from "../../hooks/useAuth";
import {useHeaderCounters} from "../../hooks/useHeaderCounters";
import { useShippingConfig } from "../../hooks/useUnifiedConfig";
import ThemeToggle from "./ThemeToggle";
import SearchAutocomplete from "./SearchAutocomplete";
import { useTheme } from '../../hooks/useTheme';

// Interfaz para el logo
interface Logo {
	img?: string;
	imgdark?: string;
	name: string;
}

interface HeaderProps {
	logo?: Logo;
	navLinks?: Array<{
		text: string;
		to: string;
	}>;
}

const Header: React.FC<HeaderProps> = memo(({
	logo = {
		img: "/logo.png",
		imgdark: "/logowhite.png",
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
	const [sellerMenuOpen, setSellerMenuOpen] = useState(false); // 🎆 NUEVO: Menu dropdown para seller/admin
	const userMenuRef = useRef<HTMLDivElement>(null);
	const sellerMenuRef = useRef<HTMLDivElement>(null); // 🎆 NUEVO: Ref para seller menu
	const { theme } = useTheme();

	// Obtener información del usuario y estado de autenticación
	const {user, isAuthenticated, logout} = useAuth();

	const logoSrc = useMemo(() => {
		return theme === 'dark'
			? logo.imgdark || logo.img || null
			: logo.img || null;
	}, [theme, logo.imgdark, logo.img]);

	// ✅ USAR EL HOOK UNIFICADO OPTIMIZADO
	const {
		counters,
		error: countersError,
	} = useHeaderCounters();

	// ✅ OBTENER CONFIGURACIÓN DINÁMICA DE ENVÍO (Sistema Unificado)
	const { config: shippingConfig, loading: shippingLoading } = useShippingConfig();
	const freeThreshold = shippingConfig?.free_threshold || 50;
	const shippingEnabled = shippingConfig?.enabled || true;

	const {cartItemCount, favoriteCount, notificationCount} = counters;

	// Cerrar los menús al hacer clic fuera de ellos y prevenir scroll de fondo
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setUserMenuOpen(false);
			}
			// 🎆 NUEVO: Cerrar menu seller
			if (
				sellerMenuRef.current &&
				!sellerMenuRef.current.contains(event.target as Node)
			) {
				setSellerMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Prevenir scroll de fondo cuando el menú móvil está abierto
	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		// Cleanup al desmontar
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [mobileMenuOpen]);

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
		...props
	}: {
		to: string;
		className?: string;
		children: React.ReactNode;
		onClick?: () => void;
		[key: string]: any; // Para permitir data-* attributes
	}) => (
		<a href={to} className={className} onClick={onClick} {...props}>
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
						<div className="text-center w-full md:text-left md:w-auto">
							{!shippingLoading && (
								shippingEnabled ? (
									<span className="text-sm md:text-base">Envío gratis en pedidos superiores a ${freeThreshold}</span>
								) : (
									<span className="text-yellow-300 font-semibold text-sm md:text-base">🎉 ¡Envío GRATIS por tiempo limitado!</span>
								)
							)}
						</div>
						<div className="flex space-x-4 text-xs md:text-sm">
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
							{logoSrc ? (
  <img src={logoSrc} alt={logo.name} className="h-6 lg:h-8 w-auto" />
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
					<div className="hidden md:flex flex-1 mx-16">
						<SearchAutocomplete 
							placeholder="Buscar productos..."
							className="w-full"
						/>
					</div>

					{/* Icons - Desktop */}
					<div className="hidden sm:flex items-center space-x-6">
						<ThemeToggle />

						{/* 🎆 BOTÓN CONDICIONAL SELLER/ADMIN */}
						{isAuthenticated && (user?.role === 'seller' || user?.role === 'admin' || user?.role === 'payment') && (
						 <div className="flex items-center space-x-4">
						 {/* Botón ir a Dashboard */}
						 <Link
						   to={
						   	user?.role === 'admin' ? '/admin/dashboard' :
						   	user?.role === 'seller' ? '/seller/dashboard' :
						   	user?.role === 'payment' ? '/payment/dashboard' : '/seller/dashboard'
						   }
						  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm"
						 >
						 Ir a Dashboard
						</Link>
						
						 {/* Dropdown con accesos adicionales */}
						 <div className="relative" ref={sellerMenuRef}>
						 <button
						 onClick={() => setSellerMenuOpen(!sellerMenuOpen)}
						 className="p-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-gray-50 transition-colors"
						 title="Más opciones"
						 >
						 <Menu size={20} />
						 </button>
						 
						 {sellerMenuOpen && (
						 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100">
						 <div className="px-4 py-2 border-b border-gray-100">
						 <p className="text-sm font-medium text-gray-600">
						 {user?.role === 'admin' ? 'Panel Admin' : 'Panel Vendedor'}
						 </p>
						 </div>
						 
						 {/* Accesos rápidos como comprador */}
						 <div className="px-3 py-1">
						 <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Como Comprador</p>
						 </div>
						 
						 <Link
						 to="/favorites"
						 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
						 onClick={() => setSellerMenuOpen(false)}
						 >
						 <Heart size={16} className="mr-2" />
						 Favoritos
						 {favoriteCount > 0 && (
						 <span className="ml-auto bg-gray-200 text-gray-600 text-xs rounded-full px-2 py-0.5">
						 {favoriteCount}
						 </span>
						 )}
						 </Link>
						 
						 <Link
						 to="/cart"
						 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
						 onClick={() => setSellerMenuOpen(false)}
						 >
						 <ShoppingCart size={16} className="mr-2" />
						 Carrito
						 {cartItemCount > 0 && (
						 <span className="ml-auto bg-gray-200 text-gray-600 text-xs rounded-full px-2 py-0.5">
						 {cartItemCount}
						 </span>
						 )}
						 </Link>
						 
						 <Link
						 to="/notifications"
						 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
						 onClick={() => setSellerMenuOpen(false)}
						 >
						 <Bell size={16} className="mr-2" />
						 Notificaciones
						 {notificationCount > 0 && (
						 <span className="ml-auto bg-red-100 text-red-600 text-xs rounded-full px-2 py-0.5">
						 {notificationCountSanitized}
						 </span>
						 )}
						 </Link>
						 </div>
						 )}
						 </div>
						</div>
					)}
					
					{/* 📱 CONTADORES NORMALES - Solo si NO es seller/admin */}
					{!(user?.role === 'seller' || user?.role === 'admin') && (
						<>
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
						</>
					)}

						{isAuthenticated ? (
							<>
								{/* ✅ BOTÓN DE NOTIFICACIONES CORREGIDO - Con atributo necesario */}
								<Link
									to="/notifications"
									data-notification-button="true"
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
					<div className="sm:hidden flex items-center space-x-4">
					{/* 🎆 BOTÓN DASHBOARD MÓVIL - Solo para seller/admin */}
					{isAuthenticated && (user?.role === 'seller' || user?.role === 'admin' || user?.role === 'payment') && (
					<Link
					to={
						user?.role === 'admin' ? '/admin/dashboard' :
						user?.role === 'seller' ? '/seller/dashboard' :
						user?.role === 'payment' ? '/payment/dashboard' : '/seller/dashboard'
					}
					className="px-2 py-1 bg-primary-600 text-white rounded text-xs font-medium"
					>
					 Dashboard
					</Link>
					)}
					

					{/* 🎨 THEME TOGGLE MÓVIL - Solo cuando NO hay sesión iniciada */}
					{!isAuthenticated && (
						<ThemeToggle />
					)}

					{/* Cart Icon for Mobile */}
					<Link to="/cart" className="text-gray-700 relative">
					<ShoppingCart size={22} />
					{cartItemCount > 0 && (
					  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
					  {cartItemCount}
					 </span>
					)}
					</Link>
					
					{/* 📱 FAVORITOS MÓVIL - Solo si NO es seller/admin */}
					{!(user?.role === 'seller' || user?.role === 'admin') && (
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
					)}
					 
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

			{/* Navigation - Desktop and Tablet */}
			<nav className="hidden sm:block border-t border-gray-100">
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

			{/* Mobile Menu - Pantalla completa con estructura fija y scroll solo en navegación */}
			{mobileMenuOpen && (
				<div className="sm:hidden fixed inset-0 top-[105px] bg-white z-50 flex flex-col h-[calc(100vh-105px)] overflow-hidden">
					
					{/* SECCIÓN FIJA: Búsqueda */}
					<div className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
						<SearchAutocomplete 
							placeholder="Buscar productos..."
							className="w-full"
							onNavigate={() => setMobileMenuOpen(false)}
						/>
					</div>

					{/* SECCIÓN FIJA: Información del usuario y accesos rápidos */}
					{isAuthenticated && (
						<div className="flex-shrink-0 px-6 py-5 border-b border-gray-200">
							<div className="flex items-center space-x-3 mb-3">
								<div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
									{getUserInitial()}
								</div>
								<div>
									<p className="font-medium">{user?.name}</p>
									<p className="text-xs text-gray-500 truncate">
										{user?.email}
									</p>
									{/* INDICADOR DE ROL */}
									{(user?.role === 'seller' || user?.role === 'admin') && (
										<span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full mt-1">
											{user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
										</span>
									)}
								</div>
							</div>
							
							{/* ACCESOS RÁPIDOS EN GRID */}
							<div className="grid grid-cols-3 gap-2">
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
								
								{/* Theme Toggle */}
								<div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50">
									<ThemeToggle />
									<span className="text-xs mt-1">Tema</span>
								</div>
							</div>
						</div>
					)}

					{/* SECCIÓN CON SCROLL: Solo la navegación */}
					<div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-6 py-4">
						<ul className="space-y-2">
							{navLinks.map((link, index) => (
								<li key={index}>
									<Link
										to={link.to}
										className="block text-gray-700 font-medium hover:text-primary-600 hover:bg-gray-50 py-1 px-4 rounded-lg transition-colors text-md"
										onClick={toggleMobileMenu}
									>
										{link.text}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* SECCIÓN FIJA: Botones de autenticación o logout */}
					<div className="flex-shrink-0 px-3 py-3 border-t border-gray-200 bg-gray-50">
						{isAuthenticated ? (
							<button
								onClick={() => {
									handleLogout();
									toggleMobileMenu();
								}}
								className="w-full flex items-center justify-center py-2 text-red-600 font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-md bg-white shadow-sm"
							>
								<LogOut size={20} className="mr-3" />
								Cerrar sesión
							</button>
						) : (
							<div className="space-y-4">
								<Link
									to="/login"
									className="block text-center py-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-lg bg-white shadow-sm"
									onClick={toggleMobileMenu}
								>
									Iniciar sesión
								</Link>
								<Link
									to="/register"
									className="block text-center py-4 bg-primary-600 rounded-lg text-white hover:bg-primary-700 transition-colors font-medium text-lg shadow-sm"
									onClick={toggleMobileMenu}
								>
									Registrarse
								</Link>
							</div>
						)}
					</div>
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
});

export default Header;