import type { Metadata } from "next";
import { initTelegramApp } from "@/lib/telegram";
import { BottomNav } from "@/components/BottomNav";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskEarn — Unified Trading, Casino & Quest Hub",
  description: "Multi-functional earning, trading, and gamified ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window !== "undefined") {
    initTelegramApp();
  }

  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
