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
    <div className="px-4 -mt-8 relative z-10 grid grid-cols-2 gap-3 items-start">
      {/* Income card */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-income-border">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-income-bg flex items-center justify-center shrink-0">
            <ArrowDownIcon className="w-3.5 h-3.5 text-income" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Tổng thu</span>
        </div>
        <p className="text-[15px] font-bold text-slate-800">{formatVND(totalIncome)}</p>
      </div>

      {/* Expense card */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-expense-border">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-7 h-7 rounded-full bg-expense-bg flex items-center justify-center shrink-0">
            <ArrowUpIcon className="w-3.5 h-3.5 text-expense" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Tổng chi</span>
        </div>
        <p className="text-[15px] font-bold text-slate-800">{formatVND(totalExpense)}</p>

        {/* Breakdown từng khoản chi */}
        {expenseItems.length > 0 && (
          <div className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2.5">
            {expenseItems.map(tx => (
              <div key={tx.id}>
                <p className="text-[11px] font-bold text-expense">-{formatVND(tx.amount)}</p>
                <p className="text-[10px] text-slate-400 truncate">{tx.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
