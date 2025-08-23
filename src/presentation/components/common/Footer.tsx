import React from 'react';
import { Facebook, Instagram, Twitter, Send, MapPin, Phone, Mail, Heart } from 'lucide-react';

interface Logo {
  img?: string;
  name: string;
}

interface FooterProps {
  logo?: Logo;
  quickLinks?: Array<{
    text: string;
    to: string;
  }>;
  customerLinks?: Array<{
    text: string;
    to: string;
  }>;
}

const Footer: React.FC<FooterProps> = ({
  logo = {
    img: "/logowhite.png",
    name: "Comersia"
  },
  quickLinks = [
    { text: "Inicio", to: "/" },
    { text: "Productos", to: "/products" },
    { text: "Categorías", to: "/categories" },
    { text: "Nosotros", to: "/about" }
  ],
  customerLinks = [
    { text: "Contáctanos", to: "/contact" },
    { text: "Preguntas Frecuentes", to: "/faq" },
    { text: "Política de Envío", to: "/shipping" },
    { text: "Devoluciones y Reembolsos", to: "/returns" }
  ]
}) => {
  // Componente interno Link para simular react-router-dom
  const Link = ({ to, className, children }: { to: string, className?: string, children: React.ReactNode }) => (
    <a href={to} className={className}>
      {children}
    </a>
  );
  

  return (
    <footer className="relative overflow-hidden footer">
      {/* Wave SVG en la parte superior */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg 
          data-name="Layer 1" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
          className="w-full h-12 text-gray-100"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            fill="currentColor"
          ></path>
        </svg>
      </div>

      {/* Contenido principal del footer */}
      <div className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          {/* Sección superior con columnas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Columna 1: Información de la tienda */}
            <div className="lg:pr-8">
              <div className="mb-6">
                {logo.img ? (
                  <img 
                    src={logo.img} 
                    alt={logo.name} 
                    className="h-12 w-auto" 
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    <span className="text-primary-500">{logo.name.charAt(0)}</span>
                    {logo.name.slice(1)}
                  </span>
                )}
              </div>
              <p className="text-gray-400 mb-6">Tu solución integral de comercio electrónico para todas tus necesidades de compra.</p>
              
              {/* Newsletter */}
              <div>
                <h4 className="text-white font-semibold mb-3">Suscríbete a nuestro boletín</h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="bg-gray-800 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Columna 2: Enlaces rápidos */}
            <div>
              <h3 className="text-lg font-semibold mb-6 border-l-4 border-primary-500 pl-3">Enlaces Rápidos</h3>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.to} className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Columna 3: Atención al cliente */}
            <div>
              <h3 className="text-lg font-semibold mb-6 border-l-4 border-primary-500 pl-3">Atención al Cliente</h3>
              <ul className="space-y-3">
                {customerLinks.map((link, index) => (
                  <li key={index}>
                    <Link to={link.to} className="text-gray-400 hover:text-white transition-colors flex items-center">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Columna 4: Contáctanos */}
            <div>
              <h3 className="text-lg font-semibold mb-6 border-l-4 border-primary-500 pl-3">Contáctanos</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin size={20} className="text-primary-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-400">Gil R. Dávalos y Av. Amazonas - Edificio Centro Amazonas - #402 Quito, Ecuador</span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="text-primary-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-400">+593 96 296 6301</span>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="text-primary-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-400">info@comersia.app</span>
                </li>
              </ul>
              
              {/* Redes Sociales */}
              <div className="mt-6">
                <h4 className="text-white font-semibold mb-4">Síguenos</h4>
                <div className="flex space-x-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                    <Facebook size={18} className="text-white" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                    <Instagram size={18} className="text-white" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors">
                    <Twitter size={18} className="text-white" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Línea separadora con gradiente */}
          <div className="h-px bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 mb-8"></div>
          
          {/* Copyright y créditos */}
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {logo.name}. Todos los derechos reservados.</p>
            <div className="mt-3 md:mt-0 flex items-center">
              <span>Hecho con</span>
              <Heart size={14} className="mx-1 text-red-500" />
              <span>por <a href='https://kevinvillajim.github.io/Portfolio/'><span className="text-primary-500 font-medium">kevinvillajim</span></a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;