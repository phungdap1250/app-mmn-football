export type TransactionType = 'income' | 'expense'

export type ExpenseCategory =
  | 'Tiền sân'
  | 'Tiền nước'
  | 'Trọng tài'
  | 'Liên hoan'
  | 'Khác'

export type MatchResult =
  | 'Thắng'
  | 'Hoà'
  | 'Thua'
  | 'Không liên quan đến trận'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  date: string           // 'YYYY-MM-DD'
  note: string | null
  // Income
  memberId: string | null
  memberNameSnapshot: string | null
  dotThu: string | null  // Đợt thu, VD: "Đợt 4/2026"
  // Expense
  category: ExpenseCategory | null
  categoryCustom: string | null
  matchResult: MatchResult | null
  // Idempotency & concurrency
  idempotencyKey: string | null
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  name: string
  phone: string | null
  jerseyNumber: string | null
  createdAt: string
  updatedAt: string
}

export interface FundSettings {
  id: string
  fundName: string
  openingBalance: number
  bankName: string | null
  bankAccount: string | null
  bankOwner: string | null
  publicToken: string
  publicUrl: string
}

export interface RecentTransaction {
  id: string
  type: TransactionType
  amount: number
  date: string
  label: string   // Tên thành viên (income) hoặc hạng mục (expense)
  note: string | null
}

export interface DashboardData {
  fundName: string
  currentBalance: number
  isNegative: boolean
  summary: {
    totalIncome: number
    totalExpense: number
  }
  recentTransactions: RecentTransaction[]
}

// API input types
export interface CreateTransactionInput {
  type: TransactionType
  amount: number
  date: string
  note?: string
  idempotencyKey: string
  // income
  memberId?: string
  dotThu?: string
  // expense
  category?: ExpenseCategory
  categoryCustom?: string
  matchResult?: MatchResult
}

export interface UpdateTransactionInput extends Omit<CreateTransactionInput, 'idempotencyKey'> {
  expectedUpdatedAt: string
}

export interface CreateMemberInput {
  name: string
  phone?: string
  jerseyNumber?: string
}
