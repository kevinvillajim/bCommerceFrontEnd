// src/infrastructure/services/DeunaTypes.ts
export interface DeunaPaymentRequest {
  order_id: string;
  amount: number;
  currency?: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    description?: string;
    product_id?: number; // Include product_id for order creation
  }>;
  qr_type?: 'static' | 'dynamic';
  format?: '0' | '1' | '2' | '3' | '4';
  metadata?: Record<string, any>;
  // ✅ NUEVOS CAMPOS para arquitectura centralizada
  session_id?: string;
  validated_at?: string;
  checkout_data?: any;
}

export interface DeunaPaymentResponse {
  success: boolean;
  data: {
    payment_id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    qr_code_base64?: string;
    payment_url?: string;
    numeric_code?: string;
    created_at: string;
  };
  message: string;
}

export interface DeunaPaymentStatus {
  success: boolean;
  data: {
    payment_id: string;
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    qr_code_base64?: string;
    payment_url?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    deuna_details?: Record<string, any>;
  };
}