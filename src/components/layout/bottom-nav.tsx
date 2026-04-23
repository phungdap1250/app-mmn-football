"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  BanknotesIcon,
  MinusCircleIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Tổng quan",  Icon: HomeIcon },
  { href: "/thu-quy",     label: "Thu quỹ",    Icon: BanknotesIcon },
  { href: "/chi-quy",     label: "Chi quỹ",    Icon: MinusCircleIcon },
  { href: "/thanh-vien",  label: "Thành viên", Icon: UserGroupIcon },
  { href: "/cai-dat",     label: "Cài đặt",    Icon: Cog6ToothIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-slate-100 z-30 px-2 py-1 safe-area-inset-bottom">
      <ul className="flex items-center justify-around">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors duration-150 cursor-pointer
                  ${active ? "text-primary" : "text-slate-400 hover:text-slate-500"}`}
              >
                <Icon className="w-[22px] h-[22px]" />
                <span className={`text-[10px] font-semibold ${active ? "text-primary" : "text-slate-400"}`}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
