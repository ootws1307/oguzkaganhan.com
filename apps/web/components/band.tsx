import type { ReactNode } from "react";

/**
 * A numbered report has sections; this one names them in the margin. The label
 * sits in the left columns, the content runs in the main column beside it, and a
 * single ink rule opens each band.
 */
export function Band({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="page scroll-mt-20">
      <div className="grid gap-x-10 gap-y-4 border-t border-ink pt-5 lg:grid-cols-12">
        <h2 id={`${id}-title`} className="caps pt-1 text-xs text-ink-faint lg:col-span-3">
          {title}
        </h2>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}
