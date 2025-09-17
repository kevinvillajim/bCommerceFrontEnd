import type { PaginatedApiResponse } from '../entities/ApiResponse';
import type { InvoiceFilters, AdminInvoice } from '../../useCases/admin/invoice/GetAllInvoicesUseCase';
import type { InvoiceDetail } from '../../useCases/admin/invoice/GetInvoiceByIdUseCase';
import type { RetryInvoiceResponse } from '../../useCases/admin/invoice/RetryInvoiceUseCase';
import type { InvoiceStatusCheck } from '../../useCases/admin/invoice/CheckInvoiceStatusUseCase';
import type { InvoiceStats } from '../../useCases/admin/invoice/GetInvoiceStatsUseCase';
import type { UpdateInvoiceRequest, UpdateInvoiceResponse } from '../../useCases/admin/invoice/UpdateInvoiceUseCase';

export interface InvoiceRepository {
  getAllInvoices(filters?: InvoiceFilters): Promise<PaginatedApiResponse<AdminInvoice>>;
  getInvoiceById(id: number): Promise<InvoiceDetail>;
  retryInvoice(invoiceId: number): Promise<RetryInvoiceResponse>;
  checkInvoiceStatus(invoiceId: number): Promise<InvoiceStatusCheck>;
  getInvoiceStats(): Promise<InvoiceStats>;
  updateInvoice(invoiceId: number, updateData: UpdateInvoiceRequest): Promise<UpdateInvoiceResponse>;
  downloadInvoicePdf(invoiceId: number): Promise<Blob>;
}