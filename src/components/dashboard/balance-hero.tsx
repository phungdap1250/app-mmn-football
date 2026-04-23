"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

interface BalanceHeroProps {
  balance: number;
  clubName: string;
}

export function BalanceHero({ balance, clubName }: BalanceHeroProps) {
  const isNegative = balance < 0;

  return (
    <div className={`relative overflow-hidden px-5 pt-12 pb-16 ${isNegative ? "bg-red-600" : "bg-primary"}`}>
      {/* Decorative background circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute top-12 -right-2 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

      {/* Top row: club name */}
      <div className="relative z-10 mb-1">
        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">Quỹ đội bóng</p>
        <h1 className="text-white text-[15px] font-bold mt-0.5">{clubName}</h1>
      </div>

      {/* Balance */}
      <div className="relative z-10 mt-5">
        <p className="text-white/60 text-xs font-medium">Số dư hiện tại</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`text-[38px] font-extrabold leading-none tracking-tight ${isNegative ? "text-red-100" : "text-white"}`}>
            {balance < 0 ? "-" : ""}
            {Math.abs(balance).toLocaleString("vi-VN")}
          </span>
          <span className="text-xl font-semibold text-white/70">đ</span>
        </div>

        {/* Negative badge */}
        {isNegative && (
          <div className="mt-3 inline-flex items-center gap-1.5 bg-red-500 border border-red-400 rounded-full px-3 py-1">
            <ExclamationTriangleIcon className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-xs font-bold">Quỹ đang âm</span>
          </div>
        )}
      </div>
    </div>
  );
}
