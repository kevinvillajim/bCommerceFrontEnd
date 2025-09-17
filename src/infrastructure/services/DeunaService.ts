// src/infrastructure/services/DeunaService.ts
import { ApiClient } from "../api/apiClient";
import type { DeunaPaymentRequest, DeunaPaymentResponse, DeunaPaymentStatus } from "./DeunaTypes";
import { FileText, Clock, CheckCircle, XCircle, Ban, DollarSign, HelpCircle } from "lucide-react";
import React from "react";

// Re-export types for convenience
export type { DeunaPaymentRequest, DeunaPaymentResponse, DeunaPaymentStatus };

export class DeunaService {
  private static readonly BASE_PATH = '/deuna';

  /**
   * Create a new DeUna payment
   */
  static async createPayment(paymentData: DeunaPaymentRequest): Promise<DeunaPaymentResponse> {
    try {
      console.log('DeunaService: Creating payment', paymentData);
      
      // Debug: Log exactly what we're sending to the API
      console.log('🔍 DEUNA SERVICE - EXACT PAYLOAD TO SEND:', {
        path: `${this.BASE_PATH}/payments`,
        payload: paymentData,
        payload_json: JSON.stringify(paymentData),
        items_in_payload: paymentData.items,
        items_count: paymentData.items?.length || 0,
        first_item_keys: paymentData.items && paymentData.items.length > 0 ? Object.keys(paymentData.items[0]) : 'no_items'
      });

      const response = await ApiClient.post<DeunaPaymentResponse>(
        `${this.BASE_PATH}/payments`,
        paymentData
      );

      console.log('DeunaService: Payment created successfully', response);
      return response;

    } catch (error: any) {
      console.error('DeunaService: Error creating payment', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error creating payment'
      );
    }
  }

  /**
   * Generate QR code for existing payment or create new one
   */
  static async generateQR(data: Partial<DeunaPaymentRequest> & { payment_id?: string }): Promise<DeunaPaymentResponse> {
    try {
      console.log('DeunaService: Generating QR code', data);

      const response = await ApiClient.post<DeunaPaymentResponse>(
        `${this.BASE_PATH}/payments/qr`,
        data
      );

      console.log('DeunaService: QR code generated successfully', response);
      return response;

    } catch (error: any) {
      console.error('DeunaService: Error generating QR code', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error generating QR code'
      );
    }
  }

  /**
   * Get payment status by payment ID
   */
  static async getPaymentStatus(paymentId: string): Promise<DeunaPaymentStatus> {
    try {
      console.log('DeunaService: Getting payment status', { paymentId });

      const response = await ApiClient.get<DeunaPaymentStatus>(
        `${this.BASE_PATH}/payments/${paymentId}/status`
      );

      console.log('DeunaService: Payment status retrieved', response);
      return response;

    } catch (error: any) {
      console.error('DeunaService: Error getting payment status', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error getting payment status'
      );
    }
  }

  /**
   * Get payment by order ID
   */
  static async getPaymentByOrderId(orderId: string): Promise<DeunaPaymentStatus> {
    try {
      console.log('DeunaService: Getting payment by order ID', { orderId });

      const response = await ApiClient.get<DeunaPaymentStatus>(
        `${this.BASE_PATH}/orders/${orderId}/payment`
      );

      console.log('DeunaService: Payment retrieved by order ID', response);
      return response;

    } catch (error: any) {
      console.error('DeunaService: Error getting payment by order ID', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error getting payment'
      );
    }
  }

  /**
   * Cancel a payment
   */
  static async cancelPayment(paymentId: string, reason?: string): Promise<{
    success: boolean;
    message: string;
    data: {
      payment_id: string;
      status: string;
      reason: string;
      cancelled_at: string;
    };
  }> {
    try {
      console.log('DeunaService: Cancelling payment', { paymentId, reason });

      const response = await ApiClient.post(
        `${this.BASE_PATH}/payments/${paymentId}/cancel`,
        { reason: reason || 'Cancelled by user' }
      );

      console.log('DeunaService: Payment cancelled successfully', response);
      return response as {
        success: boolean;
        message: string;
        data: {
          payment_id: string;
          status: string;
          reason: string;
          cancelled_at: string;
        };
      };

    } catch (error: any) {
      console.error('DeunaService: Error cancelling payment', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error cancelling payment'
      );
    }
  }

