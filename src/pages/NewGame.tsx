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

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Check, Users, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import { gamesApi } from "../services/api";
import { ShopBingoSession } from "../services/types";
import "./NewGame.css";

interface NewGameProps {
  onGameCreated: (config: GameConfig, patterns: number[]) => void;
}

interface GameConfig {
  game: string;
  betBirr: string;
  numPlayers: string;
  winBirr: string;
  gameCode?: string;
  cartelaData?: number[][];
  drawSequence?: number[];
  cartellaDrawSequences?: number[][];
  backendStatus?: string;
}

export const NewGame: React.FC<NewGameProps> = ({ onGameCreated }) => {
  const { t } = useLanguage();
  const popup = usePopup();
  const [session, setSession] = useState<ShopBingoSession | null>(null);
  const [showBetDialog, setShowBetDialog] = useState(true);
  const [betInput, setBetInput] = useState("20");
  const [betLocked, setBetLocked] = useState(false);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [selectedCartellas, setSelectedCartellas] = useState<number[]>([]);
  const [betPerCartella, setBetPerCartella] = useState("20");
  const [submittingLock, setSubmittingLock] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const nextPlayerNumber = useMemo(() => {
    const reservedCount = session?.players_data.length ?? 0;
    return Math.min(reservedCount + 1, 4);
  }, [session]);

  const currentPlayerName = `Player ${nextPlayerNumber}`;

  const lockedByOthers = useMemo(() => {
    if (!session) return new Set<number>();
    return new Set(session.locked_cartellas);
  }, [session]);

  const totalPayable = useMemo(() => {
    const bet = Number.parseFloat(betPerCartella || "0");
    return (
      selectedCartellas.length * (Number.isFinite(bet) ? bet : 0)
    ).toFixed(2);
  }, [betPerCartella, selectedCartellas]);

  const totalLockedPlayers = session?.players_data.length ?? 0;
  const totalPaidPlayers =
    session?.players_data.filter((player) => player.paid).length ?? 0;

  const pageRange = useMemo(() => {
    const start = currentPage === 1 ? 1 : 101;
    return Array.from({ length: 100 }, (_, idx) => start + idx);
  }, [currentPage]);

  const syncSession = async (sessionId: string) => {
    const latest = await gamesApi.getShopSession(sessionId);
    setSession(latest);
  };

  const ensureSession = async (): Promise<ShopBingoSession | null> => {
    if (session) {
      return session;
    }

    try {
      const created = await gamesApi.createShopSession({
        min_bet_per_cartella: betPerCartella,
      });
      setSession(created);
      return created;
    } catch (error) {
      console.error("Failed to initialize shop session", error);
      popup.error("Failed to connect setup with backend.");
      return null;
    }
  };

  useEffect(() => {
    if (!session?.session_id) return;

    const intervalId = setInterval(() => {
      syncSession(session.session_id).catch((error) => {
        console.error("Failed to refresh shop session", error);
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [session?.session_id]);

  const reserveSelection = async (
    cartellas: number[],
    playerName: string,
    silent = false,
  ) => {
    if (!session?.session_id) return;
    try {
      const updated = await gamesApi.reserveShopCartellas(session.session_id, {
        player_name: playerName,
        cartella_numbers: cartellas,
        bet_per_cartella: betPerCartella,
      });
      setSession(updated);
      if (!silent) {
        popup.success("Cartellas reserved.");
      }
    } catch (error) {
      console.error("Failed to reserve cartellas", error);
      if (!silent) {
        popup.error("Failed to reserve cartellas. Some may already be taken.");
      }
      if (session?.session_id) {
        await syncSession(session.session_id);
      }
    }
  };

  const handleCartellaToggle = async (cartellaNumber: number) => {
    if (lockedByOthers.has(cartellaNumber)) {
      popup.warning("This cartella is already locked by another player.");
      return;
    }

    const alreadySelected = selectedCartellas.includes(cartellaNumber);
    if (!alreadySelected && selectedCartellas.length >= 4) {
      popup.warning("A player can select a maximum of 4 cartellas.");
      return;
    }

    const next = alreadySelected
      ? selectedCartellas.filter((number) => number !== cartellaNumber)
      : [...selectedCartellas, cartellaNumber];

    setSelectedCartellas(next);
  };

  const handleLockCurrentPlayer = async () => {
    if (submittingLock) return;
    if (!betLocked) {
      popup.warning("Set and lock bet amount first.");
      return;
    }
    if (totalPaidPlayers >= 4) {
      popup.info("All 4 players are already locked.");
      return;
    }
    if (selectedCartellas.length === 0) {
      popup.warning("Select at least one cartella.");
      return;
    }

    setSubmittingLock(true);
    try {
      const connectedSession = await ensureSession();
      if (!connectedSession) {
        return;
      }

      if (!session || session.session_id !== connectedSession.session_id) {
        setSession(connectedSession);
      }

      await gamesApi.reserveShopCartellas(connectedSession.session_id, {
        player_name: currentPlayerName,
        cartella_numbers: selectedCartellas,
        bet_per_cartella: betPerCartella,
      });

      const response = await gamesApi.confirmShopPlayerPayment(
        connectedSession.session_id,
        {
          player_name: currentPlayerName,
        },
      );

      popup.success(`${currentPlayerName} locked successfully.`);

      setSession(response.session);
      setSelectedCartellas([]);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to lock current player", error);
      popup.error("Failed to lock current player.");
    } finally {
      setSubmittingLock(false);
    }
  };

  const handleClear = async () => {
    const confirmed = await popup.confirm({
      title: "Clear selected cartellas",
      description: "Remove your current cartella selection?",
      confirmText: "Clear",
      cancelText: "Keep",
    });
    if (!confirmed) return;
    setSelectedCartellas([]);
  };

  const handleLockBet = () => {
    const parsed = Number.parseFloat(betInput);
    if (!Number.isFinite(parsed) || parsed < 20) {
      popup.warning("Minimum bet per cartella is 20 ETB.");
      return;
    }
    const locked = parsed.toFixed(2);
    setBetPerCartella(locked);
    setBetLocked(true);
    setShowBetDialog(false);
  };

  const handleCheckPaymentAndCreate = async () => {
    if (!session?.session_id) {
      popup.warning("Lock all players first.");
      return;
    }

    if (totalLockedPlayers < 4) {
      popup.warning("Lock all 4 players before checking payment.");
      return;
    }

    const confirmed = await popup.confirm({
      title: "Check Payment",
      description:
        "Confirm payments for all 4 players and create the game now?",
      confirmText: "Create Game",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    setSubmittingPayment(true);
    try {
      let latestSession = await gamesApi.getShopSession(session.session_id);
      setSession(latestSession);

      let createdGame = null as any;

      for (const player of latestSession.players_data) {
        if (player.paid) {
          continue;
        }

        const response = await gamesApi.confirmShopPlayerPayment(
          session.session_id,
          {
            player_name: player.player_name,
          },
        );

        latestSession = response.session;
        setSession(latestSession);

        if (response.game_created && response.game) {
          createdGame = response.game;
          break;
        }
      }

      if (!createdGame) {
        popup.error("Could not create game after payment check.");
        return;
      }

      const cartelaNumbers = Object.keys(createdGame.cartella_number_map || {});
      const allSelectedPatterns = cartelaNumbers.map((value) =>
        Number.parseInt(value, 10),
      );

      const config: GameConfig & { cartelaNumbers: string[] } = {
        game: createdGame.game_code,
        gameCode: createdGame.game_code,
        betBirr: createdGame.bet_amount,
        numPlayers: String(createdGame.num_players),
        winBirr: createdGame.win_amount,
        cartelaNumbers,
        cartelaData: createdGame.cartella_numbers,
        drawSequence: createdGame.draw_sequence,
        cartellaDrawSequences: createdGame.cartella_draw_sequences,
        backendStatus: createdGame.status,
      };

      onGameCreated(config, allSelectedPatterns);
      popup.success(`Game created: ${createdGame.game_code}`);
    } catch (error) {
      console.error("Failed during payment check", error);
      popup.error("Payment check failed.");
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="new-game">
      <Dialog
        open={showBetDialog}
        onOpenChange={(open) => {
          if (!betLocked) {
            setShowBetDialog(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Bet Amount</DialogTitle>
            <DialogDescription>
              Enter bet amount once. It will be locked and used for all players.
              Minimum is 20 ETB per cartella.
            </DialogDescription>
          </DialogHeader>

          <Input
            type="number"
            min={20}
            value={betInput}
            onChange={(e) => setBetInput(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={handleLockBet}>Lock Bet Amount</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.div
        className="new-game-header"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="">Shop-Based 75-Ball Bingo</h1>
      </motion.div>

      <div className="new-game-content">
        <motion.div
          className="game-config"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="config-card">
            <h2>Shop Game Config</h2>
            <div className="config-form">
              <div className="form-group">
                <label>Session ID</label>
                <Input
                  value={session?.session_id || "Not connected yet"}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Current Player</label>
                <Input value={currentPlayerName} disabled />
              </div>
              <div className="form-group">
                <label>Fixed Players</label>
                <Input value={String(session?.fixed_players || 4)} disabled />
              </div>
              <div className="form-group">
                <label>Bet / Cartella (ETB)</label>
                <Input type="number" value={betPerCartella} disabled />
              </div>
              <div className="form-group info-box">
                <label>Selected Cartellas: {selectedCartellas.length}/4</label>
                <div className="selected-patterns-list">
                  {selectedCartellas.length > 0 ? (
                    selectedCartellas.map((cartella) => (
                      <span key={cartella} className="pattern-tag">
                        {cartella}
                      </span>
                    ))
                  ) : (
                    <span className="no-patterns">No cartellas selected</span>
                  )}
                </div>
              </div>

              <div className="form-group info-box">
                <label>
                  <Wallet size={16} className="inline mr-1" /> Total Payable
                </label>
                <div className="shop75-payable">{totalPayable} ETB</div>
              </div>

              <div className="form-group info-box">
                <label>
                  <Users size={16} className="inline mr-1" /> Players Locked
                </label>
                <div className="shop75-players">
                  {totalLockedPlayers}/4 players reserved, {totalPaidPlayers}/4
                  paid
                </div>
              </div>

              <div className="shop75-progress-row">
                {[1, 2, 3, 4].map((playerNum) => {
                  const reserved =
                    (session?.players_data.length || 0) >= playerNum;
                  const paid = totalPaidPlayers >= playerNum;
                  return (
                    <div
                      key={playerNum}
                      className={`shop75-progress-chip ${paid ? "paid" : reserved ? "reserved" : "pending"}`}
                    >
                      P{playerNum}
                    </div>
                  );
                })}
              </div>

              <div className="form-group info-box">
                <label>Next Step</label>
                <div className="shop75-players">
                  Select up to 4 cartellas for {currentPlayerName}, then lock to
                  continue.
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
            <div className="patterns-header shop75-pages">
              <h2>Cartella Selection (1–200)</h2>
              <div className="shop75-page-actions">
                <Button
                  variant={currentPage === 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(1)}
                  size="sm"
                >
                  1–100
                </Button>
                <Button
                  variant={currentPage === 2 ? "default" : "outline"}
                  onClick={() => setCurrentPage(2)}
                  size="sm"
                >
                  101–200
                </Button>
              </div>
            </div>
            <div className="patterns-grid">
              {pageRange.map((number) => {
                const isSelected = selectedCartellas.includes(number);
                const isLocked = lockedByOthers.has(number);

                return (
                  <motion.button
                    key={number}
                    className={`pattern-box ${isSelected ? "selected" : ""} ${isLocked ? "shop75-locked" : ""}`}
                    onClick={() => handleCartellaToggle(number)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLocked}
                  >
                    {isSelected && (
                      <motion.div
                        className="check-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check size={16} />
                      </motion.div>
                    )}
                    {number}
                  </motion.button>
                );
              })}
            </div>
            <div className="patterns-info">
              <p>• Fixed mode: exactly 4 players required to start.</p>
              <p>• A player can hold at most 4 cartellas.</p>
              <p>• Locked cartellas are disabled in real time for others.</p>
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
        <Button
          className="confirm-btn"
          onClick={handleLockCurrentPlayer}
          disabled={
            submittingLock ||
            totalLockedPlayers >= 4 ||
            !betLocked ||
            submittingPayment
          }
        >
          {submittingLock ? "Locking..." : `Lock ${currentPlayerName}`}
        </Button>

        <Button
          className="confirm-btn"
          onClick={handleCheckPaymentAndCreate}
          disabled={submittingPayment || totalLockedPlayers < 4}
        >
          {submittingPayment ? "Checking Payment..." : "Check Payment"}
        </Button>

        <Button className="clear-btn" variant="outline" onClick={handleClear}>
          {t("common.clear")} Selection
        </Button>
      </motion.div>
    </div>
  );
};
