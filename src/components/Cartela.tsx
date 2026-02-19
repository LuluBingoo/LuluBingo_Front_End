// import React, { useState, useEffect } from 'react';
// import { Card } from '../components/ui/card';
// import { Input } from '../components/ui/input';
// import { Button } from '../components/ui/button';
// import { Search, User, X } from 'lucide-react';
// import { useLanguage } from '../contexts/LanguageContext';
// import './Cartela.css';

// interface CartelaProps {
//   cartelaNumber?: string;
//   calledNumbers: number[];
//   gameConfig?: {
//     game: string;
//     betBirr: string;
//     numPlayers: string;
//     winBirr: string;
//     selectedPatterns: number[];
//   } | null;
//   onClose?: () => void;
// }

// interface CartelaData {
//   id: string;
//   number: string;
//   playerName: string;
//   pattern: number;
//   numbers: number[];
//   isWinner?: boolean;
// }

// export const Cartela: React.FC<CartelaProps> = ({ 
//   cartelaNumber, 
//   calledNumbers, 
//   gameConfig,
//   onClose 
// }) => {
//   const { t } = useLanguage();
//   const [searchInput, setSearchInput] = useState(cartelaNumber || '');
//   const [activeCartela, setActiveCartela] = useState<CartelaData | null>(null);
//   const [error, setError] = useState<string>('');

//   // Mock data - in a real app, this would come from an API
//   const mockCartelas: CartelaData[] = [
//     {
//       id: '1',
//       number: '001',
//       playerName: 'John Doe',
//       pattern: 5,
//       numbers: [7, 23, 44, 56, 68, 12, 29, 38, 50, 61, 19, 34, 42, 55, 70, 8, 27, 39, 52, 66, 14, 31, 45, 58, 72],
//     },
//     {
//       id: '2',
//       number: '002',
//       playerName: 'Jane Smith',
//       pattern: 12,
//       numbers: [3, 21, 40, 53, 67, 11, 25, 37, 49, 63, 17, 32, 43, 57, 71, 6, 28, 41, 54, 69, 13, 30, 46, 59, 73],
//     },
//     {
//       id: '3',
//       number: '003',
//       playerName: 'Bob Wilson',
//       pattern: 7,
//       numbers: [5, 22, 39, 51, 65, 15, 26, 36, 48, 62, 18, 33, 47, 60, 74, 9, 24, 35, 53, 67, 10, 29, 44, 58, 75],
//     },
//     {
//       id: '4',
//       number: '004',
//       playerName: 'Alice Johnson',
//       pattern: 3,
//       numbers: [2, 20, 41, 52, 66, 14, 27, 38, 50, 64, 16, 31, 45, 59, 72, 4, 23, 37, 54, 68, 12, 28, 43, 57, 70],
//     },
//   ];

//   // Initialize with provided cartela number
//   useEffect(() => {
//     if (cartelaNumber) {
//       handleSearch(cartelaNumber);
//     }
//   }, [cartelaNumber]);

//   const handleSearch = (searchValue?: string) => {
//     const value = searchValue || searchInput;
//     if (!value.trim()) {
//       setError('Please enter a cartela number');
//       return;
//     }

//     const foundCartela = mockCartelas.find(
//       cartela => cartela.number === value.padStart(3, '0')
//     );

//     if (foundCartela) {
//       setActiveCartela(foundCartela);
//       setError('');
//     } else {
//       setError(`Cartela number ${value} not found`);
//       setActiveCartela(null);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchInput(e.target.value);
//     setError('');
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleSearch();
//     }
//   };

//   const getCalledNumbersCount = (cartelaNumbers: number[]) => {
//     return cartelaNumbers.filter(num => calledNumbers.includes(num)).length;
//   };

//   const getBingoLetter = (num: number): string => {
//     if (num >= 1 && num <= 15) return 'B';
//     if (num >= 16 && num <= 30) return 'I';
//     if (num >= 31 && num <= 45) return 'N';
//     if (num >= 46 && num <= 60) return 'G';
//     if (num >= 61 && num <= 75) return 'O';
//     return '';
//   };

