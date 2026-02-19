// import React, { useState } from 'react';
// import { motion } from 'motion/react';
// import { Card } from '../components/ui/card';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Check } from 'lucide-react';
// import { useLanguage } from '../contexts/LanguageContext';
// import './NewGame.css';

// interface NewGameProps {
//   onGameCreated: (config: GameConfig, patterns: number[]) => void;
// }

// interface GameConfig {
//   game: string;
//   betBirr: string;
//   numPlayers: string;
//   winBirr: string;

// }

// export const NewGame: React.FC<NewGameProps> = ({ onGameCreated }) => {
//   const { t } = useLanguage();
//   const [selectedPatterns, setSelectedPatterns] = useState<number[]>([]);
//   const [gameConfig, setGameConfig] = useState<GameConfig>({
//     game: '2',
//     betBirr: '10',
//     numPlayers: '',
//     winBirr: '0',
   
//   });

//   const handlePatternClick = (num: number) => {
//     if (selectedPatterns.length >= parseInt(gameConfig.numPlayers) && !selectedPatterns.includes(num)) {
//       alert(`You can only select up to ${gameConfig.numPlayers} patterns`);
//       return;
//     }
//     setSelectedPatterns(prev =>
//       prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
//     );
//   };

//   const handleConfigChange = (field: keyof GameConfig, value: string) => {
//     setGameConfig(prev => ({ ...prev, [field]: value }));
//   };

//   const handleConfirm = () => {
//     if (!gameConfig.numPlayers) {
//       alert('Please enter the number of players');
//       return;
//     }
//     if (selectedPatterns.length === 0) {
//       alert('Please select at least one pattern');
//       return;
//     }
//     if(gameConfig.winBirr === '0' || gameConfig.winBirr === ''){
//       gameConfig.winBirr = (parseInt(gameConfig.betBirr) * selectedPatterns.length).toString();
//     }
    
//     // Instead of showing alert, pass data to parent
//     onGameCreated(gameConfig, selectedPatterns);
    
//     // Optional: Still show confirmation message
//     const message = `Game Configuration:\n
// Game: ${gameConfig.game}
// Bet: ${gameConfig.betBirr} Birr
// Players: ${gameConfig.numPlayers}
// Win: ${gameConfig.winBirr} Birr
// Selected Patterns: ${selectedPatterns.length}

// Game created successfully! Redirecting to Playground...`;
    
//     alert(message);
//   };



//   const handleClear = () => {
//     if (window.confirm('Clear all selected patterns?')) {
//       setSelectedPatterns([]);
//     }
//   };

//   const patterns = Array.from({ length: 100 }, (_, i) => i + 1);

//   return (
//     <div className="new-game">
//       <motion.div
//         className="new-game-header"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//       >
//         {/* <div className="wallet-badge">{t('newGame.badWallet')}</div> */}
//         <h1 className=''>{t('newGame.title')}</h1>
//       </motion.div>

//       <div className="new-game-content">
//         <motion.div
//           className="game-config"
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.1 }}
//         >
//           <Card className="config-card">
//             <h2>{t('newGame.gameConfig')}</h2>
//             <div className="config-form">
//               <div className="form-group">
//                 <label>{t('newGame.game')}</label>
//                 <Input 
//                   type="number" 
//                   value={gameConfig.game}
//                   onChange={(e) => handleConfigChange('game', e.target.value)}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>{t('newGame.betBirr')}</label>
//                 <Input 
//                   type="number" 
//                   value={gameConfig.betBirr}
//                   onChange={(e) => handleConfigChange('betBirr', e.target.value)}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>{t('newGame.numPlayers')}</label>
//                 <Input 
//                   type="number" 
//                   placeholder={t('newGame.enterNumber')}
//                   value={gameConfig.numPlayers}
//                   onChange={(e) => handleConfigChange('numPlayers', e.target.value)}
//                 />
//               </div>
//               <div className="form-group">
//                 <label>{t('newGame.winBirr')}</label>
//                 <Input 
//                   type="number" 
//                   value={gameConfig.winBirr}
//                   onChange={(e) => handleConfigChange('winBirr', e.target.value)}
//                 />
//               </div>
                            
