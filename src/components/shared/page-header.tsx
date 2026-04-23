import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  children?: ReactNode;
}

/** Reusable top header for inner pages (Thu quỹ, Chi quỹ, …) */
export function PageHeader({ title, subtitle, backHref = "/dashboard", children }: PageHeaderProps) {
  return (
    <div className="bg-white px-5 pt-12 pb-4 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-20">
      <Link
        href={backHref}
        className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
        aria-label="Quay lại"
      >
        <ChevronLeftIcon className="w-4 h-4 text-slate-600" />
      </Link>
      <div className="flex-1 min-w-0">
        <h2 className="text-[15px] font-bold text-slate-800 leading-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
