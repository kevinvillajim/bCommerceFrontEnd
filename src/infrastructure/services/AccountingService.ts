import ApiClient from '../api/apiClient';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import type {
  AccountingTransaction,
  AccountingAccount,
  AccountingEntryCreationData,
} from '../../core/domain/entities/Accounting';

export interface AccountingMetrics {
  period: {
    start_date: string;
    end_date: string;
  };
  sales: {
    total: number;
    orders_count: number;
    average_order: number;
  };
  expenses: {
    total: number;
  };
  profit: {
    gross: number;
    margin_percentage: number;
  };
  vat: {
    payable: number;
  };
  cash: {
    balance: number;
  };
  pending: {
    transactions_count: number;
  };
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  type?: string;
  is_posted?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface TransactionCreationData {
  reference_number: string;
  transaction_date: string;
  description: string;
  type: string;
  entries: AccountingEntryCreationData[];
}

export interface AccountCreationData {
  code: string;
  name: string;
  type: 'Activo' | 'Pasivo' | 'Patrimonio' | 'Ingreso' | 'Gasto' | 'Costo';
  description?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export class AccountingService {
  // ✅ CORREGIDO: No necesita constructor ni httpClient, usa ApiClient estático

  // ===== MÉTRICAS Y DASHBOARD =====

  /**
   * ✅ CORREGIDO: Obtiene métricas financieras para el dashboard usando ApiClient
   */
  static async getMetrics(startDate?: string, endDate?: string): Promise<AccountingMetrics> {
    const params: Record<string, string> = {};

    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    // ✅ Usar endpoint de constantes
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.METRICS;

    const response = await ApiClient.get<{ success: boolean; data: AccountingMetrics }>(url, params);

    if (!response.success) {
      throw new Error('Error al obtener métricas contables');
    }

    return response.data;
  }

  // ===== TRANSACCIONES =====

  /**
   * ✅ CORREGIDO: Obtiene lista de transacciones con filtros y paginación usando ApiClient
   */
  static async getTransactions(filters: TransactionFilters = {}): Promise<PaginatedResponse<AccountingTransaction>> {
    const params = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>);

    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.TRANSACTIONS;

    const response = await ApiClient.get<{ success: boolean; data: PaginatedResponse<AccountingTransaction> }>(url, params);

    if (!response.success) {
      throw new Error('Error al obtener transacciones');
    }

    return response.data;
  }

  /**
   * ✅ CORREGIDO: Obtiene una transacción específica por ID usando ApiClient
   */
  static async getTransaction(id: number): Promise<AccountingTransaction> {
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.TRANSACTION_DETAIL(id);

    const response = await ApiClient.get<{ success: boolean; data: AccountingTransaction }>(url);

    if (!response.success) {
      throw new Error('Error al obtener la transacción');
    }

    return response.data;
  }

  /**
   * ✅ CORREGIDO: Crea una nueva transacción contable usando ApiClient
   */
  static async createTransaction(transactionData: TransactionCreationData): Promise<AccountingTransaction> {
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.TRANSACTIONS;

    const response = await ApiClient.post<{
      success: boolean;
      data: AccountingTransaction;
      message: string;
    }>(url, transactionData);

    if (!response.success) {
      throw new Error(response.message || 'Error al crear la transacción');
    }

    return response.data;
  }

  /**
   * ✅ CORREGIDO: Contabiliza una transacción (marca como posted) usando ApiClient
   */
  static async postTransaction(id: number): Promise<void> {
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.POST_TRANSACTION(id);

    const response = await ApiClient.patch<{ success: boolean; message: string }>(url);

    if (!response.success) {
      throw new Error(response.message || 'Error al contabilizar la transacción');
    }
  }

  /**
   * ✅ NUEVO: Elimina una transacción contable usando ApiClient
   */
  static async deleteTransaction(id: number): Promise<void> {
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.TRANSACTION_DETAIL(id);

    const response = await ApiClient.delete<{ success: boolean; message: string }>(url);

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar la transacción');
    }
  }

