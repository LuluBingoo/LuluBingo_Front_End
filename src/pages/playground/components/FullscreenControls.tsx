import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { MoreHorizontal, Play, Shuffle } from "lucide-react";
import { GameStatus } from "../types";
import { ShuffleSpeedPresets } from "./ShuffleSpeedPresets";

interface FullscreenControlsProps {
  isFullscreen: boolean;
  showFullscreenHud: boolean;
  theme: "light" | "dark";
  calledNumbersLength: number;
  gameStatus: GameStatus;
  isShuffling: boolean;
  shuffleSpeedMs: number;
  setShuffleSpeedMs: React.Dispatch<React.SetStateAction<number>>;
  shuffleNumbers: () => void;
  autoCall: boolean;
  setAutoCall: React.Dispatch<React.SetStateAction<boolean>>;
  showRadialControls: boolean;
  setShowRadialControls: React.Dispatch<React.SetStateAction<boolean>>;
  isStoppingGame: boolean;
  isCallingNumber: boolean;
  isCheckingCartela: boolean;
  isStartingGame: boolean;
  callRandomNumber: () => Promise<void>;
  startGame: () => Promise<void>;
}

export const FullscreenControls: React.FC<FullscreenControlsProps> = ({
  isFullscreen,
  showFullscreenHud,
  theme,
  calledNumbersLength,
  gameStatus,
  isShuffling,
  shuffleSpeedMs,
  setShuffleSpeedMs,
  shuffleNumbers,
  autoCall,
  setAutoCall,
  showRadialControls,
  setShowRadialControls,
  isStoppingGame,
  isCallingNumber,
  isCheckingCartela,
  isStartingGame,
  callRandomNumber,
  startGame,
}) => {
  if (!isFullscreen) return null;

  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-1150 flex flex-col items-end gap-3 sm:right-7 sm:bottom-7">
      <AnimatePresence>
        {showFullscreenHud && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${theme === "dark" ? "border border-slate-500/50 bg-slate-900/70 text-slate-100" : "border border-slate-300 bg-white/95 text-slate-700"}`}
          >
            Heat {Math.min(100, Math.round((calledNumbersLength / 75) * 100))}%
          </motion.div>
        )}
        {showFullscreenHud && gameStatus === "pending" && isShuffling && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`pointer-events-auto rounded-xl px-3 py-2 text-xs backdrop-blur ${theme === "dark" ? "border border-slate-500/50 bg-slate-900/70 text-slate-100" : "border border-slate-300 bg-white/95 text-slate-700"}`}
          >
            <ShuffleSpeedPresets
              value={shuffleSpeedMs}
              onChange={setShuffleSpeedMs}
              theme={theme}
              compact
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFullscreenHud ? (
          <motion.div
            key="expanded-controls"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto flex items-center gap-2"
          >
            <button
              type="button"
              onClick={shuffleNumbers}
              disabled={gameStatus !== "pending"}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-55 ${isShuffling ? "bg-amber-500 text-slate-900 hover:bg-amber-400" : theme === "dark" ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
              title={isShuffling ? "Stop shuffling" : "Shuffle"}
              aria-label={isShuffling ? "Stop shuffling" : "Shuffle"}
            >
              <Shuffle
                className={`h-5 w-5 ${isShuffling ? "animate-spin" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => {
                if (gameStatus === "active") {
                  setAutoCall((prev) => !prev);
                }
              }}
              disabled={gameStatus !== "active" || calledNumbersLength >= 75}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-55 ${
                autoCall
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : theme === "dark"
                    ? "bg-slate-700 text-white hover:bg-slate-600"
                    : "bg-slate-200 text-slate-900 hover:bg-slate-300"
              }`}
              title="Auto Call"
              aria-label="Auto Call"
            >
              <Play className="h-5 w-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="radial-controls"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-auto relative flex items-center justify-end"
          >
            <AnimatePresence>
              {showRadialControls && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
                    animate={{ opacity: 1, x: -58, y: -8, scale: 1 }}
                    exit={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    type="button"
                    onClick={shuffleNumbers}
                    disabled={gameStatus !== "pending"}
                    className={`absolute inline-flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition disabled:opacity-55 ${isShuffling ? "bg-amber-500 text-slate-900 hover:bg-amber-400" : theme === "dark" ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
                    title={isShuffling ? "Stop shuffling" : "Shuffle"}
                    aria-label={isShuffling ? "Stop shuffling" : "Shuffle"}
                  >
                    <Shuffle
                      className={`h-4 w-4 ${isShuffling ? "animate-spin" : ""}`}
                    />
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
                    animate={{ opacity: 1, x: -8, y: -58, scale: 1 }}
                    exit={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    type="button"
                    onClick={() => {
                      if (gameStatus === "active") {
                        setAutoCall((prev) => !prev);
                      }
                    }}
                    disabled={
                      gameStatus !== "active" || calledNumbersLength >= 75
                    }
                    className={`absolute inline-flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition disabled:opacity-55 ${
                      autoCall
                        ? "bg-emerald-600 hover:bg-emerald-500"
                        : theme === "dark"
                          ? "bg-slate-700 text-white hover:bg-slate-600"
                          : "bg-slate-200 text-slate-900 hover:bg-slate-300"
                    }`}
                    title="Auto Call"
                    aria-label="Auto Call"
                  >
                    <Play className="h-4 w-4" />
                  </motion.button>
                </>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setShowRadialControls((prev) => !prev)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition ${theme === "dark" ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
              title="More controls"
              aria-label="More controls"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (gameStatus === "active") {
              void callRandomNumber();
            } else if (gameStatus === "pending") {
              void startGame();
            }
          }}
          disabled={
            isCallingNumber ||
            isCheckingCartela ||
            isStartingGame ||
            isStoppingGame ||
            calledNumbersLength >= 75 ||
            gameStatus === "completed" ||
            gameStatus === "cancelled"
          }
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.75)] transition hover:scale-105 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          title={gameStatus === "pending" ? "Start game" : "Call number"}
          aria-label={gameStatus === "pending" ? "Start game" : "Call number"}
        >
          {gameStatus === "pending" ? (
            <Play className="h-8 w-8" />
          ) : (
            <span className="text-xs font-black tracking-wider">CALL</span>
          )}
        </button>
      </div>
    </div>
  );
};
