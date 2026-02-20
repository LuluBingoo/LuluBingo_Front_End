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
import { Shuffle, Play, Check, X, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import { CartelaModal } from "../components/Cartela";
import { gamesApi } from "../services/api";
import "./Playground.css";

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

  // State for called numbers & auto call
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [autoCall, setAutoCall] = useState(false);
  const [autoCallTimer, setAutoCallTimer] = useState(11);
  const [currentCalledNumber, setCurrentCalledNumber] = useState<string>("");

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

  // Initialize game if config exists
  useEffect(() => {
    if (gameConfig && !isGameActive) {
      setIsGameActive(true);
      setActiveCartelas(gameConfig.cartelaNumbers || []);
      setServerCartelaOrder(gameConfig.cartelaNumbers || []);
      setDrawSequence(gameConfig.drawSequence || []);
      setDrawCursor(0);
      onGameStateChange?.(true);
      console.log("Game config loaded:", gameConfig);
    }
  }, [gameConfig]);

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
    onGameStateChange?.(isGameActive);
  }, [isGameActive]);

  // Auto-call functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoCall && isGameActive && calledNumbers.length < 75) {
      interval = setInterval(() => {
        setAutoCallTimer((prev) => {
          if (prev <= 1) {
            callRandomNumber();
            return 11;
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
  const callRandomNumber = () => {
    const availableSequence = drawSequence.length
      ? drawSequence
      : Array.from({ length: 75 }, (_, i) => i + 1);

    if (drawCursor < availableSequence.length) {
      const newNumber = availableSequence[drawCursor];
      if (calledNumbers.includes(newNumber)) {
        setDrawCursor((previous) => previous + 1);
        return;
      }

      const letter = getNumberLetter(newNumber);
      setCalledNumbers((prev) => [...prev, newNumber]);
      setCurrentCalledNumber(`${letter} ${newNumber}`);
      setDrawCursor((previous) => previous + 1);
    }
  };

  // Manually call a specific number
  const callSpecificNumber = (number: number) => {
    if (!calledNumbers.includes(number)) {
      const letter = getNumberLetter(number);
      setCalledNumbers((prev) => [...prev, number]);
      setCurrentCalledNumber(`${letter} ${number}`);
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
      setAutoCall(false);
      setAutoCallTimer(11);
      setCurrentCalledNumber("");
      setShowCartelaModal(false);
      setSelectedCartela("");
      onGameStateChange?.(false);
    }
  };

  // Start a new game
  const startNewGame = async () => {
    const confirmed = await popup.confirm({
      title: "Start new game",
      description: "Start a new game? This will reset everything.",
      confirmText: "Start",
      cancelText: "Cancel",
    });

    if (confirmed) {
      setCalledNumbers([]);
      setAutoCall(false);
      setAutoCallTimer(11);
      setIsGameActive(true);
      setCurrentCalledNumber("");
      setShowCartelaModal(false);
      setSelectedCartela("");
      setCartelaInput("");
      setCartelaError("");

      // Reshuffle Bingo board
      reshuffleBoard();

      if (onStartNewGame) onStartNewGame();
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
    void (async () => {
      const confirmed = await popup.confirm({
        title: "Shuffle board",
        description: "Shuffle numbers inside columns?",
        confirmText: "Shuffle",
        cancelText: "Cancel",
      });
      if (confirmed) {
        reshuffleBoard();
      }
    })();
  };

  const calculateWinMoney = () => {
    if (gameConfig?.winBirr && gameConfig.winBirr !== "0") {
      return parseInt(gameConfig.winBirr);
    }
    return calledNumbers.length * 10;
  };

  return (
    <div className="playground">
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
      <div className="playground-header">
        <div className="game-info-bar">
          <div className="info-item">
            <span className="info-label">{t("playground.game")}</span>
            <span className="info-value">{gameConfig?.game || "F-am"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t("playground.stake")}</span>
            <span className="info-value">
              {gameConfig?.betBirr ? `${gameConfig.betBirr} BIRR` : "BINGO"}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">{t("playground.winPrice")}</span>
            <span className="info-value">{calculateWinMoney()}</span>
          </div>
          <div className="info-item highlight">
            <span className="calls-count">
              {calledNumbers.length} {t("playground.called")}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Cartelas:</span>
            <span className="info-value">{activeCartelas.length || 0}</span>
          </div>
          {currentCalledNumber && (
            <div className="info-item current-number-display">
              <span className="current-number-label">Current:</span>
              <span className="current-number-value">
                {currentCalledNumber}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error toast */}
      {cartelaError && (
        <div className="error-toast">
          {cartelaError}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCartelaError("")}
            className="toast-close"
          >
            <X size={14} />
          </Button>
        </div>
      )}

      {/* Main content */}
      <div className="playground-content">
        {/* Left side - Bingo board */}
        <div className="playground-left">
          <Card className="bingo-board-card">
            <div className="bingo-board">
              {Object.entries(bingoRows).map(([letter, numbers]) => (
                <div key={letter} className="bingo-row">
                  <motion.div
                    className="row-header"
                    whileHover={{ scale: 1.05 }}
                  >
                    {letter}
                  </motion.div>
                  <div className="numbers-row">
                    {numbers.map((num) => (
                      <motion.div
                        key={num}
                        className={`bingo-number ${calledNumbers.includes(num) ? "called" : ""}`}
                        whileHover={{ scale: 1.1 }}
                        style={{
                          backgroundColor: calledNumbers.includes(num)
                            ? "#0ea5e9"
                            : "",
                          color: calledNumbers.includes(num) ? "#fff" : "",
                        }}
                        onClick={() => isGameActive && callSpecificNumber(num)}
                      >
                        {num}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right side - Controls */}
        <div className="playground-right">
          <div className="playground-sidebar">
            <div className="control-panel">
              {/* Conditional rendering based on game state */}
              {isGameActive ? (
                <>
                  {/* Display current number button */}
                  <Button
                    className="control-btn display-number-btn"
                    onClick={displayCurrentNumber}
                    variant="outline"
                  >
                    {currentCalledNumber || "Display Number"}
                  </Button>

                  {/* Call number button */}
                  <Button
                    className="control-btn call-btn"
                    onClick={callRandomNumber}
                    disabled={calledNumbers.length >= 75}
                  >
                    {t("playground.callNumber")}
                  </Button>

                  {/* Stop game button */}
                  <Button
                    className="control-btn stop-btn"
                    onClick={stopGame}
                    variant="destructive"
                  >
                    <X className="btn-icon" />
                    {t("playground.stopGame")}
                  </Button>
                </>
              ) : (
                /* Start new game button (only when no active game) */
                <Button
                  className="control-btn start-btn"
                  onClick={startNewGame}
                >
                  <Play className="btn-icon" />
                  {t("playground.startNewGame")}
                </Button>
              )}

              {/* Shuffle button (always visible) */}
              <Button
                className="control-btn shuffle-btn"
                onClick={shuffleNumbers}
                variant="outline"
              >
                <Shuffle className="btn-icon" />
                {t("playground.shuffle")}
              </Button>

              {/* Auto-call section (only when game is active) */}
              {isGameActive && (
                <div className="auto-call-section">
                  <label className="auto-call-label">
                    <input
                      type="checkbox"
                      checked={autoCall}
                      onChange={(e) => setAutoCall(e.target.checked)}
                      className="auto-call-checkbox"
                      disabled={calledNumbers.length >= 75}
                    />
                    {t("playground.autoCall")}
                  </label>
                  <span className="auto-call-timer">
                    {autoCallTimer} {t("playground.seconds")}
                  </span>
                </div>
              )}
            </div>

            {/* Cartela search */}
            <Card className="cartela-check-card">
              <h3>Check Cartela</h3>
              <Button
                className="view-all-btn"
                onClick={openCartelaModal}
                disabled={!isGameActive}
              >
                <Eye className="btn-icon" />
                View All Cartelas
              </Button>
              <div className="or-divider">
                <span>or enter specific number</span>
              </div>
              <Input
                placeholder="Enter cartela number (e.g., 001)"
                value={cartelaInput}
                onChange={(e) => setCartelaInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") viewCartela();
                }}
                disabled={!isGameActive}
              />
              <div className="cartela-buttons">
                <Button
                  className="check-btn"
                  onClick={checkCartela}
                  disabled={!isGameActive}
                >
                  <Check className="btn-icon" />
                  Check
                </Button>
                <Button
                  className="view-btn"
                  onClick={viewCartela}
                  variant="outline"
                  disabled={!isGameActive}
                >
                  <Eye className="btn-icon" />
                  View
                </Button>
              </div>
              <div className="cartela-info-hint">
                {activeCartelas.length
                  ? `${activeCartelas.length} cartela(s) in game`
                  : "No cartelas in this game"}
              </div>
            </Card>

            {/* Win money */}
            <Card className="win-money-card">
              <h3>{t("playground.winMoney")}</h3>
              <div className="win-amount">
                <span className="currency">{t("playground.birr")}</span>
                <span className="amount">{calculateWinMoney()}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
