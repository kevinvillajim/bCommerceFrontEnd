import type { CreditNoteRepository } from '../../../domain/repositories/CreditNoteRepository';

export interface CreditNoteDetail {
  id: number;
  credit_note_number: string;
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
  motivo: string;
  documento_modificado: {
    tipo: string;
    numero: string;
    fecha: string;
  };
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
  invoice?: {
    id: number;
    invoice_number: string;
    status: string;
    issue_date: string;
    total_amount: number;
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
  items: CreditNoteItemDetail[];
  created_via: string;
  created_at: string;
  updated_at: string;
}

export interface CreditNoteItemDetail {
  id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  codigo_iva: string;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export class GetCreditNoteByIdUseCase {
  constructor(private creditNoteRepository: CreditNoteRepository) {}

  async execute(id: number): Promise<CreditNoteDetail> {
    try {
      return await this.creditNoteRepository.getCreditNoteById(id);
    } catch (error) {
      console.error('Error en GetCreditNoteByIdUseCase:', error);
      throw error;
    }
  }
}