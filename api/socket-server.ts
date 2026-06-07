import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

interface LobbyPlayer {
  socketId: string;
  userId: number;
  username: string;
  avatar?: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
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

      // Send chat history
      socket.emit("lobby:chat_history", lobby.messages);
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

    // ─── Lobby: Start Game ─────────────────────────────────────────
    socket.on("lobby:start", (data: { code: string }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;
      if (lobby.hostId !== socket.data.userId) {
        socket.emit("lobby:error", { message: "Only host can start" });
        return;
      }

      lobby.status = "in_progress";
      io.to(`lobby:${data.code}`).emit("lobby:game_started", {
        settings: lobby.settings,
      });
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

    // ─── Game: End ─────────────────────────────────────────────────
    socket.on("game:end", (data: { code: string }) => {
      const lobby = lobbies.get(data.code);
      if (!lobby) return;

      lobby.status = "finished";

      const finalScores = Array.from(lobby.players.values())
        .map((p) => ({
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          score: p.score,
        }))
        .sort((a, b) => b.score - a.score);

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
            lobby.players.delete(userId);
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

            if (lobby.players.size === 0) {
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
