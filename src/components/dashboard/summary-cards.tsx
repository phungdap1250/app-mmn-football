import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { formatVND } from "@/lib/format";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
}

export function SummaryCards({ totalIncome, totalExpense }: SummaryCardsProps) {
  return (
    <div className="px-4 -mt-8 relative z-10 grid grid-cols-2 gap-3">
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
      </div>
    </div>
  );
}
