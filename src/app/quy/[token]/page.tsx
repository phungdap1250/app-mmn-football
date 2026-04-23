import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatVND } from "@/lib/format";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";

export default async function PublicFundPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;
  const db = getSupabaseAdmin();

  // Xác thực token và lấy thông tin quỹ
  const { data: settings, error: settingsError } = await db
    .from("fund_settings")
    .select("id, fund_name, opening_balance")
    .eq("public_token", token)
    .single();

  if (settingsError || !settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">
          Link không hợp lệ
        </h1>
        <p className="text-sm text-slate-500">
          Link này đã hết hạn hoặc không tồn tại.
          <br />
          Vui lòng liên hệ thủ quỹ để lấy link mới.
        </p>
      </div>
    );
  }

  // Lấy tổng thu/chi và danh sách giao dịch song song
  const [totalsResult, txResult] = await Promise.all([
    db.rpc("get_transaction_totals").single(),
    db
      .from("transactions")
      .select(
        "id, type, amount, date, note, category, category_custom, member_name_snapshot, match_result, members!left(name)"
      )
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totals = totalsResult.data as any;
  const totalIncome: number = totals?.total_income ?? 0;
  const totalExpense: number = totals?.total_expense ?? 0;
  const currentBalance = settings.opening_balance + totalIncome - totalExpense;
  const isNegative = currentBalance < 0;

  const transactions = (txResult.data ?? []) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div
        className={`relative overflow-hidden px-5 pt-12 pb-16 ${
          isNegative ? "bg-red-600" : "bg-emerald-600"
        }`}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-12 -right-2 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 mb-1">
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">
            Quỹ đội bóng · Xem công khai
          </p>
          <h1 className="text-white text-[17px] font-bold mt-0.5">
            {settings.fund_name}
          </h1>
        </div>

        <div className="relative z-10 mt-5">
          <p className="text-white/60 text-xs font-medium">Số dư hiện tại</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span
              className={`text-[38px] font-extrabold leading-none tracking-tight ${
                isNegative ? "text-red-100" : "text-white"
              }`}
            >
              {currentBalance < 0 ? "-" : ""}
              {Math.abs(currentBalance).toLocaleString("vi-VN")}
            </span>
            <span className="text-xl font-semibold text-white/70">đ</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="px-4 -mt-8 grid grid-cols-3 gap-2 relative z-10">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">Đầu kỳ</p>
          <p className="text-[13px] font-bold text-slate-700 mt-1">
            {formatVND(settings.opening_balance)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-emerald-500 font-medium">Tổng thu</p>
          <p className="text-[13px] font-bold text-emerald-600 mt-1">
            +{formatVND(totalIncome)}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-rose-400 font-medium">Tổng chi</p>
          <p className="text-[13px] font-bold text-rose-500 mt-1">
            -{formatVND(totalExpense)}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-4 mt-6">
        <h2 className="text-[13px] font-bold text-slate-700 mb-3">
          Lịch sử giao dịch ({transactions.length})
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Chưa có giao dịch nào.
          </div>
        ) : (
          <div className="space-y-2 pb-10">
            {transactions.map((tx) => {
              const isIncome = tx.type === "income";
              const label = isIncome
                ? (tx.members?.name ?? tx.member_name_snapshot ?? "Thành viên")
                : (tx.category_custom ?? tx.category ?? "Chi phí");
              const note = isIncome
                ? tx.note
                : tx.match_result
                ? `${tx.match_result}${tx.note ? " · " + tx.note : ""}`
                : tx.note;
              const date = new Date(tx.date).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              });

              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-slate-100 shadow-sm"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isIncome ? "bg-emerald-50" : "bg-rose-50"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownIcon className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowUpIcon className="w-4 h-4 text-rose-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 truncate">
                      {label}
                    </p>
                    {note && (
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {note}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-[13px] font-bold ${
                        isIncome ? "text-emerald-600" : "text-rose-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatVND(tx.amount)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-[10px] text-slate-300">
        Dữ liệu chỉ đọc · Cập nhật theo thời gian thực
      </div>
    </div>
  );
}
