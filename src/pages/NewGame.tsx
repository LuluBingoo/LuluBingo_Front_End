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
import { Check, ShieldCheck, Sparkles, Users, Wallet } from "lucide-react";
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
import { gamesApi, shopApi } from "../services/api";
import { ShopBingoPlayer, ShopBingoSession } from "../services/types";
import { useNavigate } from "react-router-dom";
import { formatCurrency, getCurrencyLabel } from "../services/settings";
import audioMap from "../audioMap";

interface NewGameProps {
  onGameCreated: (
    config: Omit<GameConfig, "selectedPatterns" | "backendStatus"> & {
      backendStatus?: string;
    },
    patterns: number[],
  ) => void;
}

interface GameConfig {
  game: string;
  betBirr: string;
  numPlayers: string;
  winBirr: string;
  playMode?: "online" | "offline";
  gameCode?: string;
  cartellaNumberMap?: Record<string, number>;
  cartelaData?: number[][];
  drawSequence?: number[];
  cartellaDrawSequences?: number[][];
  cartellaStatuses?: Record<string, "active" | "banned" | "winner">;
  backendStatus?: string;
}

export const NewGame: React.FC<NewGameProps> = ({ onGameCreated }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const popup = usePopup();
  const [session, setSession] = useState<ShopBingoSession | null>(null);
  const [showBetDialog, setShowBetDialog] = useState(true);
  const [betInput, setBetInput] = useState("20");
  const [playersInput, setPlayersInput] = useState("4");
  const [playMode, setPlayMode] = useState<"online" | "offline">("offline");
  const [fixedPlayers, setFixedPlayers] = useState(4);
  const [betLocked, setBetLocked] = useState(false);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [selectedCartellas, setSelectedCartellas] = useState<number[]>([]);
  const [stagedPlayers, setStagedPlayers] = useState<ShopBingoPlayer[]>([]);
  const [betPerCartella, setBetPerCartella] = useState("20");
  const [submittingLock, setSubmittingLock] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [walletBalance, setWalletBalance] = useState("0");
  const [shopCutPercentage, setShopCutPercentage] = useState("0");
  const [luluCutPercentage, setLuluCutPercentage] = useState("0");
  const [isFinancialLoading, setIsFinancialLoading] = useState(false);
  const currencyLabel = getCurrencyLabel();
  const targetPlayers = session?.fixed_players || fixedPlayers;

  const parseAmount = (value: unknown, fallback = 0) => {
    const parsed = Number.parseFloat(String(value ?? ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const nextPlayerNumber = useMemo(() => {
    const reservedCount =
      (session?.players_data.length ?? 0) + stagedPlayers.length;
    return Math.min(reservedCount + 1, targetPlayers);
  }, [session, stagedPlayers, targetPlayers]);

  const currentPlayerName = `${t("newGame.playerWord")} ${nextPlayerNumber}`;

  const stagedLockedCartellas = useMemo(
    () => new Set(stagedPlayers.flatMap((player) => player.cartella_numbers)),
    [stagedPlayers],
  );

  const lockedByOthers = useMemo(() => {
    const serverLocked = session?.locked_cartellas ?? [];
    return new Set([...serverLocked, ...stagedLockedCartellas]);
  }, [session, stagedLockedCartellas]);

  const totalPayable = useMemo(() => {
    const bet = Number.parseFloat(betPerCartella || "0");
    return (
      selectedCartellas.length * (Number.isFinite(bet) ? bet : 0)
    ).toFixed(2);
  }, [betPerCartella, selectedCartellas]);

  const totalLockedPlayers =
    (session?.players_data.length ?? 0) + stagedPlayers.length;
  const totalPaidPlayers =
    session?.players_data.filter((player) => player.paid).length ?? 0;

  const serverReservedTotal = useMemo(() => {
    const players = session?.players_data ?? [];
    return players.reduce((total, player) => {
      const providedTotal = parseAmount(player.total_bet, Number.NaN);
      if (Number.isFinite(providedTotal)) {
        return total + providedTotal;
      }
      return (
        total +
        parseAmount(player.bet_per_cartella) *
          (player.cartella_numbers?.length ?? 0)
      );
    }, 0);
  }, [session?.players_data]);

  const stagedReservedTotal = useMemo(
    () =>
      stagedPlayers.reduce((total, player) => {
        const providedTotal = parseAmount(player.total_bet, Number.NaN);
        if (Number.isFinite(providedTotal)) {
          return total + providedTotal;
        }
        return (
          total +
          parseAmount(player.bet_per_cartella) *
            (player.cartella_numbers?.length ?? 0)
        );
      }, 0),
    [stagedPlayers],
  );

  const projectedTotalPool = useMemo(
    () => serverReservedTotal + stagedReservedTotal,
    [serverReservedTotal, stagedReservedTotal],
  );

  const projectedShopCut = useMemo(
    () => (projectedTotalPool * parseAmount(shopCutPercentage)) / 100,
    [projectedTotalPool, shopCutPercentage],
  );

  const projectedLuluCut = useMemo(
    () => (projectedShopCut * parseAmount(luluCutPercentage)) / 100,
    [projectedShopCut, luluCutPercentage],
  );

  const availableBalanceAmount = useMemo(
    () => parseAmount(walletBalance),
    [walletBalance],
  );

  const pageRange = useMemo(() => {
    const start = currentPage === 1 ? 1 : 101;
    return Array.from({ length: 100 }, (_, idx) => start + idx);
  }, [currentPage]);

  const syncSession = async (sessionId: string) => {
    const latest = await gamesApi.getShopSession(sessionId);
    setSession(latest);
  };

  const syncShopFinancials = async () => {
    setIsFinancialLoading(true);
    try {
      const profile = await shopApi.getProfile();
      setWalletBalance(String(profile.wallet_balance ?? "0"));
      setShopCutPercentage(String(profile.shop_cut_percentage ?? "0"));
      setLuluCutPercentage(String(profile.lulu_cut_percentage ?? "0"));
      return profile;
    } catch (error) {
      console.error("Failed to refresh shop financial profile", error);
      popup.warning(
        "Unable to refresh latest Lulu reserve balance. Using current data.",
      );
      return null;
    } finally {
      setIsFinancialLoading(false);
    }
  };

  const ensureSession = async (): Promise<ShopBingoSession | null> => {
    if (session) {
      return session;
    }

    try {
      const created = await gamesApi.createShopSession({
        min_bet_per_cartella: betPerCartella,
        fixed_players: fixedPlayers,
        play_mode: playMode,
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
    void syncShopFinancials();
  }, []);

  useEffect(() => {
    if (!session?.session_id) return;

    const intervalId = setInterval(() => {
      syncSession(session.session_id).catch((error) => {
        console.error("Failed to refresh shop session", error);
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [session?.session_id]);

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
    if (totalPaidPlayers >= targetPlayers) {
      popup.info(`All ${targetPlayers} players are already locked.`);
      return;
    }
    if (selectedCartellas.length === 0) {
      popup.warning("Select at least one cartella.");
      return;
    }

    setSubmittingLock(true);
    try {
      const betAmount = Number.parseFloat(betPerCartella || "0");
      const totalBet = (selectedCartellas.length * betAmount).toFixed(2);

      setStagedPlayers((prev) => [
        ...prev,
        {
          player_name: currentPlayerName,
          cartella_numbers: [...selectedCartellas],
          bet_per_cartella: betPerCartella,
          total_bet: totalBet,
          paid: false,
        },
      ]);

      popup.success(`${currentPlayerName} locked locally.`);

      // Play sound when all players are locked
      const newTotal =
        (session?.players_data.length ?? 0) + stagedPlayers.length + 1;
      if (newTotal >= targetPlayers) {
        const audio = new Audio(audioMap["Check_is_your_card_is_saved"]);
        void audio.play();
      }

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
      popup.warning(`Minimum bet per cartella is 20 ${currencyLabel}.`);
      return;
    }

    const parsedPlayers = Number.parseInt(playersInput, 10);
    if (!Number.isFinite(parsedPlayers) || parsedPlayers < 2) {
      popup.warning("Minimum number of players is 2.");
      return;
    }

    if (parsedPlayers > 7) {
      popup.warning("Maximum number of players is 7.");
      return;
    }

    const locked = parsed.toFixed(2);
    setBetPerCartella(locked);
    setFixedPlayers(parsedPlayers);
    setBetLocked(true);
    setShowBetDialog(false);
  };

  const handleCheckPaymentAndCreate = async () => {
    const serverLockedCount = session?.players_data.length ?? 0;
    const stagedLockedCount = stagedPlayers.length;

    if (!session?.session_id && stagedLockedCount === 0) {
      popup.warning(t("newGame.lockAllPlayersFirst"));
      return;
    }

    if (serverLockedCount + stagedLockedCount < targetPlayers) {
      popup.warning(`Lock all ${targetPlayers} players first.`);
      return;
    }

    const freshProfile = await syncShopFinancials();
    const effectiveBalance = parseAmount(
      freshProfile?.wallet_balance ?? walletBalance,
    );
    const effectiveShopCutPercentage = parseAmount(
      freshProfile?.shop_cut_percentage ?? shopCutPercentage,
    );
    const effectiveLuluCutPercentage = parseAmount(
      freshProfile?.lulu_cut_percentage ?? luluCutPercentage,
    );

    const effectiveProjectedShopCut =
      (projectedTotalPool * effectiveShopCutPercentage) / 100;
    const effectiveProjectedLuluCut =
      (effectiveProjectedShopCut * effectiveLuluCutPercentage) / 100;

    if (effectiveBalance < effectiveProjectedLuluCut) {
      const shortBy = Math.max(0, effectiveProjectedLuluCut - effectiveBalance);
      popup.error(
        `Insufficient Lulu reserve for this game. Required ${formatCurrency(effectiveProjectedLuluCut.toFixed(2))}, available ${formatCurrency(effectiveBalance.toFixed(2))}, short by ${formatCurrency(shortBy.toFixed(2))}.`,
      );
      return;
    }

    const confirmed = await popup.confirm({
      title: "Check Payment",
      description: `Confirm payments for all ${targetPlayers} players and create the game now?`,
      confirmText: t("newGame.createGame"),
      cancelText: t("common.cancel"),
    });

    if (!confirmed) return;

    setSubmittingPayment(true);
    try {
      const connectedSession = await ensureSession();
      if (!connectedSession) {
        return;
      }

      let latestSession = connectedSession;

      for (const stagedPlayer of stagedPlayers) {
        latestSession = await gamesApi.reserveShopCartellas(
          latestSession.session_id,
          {
            player_name: stagedPlayer.player_name,
            cartella_numbers: stagedPlayer.cartella_numbers,
            bet_per_cartella: stagedPlayer.bet_per_cartella,
          },
        );
      }

      const response = await gamesApi.createShopGameFromSession(
        latestSession.session_id,
      );
      setSession(response.session);
      setStagedPlayers([]);
      const createdGame = response.game;

      if (!createdGame) {
        popup.error(t("newGame.createGameFailed"));
        return;
      }

      const cartelaNumbers = (createdGame.assigned_cartella_numbers || []).map(
        (value) => String(value),
      );
      const allSelectedPatterns = cartelaNumbers.map((value) =>
        Number.parseInt(value, 10),
      );

      const config: GameConfig & { cartelaNumbers: string[] } = {
        game: createdGame.game_code,
        gameCode: createdGame.game_code,
        betBirr: createdGame.bet_amount,
        numPlayers: String(createdGame.num_players),
        winBirr: createdGame.win_amount,
        playMode,
        cartelaNumbers,
        cartellaNumberMap: createdGame.cartella_number_map || {},
        cartelaData: createdGame.cartella_numbers,
        drawSequence: createdGame.draw_sequence,
        cartellaDrawSequences: createdGame.cartella_draw_sequences,
        cartellaStatuses: createdGame.cartella_statuses || {},
        backendStatus: createdGame.status,
      };

      onGameCreated(config, allSelectedPatterns);
      popup.success(`${t("newGame.gameCreated")}: ${createdGame.game_code}`);
    } catch (error) {
      console.error("Failed during payment check", error);
      const err = error as any;
      const errorData = err?.data || err?.response?.data || {};
      if (errorData?.error_code === "insufficient_lulu_cut_balance") {
        const required = errorData?.required_lulu_cut || "0";
        const current = errorData?.current_balance || "0";
        popup.error(
          `Insufficient Lulu reserve for this game. Required ${formatCurrency(required)}, available ${formatCurrency(current)}.`,
        );
      } else {
        const detail =
          errorData?.detail || err?.message || t("newGame.paymentCheckFailed");
        popup.error(String(detail));
      }
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {submittingPayment && (
        <div className="fixed inset-0 z-9999 flex h-dvh w-screen items-center justify-center bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
          <div className="w-[min(92vw,680px)] space-y-5 rounded-2xl border border-red-200 bg-white/95 p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900/95">
            <div className="text-center">
              <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
                Creating Bingo Game...
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Checking payments and locking cartellas.
              </p>
            </div>

            <div className="relative h-20 overflow-hidden rounded-xl border border-red-100 bg-linear-to-r from-red-50 via-white to-sky-50 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
              <motion.div
                className="absolute inset-y-0 left-0 flex items-center gap-3 px-2"
                animate={{ x: [0, -360] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
              >
                {[
                  "B-07",
                  "I-19",
                  "N-42",
                  "G-53",
                  "O-71",
                  "B-14",
                  "I-24",
                  "N-36",
                  "G-60",
                  "O-66",
                  "B-07",
                  "I-19",
                  "N-42",
                  "G-53",
                  "O-71",
                ].map((label, index) => (
                  <motion.div
                    key={`${label}-${index}`}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-white text-xs font-black text-red-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-red-300"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: (index % 5) * 0.08,
                    }}
                  >
                    {label}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-red-500 via-amber-400 to-emerald-500"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <p className="text-center text-xs font-medium tracking-wide text-slate-500 dark:text-slate-300">
                PLEASE WAIT • FINALIZING SESSION
              </p>
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={!betLocked && showBetDialog}
        onOpenChange={() => {
          if (!betLocked) {
            setShowBetDialog(true);
          }
        }}
      >
        <DialogContent
          className="max-w-4xl border-0 bg-transparent p-0 shadow-none [&>button]:hidden"
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-linear-to-br from-rose-100 via-amber-50 to-sky-100 p-1 shadow-[0_35px_90px_rgba(15,23,42,0.28)] dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <div className="pointer-events-none absolute -top-16 -left-12 h-48 w-48 rounded-full bg-rose-300/35 blur-3xl dark:bg-rose-500/20" />
            <div className="pointer-events-none absolute -right-14 -bottom-16 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/20" />

            <div className="relative rounded-3xl bg-white/92 p-6 backdrop-blur-xl dark:bg-slate-950/88 sm:p-7">
              <DialogHeader className="space-y-4 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                      <Sparkles size={14} />
                      Setup Required
                    </span>

                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      {t("newGame.setBetAmount")}
                    </DialogTitle>

                    <DialogDescription className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                      This step is mandatory. Enter bet amount once to continue.
                      Minimum is 20 {currencyLabel} per cartella.
                    </DialogDescription>
                  </div>

                  <div className="hidden rounded-2xl border border-emerald-200 bg-emerald-100/80 p-3 text-emerald-700 shadow-sm dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 sm:block">
                    <ShieldCheck size={26} />
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-rose-200 bg-white/85 p-4 shadow-sm dark:border-rose-800/60 dark:bg-slate-900/70">
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
                    {t("newGame.betPerCartella")}
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex h-11 min-w-12 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-2 text-sm font-black text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                      {currencyLabel}
                    </span>
                    <Input
                      type="number"
                      min={20}
                      value={betInput}
                      onChange={(e) => setBetInput(e.target.value)}
                      className="h-11 border-rose-200 bg-white text-lg font-semibold dark:border-rose-700/70 dark:bg-slate-950"
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Minimum: 20 {currencyLabel} per cartella
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-white/85 p-4 shadow-sm dark:border-sky-800/60 dark:bg-slate-900/70">
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                    {t("newGame.numPlayers")}
                  </label>
                  <Input
                    type="number"
                    min={2}
                    max={7}
                    value={playersInput}
                    onChange={(e) => setPlayersInput(e.target.value)}
                    placeholder={t("newGame.numPlayers")}
                    className="mt-2 h-11 border-sky-200 bg-white text-lg font-semibold dark:border-sky-700/70 dark:bg-slate-950"
                  />
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Allowed range: 2 to 7 players
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  Mandatory Step
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  One-Time Setup
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide">
                  <span className="font-bold text-slate-500 dark:text-slate-400">
                    Play Mode
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {playMode === "online"
                      ? "Dynamic Boards"
                      : "Fixed Printable Boards"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={playMode === "online" ? "default" : "outline"}
                    className={
                      playMode === "online"
                        ? "h-11 bg-linear-to-r from-emerald-500 to-emerald-700 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:from-emerald-600 hover:to-emerald-800"
                        : "h-11 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20"
                    }
                    onClick={() => setPlayMode("online")}
                  >
                    Online Mode
                  </Button>
                  <Button
                    type="button"
                    variant={playMode === "offline" ? "default" : "outline"}
                    className={
                      playMode === "offline"
                        ? "h-11 bg-linear-to-r from-rose-600 to-red-800 text-white shadow-[0_8px_20px_rgba(225,29,72,0.35)] hover:from-rose-700 hover:to-red-900"
                        : "h-11 border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/20"
                    }
                    onClick={() => setPlayMode("offline")}
                  >
                    Offline Mode
                  </Button>
                </div>
              </div>

              <div
                className={`mt-4 rounded-xl border px-3 py-2.5 text-sm ${playMode === "online" ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300"}`}
              >
                {playMode === "online"
                  ? "Online uses newly generated random cartella boards for each game."
                  : "Offline uses the same fixed 200 printable cartellas for every game."}
              </div>

              <DialogFooter className="mt-6 gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  className="h-11 border-slate-300 bg-white/80 px-5 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                  onClick={() => navigate("/playground")}
                >
                  {t("newGame.cancelToDashboard")}
                </Button>
                <Button
                  className="h-11 bg-linear-to-r from-rose-600 via-red-600 to-red-800 px-6 font-bold text-white shadow-[0_10px_24px_rgba(225,29,72,0.4)] hover:from-rose-700 hover:via-red-700 hover:to-red-900"
                  onClick={handleLockBet}
                >
                  {t("newGame.lockBetAmount")}
                </Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <motion.div
        className="mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("newGame.shopTitle")}
        </h1>
      </motion.div>

      {!betLocked ? (
        <Card className="border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-200">
          <p className="text-sm font-medium">{t("newGame.lockBetFirst")}</p>
        </Card>
      ) : null}

      <motion.div
        className="flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          className="bg-red-700 text-white hover:bg-red-800"
          onClick={handleLockCurrentPlayer}
          disabled={
            submittingLock ||
            totalLockedPlayers >= targetPlayers ||
            !betLocked ||
            submittingPayment
          }
        >
          {submittingLock
            ? t("newGame.locking")
            : `${t("newGame.lock")} ${currentPlayerName}`}
        </Button>

        <Button
          className="bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={handleCheckPaymentAndCreate}
          disabled={
            submittingPayment ||
            totalLockedPlayers < targetPlayers ||
            availableBalanceAmount < projectedLuluCut
          }
        >
          {submittingPayment
            ? t("newGame.checkingPayment")
            : t("newGame.checkPayment")}
        </Button>

        <Button
          variant="outline"
          onClick={handleClear}
          disabled={submittingLock || submittingPayment}
        >
          {t("common.clear")}
        </Button>
      </motion.div>

      {!betLocked ? null : (
        <>
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <motion.div
              className=""
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="space-y-4 p-5">
                <h2 className="text-lg font-semibold">
                  {t("newGame.shopGameConfig")}
                </h2>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      {t("newGame.sessionId")}
                    </label>
                    <Input
                      value={
                        session?.session_id || t("newGame.notConnectedYet")
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      {t("newGame.currentPlayer")}
                    </label>
                    <Input value={currentPlayerName} disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Play Mode</label>
                    <Input value={session?.play_mode || playMode} disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      {t("newGame.fixedPlayers")}
                    </label>
                    <Input value={String(targetPlayers)} disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      {t("newGame.betPerCartella")}
                    </label>
                    <Input type="number" value={betPerCartella} disabled />
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <label className="text-sm font-medium">
                      {t("newGame.selectedCartellas")}:{" "}
                      {selectedCartellas.length}/4
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCartellas.length > 0 ? (
                        selectedCartellas.map((cartella) => (
                          <span
                            key={cartella}
                            className="rounded-full bg-red-700 px-2.5 py-1 text-xs font-semibold text-white"
                          >
                            {cartella}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">
                          {t("newGame.noCartellasSelected")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <label className="text-sm font-medium">
                      <Wallet size={16} className="inline mr-1" />{" "}
                      {t("newGame.totalPayable")}
                    </label>
                    <div className="mt-1 text-lg font-bold text-emerald-600">
                      {formatCurrency(totalPayable)}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <label className="text-sm font-medium">
                      Lulu Reserve Balance
                    </label>
                    <div className="mt-1 text-lg font-bold text-sky-600">
                      {formatCurrency(walletBalance)}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Shop cut {shopCutPercentage}% • Lulu cut{" "}
                      {luluCutPercentage}%
                    </p>
                    {isFinancialLoading && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Refreshing reserve...
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <label className="text-sm font-medium">
                      Estimated Lulu Cut (Session)
                    </label>
                    <div className="mt-1 text-lg font-bold text-rose-600">
                      {formatCurrency(projectedLuluCut.toFixed(2))}
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Pool {formatCurrency(projectedTotalPool.toFixed(2))} •
                      Shop cut {formatCurrency(projectedShopCut.toFixed(2))}
                    </p>
                    {availableBalanceAmount < projectedLuluCut && (
                      <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-300">
                        Reserve is not enough for this Lulu cut.
                      </p>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <label className="text-sm font-medium">
                      <Users size={16} className="inline mr-1" />{" "}
                      {t("newGame.playersLocked")}
                    </label>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      {totalLockedPlayers}/{targetPlayers}{" "}
                      {t("newGame.playersReserved")}, {totalPaidPlayers}/
                      {targetPlayers} {t("newGame.paid")}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {Array.from(
                      { length: targetPlayers },
                      (_, index) => index + 1,
                    ).map((playerNum) => {
                      const reserved =
                        (session?.players_data.length || 0) >= playerNum;
                      const paid = totalPaidPlayers >= playerNum;
                      return (
                        <div
                          key={playerNum}
                          className={`rounded-md px-2 py-1 text-center text-xs font-semibold ${paid ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : reserved ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}
                        >
                          {t("newGame.pWord")}
                          {playerNum}
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50">
                    <label className="text-sm font-medium">
                      {t("newGame.nextStep")}
                    </label>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      {t("newGame.selectUpTo4")} {currentPlayerName}
                      {t("newGame.thenLock")}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              className=""
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">
                    {t("newGame.cartellaSelection")}
                  </h2>
                  <div className="flex items-center gap-2">
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
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                  {pageRange.map((number) => {
                    const isSelected = selectedCartellas.includes(number);
                    const isLocked = lockedByOthers.has(number);

                    return (
                      <motion.button
                        key={number}
                        className={`relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border text-base font-semibold transition ${isLocked ? "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500 shadow-inner dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" : isSelected ? "border-red-700 bg-linear-to-br from-red-500 via-red-600 to-red-800 text-white shadow-[0_10px_20px_rgba(185,28,28,0.45)]" : "border-slate-300 bg-linear-to-br from-white via-slate-100 to-slate-300 text-slate-800 shadow-[inset_0_8px_10px_rgba(255,255,255,0.78),0_6px_14px_rgba(15,23,42,0.18)] hover:border-red-300 hover:shadow-[inset_0_10px_12px_rgba(255,255,255,0.88),0_10px_18px_rgba(185,28,28,0.22)] dark:border-slate-700 dark:bg-linear-to-br dark:from-slate-700 dark:via-slate-800 dark:to-slate-950 dark:text-slate-100 dark:hover:text-white"}`}
                        onClick={() => handleCartellaToggle(number)}
                        whileHover={{ scale: 1.07 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLocked}
                      >
                        {isSelected && (
                          <motion.div
                            className="absolute top-0 right-0 p-0.5"
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
                <div className="space-y-1 text-sm text-slate-500 dark:text-slate-300">
                  <p>{t("newGame.fixedModeInfo")}</p>
                  <p>{t("newGame.maxCartellasInfo")}</p>
                  <p>{t("newGame.lockedConfigInfo")}</p>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};
