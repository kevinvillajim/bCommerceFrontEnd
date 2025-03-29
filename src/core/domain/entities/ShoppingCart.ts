/**
 * Shopping Cart entity
 */
export interface ShoppingCart {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Cart Item entity
 */
export interface CartItem {
  id?: number;
  cartId: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  product?: {
    name: string;
    image?: string;
    slug?: string;
    stockAvailable?: number;
  };
}

/**
 * Cart Item creation data
 */
export interface CartItemCreationData {
  productId: number;
  quantity: number;
  price: number;
}

/**
 * Cart Item update data
 */
export interface CartItemUpdateData {
  itemId: number;
  quantity: number;
}

/**
 * Shopping Cart response
 */
export interface ShoppingCartResponse {
  data: ShoppingCart;
}

/**
 * Add to cart request
 */
export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

/**
 * Add to cart response
 */
export interface AddToCartResponse {
  status: string;
  message: string;
  data: {
    cart: ShoppingCart;
    itemAdded: CartItem;
  };
}

/**
 * Remove from cart request
 */
export interface RemoveFromCartRequest {
  itemId: number;
}

/**
 * Update cart item request
 */
export interface UpdateCartItemRequest {
  itemId: number;
  quantity: number;
}

/**
 * Empty cart response
 */
export interface EmptyCartResponse {
  status: string;
  message: string;
  data: {
    cart: ShoppingCart;
  };
}

/**
 * Cart summary
 */
export interface CartSummary {
  itemCount: number;
  total: number;
}