//   const getNumberPosition = (num: number, index: number) => {
//     const colIndex = Math.floor(index / 5);
//     const rowIndex = index % 5;
//     return { col: colIndex, row: rowIndex };
//   };

//   const renderCartelaBoard = () => {
//     if (!activeCartela) return null;

//     const numbers = activeCartela.numbers;
//     const board = [];

//     // Create BINGO headers
//     board.push(
//       <div key="headers" className="cartela-headers">
//         {['B', 'I', 'N', 'G', 'O'].map(letter => (
//           <div key={letter} className="cartela-header">
//             {letter}
//           </div>
//         ))}
//       </div>
//     );

//     // Create 5 rows
//     for (let row = 0; row < 5; row++) {
//       const rowNumbers = [];
//       for (let col = 0; col < 5; col++) {
//         const index = col * 5 + row;
//         const num = numbers[index];
//         const isCalled = calledNumbers.includes(num);
//         const isFreeSpace = row === 2 && col === 2; // Center is free space
        
//         rowNumbers.push(
//           <div
//             key={`${row}-${col}`}
//             className={`cartela-cell ${isCalled ? 'called' : ''} ${isFreeSpace ? 'free-space' : ''}`}
//           >
//             {isFreeSpace ? 'FREE' : num}
//             {isCalled && <div className="called-dot"></div>}
//           </div>
//         );
//       }
//       board.push(
//         <div key={`row-${row}`} className="cartela-row">
//           {rowNumbers}
//         </div>
//       );
//     }

//     return board;
//   };

//   return (
//     <Card className="cartela-card">
//       <div className="cartela-header-section">
//         <h3>{t('cartela.title')}</h3>
//         {onClose && (
//           <Button 
//             variant="ghost" 
//             size="sm" 
//             onClick={onClose}
//             className="close-btn"
//           >
//             <X size={16} />
//           </Button>
//         )}
//       </div>

//       {/* Search section */}
//       <div className="cartela-search">
//         <Input
//           placeholder={t('cartela.searchPlaceholder')}
//           value={searchInput}
//           onChange={handleInputChange}
//           onKeyPress={handleKeyPress}
//           className="cartela-input"
//         />
//         <Button 
//           onClick={() => handleSearch()}
//           className="search-btn"
//         >
//           <Search size={16} />
//           {t('cartela.search')}
//         </Button>
//       </div>

//       {error && <div className="cartela-error">{error}</div>}

//       {/* Cartela display */}
//       {activeCartela && (
//         <div className="cartela-display">
//           {/* Cartela info */}
//           <div className="cartela-info">
//             <div className="info-row">
//               <div className="info-item">
//                 <span className="info-label">{t('cartela.number')}:</span>
//                 <span className="info-value">{activeCartela.number}</span>
//               </div>
//               <div className="info-item">
//                 <span className="info-label">{t('cartela.pattern')}:</span>
//                 <span className="info-value">{activeCartela.pattern}</span>
//               </div>
//             </div>
//             <div className="info-row">
//               <div className="info-item">
//                 <User size={16} className="icon" />
//                 <span className="info-value">{activeCartela.playerName}</span>
//               </div>
//               <div className="info-item">
//                 <span className="info-label">{t('cartela.calledNumbers')}:</span>
//                 <span className="info-value highlight">
//                   {getCalledNumbersCount(activeCartela.numbers)}/25
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Cartela board */}
//           <div className="cartela-board">
//             {renderCartelaBoard()}
//           </div>

