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
		id: number;
		name: string;
		slug?: string;
		price: number;
		// ✅ PROPIEDADES NECESARIAS PARA EL CARRITO
		final_price?: number;
		discount_percentage?: number;
		rating?: number;
		rating_count?: number;
		image?: string;
		main_image?: string;
		stockAvailable?: number;
		sellerId?: number;
		seller_id?: number;
		seller?: {
			id: number;
			storeName?: string;
		};
		user_id?: number;
		stock?: number;
		// ✅ CAMPOS ADICIONALES PARA COMPATIBILIDAD
		is_in_stock?: boolean;
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
		id: number;
		name: string;
		price: number;
		// ✅ CAMPOS OBLIGATORIOS AGREGADOS
		final_price?: number;
		discount_percentage?: number;
		rating?: number;
		rating_count?: number;
		// ✅ CAMPOS DE IMAGEN
		main_image?: string;
		image?: string;
		// ✅ CAMPOS DE STOCK Y VENDEDOR
		slug?: string;
		stock?: number;
		sellerId?: number;
		seller_id?: number;
		seller?: {
			id: number;
			storeName?: string;
		};
		user_id?: number;
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
