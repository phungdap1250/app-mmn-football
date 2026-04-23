"use client";

import { BalanceHero } from "@/components/dashboard/balance-hero";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TransactionRow } from "@/components/dashboard/transaction-row";
import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="page-in px-4 py-10 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page-in px-4 py-10 text-center text-sm text-red-500">
        Không thể tải dữ liệu. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="page-in">
      <BalanceHero balance={data.currentBalance} clubName={data.fundName} />
      <SummaryCards totalIncome={data.summary.totalIncome} totalExpense={data.summary.totalExpense} recentTransactions={data.recentTransactions} />

      <div className="px-4 mt-5">
        <h2 className="text-[13px] font-bold text-slate-700">Giao dịch gần đây</h2>
      </div>

      <div className="px-4 mt-3 pb-6 space-y-2">
        {data.recentTransactions.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6">Chưa có giao dịch nào</p>
        ) : (
          data.recentTransactions.map(tx => (
            <TransactionRow key={tx.id} tx={tx} />
          ))
        )}
      </div>
    </div>
  );
}
