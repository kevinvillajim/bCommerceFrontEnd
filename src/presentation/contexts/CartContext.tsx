import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AxiosResponse } from 'axios';
import type { ShoppingCart, CartItem, AddToCartRequest, CartItemUpdateData } from '../../core/domain/entities/ShoppingCart';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';
import { AuthContext } from '../contexts/AuthContext';
import axiosInstance from '../../infrastructure/api/axiosConfig';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import appConfig from '../../config/appConfig';

// // Interfaz para respuestas de la API
// interface ApiResponse<T> {
//   status: string;
//   message?: string;
//   data: T;
// }


// Define context interface
interface CartContextProps {
  cart: ShoppingCart | null;
  loading: boolean;
  error: string | null;
  addToCart: (request: AddToCartRequest) => Promise<boolean>;
  removeFromCart: (itemId: number) => Promise<boolean>;
  updateCartItem: (data: CartItemUpdateData) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  itemCount: number;
  totalAmount: number;
}

// Create context with default values
export const CartContext = createContext<CartContextProps>({
  cart: null,
  loading: false,
  error: null,
  addToCart: async () => false,
  removeFromCart: async () => false,
  updateCartItem: async () => false,
  clearCart: async () => false,
  itemCount: 0,
  totalAmount: 0
});

// Storage service instance
const storageService = new LocalStorageService();

// Provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const { isAuthenticated } = useContext(AuthContext);

  // Initialize cart on mount
  useEffect(() => {
  const initCart = async () => {
    const token = storageService.getItem(appConfig.storage.authTokenKey);
    console.log('Token obtenido:', token);

    if (token && isAuthenticated) {
      try {
        console.log('📦 Usuario autenticado, intentando obtener el carrito desde la API');
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        const response: AxiosResponse<any> = await axiosInstance.get(API_ENDPOINTS.CART.GET);
        console.log('Respuesta de la API:', response);
        if (response && response.data) {
          const cartData = response.data.data;
          console.log('Datos del carrito obtenidos de la API:', cartData);
          setCart(cartData);
        } else {
          throw new Error('Respuesta vacía de la API');
        }
      } catch (err: any) {
        console.error('Error al obtener el carrito desde la API:', err);
        console.log('Intentando obtener el carrito desde localStorage...');
        const localCart = storageService.getItem('cart');
        console.log('Valor obtenido de localStorage:', localCart);
        if (localCart) {
          try {
            const parsedCart = JSON.parse(localCart);
            console.log('Carrito parseado correctamente desde localStorage:', parsedCart);
            setCart(parsedCart);
          } catch (e) {
            console.error('Error al parsear el carrito desde localStorage:', e);
            storageService.removeItem('cart');
          }
        }
      } finally {
        setLoading(false);
      }
    } else {
      console.log('📦 Usuario no autenticado, usando carrito local');
      const localCart = storageService.getItem('cart');
      console.log('Valor obtenido de localStorage:', localCart);
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          console.log('Carrito parseado correctamente desde localStorage:', parsedCart);
          setCart(parsedCart);
        } catch (e) {
          console.error('Error al parsear el carrito desde localStorage:', e);
          storageService.removeItem('cart');
        }
      }
    }
  };

  initCart();
}, [isAuthenticated]);

  // Update derived states when cart changes
  useEffect(() => {
    if (cart) {
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
      setTotalAmount(cart.total);
      
      // Sync with localStorage for anonymous users
      if (!storageService.getItem(appConfig.storage.authTokenKey)) {
        storageService.setItem('cart', JSON.stringify(cart));
      }
    } else {
      setItemCount(0);
      setTotalAmount(0);
    }
  }, [cart]);

  // Add item to cart
  const addToCart = useCallback(async (request: AddToCartRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = storageService.getItem(appConfig.storage.authTokenKey);
      
      if (token && isAuthenticated) {
        // For logged in users, use API
        const response = await axiosInstance.post(
          API_ENDPOINTS.CART.ADD_ITEM, 
          request
        );
        
        if (response.data?.data?.cart) {
          setCart(response.data.data.cart);
        }
      } else {
        // For anonymous users, update local cart
        const currentCart = cart || {
          id: Date.now(),
          userId: 0,
          items: [],
          total: 0
        };
        
        // Check if product already exists in cart
        const existingItemIndex = currentCart.items.findIndex(
          item => item.productId === request.productId
        );
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...currentCart.items];
          updatedItems[existingItemIndex].quantity += request.quantity;
          updatedItems[existingItemIndex].subtotal = 
            updatedItems[existingItemIndex].price * updatedItems[existingItemIndex].quantity;
          
          const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
          
          setCart({
            ...currentCart,
            items: updatedItems,
            total: newTotal
          });
        } else {
          // Add new item (in a real app, you'd fetch the product price)
          // This is simplified - you'd need to get the product price from somewhere
          const price = 0; // This should come from product data
          const newItem: CartItem = {
            cartId: currentCart.id,
            productId: request.productId,
            quantity: request.quantity,
            price: price,
            subtotal: price * request.quantity
          };
          
          const newItems = [...currentCart.items, newItem];
          const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);
          
          setCart({
            ...currentCart,
            items: newItems,
            total: newTotal
          });
        }
      }
      
      return true;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMsg);
      console.error('Failed to add item to cart:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cart, isAuthenticated]);

 const removeFromCart = useCallback(async (itemId: number): Promise<boolean> => {
  setLoading(true);
  setError(null);
  
  try {
    const token = storageService.getItem(appConfig.storage.authTokenKey);
    
    if (token && isAuthenticated) {
      // For logged in users, use API
      const response = await axiosInstance.delete(
        API_ENDPOINTS.CART.REMOVE_ITEM(itemId)
      );
      
      if (response.data?.data?.cart) {
        setCart(response.data.data.cart);
      }
    } else {
      // For anonymous users, update local cart
      if (!cart) return false;
      
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      setCart({
        ...cart,
        items: updatedItems,
        total: newTotal
      });
    }
    
    return true;
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
    setError(errorMessage);
    console.error('Failed to remove item from cart:', err);
    return false;
  } finally {
    setLoading(false);
  }
}, [cart, isAuthenticated]);

// Update cart item quantity
const updateCartItem = useCallback(async (data: CartItemUpdateData): Promise<boolean> => {
  setLoading(true);
  setError(null);
  
  try {
    const token = storageService.getItem(appConfig.storage.authTokenKey);
    
    if (token && isAuthenticated) {
      // For logged in users, use API
      const response = await axiosInstance.put(
        API_ENDPOINTS.CART.UPDATE_ITEM(data.itemId), 
        { quantity: data.quantity }
      );
      
      if (response.data?.data?.cart) {
        setCart(response.data.data.cart);
      }
    } else {
      // For anonymous users, update local cart
      if (!cart) return false;
      
      const updatedItems = cart.items.map(item => {
        if (item.id === data.itemId) {
          return {
            ...item,
            quantity: data.quantity,
            subtotal: item.price * data.quantity
          };
        }
        return item;
      });
      
      const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      
      setCart({
        ...cart,
        items: updatedItems,
        total: newTotal
      });
    }
    
    return true;
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update cart item';
    setError(errorMessage);
    console.error('Failed to update cart item:', err);
    return false;
  } finally {
    setLoading(false);
  }
}, [cart, isAuthenticated]);

// Clear entire cart
const clearCart = useCallback(async (): Promise<boolean> => {
  setLoading(true);
  setError(null);
  
  try {
    const token = storageService.getItem(appConfig.storage.authTokenKey);
    
    if (token && isAuthenticated) {
      // For logged in users, use API
      const response = await axiosInstance.post(
        API_ENDPOINTS.CART.EMPTY
      );
      
      if (response.data?.data?.cart) {
        setCart(response.data.data.cart);
      }
    } else {
      // For anonymous users, clear local cart
      setCart(null);
      const localCart = storageService.getItem('cart');
        if (localCart) {
          try {
            // Intentamos parsear; si falla, lo limpiamos y mostramos un mensaje
            const parsedCart = JSON.parse(localCart);
            setCart(parsedCart);
          } catch (e) {
            console.error('Error parsing local cart:', e);
            // Limpiar el item incorrecto para evitar futuros errores
            const localCart = storageService.getItem('cart');
if (localCart) {
  try {
    const parsedCart = JSON.parse(localCart);
    setCart(parsedCart);
  } catch (e) {
    console.error('Error parsing local cart:', e);
    // Elimina el valor incorrecto para evitar futuros errores
    storageService.removeItem('cart');
  }
}
          }
        }
    }
    
    return true;
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
    setError(errorMessage);
    console.error('Failed to clear cart:', err);
    return false;
  } finally {
    setLoading(false);
  }
}, [isAuthenticated]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      error, 
      addToCart, 
      removeFromCart, 
      updateCartItem, 
      clearCart,
      itemCount,
      totalAmount
    }}>
      {children}
    </CartContext.Provider>
  );
};