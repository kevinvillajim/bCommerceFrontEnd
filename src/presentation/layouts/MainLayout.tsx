import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header.jsx'
import Footer from '../components/common/Footer.jsx'

/**
 * Main Layout Component
 * Main layout for the public-facing parts of the application
 */
const MainLayout: React.FC = () => {

  const logo = {
    img: "",
    name: "Comersia"
  }
  const navLinks = [
    { text: "Inicio", to: "/" },
    { text: "Productos", to: "/products" },
    { text: "Categorías", to: "/categories" },
    { text: "Nosotros", to: "/about" },
    { text: "Contacto", to: "/contact" },
  ]

  const quickLinks = [
    { text: "Inicio", to: "/" },
    { text: "Productos", to: "/products" },
    { text: "Categorías", to: "/categories" },
    { text: "Nosotros", to: "/about" }
  ]

  const customerLinks = [
    { text: "Contáctanos", to: "/contact" },
    { text: "Preguntas Frecuentes", to: "/faq" },
    { text: "Política de Envío", to: "/shipping" },
    { text: "Devoluciones y Reembolsos", to: "/returns" }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header logo={logo} navLinks={navLinks}/>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer quickLinks={quickLinks} customerLinks={customerLinks}/>
    </div>
  );
};

export default MainLayout;