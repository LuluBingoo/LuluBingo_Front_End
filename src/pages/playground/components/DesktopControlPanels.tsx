import React from "react";
import { Check, Eye, Loader2, Pause, Play, Shuffle, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { formatCurrency } from "../../../services/settings";
import { DisplayGameStatus } from "../types";
import { ShuffleSpeedPresets } from "./ShuffleSpeedPresets";

interface DesktopControlPanelsProps {
  isFullscreen: boolean;
  gameStatus: DisplayGameStatus;
  currentCalledNumber: string;
  displayCurrentNumber: () => void;
  callRandomNumber: () => Promise<void>;
  calledNumbersLength: number;
  isCallingNumber: boolean;
  isStoppingGame: boolean;
  closeGameWithoutWinner: () => Promise<void>;
  shuffleNumbers: () => void;
  isShuffling: boolean;
  isStartingGame: boolean;
  startGame: () => Promise<void>;
  onStartNewGame?: () => void;
  autoCall: boolean;
  onToggleAutoCall: (nextValue?: boolean) => void;
  isPaused: boolean;
  togglePauseGame: () => void;
  autoCallTimer: number;
  t: (key: string) => string;
  shuffleSpeedMs: number;
  setShuffleSpeedMs: React.Dispatch<React.SetStateAction<number>>;
  theme: "light" | "dark";
  openCartelaModal: () => void;
  isGameActive: boolean;
  cartelaInput: string;
  setCartelaInput: React.Dispatch<React.SetStateAction<string>>;
  viewCartela: () => void;
  checkCartela: () => Promise<void>;
  isCheckingCartela: boolean;
  activeCartelasLength: number;
  calculateWinMoney: () => number;
}

export const DesktopControlPanels: React.FC<DesktopControlPanelsProps> = ({
  isFullscreen,
  gameStatus,
  currentCalledNumber,
  displayCurrentNumber,
  callRandomNumber,
  calledNumbersLength,
  isCallingNumber,
  isStoppingGame,
  closeGameWithoutWinner,
  shuffleNumbers,
  isShuffling,
  isStartingGame,
  startGame,
  onStartNewGame,
  autoCall,
  onToggleAutoCall,
  isPaused,
  togglePauseGame,
  autoCallTimer,
  t,
  shuffleSpeedMs,
  setShuffleSpeedMs,
  theme,
  openCartelaModal,
  isGameActive,
  cartelaInput,
  setCartelaInput,
  viewCartela,
  checkCartela,
  isCheckingCartela,
  activeCartelasLength,
  calculateWinMoney,
}) => {
  if (isFullscreen) return null;

  const isLiveGame = gameStatus === "active" || gameStatus === "paused";

  const controlMode =
    gameStatus === "active" || gameStatus === "paused"
      ? "active"
      : gameStatus === "pending"
        ? "pending"
        : "completed";

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Game Controls
        </h3>

        <div className="space-y-2">
          <motion.div
            key={controlMode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-2"
          >
            {isLiveGame ? (
              <>
                {isPaused && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-center text-sm font-semibold text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                    Game Paused
                  </div>
                )}

                <Button
                  className="h-10 w-full"
                  onClick={displayCurrentNumber}
                  variant="outline"
                >
                  {currentCalledNumber || "Display Number"}
                </Button>

                <Button
                  className="h-10 w-full bg-red-700 text-white hover:bg-red-800"
                  onClick={callRandomNumber}
                  disabled={
                    autoCall ||
                    isPaused ||
                    calledNumbersLength >= 75 ||
                    isCallingNumber ||
                    isStoppingGame ||
                    isCheckingCartela
                  }
                >
                  {isPaused
                    ? "Paused"
                    : autoCall
                      ? "Auto Calling..."
                      : isCallingNumber
                        ? "Calling..."
                        : t("playground.callNumber")}
                </Button>

                <Button
                  className="h-10 w-full"
                  onClick={togglePauseGame}
                  variant={isPaused ? "default" : "outline"}
                  disabled={isStoppingGame || isCheckingCartela}
                >
                  {isPaused ? (
                    <>
                      <Play className="mr-1 h-4 w-4" /> Resume Game
                    </>
                  ) : (
                    <>
                      <Pause className="mr-1 h-4 w-4" /> Pause Game
                    </>
                  )}
                </Button>

                <Button
                  className="h-10 w-full text-black dark:text-white"
                  onClick={closeGameWithoutWinner}
                  variant="destructive"
                  disabled={
                    isStoppingGame || isCallingNumber || isCheckingCartela
                  }
                >
                  <X className="mr-1 h-4 w-4" />
                  {isStoppingGame ? "Closing..." : "Close Without Winner"}
                </Button>
              </>
            ) : gameStatus === "pending" ? (
              <>
                <Button
                  className="h-10 w-full"
                  onClick={shuffleNumbers}
                  variant="outline"
                  disabled={isStartingGame}
                >
                  <Shuffle
                    className={`mr-1 h-4 w-4 ${isShuffling ? "animate-spin" : ""}`}
                  />
                  {isShuffling ? "Stop Shuffling" : "Shuffle"}
                </Button>
                {isShuffling && (
                  <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                    <ShuffleSpeedPresets
                      value={shuffleSpeedMs}
                      onChange={setShuffleSpeedMs}
                      theme={theme}
                    />
                  </div>
                )}
                <Button
                  className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={startGame}
                  disabled={isStartingGame || isStoppingGame}
                >
                  <Play className="mr-1 h-4 w-4" />
                  {isStartingGame ? "Starting..." : "Start Game"}
                </Button>
              </>
            ) : (
              <Button
                className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={onStartNewGame}
              >
                <Play className="mr-1 h-4 w-4" />
                {t("playground.startNewGame")}
              </Button>
            )}
          </motion.div>

          {isLiveGame && (
            <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {t("playground.autoCall")}
                  </p>
                  <span className="mt-1 block text-xs text-slate-500">
                    {isPaused
                      ? "Paused"
                      : autoCall
                        ? `Next in ${autoCallTimer} ${t("playground.seconds")}`
                        : "Tap to enable automatic calling"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleAutoCall(!autoCall)}
                  disabled={
                    calledNumbersLength >= 75 ||
                    isCheckingCartela ||
                    gameStatus !== "active" ||
                    isPaused
                  }
                  className={`relative inline-flex h-8 w-16 items-center rounded-full border transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                    autoCall
                      ? "border-emerald-400 bg-linear-to-r from-emerald-500 to-emerald-600"
                      : "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
                  }`}
                  aria-label={t("playground.autoCall")}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      autoCall ? "translate-x-9" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    autoCall
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {autoCall ? "On" : "Off"}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("playground.cartelaTools")}
        </h3>

        <Button
          className="h-10 w-full bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={openCartelaModal}
          disabled={!isGameActive}
        >
          <Eye className="mr-1 h-4 w-4" /> {t("playground.viewAllCartelas")}
        </Button>

        <div className="relative py-1 text-center text-xs uppercase tracking-wide text-slate-400">
          <span className="bg-white px-2 dark:bg-slate-900">
            {t("playground.orEnterSpecific")}
          </span>
          <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-slate-200 dark:bg-slate-700" />
        </div>

        <Input
          placeholder={t("playground.cartelaPlaceholderDetailed")}
          value={cartelaInput}
          onChange={(e) => setCartelaInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") viewCartela();
          }}
          disabled={!isGameActive}
        />

        <div className="grid grid-cols-2 gap-2">
          <Button
            className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={checkCartela}
            disabled={!isGameActive || isCheckingCartela}
          >
            {isCheckingCartela ? (
              <>
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Check className="mr-1 h-4 w-4" /> {t("playground.check")}
              </>
            )}
          </Button>
          <Button
            className="h-10 w-full"
            onClick={viewCartela}
            variant="outline"
            disabled={!isGameActive}
          >
            <Eye className="mr-1 h-4 w-4" /> {t("playground.view")}
          </Button>
        </div>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {activeCartelasLength
            ? `${activeCartelasLength} ${t("playground.cartelasInGame")}`
            : t("playground.noCartelasInGame")}
        </div>
      </Card>

      <Card className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-4 dark:border-emerald-700/50 dark:from-emerald-900/20 dark:to-slate-900">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          {t("playground.winMoney")}
        </h3>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-black leading-none text-emerald-700 dark:text-emerald-300">
            {formatCurrency(calculateWinMoney())}
          </span>
        </div>
      </Card>
    </div>
  );
};