//             </div>
//           </Card>
//         </motion.div>

//         <motion.div
//           className="patterns-section"
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           <Card className="patterns-card">
//             <h2>{t('newGame.choosePatterns')}</h2>
//             <div className="patterns-grid">
//               {patterns.map((num) => (
//                 <motion.button
//                   key={num}
//                   className={`pattern-box ${selectedPatterns.includes(num) ? 'selected' : ''}`}
//                   onClick={() => handlePatternClick(num)}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   {selectedPatterns.includes(num) && (
//                     <motion.div
//                       className="check-icon"
//                       initial={{ scale: 0 }}
//                       animate={{ scale: 1 }}
//                       exit={{ scale: 0 }}
//                     >
//                       <Check size={16} />
//                     </motion.div>
//                   )}
//                   {num}
//                 </motion.button>
//               ))}
//             </div>
//           </Card>
//         </motion.div>
//       </div>

//       <motion.div
//         className="action-buttons"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//       >
//         <Button className="confirm-btn" onClick={handleConfirm}>
//           {t('common.confirm')}
//         </Button>
        
//         <Button className="clear-btn" variant="outline" onClick={handleClear}>
//           {t('common.clear')}
//         </Button>
//       </motion.div>
//     </div>
//   );
// };



import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './NewGame.css';

interface NewGameProps {
  onGameCreated: (config: GameConfig, patterns: number[]) => void;
}

interface GameConfig {
  game: string;
  betBirr: string;
  numPlayers: string;
  winBirr: string;
}

interface CartelaData {
  id: string;
  number: string;
  pattern: number;
  numbers: number[];
}

