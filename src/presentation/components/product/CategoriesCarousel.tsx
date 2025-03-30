import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ElementType } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// Definimos la interfaz Category que acepta cualquier ElementType para el icono
interface Category {
  id: number;
  title: string;
  icon: ElementType;
  link: string;
}

// Para el CardProps seguimos exigiendo específicamente LucideIcon
interface CategoryCardProps {
  category: string;
  icon: LucideIcon;
  link?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, icon: Icon, link }) => {   
  const CardContent = () => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 group">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
        <Icon className="w-5 h-5 text-gray-700 group-hover:text-primary-700 transition-colors duration-200" />
      </div>
      <span className="text-sm font-medium">{category}</span>
      <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-primary-700 transition-colors duration-200" />
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block no-underline text-gray-800">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

interface CategoriesCarouselProps {
  categories: Category[];
}

const CategoriesCarousel: React.FC<CategoriesCarouselProps> = ({
  categories,
}) => {
  // Estado para controlar la página actual
  const [currentPage, setCurrentPage] = useState(0);

  // Calcular el número de páginas 
  const maxItemsPerPage = 8; // 2 filas x 8 columnas
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
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 grid-rows-2 gap-3">
          {getCurrentPageCategories().map((category) => (
            <CategoryCard 
              key={category.id}
              category={category.title}
              icon={category.icon as unknown as LucideIcon}
              link={category.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesCarousel;