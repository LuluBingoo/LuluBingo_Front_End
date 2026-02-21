import React from "react";

interface ShuffleSpeedPresetsProps {
  value: number;
  theme: "light" | "dark";
  compact?: boolean;
  onChange: (value: number) => void;
}

const resolveLabel = (value: number) =>
  value >= 340 ? "Slow" : value <= 170 ? "Fast" : "Normal";

export const ShuffleSpeedPresets: React.FC<ShuffleSpeedPresetsProps> = ({
  value,
  theme,
  compact = false,
  onChange,
}) => {
  const active = resolveLabel(value);

  const baseClass = compact
    ? "rounded-md px-2 py-1 text-[11px] font-semibold transition"
    : "rounded-md px-2 py-1 text-xs font-semibold transition";

  const normalInactive = compact
    ? theme === "dark"
      ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700";

  return (
    <>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="font-semibold">Shuffle Speed</span>
        <span
          className={
            compact
              ? "text-[11px]"
              : "font-semibold text-slate-700 dark:text-slate-200"
          }
        >
          {active}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => onChange(420)}
          className={`${baseClass} ${active === "Slow" ? "bg-amber-500 text-slate-900" : normalInactive}`}
        >
          Slow
        </button>
        <button
          type="button"
          onClick={() => onChange(230)}
          className={`${baseClass} ${active === "Normal" ? "bg-amber-500 text-slate-900" : normalInactive}`}
        >
          Normal
        </button>
        <button
          type="button"
          onClick={() => onChange(140)}
          className={`${baseClass} ${active === "Fast" ? "bg-amber-500 text-slate-900" : normalInactive}`}
        >
          Fast
        </button>
      </div>
    </>
  );
};
