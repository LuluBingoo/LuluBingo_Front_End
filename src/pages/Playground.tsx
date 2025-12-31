// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { Shuffle, Play, Check } from 'lucide-react';
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

// export const Playground: React.FC<PlaygroundProps> = ({ 
//   gameConfig, 
//   onStartNewGame 
// }) => {
//   const { t } = useLanguage();
//   const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
//   const [autoCall, setAutoCall] = useState(false);
//   const [cartelaInput, setCartelaInput] = useState('');
//   const [autoCallTimer, setAutoCallTimer] = useState(11);
//   const [isGameActive, setIsGameActive] = useState(false);

//   const bingoRows = {
//     B: Array.from({ length: 15 }, (_, i) => i + 1),
//     I: Array.from({ length: 15 }, (_, i) => i + 16),
//     N: Array.from({ length: 15 }, (_, i) => i + 31),
//     G: Array.from({ length: 15 }, (_, i) => i + 46),
//     O: Array.from({ length: 15 }, (_, i) => i + 61),
//   };

//   // Initialize game if config exists
//   useEffect(() => {
//     if (gameConfig && !isGameActive) {
//       setIsGameActive(true);
//       // You could use gameConfig data here to set up the game
//       console.log('Game config loaded:', gameConfig);
//     }
//   }, [gameConfig]);

