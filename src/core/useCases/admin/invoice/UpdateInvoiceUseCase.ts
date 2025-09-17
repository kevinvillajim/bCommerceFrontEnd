import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';

export interface UpdateInvoiceRequest {
  customer_name?: string;
  customer_identification?: string;
  customer_email?: string;
  customer_address?: string;
  customer_phone?: string;
}

export interface UpdateInvoiceResponse {
  invoice_id: number;
  updated_fields: string[];
}

export class UpdateInvoiceUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(invoiceId: number, updateData: UpdateInvoiceRequest): Promise<UpdateInvoiceResponse> {
    try {
      const updateResponse = await this.invoiceRepository.updateInvoice(invoiceId, updateData);
      return updateResponse;
    } catch (error) {
      console.error('Error en UpdateInvoiceUseCase:', error);
      throw error;
    }
  }
}