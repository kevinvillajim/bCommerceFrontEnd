import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AxiosResponse } from 'axios';
import type { ShoppingCart, CartItem, AddToCartRequest, CartItemUpdateData } from '../../core/domain/entities/ShoppingCart';
import { LocalStorageService } from '../../infrastructure/services/LocalStorageService';
import ApiClient from '../../infrastructure/api/ApiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';

// Interfaz para respuestas de la API
interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

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

  // Initialize cart on mount
  useEffect(() => {
    const initCart = async () => {
      // Try to get cart from API first (for logged in users)
      const token = storageService.getItem('auth_token');
      
      if (token) {
        try {
          setLoading(true);
          const response: AxiosResponse<ApiResponse<ShoppingCart>> = await ApiClient.get(API_ENDPOINTS.CART.GET);
          const cartData = response.data.data;
          setCart(cartData);
        } catch (err) {
          // If API call fails, try to get from localStorage
          const localCart = storageService.getItem('cart');
          if (localCart) {
            setCart(JSON.parse(localCart));
          }
        } finally {
          setLoading(false);
        }
      } else {
        // For anonymous users, get from localStorage
        const localCart = storageService.getItem('cart');
        if (localCart) {
          setCart(JSON.parse(localCart));
        }
      }
    };

    initCart();
  }, []);

  // Update derived states when cart changes
  useEffect(() => {
    if (cart) {
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setItemCount(count);
      setTotalAmount(cart.total);
      
      // Sync with localStorage for anonymous users
      if (!storageService.getItem('auth_token')) {
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
      const token = storageService.getItem('auth_token');
      
      if (token) {
        // For logged in users, use API
        const response: AxiosResponse<ApiResponse<{ cart: ShoppingCart }>> = await ApiClient.post(
          API_ENDPOINTS.CART.ADD_ITEM, 
          request
        );
        setCart(response.data.data.cart);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = storageService.getItem('auth_token');
      
      if (token) {
        // For logged in users, use API
        const response: AxiosResponse<ApiResponse<{ cart: ShoppingCart }>> = await ApiClient.delete(
          API_ENDPOINTS.CART.REMOVE_ITEM(itemId)
        );
        setCart(response.data.data.cart);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  // Update cart item quantity
  const updateCartItem = useCallback(async (data: CartItemUpdateData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = storageService.getItem('auth_token');
      
      if (token) {
        // For logged in users, use API
        const response: AxiosResponse<ApiResponse<{ cart: ShoppingCart }>> = await ApiClient.put(
          API_ENDPOINTS.CART.UPDATE_ITEM(data.itemId), 
          { quantity: data.quantity }
        );
        setCart(response.data.data.cart);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update cart item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cart]);

  // Clear entire cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = storageService.getItem('auth_token');
      
      if (token) {
        // For logged in users, use API
        const response: AxiosResponse<ApiResponse<{ cart: ShoppingCart }>> = await ApiClient.delete(
          API_ENDPOINTS.CART.EMPTY
        );
        setCart(response.data.data.cart);
      } else {
        // For anonymous users, clear local cart
        setCart(null);
        storageService.removeItem('cart');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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