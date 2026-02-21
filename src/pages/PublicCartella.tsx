import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Globe, Moon, Sun, Languages, Search, Trophy } from "lucide-react";
import { gamesApi } from "../services/api";
import { PublicCartellaResponse } from "../services/types";
import { useTheme } from "../contexts/ThemeContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Skeleton } from "../components/ui/skeleton";

const labels = {
  en: {
    title: "Public Cartella Checker",
    subtitle:
      "Enter game ID and cartella number to view the board, called numbers, and mark your own card.",
    gameId: "Game ID",
    cartella: "Cartella Number",
    load: "Load Cartella",
    checking: "Checking...",
    called: "Called Numbers",
    marked: "Marked",
    resultWin: "BINGO Found!",
    resultNoWin: "No Bingo Yet",
    howTo: "Tap a called number in the card to mark/unmark it.",
    method: "Public View",
    light: "Light",
    dark: "Dark",
    english: "English",
    amharic: "አማርኛ",
    noCalled: "No numbers have been called yet.",
    boardTitle: "BINGO Cartella",
    invalidInput: "Please enter valid game and cartella values.",
    gameInactive: "This game is not active right now.",
    cartellaNotFound: "Game or cartella not found.",
    loadFailed: "Failed to load cartella.",
    rateLimited: "Too many requests. Please try again in {seconds}s.",
  },
  am: {
    title: "የህዝብ ካርቴላ መፈተሻ",
    subtitle: "የጨዋታ መለያ እና የካርቴላ ቁጥር በማስገባት ቦርዱን እና የተጠሩ ቁጥሮችን ይመልከቱ።",
    gameId: "የጨዋታ መለያ",
    cartella: "የካርቴላ ቁጥር",
    load: "ካርቴላ አሳይ",
    checking: "በመፈተሽ ላይ...",
    called: "የተጠሩ ቁጥሮች",
    marked: "የተምረጡ",
    resultWin: "ቢንጎ ተገኝቷል!",
    resultNoWin: "ገና ቢንጎ የለም",
    howTo: "በካርዱ ላይ የተጠራ ቁጥር ንኩ ለማስመር/ለማስወገድ።",
    method: "የህዝብ እይታ",
    light: "ብርሃን",
    dark: "ጨለማ",
    english: "English",
    amharic: "አማርኛ",
    noCalled: "ገና ምንም ቁጥር አልተጠራም።",
    boardTitle: "የBINGO ካርቴላ",
    invalidInput: "እባክዎ ትክክለኛ መረጃ ያስገቡ።",
    gameInactive: "ይህ ጨዋታ አሁን ንቁ አይደለም።",
    cartellaNotFound: "ጨዋታው ወይም ካርቴላው አልተገኘም።",
    loadFailed: "መረጃ ማምጣት አልተቻለም።",
    rateLimited: "ብዙ ጥያቄዎች ተልከዋል። ከ {seconds} ሰከንድ በኋላ ደግመው ይሞክሩ።",
  },
} as const;

const getLetter = (num: number) => {
  if (num >= 1 && num <= 15) return "B";
  if (num >= 16 && num <= 30) return "I";
  if (num >= 31 && num <= 45) return "N";
  if (num >= 46 && num <= 60) return "G";
  return "O";
};

const toGrid = (numbers: number[]) => {
  const grid: number[][] = [];
  for (let row = 0; row < 5; row++) {
    const start = row * 5;
    grid.push(numbers.slice(start, start + 5));
  }
  return grid;
};

export const PublicCartella: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const copy = labels[language];

  const [gameId, setGameId] = useState("");
  const [cartellaNumber, setCartellaNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<PublicCartellaResponse | null>(null);
  const [manualMarks, setManualMarks] = useState<Set<number>>(new Set());

  const calledSet = useMemo(() => new Set(data?.called_numbers || []), [data]);

  const grid = useMemo(() => toGrid(data?.cartella_numbers || []), [data]);

  const markedSet = useMemo(() => {
    const merged = new Set<number>([...manualMarks]);
    return merged;
  }, [manualMarks]);

  const hasBingo = useMemo(() => {
    if (grid.length !== 5) return false;

    const marked = (value: number) => value === 0 || markedSet.has(value);

    const rowWin = grid.some((row) => row.every(marked));
    const colWin = Array.from({ length: 5 }, (_, col) =>
      grid.every((row) => marked(row[col])),
    ).some(Boolean);
    const mainDiag = grid.every((row, idx) => marked(row[idx]));
    const antiDiag = grid.every((row, idx) => marked(row[4 - idx]));

    return rowWin || colWin || mainDiag || antiDiag;
  }, [grid, markedSet]);

  const resolvePublicError = (err: any) => {
    const status = err?.status ?? err?.response?.status;
    const data = err?.data || err?.response?.data || {};
    const detail = String(data?.detail || "").toLowerCase();
    const retryAfter = Number(data?.retry_after_seconds || 0);

    if (status === 429 || data?.error_code === "rate_limited") {
      const seconds =
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 60;
      return copy.rateLimited.replace("{seconds}", String(seconds));
    }

    if (status === 400 && detail.includes("not active")) {
      return copy.gameInactive;
    }

    if (status === 404 || detail.includes("not found")) {
      return copy.cartellaNotFound;
    }

    return copy.loadFailed;
  };

  const handleLoad = async () => {
    setError("");
    setData(null);
    setManualMarks(new Set());

    const parsedCartella = Number.parseInt(cartellaNumber, 10);
    if (
      !gameId.trim() ||
      !Number.isFinite(parsedCartella) ||
      parsedCartella <= 0
    ) {
      setError(copy.invalidInput);
      return;
    }

    setLoading(true);
    try {
      const response = await gamesApi.getPublicCartella(
        gameId.trim(),
        parsedCartella,
      );
      setData(response);
    } catch (err: any) {
      setError(resolvePublicError(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleMark = (value: number) => {
    if (!calledSet.has(value) && value !== 0) return;
    setManualMarks((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {copy.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {copy.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {theme === "dark" ? copy.light : copy.dark}
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm ${language === "en" ? "border-red-400 text-red-700" : "border-slate-200 dark:border-slate-700"}`}
            >
              <Languages className="h-4 w-4" />
              {copy.english}
            </button>
            <button
              type="button"
              onClick={() => setLanguage("am")}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm ${language === "am" ? "border-red-400 text-red-700" : "border-slate-200 dark:border-slate-700"}`}
            >
              <Globe className="h-4 w-4" />
              {copy.amharic}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder={copy.gameId}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 dark:border-slate-700 dark:bg-slate-950"
            />
            <input
              value={cartellaNumber}
              onChange={(e) => setCartellaNumber(e.target.value)}
              placeholder={copy.cartella}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              type="button"
              onClick={handleLoad}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 font-semibold text-white hover:bg-red-800 disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {loading ? copy.checking : copy.load}
            </button>
          </div>

          {error && (
            <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
          )}
        </div>

        {loading && (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <Skeleton className="mb-3 h-6 w-56" />
              <div className="mb-3 grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={`head-${idx}`} className="h-10 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }).map((_, idx) => (
                  <Skeleton key={`cell-${idx}`} className="h-14 w-full" />
                ))}
              </div>
              <Skeleton className="mt-4 h-5 w-72" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <Skeleton className="mb-3 h-6 w-40" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 14 }).map((_, idx) => (
                  <Skeleton
                    key={`chip-${idx}`}
                    className="h-7 w-16 rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && data && (
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {copy.boardTitle} #{data.cartella_number}
                </h2>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800">
                  {copy.marked}: {markedSet.size}
                </span>
              </div>

              <div className="mb-3 grid grid-cols-5 gap-2">
                {["B", "I", "N", "G", "O"].map((letter) => (
                  <div
                    key={letter}
                    className="rounded-lg bg-red-700 py-2 text-center text-lg font-black text-white"
                  >
                    {letter}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-2">
                {grid.flat().map((value, idx) => {
                  const isFree = value === 0;
                  const isMarked = isFree || markedSet.has(value);
                  const isCallable = calledSet.has(value);
                  return (
                    <button
                      key={`${value}-${idx}`}
                      type="button"
                      onClick={() => toggleMark(value)}
                      className={`h-14 rounded-xl border-2 text-base font-bold transition ${
                        isMarked
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isCallable
                            ? "border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300"
                            : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      }`}
                      title={
                        isCallable || isFree ? "Tap to mark" : "Not called yet"
                      }
                    >
                      {isFree ? "FREE" : `${getLetter(value)}${value}`}
                    </button>
                  );
                })}
              </div>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {copy.howTo}
              </p>

              <div
                className={`mt-4 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black ${
                  hasBingo
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                }`}
              >
                <Trophy className="h-4 w-4" />
                {hasBingo ? copy.resultWin : copy.resultNoWin}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
            >
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {copy.called}
              </h3>
              <div className="mt-3 flex max-h-125 flex-wrap gap-2 overflow-auto">
                {data.called_numbers.length === 0 ? (
                  <p className="text-sm text-slate-500">{copy.noCalled}</p>
                ) : (
                  data.called_numbers.map((num) => (
                    <span
                      key={num}
                      className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    >
                      {getLetter(num)}
                      {num}
                    </span>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};
