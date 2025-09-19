import type { CreditNoteRepository } from '../../../domain/repositories/CreditNoteRepository';

export interface CreditNoteStatusCheck {
  success: boolean;
  data: {
    credit_note_id: number;
    current_status: string;
    sri_status: any;
  };
}

export class CheckCreditNoteStatusUseCase {
  constructor(private creditNoteRepository: CreditNoteRepository) {}

  async execute(creditNoteId: number): Promise<CreditNoteStatusCheck> {
    try {
      return await this.creditNoteRepository.checkCreditNoteStatus(creditNoteId);
    } catch (error) {
      console.error('Error en CheckCreditNoteStatusUseCase:', error);
      throw error;
    }
  }
}