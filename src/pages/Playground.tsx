import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePopup } from "../contexts/PopupContext";
import { CartelaModal } from "../components/Cartela";
import { gamesApi } from "../services/api";
import { ApiError } from "../services/api/client";
import { formatCurrency } from "../services/settings";
import { Game } from "../services/types";
import { GameLogCard } from "./playground/components/GameLogCard";
import { OpeningPlaygroundOverlay } from "./playground/components/OpeningPlaygroundOverlay";
import { WinnerCelebrationModal } from "./playground/components/WinnerCelebrationModal";
import { BoardArea } from "./playground/components/BoardArea";
import { FullscreenControls } from "./playground/components/FullscreenControls";
import { DesktopControlPanels } from "./playground/components/DesktopControlPanels";
import { StatusOverlays } from "./playground/components/StatusOverlays";
import { pickRandomBingoIllustration } from "../assets/illustrations";
import { getOfflineCartellaBoard } from "../data/offlineCartellas";
import {
  DisplayGameStatus,
  PlaygroundGameConfig,
  GameStatus,
  PlaygroundProps,
  WinnerCelebration,
  WinnerConfettiPiece,
} from "./playground/types";
import audioMap from "../audioMap";

export const Playground: React.FC<PlaygroundProps> = ({
  gameConfig,
  onStartNewGame,
  onGameStateChange,
  onCartelaRemoved,
  onFullscreenChange,
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
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
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
  const winnerClaimInFlightRef = React.useRef(false);
  const voiceAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const effectAudioRef = React.useRef<HTMLAudioElement | null>(null);

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
        setIsPaused(false);
        setIsGameActive(
          state.status === "active" || state.status === "pending",
        );
        setActiveCartelas(config.cartelaNumbers || []);
        setServerCartelaOrder(config.cartelaNumbers || []);
        setCartellaStatuses(
          state.cartella_statuses || game.cartella_statuses || {},
        );
        setDrawSequence(game.draw_sequence || []);
        setDrawCursor(state.call_cursor || 0);
        setCalledNumbers(state.called_numbers || []);
        setAutoCall(
          state.status === "active" && (state.called_numbers?.length || 0) < 75,
        );
        setAutoCallTimer(getConfiguredAutoCallSeconds());

        if (state.current_called_number) {
          setCurrentCalledNumber(
            state.current_called_formatted ||
              mapNumberToLabel(state.current_called_number),
          );
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

  const cartelaDataMap = React.useMemo(() => {
    const numbers = currentGameConfig?.cartelaData || [];
    const entries = serverCartelaOrder.map((cartelaNumber, index) => {
      if (currentGameConfig?.playMode === "offline") {
        return [
          cartelaNumber,
          getOfflineCartellaBoard(cartelaNumber) ?? [],
        ] as const;
      }

      const data = numbers[index] || [];
      return [cartelaNumber, data] as const;
    });
    return Object.fromEntries(entries);
  }, [
    currentGameConfig?.cartelaData,
    currentGameConfig?.playMode,
    serverCartelaOrder,
  ]);

  const normalizeCartelaNumber = (value: string | number): number | null => {
    const digits = String(value).replace(/\D/g, "");
    if (!digits) return null;
    const parsed = Number.parseInt(digits, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

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
      currentGameConfig?.cartellaNumberMap || restoredGame?.cartella_number_map;
    if (authoritativeMap && typeof authoritativeMap === "object") {
      for (const [mappedCartelaNumber, mappedIndex] of Object.entries(
        authoritativeMap,
      )) {
        if (normalizeCartelaNumber(mappedCartelaNumber) === target) {
          return Number.isFinite(mappedIndex) ? Number(mappedIndex) : -1;
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

  // Notify parent when game state changes
  useEffect(() => {
    onGameStateChange?.(isGameActive && (gameStatus === "active" || isPaused));
  }, [isGameActive, gameStatus, isPaused]);

  const mapNumberToLabel = (number: number) => {
    const letter = getNumberLetter(number);
    return `${letter}${number}`;
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

  const triggerCalledBall = (label: string, calledNumber?: number | null) => {
    // Play the audio for the called number (e.g. "B12", "N42")
    playAudio(label);

    setBallPopupLabel(label);
    setShowBallPopup(true);

    if (typeof calledNumber === "number") {
      lastAnimatedCalledRef.current = calledNumber;
    }

    const now = Date.now();
    const withinStreakWindow = now - lastCallTimeRef.current <= 5000;
    lastCallTimeRef.current = now;
    setCallStreak((prev) => (withinStreakWindow ? prev + 1 : 1));
    setStreakBoost(true);

    window.setTimeout(() => setShowBallPopup(false), 1500);
    window.setTimeout(() => setStreakBoost(false), 350);
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

  const syncGameState = async () => {
    if (!currentGameConfig?.gameCode || syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    try {
      const state = await gamesApi.getGameState(currentGameConfig.gameCode);
      const nextStatus = state.status as GameStatus;
      const shouldIgnorePendingRegression =
        nextStatus === "pending" &&
        gameStatusRef.current === "active" &&
        Date.now() < startTransitionUntilRef.current;

      if (!shouldIgnorePendingRegression) {
        setGameStatus(nextStatus);
      }
      setCalledNumbers(state.called_numbers || []);
      if (state.current_called_number) {
        if (state.current_called_number !== lastAnimatedCalledRef.current) {
          const label =
            state.current_called_formatted ||
            mapNumberToLabel(state.current_called_number);
          triggerCalledBall(label, state.current_called_number);
        }
        setCurrentCalledNumber(
          state.current_called_formatted ||
            mapNumberToLabel(state.current_called_number),
        );
      } else {
        setCurrentCalledNumber("");
      }
      setDrawCursor(state.call_cursor || 0);
      if (state.cartella_statuses) {
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
    void syncGameState();
    const interval = window.setInterval(() => {
      void syncGameState();
    }, 3000);
    return () => window.clearInterval(interval);
  }, [currentGameConfig?.gameCode]);

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

          if (callInFlightRef.current || isCallingNumber) {
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
      callInFlightRef.current
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
      setCalledNumbers(response.called_numbers || []);

      const called =
        response.called_formatted ||
        (response.called_number
          ? mapNumberToLabel(response.called_number)
          : "");

      if (called) {
        setCurrentCalledNumber(called);
        triggerCalledBall(called, response.called_number || null);
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
      if (trigger === "manual") {
        popup.error(
          getApiErrorDetail(error, "Failed to get next number from backend."),
        );
      }
      await syncGameState();
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
  const handleDeclareWinner = async (cartelaNumber: string) => {
    if (winnerClaimInFlightRef.current) {
      return;
    }

    const winnerIndex = getServerCartelaIndex(cartelaNumber);
    if (winnerIndex < 0) {
      popup.error(`Cartela ${cartelaNumber} not found in this game.`);
      return;
    }

    if (getCartellaStatusByNumber(cartelaNumber) === "banned") {
      popup.error("This cartela is banned and cannot claim bingo.");
      return;
    }

    winnerClaimInFlightRef.current = true;
    try {
      if (currentGameConfig?.gameCode) {
        const claim = await gamesApi.claimGame(currentGameConfig.gameCode, {
          cartella_index: winnerIndex,
          ban_on_false_claim: false,
        });

        if (claim.cartella_statuses) {
          setCartellaStatuses(claim.cartella_statuses);
        }

        if (!claim.is_bingo) {
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

          const banClaim = await gamesApi.claimGame(
            currentGameConfig.gameCode,
            {
              cartella_index: winnerIndex,
              ban_on_false_claim: true,
            },
          );

          if (banClaim.cartella_statuses) {
            setCartellaStatuses(banClaim.cartella_statuses);
          }

          popup.error(
            banClaim.detail ||
              `Cartela ${cartelaNumber} has been banned after false claim.`,
          );
          return;
        }

        const patternText = claim.pattern ? `\nPattern: ${claim.pattern}` : "";
        const payoutText = claim.payout_amount
          ? `\nPayout: ${formatCurrency(claim.payout_amount)}`
          : "";
        const cutText = claim.shop_cut_amount
          ? `\nShop Cut: ${formatCurrency(claim.shop_cut_amount)}`
          : "";

        triggerWinnerCelebration(
          cartelaNumber,
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
                winners: [...new Set([...(prev.winners || []), winnerIndex])],
                winning_pattern: claim.pattern || prev.winning_pattern,
                payout_amount: claim.payout_amount || prev.payout_amount,
                shop_cut_amount: claim.shop_cut_amount || prev.shop_cut_amount,
                ended_at: prev.ended_at || new Date().toISOString(),
              }
            : prev,
        );
        onGameStateChange?.(false);
        popup.success(
          `🎉 BINGO! Cartela ${cartelaNumber} WON!\nGame closed.${patternText}${payoutText}${cutText}`,
        );
        return;
      }
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

    const cartellaIndex = getServerCartelaIndex(matchedCartela);
    if (cartellaIndex < 0) {
      popup.error(`Cartela ${matchedCartela} not found in server order`);
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
      const claim = await gamesApi.claimGame(currentGameConfig.gameCode, {
        cartella_index: cartellaIndex,
        ban_on_false_claim: false,
      });

      if (claim.cartella_statuses) {
        setCartellaStatuses(claim.cartella_statuses);
      }

      if (claim.is_bingo) {
        const patternText = claim.pattern ? ` (${claim.pattern})` : "";
        const payoutText = claim.payout_amount
          ? `\nPayout: ${formatCurrency(claim.payout_amount)}`
          : "";
        const cutText = claim.shop_cut_amount
          ? `\nShop Cut: ${formatCurrency(claim.shop_cut_amount)}`
          : "";

        triggerWinnerCelebration(
          matchedCartela,
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
                winners: [...new Set([...(prev.winners || []), cartellaIndex])],
                winning_pattern: claim.pattern || prev.winning_pattern,
                payout_amount: claim.payout_amount || prev.payout_amount,
                shop_cut_amount: claim.shop_cut_amount || prev.shop_cut_amount,
                ended_at: prev.ended_at || new Date().toISOString(),
              }
            : prev,
        );
        onGameStateChange?.(false);
        popup.success(
          `🎉 BINGO${patternText}! Player with Cartela ${matchedCartela} WON!\nGame closed.${payoutText}${cutText}`,
        );
        return;
      }

      playAudio("you_didnt_win");
      setSelectedCartela(matchedCartela);
      setShowCartelaModal(true);
      setIsCheckingCartela(false);

      const shouldBan = await popup.confirm({
        title: "No Bingo Yet",
        description: `${claim.detail || "Cartela did not win yet."}\n\nCartela ${matchedCartela} is now shown for review.\nDo you want to ban this cartela or keep it in play?`,
        confirmText: "Ban Cartela",
        cancelText: "Keep Playing",
      });

      if (!shouldBan) {
        setSelectedCartela(matchedCartela);
        setShowCartelaModal(true);
        return;
      }

      setIsCheckingCartela(true);
      const banClaim = await gamesApi.claimGame(currentGameConfig.gameCode, {
        cartella_index: cartellaIndex,
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
    if (gameStatus !== "active") {
      popup.info("Game can only be paused while active.");
      return;
    }

    setIsPaused((prev) => {
      const nextPaused = !prev;
      if (nextPaused) {
        setAutoCall(false);
        setAutoCallTimer(getConfiguredAutoCallSeconds());
        popup.info("Game paused.");
      } else {
        setAutoCall(true);
        setAutoCallTimer(getConfiguredAutoCallSeconds());
        popup.success("Game resumed. Auto-call restarted.");
      }
      return nextPaused;
    });
  }, [gameStatus, getConfiguredAutoCallSeconds, popup]);

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

  // Play audio by key and avoid overlapping number-call voice playback.
  const playAudio = (key: string) => {
    const audioPath = audioMap[key];
    if (!audioPath) {
      return;
    }

    const isCalledBallKey = /^[BINGO]_?\d{1,2}$/i.test(key);
    const targetRef = isCalledBallKey ? voiceAudioRef : effectAudioRef;

    if (targetRef.current) {
      targetRef.current.pause();
      targetRef.current.currentTime = 0;
    }

    const audio = new Audio(audioPath);
    audio.preload = "auto";
    targetRef.current = audio;
    void audio.play().catch(() => {
      // Ignore autoplay/interrupt errors because calls can happen rapidly.
    });
  };

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
        cartellaStatuses={cartellaStatuses}
        onDeclareWinner={handleDeclareWinner}
        onRemovePlayer={handleRemovePlayer}
        gameActive={isGameActive}
      />

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
          isCallingNumber={isCallingNumber}
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
          isCallingNumber={isCallingNumber}
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
          autoCallTimer={autoCallTimer}
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
