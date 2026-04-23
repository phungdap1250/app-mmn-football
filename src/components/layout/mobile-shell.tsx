import { BottomNav } from "./bottom-nav";

/** Wraps every page in the mobile-first max-w-sm shell with bottom nav */
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="relative w-full max-w-sm bg-background min-h-screen shadow-2xl">
        <main className="pb-20">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
