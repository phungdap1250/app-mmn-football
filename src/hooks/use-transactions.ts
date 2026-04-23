/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import type { Transaction, CreateTransactionInput, UpdateTransactionInput } from '@/types'

interface TransactionListParams {
  type?: 'income' | 'expense'
  month?: number
  year?: number
  page?: number
  limit?: number
  from?: string  // YYYY-MM-DD
  to?: string    // YYYY-MM-DD
}

function buildUrl(params: TransactionListParams) {
  const sp = new URLSearchParams()
  if (params.type)  sp.set('type', params.type)
  if (params.month) sp.set('month', String(params.month))
  if (params.year)  sp.set('year', String(params.year))
  if (params.page)  sp.set('page', String(params.page))
  if (params.limit) sp.set('limit', String(params.limit))
  if (params.from)  sp.set('from', params.from)
  if (params.to)    sp.set('to', params.to)
  return `/api/transactions?${sp}`
}

/** Lấy tất cả khoản thu trong khoảng ngày — dùng cho trang kiểm tra đợt thu */
export function useIncomeByDateRange(from: string, to: string) {
  return useQuery({
    queryKey: ['transactions', 'range', from, to],
    queryFn: async () => {
      const res = await fetch(buildUrl({ type: 'income', from, to, limit: 500 }))
      if (!res.ok) throw new Error('Không thể tải dữ liệu')
      const json = await res.json()
      return (json.data as any[]).map(normalise) as Transaction[]
    },
    enabled: !!from && !!to,
  })
}

function normalise(t: any): Transaction {
  return {
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date,
    note: t.note,
    memberId: t.member_id,
    memberNameSnapshot: t.member_name_snapshot,
    category: t.category,
    categoryCustom: t.category_custom,
    matchResult: t.match_result,
    idempotencyKey: t.idempotency_key,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
  }
}

/** Lấy 1 giao dịch theo id — dùng cho trang sửa */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${id}`)
      if (!res.ok) throw new Error('Không tìm thấy giao dịch')
      const t = await res.json()
      return normalise(t)
    },
    enabled: !!id,
  })
}

export function useTransactions(params: TransactionListParams = {}) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: async () => {
      const res = await fetch(buildUrl(params))
      if (!res.ok) throw new Error('Không thể tải danh sách giao dịch')
      const json = await res.json()
      return { ...json, data: json.data.map(normalise) }
    },
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Lỗi khi lưu giao dịch')
      }
      return res.json()
    },
    onMutate: async (newTx) => {
      // Optimistic update: cộng/trừ balance tạm trong cache
      await queryClient.cancelQueries({ queryKey: ['dashboard'] })
      const snapshot = queryClient.getQueryData(['dashboard'])
      queryClient.setQueryData(['dashboard'], (old: any) => {
        if (!old) return old
        const delta = newTx.type === 'income' ? newTx.amount : -newTx.amount
        return { ...old, currentBalance: old.currentBalance + delta }
      })
      return { snapshot }
    },
    onError: (_err, _vars, context: any) => {
      // Rollback
      if (context?.snapshot) queryClient.setQueryData(['dashboard'], context.snapshot)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateTransactionInput & { id: string }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Lỗi khi cập nhật giao dịch')
      }
      return res.json()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, expectedUpdatedAt }: { id: string; expectedUpdatedAt?: string }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedUpdatedAt }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Lỗi khi xoá giao dịch')
      }
      return res.json()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
