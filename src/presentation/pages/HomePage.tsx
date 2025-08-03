import React from 'react';
import ImageSlider from '../components/common/ImageSlider.tsx';
import Categories from '../components/common/Categories.tsx';
import TextSlider from '../components/common/TextSlider.tsx';
import ProductCards from '../components/common/ProductCards.tsx';
import ProductCarousel from '../components/product/ProductCarousel.tsx';
import WhyUs from '../components/common/WhyUs.tsx';
import ProductCardSkeleton from '../components/skeletons/ProductCardSkeleton.tsx';
import ProductCarouselSkeleton from '../components/skeletons/ProductCarouselSkeleton.tsx';
import useHomeProducts from '../hooks/useHomeProducts';
import useUserInteractions from '../hooks/useUserInteractions';
import { useCart } from '../hooks/useCart';
import { useFavorites } from '../hooks/useFavorites';
import { useInvalidateCounters } from '../hooks/useHeaderCounters';
import { NotificationType } from '../contexts/CartContext';
import { Smartphone, Tv, Laptop, Monitor } from 'lucide-react';
import { Truck, ShieldCheck, Headphones, Zap, Award, CreditCard } from 'lucide-react';

const HomePage: React.FC = () => {
  // 🆕 Hook para obtener productos dinámicos
  const { personalizedProducts, trendingProducts, featuredProducts, loading, error, isAuthenticated, hasInitialLoad } = useHomeProducts(12);

  // 📊 Hook para registrar interacciones de usuario
  const { trackAddToCart, trackAddToWishlist } = useUserInteractions('home_page');

  // 🛒 Hooks para carrito y favoritos
  const { addToCart, showNotification } = useCart();
  const { toggleFavorite } = useFavorites();
  
  // 🔄 Hook para actualizaciones optimistas del header
  const {
    optimisticCartAdd,
    optimisticFavoriteAdd,
    optimisticFavoriteRemove,
    invalidateCounters
  } = useInvalidateCounters();

  const images = [
    'https://images.unsplash.com/photo-1605648916361-9bc12ad6a569?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1585298723682-7115561c51b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'
  ];

  //Actualizar links
  const categories = [
    { id: 1, title: "Smartphones", icon: Smartphone, link:"/products/1"},
    { id: 2, title: "Laptops", icon: Laptop, link:"/products/2" },
    { id: 3, title: "Monitores", icon: Monitor, link:"/products/3" },
    { id: 4, title: "TVs", icon: Tv, link: "/products/4" },
  ];

  const slidesData = [
  {
    title: "Bienvenido a Comersia",
    description: "Su solución integral para todas tus necesidades tecnológicas.",
    buttonText: "Comprar Ahora",
    buttonAction: () => console.log("Shop Now clicked"),
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    color: "rgba(75, 0, 130, 0.3)"
  },
  {
    title: "Colección de verano 2025",
    description: "Descubre nuestros novedosos productos con increíbles descuentos.",
    buttonText: "Ver Colección",
    buttonAction: () => console.log("View Collection clicked"),
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    color: "rgba(46, 204, 113, 0.3)"
  },
  {
    title: "Ofertas Especiales",
    description: "Ofertas por tiempo limitado en productos premium. ¡No te las pierdas!",
    buttonText: "Ver Ofertas",
    buttonAction: () => console.log("See Offers clicked"),
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80",
    color: "rgba(255, 165, 0, 0.3)"
  }
  ];
  
  const features = [{ 
      title: 'Entrega Rápida', 
      description: 'Recibe tus productos en la puerta de tu casa rápidamente con nuestras opciones de envío express.', 
      icon: Truck,
      color: 'bg-blue-50 text-blue-600'
    },
    { 
      title: 'Pago Seguro', 
      description: 'Garantizamos métodos de pago seguros con encriptación y protección contra fraudes para tu tranquilidad.', 
      icon: ShieldCheck,
      color: 'bg-green-50 text-green-600'
    },
    { 
      title: 'Soporte 24/7', 
      description: 'Nuestro equipo de atención al cliente está disponible las 24 horas para ayudarte con cualquier pregunta o problema.', 
      icon: Headphones,
      color: 'bg-purple-50 text-purple-600'
    },
    { 
      title: 'Rendimiento Rápido', 
      description: 'Navega por nuestra tienda con velocidad instantánea, sin retrasos ni ralentizaciones al comprar con nosotros.', 
      icon: Zap,
      color: 'bg-amber-50 text-amber-600'
    },
    { 
      title: 'Garantía de Calidad', 
      description: 'Todos nuestros productos son probados rigurosamente y vienen con garantía de satisfacción o te devolvemos tu dinero.', 
      icon: Award,
      color: 'bg-red-50 text-red-600'
    },
    { 
      title: 'Pago Flexible', 
      description: 'Elige entre varios métodos de pago incluyendo tarjetas de crédito, PayPal y opciones de pago a plazos.', 
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600'
    }]
  
  // Manejadores de eventos con registro de interacciones
  const handleAddToCart = async (id: number) => {
    try {
      console.log(`Producto ${id} añadido al carrito`);
      
      // 🚀 Actualización optimista INMEDIATA del header
      optimisticCartAdd();
      
      // Registrar interacción de usuario
      trackAddToCart(id, 1, 'home_carousel');
      
      // Agregar al carrito
      const success = await addToCart({
        productId: id,
        quantity: 1,
      });

      if (success) {
        showNotification(
          NotificationType.SUCCESS,
          "Producto agregado al carrito exitosamente"
        );
        // Invalidar cache para sincronizar con el servidor
        invalidateCounters();
      } else {
        showNotification(
          NotificationType.ERROR,
          "Error al agregar producto al carrito"
        );
        // Revertir el contador optimista si falla
        invalidateCounters();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification(
        NotificationType.ERROR,
        "Error al agregar producto al carrito"
      );
      // Revertir el contador optimista si falla
      invalidateCounters();
    }
  };

  const handleAddToWishlist = async (id: number) => {
    try {
      console.log(`Producto ${id} añadido a la lista de deseos`);
      
      // Registrar interacción de usuario
      trackAddToWishlist(id, 'home_carousel');
      
      // Alternar favorito
      const result = await toggleFavorite(id);
      
      if (result !== undefined) {
        // 🚀 Actualización optimista INMEDIATA del header basada en el resultado
        if (result) {
          optimisticFavoriteAdd();
          showNotification(
            NotificationType.SUCCESS,
            "Producto añadido a favoritos"
          );
        } else {
          optimisticFavoriteRemove();
          showNotification(
            NotificationType.INFO,
            "Producto eliminado de favoritos"
          );
        }
        // Invalidar cache para sincronizar con el servidor
        invalidateCounters();
      } else {
        showNotification(
          NotificationType.ERROR,
          "Error al gestionar favoritos"
        );
      }
    } catch (error) {
      console.error('Error managing wishlist:', error);
      showNotification(
        NotificationType.ERROR,
        "Error al gestionar favoritos"
      );
    }
  };

  const handleFeaturedAddToCart = async (id: number) => {
    try {
      console.log(`Producto destacado ${id} añadido al carrito`);
      
      // 🚀 Actualización optimista INMEDIATA del header
      optimisticCartAdd();
      
      // Registrar interacción de usuario
      trackAddToCart(id, 1, 'featured_products');
      
      // Agregar al carrito
      const success = await addToCart({
        productId: id,
        quantity: 1,
      });

      if (success) {
        showNotification(
          NotificationType.SUCCESS,
          "Producto destacado agregado al carrito exitosamente"
        );
        // Invalidar cache para sincronizar con el servidor
        invalidateCounters();
      } else {
        showNotification(
          NotificationType.ERROR,
          "Error al agregar producto destacado al carrito"
        );
        // Revertir el contador optimista si falla
        invalidateCounters();
      }
    } catch (error) {
      console.error('Error adding featured product to cart:', error);
      showNotification(
        NotificationType.ERROR,
        "Error al agregar producto destacado al carrito"
      );
      // Revertir el contador optimista si falla
      invalidateCounters();
    }
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="container mx-auto px-4 py-8">
        {/* Hero Section with Image Slider */}
        <section className="mb-12">
          <ImageSlider images={images} autoPlay={true} autoPlayInterval={5000} />
        </section>

        {/* Categories Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Categorías de Tecnología</h2>
          <Categories categories={categories} />
        </section>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <section className="mb-12">
          <TextSlider slides={slidesData} interval={4000} />         
        </section>

        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8">
            {isAuthenticated ? 'Descubre productos para ti' : 'Productos populares'}
          </h1>          
          
          {/* Mostrar mensaje de error si hay uno */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>Error cargando productos: {error}</p>
            </div>
          )}
          
          {/* 🆕 CARRUSEL DE PRODUCTOS CON SKELETON - OPTIMIZADO */}
          {loading && !hasInitialLoad ? (
            <ProductCarouselSkeleton 
              showPersonalized={true}
              isAuthenticated={isAuthenticated}
            />
          ) : (personalizedProducts.length > 0 || trendingProducts.length > 0) ? (
            <ProductCarousel
              personalizedProducts={personalizedProducts}
              trendingProducts={trendingProducts}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              color={false}
              isAuthenticated={isAuthenticated}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          )}
        </div>
        
        {/* 🆕 PRODUCTOS DESTACADOS CON SKELETON - OPTIMIZADO */}
        <section className="mb-12">
          {loading && !hasInitialLoad ? (
            <ProductCardSkeleton 
              count={6}
              title="Cargando productos destacados..."
            />
          ) : featuredProducts.length > 0 ? (
            <ProductCards 
              products={featuredProducts}
              title="Productos destacados" 
              onClick={handleFeaturedAddToCart}
            />
          ) : hasInitialLoad ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay productos destacados disponibles en este momento.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando productos destacados...</p>
            </div>
          )}
        </section>

        <section className="mb-12">
          <WhyUs features = {features} title = "Por qué elegirnos"/>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
