import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Star, Check, AlertTriangle } from 'lucide-react';

// Definir la interfaz para los productos
interface Product {
  id: number;
  name: string;
  price: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  image: string;
  category?: string;
  isNew?: boolean;
  inStock?: boolean;
}

const FavoritePage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    // Simulación de carga de productos favoritos desde una API o localStorage
    const fetchWishlistItems = async () => {
      setIsLoading(true);
      try {
        // Simulación de una API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Ejemplo de datos (reemplazar con tu lógica real para obtener los favoritos)
        const mockItems: Product[] = [
          {
            id: 1,
            name: "Auriculares Bluetooth Pro",
            price: 129.99,
            discount: 15,
            rating: 4.7,
            reviews: 253,
            image: "https://thumbs.ielectro.es/product/med/23714.webp", 
            category: "Electrónica",
            isNew: false,
            inStock: true
          },
          {
            id: 2,
            name: "Smartwatch Fitness Tracker",
            price: 89.99,
            discount: 0,
            rating: 4.5,
            reviews: 187,
            image: "https://m.media-amazon.com/images/I/71JU-bUt-sL.__AC_SX300_SY300_QL70_FMwebp_.jpg", 
            category: "Accesorios",
            isNew: true,
            inStock: true
          },
          {
            id: 3,
            name: "Cámara Instantánea Retro",
            price: 75.50,
            discount: 10,
            rating: 4.2,
            reviews: 142,
            image: "https://www.lovetendencias.com/wp-content/uploads/2018/07/camara-instantanea-retro.jpg", 
            category: "Fotografía",
            isNew: false,
            inStock: false
          }
        ];
        
        setWishlistItems(mockItems);
        setIsEmpty(mockItems.length === 0);
      } catch (error) {
        console.error("Error al cargar favoritos:", error);
        setIsEmpty(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistItems();
  }, []);

  const handleRemoveFromWishlist = (id: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
    if (wishlistItems.length === 1) {
      setIsEmpty(true);
    }
    // Aquí implementar lógica para eliminar de favoritos en backend/localStorage
  };

  const handleAddToCart = (id: number) => {
    // Aquí implementar lógica para añadir al carrito
    console.log(`Producto ${id} añadido al carrito`);
    // Opcional: Eliminar de favoritos después de añadir al carrito
    // handleRemoveFromWishlist(id);
  };

  // Calcular precio con descuento
  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  // Renderizar estrellas de valoración
  const renderRatingStars = (rating: number = 0) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={`${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} ({wishlistItems.find(item => item.rating === rating)?.reviews})
        </span>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-10 lg:px-20 py-10">
      <div className="flex flex-wrap justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Favoritos</h1>
        
        {!isEmpty && !isLoading && (
          <div className="text-sm text-gray-500 mt-2 md:mt-0 px-3 py-1.5 bg-gray-100 rounded-full">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'producto' : 'productos'} en tu lista
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-20 bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-md">
          <Heart className="mx-auto h-16 w-16 text-red-100 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Tu lista de favoritos está vacía</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Guarda los productos que te gusten para verlos más tarde.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow transition-all"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {wishlistItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`flex flex-col sm:flex-row p-6 ${
                index !== wishlistItems.length - 1 ? 'border-b border-gray-200' : ''
              } hover:bg-gray-50 transition-colors`}
            >
              {/* Imagen del producto con badges */}
              <div className="sm:w-40 sm:h-40 h-60 w-full flex-shrink-0 mx-auto sm:mx-0 relative">
                <Link to={`/products/${item.id}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain sm:object-cover rounded-lg shadow-sm"
                  />
                </Link>
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                  {(item.discount ?? 0) > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                      {item.discount}% OFF
                    </span>
                  )}
                  {item.isNew && (
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                      NUEVO
                    </span>
                  )}
                </div>
              </div>
              
              {/* Información del producto */}
              <div className="flex-1 sm:ml-6 mt-4 sm:mt-0 flex flex-col">
                <div className="flex justify-between">
                  <div>
                    {/* Categoría */}
                    {item.category && (
                      <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md mb-2 uppercase tracking-wide">
                        {item.category}
                      </span>
                    )}
                    
                    {/* Nombre del producto */}
                    <Link to={`/products/${item.id}`} className="block">
                      <h3 className="text-xl font-medium text-gray-800 hover:text-primary-600 transition-colors mb-2">
                        {item.name}
                      </h3>
                    </Link>
                    
                    {/* Valoración */}
                    <div className="mb-2">
                      {renderRatingStars(item.rating || 0)}
                    </div>
                    
                    {/* Disponibilidad */}
                    <div className="mb-3">
                      {item.inStock ? (
                        <span className="inline-flex items-center text-sm text-green-600">
                          <Check size={14} className="mr-1" />
                          En stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-sm text-amber-600">
                          <AlertTriangle size={14} className="mr-1" />
                          Pocas unidades
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Botón de eliminar */}
                  <button 
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Eliminar de favoritos"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {/* Precio y botón de añadir al carrito */}
                <div className="mt-auto pt-4 flex flex-wrap sm:flex-nowrap items-center justify-between">
                  <div className="flex items-center mb-3 sm:mb-0">
                    {item.discount ? (
                      <>
                        <span className="font-bold text-primary-600 text-xl">
                          ${calculateDiscountedPrice(item.price, item.discount).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="ml-3 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded">
                          {item.discount}% DESCUENTO
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-primary-600 text-xl">
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(item.id)}
                    disabled={!item.inStock}
                    className={`inline-flex items-center px-5 py-2.5 rounded-lg text-white font-medium transition-all ${
                      item.inStock 
                        ? 'bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={18} className="mr-2" />
                    {item.inStock ? 'Añadir al carrito' : 'Agotado'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritePage;