import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { DollarSign, TrendingUp, Gamepad2, Calendar } from "lucide-react";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useLanguage } from "../contexts/LanguageContext";
import { gamesApi } from "../services/api";
import { GameAuditReportResponse } from "../services/types";

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

export const Dashboard: React.FC<DashboardProps> = ({
  gameConfig,
  isGameActive = false,
}) => {
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
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

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

  const filteredGameHistory = useMemo(
    () => reportData.game_history,
    [reportData.game_history],
  );
  const filteredWinHistory = useMemo(
    () => reportData.win_history,
    [reportData.win_history],
  );
  const filteredBanned = useMemo(
    () => reportData.banned_cartellas,
    [reportData.banned_cartellas],
  );
  const filteredTransactions = useMemo(
    () => reportData.transactions,
    [reportData.transactions],
  );

  const gamesToday = filteredGameHistory.length;
  const earningToday = filteredGameHistory.reduce(
    (sum, game) => sum + Number.parseFloat(game.shop_cut || "0"),
    0,
  );
  const latestBalance =
    filteredTransactions.length > 0
      ? filteredTransactions[0].balance_after
      : gameConfig?.winBirr || "0";
  const depositCountToday = filteredTransactions.filter(
    (tx) => tx.type === "deposit",
  ).length;

  const stats = [
    {
      label: t("dashboard.deposit"),
      value: depositCountToday.toString(),
      icon: DollarSign,
      iconClass: "text-sky-500",
      bgClass: "bg-sky-500/15",
    },
    {
      label: t("dashboard.gamesToday"),
      value: gamesToday.toString(),
      icon: Gamepad2,
      iconClass: "text-violet-500",
      bgClass: "bg-violet-500/15",
    },
    {
      label: t("dashboard.earningToday"),
      value: `${earningToday.toFixed(2)} ETB`,
      icon: TrendingUp,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-500/15",
    },
    {
      label: t("dashboard.availableBalance"),
      value: `${Number.parseFloat(latestBalance || "0").toFixed(2)} ETB`,
      icon: DollarSign,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-500/15",
    },
  ];

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
              <div className="p-4 text-sm text-slate-500">
                Loading reports...
              </div>
            ) : loadError ? (
              <div className="p-4 text-sm text-red-600">{loadError}</div>
            ) : activeTab === "games" ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/60">
                    <th className="px-3 py-2">Game</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Players</th>
                    <th className="px-3 py-2">Pool</th>
                    <th className="px-3 py-2">Winner</th>
                    <th className="px-3 py-2">Shop Cut</th>
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
                        {game.game_id}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(game.date).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{game.players}</td>
                      <td className="px-3 py-2">{game.total_pool}</td>
                      <td className="px-3 py-2">
                        {game.winner.length ? game.winner.join(", ") : "-"}
                      </td>
                      <td className="px-3 py-2">{game.shop_cut}</td>
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
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Winners</th>
                    <th className="px-3 py-2">Pattern</th>
                    <th className="px-3 py-2">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWinHistory.map((win) => (
                    <tr
                      key={`${win.game_id}-${win.date}`}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-3 py-2 font-semibold">{win.game_id}</td>
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
                      <td className="px-3 py-2">{win.payout_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : activeTab === "banned" ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-700 dark:bg-slate-800/60">
                    <th className="px-3 py-2">Game</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Cartella</th>
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
                        {item.game_id}
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
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Game</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Before</th>
                    <th className="px-3 py-2">After</th>
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
                      <td className="px-3 py-2">{tx.game_id || "-"}</td>
                      <td className="px-3 py-2">{tx.type}</td>
                      <td className="px-3 py-2">{tx.amount}</td>
                      <td className="px-3 py-2">{tx.balance_before}</td>
                      <td className="px-3 py-2">{tx.balance_after}</td>
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
