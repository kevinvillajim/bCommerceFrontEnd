import React from 'react';
import ImageSlider from '../components/common/ImageSlider.tsx';

const Test: React.FC = () => {
  // Sample image URLs - replace with your actual images
  const images = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Image Slider */}
      <section className="mb-12">
        <ImageSlider images={images} autoPlay={true} autoPlayInterval={5000} />
      </section>

      {/* Rest of your Test content */}
      <div className="max-w-5xl mx-auto">
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

        {/* More content sections... */}
      </div>
    </div>
  );
};

export default Test;