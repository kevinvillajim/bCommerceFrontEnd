import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';
import type { PaginatedResponse } from '../../../domain/entities/ApiResponse';

export interface InvoiceFilters {
  status?: string;
  customer_identification?: string;
  customer_name?: string;
  start_date?: string;
  end_date?: string;
  invoice_number?: string;
  page?: number;
  per_page?: number;
}

export interface AdminInvoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  status: string;
  status_label: string;
  status_color: string;
  customer: {
    identification: string;
    identification_type: string;
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  sri_access_key?: string;
  sri_authorization_number?: string;
  sri_error_message?: string;
  retry_count: number;
  last_retry_at?: string;
  order?: {
    id: number;
    order_number: string;
    user: {
      name: string;
      email: string;
    };
  };
  items_count: number;
  created_at: string;
}

export class GetAllInvoicesUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(filters: InvoiceFilters = {}): Promise<PaginatedResponse<AdminInvoice>> {
    try {
      const response = await this.invoiceRepository.getAllInvoices(filters);
      return response.data;
    } catch (error) {
      console.error('Error en GetAllInvoicesUseCase:', error);
      throw error;
    }
  }
}