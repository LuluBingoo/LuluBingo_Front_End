import React from "react";
import { motion } from "motion/react";
import { Flame, Maximize, Minimize, Monitor } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

interface BoardAreaProps {
  boardContainerRef: React.RefObject<HTMLDivElement | null>;
  isFullscreen: boolean;
  theme: "light" | "dark";
  showFullscreenHud: boolean;
  isTheaterMode: boolean;
  setIsTheaterMode: React.Dispatch<React.SetStateAction<boolean>>;
  calledNumbersLength: number;
  streakBoost: boolean;
  callStreak: number;
  toggleFullscreen: () => void;
  t: (key: string) => string;
  isShuffling: boolean;
  bingoRows: Record<string, number[]>;
  calledNumbers: number[];
  shuffleCycle: number;
  isGameActive: boolean;
  callSpecificNumber: (number: number) => void;
}

export const BoardArea: React.FC<BoardAreaProps> = ({
  boardContainerRef,
  isFullscreen,
  theme,
  showFullscreenHud,
  isTheaterMode,
  setIsTheaterMode,
  calledNumbersLength,
  streakBoost,
  callStreak,
  toggleFullscreen,
  t,
  isShuffling,
  bingoRows,
  calledNumbers,
  shuffleCycle,
  isGameActive,
  callSpecificNumber,
}) => {
  return (
    <div
      ref={boardContainerRef}
      className={`transition-all duration-300 ${
        isFullscreen
          ? theme === "dark"
            ? "fixed inset-0 z-1100 flex flex-col bg-linear-to-br from-slate-900 via-slate-950 to-black p-2 sm:p-3 overflow-hidden"
            : "fixed inset-0 z-1100 flex flex-col bg-linear-to-br from-white via-slate-50 to-white p-2 sm:p-3 overflow-hidden"
          : "w-full"
      }`}
    >
      <Card
        className={`space-y-3 p-4 w-full ${isFullscreen ? "h-full border-0 bg-transparent p-0 shadow-none" : ""}`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2 transition-all duration-300 ${
            isFullscreen
              ? showFullscreenHud
                ? "opacity-100 translate-y-0"
                : "pointer-events-none -translate-y-3 opacity-0"
              : "opacity-100"
          }`}
        >
          <h3
            className={`text-lg font-semibold ${isFullscreen ? (theme === "dark" ? "text-white" : "text-slate-900") : "text-slate-900 dark:text-slate-100"}`}
          >
            Bingo Board
          </h3>
          {isFullscreen && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => setIsTheaterMode((prev) => !prev)}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold transition ${isTheaterMode ? "bg-indigo-400 text-slate-950" : theme === "dark" ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
                title="Toggle TV mode"
                aria-label="Toggle TV mode"
              >
                <Monitor className="h-4 w-4" /> TV
              </button>
              <span className="rounded-full bg-red-600 px-3 py-1 font-bold text-white">
                {calledNumbersLength}/75 CALLED
              </span>
              <motion.span
                className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 font-bold text-slate-900"
                animate={streakBoost ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Flame className="h-4 w-4" /> x{callStreak}
              </motion.span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={toggleFullscreen}
            className={`h-9 ${isFullscreen ? (theme === "dark" ? "border-slate-600 bg-slate-900/60 text-white hover:bg-slate-800" : "border-slate-300 bg-white text-slate-900 hover:bg-slate-100") : ""}`}
          >
            {isFullscreen ? (
              <>
                <Minimize className="mr-1 h-4 w-4" />{" "}
                {t("playground.exitFullscreen")}
              </>
            ) : (
              <>
                <Maximize className="mr-1 h-4 w-4" />{" "}
                {t("playground.fullscreen")}
              </>
            )}
          </Button>
        </div>

        <motion.div
          className={`space-y-2 ${isFullscreen ? (theme === "dark" ? "h-full overflow-y-auto rounded-xl border border-slate-700/60 bg-slate-900/55 p-2 sm:p-3" : "h-full overflow-y-auto rounded-xl border border-slate-200 bg-white/90 p-2 sm:p-3") : ""}`}
          animate={
            isShuffling
              ? { scale: [1, 0.99, 1.01, 1], opacity: [1, 0.9, 1] }
              : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.55 }}
        >
          {Object.entries(bingoRows).map(([letter, numbers]) => (
            <div
              key={letter}
              className={`grid items-center gap-2 md:gap-4 ${isFullscreen ? (isTheaterMode ? "grid-cols-[72px_1fr] sm:grid-cols-[92px_1fr]" : "grid-cols-[52px_1fr] sm:grid-cols-[72px_1fr]") : "grid-cols-[64px_1fr] md:grid-cols-[80px_1fr]"}`}
            >
              <motion.div
                className={`flex items-center justify-center rounded-xl bg-red-700 font-black text-white shadow-md w-full ${isFullscreen ? (isTheaterMode ? "h-14 text-3xl sm:h-18 sm:text-4xl" : "h-11 text-2xl sm:h-14 sm:text-3xl") : "h-12 md:h-16 lg:h-20 text-3xl md:text-4xl lg:text-5xl"}`}
                whileHover={{ scale: 1.05 }}
              >
                {letter}
              </motion.div>
              <div className="grid gap-2 md:gap-3 grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15">
                {numbers.map((num) => (
                  <motion.div
                    key={num}
                    layout
                    className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-full border-2 font-bold transition-all shadow-sm ${isFullscreen ? (isTheaterMode ? "h-[clamp(2.6rem,4.8vw,6rem)] w-[clamp(2.6rem,4.8vw,6rem)] text-[clamp(1rem,1.7vw,2rem)]" : "h-[clamp(2.2rem,4.1vw,5.2rem)] w-[clamp(2.2rem,4.1vw,5.2rem)] text-[clamp(0.9rem,1.35vw,1.5rem)]") : "h-[clamp(2.3rem,5vw,6.2rem)] w-[clamp(2.3rem,5vw,6.2rem)] text-[clamp(0.9rem,1.6vw,2rem)]"} ${calledNumbers.includes(num) ? "border-sky-500 bg-linear-to-br from-sky-300 via-sky-500 to-sky-700 text-white shadow-[0_10px_20px_rgba(14,165,233,0.45)] font-black scale-[1.02] dark:hover:text-slate-900" : "border-slate-300 bg-linear-to-br from-white via-slate-100 to-slate-300 text-slate-800 shadow-[inset_0_8px_10px_rgba(255,255,255,0.75),0_6px_14px_rgba(15,23,42,0.16)] hover:border-slate-400 hover:shadow-[inset_0_10px_12px_rgba(255,255,255,0.85),0_9px_20px_rgba(15,23,42,0.24)] dark:border-slate-600 dark:bg-linear-to-br dark:from-slate-700 dark:via-slate-800 dark:to-slate-950 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:text-black"}`}
                    animate={
                      isShuffling
                        ? {
                            x: [
                              0,
                              ((num * 7 + shuffleCycle * 11) % 29) - 14,
                              ((num * 13 + shuffleCycle * 5) % 31) - 15,
                              -(((num * 13 + shuffleCycle * 5) % 31) - 15) / 2,
                              0,
                            ],
                            y: [
                              0,
                              ((num * 11 + shuffleCycle * 3) % 21) - 10,
                              ((num * 5 + shuffleCycle * 17) % 23) - 11,
                              -(((num * 5 + shuffleCycle * 17) % 23) - 11) / 2,
                              0,
                            ],
                            rotate: [
                              0,
                              ((num * 3 + shuffleCycle * 9) % 34) - 17,
                              -(((num * 3 + shuffleCycle * 9) % 34) - 17) / 2,
                              0,
                            ],
                            scale: [1, 1.1, 0.94, 1.04, 1],
                          }
                        : { x: 0, y: 0, rotate: 0, scale: 1 }
                    }
                    whileHover={{ scale: 1.1 }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 320,
                        damping: 24,
                      },
                      duration: isShuffling ? 0.22 : 0.18,
                      ease: "easeInOut",
                    }}
                    onClick={() => isGameActive && callSpecificNumber(num)}
                  >
                    {num}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </Card>
    </div>
  );
};
