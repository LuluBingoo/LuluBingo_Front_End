import React from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface OpeningPlaygroundOverlayProps {
  isVisible: boolean;
}

export const OpeningPlaygroundOverlay: React.FC<
  OpeningPlaygroundOverlayProps
> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-2200 h-dvh w-dvw overflow-hidden bg-white dark:bg-slate-950">
      <div className="absolute inset-0 backdrop-blur-md" />
      <div className="relative flex h-full w-full items-center justify-center px-4">
        <div className="w-[min(92vw,560px)] space-y-5 rounded-2xl border border-sky-200 bg-white/95 p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95">
          <div className="text-center">
            <h3 className="text-xl font-bold text-sky-700 dark:text-sky-300">
              Opening Playground...
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Loading game data and restoring called numbers.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Please wait...
            </span>
          </div>

          <div className="relative h-16 overflow-hidden rounded-xl border border-sky-100 bg-linear-to-r from-sky-50 via-white to-indigo-50 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <motion.div
              className="absolute inset-y-0 left-0 flex items-center gap-2 px-2"
              animate={{ x: [0, -280] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[
                "B-07",
                "I-19",
                "N-42",
                "G-53",
                "O-71",
                "B-11",
                "I-27",
                "N-34",
                "G-60",
                "O-69",
                "B-07",
                "I-19",
              ].map((ball, index) => (
                <div
                  key={`${ball}-${index}`}
                  className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-sky-200 bg-white px-2 text-xs font-black text-sky-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-sky-200"
                >
                  {ball}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
