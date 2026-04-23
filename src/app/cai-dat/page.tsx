"use client";

import { useState, useEffect } from "react";
import { CheckIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { FormField, inputClass } from "@/components/shared/form-field";
import { cn } from "@/lib/utils";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { createClient } from "@/lib/supabase/client";

export default function CaiDatPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const router = useRouter();

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/login");
  };

  const [fundName,       setFundName]       = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [saved,          setSaved]          = useState(false);
  const [error,          setError]          = useState("");

  // Sync form khi data về
  useEffect(() => {
    if (!settings) return;
    setFundName(settings.fundName ?? "");
    setOpeningBalance(String(settings.openingBalance ?? 0));
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    setError("");
    try {
      await updateSettings.mutateAsync({
        id: settings.id,
        fundName,
        openingBalance: parseInt(openingBalance, 10) || 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError((err as Error).message ?? "Lỗi khi lưu cài đặt");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Cài đặt" subtitle="Thông tin quỹ" />

      <div className="px-4 pb-8 space-y-6 page-in">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <section className="space-y-4">
          <h2 className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Thông tin quỹ</h2>
          <FormField label="Tên quỹ" required>
            <input type="text" maxLength={100} value={fundName} onChange={e => setFundName(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Số dư đầu kỳ (VNĐ)" hint="Số tiền quỹ đang có trước khi dùng app">
            <input type="number" inputMode="numeric" min={0} value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} className={inputClass} />
          </FormField>
        </section>

        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className={cn(
            "w-full py-4 rounded-2xl text-[13px] font-bold transition-colors",
            !updateSettings.isPending ? "bg-primary text-white hover:bg-primary-dark cursor-pointer" : "bg-slate-200 text-slate-400"
          )}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-1.5">
              <CheckIcon className="w-4 h-4" /> Đã lưu
            </span>
          ) : updateSettings.isPending ? "Đang lưu..." : "Lưu cài đặt"}
        </button>

        {/* Đăng xuất */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl text-[13px] font-semibold text-red-500 border-2 border-red-100 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </>
  );
}
