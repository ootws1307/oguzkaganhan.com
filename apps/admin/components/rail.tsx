"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SyncButton } from "./sync-button";

const SHEETS = [
  { href: "/sections", label: "Bölümler" },
  { href: "/projects", label: "Projeler" },
  { href: "/experience", label: "Deneyim ve eğitim" },
  { href: "/skills", label: "Yetenekler" },
  { href: "/contact", label: "İletişim" },
  { href: "/settings", label: "Site ayarları" },
];

/** The admin's sheet index: the same register the public site pins to its top edge. */
export function Rail({
  siteName,
  webUrl,
  lastSync,
  login,
}: {
  siteName: string;
  webUrl: string;
  lastSync: string | null;
  login: string | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="border-b border-ink lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-baseline justify-between gap-3 border-b border-ink px-4 py-3">
        <span className="caps text-base leading-none">{siteName}</span>
        <span className="caps text-xs leading-none text-ink-soft">Yönetim</span>
      </div>

      <nav aria-label="Pafta dizini" className="overflow-x-auto lg:flex-1 lg:overflow-y-auto">
        <ol className="flex whitespace-nowrap lg:block lg:py-2">
          {SHEETS.map((sheet, i) => {
            const active = pathname.startsWith(sheet.href);
            return (
              <li key={sheet.href}>
                <Link
                  href={sheet.href}
                  aria-current={active ? "page" : undefined}
                  // Inset focus outline: the scrolling strip/rail would clip an outer one.
                  className={`flex items-baseline gap-3 px-4 py-2.5 transition-colors hover:bg-paper-deep focus-visible:-outline-offset-2 ${
                    active ? "bg-paper-deep text-ink" : "text-ink-soft"
                  }`}
                >
                  <span className="caps tnum text-xs">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={`caps text-[0.95rem] ${active ? "underline decoration-double underline-offset-4" : ""}`}
                  >
                    {sheet.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* On a narrow screen the rail is a strip above the content, so the title block
          sits below the index and pairs its two links in one row to save height. */}
      <div className="border-t border-ink">
        <SyncButton lastSync={lastSync} />
        <div className="grid grid-cols-2 border-t border-rule lg:grid-cols-1">
          <a
            href={webUrl}
            target="_blank"
            rel="noreferrer"
            className="caps flex items-center justify-between gap-2 border-r border-rule px-4 py-2.5 text-sm hover:bg-paper-deep lg:border-r-0"
          >
            Siteyi aç
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <form action="/auth/signout" method="post" className="lg:border-t lg:border-rule">
            <button
              type="submit"
              className="caps flex h-full w-full items-baseline justify-between gap-2 px-4 py-2.5 text-left text-sm text-ink-soft hover:bg-paper-deep hover:text-ink"
            >
              Çıkış yap
              {login && <span className="truncate text-xs normal-case">@{login}</span>}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
