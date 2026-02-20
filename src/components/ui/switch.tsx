"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-slate-300 bg-slate-300/90 shadow-inner transition-all duration-300 ease-out outline-none data-[state=checked]:border-emerald-500/80 data-[state=checked]:bg-emerald-500 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-700 dark:data-[state=checked]:border-emerald-600 dark:data-[state=checked]:bg-emerald-600",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.32)] ring-0 transition-all duration-300 ease-out data-[state=checked]:translate-x-[calc(100%-1px)] data-[state=unchecked]:translate-x-[1px] dark:bg-slate-100",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
