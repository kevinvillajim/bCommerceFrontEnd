import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, ChevronDown, ChevronUp, Star, Truck, Shield, RotateCcw, Minus, Plus, CheckCircle } from 'lucide-react';

const ProductItemPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  
  // Mock product data
  const product = {
    id,
    name: 'Auriculares Bluetooth Pro con Cancelación de Ruido',
    price: 129.99,
    oldPrice: 159.99,
    discount: 20,
    description: 'Disfruta de una experiencia auditiva inmersiva con nuestros auriculares Bluetooth Pro con cancelación activa de ruido. Diseñados para ofrecer un sonido excepcional en cualquier ambiente, estos auriculares cuentan con la tecnología más avanzada para eliminar el ruido exterior y permitirte disfrutar de tu música favorita sin distracciones. Con una batería de larga duración, materiales premium y un diseño ergonómico, son la opción perfecta para uso diario, viajes o trabajo.',
    features: [
      'Cancelación activa de ruido de última generación',
      'Batería de 30 horas de duración',
      'Bluetooth 5.2 con conexión multipunto',
      'Resistencia al agua IPX4',
      'Micrófono con reducción de ruido para llamadas nítidas',
      'Diseño plegable y compacto para mayor portabilidad'
    ],
    rating: 4.7,
    reviews: 127,
    brand: 'AudioTech',
    categories: ['Auriculares', 'Bluetooth', 'Audio'],
    inStock: true,
    deliveryTime: '1-3 días hábiles',
    sku: 'AT-BT-PRO-2023',
    images: ['https://http2.mlstatic.com/D_NQ_NP_2X_793802-MLU77551890951_072024-F.webp', 'https://http2.mlstatic.com/D_NQ_NP_2X_975812-MLA53990640743_022023-F.webp', 'https://http2.mlstatic.com/D_NQ_NP_2X_776717-MLA53990702386_022023-F.webp', 'https://http2.mlstatic.com/D_NQ_NP_2X_896890-MLU77336634944_072024-F.webp'],
    colors: [
      { name: 'Negro', hex: '#000000', selected: true },
      { name: 'Blanco', hex: '#FFFFFF', selected: false },
      { name: 'Azul', hex: '#0047AB', selected: false }
    ],
    specifications: [
      { name: 'Tipo', value: 'Over-ear' },
      { name: 'Conectividad', value: 'Bluetooth 5.2, Cable 3.5mm' },
      { name: 'Autonomía', value: 'Hasta 30 horas (ANC activado)' },
      { name: 'Peso', value: '250g' },
      { name: 'Impedancia', value: '32 ohmios' },
      { name: 'Respuesta de frecuencia', value: '20Hz - 40kHz' },
      { name: 'Sensibilidad', value: '110dB/mW' },
      { name: 'Carga', value: 'USB-C, carga rápida' }
    ],
    relatedProducts: [
      { id: 1, name: 'Auriculares Deportivos In-Ear', price: 59.99, image: 'https://www.sony.com.ec/image/4e59487a5c5175284a49830878185789?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF', rating: 4.3 },
      { id: 2, name: 'Altavoz Bluetooth Portátil', price: 89.99, image: 'https://web-pro-resources.s3.us-east-2.amazonaws.com/public/optimized-resources/product/7878b5ea-887f-4c91-ae01-6a3132ce9859/image/parlante-portatil-bt-go4-resistente-agua-negro-600x600.jpg', rating: 4.5 },
      { id: 3, name: 'Adaptador Bluetooth para Audio', price: 24.99, image: 'https://novicompu.vtexassets.com/arquivos/ids/157975-800-auto?v=637585630442430000&width=800&height=auto&aspect=true', rating: 4.1 },
      { id: 4, name: 'Estuche de Carga para Auriculares', price: 29.99, image: 'https://i5.walmartimages.com/asr/aef832b6-8856-4bf0-8526-999812d47cad.31552ba4a04f58068170e7dfbc967031.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF', rating: 4.6 }
    ]
  };

  // Funciones de utilidad
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    console.log(`Añadido al carrito: ${quantity} unidades de ${product.name}`);
    // Aquí implementarías la lógica para añadir al carrito
  };

  const handleAddToWishlist = () => {
    console.log(`Añadido a favoritos: ${product.name}`);
    // Aquí implementarías la lógica para añadir a favoritos
  };

  const calculateDiscountPercentage = (oldPrice: number, currentPrice: number) => {
    return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
  };

  // Renderizar estrellas de valoración
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={`${
              star <= Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : star <= rating
                  ? 'text-yellow-400 fill-current opacity-60'
                  : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex mb-6 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary-600">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/category" className="hover:text-primary-600">{product.categories[0]}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">{product.name}</span>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 p-6 lg:p-10">
            {/* Product Images */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl overflow-hidden h-96 lg:h-[500px] flex items-center justify-center p-4">
                <img 
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <div 
                    key={index} 
                    className={`bg-gray-50 rounded-lg h-24 flex items-center justify-center p-2 cursor-pointer border-2 transition-all ${
                      index === activeImage ? 'border-primary-500 shadow-md' : 'border-transparent hover:border-gray-300'
                    }`}
                    onClick={() => setActiveImage(index)}
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
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-sm bg-primary-50 text-primary-700 px-2 py-0.5 rounded font-medium">
                    {product.brand}
                  </span>
                  {product.discount > 0 && (
                    <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded text-sm font-medium">
                      {product.discount}% DESCUENTO
                    </span>
                  )}
                </div>
              
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center">
                    {renderRatingStars(product.rating)}
                    <span className="text-yellow-500 ml-1 font-medium">{product.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    <span className="font-medium">{product.reviews}</span> valoraciones
                  </div>
                  <div className="text-gray-400">|</div>
                  <div className="text-sm text-gray-500">
                    SKU: <span className="text-gray-700">{product.sku}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center mb-2">
                  <span className="text-3xl font-bold text-primary-700">${product.price.toFixed(2)}</span>
                  {product.oldPrice && (
                    <span className="ml-3 text-lg text-gray-500 line-through">
                      ${product.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="text-sm text-green-600 font-medium mb-4">
                    ¡Ahorra ${(product.oldPrice - product.price).toFixed(2)}! Oferta por tiempo limitado.
                  </p>
                )}
              </div>
              
              {/* Color Selection */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Color:</h3>
                <div className="flex space-x-3">
                  {product.colors.map((color, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center border-2 ${
                        color.selected ? 'border-primary-500' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {color.selected && <CheckCircle size={20} className="text-white" />}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quantity and Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex border border-gray-300 rounded-lg overflow-hidden h-12">
                  <button 
                    className="px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} />
                  </button>
                  <input 
                    type="number" 
                    className="w-16 text-center border-x border-gray-300 text-gray-700 font-medium"
                    min="1"
                    max="10" 
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  />
                  <button 
                    className="px-4 bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= 10}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <button 
                  className="flex-grow h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Añadir al Carrito
                </button>
                <button 
                  className="h-12 w-12 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-primary-600 hover:border-primary-600 transition-colors duration-200"
                  onClick={handleAddToWishlist}
                  title="Añadir a favoritos"
                >
                  <Heart size={20} />
                </button>
              </div>
              
              {/* Delivery and Benefits */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <div className="flex items-start">
                  <Truck className="text-primary-600 mt-1 flex-shrink-0 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">Entrega rápida</h4>
                    <p className="text-sm text-gray-600">
                      {product.inStock ? (
                        <>Disponible en <span className="font-medium">{product.deliveryTime}</span></>
                      ) : (
                        'Producto agotado temporalmente'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="text-primary-600 mt-1 flex-shrink-0 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">Garantía de 1 año</h4>
                    <p className="text-sm text-gray-600">Garantía del fabricante contra defectos</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <RotateCcw className="text-primary-600 mt-1 flex-shrink-0 mr-3" size={20} />
                  <div>
                    <h4 className="font-medium text-gray-900">Devolución gratuita</h4>
                    <p className="text-sm text-gray-600">Devolución sin costo en los primeros 30 días</p>
                  </div>
                </div>
              </div>
              
              {/* Categories */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">Categorías:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category, index) => (
                      <Link
                        key={index}
                        to={`/category/${category.toLowerCase()}`}
                        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 text-sm rounded-full text-gray-700 transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Share */}
              <div className="flex items-center text-gray-500 text-sm">
                <Share2 size={16} className="mr-2" />
                <span>Compartir este producto</span>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              <button
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('description')}
              >
                Descripción
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'specifications'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('specifications')}
              >
                Especificaciones
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                Valoraciones
              </button>
            </div>
            
            <div className="p-6 lg:p-10">
              {activeTab === 'description' && (
                <div className="max-w-3xl space-y-6">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">Características principales:</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle size={18} className="text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {activeTab === 'specifications' && (
                <div className="max-w-3xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex border-b border-gray-100 pb-3">
                        <span className="w-40 font-medium text-gray-700">{spec.name}:</span>
                        <span className="text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="max-w-3xl">
                  <div className="flex items-center mb-6">
                    <div className="mr-4">
                      <div className="text-5xl font-bold text-gray-900">{product.rating.toFixed(1)}</div>
                      <div className="flex mt-2">{renderRatingStars(product.rating)}</div>
                      <div className="text-sm text-gray-500 mt-1">{product.reviews} valoraciones</div>
                    </div>
                    
                    <div className="flex-grow">
                      {/* Rating bars */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center">
                            <div className="w-12 text-sm text-gray-600">{star} stars</div>
                            <div className="flex-grow mx-3 bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-yellow-400 h-2.5 rounded-full" 
                                style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1}%` }}
                              ></div>
                            </div>
                            <div className="w-10 text-xs text-gray-500">
                              {star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : star === 2 ? 2 : 1}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg">
                        Escribir valoración
                      </button>
                    </div>
                  </div>
                  
                  {/* Sample reviews would go here */}
                  <div className="border-t border-gray-200 pt-6">
                    <p className="text-center text-gray-500">Las valoraciones detalladas se cargarán desde la base de datos.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-52 bg-gray-50 flex items-center justify-center p-4">
                  <img 
                    src={relatedProduct.image} 
                    alt={relatedProduct.name}
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center mb-2">
                    {renderRatingStars(relatedProduct.rating)}
                    <span className="text-xs text-gray-500 ml-1">({relatedProduct.rating})</span>
                  </div>
                  <Link to={`/product/${relatedProduct.id}`}>
                    <h3 className="font-medium text-gray-800 mb-2 hover:text-primary-600 transition-colors line-clamp-2 h-12">
                      {relatedProduct.name}
                    </h3>
                  </Link>
                  <p className="text-primary-600 font-bold">${relatedProduct.price.toFixed(2)}</p>
                  <button className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg font-medium text-sm transition-colors">
                    Ver detalles
                  </button>
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