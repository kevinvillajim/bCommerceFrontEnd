import React from 'react';
import ImageSlider from '../components/common/ImageSlider.tsx';

const HomePage: React.FC = () => {

  const images = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://static.vecteezy.com/system/resources/previews/002/282/929/non_2x/red-and-gold-rectangle-long-banner-design-free-vector.jpg'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Image Slider */}
      <section className="mb-12">
        <ImageSlider images={images} autoPlay={true} autoPlayInterval={5000} />
      </section>

      {/* Rest of your Test content */}
      <div className="max-w-5xl mx-auto">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Categorías Principales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty'].map((category) => (
              <div key={category} className="bg-white shadow rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                  {/* Icon placeholder */}
                </div>
                <h3 className="font-medium">{category}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* More content sections... */}
      </div>
    </div>
      <div className="max-w-5xl mx-auto">
        <section className="mb-12">
          <div className="bg-primary-600 text-white rounded-xl p-8 md:p-12 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to B-Commerce</h1>
            <p className="text-lg md:text-xl mb-6">Your one-stop solution for all your shopping needs.</p>
            <button className="bg-white text-primary-600 font-medium px-6 py-3 rounded-md hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
          </div>
         
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Electronics', 'Fashion', 'Home & Kitchen', 'Beauty'].map((category) => (
              <div key={category} className="bg-white shadow rounded-lg p-4 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                  {/* Icon placeholder */}
                </div>
                <h3 className="font-medium">{category}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((product) => (
              <div key={product} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-medium mb-2">Product {product}</h3>
                  <p className="text-gray-600 text-sm mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary-600">$99.99</span>
                    <button className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm">Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Fast Delivery', description: 'Get your products delivered to your doorstep quickly.' },
              { title: 'Secure Payment', description: 'We ensure secure payment methods for your peace of mind.' },
              { title: '24/7 Support', description: 'Our customer support team is available around the clock.' }
            ].map((feature, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-6">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
                  {/* Icon placeholder */}
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;