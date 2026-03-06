export interface PlaygroundGameConfig {
  game: string;
  betBirr: string;
  numPlayers: string;
  winBirr: string;
  selectedPatterns: number[];
  playMode?: "online" | "offline";
  backendStatus?: "pending" | "active" | "completed" | "cancelled";
  gameCode?: string;
  cartelaNumbers?: string[];
  cartelaData?: number[][];
  drawSequence?: number[];
  cartellaStatuses?: Record<string, "active" | "banned" | "winner">;
}

export interface PlaygroundProps {
  gameConfig?: PlaygroundGameConfig | null;
  onStartNewGame?: () => void;
  onGameStateChange?: (isActive: boolean) => void;
  onCartelaRemoved?: (cartelaNumber: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export type GameStatus = "pending" | "active" | "completed" | "cancelled";

export interface WinnerCelebration {
  cartela: string;
  pattern?: string | null;
  payoutAmount?: string | number | null;
  shopCutAmount?: string | number | null;
}

export interface WinnerConfettiPiece {
  id: number;
  startX: number;
  driftX: number;
  rotate: number;
  delay: number;
  duration: number;
  size: number;
  colorClass:
    | "bg-rose-400"
    | "bg-amber-400"
    | "bg-emerald-400"
    | "bg-sky-400"
    | "bg-violet-400";
}
