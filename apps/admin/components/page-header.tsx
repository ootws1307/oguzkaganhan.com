import type { ReactNode } from "react";

/** A sheet's header strip: title on the left, actions on the right. */
export function PageHeader({
  title,
  titleLang,
  description,
  actions,
  back,
}: {
  title: string;
  /** Set to "en" for English text (e.g. repo names) so CSS uppercase keeps a dotless "I". */
  titleLang?: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <header className="border-b border-ink">
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 sm:px-8">
        <div className="min-w-0">
          {back && <div className="mb-3">{back}</div>}
          <h1 lang={titleLang} className="caps text-3xl leading-none sm:text-4xl">
            {title}
          </h1>
          {description && <p className="mt-2 max-w-[70ch] text-ink-soft">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
