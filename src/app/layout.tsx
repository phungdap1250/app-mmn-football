import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MobileShell } from "@/components/layout/mobile-shell";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "FC Mieng Moi Ngon — Quỹ đội bóng",
  description: "Quản lý quỹ thu chi đội bóng FC Mieng Moi Ngon",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="antialiased">
        <QueryProvider>
          <MobileShell>{children}</MobileShell>
        </QueryProvider>
      </body>
    </html>
  );
}
