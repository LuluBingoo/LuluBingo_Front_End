import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Play, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import './Playground.css';

export const Playground: React.FC = () => {
  const { t } = useLanguage();
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [autoCall, setAutoCall] = useState(false);
  const [cartelaInput, setCartelaInput] = useState('');
  const [autoCallTimer, setAutoCallTimer] = useState(11);
  const [isGameActive, setIsGameActive] = useState(false);

  const bingoRows = {
    B: Array.from({ length: 15 }, (_, i) => i + 1),
    I: Array.from({ length: 15 }, (_, i) => i + 16),
    N: Array.from({ length: 15 }, (_, i) => i + 31),
    G: Array.from({ length: 15 }, (_, i) => i + 46),
    O: Array.from({ length: 15 }, (_, i) => i + 61),
  };

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

  const callRandomNumber = () => {
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const uncalledNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
    if (uncalledNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
      const newNumber = uncalledNumbers[randomIndex];
      setCalledNumbers(prev => [...prev, newNumber]);
    }
  };

  const handleNumberClick = (num: number) => {
    setCalledNumbers(prev => 
      prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]
    );
  };

  const startNewGame = () => {
    if (window.confirm('Start a new game? This will reset all called numbers.')) {
      setCalledNumbers([]);
      setAutoCallTimer(11);
      setIsGameActive(true);
      setAutoCall(false);
    }
  };

  const shuffleNumbers = () => {
    if (window.confirm('Shuffle will randomly call 5 numbers. Continue?')) {
      const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
      const uncalledNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
      const numbersToCall = Math.min(5, uncalledNumbers.length);
      
      for (let i = 0; i < numbersToCall; i++) {
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * uncalledNumbers.length);
          const newNumber = uncalledNumbers.splice(randomIndex, 1)[0];
          setCalledNumbers(prev => [...prev, newNumber]);
        }, i * 300);
      }
    }
  };

  const checkCartela = () => {
    if (!cartelaInput.trim()) {
      alert('Please enter a cartela number');
      return;
    }
    alert(`Checking cartela: ${cartelaInput}\nThis would validate the cartela against called numbers.`);
  };

  const calculateWinMoney = () => {
    // Mock calculation based on called numbers
    return calledNumbers.length * 10;
  };

  return (
    <div className="playground">
      <div className="playground-header">
        <div className="game-info-bar">
          <div className="info-item">
            <span className="info-label">{t('playground.game')}</span>
            <span className="info-value">F-am</span>
          </div>
          <div className="info-item">
            <span className="info-label">{t('playground.stake')}</span>
            <span className="info-value">BINGO</span>
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

      <div className="playground-content">
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
                    <motion.button
                      key={num}
                      className={`bingo-number ${calledNumbers.includes(num) ? 'called' : ''}`}
                      onClick={() => handleNumberClick(num)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={false}
                      animate={
                        calledNumbers.includes(num)
                          ? { backgroundColor: '#0ea5e9', color: '#fff' }
                          : { backgroundColor: '', color: '' }
                      }
                    >
                      {num}
                    </motion.button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="playground-sidebar">
          <div className="control-panel">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="control-btn start-btn"
                onClick={startNewGame}
              >
                <Play className="btn-icon" />
                {t('playground.startNewGame')}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                className="control-btn shuffle-btn"
                onClick={shuffleNumbers}
                variant="outline"
              >
                <Shuffle className="btn-icon" />
                {t('playground.shuffle')}
              </Button>
            </motion.div>

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

          <Card className="cartela-check-card">
            <h3>{t('playground.enterCartela')}</h3>
            <Input
              placeholder={t('playground.cartelaPlaceholder')}
              value={cartelaInput}
              onChange={(e) => setCartelaInput(e.target.value)}
              className="cartela-input"
            />
            <Button className="check-btn" onClick={checkCartela}>
              <Check className="btn-icon" />
              {t('playground.check')}
            </Button>
          </Card>

          <Card className="win-money-card">
            <h3>{t('playground.winMoney')}</h3>
            <div className="win-amount">
              <span className="currency">{t('playground.birr')}</span>
              <span className="amount">{calculateWinMoney()}</span>
            </div>
          </Card>
        </div>
      </div>

      <footer className="playground-footer">
        <p>{t('playground.footer')}</p>
      </footer>
    </div>
  );
};