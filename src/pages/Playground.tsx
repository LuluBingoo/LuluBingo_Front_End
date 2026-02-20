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
import { motion } from "motion/react";
import { Shuffle, Play, Check, X, Eye, Maximize, Minimize } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
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
    gameCode?: string;
    cartelaNumbers?: string[];
    cartelaData?: number[][];
    drawSequence?: number[];
  } | null;
  onStartNewGame?: () => void;
  onGameStateChange?: (isActive: boolean) => void;
  onCartelaRemoved?: (cartelaNumber: string) => void;
}

export const Playground: React.FC<PlaygroundProps> = ({
  gameConfig,
  onStartNewGame,
  onGameStateChange,
  onCartelaRemoved,
}) => {
  const { t } = useLanguage();
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
  const boardContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Initialize game if config exists
  useEffect(() => {
    if (gameConfig && !isGameActive) {
      setIsGameActive(true);
      setGameStatus((gameConfig.backendStatus as any) || "pending");
      setActiveCartelas(gameConfig.cartelaNumbers || []);
      setServerCartelaOrder(gameConfig.cartelaNumbers || []);
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

  const getServerCartelaIndex = (cartelaNumber: string) => {
    const serverIndex = serverCartelaOrder.indexOf(cartelaNumber);
    if (serverIndex >= 0) {
      return serverIndex;
    }
    return activeCartelas.indexOf(cartelaNumber);
  };

  // Notify parent when game state changes
  useEffect(() => {
    onGameStateChange?.(isGameActive && gameStatus === "active");
  }, [isGameActive, gameStatus]);

  const mapNumberToLabel = (number: number) => {
    const letter = getNumberLetter(number);
    return `${letter}${number}`;
  };

  const syncGameState = async () => {
    if (!gameConfig?.gameCode) return;
    try {
      const state = await gamesApi.getGameState(gameConfig.gameCode);
      setGameStatus(state.status as any);
      setCalledNumbers(state.called_numbers || []);
      if (state.current_called_number) {
        setCurrentCalledNumber(
          state.current_called_formatted ||
            mapNumberToLabel(state.current_called_number),
        );
      } else {
        setCurrentCalledNumber("");
      }
      setDrawCursor(state.call_cursor || 0);
    } catch (error) {
      console.error("Failed to sync game state", error);
    }
  };

  useEffect(() => {
    if (!gameConfig?.gameCode) return;
    syncGameState();
    const interval = window.setInterval(syncGameState, 2000);
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

    try {
      if (gameConfig?.gameCode) {
        const claim = await gamesApi.claimGame(gameConfig.gameCode, {
          cartella_index: winnerIndex,
          called_numbers: [...new Set(calledNumbers)],
        });

        if (!claim.is_bingo) {
          popup.warning(
            `Cartela ${cartelaNumber} is not a valid winner yet.\nCalled: ${claim.matched_count}/${claim.required_count}`,
          );
          return;
        }

        await gamesApi.completeGame(gameConfig.gameCode, {
          status: "completed",
          winners: [winnerIndex],
        });
      }
      popup.success(
        `🎉 Cartela ${cartelaNumber} declared as WINNER!\n\nGame completed.`,
      );
      setIsGameActive(false);
      setAutoCall(false);
      onGameStateChange?.(false);
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

    const cartelaNumber = cartelaInput.padStart(3, "0");
    const isValid = activeCartelas.includes(cartelaNumber);

    if (!isValid) {
      setCartelaError(`Cartela ${cartelaNumber} not in game`);
      setTimeout(() => setCartelaError(""), 3000);
      return;
    }

    setSelectedCartela(cartelaNumber);
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

    const cartelaNumber = cartelaInput.padStart(3, "0");
    const isValid = activeCartelas.includes(cartelaNumber);

    if (!isValid) {
      popup.error(`Cartela ${cartelaNumber} not in game`);
      return;
    }

    const cartellaIndex = getServerCartelaIndex(cartelaNumber);
    if (cartellaIndex < 0) {
      popup.error(`Cartela ${cartelaNumber} not found in server order`);
      return;
    }

    if (!gameConfig?.gameCode) {
      popup.error("No backend game code found for validation.");
      return;
    }

    try {
      const claim = await gamesApi.claimGame(gameConfig.gameCode, {
        cartella_index: cartellaIndex,
        called_numbers: [...new Set(calledNumbers)],
      });

      if (claim.is_bingo) {
        popup.success(`🎉 Cartela ${cartelaNumber} has BINGO!`);
        return;
      }

      const needed = Math.max(0, claim.required_count - claim.matched_count);
      popup.info(
        `Cartela ${cartelaNumber} is active.\nCalled: ${claim.matched_count}/${claim.required_count}\nRemaining: ${needed}`,
      );
    } catch (error) {
      console.error("Failed to validate cartela", error);
      popup.error("Failed to validate cartela on the server.");
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
    if (!gameConfig?.gameCode) return;
    if (gameStatus !== "pending") {
      popup.warning("Shuffle is locked after game starts.");
      return;
    }

    setIsShuffling(true);
    void (async () => {
      try {
        await gamesApi.shuffleGame(gameConfig.gameCode);
        reshuffleBoard();
        setCalledNumbers([]);
        setCurrentCalledNumber("");
        popup.info(t("playground.shuffleAnimated"));
        await syncGameState();
      } catch (error) {
        console.error("Failed to shuffle game", error);
        popup.error("Failed to shuffle from backend.");
      } finally {
        window.setTimeout(() => setIsShuffling(false), 650);
      }
    })();
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

  return (
    <div className="space-y-4 p-6">
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
      <div>
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
      {cartelaError && (
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

      {/* Main content */}
      <div className="space-y-4">
        <div
          ref={boardContainerRef}
          className={`transition-all duration-300 ${
            isFullscreen
              ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-100 p-4 dark:bg-slate-950 sm:p-8 overflow-y-auto"
              : "w-full"
          }`}
        >
          <Card
            className={`space-y-3 p-4 w-full ${isFullscreen ? "max-w-7xl mx-auto flex-1 flex flex-col justify-center" : ""}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Bingo Board
              </h3>
              <Button
                variant="outline"
                onClick={toggleFullscreen}
                className="h-9"
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
              className="space-y-2"
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
                  className="grid grid-cols-[64px_1fr] md:grid-cols-[80px_1fr] items-center gap-2 md:gap-4"
                >
                  <motion.div
                    className="flex h-12 md:h-16 lg:h-20 items-center justify-center rounded-xl bg-red-700 text-3xl md:text-4xl lg:text-5xl font-black text-white shadow-md w-full"
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
                        className={`flex h-12 md:h-16 lg:h-20 cursor-pointer items-center justify-center rounded-xl border-2 text-lg md:text-xl lg:text-2xl font-bold transition-all shadow-sm ${calledNumbers.includes(num) ? "border-sky-500 bg-sky-500 text-white shadow-sky-500/30 font-black scale-[1.02]" : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-600"}`}
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

        {/* Controls below board */}
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
                disabled={!isGameActive}
              >
                <Check className="mr-1 h-4 w-4" /> {t("playground.check")}
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
      </div>
    </div>
  );
};
