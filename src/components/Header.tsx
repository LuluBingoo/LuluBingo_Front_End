import React from 'react';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}


export const Header: React.FC<HeaderProps> = ({ username = 'surafel-worabe', onLogout }) => {
const Navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout?.();
    }
  };

  return (
    <motion.header 
      className="header"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="header-title">
        {/* <h1 className="logo-text">LULU Bingo</h1> */}
        <button className="logo-text" onClick={() => Navigate('/newgame')}>
          New Game
        </button>
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

        <motion.button
          className="logout-button"
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="logout-icon" />
          <span className="logout-text">Logout</span>
        </motion.button>
      </div>
    </motion.header>
  );
};
