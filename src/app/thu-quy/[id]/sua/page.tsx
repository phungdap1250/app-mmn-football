"use client";

import { PageHeader } from "@/components/shared/page-header";
import { IncomeForm } from "@/components/thu-quy/income-form";
import { useTransaction } from "@/hooks/use-transactions";

export default function SuaThuQuyPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: tx, isLoading, isError } = useTransaction(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !tx) {
    return <p className="text-center text-sm text-red-500 py-12">Không tìm thấy giao dịch.</p>;
  }

  return (
    <>
      <PageHeader title="Sửa khoản thu" subtitle="Chỉnh sửa thông tin giao dịch" />
      <IncomeForm editTx={tx} />
    </>
  );
}
