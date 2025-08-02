import React from 'react';

interface ProductCardSkeletonProps {
  count?: number;
  title?: string;
}

const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ 
  count = 6, 
  title = "Cargando productos..." 
}) => {
  return (
    <section className="mb-12">
      {/* Título con skeleton */}
      <div className="mb-6">
        {title ? (
          <h2 className="text-2xl font-bold">{title}</h2>
        ) : (
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        )}
      </div>
      
      {/* Grid de tarjetas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index} 
            className="bg-white shadow rounded-xl overflow-hidden animate-pulse"
          >
            {/* Imagen skeleton */}
            <div className="h-48 bg-gray-200 relative">
              {/* Badge skeleton */}
              <div className="absolute top-3 right-3 bg-gray-300 rounded-md w-16 h-6"></div>
            </div>
            
            {/* Contenido skeleton */}
            <div className="p-4">
              {/* Título skeleton */}
              <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
              
              {/* Descripción skeleton */}
              <div className="h-4 bg-gray-200 rounded mb-1 w-full"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-2/3"></div>
              
              <div className="flex justify-between items-center">
                {/* Precio skeleton */}
                <div className="flex flex-col space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-300 rounded w-20"></div>
                </div>
                
                {/* Botón skeleton */}
                <div className="bg-gray-200 rounded-lg w-32 h-10"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCardSkeleton;
