import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Trophy, X, UserX, ChevronDown } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import { getOfflineCartellaBoard } from "../data/offlineCartellas";

interface CartelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartelaNumber?: string;
  playMode?: "online" | "offline";
  calledNumbers: number[];
  cartelaNumbers: string[];
  cartelaDataMap?: Record<string, number[]>;
  cartellaStatuses?: Record<string, "active" | "banned" | "winner">;
  onDeclareWinner?: (cartelaNumber: string) => void;
  onRemovePlayer?: (cartelaNumber: string) => void;
  gameActive?: boolean;
}

// Generate random cartela numbers (5x5 grid with FREE center)
const generateCartelaNumbers = (seed: string): number[] => {
  const numbers: number[] = [];

  // Use seed to generate consistent numbers for same cartela
  const seedNum = parseInt(seed) || 1;
  const random = (min: number, max: number, offset: number) => {
    const x = Math.sin(seedNum * offset) * 10000;
    return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
  };

  // Column ranges for B, I, N, G, O
  const columnRanges = [
    { min: 1, max: 15 }, // B
    { min: 16, max: 30 }, // I
    { min: 31, max: 45 }, // N
    { min: 46, max: 60 }, // G
    { min: 61, max: 75 }, // O
  ];

  // Generate 5 numbers for each column
  for (let col = 0; col < 5; col++) {
    const { min, max } = columnRanges[col];
    const columnNumbers: number[] = [];

    let attempts = 0;
    while (columnNumbers.length < 5 && attempts < 100) {
      const num = random(min, max, col * 100 + columnNumbers.length + attempts);
      if (!columnNumbers.includes(num)) {
        columnNumbers.push(num);
      }
      attempts++;
    }

    numbers.push(...columnNumbers);
  }

  numbers[12] = 0;
  return numbers;
};

