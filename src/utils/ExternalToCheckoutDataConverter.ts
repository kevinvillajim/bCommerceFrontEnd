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

    return {
      sessionId,
      userId: 'external_user',
      items: [
        {
          product_id: 'external_payment',
          name: externalData.description || 'Pago Externo',
          quantity: 1,
          price: externalData.amount,
          image: null,
          weight: 0,
          category: 'external',
        }
      ],
      shippingData: {
        name: externalData.customerName,
        email: externalData.customerData.email,
        phone: externalData.customerData.phone,
        address: externalData.customerData.address,
        city: externalData.customerData.city,
        postal_code: externalData.customerData.postal_code,
        shipping_instructions: '',
      },
      paymentMethod: 'deuna',
      totals: {
        subtotal: externalData.amount,
        shipping: 0,
        tax: 0,
        discount: 0,
        final_total: externalData.amount,
      },
      validatedAt: new Date().toISOString(),
      isExternal: true,
      externalLinkCode: externalData.linkCode,
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