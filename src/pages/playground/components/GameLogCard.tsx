import React from "react";
import { Card } from "../../../components/ui/card";
import { formatCurrency } from "../../../services/settings";
import { Game } from "../../../services/types";
import { GameStatus, PlaygroundGameConfig } from "../types";

interface GameLogCardProps {
  isFullscreen: boolean;
  gameStatus: GameStatus;
  currentGameConfig?: PlaygroundGameConfig | null;
  restoredGame: Game | null;
  calledNumbersCount: number;
  gameLogRef: React.RefObject<HTMLDivElement | null>;
}

export const GameLogCard: React.FC<GameLogCardProps> = ({
  isFullscreen,
  gameStatus,
  currentGameConfig,
  restoredGame,
  calledNumbersCount,
  gameLogRef,
}) => {
  if (
    isFullscreen ||
    (gameStatus !== "completed" && gameStatus !== "cancelled")
  ) {
    return null;
  }

  return (
    <div ref={gameLogRef}>
      <Card className="space-y-3 border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-800/50 dark:bg-amber-900/10">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          Game Log
        </h4>
        <div className="grid gap-2 text-sm text-slate-700 dark:text-slate-200 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <span className="text-slate-500">Game:</span>{" "}
            <span className="font-semibold">
              {currentGameConfig?.game || "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Status:</span>{" "}
            <span className="font-semibold capitalize">{gameStatus}</span>
          </div>
          <div>
            <span className="text-slate-500">Players:</span>{" "}
            <span className="font-semibold">
              {currentGameConfig?.numPlayers || "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Called Numbers:</span>{" "}
            <span className="font-semibold">{calledNumbersCount}</span>
          </div>
          <div>
            <span className="text-slate-500">Started:</span>{" "}
            <span className="font-semibold">
              {restoredGame?.started_at
                ? new Date(restoredGame.started_at).toLocaleString()
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Ended:</span>{" "}
            <span className="font-semibold">
              {restoredGame?.ended_at
                ? new Date(restoredGame.ended_at).toLocaleString()
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Winners:</span>{" "}
            <span className="font-semibold">
              {restoredGame?.winners?.length
                ? restoredGame.winners
                    .map((index) => `Cartela ${index}`)
                    .join(", ")
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Pattern:</span>{" "}
            <span className="font-semibold">
              {restoredGame?.winning_pattern || "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Total Pool:</span>{" "}
            <span className="font-semibold">
              {restoredGame?.total_pool
                ? formatCurrency(restoredGame.total_pool)
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Payout:</span>{" "}
            <span className="font-semibold">
              {restoredGame?.payout_amount
                ? formatCurrency(restoredGame.payout_amount)
                : "-"}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Shop Cut:</span>{" "}
            <span className="font-semibold">
              {restoredGame?.shop_cut_amount
                ? formatCurrency(restoredGame.shop_cut_amount)
                : "-"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
