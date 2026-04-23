"use client";

import { useState, useEffect } from "react";
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import { PageHeader } from "@/components/shared/page-header";
import { FormField, inputClass } from "@/components/shared/form-field";
import { cn } from "@/lib/utils";
import { formatVND } from "@/lib/format";
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from "@/hooks/use-members";
import { useIncomeByDateRange } from "@/hooks/use-transactions";
import type { Member, CreateMemberInput } from "@/types";

type FormState = { name: string; phone: string; jerseyNumber: string };
const EMPTY_FORM: FormState = { name: "", phone: "", jerseyNumber: "" };

export default function ThanhVienPage() {
  const { data: members = [], isLoading } = useMembers();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  // Lấy range đợt thu từ localStorage sau khi mount (tránh hydration mismatch)
  const todayStr = new Date().toISOString().split("T")[0];
  const [dotFrom, setDotFrom] = useState(todayStr);
  const [dotTo, setDotTo] = useState(todayStr);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("kiem-tra-dot-range") ?? "null");
    if (saved?.from) setDotFrom(saved.from);
    if (saved?.to) setDotTo(saved.to);
  }, []);

  const { data: incomeData } = useIncomeByDateRange(dotFrom, dotTo);
  // Map: memberId → tổng số tiền đã đóng trong đợt
  const paidMap = new Map<string, number>();
  for (const tx of incomeData ?? []) {
    if (tx.memberId) paidMap.set(tx.memberId, (paidMap.get(tx.memberId) ?? 0) + tx.amount);
  }

  const [showForm, setShowForm]   = useState(false);
  const [editId,   setEditId]     = useState<string | null>(null);
  const [form,     setForm]       = useState<FormState>(EMPTY_FORM);
  const [error,    setError]      = useState("");
  // Delete confirmation: null | { id, name, hasTransactions, count }
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; hasTransactions?: boolean; count?: number } | null>(null);

  const openCreate = () => { setEditId(null); setForm(EMPTY_FORM); setError(""); setShowForm(true); };
  const openEdit   = (m: Member) => { setEditId(m.id); setForm({ name: m.name, phone: m.phone ?? "", jerseyNumber: m.jerseyNumber ?? "" }); setError(""); setShowForm(true); };
  const closeForm  = () => { setShowForm(false); setEditId(null); setError(""); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Tên không được để trống"); return; }
    const input: CreateMemberInput = { name: form.name.trim(), phone: form.phone.trim() || undefined, jerseyNumber: form.jerseyNumber.trim() || undefined };
    try {
      if (editId) {
        await updateMember.mutateAsync({ id: editId, ...input });
      } else {
        await createMember.mutateAsync(input);
      }
      closeForm();
    } catch (err) {
      setError((err as Error).message ?? "Lỗi khi lưu");
    }
  };

  const handleDeleteClick = async (m: Member) => {
    try {
      // Gọi DELETE không có force → API trả hasTransactions nếu có giao dịch
      const result = await deleteMember.mutateAsync({ id: m.id, force: false });
      if (result.hasTransactions) {
        setDeleteConfirm({ id: m.id, name: m.name, hasTransactions: true, count: result.count });
      }
      // Nếu !hasTransactions → member đã xoá thật, cache được invalidate qua hook
    } catch (err) {
      setError((err as Error).message ?? "Lỗi khi xoá thành viên");
    }
  };

  const handleForceDelete = async () => {
    if (!deleteConfirm) return;
    await deleteMember.mutateAsync({ id: deleteConfirm.id, force: true });
    setDeleteConfirm(null);
  };

  const isPending = createMember.isPending || updateMember.isPending;

  return (
    <>
      <PageHeader title="Thành viên" subtitle={`${members.length} người trong đội`} />

      <div className="px-4 pb-6 space-y-3 page-in">

        {/* Add button */}
        <button
          onClick={openCreate}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-2xl py-3.5 text-[13px] font-bold hover:bg-primary-dark transition-colors cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          Thêm thành viên
        </button>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
            <UserGroupIcon className="w-12 h-12 opacity-30" />
            <p className="text-sm">Chưa có thành viên nào</p>
          </div>
        ) : (
          members.map(m => {
            const paid = paidMap.get(m.id);
            return (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-slate-800 flex-1 truncate">
                  {m.name}{m.jerseyNumber && <span className="text-slate-400 font-normal"> · #{m.jerseyNumber}</span>}
                </p>
                {paid !== undefined
                  ? <span className="text-[10px] font-bold text-income bg-income-bg px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">✓ {formatVND(paid)}</span>
                  : <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">Chưa đóng</span>
                }
                <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                  <PencilIcon className="w-3 h-3 text-slate-500" />
                </button>
                <button onClick={() => handleDeleteClick(m)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer shrink-0">
                  <TrashIcon className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Form bottom sheet */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={closeForm}>
          <div className="bg-white rounded-t-3xl w-full max-w-sm p-6 pb-10 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
            <h3 className="text-[15px] font-bold text-slate-800 text-center">
              {editId ? "Sửa thành viên" : "Thêm thành viên"}
            </h3>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <FormField label="Tên" required>
              <input
                type="text" maxLength={50} placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputClass}
                autoFocus
              />
            </FormField>
            <FormField label="Số áo" optional>
              <input type="text" maxLength={5} placeholder="10" value={form.jerseyNumber} onChange={e => setForm(f => ({ ...f, jerseyNumber: e.target.value }))} className={inputClass} />
            </FormField>

            <div className="flex gap-3 pt-1">
              <button onClick={closeForm} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-[13px] font-semibold text-slate-600 cursor-pointer">Huỷ</button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className={cn("flex-1 py-4 rounded-2xl text-[13px] font-bold transition-colors", !isPending ? "bg-primary text-white hover:bg-primary-dark cursor-pointer" : "bg-slate-200 text-slate-400")}
              >
                {isPending ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation sheet */}
      {deleteConfirm?.hasTransactions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-t-3xl w-full max-w-sm p-6 pb-10 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
            <h3 className="text-[15px] font-bold text-slate-800 text-center">Xoá thành viên?</h3>
            <p className="text-[13px] text-slate-500 text-center leading-relaxed">
              <strong>{deleteConfirm.name}</strong> đã có <strong>{deleteConfirm.count}</strong> khoản thu.
              Xoá thành viên sẽ <strong>không xoá các giao dịch đó</strong> — lịch sử vẫn giữ tên cũ.
            </p>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-[13px] font-semibold text-slate-600 cursor-pointer">Giữ lại</button>
              <button onClick={handleForceDelete} className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[13px] font-bold hover:bg-red-600 cursor-pointer">Vẫn xoá</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
