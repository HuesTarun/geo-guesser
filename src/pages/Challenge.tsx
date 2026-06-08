import { useParams, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import {
  MapPin, Trophy, Play, Copy, Check, ArrowLeft, Loader2,
} from "lucide-react";

export default function Challenge() {
  const navigate = useNavigate();
  const { code } = useParams();
  const { isAuthenticated } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: challenge, isLoading } = trpc.challenge.getByCode.useQuery(
    { code: code! },
    { enabled: !!code }
  );

  const { data: leaderboard } = trpc.challenge.getLeaderboard.useQuery(
    { code: code! },
    { enabled: !!code }
  );

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#E6C200] animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Challenge Not Found</h1>
          <p className="text-gray-400 mb-4">This challenge link doesn't exist or has expired.</p>
          <button onClick={() => navigate("/")} className="px-6 py-2 bg-[#E6C200] text-[#1A1D24] font-bold rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const challengeUrl = `${window.location.origin}/challenge/${code}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-[#252830] rounded-2xl p-6 border border-gray-700/50 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#E6C200] rounded-xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#1A1D24]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Challenge</h1>
            <p className="text-gray-400 text-sm">{challenge.totalRounds} rounds · Code: {code}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#1A1D24] rounded-lg mb-4">
          <code className="text-sm text-[#E6C200]">{challengeUrl}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(challengeUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-[#1A1D24] rounded-lg">
            <div className="text-2xl font-bold text-[#E6C200]">{challenge.timesPlayed}</div>
            <div className="text-xs text-gray-400">Plays</div>
          </div>
          <div className="text-center p-3 bg-[#1A1D24] rounded-lg">
            <div className="text-2xl font-bold text-[#E6C200]">{challenge.bestScore?.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Best Score</div>
          </div>
          <div className="text-center p-3 bg-[#1A1D24] rounded-lg">
            <div className="text-2xl font-bold text-[#E6C200]">{challenge.totalRounds}</div>
            <div className="text-xs text-gray-400">Rounds</div>
          </div>
        </div>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              navigate("/login");
              return;
            }
            navigate("/game", { state: { mode: "challenge", challengeCode: code, rounds: challenge.totalRounds } });
          }}
          className="w-full py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Play Challenge
        </button>
      </div>

      {/* Leaderboard */}
      {leaderboard && leaderboard.leaderboard.length > 0 && (
        <div className="bg-[#252830] rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-4 border-b border-gray-700/50 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#E6C200]" />
            <h2 className="font-bold">Challenge Leaderboard</h2>
          </div>
          <div className="divide-y divide-gray-700/30">
            {leaderboard.leaderboard.map((entry: any, index: number) => (
              <div key={entry.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold w-6 ${
                    index === 0 ? "text-[#FFD700]" : index === 1 ? "text-[#C0C0C0]" : index === 2 ? "text-[#CD7F32]" : "text-gray-500"
                  }`}>
                    #{index + 1}
                  </span>
                  <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-sm font-bold">
                    {(entry.userUsername || entry.userName || "Player")[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{entry.userUsername || entry.userName || `Player ${entry.userId}`}</span>
                </div>
                <span className="font-bold text-[#E6C200]">{entry.score?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