  /**
   * ✅ NUEVO: Actualiza una transacción contable existente usando ApiClient
   */
  static async updateTransaction(id: number, transactionData: any): Promise<AccountingTransaction> {
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.TRANSACTION_DETAIL(id);

    const response = await ApiClient.put<{ success: boolean; data: AccountingTransaction; message: string }>(url, transactionData);

    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar la transacción');
    }

    return response.data;
  }

  // ===== CUENTAS CONTABLES =====

  /**
   * ✅ CORREGIDO: Obtiene lista de cuentas contables usando ApiClient
   */
  static async getAccounts(activeOnly: boolean = true): Promise<AccountingAccount[]> {
    const params = { active_only: String(activeOnly) };
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.ACCOUNTS;

    const response = await ApiClient.get<{ success: boolean; data: AccountingAccount[] }>(url, params);

    if (!response.success) {
      throw new Error('Error al obtener cuentas contables');
    }

    return response.data;
  }

  /**
   * ✅ CORREGIDO: Crea una nueva cuenta contable usando ApiClient
   */
  static async createAccount(accountData: AccountCreationData): Promise<AccountingAccount> {
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.ACCOUNTS;

    const response = await ApiClient.post<{
      success: boolean;
      data: AccountingAccount;
      message: string;
    }>(url, accountData);

    if (!response.success) {
      throw new Error(response.message || 'Error al crear la cuenta');
    }

    return response.data;
  }

  /**
   * ✅ CORREGIDO: Actualiza una cuenta contable usando ApiClient
   */
  static async updateAccount(id: number, accountData: Partial<AccountCreationData>): Promise<AccountingAccount> {
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.ACCOUNT_DETAIL(id);

    const response = await ApiClient.put<{
      success: boolean;
      data: AccountingAccount;
      message: string;
    }>(url, accountData);

    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar la cuenta');
    }

    return response.data;
  }

  // ===== REPORTES =====

  /**
   * ✅ CORREGIDO: Obtiene balance general usando ApiClient
   */
  static async getBalanceSheet(asOf?: string): Promise<any> {
    const params: Record<string, string> = {};
    if (asOf) params.as_of = asOf;

    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.BALANCE_SHEET;

    const response = await ApiClient.get<{ success: boolean; data: any }>(url, params);

    if (!response.success) {
      throw new Error('Error al obtener balance general');
    }

    return response.data;
  }

  /**
   * ✅ CORREGIDO: Obtiene estado de resultados usando ApiClient
   */
  static async getIncomeStatement(startDate: string, endDate: string): Promise<any> {
    const params = { start_date: startDate, end_date: endDate };
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.INCOME_STATEMENT;

    const response = await ApiClient.get<{ success: boolean; data: any }>(url, params);

    if (!response.success) {
      throw new Error('Error al obtener estado de resultados');
    }

    return response.data;
  }

  /**
   * ✅ CORREGIDO: Obtiene libro mayor de una cuenta usando ApiClient
   */
  static async getAccountLedger(accountId: number, startDate: string, endDate: string): Promise<any> {
    const params = { start_date: startDate, end_date: endDate };
    const url = API_ENDPOINTS.ADMIN.ACCOUNTING.ACCOUNT_LEDGER(accountId);

    const response = await ApiClient.get<{ success: boolean; data: any }>(url, params);

    if (!response.success) {
      throw new Error('Error al obtener libro mayor');
    }

    return response.data;
  }

  // ===== UTILIDADES =====

  /**
   * ✅ Formatea un número como moneda
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * ✅ Valida que una transacción esté balanceada
   */
  static validateTransactionBalance(entries: AccountingEntryCreationData[]): {
    isBalanced: boolean;
    totalDebits: number;
    totalCredits: number;
    difference: number;
  } {
    const totalDebits = entries.reduce((sum, entry) => sum + (entry.debit_amount || 0), 0);
    const totalCredits = entries.reduce((sum, entry) => sum + (entry.credit_amount || 0), 0);
    const difference = totalDebits - totalCredits;

    return {
      isBalanced: Math.abs(difference) < 0.01,
      totalDebits,
      totalCredits,
      difference
    };
  }

  /**
   * ✅ Genera número de referencia automático
   */
  static generateReferenceNumber(type: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const prefix = type.toUpperCase().slice(0, 3);
    return `${prefix}-${timestamp}`;
  }
}

export default AccountingService;