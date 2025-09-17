/**
 * Interface para el objeto temporal de checkout
 * Este objeto contiene toda la información necesaria para procesar un pago
 * sin crear una orden en la base de datos hasta que el pago sea confirmado
 */

export interface ShippingData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  identification: string; // Cédula/RUC para SRI
}

export interface BillingData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  identification: string; // Cédula/RUC para SRI
  same_as_shipping?: boolean;
}

export interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number; // Precio final con descuentos aplicados
  subtotal: number;
  original_price?: number;
  discount_percentage?: number;
}

export interface CalculatedTotals {
  subtotal_original: number;
  subtotal_with_discounts: number;
  seller_discounts: number;
  volume_discounts: number;
  coupon_discount: number;
  total_discounts: number;
  iva_amount: number;
  shipping_cost: number;
  free_shipping: boolean;
  free_shipping_threshold: number;
  final_total: number;
}

export interface CheckoutData {
  userId: number;
  shippingData: ShippingData;
  billingData: BillingData;
  items: CartItem[];
  totals: CalculatedTotals;
  discountCode?: string;
  discountInfo?: {
    code: string;
    discount_percentage: number;
    discount_amount: number;
  };
  timestamp: string; // ISO string del momento de validación
  sessionId: string; // ID único para prevenir manipulación
  validatedAt: string; // Timestamp de cuando se validó
  expiresAt: string; // Timestamp de expiración (ej: 30 minutos)
  // ✅ CAMPOS ADICIONALES para compatibilidad con legacy code
  widget_url?: string;
  checkout_id?: string;
  transaction_id?: string;
  amount?: number;
}

export interface CheckoutValidationResult {
  success: boolean;
  data?: CheckoutData;
  errors?: {
    shipping?: string[];
    billing?: string[];
    items?: string[];
    general?: string[];
  };
  message?: string;
}

/**
 * Tipo para los métodos de pago disponibles
 */
export type PaymentMethod = 'datafast' | 'deuna';

/**
 * Interface para la respuesta de validación del checkout
 */
export interface ValidationResponse {
  isValid: boolean;
  errors: Record<string, string[]>;
  checkoutData?: CheckoutData;
}

/**
 * Estados del proceso de checkout
 */
export enum CheckoutState {
  FORMS_FILLING = 'forms_filling',
  FORMS_VALIDATED = 'forms_validated',
  PAYMENT_METHOD_SELECTED = 'payment_method_selected',
  PAYMENT_PROCESSING = 'payment_processing',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed'
}

/**
 * Interface para el contexto del checkout
 */
export interface CheckoutContext {
  state: CheckoutState;
  checkoutData: CheckoutData | null;
  selectedPaymentMethod: PaymentMethod | null;
  isProcessing: boolean;
  errors: Record<string, string[]>;
}