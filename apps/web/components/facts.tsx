import type { ReactNode } from "react";

export type Fact = { label: string; value: ReactNode; current?: boolean };

/**
 * The report's key figures: a ruled definition list where the label names the
 * field and the value is the fact. A field with no value is not printed.
 */
export function Facts({ items, className = "" }: { items: Fact[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <dl className={`border-t border-ink ${className}`}>
      {items.map((fact) => (
        <div
          key={fact.label}
          className="grid grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-4 border-b border-rule py-2.5"
        >
          <dt className="caps text-xs text-ink-faint">{fact.label}</dt>
          <dd className={`text-[0.9375rem] ${fact.current ? "text-signal" : ""}`}>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
