import type { CreditNoteRepository } from '../../../domain/repositories/CreditNoteRepository';

export interface RetryCreditNoteResponse {
  success: boolean;
  message: string;
  data: {
    credit_note_id: number;
    retry_count: number;
    sri_response: any;
  };
}

export class RetryCreditNoteUseCase {
  constructor(private creditNoteRepository: CreditNoteRepository) {}

  async execute(creditNoteId: number): Promise<RetryCreditNoteResponse> {
    try {
      return await this.creditNoteRepository.retryCreditNote(creditNoteId);
    } catch (error) {
      console.error('Error en RetryCreditNoteUseCase:', error);
      throw error;
    }
  }
}