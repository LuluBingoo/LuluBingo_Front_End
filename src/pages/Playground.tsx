// import React, { useState, useEffect } from 'react';
// import { motion } from 'motion/react';
// import { Shuffle, Play, Check, X } from 'lucide-react';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Card } from '../components/ui/card';
// import { useLanguage } from '../contexts/LanguageContext';
// import './Playground.css';

// interface PlaygroundProps {
//   gameConfig?: {
//     game: string;
//     betBirr: string;
//     numPlayers: string;
//     winBirr: string;
//     selectedPatterns: number[];
//   } | null;
//   onStartNewGame?: () => void;
// }

// export const Playground: React.FC<PlaygroundProps> = ({ gameConfig, onStartNewGame }) => {
//   const { t } = useLanguage();

//   // State for called numbers & auto call
//   const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
//   const [autoCall, setAutoCall] = useState(false);
//   const [autoCallTimer, setAutoCallTimer] = useState(11);
//   const [currentCalledNumber, setCurrentCalledNumber] = useState<string>('');

//   // State for cartela input
//   const [cartelaInput, setCartelaInput] = useState('');

//   // State for Bingo board (numbers shuffled per column)
//   const [bingoRows, setBingoRows] = useState({
//     B: Array.from({ length: 15 }, (_, i) => i + 1),
//     I: Array.from({ length: 15 }, (_, i) => i + 16),
//     N: Array.from({ length: 15 }, (_, i) => i + 31),
//     G: Array.from({ length: 15 }, (_, i) => i + 46),
//     O: Array.from({ length: 15 }, (_, i) => i + 61),
//   });

//   const [isGameActive, setIsGameActive] = useState(false);

//   // Initialize game if config exists
//   useEffect(() => {
//     if (gameConfig && !isGameActive) {
//       setIsGameActive(true);
//       console.log('Game config loaded:', gameConfig);
//     }
//   }, [gameConfig]);

