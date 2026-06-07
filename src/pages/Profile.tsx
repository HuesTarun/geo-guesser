import { useParams, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  MapPin, Trophy, Target, TrendingUp, Calendar, Gamepad2,
  Swords, Medal, ArrowLeft,
} from "lucide-react";

const RANK_COLORS: Record<string, string> = {
  bronze: "#CD7F32",
  silver: "#C0C0C0",
  gold: "#FFD700",
  platinum: "#3EB489",
  diamond: "#3B82F6",
  master: "#A855F7",
  grandmaster: "#EF4444",
};

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const userId = id ? Number(id) : currentUser?.id;
  const isOwnProfile = !id || Number(id) === currentUser?.id;

  const { data: profile, isLoading: profileLoading } = trpc.user.getById.useQuery(
    { id: userId! },
    { enabled: !!userId }
  );

  const { data: stats, isLoading: statsLoading } = trpc.user.getStats.useQuery(
    { userId: userId! },
    { enabled: !!userId }
  );

  const { data: history } = trpc.game.getHistory.useQuery(
    { page: 1, limit: 10 },
    { enabled: isOwnProfile && !!userId }
  );

  if (profileLoading || statsLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E6C200]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">User not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-[#E6C200] text-[#1A1D24] font-bold rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const rankColor = RANK_COLORS[profile.rank] || "#CD7F32";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Profile Header */}
      <div className="bg-[#252830] rounded-2xl p-6 border border-gray-700/50 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#1A1D24] flex-shrink-0"
            style={{ backgroundColor: rankColor }}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              (profile.name || profile.username || "P")[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.name || profile.username}</h1>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase"
                style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
              >
                {profile.rank}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">@{profile.username}</p>
            {profile.country && (
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                <MapPin className="w-3 h-3" />
                {profile.country}
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
              <Calendar className="w-3 h-3" />
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#E6C200]">{profile.eloRating}</div>
            <div className="text-xs text-gray-400">ELO Rating</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#252830] rounded-xl p-4 border border-gray-700/50">
            <Gamepad2 className="w-5 h-5 text-[#3B82F6] mb-2" />
            <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-400">Games Played</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-4 border border-gray-700/50">
            <Trophy className="w-5 h-5 text-[#E6C200] mb-2" />
            <div className="text-2xl font-bold">{stats.wins}</div>
            <div className="text-xs text-gray-400">Wins</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-4 border border-gray-700/50">
            <Swords className="w-5 h-5 text-red-400 mb-2" />
            <div className="text-2xl font-bold">{stats.losses}</div>
            <div className="text-xs text-gray-400">Losses</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-4 border border-gray-700/50">
            <Target className="w-5 h-5 text-green-400 mb-2" />
            <div className="text-2xl font-bold">{stats.winRate}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-4 border border-gray-700/50">
            <TrendingUp className="w-5 h-5 text-purple-400 mb-2" />
            <div className="text-2xl font-bold">{stats.averageScore?.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Avg Score</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-4 border border-gray-700/50">
            <Medal className="w-5 h-5 text-orange-400 mb-2" />
            <div className="text-2xl font-bold">{stats.bestScore?.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Best Score</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-4 border border-gray-700/50 col-span-2">
            <MapPin className="w-5 h-5 text-cyan-400 mb-2" />
            <div className="text-2xl font-bold">{stats.averageDistance} km</div>
            <div className="text-xs text-gray-400">Avg Distance</div>
          </div>
        </div>
      )}

      {/* Match History */}
      {isOwnProfile && history && history.games.length > 0 && (
        <div className="bg-[#252830] rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-4 border-b border-gray-700/50">
            <h2 className="font-bold">Recent Matches</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 text-left text-sm text-gray-400">
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.games.map((game) => (
                  <tr key={game.id} className="border-b border-gray-700/30 hover:bg-white/5">
                    <td className="px-4 py-3 text-sm capitalize">{game.mode?.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-sm capitalize">{game.region?.replace("_", " ")}</td>
                    <td className="px-4 py-3 font-bold text-[#E6C200]">{game.totalScore?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          game.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : game.status === "abandoned"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {game.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
