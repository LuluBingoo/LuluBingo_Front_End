import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  Gamepad2,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { useLanguage } from "../contexts/LanguageContext";
import { usePopup } from "../contexts/PopupContext";
import { gamesApi, shopApi } from "../services/api";
import { GameAuditReportResponse } from "../services/types";
import { formatCurrency } from "../services/settings";

interface DashboardProps {
  gameConfig?: {
    game: string;
    betBirr: string;
    numPlayers: string;
    winBirr: string;
    selectedPatterns: number[];
    cartelaNumbers?: string[];
  } | null;
  isGameActive?: boolean;
}

type SortDirection = "asc" | "desc";

type SortConfig = {
  key: string;
  direction: SortDirection;
};

export const Dashboard: React.FC<DashboardProps> = ({
  gameConfig,
  isGameActive = false,
}) => {
  const navigate = useNavigate();
  const popup = usePopup();
  const { t } = useLanguage();
  const today = new Date().toISOString().split("T")[0];
  const [activeTab, setActiveTab] = useState<
    "games" | "wins" | "banned" | "transactions"
  >("games");
  const [dateFilterMode, setDateFilterMode] = useState<
    "all" | "day" | "range" | "last7" | "last30"
  >("all");
  const [dayFilter, setDayFilter] = useState(today);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState("");
  const [reportData, setReportData] = useState<GameAuditReportResponse>({
    game_history: [],
    win_history: [],
    banned_cartellas: [],
    transactions: [],
  });
  const [walletBalance, setWalletBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sortByTab, setSortByTab] = useState<Record<string, SortConfig>>({
    games: { key: "date", direction: "desc" },
    wins: { key: "date", direction: "desc" },
    banned: { key: "date", direction: "desc" },
    transactions: { key: "created_at", direction: "desc" },
  });

  useEffect(() => {
    const reportDateFilters = (() => {
      if (dateFilterMode === "day") {
        return dayFilter ? { start_date: dayFilter, end_date: dayFilter } : {};
      }
      if (dateFilterMode === "range") {
        return {
          start_date: rangeStart || undefined,
          end_date: rangeEnd || undefined,
        };
      }
      if (dateFilterMode === "last7") {
        return { days: 7 };
      }
      if (dateFilterMode === "last30") {
        return { days: 30 };
      }
      return {};
    })();

    const loadReports = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const data = await gamesApi.getGameAuditReports({
          search,
          status: statusFilter,
          tx_type: txTypeFilter,
          ...reportDateFilters,
        });
        setReportData(data);
      } catch (error) {
        console.error("Failed to load game reports", error);
        setLoadError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [
    search,
    statusFilter,
    txTypeFilter,
    dateFilterMode,
    dayFilter,
    rangeStart,
    rangeEnd,
  ]);

  useEffect(() => {
    const loadProfileBalance = async () => {
      try {
        const profile = await shopApi.getProfile();
        setWalletBalance(String(profile.wallet_balance ?? "0"));
      } catch (error) {
        console.error("Failed to load wallet balance", error);
      }
    };

    loadProfileBalance();
  }, []);

  const filteredGameHistory = useMemo(() => {
    const config = sortByTab.games;
    const items = [...reportData.game_history];
    items.sort((a, b) => {
      const direction = config.direction === "asc" ? 1 : -1;
      if (config.key === "players") {
        return (a.players - b.players) * direction;
      }
      if (config.key === "total_pool") {
        return (
          (Number.parseFloat(a.total_pool || "0") -
            Number.parseFloat(b.total_pool || "0")) *
          direction
        );
      }
      if (config.key === "shop_cut") {
        return (
          (Number.parseFloat(a.shop_cut || "0") -
            Number.parseFloat(b.shop_cut || "0")) *
          direction
        );
      }
      if (config.key === "shop_net_cut") {
        return (
          (Number.parseFloat(a.shop_net_cut || a.shop_cut || "0") -
            Number.parseFloat(b.shop_net_cut || b.shop_cut || "0")) *
          direction
        );
      }
      if (config.key === "date") {
        return (
          (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction
        );
      }
      return (
        String((a as any)[config.key] || "").localeCompare(
          String((b as any)[config.key] || ""),
        ) * direction
      );
    });
    return items;
  }, [reportData.game_history, sortByTab.games]);

  const filteredWinHistory = useMemo(() => {
    const config = sortByTab.wins;
    const items = [...reportData.win_history];
    items.sort((a, b) => {
      const direction = config.direction === "asc" ? 1 : -1;
      if (config.key === "payout_amount") {
        return (
          (Number.parseFloat(a.payout_amount || "0") -
            Number.parseFloat(b.payout_amount || "0")) *
          direction
        );
      }
      if (config.key === "date") {
        return (
          (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction
        );
      }
      return (
        String((a as any)[config.key] || "").localeCompare(
          String((b as any)[config.key] || ""),
        ) * direction
      );
    });
    return items;
  }, [reportData.win_history, sortByTab.wins]);

  const filteredBanned = useMemo(() => {
    const config = sortByTab.banned;
    const items = [...reportData.banned_cartellas];
    items.sort((a, b) => {
      const direction = config.direction === "asc" ? 1 : -1;
      if (config.key === "cartella_index") {
        return (a.cartella_index - b.cartella_index) * direction;
      }
      if (config.key === "date") {
        return (
          (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction
        );
      }
      return (
        String((a as any)[config.key] || "").localeCompare(
          String((b as any)[config.key] || ""),
        ) * direction
      );
    });
    return items;
  }, [reportData.banned_cartellas, sortByTab.banned]);

  const filteredTransactions = useMemo(() => {
    const config = sortByTab.transactions;
    const items = [...reportData.transactions];
    items.sort((a, b) => {
      const direction = config.direction === "asc" ? 1 : -1;
      if (["amount", "balance_before", "balance_after"].includes(config.key)) {
        return (
          (Number.parseFloat((a as any)[config.key] || "0") -
            Number.parseFloat((b as any)[config.key] || "0")) *
          direction
        );
      }
      if (config.key === "created_at") {
        return (
          (new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()) *
          direction
        );
      }
      return (
        String((a as any)[config.key] || "").localeCompare(
          String((b as any)[config.key] || ""),
        ) * direction
      );
    });
    return items;
  }, [reportData.transactions, sortByTab.transactions]);

  const gameCount = filteredGameHistory.length;
  const grossShopCut = filteredGameHistory.reduce(
    (sum, game) => sum + Number.parseFloat(game.shop_cut || "0"),
    0,
  );
  const luluDeducted = filteredGameHistory.reduce(
    (sum, game) => sum + Number.parseFloat(game.lulu_cut || "0"),
    0,
  );
  const moneyMade = filteredGameHistory.reduce(
    (sum, game) =>
      sum + Number.parseFloat(game.shop_net_cut || game.shop_cut || "0"),
    0,
  );
  const latestBalance = walletBalance || gameConfig?.winBirr || "0";

  const stats = [
    {
      label: "Money Made",
      value: formatCurrency(moneyMade),
      icon: TrendingUp,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-500/15",
    },
    {
      label: "Lulu Deducted",
      value: formatCurrency(luluDeducted),
      icon: ArrowDown,
      iconClass: "text-rose-500",
      bgClass: "bg-rose-500/15",
    },
    {
      label: "Games",
      value: gameCount.toString(),
      icon: Gamepad2,
      iconClass: "text-violet-500",
      bgClass: "bg-violet-500/15",
    },
    {
      label: "Lulu Reserve Balance",
      value: formatCurrency(latestBalance || "0"),
      icon: DollarSign,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-500/15",
    },
  ];

  const isInitialLoading =
    loading &&
    !loadError &&
    reportData.game_history.length === 0 &&
    reportData.win_history.length === 0 &&
    reportData.banned_cartellas.length === 0 &&
    reportData.transactions.length === 0;

  const openGameWithConfirm = async (gameId?: string | null) => {
    if (!gameId) return;
    const confirmed = await popup.confirm({
      title: "Open game",
      description: `You are about to open game ${gameId} in Playground. Continue?`,
      confirmText: "Open",
      cancelText: "Cancel",
    });

    if (confirmed) {
      navigate(`/playground?game=${encodeURIComponent(gameId)}`);
    }
  };

  const toggleSort = (tab: keyof typeof sortByTab, key: string) => {
    setSortByTab((prev) => {
      const current = prev[tab];
      if (current.key === key) {
        return {
          ...prev,
          [tab]: {
            key,
            direction: current.direction === "asc" ? "desc" : "asc",
          },
        };
      }
      return {
        ...prev,
        [tab]: { key, direction: "asc" },
      };
    });
  };

  const getSortIcon = (tab: keyof typeof sortByTab, key: string) => {
    const current = sortByTab[tab];
    if (current.key !== key) {
      return <ArrowUpDown className="h-3.5 w-3.5" />;
    }
    return current.direction === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  if (isInitialLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-9 w-64 rounded-lg" />
            <Skeleton className="h-9 w-34 rounded-lg" />
            <Skeleton className="h-9 w-42 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-72 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="space-y-3 p-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-30" />
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <Skeleton className="h-9 w-30 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-30 rounded-lg" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        className="flex flex-wrap items-center justify-between gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search game, winner, or reference"
            className="h-9 w-64 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 dark:border-slate-700 dark:bg-slate-900"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 dark:border-slate-700 dark:bg-slate-900"
            title="Filter game status"
            aria-label="Filter game status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={txTypeFilter}
            onChange={(e) => setTxTypeFilter(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-red-300 dark:border-slate-700 dark:bg-slate-900"
            title="Filter transaction type"
            aria-label="Filter transaction type"
          >
            <option value="">All transaction types</option>
            <option value="deposit">Deposit</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="bet_debit">Bet Debit</option>
            <option value="bet_credit">Bet Credit</option>
            <option value="lulu_cut_debit">Lulu Cut Debit</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
          <Calendar className="h-4 w-4 text-red-700" />
          <select
            value={dateFilterMode}
            onChange={(e) => setDateFilterMode(e.target.value as any)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
            title="Filter period"
            aria-label="Filter period"
          >
            <option value="all">All time</option>
            <option value="day">Specific day</option>
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="range">Date range</option>
          </select>

          {dateFilterMode === "day" && (
            <input
              type="date"
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              title="Select day"
              aria-label="Select day"
            />
          )}

          {dateFilterMode === "range" && (
            <>
              <input
                type="date"
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                title="Range start"
                aria-label="Range start"
              />
              <span className="text-xs text-slate-500">to</span>
              <input
                type="date"
                className="h-8 rounded-md border border-slate-200 bg-white px-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-900"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                title="Range end"
                aria-label="Range end"
              />
            </>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="flex items-center gap-3 p-4">
                <div className={`rounded-xl p-2 ${stat.bgClass}`}>
                  <Icon className={`h-5 w-5 ${stat.iconClass}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-300">
                    {stat.label}
                  </p>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </h3>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <ButtonTab
            isActive={activeTab === "games"}
            onClick={() => setActiveTab("games")}
            label="Game History"
          />
          <ButtonTab
            isActive={activeTab === "wins"}
            onClick={() => setActiveTab("wins")}
            label="Win History"
          />
          <ButtonTab
            isActive={activeTab === "banned"}
            onClick={() => setActiveTab("banned")}
            label="Banned Cartellas"
          />
          <ButtonTab
            isActive={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
            label="Transactions"
          />
          {isGameActive && (
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300">
              Live game in progress
            </Badge>
          )}
        </div>
        <Card className="p-0">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ) : loadError ? (
              <div className="p-4 text-sm text-red-600">{loadError}</div>
            ) : activeTab === "games" ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/60">
                    <th className="px-3 py-2">Game</th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("games", "date")}
                      >
                        Date {getSortIcon("games", "date")}
                      </button>
                    </th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("games", "players")}
                      >
                        Players {getSortIcon("games", "players")}
                      </button>
                    </th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("games", "total_pool")}
                      >
                        Pool {getSortIcon("games", "total_pool")}
                      </button>
                    </th>
                    <th className="px-3 py-2">Winner</th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("games", "shop_net_cut")}
                      >
                        Money Made {getSortIcon("games", "shop_net_cut")}
                      </button>
                    </th>
                    <th className="px-3 py-2">Lulu Cut</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGameHistory.map((game) => (
                    <tr
                      key={game.game_id}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2 font-semibold">
                        <button
                          type="button"
                          onClick={() => void openGameWithConfirm(game.game_id)}
                          className="cursor-pointer text-red-700 underline-offset-2 hover:underline dark:text-red-300"
                        >
                          {game.game_id}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        {new Date(game.date).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{game.players}</td>
                      <td className="px-3 py-2">
                        {formatCurrency(game.total_pool || "0")}
                      </td>
                      <td className="px-3 py-2">
                        {game.winner.length ? game.winner.join(", ") : "-"}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(
                          game.shop_net_cut || game.shop_cut || "0",
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(game.lulu_cut || "0")}
                      </td>
                      <td className="px-3 py-2">
                        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200">
                          {game.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === "wins" ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/60">
                    <th className="px-3 py-2">Game</th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("wins", "date")}
                      >
                        Date {getSortIcon("wins", "date")}
                      </button>
                    </th>
                    <th className="px-3 py-2">Winners</th>
                    <th className="px-3 py-2">Pattern</th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("wins", "payout_amount")}
                      >
                        Payout {getSortIcon("wins", "payout_amount")}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWinHistory.map((win) => (
                    <tr
                      key={`${win.game_id}-${win.date}`}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2 font-semibold">
                        <button
                          type="button"
                          onClick={() => void openGameWithConfirm(win.game_id)}
                          className="cursor-pointer text-red-700 underline-offset-2 hover:underline dark:text-red-300"
                        >
                          {win.game_id}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        {new Date(win.date).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        {win.winner_indexes
                          .map((idx) => `Cartella ${idx}`)
                          .join(", ")}
                      </td>
                      <td className="px-3 py-2">
                        {win.winning_pattern || "-"}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(win.payout_amount || "0")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === "banned" ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/60">
                    <th className="px-3 py-2">Game</th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("banned", "date")}
                      >
                        Date {getSortIcon("banned", "date")}
                      </button>
                    </th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("banned", "cartella_index")}
                      >
                        Cartella {getSortIcon("banned", "cartella_index")}
                      </button>
                    </th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanned.map((item) => (
                    <tr
                      key={`${item.game_id}-${item.cartella_index}-${item.date}`}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2 font-semibold">
                        <button
                          type="button"
                          onClick={() => void openGameWithConfirm(item.game_id)}
                          className="cursor-pointer text-red-700 underline-offset-2 hover:underline dark:text-red-300"
                        >
                          {item.game_id}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        {new Date(item.date).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        Cartella {item.cartella_index}
                      </td>
                      <td className="px-3 py-2">
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300">
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/60">
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("transactions", "created_at")}
                      >
                        Time {getSortIcon("transactions", "created_at")}
                      </button>
                    </th>
                    <th className="px-3 py-2">Game</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() => toggleSort("transactions", "amount")}
                      >
                        Amount {getSortIcon("transactions", "amount")}
                      </button>
                    </th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() =>
                          toggleSort("transactions", "balance_before")
                        }
                      >
                        Before {getSortIcon("transactions", "balance_before")}
                      </button>
                    </th>
                    <th className="px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 whitespace-nowrap"
                        onClick={() =>
                          toggleSort("transactions", "balance_after")
                        }
                      >
                        After {getSortIcon("transactions", "balance_after")}
                      </button>
                    </th>
                    <th className="px-3 py-2">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        {tx.game_id ? (
                          <button
                            type="button"
                            onClick={() => void openGameWithConfirm(tx.game_id)}
                            className="cursor-pointer text-red-700 underline-offset-2 hover:underline dark:text-red-300"
                          >
                            {tx.game_id}
                          </button>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2">{tx.type}</td>
                      <td className="px-3 py-2">{formatCurrency(tx.amount)}</td>
                      <td className="px-3 py-2">
                        {formatCurrency(tx.balance_before)}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(tx.balance_after)}
                      </td>
                      <td className="px-3 py-2">{tx.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

const ButtonTab: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-red-700 text-white"
        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    }`}
  >
    {label}
  </button>
);