//   // Auto-call functionality
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (autoCall && isGameActive && calledNumbers.length < 75) {
//       interval = setInterval(() => {
//         setAutoCallTimer(prev => {
//           if (prev <= 1) {
//             callRandomNumber();
//             return 11;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [autoCall, isGameActive, calledNumbers]);

//   // Get letter for a number (1-15: B, 16-30: I, etc.)
//   const getNumberLetter = (num: number): string => {
//     if (num >= 1 && num <= 15) return 'B';
//     if (num >= 16 && num <= 30) return 'I';
//     if (num >= 31 && num <= 45) return 'N';
//     if (num >= 46 && num <= 60) return 'G';
//     if (num >= 61 && num <= 75) return 'O';
//     return '';
//   };

//   // Call one random number manually or via auto-call
//   const callRandomNumber = () => {
//     const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
//     const uncalledNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
//     if (uncalledNumbers.length > 0) {
//       const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
//       const newNumber = uncalledNumbers[randomIndex];
//       const letter = getNumberLetter(newNumber);
//       setCalledNumbers(prev => [...prev, newNumber]);
//       setCurrentCalledNumber(`${letter} ${newNumber}`);
//     }
//   };

//   // Manually call a specific number (this would need additional UI to select number)
//   const callSpecificNumber = (number: number) => {
//     if (!calledNumbers.includes(number)) {
//       const letter = getNumberLetter(number);
//       setCalledNumbers(prev => [...prev, number]);
//       setCurrentCalledNumber(`${letter} ${number}`);
//     }
//   };

//   // Display the current called number
//   const displayCurrentNumber = () => {
//     if (currentCalledNumber) {
//       alert(`Current called number: ${currentCalledNumber}`);
//     } else {
//       alert('No number has been called yet.');
//     }
//   };

//   // Stop the current game
//   const stopGame = () => {
//     if (window.confirm('Are you sure you want to stop the current game?')) {
//       setIsGameActive(false);
//       setAutoCall(false);
//       setAutoCallTimer(11);
//       setCurrentCalledNumber('');
//       // Note: We keep calledNumbers for display, but game is inactive
//     }
//   };

//   // Start a new game
//   const startNewGame = () => {
//     if (window.confirm('Start a new game? This will reset everything.')) {
//       setCalledNumbers([]);
//       setAutoCall(false);
//       setAutoCallTimer(11);
//       setIsGameActive(true);
//       setCurrentCalledNumber('');

//       // Reshuffle Bingo board
//       reshuffleBoard();

//       if (onStartNewGame) onStartNewGame();
//     }
//   };

//   // Shuffle/reshuffle numbers inside each Bingo column
//   const reshuffleBoard = () => {
//     setBingoRows(prev => {
//       const shuffleArray = (arr: number[]) => arr
//         .map(value => ({ value, sort: Math.random() }))
//         .sort((a, b) => a.sort - b.sort)
//         .map(({ value }) => value);

//       return {
//         B: shuffleArray(prev.B),
//         I: shuffleArray(prev.I),
//         N: shuffleArray(prev.N),
//         G: shuffleArray(prev.G),
//         O: shuffleArray(prev.O),
//       };
//     });
//   };

//   const shuffleNumbers = () => {
//     if (window.confirm('Shuffle numbers inside columns?')) {
//       reshuffleBoard();
//     }
//   };

//   const checkCartela = () => {
//     if (!cartelaInput.trim()) {
//       alert('Please enter a cartela number');
//       return;
//     }
//     alert(`Checking cartela: ${cartelaInput}\nThis would validate against called numbers.`);
//   };

//   const calculateWinMoney = () => {
//     if (gameConfig?.winBirr && gameConfig.winBirr !== '0') {
//       return parseInt(gameConfig.winBirr);
//     }
//     return calledNumbers.length * 10;
//   };

//   return (
//     <div className="playground">
//       {/* Header */}
//       <div className="playground-header">
//         <div className="game-info-bar">
//           <div className="info-item">
//             <span className="info-label">{t('playground.game')}</span>
//             <span className="info-value">{gameConfig?.game || 'F-am'}</span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">{t('playground.stake')}</span>
//             <span className="info-value">{gameConfig?.betBirr ? `${gameConfig.betBirr} BIRR` : 'BINGO'}</span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">{t('playground.winPrice')}</span>
//             <span className="info-value">{calculateWinMoney()}</span>
//           </div>
//           <div className="info-item highlight">
//             <span className="calls-count">{calledNumbers.length} {t('playground.called')}</span>
//           </div>
//           {currentCalledNumber && (
//             <div className="info-item current-number-display">
//               <span className="current-number-label">Current:</span>
//               <span className="current-number-value">{currentCalledNumber}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="playground-content">
//         {/* Bingo board */}
//         <Card className="bingo-board-card">
//           <div className="bingo-board">
//             {Object.entries(bingoRows).map(([letter, numbers]) => (
//               <div key={letter} className="bingo-row">
//                 <motion.div className="row-header" whileHover={{ scale: 1.05 }}>{letter}</motion.div>
//                 <div className="numbers-row">
//                   {numbers.map(num => (
//                     <motion.div
//                       key={num}
//                       className={`bingo-number ${calledNumbers.includes(num) ? 'called' : ''}`}
//                       whileHover={{ scale: 1.1 }}
//                       style={{
//                         backgroundColor: calledNumbers.includes(num) ? '#0ea5e9' : '',
//                         color: calledNumbers.includes(num) ? '#fff' : ''
//                       }}
//                       onClick={() => isGameActive && callSpecificNumber(num)}
//                     >
//                       {num}
//                     </motion.div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         {/* Sidebar */}
//         <div className="playground-sidebar">
//           <div className="control-panel">
//             {/* Conditional rendering based on game state */}
//             {isGameActive ? (
//               <>
//                 {/* Display current number button */}
//                 <Button
//                   className="control-btn display-number-btn"
//                   onClick={displayCurrentNumber}
//                   variant="outline"
//                 >
//                   {currentCalledNumber || 'Display Number'}
//                 </Button>

//                 {/* Call number button */}
//                 <Button
//                   className="control-btn call-btn"
//                   onClick={callRandomNumber}
//                   disabled={calledNumbers.length >= 75}
//                 >
//                   {t('playground.callNumber')}
//                 </Button>

//                 {/* Stop game button */}
//                 <Button
//                   className="control-btn stop-btn"
//                   onClick={stopGame}
//                   variant="destructive"
//                 >
//                   <X className="btn-icon" />
//                   {t('playground.stopGame')}
//                 </Button>
//               </>
//             ) : (
//               /* Start new game button (only when no active game) */
//               <Button className="control-btn start-btn" onClick={startNewGame}>
//                 <Play className="btn-icon" />
//                 {t('playground.startNewGame')}
//               </Button>
//             )}

//             {/* Shuffle button (always visible) */}
//             <Button className="control-btn shuffle-btn" onClick={shuffleNumbers} variant="outline">
//               <Shuffle className="btn-icon" />
//               {t('playground.shuffle')}
//             </Button>

//             {/* Auto-call section (only when game is active) */}
//             {isGameActive && (
//               <div className="auto-call-section">
//                 <label className="auto-call-label">
//                   <input
//                     type="checkbox"
//                     checked={autoCall}
//                     onChange={(e) => setAutoCall(e.target.checked)}
//                     className="auto-call-checkbox"
//                     disabled={calledNumbers.length >= 75}
//                   />
//                   {t('playground.autoCall')}
//                 </label>
//                 <span className="auto-call-timer">{autoCallTimer} {t('playground.seconds')}</span>
//               </div>
//             )}
//           </div>

//           {/* Cartela check */}
//           <Card className="cartela-check-card">
//             <h3>{t('playground.enterCartela')}</h3>
//             <Input
//               placeholder={t('playground.cartelaPlaceholder')}
//               value={cartelaInput}
//               onChange={(e) => setCartelaInput(e.target.value)}
//             />
//             <Button className="check-btn" onClick={checkCartela}>
//               <Check className="btn-icon" />
//               {t('playground.check')}
//             </Button>
//           </Card>

//           {/* Win money */}
//           <Card className="win-money-card">
//             <h3>{t('playground.winMoney')}</h3>
//             <div className="win-amount">
//               <span className="currency">{t('playground.birr')}</span>
//               <span className="amount">{calculateWinMoney()}</span>
//             </div>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Shuffle,
  Play,
  Check,
  X,
  Eye,
  Maximize,
  Minimize,
  Flame,
  Monitor,
  MoreHorizontal,
  Loader2,
  Trophy,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePopup } from "../contexts/PopupContext";
