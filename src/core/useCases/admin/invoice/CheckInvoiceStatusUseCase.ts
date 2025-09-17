import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';

export interface InvoiceStatusCheck {
  invoice_id: number;
  current_status: string;
  sri_status: any;
}

export class CheckInvoiceStatusUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(invoiceId: number): Promise<InvoiceStatusCheck> {
    try {
      const invoiceStatus = await this.invoiceRepository.checkInvoiceStatus(invoiceId);
      return invoiceStatus;
    } catch (error) {
      console.error('Error en CheckInvoiceStatusUseCase:', error);
      throw error;
    }
  }
}