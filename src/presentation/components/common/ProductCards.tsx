import React from 'react';
import { ShoppingCart, Tag } from 'lucide-react';

// Definir la interfaz para un producto
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount?: number;
  image: string;
}

// Definir las props del componente
interface ProductGridProps {
  products?: Product[];
  title?: string;
  onClick?: (productId: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products=[], title,
  onClick = (id: number) => console.log(`Added product ${id} to cart`)
}) => {
  // Función para calcular el precio con descuento
  const calculateDiscountedPrice = (price: number, discount?: number): number => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  // Formato de precio
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => {
          const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
          const hasDiscount = product.discount && product.discount > 0;
          
          return (
            <div 
              key={product.id} 
              className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Imagen del producto */}
              <div 
                className="h-48 bg-gray-100 relative overflow-hidden"
                style={{
                  backgroundImage: `url(${product.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Badge de descuento */}
                {hasDiscount && (
                  <div className="absolute top-3 right-3 bg-primary-600 text-white text-sm font-medium px-2 py-1 rounded-md flex items-center">
                    <Tag size={14} className="mr-1" />
                    {product.discount}% OFF
                  </div>
                )}
              </div>
              
              {/* Información del producto */}
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2 text-gray-800">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                
                <div className="flex justify-between items-center">
                  {/* Precio con o sin descuento */}
                  <div>
                    {hasDiscount ? (
                      <div className="flex flex-col">
                        <span className="line-through text-gray-500 text-sm">
                          {formatPrice(product.price)}
                        </span>
                        <span className="font-bold text-primary-600">
                          {formatPrice(discountedPrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-primary-600">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  {/* Botón de añadir al carrito */}
                  <button 
                    onClick={() => onClick(product.id)}
                    className="cursor-pointer bg-primary-600 text-white px-3 py-2 rounded-lg text-sm flex items-center hover:bg-primary-700 transition-colors"
                  >
                    <ShoppingCart size={16} className="mr-1" />
                    <span className='hidden md:block'>Añadir al Carrito</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductGrid;