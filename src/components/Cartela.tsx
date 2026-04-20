import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Trophy, X, UserX, ChevronDown } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import {
  getOfflineCartellaBoard,
  normalizeCartellaBoard,
} from "../data/offlineCartellas";

interface CartelaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartelaNumber?: string;
  playMode?: "online" | "offline";
  calledNumbers: number[];
  cartelaNumbers: string[];
  cartelaDataMap?: Record<string, number[]>;
  cartellaNumberMap?: Record<string, number>;
  cartellaStatuses?: Record<string, "active" | "banned" | "winner">;
  onDeclareWinner?: (
    cartelaNumber: string,
    pattern: "row" | "column" | "diagonal",
  ) => void;
  onRemovePlayer?: (cartelaNumber: string) => void;
  gameActive?: boolean;
}

export const CartelaModal: React.FC<CartelaModalProps> = ({
  isOpen,
  onClose,
  cartelaNumber,
  playMode = "online",
  calledNumbers,
  cartelaNumbers,
  cartelaDataMap,
  cartellaNumberMap,
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
  const [selectedWinningPattern, setSelectedWinningPattern] = useState<
    "row" | "column" | "diagonal"
  >("row");

  const normalizeCartelaNumber = useCallback((value: string | number) => {
    const digits = String(value).replace(/\D/g, "");
    if (!digits) {
      return null;
    }
    const parsed = Number.parseInt(digits, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, []);

  const getCartellaStatusByNumber = useCallback(
    (number: string): "active" | "banned" | "winner" => {
      const normalized = normalizeCartelaNumber(number);
      if (normalized === null) {
        return "active";
      }

      if (cartellaNumberMap && typeof cartellaNumberMap === "object") {
        for (const [mappedCartelaNumber, mappedIndex] of Object.entries(
          cartellaNumberMap,
        )) {
          if (normalizeCartelaNumber(mappedCartelaNumber) === normalized) {
            const parsedMappedIndex = Number(mappedIndex);
            if (Number.isInteger(parsedMappedIndex) && parsedMappedIndex >= 0) {
              return cartellaStatuses?.[String(parsedMappedIndex)] || "active";
            }
            break;
          }
        }
      }

      for (const [index, value] of Object.entries(cartellaStatuses || {})) {
        const cartelaLabel = cartelaNumbers[Number(index)];
        const cartelaNum = normalizeCartelaNumber(String(cartelaLabel ?? ""));
        if (cartelaNum !== null && cartelaNum === normalized) {
          return value;
        }
      }

      return "active";
    },
    [
      cartellaNumberMap,
      cartellaStatuses,
      cartelaNumbers,
      normalizeCartelaNumber,
    ],
  );

  const selectableCartelaNumbers = useMemo(
    () =>
      cartelaNumbers.filter(
        (number) => getCartellaStatusByNumber(number) !== "banned",
      ),
    [cartelaNumbers, getCartellaStatusByNumber],
  );

  const getProvidedCartelaBoard = useCallback(
    (number: string) => {
      if (!cartelaDataMap || typeof cartelaDataMap !== "object") {
        return undefined;
      }

      const directBoard = cartelaDataMap[number];
      if (Array.isArray(directBoard)) {
        return directBoard;
      }

      const normalized = normalizeCartelaNumber(number);
      if (normalized === null) {
        return undefined;
      }

      for (const [mappedNumber, board] of Object.entries(cartelaDataMap)) {
        if (
          normalizeCartelaNumber(mappedNumber) === normalized &&
          Array.isArray(board)
        ) {
          return board;
        }
      }

      return undefined;
    },
    [cartelaDataMap, normalizeCartelaNumber],
  );

  // Generate or retrieve cartela data when cartela changes
  useEffect(() => {
    if (!selectedCartela) {
      return;
    }

    const providedNumbers = getProvidedCartelaBoard(selectedCartela);
    const normalizedProvided = normalizeCartellaBoard(providedNumbers);
    if (normalizedProvided) {
      setCartelaData(normalizedProvided);
      return;
    }

    if (playMode === "offline") {
      const offlineBoard = getOfflineCartellaBoard(selectedCartela);
      setCartelaData(offlineBoard ? [...offlineBoard] : []);
      return;
    }

    // Avoid synthetic online cartelas; only trust backend-provided board data.
    setCartelaData([]);
  }, [selectedCartela, getProvidedCartelaBoard, playMode]);

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

  const hasRowPattern = useMemo(() => {
    if (cartelaData.length !== 25) {
      return false;
    }

    const grid = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => cartelaData[row * 5 + col]),
    );

    return grid.some((row) => row.every(isMarked));
  }, [cartelaData, isMarked]);

  const hasDiagonalPattern = useMemo(() => {
    if (cartelaData.length !== 25) {
      return false;
    }

    const grid = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => cartelaData[row * 5 + col]),
    );

    const hasMainDiagonal = [0, 1, 2, 3, 4].every((idx) =>
      isMarked(grid[idx][idx]),
    );
    const hasAntiDiagonal = [0, 1, 2, 3, 4].every((idx) =>
      isMarked(grid[idx][4 - idx]),
    );

    return hasMainDiagonal || hasAntiDiagonal;
  }, [cartelaData, isMarked]);

  const hasColumnPattern = useMemo(() => {
    if (cartelaData.length !== 25) {
      return false;
    }

    const grid = Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) => cartelaData[row * 5 + col]),
    );

    return Array.from({ length: 5 }, (_, col) => col).some((col) =>
      grid.every((row) => isMarked(row[col])),
    );
  }, [cartelaData, isMarked]);

  const hasWinningPattern =
    hasRowPattern || hasColumnPattern || hasDiagonalPattern;

  const selectedPatternMatched =
    selectedWinningPattern === "row"
      ? hasRowPattern
      : selectedWinningPattern === "column"
        ? hasColumnPattern
        : hasDiagonalPattern;

  useEffect(() => {
    const availablePatterns: Array<"row" | "column" | "diagonal"> = [];
    if (hasRowPattern) {
      availablePatterns.push("row");
    }
    if (hasColumnPattern) {
      availablePatterns.push("column");
    }
    if (hasDiagonalPattern) {
      availablePatterns.push("diagonal");
    }

    if (availablePatterns.length === 0) {
      setSelectedWinningPattern("row");
      return;
    }

    if (!availablePatterns.includes(selectedWinningPattern)) {
      setSelectedWinningPattern(availablePatterns[0]);
    }
  }, [
    hasRowPattern,
    hasColumnPattern,
    hasDiagonalPattern,
    selectedWinningPattern,
  ]);

  const handleDeclareWinner = async () => {
    if (cartelaData.length !== 25) {
      popup.warning(
        `Cartela ${selectedCartela} data is not loaded yet. Please reopen this cartela and try again.`,
      );
      return;
    }

    if (!hasWinningPattern) {
      popup.warning(
        `Cartela ${selectedCartela} does not have a complete row, column, or diagonal yet.`,
      );
      return;
    }

    if (!selectedPatternMatched) {
      popup.warning(
        `Cartela ${selectedCartela} does not have a complete ${selectedWinningPattern} yet.`,
      );
      return;
    }

    const confirmed = await popup.confirm({
      title: `Declare Winner`,
      description: `Declare cartela ${selectedCartela} as winner with ${selectedWinningPattern} pattern?`,
      confirmText: "Declare",
      cancelText: "Cancel",
    });
    if (confirmed) {
      onDeclareWinner?.(selectedCartela, selectedWinningPattern);
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
        const index = row * 5 + col;

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
                      <div className="space-y-3">
                        {hasWinningPattern && (
                          <>
                            <div className="rounded-md border border-slate-200 px-3 py-2 dark:border-slate-700">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Winning Type
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={
                                    selectedWinningPattern === "row"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    setSelectedWinningPattern("row")
                                  }
                                  disabled={!hasRowPattern}
                                >
                                  Row Winning
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={
                                    selectedWinningPattern === "column"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    setSelectedWinningPattern("column")
                                  }
                                  disabled={!hasColumnPattern}
                                >
                                  Column Winning
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={
                                    selectedWinningPattern === "diagonal"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() =>
                                    setSelectedWinningPattern("diagonal")
                                  }
                                  disabled={!hasDiagonalPattern}
                                >
                                  Diagonal Winning
                                </Button>
                              </div>
                            </div>

                            <Button
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                              onClick={handleDeclareWinner}
                              disabled={!selectedPatternMatched}
                            >
                              <Trophy size={18} />
                              Declare Winner
                            </Button>
                          </>
                        )}

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
