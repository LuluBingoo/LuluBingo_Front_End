import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md border border-slate-200/40 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 shadow-inner dark:border-slate-700/40 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
