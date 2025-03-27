import React, { useState } from 'react';
import { ShoppingCart, User, Menu, X, Search, Heart } from 'lucide-react';

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
    name: "B-Commerce"
  },
  navLinks = [
    { text: "Inicio", to: "/" },
    { text: "Productos", to: "/products" },
    { text: "Categorías", to: "/categories" },
    { text: "Nosotros", to: "/about" },
    { text: "Contacto", to: "/contact" }
  ]
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Componente interno Link para simular react-router-dom
  const Link = ({ to, className, children, onClick }: { to: string, className?: string, children: React.ReactNode, onClick?: () => void }) => (
    <a href={to} className={className} onClick={onClick}>
      {children}
    </a>
  );

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-sm py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="hidden md:block">
              <span>Envío gratis en pedidos superiores a $50</span>
            </div>
            <div className="flex space-x-4 text-xs md:text-sm">
              <a href="#" className="hover:underline">Seguimiento de pedido</a>
              <span>|</span>
              <a href="#" className="hover:underline">Ayuda</a>
              <span>|</span>
              <a href="#" className="hover:underline">ES</a>
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
                <img 
                  src={logo.img} 
                  alt={logo.name} 
                  className="h-10 w-auto" 
                />
              ) : (
                <span className="text-2xl font-bold text-gray-800">
                  <span className="text-primary-600">{logo.name.charAt(0)}</span>
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
            <Link to="/favorites" className="text-gray-700 hover:text-primary-600 transition-colors relative">
              <Heart size={22} />
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-primary-600 transition-colors relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
            </Link>
            <Link to="/account" className="text-gray-700 hover:text-primary-600 transition-colors">
              <User size={22} />
            </Link>
            <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
              Iniciar sesión
            </Link>
            <Link to="/register" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm hover:shadow">
              Registrarse
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="text-gray-700 mr-4 relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
            </Link>
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700"
            >
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

          {/* Mobile Navigation */}
          <ul className="space-y-3">
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

          {/* Mobile Auth Buttons */}
          <div className="mt-6 space-y-2">
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
        </div>
      )}
    </header>
  );
};

export default Header;