import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";
import * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Focus: the border turns ink and thickens to the 2px focus weight.
        "h-8 w-full min-w-0 border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
