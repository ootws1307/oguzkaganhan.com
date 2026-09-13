/**
 * A dimension line: extension ticks at both ends and a label set in the gap.
 * The label is always real data (repo name, last push), never decoration.
 */
export function Dimension({
  label,
  orientation = "horizontal",
  className = "",
}: {
  label: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const vertical = orientation === "vertical";
  const tick = <span className="block h-3 w-px shrink-0 rotate-45 bg-ink" />;
  // The lines draw in once with the sheet frame (see .dim-line in app/styles.css).
  const line = (
    <span
      className={`dim-line block flex-1 bg-ink-soft ${vertical ? "dim-line-y w-px" : "dim-line-x h-px"}`}
    />
  );

  return (
    <div
      aria-hidden
      className={`flex items-center gap-2 text-ink-soft ${vertical ? "flex-col" : ""} ${className}`}
    >
      {tick}
      {line}
      <span
        className="caps tnum shrink-0 text-[0.72rem] leading-none"
        style={vertical ? { writingMode: "vertical-rl", transform: "rotate(180deg)" } : undefined}
      >
        {label}
      </span>
      {line}
      {tick}
    </div>
  );
}
