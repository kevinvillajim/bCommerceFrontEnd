/**
 * Shopping Cart entity
 */
export interface ShoppingCart {
	id: number;
	userId?: number;
	items: CartItem[];
	total: number;
	item_count?: number;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * Cart Item entity
 */
export interface CartItem {
	id: number;
	cartId?: number;
	productId: number;
	quantity: number;
	price: number;
	subtotal: number;
	attributes?: Record<string, any>;
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
	price?: number;
	attributes?: Record<string, any>;
}

/**
 * Cart Item update data
 */
export interface CartItemUpdateData {
	itemId: number;
	quantity: number;
}

/**
 * Shopping Cart response from API
 */
export interface ShoppingCartResponse {
	status: string;
	message?: string;
	data: {
		id: number;
		total: number;
		items: CartItemResponse[];
		item_count: number;
	};
}

/**
 * Cart Item response from API
 */
export interface CartItemResponse {
	id: number;
	product: {
		main_image: string | undefined;
		id: number;
		name: string;
		price: number;
		image?: string;
		slug?: string;
		stock?: number;
	};
	quantity: number;
	price: number;
	subtotal: number;
	attributes?: Record<string, any>;
}

/**
 * Add to cart request
 */
export interface AddToCartRequest {
	productId: number;
	quantity: number;
	attributes?: Record<string, any>;
}

/**
 * Add to cart response
 */
export interface AddToCartResponse {
	status: string;
	message: string;
	data: {
		cart_id: number;
		item_id: number;
		total: number;
		item_count: number;
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
		cart_id: number;
		total: number;
		item_count: number;
	};
}

/**
 * Cart summary
 */
export interface CartSummary {
	itemCount: number;
	total: number;
}