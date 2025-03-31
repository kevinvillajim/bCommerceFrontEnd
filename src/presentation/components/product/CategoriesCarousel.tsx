import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon, 
  Smartphone, Tv, Laptop, Monitor, Headphones, Camera, Watch, Speaker, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Diccionario de iconos
const CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  'smartphone': Smartphone,
  'smartphones': Smartphone,
  'teléfono': Smartphone,
  'telefono': Smartphone,
  'móvil': Smartphone,
  'movil': Smartphone,
  'tv': Tv,
  'tvs': Tv,
  'televisor': Tv,
  'televisión': Tv,
  'television': Tv,
  'laptop': Laptop,
  'laptops': Laptop,
  'portátil': Laptop,
  'portatil': Laptop,
  'monitor': Monitor,
  'monitores': Monitor,
  'pantalla': Monitor,
  'auricular': Headphones,
  'auriculares': Headphones,
  'headphone': Headphones,
  'audio': Headphones,
  'cámara': Camera,
  'camara': Camera,
  'foto': Camera,
  'reloj': Watch,
  'relojes': Watch,
  'watch': Watch,
  'altavoz': Speaker,
  'altavoces': Speaker,
  'speaker': Speaker
};

interface Category {
  id: number;
  title: string;
  iconName: string;
  link: string
}

const CategoriesCarousel: React.FC<{ categories: Category[] }> = ({ categories }) => {
  // Estado para controlar la página actual
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  // Calcular el número de páginas 
  const maxItemsPerPage = 8; // 2 filas x 4 columnas
  const totalPages = Math.ceil(categories.length / maxItemsPerPage);

  // Obtener las categorías para la página actual
  const getCurrentPageCategories = () => {
    const start = currentPage * maxItemsPerPage;
    const end = start + maxItemsPerPage;
    return categories.slice(start, end);
  };

  // Navegar a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Navegar a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Manejar clic en categoría
  const handleCategoryClick = (category: Category, event: React.MouseEvent) => {
    event.preventDefault();
    navigate(`/products?category=${encodeURIComponent(category.title)}`);
  };

  // Función para determinar qué ícono mostrar basado en el nombre de la categoría
  const renderIcon = (iconName: string) => {
    // Si el iconName es un emoji, devolver el emoji directamente
    if (iconName.match(/\p{Emoji}/u)) {
      return <span className="text-xl">{iconName}</span>;
    }
    
    // Buscar el nombre de la categoría en el diccionario de iconos
    const lowerName = iconName.toLowerCase();
    const categoryKey = Object.keys(CATEGORY_ICONS).find(key => 
      lowerName.includes(key) || key.includes(lowerName)
    );
    
    // Si se encuentra una coincidencia, usar el ícono correspondiente
    if (categoryKey) {
      const IconComponent = CATEGORY_ICONS[categoryKey];
      return <IconComponent size={24} />;
    }
    
    // Si no hay coincidencia, usar un ícono genérico
    return <Package size={24} />;
  };

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="flex items-center justify-end mb-4">
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className={`p-1 rounded-full border ${
                  currentPage > 0 
                    ? 'text-gray-700 border-gray-300 hover:bg-gray-100' 
                    : 'text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className={`p-1 rounded-full border ${
                  currentPage < totalPages - 1 
                    ? 'text-gray-700 border-gray-300 hover:bg-gray-100' 
                    : 'text-gray-400 border-gray-200 cursor-not-allowed'
                }`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 grid-rows-2 gap-3">
          {getCurrentPageCategories().map((category) => (
            <div 
              key={category.id} 
              className="block no-underline text-gray-800 cursor-pointer"
              onClick={(e) => handleCategoryClick(category, e)}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                  {renderIcon(category.title)}
                </div>
                <span className="text-sm font-medium">{category.title}</span>
                <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-400 group-hover:text-primary-700 transition-colors duration-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesCarousel;