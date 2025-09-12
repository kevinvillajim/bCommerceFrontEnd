import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';
import type { ApiResponse } from '../../../domain/entities/ApiResponse';

export interface InvoiceStatusCheck {
  invoice_id: number;
  current_status: string;
  sri_status: any;
}

export class CheckInvoiceStatusUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(invoiceId: number): Promise<InvoiceStatusCheck> {
    try {
      const response = await this.invoiceRepository.checkInvoiceStatus(invoiceId);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al consultar el estado de la factura');
      }

      return response.data;
    } catch (error) {
      console.error('Error en CheckInvoiceStatusUseCase:', error);
      throw error;
    }
  }
}