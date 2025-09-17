import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';

export interface InvoiceStats {
  sri_stats: {
    total_invoices: number;
    authorized: number;
    pending: number;
    failed: number;
    definitively_failed: number;
    draft: number;
    success_rate: number;
  };
  additional_stats: {
    failed_invoices: number;
    pending_retries: number;
    recent_invoices: Array<{
      id: number;
      invoice_number: string;
      customer_name: string;
      total_amount: number;
      status: string;
      created_at: string;
    }>;
  };
}

export class GetInvoiceStatsUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(): Promise<InvoiceStats> {
    try {
      const invoiceStats = await this.invoiceRepository.getInvoiceStats();
      return invoiceStats;
    } catch (error) {
      console.error('Error en GetInvoiceStatsUseCase:', error);
      throw error;
    }
  }
}