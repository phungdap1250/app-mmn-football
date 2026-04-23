"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BanknotesIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { FormField, inputClass } from "@/components/shared/form-field";
import { formatVND, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMembers } from "@/hooks/use-members";
import { useCreateTransaction, useUpdateTransaction, useDotThuList } from "@/hooks/use-transactions";

/** Tạo tên đợt mặc định theo tháng hiện tại, VD: "Đợt 4/2026" */
function defaultDotThu(): string {
  const now = new Date()
  return `Đợt ${now.getMonth() + 1}/${now.getFullYear()}`
}
import type { Transaction } from "@/types";

interface IncomeFormProps {
  /** Truyền vào khi đang sửa giao dịch đã có */
  editTx?: Transaction;
}

export function IncomeForm({ editTx }: IncomeFormProps) {
  const router = useRouter();
  const isEdit = !!editTx;

  // isFetching bao gồm cả background refetch (stale-while-revalidate)
  // → dropdown luôn disabled cho đến khi có data mới nhất
  const { data: members = [], isFetching: membersLoading } = useMembers();
  const { data: dotThuList = [] } = useDotThuList();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  const [memberId, setMemberId] = useState(editTx?.memberId ?? "");
  const [amount,   setAmount]   = useState(editTx ? String(editTx.amount) : "");
  const [date,     setDate]     = useState(editTx?.date ?? todayISO());
  const [note,     setNote]     = useState(editTx?.note ?? "");
  const [dotThu,   setDotThu]   = useState(editTx?.dotThu ?? defaultDotThu());
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const amountNum = parseInt(amount, 10) || 0;
  const isPending = createTx.isPending || updateTx.isPending;

  const handleSave = async () => {
    const e: Record<string, string> = {};
    if (!memberId)               e.member = "Vui lòng chọn người nộp";
    if (!amount || amountNum <= 0) e.amount = "Số tiền phải lớn hơn 0";
    if (Object.keys(e).length) { setErrors(e); return; }
    try {
      if (isEdit) {
        await updateTx.mutateAsync({
          id: editTx!.id,
          type: "income",
          amount: amountNum,
          date,
          note: note.trim() || undefined,
          memberId,
          expectedUpdatedAt: editTx!.updatedAt,
        });
      } else {
        await createTx.mutateAsync({
          type: "income",
          amount: amountNum,
          date,
          note: note.trim() || undefined,
          memberId,
          dotThu: dotThu.trim() || undefined,
          idempotencyKey: crypto.randomUUID(),
        });
      }
      router.push("/thu-quy");
    } catch (err) {
      setErrors({ form: (err as Error).message ?? "Lỗi khi lưu, vui lòng thử lại" });
    }
  };

  return (
    <div className="px-4 py-5 space-y-5 page-in">

      {errors.form && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">{errors.form}</div>
      )}

      <div className="bg-income-bg border border-income-border rounded-2xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-500">Loại giao dịch</p>
          <p className="text-[15px] font-bold text-income">Khoản Thu</p>
        </div>
        <BanknotesIcon className="w-9 h-9 text-income/20" />
      </div>

      {/* Member selector */}
      <FormField label="Người nộp" required error={errors.member}>
        <div className="relative">
          <select
            value={memberId}
            onChange={e => { setMemberId(e.target.value); setErrors(p => ({ ...p, member: "" })); }}
            disabled={membersLoading}
            className={cn(inputClass, "appearance-none pr-10 cursor-pointer", errors.member && "border-red-400")}
          >
            <option value="">{membersLoading ? "Đang tải..." : "-- Chọn thành viên --"}</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}{m.jerseyNumber ? ` · #${m.jerseyNumber}` : ""}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </FormField>

      {/* Amount */}
      <FormField label="Số tiền (VNĐ)" required error={errors.amount}>
        <div className="relative">
          <input
            type="number" inputMode="numeric" min={1} placeholder="0"
            value={amount}
            onChange={e => { setAmount(e.target.value); setErrors(p => ({ ...p, amount: "" })); }}
            className={cn(inputClass, "pr-8", errors.amount && "border-red-400")}
          />
          <span className="absolute inset-y-0 right-4 flex items-center text-[13px] font-semibold text-slate-400 pointer-events-none">đ</span>
        </div>
        {/* Gợi ý nhanh */}
        <div className="flex gap-2 mt-2">
          {[300000, 150000].map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => { setAmount(String(preset)); setErrors(p => ({ ...p, amount: "" })); }}
              className={cn(
                "flex-1 py-2 rounded-xl border text-[12px] font-semibold transition-colors cursor-pointer",
                amountNum === preset
                  ? "bg-primary text-white border-primary"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
              )}
            >
              {formatVND(preset)}
            </button>
          ))}
        </div>
        {amountNum > 0 && amountNum !== 300000 && amountNum !== 150000 && (
          <p className="text-[11px] text-primary font-medium mt-1">
            <CheckCircleIcon className="inline w-3.5 h-3.5 mr-0.5 -mt-0.5" />
            {formatVND(amountNum)}
          </p>
        )}
      </FormField>

      {/* Date */}
      <FormField label="Ngày nộp" required hint="Không thể chọn ngày trong tương lai">
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={e => setDate(e.target.value)}
          className={cn(inputClass, "cursor-pointer appearance-none")}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      </FormField>

      {/* Đợt thu */}
      <FormField label="Đợt thu" required>
        <input
          type="text"
          list="dot-thu-suggestions"
          value={dotThu}
          onChange={e => setDotThu(e.target.value)}
          placeholder="VD: Đợt 4/2026"
          className={cn(inputClass)}
        />
        <datalist id="dot-thu-suggestions">
          {dotThuList.map(d => <option key={d} value={d} />)}
        </datalist>
        <p className="text-[11px] text-slate-400 mt-1">Nhập tên đợt thu để gắn vào giao dịch này</p>
      </FormField>

      {/* Note */}
      <FormField label="Lý do" optional>
        <div className="relative">
          <textarea placeholder="VD: Đóng quỹ tháng 4..." maxLength={200} rows={3} value={note} onChange={e => setNote(e.target.value)} className={cn(inputClass, "resize-none")} />
          <span className="absolute bottom-3 right-3.5 text-[10px] text-slate-300">{note.length}/200</span>
        </div>
      </FormField>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={() => router.push("/thu-quy")} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            "flex-1 py-4 rounded-2xl text-[13px] font-bold transition-colors duration-150",
            !isPending ? "bg-primary text-white hover:bg-primary-dark cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu khoản thu"}
        </button>
      </div>
    </div>
  );
}
