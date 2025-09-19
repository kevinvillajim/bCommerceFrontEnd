import type { PaginatedApiResponse } from '../entities/ApiResponse';
import type { CreditNoteFilters, AdminCreditNote } from '../../useCases/admin/creditNote/GetAllCreditNotesUseCase';
import type { CreditNoteDetail } from '../../useCases/admin/creditNote/GetCreditNoteByIdUseCase';
import type { RetryCreditNoteResponse } from '../../useCases/admin/creditNote/RetryCreditNoteUseCase';
import type { CreditNoteStatusCheck } from '../../useCases/admin/creditNote/CheckCreditNoteStatusUseCase';
import type { CreditNoteStats } from '../../useCases/admin/creditNote/GetCreditNoteStatsUseCase';
import type { UpdateCreditNoteRequest, UpdateCreditNoteResponse } from '../../useCases/admin/creditNote/UpdateCreditNoteUseCase';
import type { SriCreditNoteRequest, SriCreditNoteResponse } from '../../useCases/admin/creditNote/CreateCreditNoteUseCase';

export interface CreditNoteRepository {
  getAllCreditNotes(filters?: CreditNoteFilters): Promise<PaginatedApiResponse<AdminCreditNote>>;
  getCreditNoteById(id: number): Promise<CreditNoteDetail>;
  createCreditNote(creditNoteData: SriCreditNoteRequest): Promise<SriCreditNoteResponse>;
  retryCreditNote(creditNoteId: number): Promise<RetryCreditNoteResponse>;
  checkCreditNoteStatus(creditNoteId: number): Promise<CreditNoteStatusCheck>;
  getCreditNoteStats(): Promise<CreditNoteStats>;
  updateCreditNote(creditNoteId: number, updateData: UpdateCreditNoteRequest): Promise<UpdateCreditNoteResponse>;
  downloadCreditNotePdf(creditNoteId: number): Promise<Blob>;
}