import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Users ──────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  unionId: text("unionId", { length: 255 }).unique(),
  email: text("email", { length: 320 }).unique(),
  username: text("username", { length: 50 }).unique(),
  passwordHash: text("passwordHash", { length: 255 }),
  name: text("name", { length: 255 }),
  avatar: text("avatar"),
  country: text("country", { length: 100 }),
  role: text("role", { enum: ["user", "moderator", "admin"] }).default("user").notNull(),
  rank: text("rank", { enum: ["bronze", "silver", "gold", "platinum", "diamond", "master", "grandmaster"] }).default("bronze").notNull(),
  eloRating: integer("eloRating").default(1000).notNull(),
  gamesPlayed: integer("gamesPlayed").default(0).notNull(),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  totalScore: integer("totalScore").default(0).notNull(),
  bestScore: integer("bestScore").default(0).notNull(),
  averageDistance: real("averageDistance").default(0),
  isOnline: integer("isOnline", { mode: "boolean" }).default(false).notNull(),
  lastActiveAt: integer("lastActiveAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Games ──────────────────────────────────────────────────────────
export const games = sqliteTable("games", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).references(() => users.id),
  mode: text("mode", { enum: ["classic", "country_streak", "city_streak", "time_attack", "no_move", "no_pan", "no_zoom", "challenge"] }).default("classic").notNull(),
  region: text("region", { enum: ["worldwide", "europe", "asia", "africa", "north_america", "south_america", "oceania"] }).default("worldwide").notNull(),
  totalRounds: integer("totalRounds").default(5).notNull(),
  currentRound: integer("currentRound").default(0).notNull(),
  totalScore: integer("totalScore").default(0).notNull(),
  maxPossibleScore: integer("maxPossibleScore").default(25000).notNull(),
  status: text("status", { enum: ["in_progress", "completed", "abandoned"] }).default("in_progress").notNull(),
  isMultiplayer: integer("isMultiplayer", { mode: "boolean" }).default(false).notNull(),
  lobbyCode: text("lobbyCode", { length: 10 }),
  challengeCode: text("challengeCode", { length: 20 }),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  completedAt: integer("completedAt", { mode: "timestamp" }),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

// ─── Rounds ─────────────────────────────────────────────────────────
export const rounds = sqliteTable("rounds", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  gameId: integer("gameId", { mode: "number" }).references(() => games.id).notNull(),
  roundNumber: integer("roundNumber").notNull(),
  locationId: integer("locationId", { mode: "number" }).references(() => locations.id).notNull(),
  guessLat: real("guessLat"),
  guessLng: real("guessLng"),
  actualLat: real("actualLat").notNull(),
  actualLng: real("actualLng").notNull(),
  distance: real("distance"),
  score: integer("score"),
  timeTaken: integer("timeTaken"),
  status: text("status", { enum: ["in_progress", "completed", "timed_out"] }).default("in_progress").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  completedAt: integer("completedAt", { mode: "timestamp" }),
});

export type Round = typeof rounds.$inferSelect;
export type InsertRound = typeof rounds.$inferInsert;

// ─── Locations ──────────────────────────────────────────────────────
export const locations = sqliteTable("locations", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  country: text("country", { length: 100 }).notNull(),
  city: text("city", { length: 100 }),
  region: text("region", { enum: ["europe", "asia", "africa", "north_america", "south_america", "oceania", "antarctica"] }).notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard", "expert"] }).default("medium").notNull(),
  streetViewId: text("streetViewId", { length: 255 }),
  imageUrl: text("imageUrl"),
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  timesPlayed: integer("timesPlayed").default(0).notNull(),
  avgScore: real("avgScore").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

// ─── Lobbies ────────────────────────────────────────────────────────
export const lobbies = sqliteTable("lobbies", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  code: text("code", { length: 10 }).unique().notNull(),
  hostId: integer("hostId", { mode: "number" }).references(() => users.id).notNull(),
  name: text("name", { length: 100 }).notNull(),
  region: text("region", { enum: ["worldwide", "europe", "asia", "africa", "north_america", "south_america", "oceania"] }).default("worldwide").notNull(),
  mode: text("mode", { enum: ["classic", "country_streak", "time_attack", "no_move"] }).default("classic").notNull(),
  totalRounds: integer("totalRounds").default(5).notNull(),
  roundTime: integer("roundTime").default(120).notNull(),
  allowMovement: integer("allowMovement", { mode: "boolean" }).default(true).notNull(),
  isPublic: integer("isPublic", { mode: "boolean" }).default(true).notNull(),
  status: text("status", { enum: ["waiting", "in_progress", "finished"] }).default("waiting").notNull(),
  maxPlayers: integer("maxPlayers").default(8).notNull(),
  currentPlayers: integer("currentPlayers").default(1).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  startedAt: integer("startedAt", { mode: "timestamp" }),
  finishedAt: integer("finishedAt", { mode: "timestamp" }),
});