import { CartelaModal } from "../components/Cartela";
import { gamesApi } from "../services/api";

interface PlaygroundProps {
  gameConfig?: {
    game: string;
    betBirr: string;
    numPlayers: string;
    winBirr: string;
    selectedPatterns: number[];
    backendStatus?: "pending" | "active" | "completed" | "cancelled";
    gameCode?: string;
    cartelaNumbers?: string[];
    cartelaData?: number[][];
    drawSequence?: number[];
    cartellaStatuses?: Record<string, "active" | "banned" | "winner">;
  } | null;
  onStartNewGame?: () => void;
  onGameStateChange?: (isActive: boolean) => void;
  onCartelaRemoved?: (cartelaNumber: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const Playground: React.FC<PlaygroundProps> = ({
  gameConfig,
  onStartNewGame,
  onGameStateChange,
  onCartelaRemoved,
  onFullscreenChange,
}) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const popup = usePopup();

  const configuredAutoCallSeconds = Number.parseInt(
    localStorage.getItem("autoCallSeconds") || "5",
    10,
  );

  // State for called numbers & auto call
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [autoCall, setAutoCall] = useState(false);
  const [autoCallTimer, setAutoCallTimer] = useState(
    Number.isFinite(configuredAutoCallSeconds) && configuredAutoCallSeconds > 0
      ? configuredAutoCallSeconds
      : 5,
  );
  const [currentCalledNumber, setCurrentCalledNumber] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<
    "pending" | "active" | "completed" | "cancelled"
  >("pending");
  const [isCallingNumber, setIsCallingNumber] = useState(false);

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
  const [isCheckingCartela, setIsCheckingCartela] = useState(false);
  const [showBallPopup, setShowBallPopup] = useState(false);
  const [ballPopupLabel, setBallPopupLabel] = useState("");
  const [winnerCelebration, setWinnerCelebration] = useState<{
    cartela: string;
    pattern?: string | null;
  } | null>(null);
  const [callStreak, setCallStreak] = useState(0);
  const [streakBoost, setStreakBoost] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showFullscreenHud, setShowFullscreenHud] = useState(true);
  const [showRadialControls, setShowRadialControls] = useState(false);
  const boardContainerRef = React.useRef<HTMLDivElement | null>(null);
  const syncInFlightRef = React.useRef(false);
  const lastSyncErrorLogRef = React.useRef(0);
  const lastCallTimeRef = React.useRef(0);
  const lastAnimatedCalledRef = React.useRef<number | null>(null);
  const fullscreenHudTimeoutRef = React.useRef<number | null>(null);

