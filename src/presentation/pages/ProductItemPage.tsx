import React from 'react';
import { useParams } from 'react-router-dom';

const ProductItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock product data
  const product = {
    id,
    name: 'Product Name',
    price: 99.99,
    description: 'This is a detailed description of the product. It contains all the details about the features, specifications, and benefits of using this product.',
    rating: 4.5,
    reviews: 127,
    brand: 'Brand Name',
    categories: ['Category 1', 'Category 2'],
    inStock: true,
    images: ['/api/placeholder/600/400', '/api/placeholder/600/400', '/api/placeholder/600/400'],
    specifications: [
      { name: 'Material', value: 'High-quality material' },
      { name: 'Dimensions', value: '10 x 20 x 5 cm' },
      { name: 'Weight', value: '500g' },
      { name: 'Warranty', value: '1 Year' }
    ],
    relatedProducts: [1, 2, 3, 4]
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
                <img 
                  src={product.images[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 rounded-lg h-24 flex items-center justify-center cursor-pointer"
                  >
                    <img 
                      src={image}
                      alt={`${product.name} thumbnail ${index+1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star}
                      className={`w-5 h-5 ${star <= Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 15.58l-5.792 3.04 1.108-6.45-4.684-4.56 6.472-.94L10 1.25l2.896 5.42 6.472.94-4.684 4.56 1.108 6.45L10 15.58z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600">{product.rating} ({product.reviews} reviews)</p>
              </div>

              <p className="text-3xl font-bold text-primary-600">${product.price.toFixed(2)}</p>
              
              <div className="border-t border-b py-4">
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Brand:</span>
                  <span>{product.brand}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {product.categories.map((category, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 px-2 py-1 text-sm rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="w-24 text-gray-600">Availability:</span>
                  <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <div className="flex border rounded overflow-hidden">
                  <button className="px-3 py-1 bg-gray-100">-</button>
                  <input 
                    type="number" 
                    className="w-12 text-center border-x" 
                    min="1" 
                    defaultValue="1"
                  />
                  <button className="px-3 py-1 bg-gray-100">+</button>
                </div>
                <button className="flex-grow bg-primary-600 text-white rounded py-2 hover:bg-primary-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
          
          {/* Product Specifications */}
          <div className="border-t p-6">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex">
                  <span className="w-32 text-gray-600">{spec.name}:</span>
                  <span>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.relatedProducts.map((relatedId) => (
              <div key={relatedId} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">Related Product {relatedId}</h3>
                  <p className="text-primary-600 font-bold">$89.99</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductItemPage;