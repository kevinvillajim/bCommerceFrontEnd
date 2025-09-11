import React, { useState } from 'react';
import { ShoppingCart, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { NotificationType } from '../../contexts/CartContext';

// Definir la interfaz para un producto (compatible con la API)
interface Product {
  id?: number;
  name: string;
  slug?: string;
  description?: string;
  price: number | string; // ✅ Aceptar tanto número como string
  final_price?: number | string; // ✅ Aceptar tanto número como string
  discount_percentage?: number | string; // ✅ Aceptar tanto número como string
  main_image?: string;
  category_name?: string;
  stock?: number | string;
  is_in_stock?: boolean;
  featured?: boolean;
  status?: string;
  recommendation_type?: string;
  // Compatibilidad con interfaz antigua
  discount?: number | string;
  image?: string;
}

// Definir las props del componente
interface ProductGridProps {
  products?: Product[];
  title?: string;
  onClick?: (productId: number) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products=[], title,
  onClick
}) => {
  const { addToCart, showNotification } = useCart();
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  // ✅ FUNCIONES HELPER PARA CONVERSIÓN SEGURA DE TIPOS
  const safeNumber = (value: number | string | null | undefined, defaultValue: number = 0): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  };


  // Función para obtener el precio final (ya calculado por la API)
  const getFinalPrice = (product: Product): number => {
    // Si viene final_price de la API, usarlo
    if (product.final_price !== undefined) {
      return safeNumber(product.final_price);
    }
    // Fallback: calcular con price y discount
    const safePrice = safeNumber(product.price);
    const discount = safeNumber(product.discount_percentage) || safeNumber(product.discount) || 0;
    if (discount > 0) {
      return safePrice - (safePrice * (discount / 100));
    }
    return safePrice;
  };

  // Función para obtener el descuento
  const getDiscount = (product: Product): number => {
    return safeNumber(product.discount_percentage) || safeNumber(product.discount) || 0;
  };

  // Función para obtener la imagen principal
  const getMainImage = (product: Product): string => {
    return product.main_image || product.image || 'https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Sin+Imagen';
  };

  // Formato de precio
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // Función para manejar añadir al carrito
  const handleAddToCart = async (product: Product) => {
    if (!product.id || loadingStates[product.id]) return;

    setLoadingStates(prev => ({ ...prev, [product.id!]: true }));

    try {
      if (onClick) {
        // Si hay función externa, usarla
        onClick(product.id);
      } else {
        // Usar el hook del carrito
        const success = await addToCart({
          productId: product.id,
          quantity: 1,
        });

        if (success) {
          showNotification(
            NotificationType.SUCCESS,
            `${product.name} ha sido agregado al carrito`
          );
        } else {
          showNotification(
            NotificationType.ERROR,
            "Error al agregar producto al carrito"
          );
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification(
        NotificationType.ERROR,
        "Error al agregar producto al carrito"
      );
    } finally {
      setTimeout(() => {
        if (product.id) {
          setLoadingStates(prev => ({ ...prev, [product.id!]: false }));
        }
      }, 500);
    }
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const finalPrice = getFinalPrice(product);
          const discount = getDiscount(product);
          const hasDiscount = discount > 0;
          const mainImage = getMainImage(product);
          
          return (
            <div 
              key={product.id || `product-${Math.random()}`} 
              className="bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              {/* Imagen del producto */}
              <div 
                className="h-48 bg-gray-100 relative overflow-hidden"
                style={{
                  backgroundImage: `url("${mainImage}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
                onError={(e) => {
                  // Fallback si la imagen falla al cargar
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundImage = 'url("https://via.placeholder.com/400x300/f3f4f6/9ca3af?text=Error+Imagen")';
                }}
              >
                {/* Badge de descuento */}
                {hasDiscount && (
                  <div className="absolute top-3 right-3 bg-primary-600 text-white text-sm font-medium px-2 py-1 rounded-md flex items-center">
                    <Tag size={14} className="mr-1" />
                    {discount}% OFF
                  </div>
                )}
              </div>
              
              {/* Información del producto */}
              <div className="p-4">
                <Link to={`/products/${product.id || 0}`}>
                  <h3 className="font-medium text-lg mb-2 text-gray-800 hover:text-primary-600 transition-colors cursor-pointer">{product.name}</h3>
                </Link>
                {product.description && (
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                )}
                {product.category_name && (
                  <p className="text-gray-500 text-xs mb-2">{product.category_name}</p>
                )}
                
                <div className="flex justify-between items-center">
                  {/* Precio con o sin descuento */}
                  <div>
                    {hasDiscount ? (
                      <div className="flex flex-col">
                        <span className="line-through text-gray-500 text-sm">
                          {formatPrice(safeNumber(product.price))}
                        </span>
                        <span className="font-bold text-primary-600">
                          {formatPrice(finalPrice)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-primary-600">
                        {formatPrice(finalPrice)}
                      </span>
                    )}
                  </div>
                  
                  {/* Botón de añadir al carrito */}
                  <button 
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.id || loadingStates[product.id] || !product.is_in_stock}
                    className={`cursor-pointer px-3 py-2 rounded-lg text-sm flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      product.is_in_stock !== false 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-gray-400 text-white'
                    }`}
                  >
                    {product.id && loadingStates[product.id] ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></div>
                    ) : (
                      <ShoppingCart size={16} className="mr-1" />
                    )}
                    <span className='hidden md:block'>
                      {product.is_in_stock === false ? 'Sin Stock' : 'Añadir al Carrito'}
                    </span>
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