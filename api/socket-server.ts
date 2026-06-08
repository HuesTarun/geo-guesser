import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getRandomLocations, updateMultiplayerGameResults } from "./queries/games";

interface LobbyPlayer {
  socketId: string;
  userId: number;
  username: string;
  avatar?: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
  connected?: boolean;
}

interface Lobby {
  code: string;
  hostId: number;
  players: Map<number, LobbyPlayer>;
  settings: {
    region: string;
    mode: string;
    totalRounds: number;
    roundTime: number;
    allowMovement: boolean;
  };
  status: "waiting" | "in_progress" | "finished";
  messages: Array<{
    senderId: number;
    senderName: string;
    content: string;
    timestamp: Date;
  }>;
  locations?: any[];
}

const lobbies = new Map<string, Lobby>();
const userSockets = new Map<number, string>(); // userId -> socketId

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ─── Auth ──────────────────────────────────────────────────────
    socket.on("auth", (data: { userId: number; username: string; avatar?: string }) => {
      socket.data.userId = data.userId;
      socket.data.username = data.username;
      socket.data.avatar = data.avatar;
      userSockets.set(data.userId, socket.id);
      socket.broadcast.emit("presence:online", { userId: data.userId });
    });

    // ─── Lobby: Create ─────────────────────────────────────────────
    socket.on("lobby:create", (data: {
      code: string;
      hostId: number;
      settings: Lobby["settings"];
    }) => {
      const lobby: Lobby = {
        code: data.code,
        hostId: data.hostId,
        players: new Map(),
        settings: data.settings,
        status: "waiting",
        messages: [],
      };
      lobbies.set(data.code, lobby);
      socket.join(`lobby:${data.code}`);
      socket.emit("lobby:created", { code: data.code });
    });

    // ─── Lobby: Join ───────────────────────────────────────────────
    socket.on("lobby:join", (data: { code: string }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) {
        socket.emit("lobby:error", { message: "Lobby not found" });
        return;
      }

      // Check if user is reconnecting
      if (lobby.players.has(socket.data.userId)) {
        const existingPlayer = lobby.players.get(socket.data.userId)!;
        existingPlayer.socketId = socket.id;
        existingPlayer.connected = true;

        socket.join(`lobby:${data.code}`);

        // Send chat history and current settings to the joining player
        socket.emit("lobby:chat_history", lobby.messages);
        socket.emit("lobby:joined_data", {
          settings: lobby.settings,
        });

        // Notify all players in lobby of reconnection
        io.to(`lobby:${data.code}`).emit("lobby:player_joined", {
          player: {
            userId: existingPlayer.userId,
            username: existingPlayer.username,
            avatar: existingPlayer.avatar,
            isReady: existingPlayer.isReady,
            isHost: existingPlayer.isHost,
          },
          players: Array.from(lobby.players.values()).map((p) => ({
            userId: p.userId,
            username: p.username,
            avatar: p.avatar,
            isReady: p.isReady,
            isHost: p.isHost,
          })),
        });
        return;
      }

      if (lobby.status !== "waiting") {
        socket.emit("lobby:error", { message: "Game already started" });
        return;
      }

      socket.join(`lobby:${data.code}`);

      const player: LobbyPlayer = {
        socketId: socket.id,
        userId: socket.data.userId,
        username: socket.data.username,
        avatar: socket.data.avatar,
        isReady: false,
        isHost: lobby.hostId === socket.data.userId,
        score: 0,
        connected: true,
      };

      lobby.players.set(socket.data.userId, player);

      // Notify all players in lobby
      io.to(`lobby:${data.code}`).emit("lobby:player_joined", {
        player: {
          userId: player.userId,
          username: player.username,
          avatar: player.avatar,
          isReady: player.isReady,
          isHost: player.isHost,
        },
        players: Array.from(lobby.players.values()).map((p) => ({
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          isReady: p.isReady,
          isHost: p.isHost,
        })),
      });

      // Send chat history and current settings to the joining player
      socket.emit("lobby:chat_history", lobby.messages);
      socket.emit("lobby:joined_data", {
        settings: lobby.settings,
      });
    });

    // ─── Lobby: Leave ──────────────────────────────────────────────
    socket.on("lobby:leave", (data: { code: string }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;

      lobby.players.delete(socket.data.userId);
      socket.leave(`lobby:${data.code}`);

      io.to(`lobby:${data.code}`).emit("lobby:player_left", {
        userId: socket.data.userId,
        players: Array.from(lobby.players.values()).map((p) => ({
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          isReady: p.isReady,
          isHost: p.isHost,
        })),
      });

      if (lobby.players.size === 0) {
        lobbies.delete(data.code);
      }
    });

    // ─── Lobby: Ready ──────────────────────────────────────────────
    socket.on("lobby:ready", (data: { code: string; ready: boolean }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;

      const player = lobby.players.get(socket.data.userId);
      if (player) {
        player.isReady = data.ready;
      }

      io.to(`lobby:${data.code}`).emit("lobby:player_ready", {
        userId: socket.data.userId,
        ready: data.ready,
        allReady: Array.from(lobby.players.values()).every((p) => p.isReady),
      });
    });

    // ─── Lobby: Chat ───────────────────────────────────────────────
    socket.on("lobby:chat", (data: { code: string; content: string }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;

      const message = {
        senderId: socket.data.userId,
        senderName: socket.data.username,
        content: data.content,
        timestamp: new Date(),
      };

      lobby.messages.push(message);
      if (lobby.messages.length > 100) {
        lobby.messages.shift();
      }

      io.to(`lobby:${data.code}`).emit("lobby:message", message);
    });

    // ─── Lobby: Update Settings ─────────────────────────────────────
    socket.on("lobby:update_settings", (data: { code: string; settings: Partial<Lobby["settings"]> }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;
      if (lobby.hostId !== socket.data.userId) return;

      lobby.settings = {
        ...lobby.settings,
        ...data.settings,
      };

      io.to(`lobby:${data.code}`).emit("lobby:settings_updated", {
        settings: lobby.settings,
      });
    });

    // ─── Lobby: Invite Friend ──────────────────────────────────────
    socket.on("lobby:invite", (data: { friendId: number; code: string }) => {
      const targetSocketId = userSockets.get(data.friendId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("lobby:invite_received", {
          hostName: socket.data.username || "A friend",
          lobbyCode: data.code,
        });
      }
    });

    // ─── Friend Events ─────────────────────────────────────────────
    socket.on("friend:request_sent", (data: { targetUserId: number }) => {
      const targetSocketId = userSockets.get(data.targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("friend:request_received", {
          requesterId: socket.data.userId,
          requesterName: socket.data.username || "A user",
        });
      }
    });

    socket.on("friend:request_accepted", (data: { targetUserId: number }) => {
      const targetSocketId = userSockets.get(data.targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("friend:accepted", {
          userId: socket.data.userId,
          username: socket.data.username || "A user",
        });
      }
    });

    // ─── Lobby: Start Game ─────────────────────────────────────────
    socket.on("lobby:start", async (data: { code: string }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;
      if (lobby.hostId !== socket.data.userId) {
        socket.emit("lobby:error", { message: "Only host can start" });
        return;
      }

      try {
        const locations = await getRandomLocations(
          lobby.settings.region,
          lobby.settings.totalRounds
        );

        if (locations.length < lobby.settings.totalRounds) {
          socket.emit("lobby:error", {
            message:
              locations.length === 0
                ? "No playable locations with street view for this region."
                : `Not enough street-view locations for ${lobby.settings.totalRounds} rounds (only ${locations.length} available).`,
          });
          return;
        }

        // Reset player scores before starting the game
        for (const player of lobby.players.values()) {
          player.score = 0;
        }

        lobby.locations = locations;
        lobby.status = "in_progress";

        io.to(`lobby:${data.code}`).emit("lobby:game_started", {
          settings: lobby.settings,
          locations: locations.map((loc) => ({
            id: loc.id,
            lat: loc.lat,
            lng: loc.lng,
            country: loc.country,
            city: loc.city,
            imageUrl: loc.imageUrl,
            difficulty: loc.difficulty,
            streetViewId: loc.streetViewId,
          })),
        });
      } catch (err: any) {
        console.error("Failed to start multiplayer game:", err);
        socket.emit("lobby:error", { message: "Failed to load game locations" });
      }
    });

    // ─── Game: Submit Guess ────────────────────────────────────────
    socket.on("game:guess", (data: {
      code: string;
      round: number;
      lat: number;
      lng: number;
      score: number;
      distance: number;
    }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;

      const player = lobby.players.get(socket.data.userId);
      if (player) {
        player.score += data.score;
      }

      io.to(`lobby:${data.code}`).emit("game:guess_result", {
        userId: socket.data.userId,
        username: socket.data.username,
        round: data.round,
        score: data.score,
        distance: data.distance,
        totalScore: player?.score || 0,
      });
    });

    // ─── Game: Round End ───────────────────────────────────────────
    socket.on("game:round_end", (data: { code: string; round: number }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;

      io.to(`lobby:${data.code}`).emit("game:round_results", {
        round: data.round,
        scores: Array.from(lobby.players.values()).map((p) => ({
          userId: p.userId,
          username: p.username,
          score: p.score,
        })),
      });
    });

    // ─── Game: Next Round ──────────────────────────────────────────
    socket.on("game:next_round", (data: { code: string; round: number }) => {
      io.to(`lobby:${data.code}`).emit("game:next_round", {
        round: data.round,
      });
    });

    // ─── Game: End ─────────────────────────────────────────────────
    socket.on("game:end", async (data: { code: string }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;

      lobby.status = "finished";

      const finalScores = Array.from(lobby.players.values())
        .map((p) => ({
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          score: p.score,
          eloChange: 0,
          newElo: 1000,
        }))
        .sort((a, b) => b.score - a.score);

      try {
        const eloResults = await updateMultiplayerGameResults(
          finalScores.map((s) => ({ userId: s.userId, score: s.score })),
          lobby.settings.totalRounds
        );
        // Merge ELO changes into finalScores
        finalScores.forEach((s) => {
          const res = eloResults.get(s.userId);
          if (res) {
            s.eloChange = res.eloChange;
            s.newElo = res.newElo;
          }
        });
      } catch (err) {
        console.error("Failed to update multiplayer game results in DB:", err);
      }

      io.to(`lobby:${data.code}`).emit("game:final_scores", {
        scores: finalScores,
        winner: finalScores[0],
      });
    });

    // ─── Disconnect ────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      if (socket.data.userId) {
        userSockets.delete(socket.data.userId);
        socket.broadcast.emit("presence:offline", { userId: socket.data.userId });
      }

      // Clean up lobbies
      for (const [code, lobby] of lobbies) {
        for (const [userId, player] of lobby.players) {
          if (player.socketId === socket.id) {
            if (lobby.status === "in_progress") {
              // Mark as offline but keep player record so score is preserved at game end
              player.connected = false;
            } else {
              lobby.players.delete(userId);
            }

            // Only notify left if they are actually deleted from the lobby map
            if (lobby.status !== "in_progress") {
              io.to(`lobby:${code}`).emit("lobby:player_left", {
                userId,
                players: Array.from(lobby.players.values()).map((p) => ({
                  userId: p.userId,
                  username: p.username,
                  avatar: p.avatar,
                  isReady: p.isReady,
                  isHost: p.isHost,
                })),
              });
            }

            // Delete lobby only if empty or all players are offline/disconnected
            const allDisconnected = Array.from(lobby.players.values()).every(
              (p) => p.connected === false
            );
            if (lobby.players.size === 0 || allDisconnected) {
              lobbies.delete(code);
            }
            break;
          }
        }
      }
    });
  });

  return io;
}
