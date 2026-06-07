import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Trophy, Medal, Crown, TrendingUp, Swords, Crosshair } from "lucide-react";

const CATEGORIES = [
  { id: "highest_score", name: "Highest Score", icon: Trophy },
  { id: "highest_elo", name: "Highest ELO", icon: TrendingUp },
  { id: "most_wins", name: "Most Wins", icon: Swords },
  { id: "best_accuracy", name: "Best Accuracy", icon: Crosshair },
];

const TIMEFRAMES = [
  { id: "all_time", name: "All Time" },
  { id: "weekly", name: "Weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "daily", name: "Daily" },
];

const RANK_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#3EB489",
  diamond: "#3B82F6",
  master: "#A855F7",
  grandmaster: "#EF4444",
};

export default function Leaderboard() {
  const [category, setCategory] = useState("highest_score");
  const [timeframe, setTimeframe] = useState("all_time");

  const { data: leaderboard, isLoading } = trpc.leaderboard.global.useQuery({
    category: category as any,
    timeframe: timeframe as any,
    limit: 50,
  });

  const { data: topElo } = trpc.leaderboard.topByElo.useQuery({ limit: 10 });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Trophy className="w-12 h-12 text-[#E6C200] mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="text-gray-400 mt-2">See how you rank against players worldwide</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              category === cat.id
                ? "bg-[#E6C200] text-[#1A1D24]"
                : "bg-[#252830] text-gray-400 hover:text-white border border-gray-700/50"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>

      {/* Timeframe Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.id}
            onClick={() => setTimeframe(tf.id)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
              timeframe === tf.id
                ? "bg-white/10 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tf.name}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {topElo && topElo.length >= 3 && (
        <div className="flex justify-center items-end gap-4 mb-10">
          {/* 2nd */}
          <div className="text-center pb-4">
            <div className="w-16 h-16 bg-[#C0C0C0] rounded-full flex items-center justify-center mx-auto mb-2 text-[#1A1D24] font-bold text-lg">
              {topElo[1]?.name?.[0]?.toUpperCase() || "2"}
            </div>
            <div className="text-sm font-medium">{topElo[1]?.name || "-"}</div>
            <div className="text-xs text-gray-400">{topElo[1]?.eloRating || 0} ELO</div>
            <div className="text-2xl font-bold text-[#C0C0C0] mt-1">#2</div>
          </div>
          {/* 1st */}
          <div className="text-center pb-0">
            <Crown className="w-6 h-6 text-[#FFD700] mx-auto mb-1" />
            <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-2 text-[#1A1D24] font-bold text-xl">
              {topElo[0]?.name?.[0]?.toUpperCase() || "1"}
            </div>
            <div className="text-base font-bold">{topElo[0]?.name || "-"}</div>
            <div className="text-sm text-[#E6C200]">{topElo[0]?.eloRating || 0} ELO</div>
            <div className="text-3xl font-bold text-[#FFD700] mt-1">#1</div>
          </div>
          {/* 3rd */}
          <div className="text-center pb-4">
            <div className="w-16 h-16 bg-[#CD7F32] rounded-full flex items-center justify-center mx-auto mb-2 text-[#1A1D24] font-bold text-lg">
              {topElo[2]?.name?.[0]?.toUpperCase() || "3"}
            </div>
            <div className="text-sm font-medium">{topElo[2]?.name || "-"}</div>
            <div className="text-xs text-gray-400">{topElo[2]?.eloRating || 0} ELO</div>
            <div className="text-2xl font-bold text-[#CD7F32] mt-1">#3</div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-[#252830] rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50 text-left text-sm text-gray-400">
                <th className="px-4 py-3 w-16">#</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : leaderboard && leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className="border-b border-gray-700/30 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {index < 3 ? (
                        <Medal
                          className="w-5 h-5"
                          style={{
                            color: index === 0 ? "#FFD700" : index === 1 ? "#C0C0C0" : "#CD7F32",
                          }}
                        />
                      ) : (
                        <span className="text-gray-500 text-sm">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#1A1D24]"
                          style={{
                            backgroundColor: RANK_COLORS[entry.userRank || "bronze"] || "#CD7F32",
                          }}
                        >
                          {(entry.userName || entry.userUsername || "P")[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">
                          {entry.userName || entry.userUsername || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor: `${RANK_COLORS[entry.userRank || "bronze"]}20`,
                          color: RANK_COLORS[entry.userRank || "bronze"],
                        }}
                      >
                        {entry.userRank || "bronze"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#E6C200]">
                      {entry.score?.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No entries yet. Be the first!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
