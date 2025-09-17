import type { InvoiceRepository } from '../../../domain/repositories/InvoiceRepository';

export interface InvoiceDetail {
  id: number;
  invoice_number: string;
  issue_date: string;
  status: string;
  status_label: string;
  status_color: string;
  customer: {
    identification: string;
    identification_type: string;
    identification_type_label: string;
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  sri: {
    access_key?: string;
    authorization_number?: string;
    error_message?: string;
    response?: any;
  };
  retry_info: {
    count: number;
    last_retry_at?: string;
    can_retry: boolean;
  };
  order?: {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    user: {
      id?: number;
      name: string;
      email: string;
    };
  };
  items: Array<{
    id: number;
    product_code: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    discount: number;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    product?: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  created_via: string;
  created_at: string;
  updated_at: string;
}

export class GetInvoiceByIdUseCase {
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(id: number): Promise<InvoiceDetail> {
    try {
      const invoiceDetail = await this.invoiceRepository.getInvoiceById(id);
      return invoiceDetail;
    } catch (error) {
      console.error('Error en GetInvoiceByIdUseCase:', error);
      throw error;
    }
  }
}