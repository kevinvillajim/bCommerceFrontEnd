/**
 * Accounting Transaction entity
 */
export interface AccountingTransaction {
  id?: number;
  referenceNumber: string;
  transactionDate: string;
  description: string;
  type: string;
  userId?: number;
  orderId?: number;
  isPosted: boolean;
  entries: AccountingEntry[];
  // Propiedades calculadas
  balance?: number;
  isBalanced?: boolean;
}

/**
 * Accounting Entry entity
 */
export interface AccountingEntry {
  id?: number;
  transactionId?: number;
  accountId: number;
  debitAmount: number;
  creditAmount: number;
  notes?: string;
  // Campos relacionados
  account?: AccountingAccount;
}

/**
 * Accounting Account entity
 */
export interface AccountingAccount {
  id?: number;
  code: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  // Campos calculados que pueden ser útiles
  balance?: number;
}

/**
 * Transaction creation data
 */
export interface AccountingTransactionCreationData {
  referenceNumber: string;
  transactionDate: string;
  description: string;
  type: string;
  userId?: number;
  orderId?: number;
  entries: AccountingEntryCreationData[];
}

/**
 * Entry creation data
 */
export interface AccountingEntryCreationData {
  accountId: number;
  debitAmount: number;
  creditAmount: number;
  notes?: string;
}

/**
 * Account creation data
 */
export interface AccountingAccountCreationData {
  code: string;
  name: string;
  type: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Transaction list response
 */
export interface AccountingTransactionListResponse {
  data: AccountingTransaction[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Account list response
 */
export interface AccountingAccountListResponse {
  data: AccountingAccount[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

/**
 * Account ledger entry
 */
export interface AccountLedgerEntry {
  transactionId: number;
  referenceNumber: string;
  transactionDate: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
}

/**
 * Account ledger response
 */
export interface AccountLedgerResponse {
  account: AccountingAccount;
  entries: AccountLedgerEntry[];
  summary: {
    openingBalance: number;
    totalDebits: number;
    totalCredits: number;
    closingBalance: number;
  };
  meta: {
    dateFrom: string;
    dateTo: string;
  };
}

/**
 * Balance sheet item
 */
export interface BalanceSheetItem {
  accountId: number;
  code: string;
  name: string;
  balance: number;
}

/**
 * Balance sheet response
 */
export interface BalanceSheetResponse {
  asOf: string;
  assets: {
    current: BalanceSheetItem[];
    nonCurrent: BalanceSheetItem[];
    totalCurrent: number;
    totalNonCurrent: number;
    total: number;
  };
  liabilities: {
    current: BalanceSheetItem[];
    nonCurrent: BalanceSheetItem[];
    totalCurrent: number;
    totalNonCurrent: number;
    total: number;
  };
  equity: {
    items: BalanceSheetItem[];
    total: number;
  };
}

/**
 * Income statement item
 */
export interface IncomeStatementItem {
  accountId: number;
  code: string;
  name: string;
  amount: number;
}

/**
 * Income statement response
 */
export interface IncomeStatementResponse {
  period: {
    from: string;
    to: string;
  };
  revenue: {
    items: IncomeStatementItem[];
    total: number;
  };
  expenses: {
    items: IncomeStatementItem[];
    total: number;
  };
  netIncome: number;
}

/**
 * Transaction filter params
 */
export interface AccountingTransactionFilterParams {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  userId?: number;
  orderId?: number;
  isPosted?: boolean;
  referenceNumber?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Account filter params
 */
export interface AccountingAccountFilterParams {
  type?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}