export const CartelaModal: React.FC<CartelaModalProps> = ({
  isOpen,
  onClose,
  cartelaNumber,
  playMode = "online",
  calledNumbers,
  cartelaNumbers,
  cartelaDataMap,
  cartellaStatuses,
  onDeclareWinner,
  onRemovePlayer,
  gameActive = true,
}) => {
  const { t } = useLanguage();
  const popup = usePopup();
  const [selectedCartela, setSelectedCartela] = useState(cartelaNumber || "");
  const [cartelaData, setCartelaData] = useState<number[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const getCartellaStatusByNumber = useCallback(
    (number: string): "active" | "banned" | "winner" => {
      const normalized = Number.parseInt(String(number).replace(/\D/g, ""), 10);
      if (!Number.isFinite(normalized)) {
        return "active";
      }

      for (const [index, value] of Object.entries(cartellaStatuses || {})) {
        const cartelaLabel = cartelaNumbers[Number(index)];
        const cartelaNum = Number.parseInt(
          String(cartelaLabel ?? "").replace(/\D/g, ""),
          10,
        );
        if (Number.isFinite(cartelaNum) && cartelaNum === normalized) {
          return value;
        }
      }

      return "active";
    },
    [cartellaStatuses, cartelaNumbers],
  );

  const selectableCartelaNumbers = useMemo(
    () =>
      cartelaNumbers.filter(
        (number) => getCartellaStatusByNumber(number) !== "banned",
      ),
    [cartelaNumbers, getCartellaStatusByNumber],
  );

  // Generate or retrieve cartela data when cartela changes
  useEffect(() => {
    if (selectedCartela) {
      if (playMode === "offline") {
        const offlineBoard = getOfflineCartellaBoard(selectedCartela);
        setCartelaData(offlineBoard ? [...offlineBoard] : []);
      } else {
        const providedNumbers = cartelaDataMap?.[selectedCartela];
        if (providedNumbers && providedNumbers.length > 0) {
          setCartelaData(providedNumbers);
          return;
        }

        const generatedNumbers = generateCartelaNumbers(selectedCartela);
        setCartelaData(generatedNumbers);
      }
    }
  }, [selectedCartela, cartelaDataMap, playMode]);

  // Initialize with provided cartela number
  useEffect(() => {
    if (cartelaNumber) {
      setSelectedCartela(cartelaNumber);
    }
  }, [cartelaNumber]);

  useEffect(() => {
    if (!selectedCartela) {
      return;
    }

    if (getCartellaStatusByNumber(selectedCartela) === "banned") {
      setSelectedCartela("");
      popup.info("This cartela is beautifully banned and cannot be selected.");
    }
  }, [selectedCartela, getCartellaStatusByNumber, popup]);

  const handleSelectCartela = (number: string) => {
    setSelectedCartela(number);
    setShowDropdown(false);
  };

  const getCalledCount = () => {
    return cartelaData.filter((num) => num !== 0 && calledNumbers.includes(num))
      .length;
  };

  const isMarked = useCallback(
    (value: number) => value === 0 || calledNumbers.includes(value),
    [calledNumbers],
  );

  const hasWinningPattern = useMemo(() => {
    if (cartelaData.length !== 25) {
      return false;
    }

    const grid = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => cartelaData[col * 5 + row]),
    );

    const hasRow = grid.some((row) => row.every(isMarked));
    const hasMainDiagonal = [0, 1, 2, 3, 4].every((idx) =>
      isMarked(grid[idx][idx]),
    );
    const hasAntiDiagonal = [0, 1, 2, 3, 4].every((idx) =>
      isMarked(grid[idx][4 - idx]),
    );

    return hasRow || hasMainDiagonal || hasAntiDiagonal;
  }, [cartelaData, isMarked]);

  const handleDeclareWinner = async () => {
    if (!hasWinningPattern) {
      popup.warning(
        `Cartela ${selectedCartela} does not have a complete row or diagonal yet.`,
      );
      return;
    }

    const confirmed = await popup.confirm({
      title: `Declare Winner`,
      description: `Declare cartela ${selectedCartela} as winner?`,
      confirmText: "Declare",
      cancelText: "Cancel",
    });
    if (confirmed) {
      onDeclareWinner?.(selectedCartela);
      onClose();
    }
  };

  const handleRemovePlayer = async () => {
    const confirmed = await popup.confirm({
      title: "Remove Player",
      description: `Remove cartela ${selectedCartela} from the game?`,
      confirmText: "Remove",
      cancelText: "Cancel",
    });
    if (confirmed) {
      onRemovePlayer?.(selectedCartela);
      onClose();
    }
  };

  const renderCartelaBoard = () => {
    if (cartelaData.length === 0) return null;

    const board = [];

    // BINGO headers
    board.push(
      <div key="headers" className="grid grid-cols-5 gap-2">
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div
            key={letter}
            className="rounded-md bg-red-700 py-2 text-center font-bold text-white"
          >
            {letter}
          </div>
        ))}
      </div>,
    );

    // Create 5 rows
    for (let row = 0; row < 5; row++) {
      const rowCells = [];
      for (let col = 0; col < 5; col++) {
        const index = col * 5 + row;

        if (row === 2 && col === 2) {
          rowCells.push(
            <div
              key={`${row}-${col}`}
              className="relative flex h-14 items-center justify-center rounded-md border border-slate-300 bg-amber-100 dark:border-slate-700 dark:bg-amber-900/40"
            >
              <span className="text-sm font-bold">FREE</span>
            </div>,
          );
        } else {
          const num = cartelaData[index];
          const isCalled = calledNumbers.includes(num);

          rowCells.push(
            <div
              key={`${row}-${col}`}
              className={`relative flex h-14 items-center justify-center rounded-md border text-sm font-semibold ${isCalled ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"}`}
            >
              <span>{num}</span>
              {isCalled && (
                <div className="absolute right-1 top-1 text-xs">✓</div>
              )}
            </div>,
          );
        }
      }
      board.push(
        <div key={`row-${row}`} className="grid grid-cols-5 gap-2">
          {rowCells}
        </div>,
      );
    }

    return board;
  };

  const calledCount = getCalledCount();
  const isBingo = hasWinningPattern;

  // Auto-declare winner when BINGO is detected
  useEffect(() => {
    if (isBingo && selectedCartela && gameActive) {
      // Small delay to show the BINGO animation first
      const timer = setTimeout(() => {
        void (async () => {
          const confirmed = await popup.confirm({
            title: "🎉 BINGO!",
            description: `Cartela ${selectedCartela} has won! Declare as winner?`,
            confirmText: "Declare",
            cancelText: "Later",
          });
          if (confirmed) {
            onDeclareWinner?.(selectedCartela);
          }
        })();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isBingo, selectedCartela, gameActive, popup, onDeclareWinner]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-1300 bg-black/60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal Container */}
            <motion.div
              // className="mx-auto my-6 max-w-3xl"
              className="mx-auto my-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">Cartela Viewer</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 w-8 p-0"
                  >
                    <X size={20} />
                  </Button>
                </div>

                {/* Cartela Selector Dropdown */}
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium">
                    Select Cartela:
                  </label>
                  <div className="relative">
                    <button
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-300 px-3 text-sm dark:border-slate-700"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <span>{selectedCartela || "Choose a cartela"}</span>
                      <ChevronDown
                        size={18}
                        className={`${showDropdown ? "rotate-180" : ""} transition`}
                      />
                    </button>

                    {showDropdown && (
                      <motion.div
                        className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {selectableCartelaNumbers.length > 0 ? (
                          selectableCartelaNumbers.map((number) => (
                            <button
                              key={number}
                              className={`w-full rounded px-2 py-2 text-left text-sm ${selectedCartela === number ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                              onClick={() => handleSelectCartela(number)}
                            >
                              Cartela {number}
                            </button>
                          ))
                        ) : (
                          <div className="px-2 py-2 text-sm text-slate-500">
                            No active cartelas available
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Cartela display */}
                {selectedCartela && cartelaData.length > 0 && (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {/* Cartela Number Badge */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-red-700/10 px-3 py-1 text-red-700 dark:text-red-300">
                      <span className="text-xs uppercase tracking-wide">
                        Cartela
                      </span>
                      <span className="text-sm font-bold">
                        {selectedCartela}
                      </span>
                    </div>

                    {/* Bingo Board */}
                    <div className="space-y-2">{renderCartelaBoard()}</div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span className="mr-1 text-xs uppercase text-slate-500">
                          Called
                        </span>
                        <span className="font-semibold">{calledCount}/24</span>
                      </div>
                      <div className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700">
                        <span className="mr-1 text-xs uppercase text-slate-500">
                          Remaining
                        </span>
                        <span className="font-semibold">
                          {24 - calledCount}
                        </span>
                      </div>
                      {isBingo && (
                        <motion.div
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-sm font-bold text-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 10 }}
                        >
                          <Trophy size={20} />
                          BINGO!
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {gameActive && (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={handleDeclareWinner}
                        >
                          <Trophy size={18} />
                          Declare Winner
                        </Button>
                        <Button
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          variant="outline"
                          onClick={handleRemovePlayer}
                        >
                          <UserX size={18} />
                          Remove Player
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Empty state */}
                {!selectedCartela && (
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-500">
                    <ChevronDown size={48} />
                    <p>Select a cartela from the dropdown above</p>
                  </div>
                )}
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
