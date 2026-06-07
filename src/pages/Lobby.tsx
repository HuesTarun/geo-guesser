import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useSocket } from "@/hooks/useSocket";
import { useLobbyStore } from "@/stores/lobbyStore";
import {
  Users, Copy, Check, Play, Settings, MessageSquare,
  ArrowLeft, Loader2,
} from "lucide-react";

export default function Lobby() {
  const navigate = useNavigate();
  const { code: urlCode } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { emit, on } = useSocket();
  const lobbyStore = useLobbyStore();

  const [joinCode, setJoinCode] = useState(urlCode || "");
  const [chatMessage, setChatMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const createLobbyMutation = trpc.lobby.create.useMutation({
    onSuccess: (data) => {
      if (data) {
        lobbyStore.setLobby(data.code, data.name, [], true);
        emit("lobby:create", {
          code: data.code,
          hostId: user?.id,
          settings: lobbyStore.settings,
        });
        navigate(`/lobby/${data.code}`);
      }
    },
  });

  const joinLobbyMutation = trpc.lobby.join.useMutation({
    onSuccess: (data) => {
      if (data?.lobby) {
        lobbyStore.setLobby(data.lobby.code, data.lobby.name, [], false);
        emit("lobby:join", { code: data.lobby.code });
        navigate(`/lobby/${data.lobby.code}`);
      }
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  // Socket events
  useEffect(() => {
    if (!lobbyStore.lobbyCode) return;

    const unsubPlayerJoined = on("lobby:player_joined", (data: any) => {
      lobbyStore.setPlayers(data.players);
    });

    const unsubPlayerLeft = on("lobby:player_left", (data: any) => {
      lobbyStore.setPlayers(data.players);
    });

    const unsubMessage = on("lobby:message", (msg: any) => {
      lobbyStore.addMessage(msg);
    });

    const unsubGameStarted = on("lobby:game_started", (data: any) => {
      if (data?.locations) {
        lobbyStore.setGameLocations(data.locations);
      }
      lobbyStore.setStatus("in_progress");
      navigate("/multiplayer");
    });

    return () => {
      unsubPlayerJoined?.();
      unsubPlayerLeft?.();
      unsubMessage?.();
      unsubGameStarted?.();
    };
  }, [lobbyStore.lobbyCode]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please login to join multiplayer</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-[#E6C200] text-[#1A1D24] font-bold rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Lobby Code Input Screen
  if (!lobbyStore.lobbyCode) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-[#252830] rounded-2xl p-6 border border-gray-700/50">
          <h1 className="text-2xl font-bold mb-6">Multiplayer Lobby</h1>

          {/* Join by code */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-300 mb-2 block">Join with Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter lobby code"
                className="flex-1 px-4 py-3 bg-[#1A1D24] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#E6C200] transition-colors uppercase"
                maxLength={10}
              />
              <button
                onClick={() => joinCode && joinLobbyMutation.mutate({ code: joinCode })}
                disabled={!joinCode || joinLobbyMutation.isPending}
                className="px-6 py-3 bg-[#3B82F6] text-white font-medium rounded-xl hover:bg-[#3B82F6]/90 transition-all disabled:opacity-50"
              >
                {joinLobbyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join"}
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#252830] text-gray-400">or</span>
            </div>
          </div>

          {/* Create lobby */}
          <button
            onClick={() =>
              createLobbyMutation.mutate({
                name: `${user?.name || "Player"}'s Lobby`,
                region: "worldwide",
                mode: "classic",
              })
            }
            disabled={createLobbyMutation.isPending}
            className="w-full py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {createLobbyMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Users className="w-5 h-5" />
            )}
            Create New Lobby
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-3 py-3 bg-[#1A1D24] text-gray-400 font-medium rounded-xl hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Lobby Screen
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Lobby Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#252830] rounded-2xl p-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{lobbyStore.lobbyName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400">Code:</span>
                  <code className="px-2 py-1 bg-[#1A1D24] rounded text-[#E6C200] font-mono text-sm">
                    {lobbyStore.lobbyCode}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lobbyStore.lobbyCode!);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              {lobbyStore.isHost && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Settings Panel */}
            {showSettings && lobbyStore.isHost && (
              <div className="mb-4 p-4 bg-[#1A1D24] rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Region</label>
                    <select
                      value={lobbyStore.settings.region}
                      onChange={(e) => lobbyStore.updateSettings({ region: e.target.value })}
                      className="w-full px-3 py-2 bg-[#252830] border border-gray-700/50 rounded-lg text-sm"
                    >
                      {["worldwide", "europe", "asia", "africa", "north_america", "south_america", "oceania"].map((r) => (
                        <option key={r} value={r}>{r.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Mode</label>
                    <select
                      value={lobbyStore.settings.mode}
                      onChange={(e) => lobbyStore.updateSettings({ mode: e.target.value })}
                      className="w-full px-3 py-2 bg-[#252830] border border-gray-700/50 rounded-lg text-sm"
                    >
                      {["classic", "country_streak", "time_attack", "no_move"].map((m) => (
                        <option key={m} value={m}>{m.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Rounds</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={lobbyStore.settings.totalRounds}
                      onChange={(e) => lobbyStore.updateSettings({ totalRounds: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#252830] border border-gray-700/50 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Time (sec)</label>
                    <input
                      type="number"
                      min={30}
                      max={300}
                      value={lobbyStore.settings.roundTime}
                      onChange={(e) => lobbyStore.updateSettings({ roundTime: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#252830] border border-gray-700/50 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Players */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Players ({lobbyStore.players.length})
              </h3>
              {lobbyStore.players.map((player) => (
                <div
                  key={player.userId}
                  className="flex items-center justify-between p-3 bg-[#1A1D24] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-sm font-bold">
                      {(player.username || "P")[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{player.username}</span>
                    {player.isHost && (
                      <span className="px-2 py-0.5 bg-[#E6C200]/20 text-[#E6C200] text-xs rounded-full">
                        Host
                      </span>
                    )}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${player.isReady ? "bg-green-400" : "bg-gray-600"}`} />
                </div>
              ))}
            </div>

            {/* Ready / Start Buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  const newReady = !lobbyStore.isReady;
                  lobbyStore.setReady(newReady);
                  emit("lobby:ready", { code: lobbyStore.lobbyCode, ready: newReady });
                }}
                className={`flex-1 py-3 font-bold rounded-xl transition-all ${
                  lobbyStore.isReady
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-[#1A1D24] text-gray-300 border border-gray-700/50 hover:bg-[#1A1D24]/80"
                }`}
              >
                {lobbyStore.isReady ? "Ready!" : "Ready Up"}
              </button>
              {lobbyStore.isHost && (
                <button
                  onClick={() => emit("lobby:start", { code: lobbyStore.lobbyCode })}
                  className="flex-1 py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Game
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="bg-[#252830] rounded-2xl border border-gray-700/50 flex flex-col h-[500px]">
          <div className="p-4 border-b border-gray-700/50 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h3 className="font-medium">Lobby Chat</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {lobbyStore.messages.map((msg, i) => (
              <div key={i} className="text-sm">
                <span className="text-[#E6C200] font-medium">{msg.senderName}: </span>
                <span className="text-gray-300">{msg.content}</span>
              </div>
            ))}
            {lobbyStore.messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center">No messages yet</p>
            )}
          </div>
          <div className="p-3 border-t border-gray-700/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && chatMessage.trim()) {
                    emit("lobby:chat", { code: lobbyStore.lobbyCode, content: chatMessage.trim() });
                    setChatMessage("");
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-[#1A1D24] border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6]"
              />
              <button
                onClick={() => {
                  if (chatMessage.trim()) {
                    emit("lobby:chat", { code: lobbyStore.lobbyCode, content: chatMessage.trim() });
                    setChatMessage("");
                  }
                }}
                className="px-3 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#3B82F6]/90 transition-all"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