//           {/* Called numbers list */}
//           <div className="called-numbers-section">
//             <h4>{t('cartela.calledNumbersList')}</h4>
//             <div className="called-numbers-grid">
//               {activeCartela.numbers.map((num, index) => {
//                 const isCalled = calledNumbers.includes(num);
//                 const letter = getBingoLetter(num);
//                 return (
//                   <div
//                     key={index}
//                     className={`called-number-item ${isCalled ? 'called' : ''}`}
//                   >
//                     <span className="number">
//                       {letter} {num}
//                     </span>
//                     <span className="status">
//                       {isCalled ? '✓' : '○'}
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Status */}
//           <div className="cartela-status">
//             {getCalledNumbersCount(activeCartela.numbers) === 25 ? (
//               <div className="status-badge winner">
//                 {t('cartela.bingo')}! 🎉
//               </div>
//             ) : (
//               <div className="status-badge">
//                 {25 - getCalledNumbersCount(activeCartela.numbers)} {t('cartela.numbersNeeded')}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Empty state */}
//       {!activeCartela && !error && (
//         <div className="cartela-empty">
//           <Search size={48} className="empty-icon" />
//           <p>{t('cartela.emptyMessage')}</p>
//         </div>
//       )}
//     </Card>
//   );
// };


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy, X, UserX, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './Cartela.css';

interface CartelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartelaNumber?: string;
  calledNumbers: number[];
  cartelaNumbers: string[];
  onDeclareWinner?: (cartelaNumber: string) => void;
  onRemovePlayer?: (cartelaNumber: string) => void;
  gameActive?: boolean;
}

// Generate random cartela numbers (5x5 grid with FREE center)
const generateCartelaNumbers = (seed: string): number[] => {
  const numbers: number[] = [];
  
  // Use seed to generate consistent numbers for same cartela
  const seedNum = parseInt(seed) || 1;
  const random = (min: number, max: number, offset: number) => {
    const x = Math.sin(seedNum * offset) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };
  
  // Column ranges for B, I, N, G, O
  const columnRanges = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 }   // O
  ];
  
  // Generate 5 numbers for each column
  for (let col = 0; col < 5; col++) {
    const { min, max } = columnRanges[col];
    const columnNumbers: number[] = [];
    
    let attempts = 0;
    while (columnNumbers.length < 5 && attempts < 100) {
      const num = random(min, max, col * 100 + columnNumbers.length + attempts);
      if (!columnNumbers.includes(num)) {
        columnNumbers.push(num);
      }
      attempts++;
    }
    
    numbers.push(...columnNumbers);
  }
  
  return numbers;
};

