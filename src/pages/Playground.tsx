import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePopup } from "../contexts/PopupContext";
import { CartelaModal } from "../components/Cartela";
import { gamesApi, shopApi } from "../services/api";
import { ApiError } from "../services/api/client";
import { formatCurrency } from "../services/settings";
import { Game, GameClaimResponse } from "../services/types";
import { GameLogCard } from "./playground/components/GameLogCard";
import { OpeningPlaygroundOverlay } from "./playground/components/OpeningPlaygroundOverlay";
import { WinnerCelebrationModal } from "./playground/components/WinnerCelebrationModal";
import { BoardArea } from "./playground/components/BoardArea";
import { FullscreenControls } from "./playground/components/FullscreenControls";
import { DesktopControlPanels } from "./playground/components/DesktopControlPanels";
import { StatusOverlays } from "./playground/components/StatusOverlays";
import { pickRandomBingoIllustration } from "../assets/illustrations";
import {
  getOfflineCartellaBoard,
  normalizeCartellaBoard,
} from "../data/offlineCartellas";
import {
  DisplayGameStatus,
  PlaygroundGameConfig,
  GameStatus,
  PlaygroundProps,
  WinnerCelebration,
  WinnerConfettiPiece,
} from "./playground/types";
import audioMap from "../audioMap";

