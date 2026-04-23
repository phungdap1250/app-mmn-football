import { PageHeader } from "@/components/shared/page-header";
import { IncomeForm } from "@/components/thu-quy/income-form";

export default function ThuQuyMoiPage() {
  return (
    <>
      <PageHeader title="Thêm khoản thu" subtitle="Ghi nhận tiền vào quỹ" />
      <IncomeForm />
    </>
  );
}