  /**
   * Void/Refund a payment
   */
  static async voidPayment(paymentId: string, amount: number, reason?: string): Promise<{
    success: boolean;
    message: string;
    data: {
      payment_id: string;
      status: string;
      refund_amount: number;
      reason: string;
      refunded_at: string;
    };
  }> {
    try {
      console.log('DeunaService: Processing void/refund', { paymentId, amount, reason });

      const response = await ApiClient.post(
        `${this.BASE_PATH}/payments/${paymentId}/void`,
        { 
          amount,
          reason: reason || 'Void/refund requested by user' 
        }
      );

      console.log('DeunaService: Payment void/refund processed successfully', response);
      return response as {
        success: boolean;
        message: string;
        data: {
          payment_id: string;
          status: string;
          refund_amount: number;
          reason: string;
          refunded_at: string;
        };
      };

    } catch (error: any) {
      console.error('DeunaService: Error processing void/refund', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error processing void/refund'
      );
    }
  }

  /**
   * List payments with filters
   */
  static async listPayments(filters?: {
    status?: string;
    order_id?: string;
    currency?: string;
    from_date?: string;
    to_date?: string;
    customer_email?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    success: boolean;
    data: Array<{
      payment_id: string;
      order_id: string;
      status: string;
      amount: number;
      currency: string;
      customer: Record<string, any>;
      created_at: string;
      updated_at: string;
      completed_at?: string;
    }>;
    meta: {
      count: number;
      limit: number;
      offset: number;
      filters_applied: Record<string, any>;
    };
  }> {
    try {
      console.log('DeunaService: Listing payments', filters);

      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const response = await ApiClient.get(
        `${this.BASE_PATH}/payments?${params.toString()}`
      );

      console.log('DeunaService: Payments listed successfully', response);
      return response as {
        success: boolean;
        data: {
          payment_id: string;
          order_id: string;
          status: string;
          amount: number;
          currency: string;
          customer: Record<string, any>;
          created_at: string;
          updated_at: string;
          completed_at?: string;
        }[];
        meta: {
          count: number;
          total: number;
          limit: number;
          offset: number;
          filters_applied: Record<string, any>;
        };
      };

    } catch (error: any) {
      console.error('DeunaService: Error listing payments', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error listing payments'
      );
    }
  }

  /**
   * Poll payment status until completion or timeout (cancelable)
   */
  static pollPaymentStatus(
    paymentId: string, 
    options?: {
      maxAttempts?: number;
      interval?: number;
      onStatusChange?: (status: string) => void;
      abortSignal?: AbortSignal;
    }
  ): { promise: Promise<DeunaPaymentStatus>; cancel: () => void } {
    const maxAttempts = options?.maxAttempts || 60; // 5 minutes with 5s intervals
    const interval = options?.interval || 5000; // 5 seconds
    const onStatusChange = options?.onStatusChange;

    // Create abort controller for cancellation
    const abortController = new AbortController();
    
    const promise = new Promise<DeunaPaymentStatus>(async (resolve, reject) => {
      let attempts = 0;
      let lastStatus = '';
      let timeoutId: NodeJS.Timeout | null = null;

      const cleanup = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      // Handle abort signal
      const onAbort = () => {
        cleanup();
        reject(new Error('Payment polling was cancelled'));
      };

      abortController.signal.addEventListener('abort', onAbort);

      try {
        while (attempts < maxAttempts && !abortController.signal.aborted) {
          try {
            const statusResponse = await this.getPaymentStatus(paymentId);
            const currentStatus = statusResponse.data.status;

            // Check for abortion before processing
            if (abortController.signal.aborted) {
              cleanup();
              return;
            }

            // Notify status change if callback provided
            if (currentStatus !== lastStatus && onStatusChange) {
              onStatusChange(currentStatus);
              lastStatus = currentStatus;
            }

            // Check if payment is in final state
            if (['completed', 'failed', 'cancelled', 'refunded'].includes(currentStatus)) {
              console.log(`DeunaService: Payment reached final status: ${currentStatus}`);
              cleanup();
              abortController.signal.removeEventListener('abort', onAbort);
              resolve(statusResponse);
              return;
            }

            attempts++;
            
            // Wait before next attempt (with cancellation check)
            if (attempts < maxAttempts && !abortController.signal.aborted) {
              await new Promise<void>((resolveTimeout, rejectTimeout) => {
                timeoutId = setTimeout(() => {
                  timeoutId = null;
                  if (abortController.signal.aborted) {
                    rejectTimeout(new Error('Cancelled'));
                  } else {
                    resolveTimeout();
                  }
                }, interval);

                // Also check abort during timeout
                const checkAbort = () => {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                  }
                  rejectTimeout(new Error('Cancelled'));
                };

                abortController.signal.addEventListener('abort', checkAbort, { once: true });
              });
            }

          } catch (error: any) {
            if (abortController.signal.aborted) {
              cleanup();
              return;
            }

            console.warn(`DeunaService: Error polling payment status (attempt ${attempts + 1})`, error);
            attempts++;
            
            if (attempts < maxAttempts) {
              // Wait before retry with cancellation check
              await new Promise<void>((resolveTimeout, rejectTimeout) => {
                timeoutId = setTimeout(() => {
                  timeoutId = null;
                  if (abortController.signal.aborted) {
                    rejectTimeout(new Error('Cancelled'));
                  } else {
                    resolveTimeout();
                  }
                }, interval);

                const checkAbort = () => {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                  }
                  rejectTimeout(new Error('Cancelled'));
                };

                abortController.signal.addEventListener('abort', checkAbort, { once: true });
              });
            }
          }
        }

        cleanup();
        abortController.signal.removeEventListener('abort', onAbort);

        if (abortController.signal.aborted) {
          reject(new Error('Payment polling was cancelled'));
        } else {
          reject(new Error(`Payment status polling timed out after ${maxAttempts} attempts`));
        }

      } catch (error: any) {
        cleanup();
        abortController.signal.removeEventListener('abort', onAbort);
        if (error.message === 'Cancelled') {
          reject(new Error('Payment polling was cancelled'));
        } else {
          reject(error);
        }
      }
    });

