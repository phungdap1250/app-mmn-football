"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MinusCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { FormField, inputClass } from "@/components/shared/form-field";
import { NegativeBalanceDialog } from "./negative-balance-dialog";
import { formatVND, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { useDashboard } from "@/hooks/use-dashboard";
import type { ExpenseCategory, MatchResult, Transaction } from "@/types";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "Tiền sân",  label: "Tiền sân" },
  { value: "Tiền nước", label: "Tiền nước" },
  { value: "Trọng tài", label: "Trọng tài" },
  { value: "Liên hoan", label: "Liên hoan" },
  { value: "Khác",      label: "Khác" },
];

const MATCH_TAGS: { value: MatchResult; label: string; active: string }[] = [
  { value: "Thắng",                    label: "Thắng",    active: "border-green-500  bg-green-50  text-green-700" },
  { value: "Hoà",                      label: "Hoà",      active: "border-yellow-400 bg-yellow-50 text-yellow-700" },
  { value: "Thua",                     label: "Thua",     active: "border-red-400    bg-red-50    text-red-600" },
  { value: "Không liên quan đến trận", label: "Không LQ", active: "border-primary    bg-primary-muted text-primary-dark" },
];

interface ExpenseFormProps {
  /** Truyền vào khi đang sửa giao dịch đã có */
  editTx?: Transaction;
}

export function ExpenseForm({ editTx }: ExpenseFormProps) {
  const router = useRouter();
  const isEdit = !!editTx;

  const { data: dashboard } = useDashboard();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  const [amount,      setAmount]      = useState(editTx ? String(editTx.amount) : "");
  const [date,        setDate]        = useState(editTx?.date ?? todayISO());
  const [category,    setCategory]    = useState<ExpenseCategory | "">(editTx?.category ?? "");
  const [customCat,   setCustomCat]   = useState(editTx?.categoryCustom ?? "");
  const [matchTag,    setMatchTag]    = useState<MatchResult>(editTx?.matchResult ?? "Không liên quan đến trận");
  const [note,        setNote]        = useState(editTx?.note ?? "");
  const [showWarning, setShowWarning] = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  const amountNum  = parseInt(amount, 10) || 0;
  const isPending  = createTx.isPending || updateTx.isPending;
  // Khi sửa: tính balance mới = balance hiện tại + số tiền cũ - số tiền mới
  const oldAmount  = isEdit ? (editTx!.amount) : 0;
  const newBalance = (dashboard?.currentBalance ?? 0) + oldAmount - amountNum;

  function validate() {
    const e: Record<string, string> = {};
    if (!amount || amountNum <= 0) e.amount = "Số tiền phải lớn hơn 0";
    if (!category)                 e.category = "Vui lòng chọn hạng mục";
    if (category === "Khác" && !customCat.trim()) e.customCat = "Vui lòng nhập tên hạng mục";
    return e;
  }

  const doSave = async () => {
    try {
      if (isEdit) {
        await updateTx.mutateAsync({
          id: editTx!.id,
          type: "expense",
          amount: amountNum,
          date,
          note: note.trim() || undefined,
          category: category as ExpenseCategory,
          categoryCustom: category === "Khác" ? customCat.trim() : undefined,
          matchResult: matchTag,
          expectedUpdatedAt: editTx!.updatedAt,
        });
      } else {
        await createTx.mutateAsync({
          type: "expense",
          amount: amountNum,
          date,
          note: note.trim() || undefined,
          category: category as ExpenseCategory,
          categoryCustom: category === "Khác" ? customCat.trim() : undefined,
          matchResult: matchTag,
          idempotencyKey: crypto.randomUUID(),
        });
      }
      router.push("/chi-quy");
    } catch (err) {
      setErrors({ form: (err as Error).message ?? "Lỗi khi lưu, vui lòng thử lại" });
    }
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (newBalance < 0) { setShowWarning(true); return; }
    doSave();
  };

  return (
    <div className="px-4 py-5 space-y-5 page-in">

      {errors.form && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">{errors.form}</div>
      )}

      <div className="bg-expense-bg border border-expense-border rounded-2xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-500">Loại giao dịch</p>
          <p className="text-[15px] font-bold text-expense">Khoản Chi</p>
        </div>
        <MinusCircleIcon className="w-9 h-9 text-expense/20" />
      </div>

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
        {amountNum > 0 && (
          <p className="text-[11px] text-expense font-medium">
            <CheckCircleIcon className="inline w-3.5 h-3.5 mr-0.5 -mt-0.5" />
            {formatVND(amountNum)}
          </p>
        )}
      </FormField>

      <FormField label="Ngày chi" required hint="Không thể chọn ngày trong tương lai">
        <input type="date" value={date} max={todayISO()} onChange={e => setDate(e.target.value)} className={cn(inputClass, "cursor-pointer")} />
      </FormField>

      <FormField label="Hạng mục" required error={errors.category}>
        <div className="relative">
          <select
            value={category}
            onChange={e => { setCategory(e.target.value as ExpenseCategory); setErrors(p => ({ ...p, category: "" })); }}
            className={cn(inputClass, "appearance-none pr-10 cursor-pointer", errors.category && "border-red-400")}
          >
            <option value="">-- Chọn hạng mục --</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </FormField>

      {category === "Khác" && (
        <FormField label="Tên hạng mục" required error={errors.customCat}>
          <input
            type="text" maxLength={50} placeholder="VD: Mua bóng mới"
            value={customCat}
            onChange={e => { setCustomCat(e.target.value); setErrors(p => ({ ...p, customCat: "" })); }}
            className={cn(inputClass, errors.customCat && "border-red-400")}
          />
        </FormField>
      )}

      <FormField label="Kết quả trận" optional>
        <div className="flex flex-wrap gap-2">
          {MATCH_TAGS.map(tag => (
            <button key={tag.value} type="button" onClick={() => setMatchTag(tag.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-semibold border-2 transition-colors duration-150 cursor-pointer",
                matchTag === tag.value ? tag.active : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Ghi chú" optional>
        <div className="relative">
          <textarea placeholder="VD: Sân Phú Thọ..." maxLength={200} rows={3} value={note} onChange={e => setNote(e.target.value)} className={cn(inputClass, "resize-none")} />
          <span className="absolute bottom-3 right-3.5 text-[10px] text-slate-300">{note.length}/200</span>
        </div>
      </FormField>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={() => router.push("/chi-quy")} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
          Huỷ
        </button>
        <button type="button" onClick={handleSave} disabled={isPending}
          className={cn(
            "flex-1 py-4 rounded-2xl text-[13px] font-bold transition-colors duration-150",
            !isPending ? "bg-expense text-white cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          {isPending ? "Đang lưu..." : isEdit ? "Cập nhật" : "Lưu khoản chi"}
        </button>
      </div>

      {showWarning && (
        <NegativeBalanceDialog
          newBalance={newBalance}
          onConfirm={() => { setShowWarning(false); doSave(); }}
          onCancel={() => setShowWarning(false)}
        />
      )}
    </div>
  );
}
