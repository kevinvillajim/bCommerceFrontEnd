import { ChevronRight } from 'lucide-react';

const secciones = [
  {
    title: "Computadoras",
    description: "Descubre nuestra selección de equipos para trabajo y gaming",
    icon: "💻",
    subtitles: [
      { label: "Laptops", link: "/categoria/laptops" },
      { label: "Computadoras de escritorio", link: "/categoria/desktops" },
      { label: "All-in-One", link: "/categoria/all-in-one" },
      { label: "Chromebooks", link: "/categoria/chromebooks" },
      { label: "Mini PC", link: "/categoria/mini-pc" }
    ]
  },
  {
    title: "Componentes",
    description: "Actualiza tu equipo con los mejores componentes del mercado",
    icon: "🔧",
    subtitles: [
      { label: "Procesadores", link: "/categoria/procesadores" },
      { label: "Tarjetas gráficas", link: "/categoria/tarjetas-graficas" },
      { label: "Memorias RAM", link: "/categoria/memorias-ram" },
      { label: "Discos duros y SSD", link: "/categoria/almacenamiento" },
      { label: "Placas madre", link: "/categoria/placas-madre" }
    ]
  },
  {
    title: "Dispositivos Móviles",
    description: "Smartphones, tablets y accesorios de última generación",
    icon: "📱",
    subtitles: [
      { label: "Smartphones", link: "/categoria/smartphones" },
      { label: "Tablets", link: "/categoria/tablets" },
      { label: "Smartwatches", link: "/categoria/smartwatches" },
      { label: "Auriculares inalámbricos", link: "/categoria/auriculares" },
      { label: "Accesorios para móviles", link: "/categoria/accesorios-moviles" }
    ]
  },
  {
    title: "Periféricos",
    description: "Mejora tu experiencia con periféricos de alta calidad",
    icon: "🖱️",
    subtitles: [
      { label: "Teclados", link: "/categoria/teclados" },
      { label: "Ratones", link: "/categoria/ratones" },
      { label: "Monitores", link: "/categoria/monitores" },
      { label: "Audífonos", link: "/categoria/audifonos" },
      { label: "Webcams", link: "/categoria/webcams" }
    ]
  },
  {
    title: "Gaming",
    description: "Todo lo que necesitas para una experiencia de juego inmersiva",
    icon: "🎮",
    subtitles: [
      { label: "Laptops gaming", link: "/categoria/laptops-gaming" },
      { label: "Monitores gaming", link: "/categoria/monitores-gaming" },
      { label: "Teclados mecánicos", link: "/categoria/teclados-mecanicos" },
      { label: "Ratones gaming", link: "/categoria/ratones-gaming" },
      { label: "Sillas gamer", link: "/categoria/sillas-gamer" }
    ]
  },
  {
    title: "Almacenamiento",
    description: "Soluciones de almacenamiento para tus datos más importantes",
    icon: "💾",
    subtitles: [
      { label: "Discos duros externos", link: "/categoria/discos-externos" },
      { label: "Unidades SSD", link: "/categoria/ssd" },
      { label: "Memorias USB", link: "/categoria/memorias-usb" },
      { label: "Tarjetas SD", link: "/categoria/tarjetas-sd" },
      { label: "NAS y almacenamiento en red", link: "/categoria/nas" }
    ]
  },
  {
    title: "Smart Home",
    description: "Dispositivos inteligentes para automatizar tu hogar",
    icon: "🏠",
    subtitles: [
      { label: "Asistentes de voz", link: "/categoria/asistentes-voz" },
      { label: "Iluminación inteligente", link: "/categoria/iluminacion-inteligente" },
      { label: "Seguridad para el hogar", link: "/categoria/seguridad-hogar" },
      { label: "Electrodomésticos inteligentes", link: "/categoria/electrodomesticos-inteligentes" },
      { label: "Termostatos y clima", link: "/categoria/clima-inteligente" }
    ]
  },
  {
    title: "Redes",
    description: "Equipos para mejorar tu conectividad y redes domésticas",
    icon: "📶",
    subtitles: [
      { label: "Routers", link: "/categoria/routers" },
      { label: "Repetidores WiFi", link: "/categoria/repetidores" },
      { label: "Cables de red", link: "/categoria/cables-red" },
      { label: "Adaptadores WiFi", link: "/categoria/adaptadores-wifi" },
      { label: "Sistemas mesh", link: "/categoria/sistemas-mesh" }
    ]
  }
];

const ContentPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Explora Nuestras Categorías</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descubre contenido relevante organizado por temas. Navega por nuestras categorías para encontrar información actualizada y recursos útiles.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {secciones.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className={"bg-gradient-to-bl from-primary-900 to-primary-400 px-6 py-8 text-white"}>
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>
              <p className="opacity-90">{section.description}</p>
            </div>
            
            <ul className="divide-y divide-gray-100">
              {section.subtitles.map((sub, subIndex) => (
                <li key={subIndex}>
                  <a 
                    href={sub.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700 font-medium">{sub.label}</span>
                    <ChevronRight className="text-gray-400 h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="px-6 py-4 bg-gray-50">
              <a 
                href={`#ver-todos-${section.title.toLowerCase()}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
              >
                Ver todos los temas
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentPage;