import type { CreditNoteRepository } from '../../../domain/repositories/CreditNoteRepository';

export interface CreditNoteStats {
  sri_stats: {
    total_credit_notes: number;
    authorized: number;
    pending: number;
    failed: number;
    definitively_failed: number;
    draft: number;
    success_rate: number;
  };
  additional_stats: {
    failed_credit_notes: number;
    pending_retries: number;
    recent_credit_notes: RecentCreditNote[];
  };
}

export interface RecentCreditNote {
  id: number;
  credit_note_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export class GetCreditNoteStatsUseCase {
  constructor(private creditNoteRepository: CreditNoteRepository) {}

  async execute(): Promise<CreditNoteStats> {
    try {
      return await this.creditNoteRepository.getCreditNoteStats();
    } catch (error) {
      console.error('Error en GetCreditNoteStatsUseCase:', error);
      throw error;
    }
  }
}