import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';

export interface RetryInvoiceResponse {
  invoice_id: number;
  retry_count: number;
  sri_response: any;
}

export class RetryInvoiceUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(invoiceId: number): Promise<RetryInvoiceResponse> {
    try {
      const retryResponse = await this.invoiceRepository.retryInvoice(invoiceId);
      return retryResponse;
    } catch (error) {
      console.error('Error en RetryInvoiceUseCase:', error);
      throw error;
    }
  }
}