    return {
      promise,
      cancel: () => {
        console.log('DeunaService: Cancelling payment polling');
        abortController.abort();
      }
    };
  }

  /**
   * Validate QR code format
   */
  static isValidQRCode(qrCode: string): boolean {
    if (!qrCode || qrCode.trim() === '') {
      return false;
    }

    // Check if it's a base64 encoded image
    if (qrCode.startsWith('data:image/')) {
      return true;
    }

    // Check if it's a valid URL
    try {
      new URL(qrCode);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Get payment method display name
   */
  static getPaymentMethodDisplayName(method: string): string {
    const methodNames: Record<string, string> = {
      'qr_code': 'Código QR',
      'payment_link': 'Enlace de Pago',
      'numeric_code': 'Código Numérico',
      'deuna': 'DeUna',
    };

    return methodNames[method] || method;
  }

  /**
   * Get status display information
   */
  static getStatusDisplay(status: string): { label: string; color: string; icon: React.ReactElement } {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactElement }> = {
      'created': { label: 'Creado', color: 'blue', icon: React.createElement(FileText, { className: "w-4 h-4" }) },
      'pending': { label: 'Pendiente', color: 'yellow', icon: React.createElement(Clock, { className: "w-4 h-4" }) },
      'completed': { label: 'Completado', color: 'green', icon: React.createElement(CheckCircle, { className: "w-4 h-4" }) },
      'failed': { label: 'Fallido', color: 'red', icon: React.createElement(XCircle, { className: "w-4 h-4" }) },
      'cancelled': { label: 'Cancelado', color: 'gray', icon: React.createElement(Ban, { className: "w-4 h-4" }) },
      'refunded': { label: 'Reembolsado', color: 'purple', icon: React.createElement(DollarSign, { className: "w-4 h-4" }) },
    };

    return statusMap[status] || { label: status, color: 'gray', icon: React.createElement(HelpCircle, { className: "w-4 h-4" }) };
  }

  /**
   * Simulate payment success (for testing only)
   * This triggers the webhook simulation endpoint
   * ⚠️ CRITICAL: NO FALLBACKS - All parameters are required
   */
  static async simulatePaymentSuccess(paymentId: string, amount: number, customerEmail: string, customerName?: string, sessionId?: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    // ✅ STRICT VALIDATION - NO FALLBACKS
    if (!paymentId || paymentId.trim() === '') {
      throw new Error('payment_id es obligatorio para la simulación');
    }

    if (!amount || amount <= 0) {
      throw new Error('amount válido es obligatorio para la simulación');
    }

    if (!customerEmail || customerEmail.trim() === '') {
      throw new Error('customer_email es obligatorio para la simulación');
    }

    try {
      console.log('🧪 Simulating payment success for testing', { paymentId, amount, customerEmail });

      // ✅ PAYLOAD CORRECTO PARA BACKEND COMPATIBILITY
      const requestPayload = {
        payment_id: paymentId,
        transaction_id: paymentId, // ✅ REQUERIDO POR BACKEND
        simulate_deuna: true, // ✅ REQUERIDO PARA DETECTAR SIMULACIÓN
        amount: amount, // ✅ SIN FALLBACK
        currency: 'USD',
        customer_email: customerEmail, // ✅ SIN FALLBACK
        customer_name: customerName || 'Test User', // Solo este fallback es aceptable
        calculated_total: amount, // ✅ CAMPO OPCIONAL PERO CONSISTENTE
        session_id: sessionId // ✅ SESSION_ID REAL PARA RECUPERAR CHECKOUTDATA
      };

      const response = await ApiClient.post<{
        success: boolean;
        message: string;
        data: any;
      }>(
        '/webhooks/deuna/simulate-payment-success',
        requestPayload
      );

      console.log('🎉 Payment simulation response:', response);
      return response;

    } catch (error: any) {
      console.error('❌ Error simulating payment:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Error simulando el pago'
      );
    }
  }

  /**
   * Process real payment completion (NOT simulation)
   * This method handles actual completed payments from Deuna webhook events
   * and processes them through the real webhook flow for creating order + invoice + SRI
   */
  static async processRealPaymentCompletion(paymentId: string, amount?: number, customerEmail?: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log('✅ Processing REAL payment completion (not simulation)', { paymentId, amount, customerEmail });
      console.log('📋 Real payment flow: webhook processing → order creation → invoice → SRI');

      // First, get the current payment status to confirm it's completed
      const statusResponse = await this.getPaymentStatus(paymentId);
      
      if (statusResponse.success && statusResponse.data?.status === 'completed') {
        console.log('✅ Payment confirmed as completed, processing real webhook flow');
        
        // Construct webhook data as it would come from Deuna's real webhook
        const webhookData = {
          event: 'payment.completed',
          payment_id: paymentId,
          status: 'completed',
          amount: amount || statusResponse.data.amount,
          currency: 'USD',
          customer_email: customerEmail || 'default@deuna.com',
          completed_at: new Date().toISOString(),
          // Mark this as a real payment completion (not simulation)
          source: 'real_payment_completion'
        };
        
        console.log('🔄 Processing real payment through webhook handler');
        
        // Process through the real webhook endpoint (NOT the simulation one)
        const response = await ApiClient.post<{
          success: boolean;
          message: string;
          data: any;
        }>(
          '/webhooks/deuna', // Real webhook endpoint
          webhookData
        );
        
        console.log('🎉 Real payment processed successfully:', response);
        console.log('📊 This payment went through: HandleDeunaWebhookUseCase → createOrderFromPayment() → order + invoice + SRI');
        
        return response;
        
      } else {
        console.warn('⚠️ Payment status is not completed, cannot process real completion');
        throw new Error('Payment is not in completed status');
      }

    } catch (error: any) {
      console.error('❌ Error processing real payment completion:', error);
      
      // If the real webhook fails, we could fallback to simulation
      // but log this clearly for debugging
      console.error('🔄 Real payment processing failed, this should be investigated');
      console.error('💡 Consider checking: payment status, webhook endpoint, HandleDeunaWebhookUseCase');
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Error procesando el pago completado real'
      );
    }
  }

  /**
   * Check if we're in development environment
   */
  static isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }
}