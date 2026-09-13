"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cn } from "cn";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        // A drawn toggle: square ink-lined track; off is a soft-ink block on paper,
        // on is a paper block on solid ink. Travel = inner width (w - 2px border - 4px pad) - thumb.
        "peer group/switch relative inline-flex shrink-0 items-center border border-ring p-[2px] transition-colors duration-150 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring aria-invalid:border-destructive data-[size=default]:h-[18px] data-[size=default]:w-8 data-[size=sm]:h-[14px] data-[size=sm]:w-6 data-checked:bg-primary data-unchecked:bg-transparent data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block transition-transform duration-150 ease-(--ease-draw) group-data-[size=default]/switch:size-3 group-data-[size=sm]/switch:size-2 data-checked:bg-primary-foreground data-unchecked:bg-ink-soft data-unchecked:translate-x-0 group-data-[size=default]/switch:data-checked:translate-x-[14px] group-data-[size=sm]/switch:data-checked:translate-x-[10px]"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
