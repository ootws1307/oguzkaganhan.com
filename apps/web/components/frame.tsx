const ZONE_COLUMNS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const ZONE_ROWS = ["A", "B", "C", "D", "E", "F"];

/**
 * The sheet border (1.5 ink line) and, on the first sheet, its zone references:
 * columns 1–8 across the top margin and rows A–F down the left, as on a drawing.
 */
export function Frame({ zones = false, draw = false }: { zones?: boolean; draw?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
        <rect
          className="frame-line"
          data-draw={draw ? "" : undefined}
          x="0"
          y="0"
          width="100%"
          height="100%"
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        />
      </svg>
      {zones && (
        <>
          <div className="absolute inset-x-0 -top-6 hidden h-6 grid-cols-8 sm:grid">
            {ZONE_COLUMNS.map((zone) => (
              <span
                key={zone}
                className="caps tnum flex items-center justify-center border-l border-rule text-[0.7rem] text-ink-soft first:border-l-0"
              >
                {zone}
              </span>
            ))}
          </div>
          <div className="absolute inset-y-0 -left-6 hidden w-6 grid-rows-6 sm:grid">
            {ZONE_ROWS.map((zone) => (
              <span
                key={zone}
                className="caps flex items-center justify-center border-t border-rule text-[0.7rem] text-ink-soft first:border-t-0"
              >
                {zone}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
