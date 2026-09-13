import type { ReactNode } from "react";

export type TitleBlockRow = {
  label: string;
  value: ReactNode;
  /** Redline marks something new or revised. */
  redline?: boolean;
};

/**
 * A drawing's title block: a ruled table with the maker's mark on the left,
 * labelled fields on the right, and the sheet's primary action along the bottom.
 */
export function TitleBlock({
  mark,
  rows,
  action,
}: {
  mark: ReactNode;
  rows: TitleBlockRow[];
  action?: ReactNode;
}) {
  return (
    <div className="border border-ink bg-paper text-ink">
      <div className="grid grid-cols-[4.75rem_minmax(0,1fr)] sm:grid-cols-[6rem_minmax(0,1fr)]">
        <div className="flex items-center justify-center border-r border-ink">{mark}</div>
        <dl>
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-3 border-b border-rule px-3 py-2 last:border-b-0"
            >
              <dt className="caps text-[0.72rem] leading-tight text-ink-soft">{row.label}</dt>
              <dd
                className={`tnum text-[0.95rem] leading-snug ${row.redline ? "text-redline" : ""}`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {action && <div className="border-t border-ink">{action}</div>}
    </div>
  );
}

/** The title block's primary action: solid ink, the only filled surface on the sheet. */
export function TitleBlockAction({
  href,
  children,
  download,
  external,
}: {
  href: string;
  children: ReactNode;
  download?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      download={download || undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="caps flex items-center justify-between gap-3 bg-ink px-4 py-3 text-base text-paper transition-colors duration-150 hover:bg-ink-deep focus-visible:outline-offset-[-4px] focus-visible:outline-paper"
    >
      {children}
    </a>
  );
}
