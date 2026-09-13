import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "./icons";
import { LocaleSwitch } from "./locale-switch";

export type NavItem = { id: string; title: string };

/** A running head: the name on the left, the report's sections beside it. */
export function SiteHeader({
  siteName,
  items = [],
  back,
  navLabel,
}: {
  siteName: string;
  items?: NavItem[];
  back?: { href: string; label: string };
  navLabel: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper">
      <div className="page flex h-[var(--nav-h)] items-center justify-between gap-6">
        <Link
          href="/"
          className="shrink-0 text-[0.9375rem] font-semibold tracking-[-0.01em] hover:text-signal"
        >
          {siteName}
        </Link>
        {back ? (
          <Link
            href={back.href}
            className="caps flex min-w-0 flex-1 items-center gap-2 text-xs text-ink-faint transition-colors hover:text-ink"
          >
            <ArrowLeft className="shrink-0" />
            {back.label}
          </Link>
        ) : (
          // Below `sm` the index would clip mid-word; the page is short enough to scroll.
          <nav
            aria-label={navLabel}
            className="hidden min-w-0 flex-1 overflow-x-auto sm:block [scrollbar-width:none]"
          >
            <ul className="flex gap-5 whitespace-nowrap">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="caps text-xs text-ink-faint transition-colors hover:text-ink"
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <LocaleSwitch />
      </div>
    </header>
  );
}
