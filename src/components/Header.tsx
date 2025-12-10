import React from 'react';
import { Moon, Sun, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import './Header.css';

interface HeaderProps {
  username?: string;
}

export const Header: React.FC<HeaderProps> = ({ username = 'surafel-worabe' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header 
      className="header"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="header-title">
        <h1 className="logo-text">LULU Bingo</h1>
      </div>
      
      <div className="header-actions">
        <div className="user-info">
          <User className="user-icon" />
          <span>{username}</span>
        </div>
        
        <motion.button
          className="theme-toggle"
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {theme === 'light' ? (
            <Moon className="theme-icon" />
          ) : (
            <Sun className="theme-icon" />
          )}
        </motion.button>
      </div>
    </motion.header>
  );
};
