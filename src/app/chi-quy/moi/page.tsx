import { PageHeader } from "@/components/shared/page-header";
import { ExpenseForm } from "@/components/chi-quy/expense-form";

export default function ChiQuyMoiPage() {
  return (
    <>
      <PageHeader title="Thêm khoản chi" subtitle="Ghi nhận tiền ra khỏi quỹ" />
      <ExpenseForm />
    </>
  );
}
