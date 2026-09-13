import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "./icons";
import { LocaleSwitch } from "./locale-switch";

export type NavItem = { id: string; title: string; no: string };

/** The set's sheet index, pinned to the top edge like a drawing register. */
export async function SiteNav({
  siteName,
  items = [],
  back,
}: {
  siteName: string;
  items?: NavItem[];
  back?: { href: string; label: string };
}) {
  const t = await getTranslations("Sheet");

  return (
    <header className="sticky top-0 z-20 border-b border-ink bg-paper">
      <div className="mx-auto flex h-[var(--nav-h)] max-w-[1480px] items-center gap-6 px-3 sm:px-6">
        <Link
          href="/"
          className="caps shrink-0 text-base leading-none hover:underline decoration-double"
        >
          {siteName}
        </Link>
        {back ? (
          <Link
            href={back.href}
            className="caps flex min-w-0 flex-1 items-center gap-2 text-sm text-ink-soft hover:text-ink"
          >
            <ArrowLeft className="shrink-0" />
            {back.label}
          </Link>
        ) : (
          <nav
            aria-label={t("index")}
            className="min-w-0 flex-1 overflow-x-auto pr-6 [mask-image:linear-gradient(to_right,#000_78%,transparent)] [scrollbar-width:none] sm:pr-0 sm:[mask-image:none]"
          >
            <ol className="flex gap-5 whitespace-nowrap">
              {items.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="caps text-sm text-ink transition-colors hover:underline decoration-double"
                  >
                    <span className="tnum mr-1.5 text-ink-soft">{item.no}</span>
                    {item.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <LocaleSwitch />
      </div>
    </header>
  );
}
