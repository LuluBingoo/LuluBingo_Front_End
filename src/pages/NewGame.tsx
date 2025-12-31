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

export const NewGame: React.FC<NewGameProps> = ({ onGameCreated }) => {
  const { t } = useLanguage();
  const [selectedPatterns, setSelectedPatterns] = useState<number[]>([]);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    game: '2',
    betBirr: '10',
    numPlayers: '',
    winBirr: '0',
   
  });

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
    
    // Instead of showing alert, pass data to parent
    onGameCreated(gameConfig, selectedPatterns);
    
    // Optional: Still show confirmation message
    const message = `Game Configuration:\n
Game: ${gameConfig.game}
Bet: ${gameConfig.betBirr} Birr
Players: ${gameConfig.numPlayers}
Win: ${gameConfig.winBirr} Birr
Selected Patterns: ${selectedPatterns.length}

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
        {/* <div className="wallet-badge">{t('newGame.badWallet')}</div> */}
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
            <h2>{t('newGame.choosePatterns')}</h2>
            <div className="patterns-grid">
              {patterns.map((num) => (
                <motion.button
                  key={num}
                  className={`pattern-box ${selectedPatterns.includes(num) ? 'selected' : ''}`}
                  onClick={() => handlePatternClick(num)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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