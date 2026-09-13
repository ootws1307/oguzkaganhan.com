import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="caps inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink"
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      {children}
    </Link>
  );
}
