import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './NewGame.css';

export const NewGame: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPatterns, setSelectedPatterns] = useState<number[]>([]);
  const [gameConfig, setGameConfig] = useState({
    game: '2',
    betBirr: '10',
    numPlayers: '',
    winBirr: '0',
    bonus: '',
    freeHit: ''
  });

  const handlePatternClick = (num: number) => {
    setSelectedPatterns(prev =>
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const handleConfigChange = (field: string, value: string) => {
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
    
    const message = `Game Configuration:\n
Game: ${gameConfig.game}
Bet: ${gameConfig.betBirr} Birr
Players: ${gameConfig.numPlayers}
Win: ${gameConfig.winBirr} Birr
Bonus: ${gameConfig.bonus || 0}
Free Hits: ${gameConfig.freeHit || 0}
Selected Patterns: ${selectedPatterns.length}

Game created successfully!`;
    
    alert(message);
  };

  const handleRange = () => {
    // Select patterns from 100-200
    const rangePatterns = Array.from({ length: 101 }, (_, i) => i + 100).filter(n => n <= 200);
    const validPatterns = rangePatterns.filter(n => n <= 100); // Only keep valid pattern numbers
    setSelectedPatterns(prev => {
      const newPatterns = validPatterns.filter(p => !prev.includes(p));
      return [...prev, ...newPatterns];
    });
    alert('Selected patterns in range 100-200 (Note: Only patterns 1-100 are available)');
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
        <div className="wallet-badge">{t('newGame.badWallet')}</div>
        <h1>{t('newGame.title')}</h1>
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
              <div className="form-group">
                <label>{t('newGame.bonus')}</label>
                <Input 
                  type="number" 
                  placeholder={t('newGame.enterBonus')}
                  value={gameConfig.bonus}
                  onChange={(e) => handleConfigChange('bonus', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('newGame.freeHit')}</label>
                <Input 
                  type="number" 
                  placeholder={t('newGame.enterFreeHits')}
                  value={gameConfig.freeHit}
                  onChange={(e) => handleConfigChange('freeHit', e.target.value)}
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
        <Button className="range-btn" variant="outline" onClick={handleRange}>
          {t('newGame.range')}
        </Button>
        <Button className="clear-btn" variant="outline" onClick={handleClear}>
          {t('common.clear')}
        </Button>
      </motion.div>
    </div>
  );
};