export type Lobby = typeof lobbies.$inferSelect;
export type InsertLobby = typeof lobbies.$inferInsert;

// ─── Lobby Players ──────────────────────────────────────────────────
export const lobbyPlayers = sqliteTable("lobbyPlayers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  lobbyId: integer("lobbyId", { mode: "number" }).references(() => lobbies.id).notNull(),
  userId: integer("userId", { mode: "number" }).references(() => users.id).notNull(),
  isReady: integer("isReady", { mode: "boolean" }).default(false).notNull(),
  isHost: integer("isHost", { mode: "boolean" }).default(false).notNull(),
  totalScore: integer("totalScore").default(0).notNull(),
  joinedAt: integer("joinedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type LobbyPlayer = typeof lobbyPlayers.$inferSelect;
export type InsertLobbyPlayer = typeof lobbyPlayers.$inferInsert;

// ─── Friendships ────────────────────────────────────────────────────
export const friendships = sqliteTable("friendships", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  requesterId: integer("requesterId", { mode: "number" }).references(() => users.id).notNull(),
  addresseeId: integer("addresseeId", { mode: "number" }).references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected", "blocked"] }).default("pending").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull().$onUpdate(() => new Date()),
});

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

// ─── Messages ───────────────────────────────────────────────────────
export const messages = sqliteTable("messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  senderId: integer("senderId", { mode: "number" }).references(() => users.id).notNull(),
  receiverId: integer("receiverId", { mode: "number" }).references(() => users.id),
  lobbyId: integer("lobbyId", { mode: "number" }).references(() => lobbies.id),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Leaderboard Entries ────────────────────────────────────────────
export const leaderboardEntries = sqliteTable("leaderboardEntries", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).references(() => users.id).notNull(),
  category: text("category", { enum: ["highest_score", "highest_elo", "most_wins", "best_accuracy"] }).notNull(),
  score: integer("score").notNull(),
  region: text("region", { length: 100 }),
  timeframe: text("timeframe", { enum: ["daily", "weekly", "monthly", "all_time"] }).default("all_time").notNull(),
  gameId: integer("gameId", { mode: "number" }).references(() => games.id),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboardEntries.$inferInsert;

// ─── Challenges ─────────────────────────────────────────────────────
export const challenges = sqliteTable("challenges", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  code: text("code", { length: 20 }).unique().notNull(),
  creatorId: integer("creatorId", { mode: "number" }).references(() => users.id).notNull(),
  locationIds: text("locationIds", { mode: "json" }).notNull(),
  totalRounds: integer("totalRounds").default(5).notNull(),
  bestScore: integer("bestScore").default(0).notNull(),
  timesPlayed: integer("timesPlayed").default(0).notNull(),
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// ─── Notifications ──────────────────────────────────────────────────
export const notifications = sqliteTable("notifications", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).references(() => users.id).notNull(),
  type: text("type", { enum: ["friend_request", "friend_accepted", "lobby_invite", "challenge_invite", "rank_promotion", "game_complete"] }).notNull(),
  title: text("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  data: text("data", { mode: "json" }),
  isRead: integer("isRead", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Reports ────────────────────────────────────────────────────────
export const reports = sqliteTable("reports", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  reporterId: integer("reporterId", { mode: "number" }).references(() => users.id).notNull(),
  reportedId: integer("reportedId", { mode: "number" }).references(() => users.id).notNull(),
  reason: text("reason", { enum: ["cheating", "harassment", "inappropriate_name", "other"] }).notNull(),
  details: text("details"),
  status: text("status", { enum: ["pending", "reviewed", "resolved", "dismissed"] }).default("pending").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  resolvedAt: integer("resolvedAt", { mode: "timestamp" }),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// ─── Challenge Attempts ─────────────────────────────────────────────
export const challengeAttempts = sqliteTable("challengeAttempts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  challengeId: integer("challengeId", { mode: "number" }).references(() => challenges.id).notNull(),
  userId: integer("userId", { mode: "number" }).references(() => users.id).notNull(),
  score: integer("score").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export type ChallengeAttempt = typeof challengeAttempts.$inferSelect;
export type InsertChallengeAttempt = typeof challengeAttempts.$inferInsert;
