'use client'

import { useState, useMemo } from 'react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { PageHeader } from '@/components/shared/page-header'
import { useIncomeByDotThu, useDotThuList } from '@/hooks/use-transactions'
import { useMembers } from '@/hooks/use-members'
import { formatVND } from '@/lib/format'

export default function KiemTraDotPage() {
  const { data: dotThuList = [], isLoading: loadingList } = useDotThuList()
  const [selected, setSelected] = useState<string>('')

  // Tự động chọn đợt mới nhất khi danh sách load xong
  const activeDot = selected || dotThuList[0] || ''

  const { data: transactions = [], isLoading: loadingTx } = useIncomeByDotThu(activeDot)
  const { data: members = [], isLoading: loadingMembers } = useMembers()

  const isLoading = loadingList || loadingTx || loadingMembers

  const { paid, unpaid } = useMemo(() => {
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

  return (
    <>
      <PageHeader
        title="Kiểm tra đợt thu"
        subtitle="Xem ai đã nộp theo đợt"
        backHref="/thu-quy"
      />

      <div className="px-4 pb-24 page-in space-y-4 mt-4">

        {/* Chọn đợt thu */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">Chọn đợt thu</p>

          {loadingList ? (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : dotThuList.length === 0 ? (
            <p className="text-[13px] text-slate-400 text-center py-2">
              Chưa có đợt thu nào. Hãy ghi khoản thu và điền tên đợt.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dotThuList.map(dot => (
                <button
                  key={dot}
                  onClick={() => setSelected(dot)}
                  className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors cursor-pointer ${
                    activeDot === dot
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {dot}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && activeDot && (
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
                Chưa có ai nộp trong {activeDot}
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}
