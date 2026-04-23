"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { formatVND } from "@/lib/format";

interface NegativeBalanceDialogProps {
  newBalance: number;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Bottom-sheet style dialog warning when expense makes balance negative */
export function NegativeBalanceDialog({ newBalance, onConfirm, onCancel }: NegativeBalanceDialogProps) {
  return (
    /* Overlay */
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onCancel}
    >
      {/* Sheet — stop propagation so clicking inside doesn't close */}
      <div
        className="bg-white rounded-t-3xl w-full max-w-sm p-6 pb-10 page-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-6" />

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
        </div>

        <h3 className="text-[15px] font-bold text-slate-800 text-center mb-2">
          Cảnh báo: Quỹ sẽ bị âm
        </h3>
        <p className="text-[13px] text-slate-500 text-center leading-relaxed mb-1">
          Khoản chi này làm quỹ bị âm{" "}
          <strong className="text-red-500">{formatVND(Math.abs(newBalance))}</strong>.
          Bạn vẫn muốn tiếp tục?
        </p>
        <p className="text-[11px] text-slate-400 text-center mb-6">
          (Thủ quỹ thường ứng tiền túi trả trước)
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Huỷ bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-colors cursor-pointer"
          >
            Vẫn lưu
          </button>
        </div>
      </div>
    </div>
  );
}
