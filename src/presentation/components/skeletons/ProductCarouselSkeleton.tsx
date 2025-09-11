import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselSkeletonProps {
  showPersonalized?: boolean;
  isAuthenticated?: boolean;
}

const ProductCarouselSkeleton: React.FC<ProductCarouselSkeletonProps> = ({ 
  showPersonalized = true}) => {
  return (
    <div className="space-y-8">
      {/* Skeleton para primer carrusel (personalizado/trending) */}
      {showPersonalized && (
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            {/* Título skeleton */}
            <div className="h-7 bg-gray-200 rounded animate-pulse w-64">
            </div>
            {/* Botones de navegación skeleton */}
            <div className="flex gap-2">
              <div className="p-1 rounded-full border border-gray-200 bg-gray-100 opacity-50">
                <ChevronLeft size={20} className="text-gray-400" />
              </div>
              <div className="p-1 rounded-full border border-gray-200 bg-gray-100 opacity-50">
                <ChevronRight size={20} className="text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Carrusel skeleton */}
          <div className="flex overflow-hidden gap-3 pb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`personalized-skeleton-${index}`}
                className="flex-none w-[calc(100%-24px)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-12px)] xl:w-[calc(20%-12px)]"
              >
                <div className="bg-white shadow rounded-xl overflow-hidden animate-pulse">
                  {/* Imagen skeleton */}
                  <div className="h-40 bg-gray-200 relative">
                    {/* Badge skeleton */}
                    <div className="absolute top-2 right-2 bg-gray-300 rounded w-12 h-5"></div>
                    {/* Rating skeleton */}
                    <div className="absolute bottom-2 left-2 bg-gray-300 rounded w-16 h-4"></div>
                  </div>
                  
                  {/* Contenido skeleton */}
                  <div className="p-3">
                    {/* Nombre skeleton */}
                    <div className="h-5 bg-gray-200 rounded mb-2 w-full"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
                    
                    {/* Precio skeleton */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex flex-col space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                        <div className="h-5 bg-gray-300 rounded w-16"></div>
                      </div>
                    </div>
                    
                    {/* Botones skeleton */}
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-200 rounded h-8"></div>
                      <div className="bg-gray-200 rounded h-8 w-8"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skeleton para segundo carrusel (ofertas y tendencias) */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          {/* Título skeleton */}
          <div className="h-7 bg-gray-200 rounded animate-pulse w-48">
          </div>
          {/* Botones de navegación skeleton */}
          <div className="flex gap-2">
            <div className="p-1 rounded-full border border-gray-200 bg-gray-100 opacity-50">
              <ChevronLeft size={20} className="text-gray-400" />
            </div>
            <div className="p-1 rounded-full border border-gray-200 bg-gray-100 opacity-50">
              <ChevronRight size={20} className="text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Carrusel skeleton */}
        <div className="flex overflow-hidden gap-3 pb-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`trending-skeleton-${index}`}
              className="flex-none w-[calc(100%-24px)] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-12px)] xl:w-[calc(20%-12px)]"
            >
              <div className="bg-white shadow rounded-xl overflow-hidden animate-pulse">
                {/* Imagen skeleton */}
                <div className="h-40 bg-gray-200 relative">
                  {/* Badge de descuento skeleton */}
                  <div className="absolute top-2 right-2 bg-gray-300 rounded w-14 h-5"></div>
                  {/* Rating skeleton */}
                  <div className="absolute bottom-2 left-2 bg-gray-300 rounded w-16 h-4"></div>
                </div>
                
                {/* Contenido skeleton */}
                <div className="p-3">
                  {/* Nombre skeleton */}
                  <div className="h-5 bg-gray-200 rounded mb-2 w-full"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                  
                  {/* Precio skeleton */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-col space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-5 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  
                  {/* Botones skeleton */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-200 rounded h-8"></div>
                    <div className="bg-gray-200 rounded h-8 w-8"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estilos CSS para la animación */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default ProductCarouselSkeleton;
