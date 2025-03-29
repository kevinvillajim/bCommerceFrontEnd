import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Heart } from 'lucide-react';

// Definir la interfaz para los productos en el carrito
interface CartItem {
  id: number;
  name: string;
  price: number;
  discount?: number;
  image: string;
  category?: string;
  quantity: number;
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Simulación de carga de productos del carrito
    const fetchCartItems = async () => {
      setIsLoading(true);
      try {
        // Simulación de una API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Ejemplo de datos (reemplazar con tu lógica real para obtener el carrito)
        const mockItems: CartItem[] = [
          {
            id: 1,
            name: "Auriculares Bluetooth Pro",
            price: 129.99,
            discount: 15,
            image: "https://thumbs.ielectro.es/product/med/23714.webp",
            category: "Electrónica",
            quantity: 1
          },
          {
            id: 2,
            name: "Smartwatch Fitness Tracker",
            price: 89.99,
            image: "https://m.media-amazon.com/images/I/71JU-bUt-sL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
            category: "Accesorios",
            quantity: 2
          }
        ];
        
        setCartItems(mockItems);
        setIsEmpty(mockItems.length === 0);
      } catch (error) {
        console.error("Error al cargar el carrito:", error);
        setIsEmpty(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Calcular precio con descuento
  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  // Manipulación de cantidades
  const increaseQuantity = (id: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: number) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id && item.quantity > 1 
          ? { ...item, quantity: item.quantity - 1 } 
          : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    if (cartItems.length === 1) {
      setIsEmpty(true);
    }
    // Aquí implementar lógica para eliminar del carrito en backend/localStorage
  };

  const moveToWishlist = (id: number) => {
    // Aquí implementar lógica para mover a favoritos
    console.log(`Producto ${id} movido a favoritos`);
    removeFromCart(id);
  };

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'discount10') {
      setCouponApplied(true);
      setCouponDiscount(10);
    } else {
      alert('Código de cupón inválido');
    }
  };

  // Calcular subtotal, impuestos y total
  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = calculateDiscountedPrice(item.price, item.discount);
    return sum + (itemPrice * item.quantity);
  }, 0);
  
  const taxRate = 0.15; // 15% IVA
  const tax = subtotal * taxRate;
  
  const couponAmount = couponApplied ? (subtotal * (couponDiscount / 100)) : 0;
  const total = subtotal + tax - couponAmount;

  // Función para proceder al checkout
  const handleCheckout = () => {
    // Aquí implementar lógica para el checkout
    navigate('/checkout');
  };

  return (
    <div className="container mx-auto px-10 lg:px-50 py-10">
      <h1 className="text-3xl font-bold mb-8">Mi Carrito</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : isEmpty ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">Tu carrito está vacío</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Añade productos a tu carrito para continuar comprando.</p>
          <Link 
            to="/products" 
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Lista de productos */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
              {/* Encabezado */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-5 bg-gray-50 border-b">
                <div className="sm:col-span-6">
                  <span className="font-medium text-gray-800">Producto</span>
                </div>
                <div className="sm:col-span-2 text-center">
                  <span className="font-medium text-gray-800">Precio</span>
                </div>
                <div className="sm:col-span-2 text-center">
                  <span className="font-medium text-gray-800">Cantidad</span>
                </div>
                <div className="sm:col-span-2 text-center">
                  <span className="font-medium text-gray-800">Total</span>
                </div>
              </div>
              
              {/* Productos */}
              {cartItems.map((item) => {
                const itemPrice = calculateDiscountedPrice(item.price, item.discount);
                const itemTotal = itemPrice * item.quantity;
                
                return (
                  <div key={item.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="grid sm:grid-cols-12 gap-4 p-5">
                      {/* Producto (imagen y nombre) */}
                      <div className="sm:col-span-6 flex">
                        <Link to={`/products/${item.id}`} className="w-24 h-24 flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </Link>
                        <div className="ml-4 flex flex-col">
                          <Link to={`/products/${item.id}`} className="font-medium text-gray-800 hover:text-primary-600">
                            {item.name}
                          </Link>
                          {item.category && (
                            <span className="text-sm text-gray-500 mt-1">{item.category}</span>
                          )}
                          <div className="mt-auto flex space-x-3 text-sm pt-3">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-500 hover:text-red-500 flex items-center"
                            >
                              <Trash2 size={14} className="mr-1" />
                              Eliminar
                            </button>
                            <button 
                              onClick={() => moveToWishlist(item.id)}
                              className="text-gray-500 hover:text-primary-600 flex items-center"
                            >
                              <Heart size={14} className="mr-1" />
                              Guardar
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Precio */}
                      <div className="sm:col-span-2 flex items-center justify-center sm:justify-center">
                        <div className="sm:hidden mr-2 font-medium text-gray-800">Precio:</div>
                        <div className="font-medium">
                          {item.discount ? (
                            <div className="flex flex-col sm:items-center">
                              <span className="text-primary-600">${itemPrice.toFixed(2)}</span>
                              <span className="text-xs text-gray-500 line-through">${item.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-800">${item.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Cantidad */}
                      <div className="sm:col-span-2 flex items-center justify-center">
                        <div className="sm:hidden mr-2 font-medium text-gray-800">Cantidad:</div>
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button 
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1 text-gray-800 text-center w-10">{item.quantity}</span>
                          <button 
                            onClick={() => increaseQuantity(item.id)}
                            className="px-2 py-1 text-gray-600 hover:text-gray-800"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="sm:col-span-2 flex items-center justify-center sm:justify-center">
                        <div className="sm:hidden mr-2 font-medium text-gray-800">Total:</div>
                        <span className="font-bold text-gray-800">${itemTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Botón para continuar comprando */}
            <div>
              <Link 
                to="/products" 
                className="inline-flex items-center text-primary-600 hover:text-primary-700"
              >
                <ArrowLeft size={18} className="mr-2" />
                Continuar comprando
              </Link>
            </div>
          </div>
          
          {/* Resumen del pedido */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen del pedido</h2>
                
                {/* Cupón */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <input
                      type="text"
                      placeholder="Código de cupón"
                      className="flex-1 border border-gray-300 rounded-l-md py-3 px-4 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponApplied || !couponCode}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-r-md disabled:opacity-50"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponApplied && (
                    <div className="text-green-600 text-sm">
                      Cupón aplicado: {couponDiscount}% de descuento
                    </div>
                  )}
                </div>
                
                {/* Cálculos */}
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (16%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  {couponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento de cupón</span>
                      <span>-${couponAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t border-gray-200 pt-4">
                    <span className="text-xl font-bold">Total</span>
                    <span className="text-xl font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Botón de checkout */}
                <button
                  onClick={handleCheckout}
                  className="mt-8 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  Proceder al pago
                </button>
                
                {/* Información adicional */}
                <div className="mt-4 text-xs text-gray-500">
                  <p>Los impuestos y gastos de envío se calculan durante el proceso de pago.</p>
                  <p className="mt-1">Aceptamos diversas formas de pago, incluyendo tarjetas de crédito, transferencias bancarias y pago contra entrega.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;