import type { ReactNode } from "react";
import { Frame } from "./frame";

type SheetProps = {
  id: string;
  title: string;
  /** "Pafta" / "Sheet" */
  sheetLabel: string;
  /** "03/06": the sheet's place in the set. */
  sheetNumber: string;
  children: ReactNode;
  /** The first sheet carries zone references and draws its border on load. */
  lead?: boolean;
  /** The cover sheet's real heading is its h1, so its strip label is not a heading. */
  titleAs?: "h2" | "p";
};

/** One drawing sheet: trimmed paper, a drawn border, and a header strip naming the sheet. */
export function Sheet({
  id,
  title,
  sheetLabel,
  sheetNumber,
  children,
  lead = false,
  titleAs: Title = "h2",
}: SheetProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`mx-auto w-full max-w-[1480px] px-3 sm:px-6 ${lead ? "pt-3 sm:pt-9" : "pt-3 sm:pt-6"}`}
    >
      <div className={`relative border border-rule ${lead ? "sm:pl-6" : ""}`}>
        <div className="relative text-ink">
          <Frame zones={lead} draw={lead} />
          <div className="flex items-baseline justify-between gap-4 border-b border-ink px-4 py-2.5 sm:px-6">
            <Title
              id={Title === "h2" ? `${id}-title` : undefined}
              className="caps text-lg leading-none sm:text-xl"
            >
              {title}
            </Title>
            <p className="caps tnum shrink-0 text-sm leading-none text-ink-soft">
              {sheetLabel} <span className="text-ink">{sheetNumber}</span>
            </p>
          </div>
          <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">{children}</div>
        </div>
      </div>
    </section>
  );
}
