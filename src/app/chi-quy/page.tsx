"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusIcon, ArrowUpIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/shared/page-header";
import { useTransactions, useDeleteTransaction } from "@/hooks/use-transactions";
import { formatVND } from "@/lib/format";
import { useState } from "react";
import type { Transaction } from "@/types";

// Badge màu cho tag kết quả trận
const MATCH_BADGE: Record<string, string> = {
  "Thắng": "bg-green-100 text-green-700",
  "Hoà":   "bg-yellow-100 text-yellow-700",
  "Thua":  "bg-red-100 text-red-600",
};

export default function ChiQuyPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useTransactions({ type: "expense", limit: 100 });
  const deleteTransaction = useDeleteTransaction();
  const expenses = data?.data ?? [];

  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTransaction.mutateAsync({
        id: deleteTarget.id,
        expectedUpdatedAt: deleteTarget.updatedAt,
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <PageHeader title="Chi quỹ" subtitle="Lịch sử khoản chi" />

      <div className="px-4 pb-24 page-in">
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-expense border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {isError && (
          <p className="text-center text-sm text-red-500 py-8">Không thể tải dữ liệu. Vui lòng thử lại.</p>
        )}

        {!isLoading && !isError && expenses.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
            <ArrowUpIcon className="w-12 h-12 opacity-20" />
            <p className="text-sm">Chưa có khoản chi nào</p>
          </div>
        )}

        {!isLoading && expenses.length > 0 && (
          <div className="space-y-2 mt-2">
            {expenses.map((tx: Transaction) => {
              const label = tx.category === "Khác"
                ? (tx.categoryCustom ?? "Khác")
                : (tx.category ?? "Chi phí");

              const date = new Date(tx.date + "T00:00:00").toLocaleDateString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric",
              });

              const matchBadge = tx.matchResult && tx.matchResult !== "Không liên quan đến trận"
                ? { text: tx.matchResult, cls: MATCH_BADGE[tx.matchResult] ?? "bg-slate-100 text-slate-500" }
                : null;

              return (
                <div key={tx.id} className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-slate-100 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-expense-bg flex items-center justify-center shrink-0">
                    <ArrowUpIcon className="w-4 h-4 text-expense" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{label}</p>
                      {matchBadge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${matchBadge.cls}`}>
                          {matchBadge.text}
                        </span>
                      )}
                    </div>
                    {tx.note && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{tx.note}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0 mr-2">
                    <p className="text-[13px] font-bold text-expense">-{formatVND(tx.amount)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{date}</p>
                  </div>

                  {/* Sửa / Xoá */}
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => router.push(`/chi-quy/${tx.id}/sua`)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <PencilIcon className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(tx)}
                      className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB — căn theo container max-w-sm, không phải viewport */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm pointer-events-none z-20">
        <div className="flex justify-center pb-2">
          <Link
            href="/chi-quy/moi"
            className="bg-expense rounded-full shadow-lg flex items-center gap-2 px-5 py-3 hover:bg-expense/90 transition-colors cursor-pointer pointer-events-auto"
          >
            <PlusIcon className="w-5 h-5 text-white shrink-0" />
            <span className="text-white text-[13px] font-bold">Thêm khoản chi</span>
          </Link>
        </div>
      </div>

      {/* Delete confirm sheet */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-sm p-6 pb-10 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
            <h3 className="text-[15px] font-bold text-slate-800 text-center">Xoá khoản chi?</h3>
            <p className="text-[13px] text-slate-500 text-center leading-relaxed">
              Bạn có chắc muốn xoá khoản Chi{" "}
              <strong className="text-slate-800">{formatVND(deleteTarget.amount)}</strong>{" "}
              ngày{" "}
              <strong className="text-slate-800">
                {new Date(deleteTarget.date + "T00:00:00").toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
              </strong>{" "}
              không?
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-[13px] font-semibold text-slate-600 cursor-pointer">Huỷ</button>
              <button
                onClick={handleDelete}
                disabled={deleteTransaction.isPending}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[13px] font-bold hover:bg-red-600 disabled:opacity-60 cursor-pointer"
              >
                {deleteTransaction.isPending ? "Đang xoá..." : "Xoá"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
