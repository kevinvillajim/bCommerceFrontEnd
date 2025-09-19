import type { CreditNoteRepository } from '../../../domain/repositories/CreditNoteRepository';
import type { AuthorizedInvoice, GetAuthorizedInvoicesResponse } from '../../../../infrastructure/repositories/HttpCreditNoteRepository';

export class GetAuthorizedInvoicesUseCase {
  constructor(private creditNoteRepository: CreditNoteRepository) {}

  async execute(search?: string, limit: number = 50): Promise<GetAuthorizedInvoicesResponse> {
    try {
      // Validar parámetros
      if (limit > 100) {
        limit = 100; // Límite máximo para performance
      }

      // Llamar al repositorio
      const response = await (this.creditNoteRepository as any).getAuthorizedInvoices(search, limit);

      return response;
    } catch (error) {
      console.error('Error en GetAuthorizedInvoicesUseCase:', error);
      throw error;
    }
  }
}

// Re-exportar tipos para conveniencia
export type { AuthorizedInvoice, GetAuthorizedInvoicesResponse };