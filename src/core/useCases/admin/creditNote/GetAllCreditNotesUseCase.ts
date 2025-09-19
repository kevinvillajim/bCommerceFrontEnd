import type { CreditNoteRepository } from '../../../domain/repositories/CreditNoteRepository';
import type { PaginatedResponse } from '../../../domain/entities/ApiResponse';

export interface CreditNoteFilters {
  status?: string;
  customer_identification?: string;
  customer_name?: string;
  start_date?: string;
  end_date?: string;
  credit_note_number?: string;
  page?: number;
  per_page?: number;
  // Filtros adicionales SRI
  limit?: number;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface AdminCreditNote {
  id: number;
  credit_note_number: string;
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
  motivo: string;
  documento_modificado: string;
  sri_access_key?: string;
  sri_authorization_number?: string;
  sri_error_message?: string;
  retry_count: number;
  last_retry_at?: string;
  invoice?: {
    id: number;
    invoice_number: string;
    status: string;
  };
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

export class GetAllCreditNotesUseCase {
  constructor(private creditNoteRepository: CreditNoteRepository) {}

  async execute(filters: CreditNoteFilters = {}): Promise<PaginatedResponse<AdminCreditNote>> {
    try {
      const response = await this.creditNoteRepository.getAllCreditNotes(filters);
      return response.data;
    } catch (error) {
      console.error('Error en GetAllCreditNotesUseCase:', error);
      throw error;
    }
  }
}