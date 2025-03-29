/**
 * Order entity
 */
export interface Order {
  id?: number;
  userId: number;
  sellerId?: number;
  items: OrderItem[];
  total: number;
  status: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDetails?: Record<string, any>; // Añadido según la migración
  shippingData?: Record<string, any>;
  orderNumber: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Order item entity
 */
export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  product?: {
    name: string;
    image?: string;
    slug?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Order creation data
 */
export interface OrderCreationData {
  sellerId?: number;
  items: OrderItemCreationData[];
  shippingData?: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
    name: string;
  };
  // El userId no es necesario en la creación ya que se toma del usuario autenticado
}

/**
 * Order item creation data
 */
export interface OrderItemCreationData {
  productId: number;
  quantity: number;
  // El precio no es necesario en la creación ya que se toma del producto actual
}

/**
 * Order status update data
 */
export interface OrderStatusUpdateData {
  status: string;
}

/**
 * Order payment info update data
 */
export interface OrderPaymentUpdateData {
  paymentId: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDetails?: Record<string, any>; // Añadido para incluir detalles del pago
}

/**
 * Order shipping data update
 */
export interface OrderShippingUpdateData {
  shippingData: Record<string, any>;
}

/**
 * Order list response
 */
export interface OrderListResponse {
  data: Order[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Order detail response
 */
export interface OrderDetailResponse {
  data: Order;
}

/**
 * Order filter params
 */
export interface OrderFilterParams {
  userId?: number;
  sellerId?: number;
  status?: string;
  paymentStatus?: string;
  orderNumber?: string; // Añadido para buscar por número de orden
  dateFrom?: string;
  dateTo?: string;
  minTotal?: number;
  maxTotal?: number;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}