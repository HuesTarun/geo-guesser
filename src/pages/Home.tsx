import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { MapPin, Users, Trophy, Globe, Play, Crosshair, Clock, Eye } from "lucide-react";

const GAME_MODES = [
  { id: "classic", name: "Classic", desc: "Standard worldwide guessing", icon: Globe },
  { id: "country_streak", name: "Country Streak", desc: "Guess the country only", icon: Crosshair },
  { id: "time_attack", name: "Time Attack", desc: "Race against the clock", icon: Clock },
  { id: "no_move", name: "No Move", desc: "Static view, no movement", icon: Eye },
];

const REGIONS = [
  { id: "worldwide", name: "Worldwide", icon: Globe },
  { id: "europe", name: "Europe", icon: MapPin },
  { id: "asia", name: "Asia", icon: MapPin },
  { id: "africa", name: "Africa", icon: MapPin },
  { id: "north_america", name: "North America", icon: MapPin },
  { id: "south_america", name: "South America", icon: MapPin },
  { id: "oceania", name: "Oceania", icon: MapPin },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedMode, setSelectedMode] = useState("classic");
  const [selectedRegion, setSelectedRegion] = useState("worldwide");
  const [rounds, setRounds] = useState(5);

  const startSoloGame = () => {
    navigate("/game", {
      state: { mode: selectedMode, region: selectedRegion, rounds },
    });
  };

  const createLobby = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate("/lobby");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E6C200] rounded-2xl mb-6 shadow-lg shadow-[#E6C200]/20">
          <MapPin className="w-10 h-10 text-[#1A1D24]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-white">GeoTag</span>{" "}
          <span className="text-[#E6C200]">Challenge</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Test your geography knowledge. Drop a pin on the map and see how close you can get to the actual location.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Solo Game */}
        <div className="bg-[#252830] rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Play className="w-5 h-5 text-[#E6C200]" />
            Solo Play
          </h2>
          <p className="text-gray-400 text-sm mb-6">Play alone and beat your high score</p>

          {/* Game Mode */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Game Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {GAME_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-all ${
                    selectedMode === mode.id
                      ? "bg-[#E6C200] text-[#1A1D24]"
                      : "bg-[#1A1D24] text-gray-400 hover:text-white hover:bg-[#1A1D24]/80 border border-gray-700/50"
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  {mode.name}
                </button>
              ))}
            </div>
          </div>

          {/* Region */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Region</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`p-2 rounded-lg text-xs font-medium transition-all ${
                    selectedRegion === region.id
                      ? "bg-[#3B82F6] text-white"
                      : "bg-[#1A1D24] text-gray-400 hover:text-white border border-gray-700/50"
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Rounds: {rounds}
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full h-2 bg-[#1A1D24] rounded-lg appearance-none cursor-pointer accent-[#E6C200]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          <button
            onClick={startSoloGame}
            className="w-full py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Game
          </button>
        </div>

        {/* Multiplayer */}
        <div className="bg-[#252830] rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3B82F6]" />
            Multiplayer
          </h2>
          <p className="text-gray-400 text-sm mb-6">Play with friends or join public lobbies</p>

          <div className="space-y-3">
            <button
              onClick={createLobby}
              className="w-full p-4 bg-[#1A1D24] rounded-xl border border-gray-700/50 hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center group-hover:bg-[#3B82F6]/30 transition-colors">
                  <Users className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <div className="font-medium">Create Lobby</div>
                  <div className="text-sm text-gray-400">Invite friends with a code</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/lobby")}
              className="w-full p-4 bg-[#1A1D24] rounded-xl border border-gray-700/50 hover:border-[#22C55E]/50 hover:bg-[#22C55E]/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#22C55E]/20 rounded-lg flex items-center justify-center group-hover:bg-[#22C55E]/30 transition-colors">
                  <Globe className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <div className="font-medium">Join Lobby</div>
                  <div className="text-sm text-gray-400">Enter a lobby code to join</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/leaderboard")}
              className="w-full p-4 bg-[#1A1D24] rounded-xl border border-gray-700/50 hover:border-[#E6C200]/50 hover:bg-[#E6C200]/5 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E6C200]/20 rounded-lg flex items-center justify-center group-hover:bg-[#E6C200]/30 transition-colors">
                  <Trophy className="w-5 h-5 text-[#E6C200]" />
                </div>
                <div>
                  <div className="font-medium">Leaderboard</div>
                  <div className="text-sm text-gray-400">See global rankings</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Rank Info */}
      <div className="mt-12">
        <h3 className="text-lg font-bold mb-4 text-center">Ranking System</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { rank: "bronze", color: "#CD7F32" },
            { rank: "silver", color: "#C0C0C0" },
            { rank: "gold", color: "#FFD700" },
            { rank: "platinum", color: "#3EB489" },
            { rank: "diamond", color: "#3B82F6" },
            { rank: "master", color: "#A855F7" },
            { rank: "grandmaster", color: "#EF4444" },
          ].map((r) => (
            <div
              key={r.rank}
              className="flex items-center gap-2 px-4 py-2 bg-[#252830] rounded-lg border border-gray-700/50"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-sm font-medium capitalize">{r.rank}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
