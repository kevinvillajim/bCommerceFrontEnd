import React from 'react';
import ImageSlider from '../components/common/ImageSlider.tsx';
import Categories from '../components/common/Categories.tsx';
import TextSlider from '../components/common/TextSlider.tsx';
import ProductCards from '../components/common/ProductCards.tsx';
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