import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// The same grotesk the site is set in; the panel is the same document, at work.
const grotesk = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Yönetim", template: "%s — Yönetim" },
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={grotesk.variable}>
      <body className="min-h-svh antialiased">{children}</body>
    </html>
  );
}