export const NewGame: React.FC<NewGameProps> = ({ onGameCreated }) => {
  const { t } = useLanguage();
  const [selectedPatterns, setSelectedPatterns] = useState<number[]>([]);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    game: '2',
    betBirr: '10',
    numPlayers: '',
    winBirr: '0',
  });

  // Function to generate random cartela numbers
  const generateCartelaNumbers = (): number[] => {
    const numbers: number[] = [];
    
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
      
      // Get 5 unique random numbers for this column
      while (columnNumbers.length < 5) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!columnNumbers.includes(num)) {
          columnNumbers.push(num);
        }
      }
      
      numbers.push(...columnNumbers);
    }
    
    return numbers;
  };

  // Function to generate cartela data for all selected patterns
  const generateCartelaData = (): CartelaData[] => {
    return selectedPatterns.map((pattern) => ({
      id: pattern.toString(),
      number: pattern.toString().padStart(3, '0'), // Use pattern number: 007, 014, 015, etc.
      pattern: pattern,
      numbers: generateCartelaNumbers()
    }));
  };

  const handlePatternClick = (num: number) => {
    if (selectedPatterns.length >= parseInt(gameConfig.numPlayers) && !selectedPatterns.includes(num)) {
      alert(`You can only select up to ${gameConfig.numPlayers} patterns`);
      return;
    }
    setSelectedPatterns(prev =>
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const handleConfigChange = (field: keyof GameConfig, value: string) => {
    setGameConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    if (!gameConfig.numPlayers) {
      alert('Please enter the number of players');
      return;
    }
    if (selectedPatterns.length === 0) {
      alert('Please select at least one pattern');
      return;
    }
    if(gameConfig.winBirr === '0' || gameConfig.winBirr === ''){
      gameConfig.winBirr = (parseInt(gameConfig.betBirr) * selectedPatterns.length).toString();
    }
    
    // Generate cartela data
    const cartelaData = generateCartelaData();
    
    // Create cartela numbers array for easy validation
    const cartelaNumbers = cartelaData.map(cartela => cartela.number);
    
    // Create extended config with cartela data
    const extendedConfig = {
      ...gameConfig,
      cartelaNumbers: cartelaNumbers,
      cartelaData: cartelaData
    };
    
    // Pass to parent component
    onGameCreated(extendedConfig, selectedPatterns);
    
    // Show confirmation message
    const message = `Game Configuration:\n
Game: ${gameConfig.game}
Bet: ${gameConfig.betBirr} Birr
Players: ${gameConfig.numPlayers}
Win: ${gameConfig.winBirr} Birr
Selected Patterns: ${selectedPatterns.length}
Cartelas Created: ${selectedPatterns.length}

Cartela Numbers: ${cartelaNumbers.join(', ')}

Game created successfully! Redirecting to Playground...`;
    
    alert(message);
  };

  const handleClear = () => {
    if (window.confirm('Clear all selected patterns?')) {
      setSelectedPatterns([]);
    }
  };

  const patterns = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div className="new-game">
      <motion.div
        className="new-game-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className=''>{t('newGame.title')}</h1>
      </motion.div>

      <div className="new-game-content">
        <motion.div
          className="game-config"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="config-card">
            <h2>{t('newGame.gameConfig')}</h2>
            <div className="config-form">
              <div className="form-group">
                <label>{t('newGame.game')}</label>
                <Input 
                  type="number" 
                  value={gameConfig.game}
                  onChange={(e) => handleConfigChange('game', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('newGame.betBirr')}</label>
                <Input 
                  type="number" 
                  value={gameConfig.betBirr}
                  onChange={(e) => handleConfigChange('betBirr', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('newGame.numPlayers')}</label>
                <Input 
                  type="number" 
                  placeholder={t('newGame.enterNumber')}
                  value={gameConfig.numPlayers}
                  onChange={(e) => handleConfigChange('numPlayers', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('newGame.winBirr')}</label>
                <Input 
                  type="number" 
                  value={gameConfig.winBirr}
                  onChange={(e) => handleConfigChange('winBirr', e.target.value)}
                />
              </div>
              <div className="form-group info-box">
                <label>Selected Patterns: {selectedPatterns.length}</label>
                <div className="selected-patterns-list">
                  {selectedPatterns.length > 0 ? (
                    selectedPatterns.map(pattern => (
                      <span key={pattern} className="pattern-tag">
                        {pattern}
                      </span>
                    ))
                  ) : (
                    <span className="no-patterns">No patterns selected</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="patterns-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="patterns-card">
            <div className="patterns-header">
              <h2>{t('newGame.choosePatterns')}</h2>
              <div className="patterns-stats">
                <span>Selected: {selectedPatterns.length}/{gameConfig.numPlayers || '∞'}</span>
                <span>Will create: {selectedPatterns.length} cartela(s)</span>
              </div>
            </div>
            <div className="patterns-grid">
              {patterns.map((num) => (
                <motion.button
                  key={num}
                  className={`pattern-box ${selectedPatterns.includes(num) ? 'selected' : ''}`}
                  onClick={() => handlePatternClick(num)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={selectedPatterns.length >= parseInt(gameConfig.numPlayers) && !selectedPatterns.includes(num)}
                >
                  {selectedPatterns.includes(num) && (
                    <motion.div
                      className="check-icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check size={16} />
                    </motion.div>
                  )}
                  {num}
                </motion.button>
              ))}
            </div>
            <div className="patterns-info">
              <p>• Each selected pattern will create one cartela</p>
              <p>• Cartela numbers will be: {selectedPatterns.map(p => p.toString().padStart(3, '0')).join(', ') || 'None'}</p>
              <p>• Cartelas can be viewed in Playground by entering their number</p>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        className="action-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button className="confirm-btn" onClick={handleConfirm}>
          {t('common.confirm')}
        </Button>
        
        <Button className="clear-btn" variant="outline" onClick={handleClear}>
          {t('common.clear')}
        </Button>
      </motion.div>
    </div>
  );
};