import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';
import type { ApiResponse } from '../../../domain/entities/ApiResponse';

export interface RetryInvoiceResponse {
  invoice_id: number;
  retry_count: number;
  sri_response: any;
}

export class RetryInvoiceUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(invoiceId: number): Promise<RetryInvoiceResponse> {
    try {
      const response = await this.invoiceRepository.retryInvoice(invoiceId);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al reintentar la factura');
      }

      return response.data;
    } catch (error) {
      console.error('Error en RetryInvoiceUseCase:', error);
      throw error;
    }
  }
}