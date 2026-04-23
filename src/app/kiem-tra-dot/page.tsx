'use client'

import { useState, useEffect, useMemo } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { PageHeader } from '@/components/shared/page-header'
import { useIncomeByDateRange } from '@/hooks/use-transactions'
import { useMembers } from '@/hooks/use-members'
import { formatVND } from '@/lib/format'

const STORAGE_KEY = 'kiem-tra-dot-range'

/** Trả về ngày đầu tuần (Thứ 2) và hôm nay dạng YYYY-MM-DD */
function defaultRange(): { from: string; to: string } {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=CN, 1=T2...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  return { from: fmt(monday), to: fmt(today) }
}

export default function KiemTraDotPage() {
  const def = defaultRange()
  const [from, setFrom] = useState<string>(def.from)
  const [to, setTo] = useState<string>(def.to)

  // Đọc range từ localStorage sau mount, tránh hydration mismatch
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (saved?.from) setFrom(saved.from)
    if (saved?.to) setTo(saved.to)
  }, [])

  // Lưu range vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ from, to }))
  }, [from, to])

  const { data: transactions = [], isLoading: loadingTx } = useIncomeByDateRange(from, to)
  const { data: members = [], isLoading: loadingMembers } = useMembers()

  const isLoading = loadingTx || loadingMembers

  // Tính ai đã nộp / chưa nộp dựa trên member_id trong khoảng ngày
  const { paid, unpaid } = useMemo(() => {
    // Map member_id → tổng giao dịch trong đợt
    const paidMap = new Map<string, { total: number; count: number }>()
    for (const tx of transactions) {
      if (!tx.memberId) continue
      const cur = paidMap.get(tx.memberId) ?? { total: 0, count: 0 }
      paidMap.set(tx.memberId, { total: cur.total + tx.amount, count: cur.count + 1 })
    }

    const paid: { id: string; name: string; total: number; count: number }[] = []
    const unpaid: { id: string; name: string }[] = []

    for (const m of members) {
      const info = paidMap.get(m.id)
      if (info) {
        paid.push({ id: m.id, name: m.name, ...info })
      } else {
        unpaid.push({ id: m.id, name: m.name })
      }
    }

    return { paid, unpaid }
  }, [transactions, members])

  const total = members.length
  const fmtDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

  return (
    <>
      <PageHeader
        title="Kiểm tra đợt thu"
        subtitle="Xem ai đã nộp trong khoảng ngày"
        backHref="/thu-quy"
      />

      <div className="px-4 pb-24 page-in space-y-4 mt-4">

        {/* Chọn khoảng ngày */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Khoảng thời gian</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 mb-1 block">Từ ngày</label>
              <input
                type="date"
                value={from}
                max={to}
                onChange={e => setFrom(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex-1">
              <label className="text-[11px] text-slate-400 mb-1 block">Đến ngày</label>
              <input
                type="date"
                value={to}
                min={from}
                onChange={e => setTo(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] text-slate-700 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Tóm tắt */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <p className="text-2xl font-bold text-green-600">{paid.length}</p>
                <p className="text-[11px] text-green-500 mt-0.5">Đã nộp</p>
              </div>
              <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                <p className="text-2xl font-bold text-red-500">{unpaid.length}</p>
                <p className="text-[11px] text-red-400 mt-0.5">Chưa nộp</p>
              </div>
            </div>

            {total === 0 && (
              <p className="text-center text-sm text-slate-400 py-6">Chưa có thành viên nào.</p>
            )}

            {/* Đã nộp */}
            {paid.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-1">
                  ✅ Đã nộp ({paid.length}/{total})
                </p>
                {paid.map(m => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-slate-100 shadow-sm"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{m.name}</p>
                      {m.count > 1 && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{m.count} lần nộp</p>
                      )}
                    </div>
                    <p className="text-[13px] font-bold text-green-600 shrink-0">
                      +{formatVND(m.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Chưa nộp */}
            {unpaid.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide px-1">
                  ❌ Chưa nộp ({unpaid.length}/{total})
                </p>
                {unpaid.map(m => (
                  <div
                    key={m.id}
                    className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-slate-100 shadow-sm"
                  >
                    <XCircleIcon className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="flex-1 text-[13px] font-semibold text-slate-500 truncate">
                      {m.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {paid.length === 0 && unpaid.length === 0 && total > 0 && (
              <p className="text-center text-sm text-slate-400 py-6">
                Không có ai nộp trong {fmtDate(from)} – {fmtDate(to)}
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}
