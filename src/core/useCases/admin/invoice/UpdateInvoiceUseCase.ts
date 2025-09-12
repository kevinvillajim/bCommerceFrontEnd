import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';
import type { ApiResponse } from '../../../domain/entities/ApiResponse';

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
      const response = await this.invoiceRepository.updateInvoice(invoiceId, updateData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al actualizar la factura');
      }

      return response.data;
    } catch (error) {
      console.error('Error en UpdateInvoiceUseCase:', error);
      throw error;
    }
  }
}