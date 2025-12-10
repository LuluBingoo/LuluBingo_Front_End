import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Playground } from './pages/Playground';
import { NewGame } from './pages/NewGame';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import './styles/globals.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <LanguageProvider>
          <Login onLogin={() => setIsLoggedIn(true)} />
        </LanguageProvider>
      </ThemeProvider>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'playground':
        return <Playground />;
      case 'newgame':
        return <NewGame />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="app-container">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          <div className="main-content">
            <Header />
            <main className="page-content">
              {renderPage()}
            </main>
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;