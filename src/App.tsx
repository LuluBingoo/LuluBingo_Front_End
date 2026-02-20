// import React, { useState } from 'react';
// import { ThemeProvider } from './contexts/ThemeContext';
// import { LanguageProvider } from './contexts/LanguageContext';
// import { Sidebar } from './components/Sidebar';
// import { Header } from './components/Header';
// import { Dashboard } from './pages/Dashboard';
// import { Playground } from './pages/Playground';
// import { NewGame } from './pages/NewGame';
// import { Profile } from './pages/Profile';
// import { Settings } from './pages/Settings';
// import { Login } from './pages/Login';
// import './styles/globals.css';

// // Create a type for game configuration
// interface GameConfig {
//   game: string;
//   betBirr: string;
//   numPlayers: string;
//   winBirr: string;
//   bonus: string;
//   freeHit: string;
//   selectedPatterns: number[];
// }

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [currentPage, setCurrentPage] = useState('playground');
//   const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
//   const [isGameActive, setIsGameActive] = useState(false);

//   if (!isLoggedIn) {
//     return (
//       <ThemeProvider>
//         <LanguageProvider>
//           <Login onLogin={() => setIsLoggedIn(true)} />
//         </LanguageProvider>
//       </ThemeProvider>
//     );
//   }

//   // Handle game creation from NewGame component
//   const handleGameCreated = (config: Omit<GameConfig, 'selectedPatterns'>, patterns: number[]) => {
//     const fullConfig: GameConfig = {
//       ...config,
//       selectedPatterns: patterns
//     };
//     setGameConfig(fullConfig);
//     setIsGameActive(true);
//     setCurrentPage('playground'); // Navigate to playground
//   };

//   // Handle starting a new game from Playground
//   const handleStartNewGame = () => {
//     setGameConfig(null);
//     setIsGameActive(false);
//     setCurrentPage('newgame'); // Navigate back to new game setup
//   };

//   const renderPage = () => {
//     switch (currentPage) {
//       case 'dashboard':
//         return <Dashboard />;
//       case 'playground':
//         return (
//           <Playground
//             gameConfig={gameConfig}
//             onStartNewGame={handleStartNewGame}
//           />
//         );
//       case 'newgame':
//         return <NewGame onGameCreated={handleGameCreated} />;
//       case 'profile':
//         return <Profile />;
//       case 'settings':
//         return <Settings />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <ThemeProvider>
//       <LanguageProvider>
//         <div className="app-container">
//           <Sidebar
//             currentPage={currentPage}
//             onNavigate={setCurrentPage}
//             isGameActive={isGameActive}
//           />
//           <div className="main-content">
//             <Header />
//             <main className="page-content">
//               {renderPage()}
//             </main>
//           </div>
//         </div>
//       </LanguageProvider>
//     </ThemeProvider>
//   );
// }

// export default App;

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { PopupProvider } from "./contexts/PopupContext";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { BackgroundEffects } from "./components/BackgroundEffects";

import { Dashboard } from "./pages/Dashboard";
import { Playground } from "./pages/Playground";
import { NewGame } from "./pages/NewGame";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { authApi } from "./services/api";

/* ===============================
   TYPES
================================ */
interface GameConfig {
  game: string;
  betBirr: string;
  numPlayers: string;
  winBirr: string;
  selectedPatterns: number[];
  gameCode?: string;
  cartelaNumbers?: string[];
  cartelaData?: number[][];
  drawSequence?: number[];
  cartellaDrawSequences?: number[][];
  backendStatus?: string;
}

/* ===============================
   PROTECTED APP CONTENT
================================ */
function AppLayout({
  gameConfig,
  setGameConfig,
  isGameActive,
  setIsGameActive,
  onLogout,
  username,
}: {
  gameConfig: GameConfig | null;
  setGameConfig: React.Dispatch<React.SetStateAction<GameConfig | null>>;
  isGameActive: boolean;
  setIsGameActive: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => Promise<void>;
  username: string;
}) {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isPlaygroundFullscreen, setIsPlaygroundFullscreen] = useState(false);

  // Handle game creation
  const handleGameCreated = (
    config: Omit<GameConfig, "selectedPatterns">,
    patterns: number[],
  ) => {
    const fullConfig: GameConfig = {
      ...config,
      selectedPatterns: patterns,
    };

    setGameConfig(fullConfig);
    setIsGameActive(true);
    navigate("/playground");
  };

  // Handle starting new game
  const handleStartNewGame = () => {
    setGameConfig(null);
    setIsGameActive(false);
    navigate("/newgame");
  };

  // Handle game state changes from Playground
  const handleGameStateChange = (active: boolean) => {
    setIsGameActive(active);
  };

  // Handle cartela removal
  const handleCartelaRemoved = (cartelaNumber: string) => {
    if (gameConfig && gameConfig.cartelaNumbers) {
      setGameConfig({
        ...gameConfig,
        cartelaNumbers: gameConfig.cartelaNumbers.filter(
          (c) => c !== cartelaNumber,
        ),
      });
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-white dark:bg-slate-950">
      <BackgroundEffects />
      {!isPlaygroundFullscreen && (
        <Sidebar isGameActive={isGameActive} isCollapsed={isSidebarCollapsed} />
      )}
      <div
        className={`relative z-10 flex flex-1 flex-col ${isPlaygroundFullscreen ? "ml-0" : `max-md:ml-50 max-sm:ml-17.5 ${isSidebarCollapsed ? "ml-22" : "ml-62.5"}`}`}
      >
        {!isPlaygroundFullscreen && (
          <Header
            onLogout={onLogout}
            username={username}
            sidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          />
        )}
        <main
          className={`${isPlaygroundFullscreen ? "mt-0 min-h-screen" : "mt-20 min-h-[calc(100vh-80px)]"} overflow-y-auto overflow-x-hidden`}
        >
          <Routes>
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  gameConfig={gameConfig}
                  isGameActive={isGameActive}
                />
              }
            />

            <Route
              path="/playground"
              element={
                <Playground
                  gameConfig={gameConfig}
                  onStartNewGame={handleStartNewGame}
                  onGameStateChange={handleGameStateChange}
                  onCartelaRemoved={handleCartelaRemoved}
                  onFullscreenChange={setIsPlaygroundFullscreen}
                />
              }
            />

            <Route
              path="/newgame"
              element={<NewGame onGameCreated={handleGameCreated} />}
            />

            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Default */}
            <Route path="*" element={<Navigate to="/playground" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ===============================
   MAIN APP
================================ */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authApi.isAuthenticated());
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [username, setUsername] = useState("Shop User");

  const loadMe = async () => {
    try {
      const response = await authApi.getMe();
      const displayName =
        response.user.name?.trim() ||
        response.user.username?.trim() ||
        "Shop User";
      setUsername(displayName);
    } catch (error) {
      console.error("Failed to load current user", error);
      setUsername("Shop User");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadMe();
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoggedIn(false);
      setUsername("Shop User");
      setGameConfig(null);
      setIsGameActive(false);
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <PopupProvider>
          <Router>
            {!isLoggedIn ? (
              <Login onLogin={() => setIsLoggedIn(true)} />
            ) : (
              <AppLayout
                gameConfig={gameConfig}
                setGameConfig={setGameConfig}
                isGameActive={isGameActive}
                setIsGameActive={setIsGameActive}
                onLogout={handleLogout}
                username={username}
              />
            )}
          </Router>
        </PopupProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