export const CartelaModal: React.FC<CartelaModalProps> = ({
  isOpen,
  onClose,
  cartelaNumber,
  calledNumbers,
  cartelaNumbers,
  onDeclareWinner,
  onRemovePlayer,
  gameActive = true
}) => {
  const { t } = useLanguage();
  const [selectedCartela, setSelectedCartela] = useState(cartelaNumber || '');
  const [cartelaData, setCartelaData] = useState<number[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Generate or retrieve cartela data when cartela changes
  useEffect(() => {
    if (selectedCartela) {
      const generatedNumbers = generateCartelaNumbers(selectedCartela);
      setCartelaData(generatedNumbers);
    }
  }, [selectedCartela]);

  // Initialize with provided cartela number
  useEffect(() => {
    if (cartelaNumber) {
      setSelectedCartela(cartelaNumber);
    }
  }, [cartelaNumber]);

  const handleSelectCartela = (number: string) => {
    setSelectedCartela(number);
    setShowDropdown(false);
  };

  const getCalledCount = () => {
    return cartelaData.filter(num => calledNumbers.includes(num)).length;
  };

  const handleDeclareWinner = () => {
    if (window.confirm(`Declare cartela ${selectedCartela} as winner?`)) {
      onDeclareWinner?.(selectedCartela);
      onClose();
    }
  };

  const handleRemovePlayer = () => {
    if (window.confirm(`Remove cartela ${selectedCartela} from the game?`)) {
      onRemovePlayer?.(selectedCartela);
      onClose();
    }
  };

  const renderCartelaBoard = () => {
    if (cartelaData.length === 0) return null;

    const board = [];

    // BINGO headers
    board.push(
      <div key="headers" className="cartela-headers">
        {['B', 'I', 'N', 'G', 'O'].map(letter => (
          <div key={letter} className="cartela-header">
            {letter}
          </div>
        ))}
      </div>
    );

    // Create 5 rows
    for (let row = 0; row < 5; row++) {
      const rowCells = [];
      for (let col = 0; col < 5; col++) {
        const index = col * 5 + row;
        
        // Center is FREE
        if (row === 2 && col === 2) {
          rowCells.push(
            <div key={`${row}-${col}`} className="cartela-cell free-space">
              <span className="cell-number">FREE</span>
            </div>
          );
        } else {
          const adjustedIndex = index > 12 ? index - 1 : index;
          const num = cartelaData[adjustedIndex];
          const isCalled = calledNumbers.includes(num);
          
          rowCells.push(
            <div
              key={`${row}-${col}`}
              className={`cartela-cell ${isCalled ? 'called' : ''}`}
            >
              <span className="cell-number">{num}</span>
              {isCalled && <div className="called-indicator">✓</div>}
            </div>
          );
        }
      }
      board.push(
        <div key={`row-${row}`} className="cartela-row">
          {rowCells}
        </div>
      );
    }

    return board;
  };

  const calledCount = getCalledCount();
  const isBingo = calledCount === 24;

  // Auto-declare winner when BINGO is detected
  useEffect(() => {
    if (isBingo && selectedCartela && gameActive) {
      // Small delay to show the BINGO animation first
      const timer = setTimeout(() => {
        if (window.confirm(`🎉 BINGO! Cartela ${selectedCartela} has won!\n\nDeclare as winner?`)) {
          onDeclareWinner?.(selectedCartela);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isBingo, selectedCartela, gameActive]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="cartela-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal Container */}
            <motion.div
              className="cartela-modal-container"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="cartela-modal">
                {/* Header */}
                <div className="cartela-modal-header">
                  <h3>Cartela Viewer</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="close-btn"
                  >
                    <X size={20} />
                  </Button>
                </div>

                {/* Cartela Selector Dropdown */}
                <div className="cartela-selector">
                  <label className="selector-label">Select Cartela:</label>
                  <div className="dropdown-wrapper">
                    <button
                      className="dropdown-trigger"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <span className="selected-value">
                        {selectedCartela || 'Choose a cartela'}
                      </span>
                      <ChevronDown 
                        size={18} 
                        className={`dropdown-icon ${showDropdown ? 'open' : ''}`}
                      />
                    </button>
                    
                    {showDropdown && (
                      <motion.div
                        className="dropdown-menu"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {cartelaNumbers.length > 0 ? (
                          cartelaNumbers.map(number => (
                            <button
                              key={number}
                              className={`dropdown-item ${selectedCartela === number ? 'active' : ''}`}
                              onClick={() => handleSelectCartela(number)}
                            >
                              Cartela {number}
                            </button>
                          ))
                        ) : (
                          <div className="dropdown-empty">No cartelas available</div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Cartela display */}
                {selectedCartela && cartelaData.length > 0 && (
                  <motion.div
                    className="cartela-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Cartela Number Badge */}
                    <div className="cartela-badge">
                      <span className="badge-label">Cartela</span>
                      <span className="badge-number">{selectedCartela}</span>
                    </div>
                    
                    {/* Bingo Board */}
                    <div className="cartela-board">
                      {renderCartelaBoard()}
                    </div>

                    {/* Stats */}
                    <div className="cartela-stats">
                      <div className="stat-box">
                        <span className="stat-label">Called</span>
                        <span className="stat-value">{calledCount}/24</span>
                      </div>
                      <div className="stat-box">
                        <span className="stat-label">Remaining</span>
                        <span className="stat-value">{24 - calledCount}</span>
                      </div>
                      {isBingo && (
                        <motion.div
                          className="bingo-badge"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 10 }}
                        >
                          <Trophy size={20} />
                          BINGO!
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {gameActive && (
                      <div className="cartela-actions">
                        <Button
                          className="winner-btn"
                          onClick={handleDeclareWinner}
                        >
                          <Trophy size={18} />
                          Declare Winner
                        </Button>
                        <Button
                          className="remove-btn"
                          variant="outline"
                          onClick={handleRemovePlayer}
                        >
                          <UserX size={18} />
                          Remove Player
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Empty state */}
                {!selectedCartela && (
                  <div className="cartela-empty">
                    <ChevronDown size={48} className="empty-icon" />
                    <p>Select a cartela from the dropdown above</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};