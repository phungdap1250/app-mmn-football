import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { formatVND } from "@/lib/format";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  label: string;
  note?: string | null;
  amount: number;
  date: string;
}

interface TransactionRowProps {
  tx: Transaction;
}

export function TransactionRow({ tx }: TransactionRowProps) {
  const isIncome = tx.type === "income";

  return (
    <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer">
      {/* Icon */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isIncome ? "bg-income-bg" : "bg-expense-bg"}`}>
        {isIncome
          ? <ArrowDownIcon className="w-4 h-4 text-income" />
          : <ArrowUpIcon   className="w-4 h-4 text-expense" />
        }
      </div>

      {/* Label + note */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 truncate">{tx.label}</p>
        {tx.note && (
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">{tx.note}</p>
        )}
      </div>

      {/* Amount + date */}
      <div className="text-right shrink-0">
        <p className={`text-[13px] font-bold ${isIncome ? "text-income" : "text-expense"}`}>
          {isIncome ? "+" : "-"}{formatVND(tx.amount)}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {new Date(tx.date + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
        </p>
      </div>
    </div>
  );
}
