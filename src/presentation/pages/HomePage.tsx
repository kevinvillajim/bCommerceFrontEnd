import React from 'react';
import ImageSlider from '../components/common/ImageSlider.tsx';
import Categories from '../components/common/Categories.tsx';
import TextSlider from '../components/common/TextSlider.tsx';
import ProductCards from '../components/common/ProductCards.tsx';
import ProductCarousel from '../components/product/ProductCarousel.tsx';
import WhyUs from '../components/common/WhyUs.tsx';
import { Smartphone, Tv, Laptop, Monitor } from 'lucide-react';
import { Truck, ShieldCheck, Headphones, Zap, Award, CreditCard } from 'lucide-react';

const HomePage: React.FC = () => {

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
    title: "Bienvenido a B-Commerce",
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
  
  const products = [
    {
      id: 1,
      name: "Auriculares inalámbricos",
      description: "Auriculares premium con cancelación de ruido y 30h de batería",
      price: 199.99,
      discount: 15, // 15% de descuento
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 2,
      name: "Smartwatch Pro",
      description: "Monitoriza tu estado físico, salud y mantente conectado con estilo",
      price: 249.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 3,
      name: "Cámara de acción 4K",
      description: "Captura tus aventuras en impresionante resolución 4K",
      price: 329.99,
      discount: 20, // 20% de descuento
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 4,
      name: "iWatch pro",
      description: "Alto rendimiento en un diseño elegante y ligero",
      price: 1099.99,
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 5,
      name: "Altavoz inteligente",
      description: "Altavoz con control por voz y calidad de audio premium",
      price: 129.99,
      discount: 10, // 10% de descuento
      image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
    },
    {
      id: 6,
      name: "Gafas inteligentes",
      description: "Gafas con bluetooth, musica in ear y sistema operativo android, manejable con los ojos",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
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
  
  //Carusel de recomendación
  
   const personalizedProducts = [
    {
      id: 1,
      name: "Auriculares Bluetooth Pro",
      price: 129.99,
      discount: 15,
      rating: 4.7,
      reviews: 253,
      image: "https://thumbs.ielectro.es/product/med/23714.webp",
      category: "Electrónica",
      isNew: false
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
      isNew: true
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
      isNew: false
    },
    {
      id: 4,
      name: "Altavoz Portátil Impermeable",
      price: 59.99,
      discount: 0,
      rating: 4.4,
      reviews: 98,
      image: "https://m.media-amazon.com/images/I/71gl+Y4RWRL._AC_SY300_SX300_.jpg",
      category: "Audio",
      isNew: false
    },
    {
      id: 5,
      name: "Zapatillas Inteligentes",
      price: 119.95,
      discount: 0,
      rating: 4.8,
      reviews: 312,
      image: "https://m.media-amazon.com/images/I/61roIO6ktcL._AC_SX695_.jpg",
      category: "Deportes",
      isNew: true
    },
    {
      id: 6,
      name: "Cafetera Automática Gourmet",
      price: 149.99,
      discount: 20,
      rating: 4.6,
      reviews: 178,
      image: "https://images.fravega.com/f300/12945d3cf8cfe771f437816579c197bd.jpg.webp",
      category: "Cocina",
      isNew: false
    }
];

const trendingProducts = [
    {
      id: 7,
      name: "Tablet Pro 11 pulgadas",
      price: 499.99,
      discount: 30,
      rating: 4.9,
      reviews: 423,
      image: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-pro-model-select-gallery-1-202405?wid=5120&hei=2880&fmt=webp&qlt=70&.v=cXN0QTVTNDBtbGIzcy91THBPRThnNE5sSFgwakNWNmlhZ2d5NGpHdllWY09WV3R2ZHdZMXRzTjZIcWdMTlg4eUJQYkhSV3V1dC9oa0s5K3lqMGtUaFMvR01EVDlzK0hIS1J2bTdpY0pVeTF1Yy9kL1dQa3EzdWh4Nzk1ZnZTYWY&traceId=1",
      category: "Electrónica",
      isNew: false
    },
    {
      id: 8,
      name: "Drone Plegable HD",
      price: 299.99,
      discount: 25,
      rating: 4.7,
      reviews: 203,
      image: "https://imagedelivery.net/4fYuQyy-r8_rpBpcY7lH_A/falabellaCO/35423836_1/w=800,h=800,fit=pad",
      category: "Tecnología",
      isNew: true
    },
    {
      id: 9,
      name: "Consola de Videojuegos PS5",
      price: 399.99,
      discount: 20,
      rating: 4.8,
      reviews: 347,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXeKeIiyTOGM4Ql5ddSZSBLSDPXfilUNRLBA&s",
      category: "Gaming",
      isNew: false
    },
    {
      id: 10,
      name: "Mochila Smart Impermeable",
      price: 79.99,
      discount: 40,
      rating: 4.6,
      reviews: 156,
      image: "https://m.media-amazon.com/images/I/612Rw7W9H0L._AC_SX679_.jpg",
      category: "Accesorios",
      isNew: false
    },
    {
      id: 11,
      name: "Robot Aspirador Inteligente",
      price: 349.99,
      discount: 35,
      rating: 4.7,
      reviews: 289,
      image: "https://www.zonamovilidad.es/fotos/2/8LTHs-W0_thumb_1280.jpeg",
      category: "Hogar",
      isNew: true
    },
    {
      id: 12,
      name: "Silla Ergonómica Gamer",
      price: 259.99,
      discount: 30,
      rating: 4.5,
      reviews: 176,
      image: "https://www.ofisillas.es/images/product/1/large/pl_1_1_5892.jpg",
      category: "Muebles",
      isNew: false
    }
];

  // Manejadores de eventos
  const handleAddToCart = (id: number) => {
    console.log(`Producto ${id} añadido al carrito`);
    // Implementar lógica real para añadir al carrito
  };

  const handleAddToWishlist = (id: number) => {
    console.log(`Producto ${id} añadido a la lista de deseos`);
    // Implementar lógica real para añadir a la lista de deseos
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
          <h1 className="text-2xl font-bold mb-8">Descubre productos para ti</h1>
          <ProductCarousel
            personalizedProducts={personalizedProducts}
            trendingProducts={trendingProducts}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            color={false}
          />
        </div>
        <section className="mb-12">
          <ProductCards products={products} title = "Productos destacados" onClick = {(id: number) => console.log(`Added product ${id} to cart`)}/>
        </section>

        <section className="mb-12">
          <WhyUs features = {features} title = "Por qué elegirnos"/>
        </section>
      </div>
    </div>
  );
};

export default HomePage;