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
      return response;

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
   * Poll payment status until completion or timeout
   */
  static async pollPaymentStatus(
    paymentId: string, 
    options?: {
      maxAttempts?: number;
      interval?: number;
      onStatusChange?: (status: string) => void;
    }
  ): Promise<DeunaPaymentStatus> {
    const maxAttempts = options?.maxAttempts || 60; // 5 minutes with 5s intervals
    const interval = options?.interval || 5000; // 5 seconds
    const onStatusChange = options?.onStatusChange;

    let attempts = 0;
    let lastStatus = '';

    while (attempts < maxAttempts) {
      try {
        const statusResponse = await this.getPaymentStatus(paymentId);
        const currentStatus = statusResponse.data.status;

        // Notify status change if callback provided
        if (currentStatus !== lastStatus && onStatusChange) {
          onStatusChange(currentStatus);
          lastStatus = currentStatus;
        }

        // Check if payment is in final state
        if (['completed', 'failed', 'cancelled', 'refunded'].includes(currentStatus)) {
          console.log(`DeunaService: Payment reached final status: ${currentStatus}`);
          return statusResponse;
        }

        attempts++;
        
        // Wait before next attempt
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }

      } catch (error) {
        console.warn(`DeunaService: Error polling payment status (attempt ${attempts + 1})`, error);
        attempts++;
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      }
    }

    throw new Error(`Payment status polling timed out after ${maxAttempts} attempts`);
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
}