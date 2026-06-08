import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { useSocket } from "@/hooks/useSocket";
import { useLobbyStore } from "@/stores/lobbyStore";
import {
  Users, Copy, Check, Play, Settings, MessageSquare,
  ArrowLeft, Loader2, LogOut, X, UserPlus,
} from "lucide-react";
import { toast } from "sonner";

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
  const [showInviteModal, setShowInviteModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: friends, refetch: refetchFriends } = trpc.user.listFriends.useQuery(undefined, { enabled: isAuthenticated });

  // Real-time friend status for invite modal
  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubOnline = on("presence:online", () => {
      refetchFriends();
    });

    const unsubOffline = on("presence:offline", () => {
      refetchFriends();
    });

    return () => {
      unsubOnline?.();
      unsubOffline?.();
    };
  }, [isAuthenticated, on, refetchFriends]);

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
      toast.error(err.message);
    },
  });

  // Handle auto-joining from URL
  useEffect(() => {
    if (urlCode && urlCode !== lobbyStore.lobbyCode && isAuthenticated && !joinLobbyMutation.isPending) {
      joinLobbyMutation.mutate({ code: urlCode });
    }
  }, [urlCode, isAuthenticated]);

  // Handle cleanup when opening main join page without a code in the URL
  useEffect(() => {
    if (!urlCode && lobbyStore.lobbyCode) {
      lobbyStore.reset();
    }
  }, [urlCode]);

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

    const unsubChatHistory = on("lobby:chat_history", (msgs: any[]) => {
      lobbyStore.setMessages(msgs.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
    });

    const unsubGameStarted = on("lobby:game_started", (data: any) => {
      if (data?.locations) {
        lobbyStore.setGameLocations(data.locations);
      }
      lobbyStore.setStatus("in_progress");
      navigate("/multiplayer");
    });

    const unsubSettingsUpdated = on("lobby:settings_updated", (data: any) => {
      if (data?.settings) {
        lobbyStore.updateSettings(data.settings);
      }
    });

    const unsubJoinedData = on("lobby:joined_data", (data: any) => {
      if (data?.settings) {
        lobbyStore.updateSettings(data.settings);
      }
    });

    return () => {
      unsubPlayerJoined?.();
      unsubPlayerLeft?.();
      unsubMessage?.();
      unsubChatHistory?.();
      unsubGameStarted?.();
      unsubSettingsUpdated?.();
      unsubJoinedData?.();
    };
  }, [lobbyStore.lobbyCode]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lobbyStore.messages]);

  const handleLeaveLobby = () => {
    if (lobbyStore.lobbyCode) {
      emit("lobby:leave", { code: lobbyStore.lobbyCode });
      lobbyStore.reset();
      navigate("/lobby");
    }
  };

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

  const handleUpdateSettings = (newSettings: Partial<typeof lobbyStore.settings>) => {
    lobbyStore.updateSettings(newSettings);
    emit("lobby:update_settings", {
      code: lobbyStore.lobbyCode,
      settings: newSettings,
    });
  };

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
                      toast.success("Lobby code copied!");
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                  title="Invite Friends"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  title="Lobby Settings"
                >
                  <Settings className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  onClick={handleLeaveLobby}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                  title="Leave Lobby"
                >
                  <LogOut className="w-4 h-4" />
                  Leave
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="mb-4 p-4 bg-[#1A1D24] rounded-xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Region</label>
                    <select
                      value={lobbyStore.settings.region}
                      onChange={(e) => handleUpdateSettings({ region: e.target.value })}
                      disabled={!lobbyStore.isHost}
                      className="w-full px-3 py-2 bg-[#252830] border border-gray-700/50 rounded-lg text-sm disabled:opacity-75"
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
                      onChange={(e) => handleUpdateSettings({ mode: e.target.value })}
                      disabled={!lobbyStore.isHost}
                      className="w-full px-3 py-2 bg-[#252830] border border-gray-700/50 rounded-lg text-sm disabled:opacity-75"
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
                      onChange={(e) => handleUpdateSettings({ totalRounds: Number(e.target.value) })}
                      disabled={!lobbyStore.isHost}
                      className="w-full px-3 py-2 bg-[#252830] border border-gray-700/50 rounded-lg text-sm disabled:opacity-75"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Time (sec)</label>
                    <input
                      type="number"
                      min={30}
                      max={300}
                      value={lobbyStore.settings.roundTime}
                      onChange={(e) => handleUpdateSettings({ roundTime: Number(e.target.value) })}
                      disabled={!lobbyStore.isHost}
                      className="w-full px-3 py-2 bg-[#252830] border border-gray-700/50 rounded-lg text-sm disabled:opacity-75"
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-between p-2 bg-[#252830] rounded-lg border border-gray-700/50 mt-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">Allow Movement</span>
                      <span className="text-[10px] text-gray-400">Let players move along the street panorama</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={lobbyStore.settings.allowMovement}
                      onChange={(e) => handleUpdateSettings({ allowMovement: e.target.checked })}
                      disabled={!lobbyStore.isHost}
                      className="w-4 h-4 rounded border-gray-700 bg-[#1A1D24] text-[#E6C200] focus:ring-[#E6C200] disabled:opacity-75"
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
                  <div className="w-2 h-2 rounded-full bg-green-400" title="Online" />
                </div>
              ))}
            </div>

            {/* Start Game Buttons */}
            <div className="mt-4">
              {lobbyStore.isHost ? (
                <button
                  onClick={() => emit("lobby:start", { code: lobbyStore.lobbyCode })}
                  className="w-full py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Game
                </button>
              ) : (
                <div className="text-center text-sm text-gray-400 py-3 bg-[#1A1D24] rounded-xl border border-gray-800 animate-pulse">
                  Waiting for host to start game...
                </div>
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
            <div ref={chatEndRef} />
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

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[9999] px-4">
          <div className="bg-[#252830] rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E6C200]" />
                Invite Friends
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {friends && friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-3 bg-[#1A1D24] rounded-xl border border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center font-bold text-xs">
                        {(friend.name || friend.username || "P")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{friend.name || friend.username}</div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${friend.isOnline ? "bg-green-400" : "bg-gray-600"}`} />
                          <span className="text-[10px] text-gray-400 capitalize">
                            {friend.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        emit("lobby:invite", { friendId: friend.id, code: lobbyStore.lobbyCode });
                        toast.success(`Invitation sent to ${friend.name || friend.username}!`);
                      }}
                      disabled={!friend.isOnline}
                      className="px-3 py-1.5 bg-[#3B82F6] text-white text-xs font-semibold rounded-lg hover:bg-[#3B82F6]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Invite
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No friends added yet.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
