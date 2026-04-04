import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Trophy, X } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { formatCurrency } from "../../../services/settings";
import {
  PlaygroundGameConfig,
  WinnerCelebration,
  WinnerConfettiPiece,
} from "../types";

interface WinnerCelebrationModalProps {
  winnerCelebration: WinnerCelebration | null;
  winnerConfetti: WinnerConfettiPiece[];
  currentGameConfig?: PlaygroundGameConfig | null;
  activeCartelasCount: number;
  calledNumbersCount: number;
  calledNumbers: number[];
  winnerCartelaData?: number[];
  showWinnerLogButton: boolean;
  calculateWinMoney: () => number;
  onClose: () => void;
  onViewGameLog: () => void;
}

export const WinnerCelebrationModal: React.FC<WinnerCelebrationModalProps> = ({
  winnerCelebration,
  winnerConfetti,
  currentGameConfig,
  activeCartelasCount,
  calledNumbersCount,
  calledNumbers,
  winnerCartelaData = [],
  showWinnerLogButton,
  calculateWinMoney,
  onClose,
  onViewGameLog,
}) => {
  const [showHow, setShowHow] = React.useState(false);

  React.useEffect(() => {
    setShowHow(false);
  }, [winnerCelebration?.cartela, winnerCelebration?.pattern]);

  const winningLineIndices = React.useMemo<number[]>(() => {
    if (
      !winnerCelebration?.pattern ||
      !winnerCartelaData ||
      winnerCartelaData.length !== 25
    ) {
      return [];
    }

    const isMarked = (index: number) => {
      const value = winnerCartelaData[index];
      return value === 0 || calledNumbers.includes(value);
    };

    if (winnerCelebration.pattern === "diagonal") {
      const mainDiagonal = [0, 6, 12, 18, 24];
      if (mainDiagonal.every((index) => isMarked(index))) {
        return mainDiagonal;
      }

      const antiDiagonal = [4, 8, 12, 16, 20];
      if (antiDiagonal.every((index) => isMarked(index))) {
        return antiDiagonal;
      }

      return [];
    }

    for (let col = 0; col < 5; col++) {
      const columnIndices = [
        col * 5,
        col * 5 + 1,
        col * 5 + 2,
        col * 5 + 3,
        col * 5 + 4,
      ];

      if (columnIndices.every((index) => isMarked(index))) {
        return columnIndices;
      }
    }

    for (let row = 0; row < 5; row++) {
      const rowIndices = [row, 5 + row, 10 + row, 15 + row, 20 + row];

      if (rowIndices.every((index) => isMarked(index))) {
        return rowIndices;
      }
    }

    return [];
  }, [winnerCelebration?.pattern, winnerCartelaData, calledNumbers]);

  const canShowHow =
    Boolean(winnerCelebration?.pattern) &&
    winnerCartelaData.length === 25 &&
    winningLineIndices.length > 0;

  const patternLabel = React.useMemo(() => {
    if (winnerCelebration?.pattern === "diagonal") {
      return "Winning Diagonal";
    }

    if (winningLineIndices.length === 5) {
      const sorted = [...winningLineIndices].sort((a, b) => a - b);
      const isColumn = sorted
        .slice(1)
        .every((value, index) => value - sorted[index] === 1);
      if (isColumn) {
        return "Winning Column";
      }
    }

    return "Winning Row";
  }, [winnerCelebration?.pattern, winningLineIndices]);

  return (
    <AnimatePresence>
      {winnerCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-1400 flex items-center justify-center bg-black/55 px-4"
        >
          <motion.div
            initial={{ scale: 0.6, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 14 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-200 bg-linear-to-br from-amber-100 via-orange-100 to-yellow-100 p-6 text-center shadow-2xl sm:p-10"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-30 h-9 w-9 rounded-full bg-white/80 text-slate-700 hover:bg-white"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="pointer-events-none absolute inset-0">
              {winnerConfetti.slice(0, 20).map((piece) => (
                <motion.div
                  key={`burst-${piece.id}`}
                  className={`absolute top-1/2 left-1/2 rounded-sm ${piece.colorClass}`}
                  style={{
                    width: `${piece.size + 1}px`,
                    height: `${Math.max(5, piece.size)}px`,
                  }}
                  initial={{ opacity: 0, y: 0, x: 0, rotate: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [0, -20 - Math.abs(piece.driftX) * 0.08],
                    x: [0, piece.driftX * 0.32],
                    rotate: [0, piece.rotate * 0.45],
                    scale: [0.6, 1, 0.9],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: piece.delay * 0.25,
                    ease: "easeOut",
                  }}
                />
              ))}
              {winnerConfetti.map((piece) => (
                <motion.div
                  key={piece.id}
                  className={`absolute -top-4.5 left-1/2 rounded-sm ${piece.colorClass}`}
                  style={{
                    width: `${piece.size}px`,
                    height: `${Math.max(5, piece.size - 1)}px`,
                    marginLeft: `${piece.startX - 50}%`,
                  }}
                  initial={{ opacity: 0, y: -25, x: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0.9, 0],
                    y: [0, 45, 130, 250, 390],
                    x: [0, piece.driftX * 0.35, piece.driftX],
                    rotate: [0, piece.rotate],
                  }}
                  transition={{
                    duration: piece.duration,
                    delay: piece.delay,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg sm:h-24 sm:w-24">
              <Trophy className="h-11 w-11 sm:h-14 sm:w-14" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 1.1, repeat: 2 }}
              className="text-4xl font-black tracking-tight text-amber-700 sm:text-6xl"
            >
              BINGO!
            </motion.div>
            <div className="mt-3 text-xl font-bold text-slate-900 sm:text-3xl">
              Cartela {winnerCelebration.cartela} WINS
            </div>
            {winnerCelebration.pattern && (
              <div className="mt-2 text-sm font-semibold uppercase tracking-wider text-amber-700 sm:text-base">
                Pattern: {winnerCelebration.pattern}
              </div>
            )}
            <div className="mt-4 h-px w-full bg-amber-300/80" />
            <div className="mt-4 rounded-2xl border border-amber-200/90 bg-white/70 p-4 text-left shadow-inner backdrop-blur-sm sm:p-5">
              <div className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-700">
                Game Summary
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm text-slate-800 sm:grid-cols-2 sm:gap-3 sm:text-base">
                <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50/80 px-3 py-2">
                  <span className="font-semibold text-slate-600">
                    Game Code
                  </span>
                  <span className="font-bold text-slate-900">
                    {currentGameConfig?.gameCode ||
                      currentGameConfig?.game ||
                      "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50/80 px-3 py-2">
                  <span className="font-semibold text-slate-600">
                    Winner Cartela
                  </span>
                  <span className="font-bold text-slate-900">
                    {winnerCelebration.cartela}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50/80 px-3 py-2">
                  <span className="font-semibold text-slate-600">
                    Total Players
                  </span>
                  <span className="font-bold text-slate-900">
                    {Number.parseInt(
                      currentGameConfig?.numPlayers || "0",
                      10,
                    ) || activeCartelasCount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50/80 px-3 py-2">
                  <span className="font-semibold text-slate-600">
                    Bet / Player
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(currentGameConfig?.betBirr || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50/80 px-3 py-2">
                  <span className="font-semibold text-slate-600">
                    Total Pool
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(
                      (Number.parseFloat(currentGameConfig?.betBirr || "0") ||
                        0) *
                        (Number.parseInt(
                          currentGameConfig?.numPlayers || "0",
                          10,
                        ) || activeCartelasCount),
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-emerald-100/90 px-3 py-2">
                  <span className="font-semibold text-emerald-700">
                    Winner Payout
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    {formatCurrency(
                      winnerCelebration.payoutAmount ??
                        currentGameConfig?.winBirr ??
                        calculateWinMoney(),
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50/80 px-3 py-2">
                  <span className="font-semibold text-slate-600">Shop Cut</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(winnerCelebration.shopCutAmount ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50/80 px-3 py-2">
                  <span className="font-semibold text-slate-600">
                    Numbers Called
                  </span>
                  <span className="font-bold text-slate-900">
                    {calledNumbersCount}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm font-medium text-slate-700 sm:text-base">
              🎉 Congratulations to the winner! Close this card using the X
              button.
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {canShowHow && (
                <Button
                  variant="outline"
                  onClick={() => setShowHow((prev) => !prev)}
                  className="border-amber-500 text-amber-800 hover:bg-amber-100"
                >
                  {showHow ? "Hide How" : "Show How"}
                </Button>
              )}

              {showWinnerLogButton && (
                <Button
                  onClick={onViewGameLog}
                  className="bg-amber-600 text-white hover:bg-amber-700"
                >
                  View Game Log
                </Button>
              )}
            </div>

            <AnimatePresence>
              {showHow && canShowHow && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-4 rounded-2xl border border-amber-300 bg-white/75 p-4 text-left shadow-inner backdrop-blur-sm"
                >
                  <div className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-700">
                    {patternLabel}
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      {["B", "I", "N", "G", "O"].map((letter) => (
                        <div
                          key={letter}
                          className="rounded-md bg-amber-600 py-1.5 text-center text-xs font-black tracking-wide text-white"
                        >
                          {letter}
                        </div>
                      ))}
                    </div>

                    {Array.from({ length: 5 }, (_, row) => (
                      <div
                        key={`how-row-${row}`}
                        className="grid grid-cols-5 gap-2"
                      >
                        {Array.from({ length: 5 }, (_, col) => {
                          const index = col * 5 + row;
                          const value = winnerCartelaData[index];
                          const isMarked =
                            value === 0 || calledNumbers.includes(value);
                          const isWinningCell =
                            winningLineIndices.includes(index);

                          return (
                            <motion.div
                              key={`how-cell-${row}-${col}`}
                              className={`relative flex h-12 items-center justify-center rounded-md border text-sm font-bold ${
                                isWinningCell
                                  ? "border-amber-500 bg-linear-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-900 shadow-[0_0_18px_rgba(245,158,11,0.55)]"
                                  : isMarked
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-slate-300 bg-white text-slate-900"
                              }`}
                              animate={
                                isWinningCell
                                  ? { scale: [1, 1.06, 1], y: [0, -1, 0] }
                                  : { scale: 1, y: 0 }
                              }
                              transition={{
                                duration: 0.75,
                                repeat: isWinningCell ? Infinity : 0,
                                repeatDelay: 0.35,
                                delay: isWinningCell ? (row + col) * 0.03 : 0,
                              }}
                            >
                              <span>{value === 0 ? "FREE" : value}</span>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