  // Initialize game if config exists
  useEffect(() => {
    if (gameConfig && !isGameActive) {
      setIsGameActive(true);
      setGameStatus((gameConfig.backendStatus as any) || "pending");
      setActiveCartelas(gameConfig.cartelaNumbers || []);
      setServerCartelaOrder(gameConfig.cartelaNumbers || []);
      setCartellaStatuses(gameConfig.cartellaStatuses || {});
      setDrawSequence(gameConfig.drawSequence || []);
      setDrawCursor(0);
      onGameStateChange?.(gameConfig.backendStatus === "active");
      console.log("Game config loaded:", gameConfig);
    }
  }, [gameConfig]);

  useEffect(() => {
    const saved = Number.parseInt(
      localStorage.getItem("autoCallSeconds") || "5",
      10,
    );
    if (Number.isFinite(saved) && saved > 0) {
      setAutoCallTimer(saved);
    }
  }, []);

  // Sync activeCartelas with gameConfig changes
  useEffect(() => {
    if (gameConfig?.cartelaNumbers) {
      setActiveCartelas(gameConfig.cartelaNumbers);
    }
  }, [gameConfig?.cartelaNumbers]);

  const cartelaDataMap = React.useMemo(() => {
    const numbers = gameConfig?.cartelaData || [];
    const entries = serverCartelaOrder.map((cartelaNumber, index) => {
      const data = numbers[index] || [];
      return [cartelaNumber, data] as const;
    });
    return Object.fromEntries(entries);
  }, [gameConfig?.cartelaData, serverCartelaOrder]);

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

  // Notify parent when game state changes
  useEffect(() => {
    onGameStateChange?.(isGameActive && gameStatus === "active");
  }, [isGameActive, gameStatus]);

  const mapNumberToLabel = (number: number) => {
    const letter = getNumberLetter(number);
    return `${letter}${number}`;
  };

