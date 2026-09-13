import type { Metadata } from "next";
import { Sofia_Sans, Sofia_Sans_Extra_Condensed } from "next/font/google";
import "./globals.css";

const reading = Sofia_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-reading",
  display: "swap",
});
const caps = Sofia_Sans_Extra_Condensed({
  subsets: ["latin", "latin-ext"],
  variable: "--font-caps-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Yönetim", template: "%s — Yönetim" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${reading.variable} ${caps.variable}`}>
      <body className="min-h-svh antialiased">{children}</body>
    </html>
  );
}