const parseCartelaNumber = (value: string | number): number | null => {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parseMoneyAmount = (value: unknown, fallback = 0): number => {
  const parsed = Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const Playground: React.FC<PlaygroundProps> = ({
  gameConfig,
  onStartNewGame,
  onGameStateChange,
  onCartelaRemoved,
  onFullscreenChange,
  onWinnerCelebrationVisibilityChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const popup = usePopup();
  const [pageIllustration] = useState(() => pickRandomBingoIllustration());
  const [resolvedGameConfig, setResolvedGameConfig] = useState(gameConfig);
  const [restoredGame, setRestoredGame] = useState<Game | null>(null);
  const [isRestoringGame, setIsRestoringGame] = useState(false);
  const [isOpeningPlayground, setIsOpeningPlayground] = useState(false);
  const resumeGameCode = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (
      params.get("game") ||
      params.get("game_id") ||
      params.get("gameCode") ||
      params.get("code") ||
      params.get("id") ||
      ""
    ).trim();
  }, [location.search]);

  useEffect(() => {
    if (!resumeGameCode) {
      return;
    }

    const currentParams = new URLSearchParams(location.search);
    const canonicalParams = new URLSearchParams(currentParams);

    canonicalParams.delete("game_id");
    canonicalParams.delete("gameCode");
    canonicalParams.delete("code");
    canonicalParams.delete("id");
    canonicalParams.set("game", resumeGameCode);

    if (currentParams.toString() === canonicalParams.toString()) {
      return;
    }

    navigate(
      {
        pathname: location.pathname,
        search: `?${canonicalParams.toString()}`,
      },
      { replace: true },
    );
  }, [resumeGameCode, location.pathname, location.search, navigate]);

  const currentGameConfig = resolvedGameConfig ?? gameConfig;
  const playModeLabel =
    currentGameConfig?.playMode === "offline" ? "Offline" : "Online";
  const playModeBadgeClass =
    currentGameConfig?.playMode === "offline"
      ? "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      : "border-sky-300 bg-sky-100 text-sky-800 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
  const resolvedCartelaNumbers = React.useMemo(() => {
    const explicitNumbers = currentGameConfig?.cartelaNumbers?.filter(Boolean);
    if (explicitNumbers && explicitNumbers.length > 0) {
      return explicitNumbers;
    }

    const selectedPatternNumbers = currentGameConfig?.selectedPatterns
      ?.filter((value) => Number.isFinite(value) && value > 0)
      .map((value) => String(value));
    if (selectedPatternNumbers && selectedPatternNumbers.length > 0) {
      return selectedPatternNumbers;
    }

    if (
      currentGameConfig?.playMode === "offline" &&
      currentGameConfig?.cartelaData?.length
    ) {
      return Array.from(
        { length: currentGameConfig.cartelaData.length },
        (_, index) => String(index + 1),
      );
    }

    return [] as string[];
  }, [
    currentGameConfig?.cartelaNumbers,
    currentGameConfig?.selectedPatterns,
    currentGameConfig?.playMode,
    currentGameConfig?.cartelaData,
  ]);

  const buildConfigFromGame = React.useCallback(
    (game: Game): PlaygroundGameConfig => {
      const fallbackCartelaNumbers = Array.from(
        game.assigned_cartella_numbers?.length
          ? game.assigned_cartella_numbers
          : Array.from(
              { length: game.cartella_numbers?.length || 0 },
              (_, index) => index + 1,
            ),
        (value) => String(value),
      );

      return {
        game: game.game_code,
        gameCode: game.game_code,
        betBirr: game.bet_amount,
        numPlayers: String(game.num_players),
        winBirr: game.win_amount,
        selectedPatterns: [],
        playMode: game.game_mode === "shop_offline" ? "offline" : "online",
        cartelaNumbers: fallbackCartelaNumbers,
        cartellaNumberMap: game.cartella_number_map || {},
        cartelaData: game.cartella_numbers,
        drawSequence: game.draw_sequence,
        cartellaStatuses: game.cartella_statuses || {},
        backendStatus: game.status,
      };
    },
    [],
  );

  const getConfiguredAutoCallSeconds = React.useCallback(() => {
    const parsed = Number.parseInt(
      localStorage.getItem("autoCallSeconds") || "5",
      10,
    );
    // Sub-3 second cadence is too aggressive for full voice playback.
    return Number.isFinite(parsed) && parsed >= 3 ? parsed : 5;
  }, []);

  // State for called numbers & auto call
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [autoCall, setAutoCall] = useState(false);
  const [autoCallTimer, setAutoCallTimer] = useState(() =>
    getConfiguredAutoCallSeconds(),
  );
  const [currentCalledNumber, setCurrentCalledNumber] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<GameStatus>("pending");
  const [isPaused, setIsPaused] = useState(false);
  const [isCallingNumber, setIsCallingNumber] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);
  const [isStoppingGame, setIsStoppingGame] = useState(false);

  // State for cartela
  const [cartelaInput, setCartelaInput] = useState("");
  const [showCartelaModal, setShowCartelaModal] = useState(false);
  const [selectedCartela, setSelectedCartela] = useState<string>("");
  const [cartelaError, setCartelaError] = useState("");
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [addPlayerName, setAddPlayerName] = useState("");
  const [addPlayerCartellas, setAddPlayerCartellas] = useState<number[]>([]);
  const [addPlayerPage, setAddPlayerPage] = useState<1 | 2>(1);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  // Local state for active cartelas (can be removed)
  const [activeCartelas, setActiveCartelas] = useState<string[]>([]);
  const [serverCartelaOrder, setServerCartelaOrder] = useState<string[]>([]);
  const [cartellaStatuses, setCartellaStatuses] = useState<
    Record<string, "active" | "banned" | "winner">
  >({});
  const [drawSequence, setDrawSequence] = useState<number[]>([]);
  const [drawCursor, setDrawCursor] = useState(0);

  // State for Bingo board (numbers shuffled per column)
  const [bingoRows, setBingoRows] = useState({
    B: Array.from({ length: 15 }, (_, i) => i + 1),
    I: Array.from({ length: 15 }, (_, i) => i + 16),
    N: Array.from({ length: 15 }, (_, i) => i + 31),
    G: Array.from({ length: 15 }, (_, i) => i + 46),
    O: Array.from({ length: 15 }, (_, i) => i + 61),
  });

  const [isGameActive, setIsGameActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTogglingFullscreen, setIsTogglingFullscreen] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleSpeedMs, setShuffleSpeedMs] = useState(230);
  const [isCheckingCartela, setIsCheckingCartela] = useState(false);
  const [showBallPopup, setShowBallPopup] = useState(false);
  const [ballPopupLabel, setBallPopupLabel] = useState("");
  const [isAnnouncingNumber, setIsAnnouncingNumber] = useState(false);
  const [shuffleCycle, setShuffleCycle] = useState(0);
  const [winnerCelebration, setWinnerCelebration] =
    useState<WinnerCelebration | null>(null);
  const [showWinnerLogButton, setShowWinnerLogButton] = useState(false);
  const [callStreak, setCallStreak] = useState(0);
  const [streakBoost, setStreakBoost] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showFullscreenHud, setShowFullscreenHud] = useState(true);
  const [showRadialControls, setShowRadialControls] = useState(false);
  const boardContainerRef = React.useRef<HTMLDivElement | null>(null);
  const gameLogRef = React.useRef<HTMLDivElement | null>(null);
  const syncInFlightRef = React.useRef(false);
  const lastSyncErrorLogRef = React.useRef(0);
  const gameStatusRef = React.useRef<GameStatus>("pending");
  const initializedGameCodeRef = React.useRef<string | null>(null);
  const startTransitionUntilRef = React.useRef(0);
  const lastCallTimeRef = React.useRef(0);
  const lastAnimatedCalledRef = React.useRef<number | null>(null);
  const fullscreenHudTimeoutRef = React.useRef<number | null>(null);
  const callInFlightRef = React.useRef(false);
  const autoCallFailureCountRef = React.useRef(0);
  const lastAutoCallWarningRef = React.useRef(0);
  const winnerClaimInFlightRef = React.useRef(false);
  const activeNumberVoiceIdRef = React.useRef(0);
  const announcementQueueRef = React.useRef<Promise<void>>(Promise.resolve());
  const activeAnnouncementNumberRef = React.useRef<number | null>(null);
  const latestCallCursorRef = React.useRef(0);
  const latestQueuedAnnouncementCursorRef = React.useRef(0);
  const voiceAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const effectAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const isWinnerModalOpen = Boolean(winnerCelebration);

  const canAddPlayerWhilePaused = gameStatus === "active" && isPaused;
  const addPlayerPageRange = React.useMemo(() => {
    const start = addPlayerPage === 1 ? 1 : 101;
    return Array.from({ length: 100 }, (_, idx) => start + idx);
  }, [addPlayerPage]);

  const takenCartellaNumbers = React.useMemo(() => {
    const taken = new Set<number>();

    for (const rawValue of [
      ...serverCartelaOrder,
      ...activeCartelas,
      ...resolvedCartelaNumbers,
    ]) {
      const parsed = parseCartelaNumber(rawValue);
      if (parsed !== null) {
        taken.add(parsed);
      }
    }

    return taken;
  }, [serverCartelaOrder, activeCartelas, resolvedCartelaNumbers]);

  const nextLatePlayerNumber = React.useMemo(() => {
    const usedNumbers = new Set<number>();
    const players = restoredGame?.shop_players_data || [];

    for (const player of players) {
      const raw = String((player as any)?.player_name || "");
      const match = raw.match(/(\d+)\s*$/);
      if (!match) continue;
      const parsed = Number.parseInt(match[1], 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        usedNumbers.add(parsed);
      }
    }

    let candidate = 1;
    while (usedNumbers.has(candidate)) {
      candidate += 1;
    }
    return candidate;
  }, [restoredGame?.shop_players_data]);

  useEffect(() => {
    onWinnerCelebrationVisibilityChange?.(isWinnerModalOpen);

    return () => {
      if (isWinnerModalOpen) {
        onWinnerCelebrationVisibilityChange?.(false);
      }
    };
  }, [isWinnerModalOpen, onWinnerCelebrationVisibilityChange]);

  const effectiveGameStatus: DisplayGameStatus =
    isPaused && gameStatus === "active" ? "paused" : gameStatus;
  const statusLabel =
    effectiveGameStatus === "paused"
      ? "Paused"
      : `${effectiveGameStatus.charAt(0).toUpperCase()}${effectiveGameStatus.slice(1)}`;
  const statusBadgeClass =
    effectiveGameStatus === "active"
      ? "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
      : effectiveGameStatus === "paused"
        ? "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
        : effectiveGameStatus === "pending"
          ? "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-200"
          : effectiveGameStatus === "completed"
            ? "border-cyan-300 bg-cyan-100 text-cyan-800 dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
            : "border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300";

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    if (gameConfig) {
      setResolvedGameConfig(gameConfig);
    }
  }, [gameConfig]);

  useEffect(() => {
    if (!resumeGameCode) {
      return;
    }

    let isMounted = true;

    const restoreGame = async () => {
      setIsRestoringGame(true);
      try {
        const [game, state] = await Promise.all([
          gamesApi.getGame(resumeGameCode),
          gamesApi.getGameState(resumeGameCode),
        ]);
        if (!isMounted) return;

        const config = buildConfigFromGame(game);
        config.backendStatus = state.status;

        setResolvedGameConfig(config);
        setRestoredGame(game);
        setGameStatus(state.status as any);
        setIsPaused(Boolean(state.is_paused));
        setIsGameActive(
          state.status === "active" || state.status === "pending",
        );
        setActiveCartelas(config.cartelaNumbers || []);
        setServerCartelaOrder(config.cartelaNumbers || []);
        setCartellaStatuses(
          state.cartella_statuses || game.cartella_statuses || {},
        );
        setDrawSequence(game.draw_sequence || []);
        const restoredCursor = resolveCallCursor(
          state.call_cursor,
          state.called_numbers,
        );
        latestCallCursorRef.current = restoredCursor;
        latestQueuedAnnouncementCursorRef.current = restoredCursor;
        if (state.current_called_number) {
          lastAnimatedCalledRef.current = state.current_called_number;
        }
        setDrawCursor(restoredCursor);
        setCalledNumbers(state.called_numbers || []);
        setAutoCall(
          state.status === "active" &&
            !state.is_paused &&
            (state.called_numbers?.length || 0) < 75,
        );
        setAutoCallTimer(getConfiguredAutoCallSeconds());

        if (state.current_called_number) {
          const { label: resolvedCurrentLabel } = resolveCalledLabelAndNumber(
            state.current_called_formatted,
            state.current_called_number,
          );
          setCurrentCalledNumber(resolvedCurrentLabel);
        } else {
          setCurrentCalledNumber("");
        }

        onGameStateChange?.(state.status === "active");
      } catch (error) {
        console.error("Failed to restore game", error);
        popup.error(`Could not load game ${resumeGameCode}.`);
      } finally {
        if (isMounted) {
          setIsRestoringGame(false);
        }
      }
    };

    void restoreGame();

    return () => {
      isMounted = false;
    };
  }, [
    resumeGameCode,
    buildConfigFromGame,
    getConfiguredAutoCallSeconds,
    onGameStateChange,
  ]);

  useEffect(() => {
    if (!currentGameConfig || resumeGameCode) {
      return;
    }

    setIsOpeningPlayground(true);
    const timer = window.setTimeout(() => {
      setIsOpeningPlayground(false);
    }, 900);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentGameConfig?.gameCode, resumeGameCode]);

  // Initialize game once per game code to avoid state reset loops
  useEffect(() => {
    if (!currentGameConfig) {
      return;
    }

    const gameCode = currentGameConfig.gameCode || currentGameConfig.game || "";
    if (!gameCode) {
      return;
    }

    if (initializedGameCodeRef.current === gameCode) {
      return;
    }

    initializedGameCodeRef.current = gameCode;

    const status = (currentGameConfig.backendStatus as any) || "pending";
    setGameStatus(status);
    setIsPaused(false);
    setIsGameActive(status === "active" || status === "pending");
    setAutoCall(status === "active");
    setAutoCallTimer(getConfiguredAutoCallSeconds());
    setActiveCartelas(resolvedCartelaNumbers);
    setServerCartelaOrder(resolvedCartelaNumbers);
    setCartellaStatuses(currentGameConfig.cartellaStatuses || {});
    setDrawSequence(currentGameConfig.drawSequence || []);
    setDrawCursor(0);
    onGameStateChange?.(status === "active");
  }, [
    currentGameConfig?.gameCode,
    currentGameConfig?.game,
    getConfiguredAutoCallSeconds,
    resolvedCartelaNumbers,
  ]);

  useEffect(() => {
    setAutoCallTimer(getConfiguredAutoCallSeconds());
  }, [getConfiguredAutoCallSeconds]);

  // Sync activeCartelas with gameConfig changes
  useEffect(() => {
    if (resolvedCartelaNumbers.length > 0) {
      setActiveCartelas(resolvedCartelaNumbers);
      setServerCartelaOrder(resolvedCartelaNumbers);
    }
  }, [resolvedCartelaNumbers]);

  const normalizeCartelaNumber = (value: string | number): number | null => {
    return parseCartelaNumber(value);
  };

  const cartelaDataMap = React.useMemo(() => {
    const numbers =
      (Array.isArray(restoredGame?.cartella_numbers) &&
      restoredGame.cartella_numbers.length > 0
        ? restoredGame.cartella_numbers
        : currentGameConfig?.cartelaData) || [];
    const authoritativeMap =
      restoredGame?.cartella_number_map || currentGameConfig?.cartellaNumberMap;
    const mappedCartelaNumbers =
      authoritativeMap && typeof authoritativeMap === "object"
        ? Object.keys(authoritativeMap)
        : [];
    const sourceCartelaNumbers = Array.from(
      new Set([
        ...mappedCartelaNumbers,
        ...serverCartelaOrder,
        ...activeCartelas,
        ...resolvedCartelaNumbers,
      ]),
    );

    const entries = sourceCartelaNumbers.map((cartelaNumber) => {
      let index = -1;

      const target = normalizeCartelaNumber(cartelaNumber);
      if (
        target !== null &&
        authoritativeMap &&
        typeof authoritativeMap === "object"
      ) {
        for (const [mappedCartelaNumber, mappedIndex] of Object.entries(
          authoritativeMap,
        )) {
          if (normalizeCartelaNumber(mappedCartelaNumber) === target) {
            const parsedMappedIndex = Number(mappedIndex);
            index =
              Number.isInteger(parsedMappedIndex) && parsedMappedIndex >= 0
                ? parsedMappedIndex
                : -1;
            break;
          }
        }
      }

      if (index < 0 && target !== null) {
        index = serverCartelaOrder.findIndex(
          (item) => normalizeCartelaNumber(item) === target,
        );
      }

      if (index < 0 && target !== null) {
        index = activeCartelas.findIndex(
          (item) => normalizeCartelaNumber(item) === target,
        );
      }

      const backendBoard = index >= 0 ? numbers[index] || [] : [];
      const normalizedBackendBoard = normalizeCartellaBoard(backendBoard);
      if (normalizedBackendBoard) {
        return [cartelaNumber, normalizedBackendBoard] as const;
      }

      if (currentGameConfig?.playMode === "offline") {
        const offlineBoard = getOfflineCartellaBoard(cartelaNumber);
        if (offlineBoard) {
          return [cartelaNumber, offlineBoard] as const;
        }
      }

      return [cartelaNumber, []] as const;
    });

    return Object.fromEntries(entries);
  }, [
    currentGameConfig?.cartelaData,
    currentGameConfig?.cartellaNumberMap,
    currentGameConfig?.playMode,
    resolvedCartelaNumbers,
    restoredGame?.cartella_numbers,
    restoredGame?.cartella_number_map,
    activeCartelas,
    serverCartelaOrder,
  ]);

  const findCartelaInList = (value: string, list: string[]): string | null => {
    const target = normalizeCartelaNumber(value);
    if (target === null) return null;

    for (const item of list) {
      if (normalizeCartelaNumber(item) === target) {
        return item;
      }
    }

    return null;
  };

  const getServerCartelaIndex = (cartelaNumber: string) => {
    const target = normalizeCartelaNumber(cartelaNumber);
    if (target === null) {
      return -1;
    }

    const authoritativeMap =
      restoredGame?.cartella_number_map || currentGameConfig?.cartellaNumberMap;
    if (authoritativeMap && typeof authoritativeMap === "object") {
      for (const [mappedCartelaNumber, mappedIndex] of Object.entries(
        authoritativeMap,
      )) {
        if (normalizeCartelaNumber(mappedCartelaNumber) === target) {
          const parsedMappedIndex = Number(mappedIndex);
          return Number.isInteger(parsedMappedIndex) && parsedMappedIndex >= 0
            ? parsedMappedIndex
            : -1;
        }
      }
    }

    const serverIndex = serverCartelaOrder.findIndex(
      (item) => normalizeCartelaNumber(item) === target,
    );
    if (serverIndex >= 0) {
      return serverIndex;
    }

    return activeCartelas.findIndex(
      (item) => normalizeCartelaNumber(item) === target,
    );
  };

  const getCartellaStatusByNumber = (
    cartelaNumber: string,
  ): "active" | "banned" | "winner" | null => {
    const index = getServerCartelaIndex(cartelaNumber);
    if (index < 0) {
      return null;
    }
    return cartellaStatuses[String(index)] || "active";
  };

  useEffect(() => {
    if (gameStatus !== "active") {
      setIsPaused(false);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (!canAddPlayerWhilePaused) {
      setShowAddPlayerModal(false);
    }
  }, [canAddPlayerWhilePaused]);

  // Notify parent when game state changes
  useEffect(() => {
    onGameStateChange?.(isGameActive && (gameStatus === "active" || isPaused));
  }, [isGameActive, gameStatus, isPaused]);

  const mapNumberToLabel = (number: number) => {
    const letter = getNumberLetter(number);
    return `${letter}${number}`;
  };

  const mapLabelToNumber = (label: string) => {
    const match = label.match(/(\d{1,2})$/);
    if (!match) {
      return null;
    }

    const parsed = Number.parseInt(match[1], 10);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 75) {
      return null;
    }

    return parsed;
  };

  const resolveCallCursor = (
    rawCursor?: unknown,
    calledNumbersList?: number[] | null,
  ) => {
    const parsedCursor = Number(rawCursor);
    if (Number.isInteger(parsedCursor) && parsedCursor >= 0) {
      return parsedCursor;
    }

    if (Array.isArray(calledNumbersList)) {
      return calledNumbersList.length;
    }

    return 0;
  };

  const resolveCalledLabelAndNumber = (
    rawLabel?: string | null,
    rawNumber?: number | null,
  ) => {
    const normalizedLabel = String(rawLabel || "").trim();
    const normalizedNumberFromArg =
      typeof rawNumber === "number" && rawNumber >= 1 && rawNumber <= 75
        ? rawNumber
        : null;

    const normalizedMatch = normalizedLabel.match(
      /^([BINGO])[\s_-]?(\d{1,2})$/i,
    );
    const normalizedNumberFromLabel = normalizedMatch
      ? Number.parseInt(normalizedMatch[2], 10)
      : mapLabelToNumber(normalizedLabel);

    const resolvedNumber =
      normalizedNumberFromArg ??
      (typeof normalizedNumberFromLabel === "number" &&
      normalizedNumberFromLabel >= 1 &&
      normalizedNumberFromLabel <= 75
        ? normalizedNumberFromLabel
        : null);

    if (resolvedNumber !== null) {
      return {
        number: resolvedNumber,
        label: mapNumberToLabel(resolvedNumber),
      };
    }

    return {
      number: null,
      label: normalizedLabel,
    };
  };

  const getApiErrorDetail = (error: unknown, fallback: string) => {
    if (error instanceof ApiError) {
      const detail =
        (error.data as any)?.detail || (error.data as any)?.message;
      if (typeof detail === "string" && detail.trim()) {
        return detail;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return fallback;
  };

  const resolveCartelaIndexFromMap = (
    cartelaNumber: string,
    map?: Record<string, number> | null,
  ) => {
    const target = normalizeCartelaNumber(cartelaNumber);
    if (target === null || !map || typeof map !== "object") {
      return -1;
    }

    for (const [mappedCartelaNumber, mappedIndex] of Object.entries(map)) {
      if (normalizeCartelaNumber(mappedCartelaNumber) === target) {
        const parsedMappedIndex = Number(mappedIndex);
        return Number.isInteger(parsedMappedIndex) && parsedMappedIndex >= 0
          ? parsedMappedIndex
          : -1;
      }
    }

    return -1;
  };

  const getClaimContext = async (cartelaNumber: string) => {
    const gameCode = currentGameConfig?.gameCode;
    let calledNumbersForClaim = [...calledNumbers];
    let cartelaIndex = resolveCartelaIndexFromMap(
      cartelaNumber,
      restoredGame?.cartella_number_map || currentGameConfig?.cartellaNumberMap,
    );
    let assignedCartelaNumbers: number[] | undefined;
    let boardCount = 0;

    if (gameCode) {
      try {
        const [state, game] = await Promise.all([
          gamesApi.getGameState(gameCode),
          gamesApi.getGame(gameCode),
        ]);

        const backendCalledNumbers = Array.isArray(state.called_numbers)
          ? state.called_numbers
          : [];
        calledNumbersForClaim = backendCalledNumbers;
        setCalledNumbers(backendCalledNumbers);
        const syncedCursor = resolveCallCursor(
          state.call_cursor,
          backendCalledNumbers,
        );
        latestCallCursorRef.current = Math.max(
          latestCallCursorRef.current,
          syncedCursor,
        );
        setDrawCursor(syncedCursor);

        setIsPaused(Boolean(state.is_paused));
        if (state.current_called_number) {
          const { label: syncedLabel } = resolveCalledLabelAndNumber(
            state.current_called_formatted,
            state.current_called_number,
          );
          setCurrentCalledNumber(syncedLabel);
        } else {
          setCurrentCalledNumber("");
        }

        if (state.cartella_statuses) {
          setCartellaStatuses(state.cartella_statuses);
        }

        setRestoredGame(game);
        assignedCartelaNumbers = game.assigned_cartella_numbers;
        boardCount = Array.isArray(game.cartella_numbers)
          ? game.cartella_numbers.length
          : 0;

        const refreshedIndex = resolveCartelaIndexFromMap(
          cartelaNumber,
          game.cartella_number_map,
        );
        if (refreshedIndex >= 0) {
          cartelaIndex = refreshedIndex;
        }
      } catch (error) {
        console.error("Failed to refresh claim context", error);
      }
    }

    const normalizedTarget = normalizeCartelaNumber(cartelaNumber);

    if (
      cartelaIndex < 0 &&
      normalizedTarget !== null &&
      Array.isArray(assignedCartelaNumbers) &&
      assignedCartelaNumbers.length > 0
    ) {
      const assignedIndex = assignedCartelaNumbers.findIndex(
        (value) => Number(value) === normalizedTarget,
      );
      if (assignedIndex >= 0) {
        cartelaIndex = assignedIndex;
      }
    }

    if (cartelaIndex < 0) {
      cartelaIndex = getServerCartelaIndex(cartelaNumber);
    }

    if (
      cartelaIndex < 0 &&
      normalizedTarget !== null &&
      boardCount > 0 &&
      normalizedTarget >= 1 &&
      normalizedTarget <= boardCount
    ) {
      cartelaIndex = normalizedTarget - 1;
    }

    return {
      cartelaIndex,
      calledNumbersForClaim,
    };
  };

  const applyWinningClaimResult = (
    winningCartelaNumber: string,
    winningCartelaIndex: number,
    claim: GameClaimResponse,
    source: "declare" | "check",
  ) => {
    const patternText = claim.pattern ? `\nPattern: ${claim.pattern}` : "";
    const payoutText = claim.payout_amount
      ? `\nPayout: ${formatCurrency(claim.payout_amount)}`
      : "";
    const cutText = claim.shop_cut_amount
      ? `\nShop Cut: ${formatCurrency(claim.shop_cut_amount)}`
      : "";

    triggerWinnerCelebration(
      winningCartelaNumber,
      claim.pattern,
      claim.payout_amount,
      claim.shop_cut_amount,
    );
    setGameStatus("completed");
    setIsPaused(false);
    setIsGameActive(false);
    setAutoCall(false);
    setRestoredGame((prev) =>
      prev
        ? {
            ...prev,
            status: "completed",
            winners: [
              ...new Set([...(prev.winners || []), winningCartelaIndex]),
            ],
            winning_pattern: claim.pattern || prev.winning_pattern,
            payout_amount: claim.payout_amount || prev.payout_amount,
            shop_cut_amount: claim.shop_cut_amount || prev.shop_cut_amount,
            ended_at: prev.ended_at || new Date().toISOString(),
          }
        : prev,
    );
    onGameStateChange?.(false);

    if (source === "declare") {
      popup.success(
        `🎉 BINGO! Cartela ${winningCartelaNumber} WON!\nGame closed.${patternText}${payoutText}${cutText}`,
      );
      return;
    }

    popup.success(
      `🎉 BINGO${claim.pattern ? ` (${claim.pattern})` : ""}! Player with Cartela ${winningCartelaNumber} WON!\nGame closed.${payoutText}${cutText}`,
    );
  };

  const triggerCalledBall = async (
    label: string,
    calledNumber?: number | null,
  ) => {
    const postVoiceDisplayMs = 180;
    const minimumAnnouncementMs = 1200;
    const { label: resolvedLabel, number: resolvedCalledNumber } =
      resolveCalledLabelAndNumber(label, calledNumber ?? null);

    // Mark immediately so sync polling does not replay the same call while voice is active.
    if (typeof resolvedCalledNumber === "number") {
      lastAnimatedCalledRef.current = resolvedCalledNumber;
    }

    // Show center popup at the same moment the voice starts.
    setBallPopupLabel(resolvedLabel);
    setShowBallPopup(true);

    const now = Date.now();
    const withinStreakWindow = now - lastCallTimeRef.current <= 5000;
    lastCallTimeRef.current = now;
    setCallStreak((prev) => (withinStreakWindow ? prev + 1 : 1));
    setStreakBoost(true);

    window.setTimeout(() => setStreakBoost(false), 350);

    const announcementId = ++activeNumberVoiceIdRef.current;
    setIsAnnouncingNumber(true);
    const announcementStartedAt = Date.now();
    await playAudio(resolvedLabel, true);

    if (activeNumberVoiceIdRef.current === announcementId) {
      const elapsedMs = Date.now() - announcementStartedAt;
      const remainingMinimumMs = Math.max(0, minimumAnnouncementMs - elapsedMs);
      if (remainingMinimumMs > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remainingMinimumMs);
        });
      }
    }

    if (activeNumberVoiceIdRef.current === announcementId) {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, postVoiceDisplayMs);
      });
    }

    if (activeNumberVoiceIdRef.current === announcementId) {
      setShowBallPopup(false);
      setIsAnnouncingNumber(false);
    }
  };

  const enqueueCalledBallAnnouncement = (
    label: string,
    calledNumber?: number | null,
    callCursor?: number | null,
  ) => {
    const { label: resolvedLabel, number: resolvedCalledNumber } =
      resolveCalledLabelAndNumber(label, calledNumber ?? null);
    const normalizedCursor =
      typeof callCursor === "number" && callCursor > 0 ? callCursor : null;

    if (
      normalizedCursor !== null &&
      normalizedCursor <= latestQueuedAnnouncementCursorRef.current
    ) {
      return Promise.resolve();
    }

    if (normalizedCursor !== null) {
      latestQueuedAnnouncementCursorRef.current = normalizedCursor;
    }

    announcementQueueRef.current = announcementQueueRef.current
      .catch(() => {
        // Keep the queue alive even if a previous announcement failed.
      })
      .then(async () => {
        if (
          normalizedCursor !== null &&
          normalizedCursor < latestCallCursorRef.current
        ) {
          return;
        }

        if (
          resolvedCalledNumber !== null &&
          resolvedCalledNumber === lastAnimatedCalledRef.current
        ) {
          return;
        }

        activeAnnouncementNumberRef.current = resolvedCalledNumber;
        try {
          await triggerCalledBall(resolvedLabel, resolvedCalledNumber);
          if (normalizedCursor !== null) {
            latestCallCursorRef.current = Math.max(
              latestCallCursorRef.current,
              normalizedCursor,
            );
          }
        } finally {
          if (activeAnnouncementNumberRef.current === resolvedCalledNumber) {
            activeAnnouncementNumberRef.current = null;
          }
        }
      });

    return announcementQueueRef.current;
  };

  const triggerWinnerCelebration = (
    cartelaNumber: string,
    pattern?: string | null,
    payoutAmount?: string | number | null,
    shopCutAmount?: string | number | null,
  ) => {
    setWinnerCelebration({
      cartela: cartelaNumber,
      pattern: pattern || null,
      payoutAmount: payoutAmount ?? null,
      shopCutAmount: shopCutAmount ?? null,
    });
    playAudio("you_won");
  };

  const winnerConfetti = React.useMemo<WinnerConfettiPiece[]>(
    () =>
      Array.from({ length: 44 }, (_, index) => {
        const colorClasses = [
          "bg-rose-400",
          "bg-amber-400",
          "bg-emerald-400",
          "bg-sky-400",
          "bg-violet-400",
        ] as const;
        return {
          id: index,
          startX: Math.random() * 100,
          driftX: (Math.random() - 0.5) * 280,
          rotate: (Math.random() - 0.5) * 520,
          delay: Math.random() * 0.35,
          duration: 2.4 + Math.random() * 1.3,
          size: 7 + Math.random() * 7,
          colorClass: colorClasses[index % colorClasses.length],
        };
      }),
    [],
  );

  const winnerCartelaData = React.useMemo(() => {
    if (!winnerCelebration?.cartela) {
      return [] as number[];
    }

    return cartelaDataMap[winnerCelebration.cartela] || [];
  }, [winnerCelebration?.cartela, cartelaDataMap]);

  const syncGameState = async (force = false) => {
    if (!currentGameConfig?.gameCode || syncInFlightRef.current) return;
    if (
      !force &&
      (callInFlightRef.current || isCallingNumber || isAnnouncingNumber)
    ) {
      return;
    }

    syncInFlightRef.current = true;
    try {
      const state = await gamesApi.getGameState(currentGameConfig.gameCode);
      const nextStatus = state.status as GameStatus;
      const stateCursor = resolveCallCursor(
        state.call_cursor,
        state.called_numbers,
      );
      const isStaleState = stateCursor < latestCallCursorRef.current;
      const shouldIgnorePendingRegression =
        nextStatus === "pending" &&
        gameStatusRef.current === "active" &&
        Date.now() < startTransitionUntilRef.current;

      const shouldApplyStatus =
        !isStaleState ||
        nextStatus === "completed" ||
        nextStatus === "cancelled";

      if (shouldApplyStatus && !shouldIgnorePendingRegression) {
        setGameStatus(nextStatus);
      }
      if (!isStaleState) {
        setIsPaused(Boolean(state.is_paused));
        latestCallCursorRef.current = stateCursor;
        setDrawCursor(stateCursor);
        setCalledNumbers(state.called_numbers || []);

        if (state.current_called_number) {
          const { label: resolvedCurrentLabel } = resolveCalledLabelAndNumber(
            state.current_called_formatted,
            state.current_called_number,
          );

          if (stateCursor > latestQueuedAnnouncementCursorRef.current) {
            void enqueueCalledBallAnnouncement(
              resolvedCurrentLabel,
              state.current_called_number,
              stateCursor,
            );
          }
          setCurrentCalledNumber(resolvedCurrentLabel);
        } else {
          setCurrentCalledNumber("");
        }
      }

      if (!isStaleState && state.cartella_statuses) {
        setCartellaStatuses(state.cartella_statuses);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const isTimeout = message.includes("timeout");
      const now = Date.now();
      if (!isTimeout || now - lastSyncErrorLogRef.current > 10000) {
        console.error("Failed to sync game state", error);
        lastSyncErrorLogRef.current = now;
      }
    } finally {
      syncInFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (!currentGameConfig?.gameCode) return;
    void syncGameState(true);

    const syncIntervalMs = autoCall ? 6000 : 3000;
    const interval = window.setInterval(() => {
      void syncGameState();
    }, syncIntervalMs);

    return () => window.clearInterval(interval);
  }, [
    currentGameConfig?.gameCode,
    autoCall,
    isCallingNumber,
    isAnnouncingNumber,
  ]);

  useEffect(() => {
    if (
      !currentGameConfig?.gameCode ||
      (gameStatus !== "completed" && gameStatus !== "cancelled")
    ) {
      return;
    }

    let isMounted = true;
    const loadFinishedGame = async () => {
      try {
        const game = await gamesApi.getGame(currentGameConfig.gameCode!);
        if (isMounted) {
          setRestoredGame(game);
        }
      } catch (error) {
        console.error("Failed to fetch finished game details", error);
      }
    };

    void loadFinishedGame();
    return () => {
      isMounted = false;
    };
  }, [currentGameConfig?.gameCode, gameStatus]);

  // Auto-call functionality
  useEffect(() => {
    let interval: number | undefined;
    if (
      autoCall &&
      isGameActive &&
      effectiveGameStatus === "active" &&
      !isCheckingCartela &&
      calledNumbers.length < 75
    ) {
      interval = window.setInterval(() => {
        setAutoCallTimer((prev) => {
          const configuredSeconds = getConfiguredAutoCallSeconds();

          if (
            callInFlightRef.current ||
            isCallingNumber ||
            isAnnouncingNumber
          ) {
            return prev;
          }

          if (prev <= 1) {
            void callRandomNumber("auto");
            return configuredSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [
    autoCall,
    isGameActive,
    effectiveGameStatus,
    isCheckingCartela,
    calledNumbers.length,
    isCallingNumber,
    isAnnouncingNumber,
    getConfiguredAutoCallSeconds,
  ]);

  // Get letter for a number (1-15: B, 16-30: I, etc.)
  const getNumberLetter = (num: number): string => {
    if (num >= 1 && num <= 15) return "B";
    if (num >= 16 && num <= 30) return "I";
    if (num >= 31 && num <= 45) return "N";
    if (num >= 46 && num <= 60) return "G";
    if (num >= 61 && num <= 75) return "O";
    return "";
  };

  // Call one random number manually or via auto-call
  const callRandomNumber = async (trigger: "manual" | "auto" = "manual") => {
    if (
      !currentGameConfig?.gameCode ||
      isCallingNumber ||
      callInFlightRef.current ||
      isAnnouncingNumber
    ) {
      return;
    }

    if (isCheckingCartela) {
      return;
    }

    if (trigger === "manual" && autoCall) {
      popup.info("Manual call is disabled while auto-call is running.");
      return;
    }

    if (isPaused) {
      if (trigger === "manual") {
        popup.info("Game is paused. Resume the game to continue calling.");
      }
      return;
    }

    if (gameStatus !== "active") {
      if (trigger === "manual") {
        popup.info("Start the game first.");
      }
      return;
    }

    callInFlightRef.current = true;
    setIsCallingNumber(true);
    try {
      const response = await gamesApi.nextGameCall(currentGameConfig.gameCode);
      const responseCursor = resolveCallCursor(
        response.call_cursor,
        response.called_numbers,
      );
      const isStaleResponse = responseCursor < latestCallCursorRef.current;

      if (isStaleResponse) {
        return;
      }

      latestCallCursorRef.current = responseCursor;
      autoCallFailureCountRef.current = 0;
      setDrawCursor(responseCursor);
      setCalledNumbers(response.called_numbers || []);

      const { label: calledLabel, number: calledNumber } =
        resolveCalledLabelAndNumber(
          response.called_formatted,
          response.called_number || null,
        );

      if (calledLabel) {
        setCurrentCalledNumber(calledLabel);
        await enqueueCalledBallAnnouncement(
          calledLabel,
          calledNumber,
          responseCursor,
        );
      }

      if (response.is_complete) {
        setAutoCall(false);
        playAudio("Game_Finished");
        popup.info("All 75 numbers have been called.");
      }

      if (autoCall) {
        setAutoCallTimer(getConfiguredAutoCallSeconds());
      }
    } catch (error) {
      console.error("Failed to call next number", error);
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      const isTimeout = message.includes("timeout");

      if (trigger === "auto" && isTimeout) {
        autoCallFailureCountRef.current += 1;
        setAutoCallTimer(getConfiguredAutoCallSeconds());

        if (autoCallFailureCountRef.current >= 3) {
          setAutoCall(false);
          const now = Date.now();
          if (now - lastAutoCallWarningRef.current > 5000) {
            popup.warning(
              "Auto-call paused due to repeated network timeouts. Turn it on again when connection is stable.",
            );
            lastAutoCallWarningRef.current = now;
          }
        }
      }

      if (trigger === "manual") {
        popup.error(
          getApiErrorDetail(error, "Failed to get next number from backend."),
        );
      }

      if (!isTimeout) {
        await syncGameState(true);
      }
    } finally {
      callInFlightRef.current = false;
      setIsCallingNumber(false);
    }
  };

  // Manually call a specific number
  const callSpecificNumber = (number: number) => {
    if (!calledNumbers.includes(number)) {
      popup.info("Manual board click calling is disabled. Use Call Number.");
    }
  };

  // Display the current called number
  const displayCurrentNumber = () => {
    if (currentCalledNumber) {
      popup.info(`Current called number: ${currentCalledNumber}`);
    } else {
      popup.warning("No number has been called yet.");
    }
  };

  // Handle winner declaration
  const handleDeclareWinner = async (
    cartelaNumber: string,
    pattern: "row" | "column" | "diagonal" = "row",
  ) => {
    if (winnerClaimInFlightRef.current) {
      return;
    }

    if (getCartellaStatusByNumber(cartelaNumber) === "banned") {
      popup.error("This cartela is banned and cannot claim bingo.");
      return;
    }

    if (!currentGameConfig?.gameCode) {
      popup.error("No backend game code found for winner declaration.");
      return;
    }

    winnerClaimInFlightRef.current = true;
    try {
      const claimContext = await getClaimContext(cartelaNumber);
      if (claimContext.cartelaIndex < 0) {
        popup.error(`Cartela ${cartelaNumber} not found in this game.`);
        return;
      }

      let claim = await gamesApi.claimGame(currentGameConfig.gameCode, {
        cartella_index: claimContext.cartelaIndex,
        pattern,
        called_numbers: claimContext.calledNumbersForClaim,
        ban_on_false_claim: false,
      });

      if (claim.cartella_statuses) {
        setCartellaStatuses(claim.cartella_statuses);
      }

      if (claim.is_bingo) {
        applyWinningClaimResult(
          cartelaNumber,
          claimContext.cartelaIndex,
          claim,
          "declare",
        );
        return;
      }

      // Safety retry with freshly synced state to avoid banning a true winner due to stale local state.
      const retryContext = await getClaimContext(cartelaNumber);
      const retryIndex =
        retryContext.cartelaIndex >= 0
          ? retryContext.cartelaIndex
          : claimContext.cartelaIndex;
      const retryClaim = await gamesApi.claimGame(currentGameConfig.gameCode, {
        cartella_index: retryIndex,
        pattern,
        called_numbers: retryContext.calledNumbersForClaim,
        ban_on_false_claim: false,
      });

      if (retryClaim.cartella_statuses) {
        setCartellaStatuses(retryClaim.cartella_statuses);
      }

      if (retryClaim.is_bingo) {
        applyWinningClaimResult(
          cartelaNumber,
          retryIndex,
          retryClaim,
          "declare",
        );
        return;
      }

      claim = retryClaim;

      playAudio("you_didnt_win");
      setSelectedCartela(cartelaNumber);
      setShowCartelaModal(true);

      const shouldBan = await popup.confirm({
        title: "No Bingo Yet",
        description: `${claim.detail || "Cartela did not win yet."}\n\nCartela ${cartelaNumber} is now shown for review.\nDo you want to ban this cartela or keep it in play?`,
        confirmText: "Ban Cartela",
        cancelText: "Keep Playing",
      });

      if (!shouldBan) {
        setSelectedCartela(cartelaNumber);
        setShowCartelaModal(true);
        return;
      }

      const banContext = await getClaimContext(cartelaNumber);
      const banIndex =
        banContext.cartelaIndex >= 0 ? banContext.cartelaIndex : retryIndex;

      const banClaim = await gamesApi.claimGame(currentGameConfig.gameCode, {
        cartella_index: banIndex,
        pattern,
        called_numbers: banContext.calledNumbersForClaim,
        ban_on_false_claim: true,
      });

      if (banClaim.cartella_statuses) {
        setCartellaStatuses(banClaim.cartella_statuses);
      }

      popup.error(
        banClaim.detail ||
          `Cartela ${cartelaNumber} has been banned after false claim.`,
      );
      return;
    } catch (error) {
      console.error("Failed to complete game", error);
      popup.error(
        getApiErrorDetail(error, "Failed to complete game on the server."),
      );
      await syncGameState();
    } finally {
      winnerClaimInFlightRef.current = false;
    }
  };

  // Handle player removal
  const handleRemovePlayer = async (cartelaNumber: string) => {
    const confirmed = await popup.confirm({
      title: "Remove cartela",
      description: `Remove cartela ${cartelaNumber} from the game?`,
      confirmText: "Remove",
      cancelText: "Cancel",
    });

    if (confirmed) {
      // Remove from local state
      setActiveCartelas((prev) => prev.filter((c) => c !== cartelaNumber));

      // Notify parent component
      onCartelaRemoved?.(cartelaNumber);

      // Close modal
      setShowCartelaModal(false);

      // Show success message
      popup.success(
        `✓ Cartela ${cartelaNumber} has been removed from the game.`,
      );
    }
  };

  // View cartela
  const viewCartela = () => {
    if (!cartelaInput.trim()) {
      popup.warning("Please enter a cartela number");
      return;
    }

    const matchedCartela = findCartelaInList(cartelaInput, activeCartelas);

    if (!matchedCartela) {
      setCartelaError(`Cartela ${cartelaInput} not in game`);
      setTimeout(() => setCartelaError(""), 3000);
      return;
    }

    setSelectedCartela(matchedCartela);
    setShowCartelaModal(true);
  };

  // Open cartela modal without specific number (show dropdown)
  const openCartelaModal = () => {
    const availableCartelas =
      activeCartelas.length > 0 ? activeCartelas : resolvedCartelaNumbers;

    if (availableCartelas.length === 0) {
      popup.warning("No cartelas in this game");
      return;
    }

    if (activeCartelas.length === 0 && availableCartelas.length > 0) {
      setActiveCartelas(availableCartelas);
      setServerCartelaOrder(availableCartelas);
    }

    setSelectedCartela("");
    setShowCartelaModal(true);
  };

  // Check cartela
  const checkCartela = async () => {
    if (!cartelaInput.trim()) {
      popup.warning("Please enter a cartela number");
      return;
    }

    const matchedCartela = findCartelaInList(cartelaInput, activeCartelas);

    if (!matchedCartela) {
      popup.error(`Cartela ${cartelaInput} not in game`);
      return;
    }

    if (getCartellaStatusByNumber(matchedCartela) === "banned") {
      popup.error("This cartela is banned and cannot claim bingo.");
      return;
    }

    if (!currentGameConfig?.gameCode) {
      popup.error("No backend game code found for validation.");
      return;
    }

    setAutoCall(false);
    setAutoCallTimer(getConfiguredAutoCallSeconds());
    setIsCheckingCartela(true);
    playAudio("Check_is_your_card_is_saved");
    try {
      const claimContext = await getClaimContext(matchedCartela);
      if (claimContext.cartelaIndex < 0) {
        popup.error(`Cartela ${matchedCartela} not found in server order`);
        return;
      }

      const claim = await gamesApi.claimGame(currentGameConfig.gameCode, {
        cartella_index: claimContext.cartelaIndex,
        called_numbers: claimContext.calledNumbersForClaim,
        ban_on_false_claim: false,
      });

      if (claim.cartella_statuses) {
        setCartellaStatuses(claim.cartella_statuses);
      }

      if (claim.is_bingo) {
        applyWinningClaimResult(
          matchedCartela,
          claimContext.cartelaIndex,
          claim,
          "check",
        );
        return;
      }

      // Safety retry with freshly synced state to avoid banning a true winner due to stale local state.
      const retryContext = await getClaimContext(matchedCartela);
      const retryIndex =
        retryContext.cartelaIndex >= 0
          ? retryContext.cartelaIndex
          : claimContext.cartelaIndex;
      const retryClaim = await gamesApi.claimGame(currentGameConfig.gameCode, {
        cartella_index: retryIndex,
        called_numbers: retryContext.calledNumbersForClaim,
        ban_on_false_claim: false,
      });

      if (retryClaim.cartella_statuses) {
        setCartellaStatuses(retryClaim.cartella_statuses);
      }

      if (retryClaim.is_bingo) {
        applyWinningClaimResult(
          matchedCartela,
          retryIndex,
          retryClaim,
          "check",
        );
        return;
      }

      playAudio("you_didnt_win");
      setSelectedCartela(matchedCartela);
      setShowCartelaModal(true);
      setIsCheckingCartela(false);

      const shouldBan = await popup.confirm({
        title: "No Bingo Yet",
        description: `${retryClaim.detail || "Cartela did not win yet."}\n\nCartela ${matchedCartela} is now shown for review.\nDo you want to ban this cartela or keep it in play?`,
        confirmText: "Ban Cartela",
        cancelText: "Keep Playing",
      });

      if (!shouldBan) {
        setSelectedCartela(matchedCartela);
        setShowCartelaModal(true);
        return;
      }

      setIsCheckingCartela(true);
      const banContext = await getClaimContext(matchedCartela);
      const banIndex =
        banContext.cartelaIndex >= 0 ? banContext.cartelaIndex : retryIndex;
      const banClaim = await gamesApi.claimGame(currentGameConfig.gameCode, {
        cartella_index: banIndex,
        called_numbers: banContext.calledNumbersForClaim,
        ban_on_false_claim: true,
      });

      if (banClaim.cartella_statuses) {
        setCartellaStatuses(banClaim.cartella_statuses);
      }

      popup.error(
        banClaim.detail ||
          `Cartela ${matchedCartela} has been banned after false claim.`,
      );
    } catch (error) {
      console.error("Failed to validate cartela", error);
      popup.error(
        getApiErrorDetail(error, "Failed to validate cartela on the server."),
      );
      await syncGameState();
    } finally {
      setIsCheckingCartela(false);
    }
  };

  // Stop the current game
  const closeGameWithoutWinner = async () => {
    if (isStoppingGame) return;
    const confirmed = await popup.confirm({
      title: "Close without winner",
      description: `You are about to close game ${currentGameConfig?.game || ""} without declaring any winner. The game will be cancelled and no payout will be made. Continue?`,
      confirmText: "Close Without Winner",
      cancelText: "Keep Playing",
    });

    if (confirmed) {
      if (!currentGameConfig?.gameCode) {
        popup.error("No backend game code found for cancellation.");
        return;
      }

      let cancelledOnServer = false;
      setIsStoppingGame(true);
      try {
        await gamesApi.completeGame(currentGameConfig.gameCode, {
          status: "cancelled",
          winners: [],
        });
        cancelledOnServer = true;
      } catch (error) {
        console.error("Failed to cancel game", error);
        popup.error(
          getApiErrorDetail(error, "Failed to cancel game on the server."),
        );
      } finally {
        setIsStoppingGame(false);
      }

      if (!cancelledOnServer) {
        await syncGameState();
        return;
      }

      setIsGameActive(false);
      setGameStatus("cancelled");
      setIsPaused(false);
      setAutoCall(false);
      setAutoCallTimer(
        Number.parseInt(localStorage.getItem("autoCallSeconds") || "5", 10) ||
          5,
      );
      setCurrentCalledNumber("");
      setShowCartelaModal(false);
      setSelectedCartela("");
      setRestoredGame((prev) =>
        prev
          ? {
              ...prev,
              status: "cancelled",
              ended_at: prev.ended_at || new Date().toISOString(),
            }
          : prev,
      );
      onGameStateChange?.(false);
      popup.success("Game closed without winner.");
      playAudio("Game_stopped");
    }
  };

  const startGame = async () => {
    if (isStartingGame || !currentGameConfig?.gameCode) return;
    setIsStartingGame(true);
    try {
      await gamesApi.startGame(currentGameConfig.gameCode);
      startTransitionUntilRef.current = Date.now() + 5000;
      setGameStatus("active");
      setIsPaused(false);
      setIsGameActive(true);
      setAutoCall(true);
      setRestoredGame((prev) =>
        prev
          ? {
              ...prev,
              status: "active",
              started_at: prev.started_at || new Date().toISOString(),
            }
          : prev,
      );
      setAutoCallTimer(
        Number.parseInt(localStorage.getItem("autoCallSeconds") || "5", 10) ||
          5,
      );
      popup.success("Game started.");
      playAudio("Game_has_started");
      await syncGameState();
    } catch (error) {
      console.error("Failed to start game", error);
      popup.error(getApiErrorDetail(error, "Failed to start game."));
      await syncGameState();
    } finally {
      setIsStartingGame(false);
    }
  };

  const toggleAutoCall = React.useCallback(
    (nextValue?: boolean) => {
      if (effectiveGameStatus !== "active") {
        if (effectiveGameStatus === "paused") {
          popup.info("Resume the game to enable auto-call.");
        } else {
          popup.info("Start the game first.");
        }
        return;
      }

      setAutoCall((prev) => {
        const next = typeof nextValue === "boolean" ? nextValue : !prev;
        if (next) {
          setAutoCallTimer(getConfiguredAutoCallSeconds());
        }
        return next;
      });
    },
    [effectiveGameStatus, getConfiguredAutoCallSeconds, popup],
  );

  const togglePauseGame = React.useCallback(() => {
    if (!currentGameConfig?.gameCode) {
      popup.error("No backend game code found.");
      return;
    }

    if (gameStatus !== "active") {
      popup.info("Game can only be paused while active.");
      return;
    }

    const nextPaused = !isPaused;

    void (async () => {
      try {
        const response = await gamesApi.setGamePaused(
          currentGameConfig.gameCode!,
          nextPaused,
        );

        setIsPaused(Boolean(response.is_paused));
        if (response.is_paused) {
          setAutoCall(false);
          setAutoCallTimer(getConfiguredAutoCallSeconds());
          popup.info("Game paused.");
        } else {
          setShowAddPlayerModal(false);
          setAutoCall(true);
          setAutoCallTimer(getConfiguredAutoCallSeconds());
          popup.success("Game resumed. Auto-call restarted.");
        }
      } catch (error) {
        console.error("Failed to toggle pause", error);
        popup.error(getApiErrorDetail(error, "Failed to update pause state."));
      }
    })();
  }, [
    currentGameConfig?.gameCode,
    gameStatus,
    isPaused,
    getConfiguredAutoCallSeconds,
    popup,
  ]);

  const toggleAddPlayerCartella = (cartellaNumber: number) => {
    if (takenCartellaNumbers.has(cartellaNumber)) {
      popup.warning(`Cartella ${cartellaNumber} is already in this game.`);
      return;
    }

    setAddPlayerCartellas((prev) => {
      if (prev.includes(cartellaNumber)) {
        return prev.filter((value) => value !== cartellaNumber);
      }
      if (prev.length >= 4) {
        popup.warning("A player can select a maximum of 4 cartellas.");
        return prev;
      }
      return [...prev, cartellaNumber];
    });
  };

  const openAddPlayerModal = () => {
    if (!canAddPlayerWhilePaused) {
      popup.info("Pause the active game to add new players.");
      return;
    }

    setAddPlayerName(`Player ${nextLatePlayerNumber}`);
    setAddPlayerCartellas([]);
    setAddPlayerPage(1);
    setShowAddPlayerModal(true);
  };

  const handleAddPlayerDuringPause = async () => {
    if (!currentGameConfig?.gameCode) {
      popup.error("No backend game code found.");
      return;
    }

    if (!canAddPlayerWhilePaused) {
      popup.info("Pause the active game before adding a player.");
      return;
    }

    const trimmedName = addPlayerName.trim();
    if (!trimmedName) {
      popup.warning("Player name is required.");
      return;
    }

    if (addPlayerCartellas.length === 0) {
      popup.warning("Select at least one cartella.");
      return;
    }

    setIsAddingPlayer(true);
    try {
      const normalizedBetPerCartella = parseMoneyAmount(
        currentGameConfig.betBirr || restoredGame?.bet_amount || "10.00",
        10,
      );
      const additionalPool =
        normalizedBetPerCartella * addPlayerCartellas.length;

      let currentTotalPool = parseMoneyAmount(
        restoredGame?.total_pool ||
          restoredGame?.win_amount ||
          currentGameConfig.winBirr,
        0,
      );

      if (currentTotalPool <= 0) {
        currentTotalPool =
          normalizedBetPerCartella * Math.max(activeCartelas.length, 1);
      }

      const projectedTotalPool = currentTotalPool + additionalPool;

      const profile = await shopApi.getProfile();
      const availableBalance = parseMoneyAmount(profile.wallet_balance, 0);
      const effectiveShopCutPercentage = parseMoneyAmount(
        profile.shop_cut_percentage ?? restoredGame?.cut_percentage,
        parseMoneyAmount(restoredGame?.cut_percentage, 10),
      );
      const effectiveLuluCutPercentage = parseMoneyAmount(
        profile.lulu_cut_percentage ?? restoredGame?.lulu_cut_percentage,
        parseMoneyAmount(restoredGame?.lulu_cut_percentage, 15),
      );

      const projectedShopCut =
        (projectedTotalPool * effectiveShopCutPercentage) / 100;
      const projectedLuluCut =
        (projectedShopCut * effectiveLuluCutPercentage) / 100;

      if (availableBalance < projectedLuluCut) {
        const shortBy = Math.max(0, projectedLuluCut - availableBalance);
        popup.error(
          `Insufficient Lulu reserve for adding this player. Required ${formatCurrency(projectedLuluCut.toFixed(2))}, available ${formatCurrency(availableBalance.toFixed(2))}, short by ${formatCurrency(shortBy.toFixed(2))}.`,
        );
        return;
      }

      const updatedGame = await gamesApi.addPlayerToGame(
        currentGameConfig.gameCode,
        {
          player_name: trimmedName,
          cartella_numbers: [...addPlayerCartellas].sort((a, b) => a - b),
          bet_per_cartella: normalizedBetPerCartella.toFixed(2),
        },
      );

      const updatedConfig = buildConfigFromGame(updatedGame);
      updatedConfig.backendStatus = gameStatus;

      setResolvedGameConfig(updatedConfig);
      setRestoredGame(updatedGame);
      setActiveCartelas(updatedConfig.cartelaNumbers || []);
      setServerCartelaOrder(updatedConfig.cartelaNumbers || []);
      setCartellaStatuses(updatedGame.cartella_statuses || {});
      setShowAddPlayerModal(false);
      setAddPlayerCartellas([]);

      popup.success(
        `Added ${trimmedName} with cartellas ${addPlayerCartellas.join(", ")}.`,
      );
    } catch (error) {
      console.error("Failed to add player while paused", error);
      popup.error(getApiErrorDetail(error, "Failed to add player."));
    } finally {
      setIsAddingPlayer(false);
    }
  };

  // Shuffle/reshuffle numbers inside each Bingo column
  const reshuffleBoard = () => {
    setBingoRows((prev) => {
      const shuffleArray = (arr: number[]) =>
        arr
          .map((value) => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);

      return {
        B: shuffleArray(prev.B),
        I: shuffleArray(prev.I),
        N: shuffleArray(prev.N),
        G: shuffleArray(prev.G),
        O: shuffleArray(prev.O),
      };
    });
  };

  const shuffleNumbers = () => {
    if (gameStatus !== "pending") {
      popup.warning("Shuffle is locked after game starts.");
      return;
    }

    setIsShuffling((prev) => {
      const next = !prev;

      if (next) {
        setShuffleCycle(0);
        reshuffleBoard();
        setCalledNumbers([]);
        setCurrentCalledNumber("");
        popup.info("Shuffling started. Click Stop to pause.");
      } else {
        popup.info("Shuffling stopped.");
      }

      return next;
    });
  };

  const calculateWinMoney = () => {
    if (currentGameConfig?.winBirr && currentGameConfig.winBirr !== "0") {
      return parseInt(currentGameConfig.winBirr);
    }
    return calledNumbers.length * 10;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const viewGameLog = () => {
    setWinnerCelebration(null);
    if (isFullscreen) {
      setIsFullscreen(false);
    }

    window.setTimeout(
      () => {
        gameLogRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      },
      isFullscreen ? 180 : 60,
    );
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!winnerCelebration) {
      setShowWinnerLogButton(false);
      return;
    }

    setShowWinnerLogButton(false);
    const timeoutId = window.setTimeout(() => {
      setShowWinnerLogButton(true);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [winnerCelebration]);

  useEffect(() => {
    if (gameStatus !== "pending") {
      setIsShuffling(false);
      return;
    }

    if (!isShuffling) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setShuffleCycle((prev) => prev + 1);
      setBingoRows((prev) => {
        const shuffleArray = (arr: number[]) =>
          arr
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        return {
          B: shuffleArray(prev.B),
          I: shuffleArray(prev.I),
          N: shuffleArray(prev.N),
          G: shuffleArray(prev.G),
          O: shuffleArray(prev.O),
        };
      });
    }, shuffleSpeedMs);

    return () => window.clearInterval(intervalId);
  }, [isShuffling, gameStatus, shuffleSpeedMs]);

  useEffect(() => {
    onFullscreenChange?.(isFullscreen);
    return () => {
      onFullscreenChange?.(false);
    };
  }, [isFullscreen, onFullscreenChange]);

  useEffect(() => {
    if (!isGameActive || effectiveGameStatus !== "active") {
      setCallStreak(0);
      return;
    }

    const streakDecay = window.setInterval(() => {
      setCallStreak((prev) => (prev > 0 ? prev - 1 : 0));
    }, 9000);

    return () => window.clearInterval(streakDecay);
  }, [isGameActive, effectiveGameStatus]);

  useEffect(() => {
    if (!isFullscreen) {
      setIsTheaterMode(false);
      return;
    }

    const onResize = () => {
      const shouldEnable =
        window.innerWidth >= 1700 || window.innerHeight >= 950;
      setIsTheaterMode(shouldEnable);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) {
      setShowFullscreenHud(true);
      setShowRadialControls(false);
      if (fullscreenHudTimeoutRef.current) {
        window.clearTimeout(fullscreenHudTimeoutRef.current);
        fullscreenHudTimeoutRef.current = null;
      }
      return;
    }

    const scheduleHide = () => {
      if (fullscreenHudTimeoutRef.current) {
        window.clearTimeout(fullscreenHudTimeoutRef.current);
      }
      fullscreenHudTimeoutRef.current = window.setTimeout(() => {
        setShowFullscreenHud(false);
      }, 4000);
    };

    const onActivity = () => {
      setShowFullscreenHud(true);
      setShowRadialControls(false);
      scheduleHide();
    };

    onActivity();
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("touchstart", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    window.addEventListener("click", onActivity);

    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("click", onActivity);
      if (fullscreenHudTimeoutRef.current) {
        window.clearTimeout(fullscreenHudTimeoutRef.current);
        fullscreenHudTimeoutRef.current = null;
      }
    };
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current.currentTime = 0;
      }
      if (effectAudioRef.current) {
        effectAudioRef.current.pause();
        effectAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Play audio by key. Number call audio can optionally wait for completion.
  const playAudio = (key: string, waitForEnd = false): Promise<void> => {
    const normalizedKey = key.trim();
    const calledBallMatch = normalizedKey.match(/^([BINGO])[\s_-]?(\d{1,2})$/i);
    const audioKey = calledBallMatch
      ? `${calledBallMatch[1].toUpperCase()}${Number.parseInt(calledBallMatch[2], 10)}`
      : normalizedKey;

    const audioPath = audioMap[audioKey] || audioMap[normalizedKey];
    if (!audioPath) {
      return Promise.resolve();
    }

    const isCalledBallKey = /^[BINGO]\d{1,2}$/i.test(audioKey);
    const targetRef = isCalledBallKey ? voiceAudioRef : effectAudioRef;

    if (targetRef.current) {
      targetRef.current.pause();
      targetRef.current.currentTime = 0;
    }

    const audio = new Audio(audioPath);
    audio.preload = "auto";
    targetRef.current = audio;

    if (!waitForEnd) {
      return audio.play().catch(() => {
        // Ignore autoplay/interrupt errors because calls can happen rapidly.
      });
    }

    return new Promise<void>((resolve) => {
      let settled = false;
      const startedAt = Date.now();
      const minimumWaitMs = isCalledBallKey ? 900 : 0;

      const settle = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(fallbackTimeoutId);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onFailure);
        audio.removeEventListener("abort", onFailure);
        resolve();
      };

      const settleWithMinimum = () => {
        const elapsedMs = Date.now() - startedAt;
        const remainingMinimumMs = Math.max(0, minimumWaitMs - elapsedMs);
        if (remainingMinimumMs > 0) {
          window.setTimeout(() => {
            settle();
          }, remainingMinimumMs);
          return;
        }
        settle();
      };

      const onEnded = () => {
        settle();
      };

      const onFailure = () => {
        settleWithMinimum();
      };

      const fallbackTimeoutId = window.setTimeout(() => {
        settleWithMinimum();
      }, 7000);

      audio.addEventListener("ended", onEnded, { once: true });
      audio.addEventListener("error", onFailure, { once: true });
      audio.addEventListener("abort", onFailure, { once: true });

      void audio.play().catch(() => {
        // If playback cannot start, keep cadence smooth instead of instant chaining.
        settleWithMinimum();
      });
    });
  };

  const isCallActionLocked = isCallingNumber || isAnnouncingNumber;

  return (
    <div className={`space-y-4 ${isFullscreen ? "p-0" : "p-6"}`}>
      <OpeningPlaygroundOverlay
        isVisible={isRestoringGame || isOpeningPlayground}
      />

      {/* Cartela Modal */}
      <CartelaModal
        isOpen={showCartelaModal}
        onClose={() => setShowCartelaModal(false)}
        cartelaNumber={selectedCartela}
        playMode={currentGameConfig?.playMode}
        calledNumbers={calledNumbers}
        cartelaNumbers={activeCartelas}
        cartelaDataMap={cartelaDataMap}
        cartellaNumberMap={
          restoredGame?.cartella_number_map ||
          currentGameConfig?.cartellaNumberMap ||
          undefined
        }
        cartellaStatuses={cartellaStatuses}
        onDeclareWinner={handleDeclareWinner}
        onRemovePlayer={handleRemovePlayer}
        gameActive={isGameActive}
      />

      <Dialog
        open={showAddPlayerModal}
        onOpenChange={(open) => {
          if (!isAddingPlayer) {
            setShowAddPlayerModal(open);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add Player While Paused</DialogTitle>
            <DialogDescription>
              Select a player name and up to 4 new cartellas. Reserved cartellas
              are locked.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Player Name</label>
              <Input
                value={addPlayerName}
                onChange={(event) => setAddPlayerName(event.target.value)}
                placeholder="Player name"
                disabled={isAddingPlayer}
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Cartella Selection ({addPlayerCartellas.length}/4)
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={addPlayerPage === 1 ? "default" : "outline"}
                  onClick={() => setAddPlayerPage(1)}
                  size="sm"
                  disabled={isAddingPlayer}
                >
                  1-100
                </Button>
                <Button
                  variant={addPlayerPage === 2 ? "default" : "outline"}
                  onClick={() => setAddPlayerPage(2)}
                  size="sm"
                  disabled={isAddingPlayer}
                >
                  101-200
                </Button>
              </div>
            </div>

            <div className="max-h-[46vh] overflow-y-auto rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                {addPlayerPageRange.map((number) => {
                  const isSelected = addPlayerCartellas.includes(number);
                  const isTaken = takenCartellaNumbers.has(number);

                  return (
                    <button
                      key={`add-player-${number}`}
                      type="button"
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full border text-sm font-semibold transition ${isTaken ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" : isSelected ? "border-red-700 bg-red-700 text-white" : "border-slate-300 bg-white text-slate-800 hover:border-red-300 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"}`}
                      onClick={() => toggleAddPlayerCartella(number)}
                      disabled={isTaken || isAddingPlayer}
                    >
                      {number}
                    </button>
                  );
                })}
              </div>
            </div>

            {addPlayerCartellas.length > 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Selected:{" "}
                {[...addPlayerCartellas].sort((a, b) => a - b).join(", ")}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddPlayerModal(false)}
              disabled={isAddingPlayer}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddPlayerDuringPause}
              disabled={isAddingPlayer || addPlayerCartellas.length === 0}
            >
              {isAddingPlayer ? "Adding..." : "Add Player"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className={isFullscreen ? "hidden" : "block"}>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className={`rounded-md border px-3 py-2 ${playModeBadgeClass}`}>
            <span className="mr-1 text-xs uppercase opacity-80">Mode</span>
            <span className="font-semibold">{playModeLabel}</span>
          </div>
          <div className={`rounded-md border px-3 py-2 ${statusBadgeClass}`}>
            <span className="mr-1 text-xs uppercase opacity-80">Status</span>
            <span className="font-semibold">{statusLabel}</span>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <span className="mr-1 text-xs uppercase text-slate-500">
              {t("playground.game")}
            </span>
            <span className="font-semibold">
              {currentGameConfig?.game || "F-am"}
            </span>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <span className="mr-1 text-xs uppercase text-slate-500">
              {t("playground.stake")}
            </span>
            <span className="font-semibold">
              {currentGameConfig?.betBirr
                ? formatCurrency(currentGameConfig.betBirr)
                : "BINGO"}
            </span>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <span className="mr-1 text-xs uppercase text-slate-500">
              {t("playground.winPrice")}
            </span>
            <span className="font-semibold">{calculateWinMoney()}</span>
            <span className="ml-2 text-xs uppercase text-slate-500">
              {formatCurrency(calculateWinMoney())}
            </span>
          </div>
          <div className="rounded-md bg-red-700 px-3 py-2 text-white">
            <span className="font-semibold">
              {calledNumbers.length} {t("playground.called")}
            </span>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <span className="mr-1 text-xs uppercase text-slate-500">
              Cartelas:
            </span>
            <span className="font-semibold">{activeCartelas.length || 0}</span>
          </div>
          {currentCalledNumber && (
            <div className="rounded-md bg-emerald-100 px-3 py-2 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <span className="mr-1 text-xs uppercase">Current:</span>
              <span className="font-semibold">{currentCalledNumber}</span>
            </div>
          )}
          {isRestoringGame && (
            <div className="rounded-md bg-sky-100 px-3 py-2 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
              <span className="text-xs uppercase font-semibold">
                Loading game…
              </span>
            </div>
          )}
        </div>
      </div>

      {isFullscreen && currentGameConfig?.playMode && (
        <div className="pointer-events-none fixed right-4 top-4 z-40">
          <div className="flex flex-col items-end gap-2">
            <div
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold shadow-lg backdrop-blur ${playModeBadgeClass}`}
            >
              {playModeLabel} Mode
            </div>
            <div
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur ${statusBadgeClass}`}
            >
              {statusLabel}
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <Card className="overflow-hidden p-2">
          <img
            src={pageIllustration}
            alt="Bingo illustration"
            className="h-36 w-full rounded-lg object-cover"
          />
        </Card>
      )}

      {/* Error toast */}
      {!isFullscreen && cartelaError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {cartelaError}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCartelaError("")}
            className="h-6 w-6 p-0"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {!isFullscreen && (
        <Card className="p-3">
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Called Numbers
          </h4>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto">
            {calledNumbers.length === 0 ? (
              <span className="text-sm text-slate-500">
                No numbers called yet
              </span>
            ) : (
              calledNumbers.map((number) => (
                <span
                  key={number}
                  className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 px-2 text-xs font-bold text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300"
                >
                  {mapNumberToLabel(number)}
                </span>
              ))
            )}
          </div>
        </Card>
      )}

      <GameLogCard
        isFullscreen={isFullscreen}
        gameStatus={gameStatus}
        currentGameConfig={currentGameConfig}
        restoredGame={restoredGame}
        calledNumbersCount={calledNumbers.length}
        gameLogRef={gameLogRef}
      />

      {/* Main content */}
      <div className="space-y-4">
        <BoardArea
          boardContainerRef={boardContainerRef}
          isFullscreen={isFullscreen}
          theme={theme}
          showFullscreenHud={showFullscreenHud}
          isTheaterMode={isTheaterMode}
          setIsTheaterMode={setIsTheaterMode}
          calledNumbersLength={calledNumbers.length}
          streakBoost={streakBoost}
          callStreak={callStreak}
          toggleFullscreen={toggleFullscreen}
          t={t}
          isShuffling={isShuffling}
          bingoRows={bingoRows}
          calledNumbers={calledNumbers}
          shuffleCycle={shuffleCycle}
          isGameActive={isGameActive}
          callSpecificNumber={callSpecificNumber}
        />

        <WinnerCelebrationModal
          winnerCelebration={winnerCelebration}
          winnerConfetti={winnerConfetti}
          currentGameConfig={currentGameConfig}
          activeCartelasCount={activeCartelas.length}
          calledNumbersCount={calledNumbers.length}
          calledNumbers={calledNumbers}
          winnerCartelaData={winnerCartelaData}
          showWinnerLogButton={showWinnerLogButton}
          calculateWinMoney={calculateWinMoney}
          onClose={() => setWinnerCelebration(null)}
          onViewGameLog={viewGameLog}
        />

        <StatusOverlays
          isCheckingCartela={isCheckingCartela}
          isStoppingGame={isStoppingGame}
          showBallPopup={showBallPopup}
          ballPopupLabel={ballPopupLabel}
          isFullscreen={isFullscreen}
        />

        <FullscreenControls
          isFullscreen={isFullscreen}
          showFullscreenHud={showFullscreenHud}
          theme={theme}
          calledNumbersLength={calledNumbers.length}
          gameStatus={effectiveGameStatus}
          isShuffling={isShuffling}
          shuffleSpeedMs={shuffleSpeedMs}
          setShuffleSpeedMs={setShuffleSpeedMs}
          shuffleNumbers={shuffleNumbers}
          autoCall={autoCall}
          onToggleAutoCall={toggleAutoCall}
          isPaused={isPaused}
          togglePauseGame={togglePauseGame}
          showRadialControls={showRadialControls}
          setShowRadialControls={setShowRadialControls}
          isStoppingGame={isStoppingGame}
          isCallingNumber={isCallActionLocked}
          isCheckingCartela={isCheckingCartela}
          isStartingGame={isStartingGame}
          callRandomNumber={callRandomNumber}
          startGame={startGame}
        />

        <DesktopControlPanels
          isFullscreen={isFullscreen}
          gameStatus={effectiveGameStatus}
          currentCalledNumber={currentCalledNumber}
          displayCurrentNumber={displayCurrentNumber}
          callRandomNumber={callRandomNumber}
          calledNumbersLength={calledNumbers.length}
          isCallingNumber={isCallActionLocked}
          isStoppingGame={isStoppingGame}
          closeGameWithoutWinner={closeGameWithoutWinner}
          shuffleNumbers={shuffleNumbers}
          isShuffling={isShuffling}
          isStartingGame={isStartingGame}
          startGame={startGame}
          onStartNewGame={onStartNewGame}
          autoCall={autoCall}
          onToggleAutoCall={toggleAutoCall}
          isPaused={isPaused}
          togglePauseGame={togglePauseGame}
          canAddPlayerWhilePaused={canAddPlayerWhilePaused}
          openAddPlayerModal={openAddPlayerModal}
          autoCallTimer={autoCallTimer}
          autoCallCycleSeconds={getConfiguredAutoCallSeconds()}
          t={t}
          shuffleSpeedMs={shuffleSpeedMs}
          setShuffleSpeedMs={setShuffleSpeedMs}
          theme={theme}
          openCartelaModal={openCartelaModal}
          isGameActive={isGameActive}
          cartelaInput={cartelaInput}
          setCartelaInput={setCartelaInput}
          viewCartela={viewCartela}
          checkCartela={checkCartela}
          isCheckingCartela={isCheckingCartela}
          activeCartelasLength={activeCartelas.length}
          calculateWinMoney={calculateWinMoney}
        />
      </div>
    </div>
  );
};
