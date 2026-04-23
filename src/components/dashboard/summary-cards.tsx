import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { formatVND } from "@/lib/format";
import type { RecentTransaction } from "@/types";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  recentTransactions?: RecentTransaction[];
}

export function SummaryCards({ totalIncome, totalExpense, recentTransactions = [] }: SummaryCardsProps) {
  const expenseItems = recentTransactions.filter(t => t.type === 'expense');

  return (
    <div className="px-4 -mt-8 relative z-10 flex flex-col gap-3">
      {/* Tổng thu — full width */}
      <div className="bg-white rounded-2xl px-4 py-3.5 shadow-md border border-income-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-income-bg flex items-center justify-center shrink-0">
          <ArrowDownIcon className="w-4 h-4 text-income" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-400">Tổng thu</p>
          <p className="text-[16px] font-bold text-slate-800">{formatVND(totalIncome)}</p>
        </div>
      </div>

      {/* Tổng chi — full width + chi tiết bên trong */}
      <div className="bg-white rounded-2xl px-4 py-3.5 shadow-md border border-expense-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-expense-bg flex items-center justify-center shrink-0">
            <ArrowUpIcon className="w-4 h-4 text-expense" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-slate-400">Tổng chi</p>
            <p className="text-[16px] font-bold text-slate-800">{formatVND(totalExpense)}</p>
          </div>
        </div>

        {/* Chi tiết khoản chi */}
        {expenseItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            {expenseItems.map(tx => (
              <div key={tx.id} className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-slate-500 truncate flex-1">{tx.label}</p>
                <p className="text-[13px] font-bold text-expense shrink-0">-{formatVND(tx.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
