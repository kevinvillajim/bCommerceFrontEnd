// src/infrastructure/services/ExternalDeunaService.ts
import { ApiClient } from "../api/apiClient";
import type { ExternalPaymentData } from "../../utils/ExternalToCheckoutDataConverter";

export interface ExternalDeunaResponse {
  success: boolean;
  data?: {
    payment_id: string;
    order_id: string;
    status: string;
    amount: number;
    currency: string;
    qr_code_base64?: string;
    payment_url?: string;
    numeric_code?: string;
    created_at: string;
    expires_at: string;
  };
  message?: string;
}

export class ExternalDeunaService {
  /**
   * Crear pago externo con Deuna
   */
  static async createExternalPayment(
    linkCode: string,
    customerData: {
      email: string;
      phone: string;
      address: string;
      city: string;
      postal_code: string;
    }
  ): Promise<ExternalDeunaResponse> {
    try {
      console.log('ExternalDeunaService: Creating external payment', { linkCode, customerData });

      // Usar el endpoint específico para pagos externos
      const response = await ApiClient.post<ExternalDeunaResponse>(
        `/pay/${linkCode}/deuna`,
        customerData
      );

      console.log('ExternalDeunaService: Payment created successfully', response);
      return response;

    } catch (error: any) {
      console.error('ExternalDeunaService: Error creating payment', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Error creating external payment'
      );
    }
  }

  /**
   * Simular webhook de pago exitoso (solo para testing)
   */
  static async simulateWebhook(linkCode: string, paymentId: string): Promise<{success: boolean}> {
    try {
      console.log('ExternalDeunaService: Simulating webhook', { linkCode, paymentId });

      const response = await ApiClient.post(`/pay/${linkCode}/deuna/webhook`, {
        status: 'SUCCESS',
        idTransaction: paymentId,
        transferNumber: `TXN_${Date.now()}`,
        internalTransactionReference: paymentId,
        amount: 0, // Will be filled by backend
        timestamp: new Date().toISOString(),
      });

      console.log('ExternalDeunaService: Webhook simulated successfully', response);
      return { success: true };

    } catch (error: any) {
      console.error('ExternalDeunaService: Error simulating webhook', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Error simulating webhook'
      );
    }
  }

  /**
   * Verificar estado de pago externo
   */
  static async checkPaymentStatus(linkCode: string): Promise<{
    success: boolean;
    status: string;
    paid_at?: string;
  }> {
    try {
      console.log('ExternalDeunaService: Checking payment status', { linkCode });

      const response = await ApiClient.get(`/pay/${linkCode}`);

      console.log('ExternalDeunaService: Status checked successfully', response);
      return {
        success: true,
        status: response.data?.status || 'pending',
        paid_at: response.data?.paid_at,
      };

    } catch (error: any) {
      console.error('ExternalDeunaService: Error checking status', error);
      return {
        success: false,
        status: 'error',
      };
    }
  }

  /**
   * Polling simplificado para pagos externos
   */
  static pollExternalPaymentStatus(
    linkCode: string,
    options: {
      maxAttempts?: number;
      interval?: number;
      onStatusChange?: (status: string) => void;
    } = {}
  ) {
    const {
      maxAttempts = 40,
      interval = 15000,
      onStatusChange
    } = options;

    let attempts = 0;
    let cancelled = false;

    const poll = async (): Promise<void> => {
      if (cancelled || attempts >= maxAttempts) {
        return;
      }

      attempts++;

      try {
        const result = await this.checkPaymentStatus(linkCode);

        if (result.success && result.status === 'paid') {
          onStatusChange?.('completed');
          return;
        }

        if (result.status === 'cancelled' || result.status === 'expired') {
          onStatusChange?.(result.status);
          return;
        }

        // Continue polling
        setTimeout(poll, interval);

      } catch (error) {
        console.error('Error polling external payment status:', error);
        // Continue polling on error
        setTimeout(poll, interval);
      }
    };

    // Start polling
    setTimeout(poll, interval);

    return {
      cancel: () => {
        cancelled = true;
      },
      promise: new Promise<void>((resolve, reject) => {
        // This promise resolves when polling is done or cancelled
        const checkCompletion = () => {
          if (cancelled || attempts >= maxAttempts) {
            resolve();
          } else {
            setTimeout(checkCompletion, 1000);
          }
        };
        checkCompletion();
      })
    };
  }
}