  const triggerCalledBall = (label: string, calledNumber?: number | null) => {
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
  ) => {
    const playWinnerCelebrationSound = () => {
      if (typeof window === "undefined") return;
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const startTime = audioContext.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((frequency, index) => {
        const noteStart = startTime + index * 0.11;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, noteStart);

        gainNode.gain.setValueAtTime(0.0001, noteStart);
        gainNode.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.13);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.14);
      });

      window.setTimeout(() => {
        void audioContext.close();
      }, 900);
    };

    setWinnerCelebration({ cartela: cartelaNumber, pattern: pattern || null });
    playWinnerCelebrationSound();
    window.setTimeout(() => setWinnerCelebration(null), 4200);
  };

  const winnerConfetti = React.useMemo(
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

  const syncGameState = async () => {
    if (!gameConfig?.gameCode || syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    try {
      const state = await gamesApi.getGameState(gameConfig.gameCode);
      setGameStatus(state.status as any);
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
    if (!gameConfig?.gameCode) return;
    void syncGameState();
    const interval = window.setInterval(() => {
      void syncGameState();
    }, 3000);
    return () => window.clearInterval(interval);
  }, [gameConfig?.gameCode]);

  // Auto-call functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      autoCall &&
      isGameActive &&
      gameStatus === "active" &&
      calledNumbers.length < 75
    ) {
      interval = setInterval(() => {
        setAutoCallTimer((prev) => {
          if (prev <= 1) {
            callRandomNumber();
            return (
              Number.parseInt(
                localStorage.getItem("autoCallSeconds") || "5",
                10,
              ) || 5
            );
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [autoCall, isGameActive, calledNumbers]);

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
  const callRandomNumber = async () => {
    if (!gameConfig?.gameCode || isCallingNumber) return;
    if (gameStatus !== "active") {
      popup.info("Start the game first.");
      return;
    }

    setIsCallingNumber(true);
    try {
      const response = await gamesApi.nextGameCall(gameConfig.gameCode);
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
        popup.info("All 75 numbers have been called.");
      }
    } catch (error) {
      console.error("Failed to call next number", error);
      popup.error("Failed to get next number from backend.");
    } finally {
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
    const winnerIndex = getServerCartelaIndex(cartelaNumber);
    if (winnerIndex < 0) {
      popup.error(`Cartela ${cartelaNumber} not found in this game.`);
      return;
    }

    if (getCartellaStatusByNumber(cartelaNumber) === "banned") {
      popup.error("Banned.");
      return;
    }

    try {
      if (gameConfig?.gameCode) {
        const claim = await gamesApi.claimGame(gameConfig.gameCode, {
          cartella_index: winnerIndex,
        });

        if (claim.cartella_statuses) {
          setCartellaStatuses(claim.cartella_statuses);
        }

        if (!claim.is_bingo) {
          if (claim.is_banned) {
            popup.error("Banned.");
            return;
          }
          popup.warning(
            claim.detail || "No bingo found yet (row or diagonal only).",
          );
          return;
        }

        const patternText = claim.pattern ? `\nPattern: ${claim.pattern}` : "";
        const payoutText = claim.payout_amount
          ? `\nPayout: ${claim.payout_amount}`
          : "";
        const cutText = claim.shop_cut_amount
          ? `\nShop Cut: ${claim.shop_cut_amount}`
          : "";

        triggerWinnerCelebration(cartelaNumber, claim.pattern);
        setGameStatus("completed");
        setIsGameActive(false);
        setAutoCall(false);
        onGameStateChange?.(false);
        popup.success(
          `🎉 BINGO! Cartela ${cartelaNumber} WON!\nGame closed.${patternText}${payoutText}${cutText}`,
        );
        return;
      }
    } catch (error) {
      console.error("Failed to complete game", error);
      popup.error("Failed to complete game on the server.");
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
    if (activeCartelas.length === 0) {
      popup.warning("No cartelas in this game");
      return;
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
      popup.error("Banned.");
      return;
    }

    if (!gameConfig?.gameCode) {
      popup.error("No backend game code found for validation.");
      return;
    }

    setIsCheckingCartela(true);
    try {
      const claim = await gamesApi.claimGame(gameConfig.gameCode, {
        cartella_index: cartellaIndex,
      });

      if (claim.cartella_statuses) {
        setCartellaStatuses(claim.cartella_statuses);
      }

      if (claim.is_bingo) {
        const patternText = claim.pattern ? ` (${claim.pattern})` : "";
        const payoutText = claim.payout_amount
          ? `\nPayout: ${claim.payout_amount}`
          : "";
        const cutText = claim.shop_cut_amount
          ? `\nShop Cut: ${claim.shop_cut_amount}`
          : "";

        triggerWinnerCelebration(matchedCartela, claim.pattern);
        setGameStatus("completed");
        setIsGameActive(false);
        setAutoCall(false);
        onGameStateChange?.(false);
        popup.success(
          `🎉 BINGO${patternText}! Player with Cartela ${matchedCartela} WON!\nGame closed.${payoutText}${cutText}`,
        );
        return;
      }

      if (claim.is_banned) {
        popup.error("Banned.");
        return;
      }

      popup.warning(
        claim.detail || "No bingo found yet (row or diagonal only).",
      );
    } catch (error) {
      console.error("Failed to validate cartela", error);
      popup.error("Failed to validate cartela on the server.");
    } finally {
      setIsCheckingCartela(false);
    }
  };

  // Stop the current game
  const stopGame = async () => {
    const confirmed = await popup.confirm({
      title: "Stop game",
      description: "Are you sure you want to stop the current game?",
      confirmText: "Stop",
      cancelText: "Continue",
    });

    if (confirmed) {
      try {
        if (gameConfig?.gameCode) {
          await gamesApi.completeGame(gameConfig.gameCode, {
            status: "cancelled",
            winners: [],
          });
        }
      } catch (error) {
        console.error("Failed to cancel game", error);
      }

      setIsGameActive(false);
      setGameStatus("cancelled");
      setAutoCall(false);
      setAutoCallTimer(
        Number.parseInt(localStorage.getItem("autoCallSeconds") || "5", 10) ||
          5,
      );
      setCurrentCalledNumber("");
      setShowCartelaModal(false);
      setSelectedCartela("");
      onGameStateChange?.(false);
    }
  };

  const startGame = async () => {
    if (!gameConfig?.gameCode) return;
    try {
      await gamesApi.startGame(gameConfig.gameCode);
      setGameStatus("active");
      setIsGameActive(true);
      setAutoCallTimer(
        Number.parseInt(localStorage.getItem("autoCallSeconds") || "5", 10) ||
          5,
      );
      popup.success("Game started.");
      await syncGameState();
    } catch (error) {
      console.error("Failed to start game", error);
      popup.error("Failed to start game.");
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

    setIsShuffling(true);

    reshuffleBoard();
    setCalledNumbers([]);
    setCurrentCalledNumber("");
    popup.info(t("playground.shuffleAnimated"));
    window.setTimeout(() => setIsShuffling(false), 650);
  };

  const calculateWinMoney = () => {
    if (gameConfig?.winBirr && gameConfig.winBirr !== "0") {
      return parseInt(gameConfig.winBirr);
    }
    return calledNumbers.length * 10;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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
    onFullscreenChange?.(isFullscreen);
    return () => {
      onFullscreenChange?.(false);
    };
  }, [isFullscreen, onFullscreenChange]);

  useEffect(() => {
    if (!isGameActive || gameStatus !== "active") {
      setCallStreak(0);
      return;
    }

    const streakDecay = window.setInterval(() => {
      setCallStreak((prev) => (prev > 0 ? prev - 1 : 0));
    }, 9000);

    return () => window.clearInterval(streakDecay);
  }, [isGameActive, gameStatus]);

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

  return (
    <div className={`space-y-4 ${isFullscreen ? "p-0" : "p-6"}`}>
      {/* Cartela Modal */}
      <CartelaModal
        isOpen={showCartelaModal}
        onClose={() => setShowCartelaModal(false)}
        cartelaNumber={selectedCartela}
        calledNumbers={calledNumbers}
        cartelaNumbers={activeCartelas}
        cartelaDataMap={cartelaDataMap}
        onDeclareWinner={handleDeclareWinner}
        onRemovePlayer={handleRemovePlayer}
        gameActive={isGameActive}
      />

      {/* Header */}
      <div className={isFullscreen ? "hidden" : "block"}>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <span className="mr-1 text-xs uppercase text-slate-500">
              {t("playground.game")}
            </span>
            <span className="font-semibold">{gameConfig?.game || "F-am"}</span>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <span className="mr-1 text-xs uppercase text-slate-500">
              {t("playground.stake")}
            </span>
            <span className="font-semibold">
              {gameConfig?.betBirr ? `${gameConfig.betBirr} BIRR` : "BINGO"}
            </span>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-800">
            <span className="mr-1 text-xs uppercase text-slate-500">
              {t("playground.winPrice")}
            </span>
            <span className="font-semibold">{calculateWinMoney()}</span>
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
        </div>
      </div>

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

      {/* Main content */}
      <div className="space-y-4">
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
                    {calledNumbers.length}/75 CALLED
                  </span>
                  <motion.span
                    className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 font-bold text-slate-900"
                    animate={
                      streakBoost ? { scale: [1, 1.12, 1] } : { scale: 1 }
                    }
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
                  <div
                    className={`grid gap-2 md:gap-3 grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15`}
                  >
                    {numbers.map((num) => (
                      <motion.div
                        key={num}
                        className={`flex cursor-pointer items-center justify-center rounded-xl border-2 font-bold transition-all shadow-sm ${isFullscreen ? (isTheaterMode ? "h-12 text-lg sm:h-14 sm:text-xl md:h-16 md:text-2xl" : "h-10 text-base sm:h-12 sm:text-lg md:h-14 md:text-xl") : "h-12 md:h-16 lg:h-20 text-lg md:text-xl lg:text-2xl"} ${calledNumbers.includes(num) ? "border-sky-500 bg-sky-500 text-white shadow-sky-500/30 font-black scale-[1.02]" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"}`}
                        whileHover={{ scale: 1.1 }}
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

        <AnimatePresence>
          {winnerCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none fixed inset-0 z-[1400] flex items-center justify-center bg-black/55 px-4"
            >
              <motion.div
                initial={{ scale: 0.6, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.85, y: 20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 14 }}
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-200 bg-linear-to-br from-amber-100 via-orange-100 to-yellow-100 p-6 text-center shadow-2xl sm:p-10"
              >
                <div className="pointer-events-none absolute inset-0">
                  {winnerConfetti.map((piece) => (
                    <motion.div
                      key={piece.id}
                      className={`absolute top-[-18px] left-1/2 rounded-sm ${piece.colorClass}`}
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
                <div className="mt-5 text-sm font-medium text-slate-700 sm:text-base">
                  🎉 Congratulations to the winner!
                </div>
              </motion.div>
            </motion.div>
          )}

          {isCheckingCartela && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1350] flex items-center justify-center bg-black/40 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 10, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 8, opacity: 0 }}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Checking cartela...
                </span>
              </motion.div>
            </motion.div>
          )}

          {showBallPopup && ballPopupLabel && (
            <motion.div
              key={ballPopupLabel}
              initial={{ opacity: 0, scale: 0.35, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -40 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="pointer-events-none fixed inset-0 z-1200 flex items-center justify-center"
            >
              <motion.div
                className={`${isFullscreen ? "h-36 w-36 text-5xl" : "h-28 w-28 text-4xl"} flex items-center justify-center rounded-full border-4 border-white/60 bg-linear-to-br from-red-400 via-red-600 to-red-800 font-black text-white shadow-[0_0_45px_rgba(239,68,68,0.65)]`}
                animate={{ rotate: [0, -4, 4, 0] }}
                transition={{ duration: 0.35 }}
              >
                {ballPopupLabel}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls below board */}
        {isFullscreen && (
          <>
            <div className="pointer-events-none fixed right-5 bottom-5 z-1150 flex flex-col items-end gap-3 sm:right-7 sm:bottom-7">
              <AnimatePresence>
                {showFullscreenHud && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${theme === "dark" ? "border border-slate-500/50 bg-slate-900/70 text-slate-100" : "border border-slate-300 bg-white/95 text-slate-700"}`}
                  >
                    Heat{" "}
                    {Math.min(
                      100,
                      Math.round((calledNumbers.length / 75) * 100),
                    )}
                    %
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
                      disabled={gameStatus !== "pending" || isShuffling}
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-55 ${theme === "dark" ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
                      title="Shuffle"
                      aria-label="Shuffle"
                    >
                      <Shuffle className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (gameStatus === "active") {
                          setAutoCall((prev) => !prev);
                        }
                      }}
                      disabled={
                        gameStatus !== "active" || calledNumbers.length >= 75
                      }
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
                            disabled={gameStatus !== "pending" || isShuffling}
                            className={`absolute inline-flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition disabled:opacity-55 ${theme === "dark" ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-slate-200 text-slate-900 hover:bg-slate-300"}`}
                            title="Shuffle"
                            aria-label="Shuffle"
                          >
                            <Shuffle className="h-4 w-4" />
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
                              gameStatus !== "active" ||
                              calledNumbers.length >= 75
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
                  calledNumbers.length >= 75 ||
                  gameStatus === "completed" ||
                  gameStatus === "cancelled"
                }
                className="pointer-events-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.75)] transition hover:scale-105 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                title={gameStatus === "pending" ? "Start game" : "Call number"}
                aria-label={
                  gameStatus === "pending" ? "Start game" : "Call number"
                }
              >
                {gameStatus === "pending" ? (
                  <Play className="h-8 w-8" />
                ) : (
                  <span className="text-xs font-black tracking-wider">
                    CALL
                  </span>
                )}
              </button>
            </div>
          </>
        )}

        {!isFullscreen && (
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Game Controls
              </h3>

              <div className="space-y-2">
                {gameStatus === "active" ? (
                  <>
                    {/* Display current number button */}
                    <Button
                      className="h-10 w-full"
                      onClick={displayCurrentNumber}
                      variant="outline"
                    >
                      {currentCalledNumber || "Display Number"}
                    </Button>

                    {/* Call number button */}
                    <Button
                      className="h-10 w-full bg-red-700 text-white hover:bg-red-800"
                      onClick={callRandomNumber}
                      disabled={calledNumbers.length >= 75 || isCallingNumber}
                    >
                      {isCallingNumber
                        ? "Calling..."
                        : t("playground.callNumber")}
                    </Button>

                    {/* Stop game button */}
                    <Button
                      className="h-10 w-full"
                      onClick={stopGame}
                      variant="destructive"
                    >
                      <X className="mr-1 h-4 w-4" />
                      {t("playground.stopGame")}
                    </Button>
                  </>
                ) : gameStatus === "pending" ? (
                  <>
                    <Button
                      className="h-10 w-full"
                      onClick={shuffleNumbers}
                      variant="outline"
                    >
                      <Shuffle className="mr-1 h-4 w-4" /> Shuffle More
                    </Button>
                    <Button
                      className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={startGame}
                    >
                      <Play className="mr-1 h-4 w-4" /> Start Game
                    </Button>
                  </>
                ) : (
                  /* Start new game button (completed/cancelled) */
                  <Button
                    className="h-10 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={onStartNewGame}
                  >
                    <Play className="mr-1 h-4 w-4" />
                    {t("playground.startNewGame")}
                  </Button>
                )}

                {/* Auto-call section (only when game is active) */}
                {gameStatus === "active" && (
                  <div className="rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={autoCall}
                        onChange={(e) => setAutoCall(e.target.checked)}
                        className="h-4 w-4 rounded"
                        disabled={calledNumbers.length >= 75}
                      />
                      {t("playground.autoCall")}
                    </label>
                    <span className="mt-2 block text-xs text-slate-500">
                      {autoCallTimer} {t("playground.seconds")}
                    </span>
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
                <Eye className="mr-1 h-4 w-4" />{" "}
                {t("playground.viewAllCartelas")}
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
                {activeCartelas.length
                  ? `${activeCartelas.length} ${t("playground.cartelasInGame")}`
                  : t("playground.noCartelasInGame")}
              </div>
            </Card>

            <Card className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white p-4 dark:border-emerald-700/50 dark:from-emerald-900/20 dark:to-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                {t("playground.winMoney")}
              </h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-base font-medium text-emerald-700 dark:text-emerald-300">
                  {t("playground.birr")}
                </span>
                <span className="text-4xl font-black leading-none text-emerald-700 dark:text-emerald-300">
                  {calculateWinMoney()}
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
