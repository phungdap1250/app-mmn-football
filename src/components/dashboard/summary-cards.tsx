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
      {/* Row: Thu + Chi side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Income card */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-income-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-income-bg flex items-center justify-center shrink-0">
            <ArrowDownIcon className="w-4 h-4 text-income" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400">Tổng thu</p>
            <p className="text-[15px] font-bold text-slate-800 truncate">{formatVND(totalIncome)}</p>
          </div>
        </div>

        {/* Expense card */}
        <div className="bg-white rounded-2xl p-4 shadow-md border border-expense-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-expense-bg flex items-center justify-center shrink-0">
            <ArrowUpIcon className="w-4 h-4 text-expense" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400">Tổng chi</p>
            <p className="text-[15px] font-bold text-slate-800 truncate">{formatVND(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Expense breakdown — full width card bên dưới */}
      {expenseItems.length > 0 && (
        <div className="bg-white rounded-2xl px-4 py-3.5 shadow-md border border-expense-border">
          <p className="text-[11px] font-bold text-slate-400 mb-2.5 uppercase tracking-wide">Chi tiết khoản chi</p>
          <div className="space-y-2">
            {expenseItems.map(tx => (
              <div key={tx.id} className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-slate-600 truncate flex-1">{tx.label}</p>
                <p className="text-[13px] font-bold text-expense shrink-0">-{formatVND(tx.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
