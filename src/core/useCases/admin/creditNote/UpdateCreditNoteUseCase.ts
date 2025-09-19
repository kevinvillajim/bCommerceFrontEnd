import type { CreditNoteRepository } from '../../../domain/repositories/CreditNoteRepository';

export interface UpdateCreditNoteRequest {
  customer_name?: string;
  customer_identification?: string;
  customer_email?: string;
  customer_address?: string;
  customer_phone?: string;
  motivo?: string;
}

export interface UpdateCreditNoteResponse {
  success: boolean;
  message: string;
  data: {
    credit_note_id: number;
    updated_fields: string[];
  };
}

export class UpdateCreditNoteUseCase {
  constructor(private creditNoteRepository: CreditNoteRepository) {}

  async execute(creditNoteId: number, updateData: UpdateCreditNoteRequest): Promise<UpdateCreditNoteResponse> {
    try {
      return await this.creditNoteRepository.updateCreditNote(creditNoteId, updateData);
    } catch (error) {
      console.error('Error en UpdateCreditNoteUseCase:', error);
      throw error;
    }
  }
}