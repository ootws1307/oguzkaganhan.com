"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SyncButton } from "./sync-button";

const PAGES = [
  { href: "/sections", label: "Bölümler" },
  { href: "/projects", label: "Projeler" },
  { href: "/experience", label: "Deneyim ve eğitim" },
  { href: "/skills", label: "Yetenekler" },
  { href: "/contact", label: "İletişim" },
  { href: "/settings", label: "Site ayarları" },
];

/** The panel index: the same running head the public site pins to its top edge. */
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
        <span className="text-[0.9375rem] font-semibold tracking-[-0.01em]">{siteName}</span>
        <span className="caps text-[0.6875rem] text-ink-faint">Yönetim</span>
      </div>

      <nav aria-label="Bölümler" className="overflow-x-auto lg:flex-1 lg:overflow-y-auto">
        <ol className="flex whitespace-nowrap lg:block lg:py-2">
          {PAGES.map((page) => {
            const active = pathname.startsWith(page.href);
            return (
              <li key={page.href}>
                <Link
                  href={page.href}
                  aria-current={active ? "page" : undefined}
                  // Inset focus outline: the scrolling strip/rail would clip an outer one.
                  className={`flex items-baseline gap-3 px-4 py-2.5 transition-colors hover:bg-paper-deep focus-visible:-outline-offset-2 ${
                    active ? "bg-paper-deep text-ink" : "text-ink-soft"
                  }`}
                >
                  {/* The order of these pages carries no meaning, so they are not numbered. */}
                  <span className={`text-[0.9375rem] ${active ? "font-medium" : ""}`}>
                    {page.label}
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