//   // Auto-call functionality
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (autoCall && isGameActive && calledNumbers.length < 75) {
//       interval = setInterval(() => {
//         setAutoCallTimer((prev) => {
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

//   const callRandomNumber = () => {
//     const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
//     const uncalledNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
//     if (uncalledNumbers.length > 0) {
//       const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
//       const newNumber = uncalledNumbers[randomIndex];
//       setCalledNumbers(prev => [...prev, newNumber]);
//     }
//   };

//   const handleNumberClick = (num: number) => {
//     setCalledNumbers(prev => 
//       prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
//     );
//   };

//   const startNewGame = () => {
//     if (window.confirm('Start a new game? This will reset all called numbers.')) {
//       if (onStartNewGame) {
//         // Use the prop to navigate back
//         onStartNewGame();
//       } else {
//         // Fallback to local reset
//         setCalledNumbers([]);
//         setAutoCallTimer(11);
//         setIsGameActive(true);
//         setAutoCall(false);
//       }
//     }
//   };

//   const shuffleNumbers = () => {
//     if (window.confirm('Shuffle will randomly call 5 numbers. Continue?')) {
//       const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
//       const uncalledNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
//       const numbersToCall = Math.min(5, uncalledNumbers.length);
      
//       for (let i = 0; i < numbersToCall; i++) {
//         setTimeout(() => {
//           const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
//           const newNumber = uncalledNumbers.splice(randomIndex, 1)[0];
//           setCalledNumbers(prev => [...prev, newNumber]);
//         }, i * 300);
//       }
//     }
//   };

//   const checkCartela = () => {
//     if (!cartelaInput.trim()) {
//       alert('Please enter a cartela number');
//       return;
//     }
//     alert(`Checking cartela: ${cartelaInput}\nThis would validate the cartela against called numbers.`);
//   };

//   const calculateWinMoney = () => {
//     // Use game config if available, otherwise default calculation
//     if (gameConfig?.winBirr && gameConfig.winBirr !== '0') {
//       return parseInt(gameConfig.winBirr);
//     }
//     return calledNumbers.length * 10;
//   };

//   return (
//     <div className="playground">
//       <div className="playground-header">
//         <div className="game-info-bar">
//           <div className="info-item">
//             <span className="info-label">{t('playground.game')}</span>
//             <span className="info-value">
//               {gameConfig?.game || 'F-am'}
//             </span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">{t('playground.stake')}</span>
//             <span className="info-value">
//               {gameConfig?.betBirr ? `${gameConfig.betBirr} BIRR` : 'BINGO'}
//             </span>
//           </div>
//           <div className="info-item">
//             <span className="info-label">{t('playground.winPrice')}</span>
//             <span className="info-value">{calculateWinMoney()}</span>
//           </div>
//           <div className="info-item highlight">
//             <span className="calls-count">{calledNumbers.length} {t('playground.called')}</span>
//           </div>
//           {gameConfig && (
//             <div className="info-item">
//               <span className="info-label">Players</span>
//               <span className="info-value">{gameConfig.numPlayers}</span>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="playground-content">
//         <Card className="bingo-board-card">
//           <div className="bingo-board">
//             {Object.entries(bingoRows).map(([letter, numbers]) => (
//               <div key={letter} className="bingo-row">
//                 <motion.div 
//                   className="row-header"
//                   whileHover={{ scale: 1.05 }}
//                 >
//                   {letter}
//                 </motion.div>
//                 <div className="numbers-row">
//                   {numbers.map((num) => (
//                     <motion.button
//                       key={num}
//                       className={`bingo-number ${calledNumbers.includes(num) ? 'called' : ''}`}
//                       onClick={() => handleNumberClick(num)}
//                       whileHover={{ scale: 1.1 }}
//                       whileTap={{ scale: 0.95 }}
//                       initial={false}
//                       animate={
//                         calledNumbers.includes(num)
//                           ? { backgroundColor: '#0ea5e9', color: '#fff' }
//                           : { backgroundColor: '', color: '' }
//                       }
//                     >
//                       {num}
//                     </motion.button>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>

//         <div className="playground-sidebar">
//           <div className="control-panel">
//             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//               <Button 
//                 className="control-btn start-btn"
//                 onClick={startNewGame}
//               >
//                 <Play className="btn-icon" />
//                 {t('playground.startNewGame')}
//               </Button>
//             </motion.div>

//             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//               <Button 
//                 className="control-btn shuffle-btn"
//                 onClick={shuffleNumbers}
//                 variant="outline"
//               >
//                 <Shuffle className="btn-icon" />
//                 {t('playground.shuffle')}
//               </Button>
//             </motion.div>

//             <div className="auto-call-section">
//               <label className="auto-call-label">
//                 <input 
//                   type="checkbox" 
//                   checked={autoCall}
//                   onChange={(e) => setAutoCall(e.target.checked)}
//                   className="auto-call-checkbox"
//                 />
//                 {t('playground.autoCall')}
//               </label>
//               <span className="auto-call-timer">{autoCallTimer} {t('playground.seconds')}</span>
//             </div>
//           </div>

//           <Card className="cartela-check-card">
//             <h3>{t('playground.enterCartela')}</h3>
//             <Input
//               placeholder={t('playground.cartelaPlaceholder')}
//               value={cartelaInput}
//               onChange={(e) => setCartelaInput(e.target.value)}
//               className="cartela-input"
//             />
//             <Button className="check-btn" onClick={checkCartela}>
//               <Check className="btn-icon" />
//               {t('playground.check')}
//             </Button>
//           </Card>

//           <Card className="win-money-card">
//             <h3>{t('playground.winMoney')}</h3>
//             <div className="win-amount">
//               <span className="currency">{t('playground.birr')}</span>
//               <span className="amount">{calculateWinMoney()}</span>
//             </div>
            
            
//           </Card>
          
//           {gameConfig?.selectedPatterns && (
//             <Card className="patterns-info-card">
//               <h3>Selected Patterns</h3>
//               <div className="patterns-list">
//                 {gameConfig.selectedPatterns.slice(0, 10).map(pattern => (
//                   <span key={pattern} className="pattern-tag">{pattern}</span>
//                 ))}
//                 {gameConfig.selectedPatterns.length > 10 && (
//                   <span className="pattern-more">
//                     +{gameConfig.selectedPatterns.length - 10} more
//                   </span>
//                 )}
//               </div>
//             </Card>
//           )}
//         </div>
//       </div>

//       <footer className="playground-footer">
//         <p>{t('playground.footer')}</p>
//         {gameConfig && (
//           <p className="game-info-footer">
//             Game #{gameConfig.game} | {gameConfig.numPlayers} Players | {gameConfig.selectedPatterns?.length || 0} Patterns
//           </p>
//         )}
//       </footer>
//     </div>
//   );
// };



import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shuffle, Play, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import './Playground.css';

interface PlaygroundProps {
  gameConfig?: {
    game: string;
    betBirr: string;
    numPlayers: string;
    winBirr: string;
    selectedPatterns: number[];
  } | null;
  onStartNewGame?: () => void;
}

export const Playground: React.FC<PlaygroundProps> = ({ gameConfig, onStartNewGame }) => {
  const { t } = useLanguage();

  // State for called numbers & auto call
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [autoCall, setAutoCall] = useState(false);
  const [autoCallTimer, setAutoCallTimer] = useState(11);

  // State for cartela input
  const [cartelaInput, setCartelaInput] = useState('');

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
      console.log('Game config loaded:', gameConfig);
    }
  }, [gameConfig]);

  // Auto-call functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoCall && isGameActive && calledNumbers.length < 75) {
      interval = setInterval(() => {
        setAutoCallTimer(prev => {
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

  // Call one random number manually or via auto-call
  const callRandomNumber = () => {
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const uncalledNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
    if (uncalledNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
      const newNumber = uncalledNumbers[randomIndex];
      setCalledNumbers(prev => [...prev, newNumber]);
    }
  };

  // Start a new game
  const startNewGame = () => {
    if (window.confirm('Start a new game? This will reset everything.')) {
      setCalledNumbers([]);
      setAutoCall(false);
      setAutoCallTimer(11);
      setIsGameActive(true);

      // Reshuffle Bingo board
      reshuffleBoard();

      if (onStartNewGame) onStartNewGame();
    }
  };

  // Shuffle/reshuffle numbers inside each Bingo column
  const reshuffleBoard = () => {
    setBingoRows(prev => {
      const shuffleArray = (arr: number[]) => arr
        .map(value => ({ value, sort: Math.random() }))
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
    if (window.confirm('Shuffle numbers inside columns?')) {
      reshuffleBoard();
    }
  };

  const checkCartela = () => {
    if (!cartelaInput.trim()) {
      alert('Please enter a cartela number');
      return;
    }
    alert(`Checking cartela: ${cartelaInput}\nThis would validate against called numbers.`);
  };

  const calculateWinMoney = () => {
    if (gameConfig?.winBirr && gameConfig.winBirr !== '0') {
      return parseInt(gameConfig.winBirr);
    }
    return calledNumbers.length * 10;
  };

  return (
    <div className="playground">
      {/* Header */}
      <div className="playground-header">
        <div className="game-info-bar">
          <div className="info-item">
            <span className="info-label">{t('playground.game')}</span>
            <span className="info-value">{gameConfig?.game || 'F-am'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('playground.stake')}</span>
            <span className="info-value">{gameConfig?.betBirr ? `${gameConfig.betBirr} BIRR` : 'BINGO'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('playground.winPrice')}</span>
            <span className="info-value">{calculateWinMoney()}</span>
          </div>
          <div className="info-item highlight">
            <span className="calls-count">{calledNumbers.length} {t('playground.called')}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="playground-content">
        {/* Bingo board */}
        <Card className="bingo-board-card">
          <div className="bingo-board">
            {Object.entries(bingoRows).map(([letter, numbers]) => (
              <div key={letter} className="bingo-row">
                <motion.div className="row-header" whileHover={{ scale: 1.05 }}>{letter}</motion.div>
                <div className="numbers-row">
                  {numbers.map(num => (
                    <motion.div
                      key={num}
                      className={`bingo-number ${calledNumbers.includes(num) ? 'called' : ''}`}
                      whileHover={{ scale: 1.1 }}
                      style={{
                        backgroundColor: calledNumbers.includes(num) ? '#0ea5e9' : '',
                        color: calledNumbers.includes(num) ? '#fff' : ''
                      }}
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="playground-sidebar">
          <div className="control-panel">
            <Button className="control-btn start-btn" onClick={startNewGame}>
              <Play className="btn-icon" />
              {t('playground.startNewGame')}
            </Button>

            <Button className="control-btn call-btn" onClick={callRandomNumber}>
              {t('playground.callNumber')}
            </Button>

            <Button className="control-btn shuffle-btn" onClick={shuffleNumbers} variant="outline">
              <Shuffle className="btn-icon" />
              {t('playground.shuffle')}
            </Button>

            <div className="auto-call-section">
              <label className="auto-call-label">
                <input
                  type="checkbox"
                  checked={autoCall}
                  onChange={(e) => setAutoCall(e.target.checked)}
                  className="auto-call-checkbox"
                />
                {t('playground.autoCall')}
              </label>
              <span className="auto-call-timer">{autoCallTimer} {t('playground.seconds')}</span>
            </div>
          </div>

          {/* Cartela check */}
          <Card className="cartela-check-card">
            <h3>{t('playground.enterCartela')}</h3>
            <Input
              placeholder={t('playground.cartelaPlaceholder')}
              value={cartelaInput}
              onChange={(e) => setCartelaInput(e.target.value)}
            />
            <Button className="check-btn" onClick={checkCartela}>
              <Check className="btn-icon" />
              {t('playground.check')}
            </Button>
          </Card>

          {/* Win money */}
          <Card className="win-money-card">
            <h3>{t('playground.winMoney')}</h3>
            <div className="win-amount">
              <span className="currency">{t('playground.birr')}</span>
              <span className="amount">{calculateWinMoney()}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
