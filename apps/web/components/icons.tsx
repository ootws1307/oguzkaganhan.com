// One stroke weight (1.5) and square ends, so icons read as part of the ruling.
// Decorative: every icon sits next to a text label.
type IconProps = { className?: string };

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "square" as const,
};

export function ArrowUpRight({ className }: IconProps) {
  return (
    <svg {...base} aria-hidden="true" className={className}>
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
    </svg>
  );
}

export function ArrowDown({ className }: IconProps) {
  return (
    <svg {...base} aria-hidden="true" className={className}>
      <path d="M8 2.5v10M4 9l4 4 4-4" />
    </svg>
  );
}

export function ArrowLeft({ className }: IconProps) {
  return (
    <svg {...base} aria-hidden="true" className={className}>
      <path d="M13.5 8h-10M7 4 3 8l4 4" />
    </svg>
  );
}
