// src/utils/ExternalToCheckoutDataConverter.ts
import type { CheckoutData } from '../types/checkout';

export interface ExternalPaymentData {
  linkCode: string;
  customerName: string;
  amount: number;
  description: string;
  customerData: {
    email: string;
    phone: string;
    address: string;
    city: string;
    postal_code: string;
  };
}

export class ExternalToCheckoutDataConverter {
  /**
   * Convierte datos de pago externo al formato CheckoutData que espera QRPaymentForm
   */
  static convertToCheckoutData(externalData: ExternalPaymentData): CheckoutData {
    const sessionId = `external_${externalData.linkCode}_${Date.now()}`;
    const now = new Date().toISOString();

    return {
      userId: 0, // External user ID
      sessionId,
      items: [
        {
          product_id: 0,
          name: externalData.description || 'Pago Externo',
          quantity: 1,
          price: externalData.amount,
          subtotal: externalData.amount,
        }
      ],
      shippingData: {
        name: externalData.customerName,
        email: externalData.customerData.email,
        phone: externalData.customerData.phone,
        street: externalData.customerData.address,
        city: externalData.customerData.city,
        state: '',
        country: 'EC',
        postal_code: externalData.customerData.postal_code,
        identification: '',
      },
      billingData: {
        name: externalData.customerName,
        email: externalData.customerData.email,
        phone: externalData.customerData.phone,
        street: externalData.customerData.address,
        city: externalData.customerData.city,
        state: '',
        country: 'EC',
        postal_code: externalData.customerData.postal_code,
        identification: '',
        same_as_shipping: true,
      },
      totals: {
        subtotal_original: externalData.amount,
        subtotal_with_discounts: externalData.amount,
        seller_discounts: 0,
        volume_discounts: 0,
        coupon_discount: 0,
        total_discounts: 0,
        iva_amount: 0,
        shipping_cost: 0,
        free_shipping: true,
        free_shipping_threshold: 0,
        final_total: externalData.amount,
      },
      timestamp: now,
      validatedAt: now,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };
  }

  /**
   * Crea un request de pago para Deuna desde datos externos
   */
  static createDeunaPaymentRequest(externalData: ExternalPaymentData) {
    const orderId = `EXT_${externalData.linkCode}_${Date.now()}`;

    return {
      order_id: orderId,
      amount: externalData.amount,
      currency: 'USD',
      customer: {
        name: externalData.customerName,
        email: externalData.customerData.email,
        phone: externalData.customerData.phone,
      },
      items: [
        {
          name: externalData.description || 'Pago Externo',
          quantity: 1,
          price: externalData.amount,
          description: externalData.description || 'Pago Externo',
          product_id: 'external_payment',
        }
      ],
      qr_type: 'dynamic',
      format: '2', // QR + Payment Link
      metadata: {
        source: 'bcommerce_external_payment',
        link_code: externalData.linkCode,
        external_payment: true,
        created_at: new Date().toISOString(),
      },
      // Campos específicos para pagos externos
      external_link_code: externalData.linkCode,
      is_external: true,
    };
  }
}