import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
  serial,
} from "drizzle-orm/pg-core";
// ─── Users ──────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: text("unionId").unique(),
  email: text("email").unique(),
  username: text("username").unique(),
  passwordHash: text("passwordHash"),
  name: text("name"),
  avatar: text("avatar"),
  country: text("country"),
  role: text("role", { enum: ["user", "moderator", "admin"] }).default("user").notNull(),
  rank: text("rank", { enum: ["bronze", "silver", "gold", "platinum", "diamond", "master", "grandmaster"] }).default("bronze").notNull(),
  eloRating: integer("eloRating").default(1000).notNull(),
  gamesPlayed: integer("gamesPlayed").default(0).notNull(),
  wins: integer("wins").default(0).notNull(),
  losses: integer("losses").default(0).notNull(),
  totalScore: integer("totalScore").default(0).notNull(),
  bestScore: integer("bestScore").default(0).notNull(),
  averageDistance: doublePrecision("averageDistance").default(0),
  isOnline: boolean("isOnline").default(false).notNull(),
  lastActiveAt: timestamp("lastActiveAt", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Games ──────────────────────────────────────────────────────────
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id),
  mode: text("mode", { enum: ["classic", "country_streak", "city_streak", "time_attack", "no_move", "no_pan", "no_zoom", "challenge"] }).default("classic").notNull(),
  region: text("region", { enum: ["worldwide", "europe", "asia", "africa", "north_america", "south_america", "oceania"] }).default("worldwide").notNull(),
  totalRounds: integer("totalRounds").default(5).notNull(),
  currentRound: integer("currentRound").default(0).notNull(),
  totalScore: integer("totalScore").default(0).notNull(),
  maxPossibleScore: integer("maxPossibleScore").default(25000).notNull(),
  status: text("status", { enum: ["in_progress", "completed", "abandoned"] }).default("in_progress").notNull(),
  isMultiplayer: boolean("isMultiplayer").default(false).notNull(),
  lobbyCode: text("lobbyCode"),
  challengeCode: text("challengeCode"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

// ─── Rounds ─────────────────────────────────────────────────────────
export const rounds = pgTable("rounds", {
  id: serial("id").primaryKey(),
  gameId: integer("gameId").references(() => games.id).notNull(),
  roundNumber: integer("roundNumber").notNull(),
  locationId: integer("locationId").references(() => locations.id).notNull(),
  guessLat: doublePrecision("guessLat"),
  guessLng: doublePrecision("guessLng"),
  actualLat: doublePrecision("actualLat").notNull(),
  actualLng: doublePrecision("actualLng").notNull(),
  distance: doublePrecision("distance"),
  score: integer("score"),
  timeTaken: integer("timeTaken"),
  status: text("status", { enum: ["in_progress", "completed", "timed_out"] }).default("in_progress").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completedAt", { withTimezone: true }),
});

export type Round = typeof rounds.$inferSelect;
export type InsertRound = typeof rounds.$inferInsert;

// ─── Locations ──────────────────────────────────────────────────────
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  country: text("country").notNull(),
  city: text("city"),
  region: text("region", { enum: ["europe", "asia", "africa", "north_america", "south_america", "oceania", "antarctica"] }).notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard", "expert"] }).default("medium").notNull(),
  streetViewId: text("streetViewId"),
  imageUrl: text("imageUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  timesPlayed: integer("timesPlayed").default(0).notNull(),
  avgScore: doublePrecision("avgScore").default(0),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

// ─── Lobbies ────────────────────────────────────────────────────────
export const lobbies = pgTable("lobbies", {
  id: serial("id").primaryKey(),
  code: text("code").unique().notNull(),
  hostId: integer("hostId").references(() => users.id).notNull(),
  name: text("name").notNull(),
  region: text("region", { enum: ["worldwide", "europe", "asia", "africa", "north_america", "south_america", "oceania"] }).default("worldwide").notNull(),
  mode: text("mode", { enum: ["classic", "country_streak", "time_attack", "no_move"] }).default("classic").notNull(),
  totalRounds: integer("totalRounds").default(5).notNull(),
  roundTime: integer("roundTime").default(120).notNull(),
  allowMovement: boolean("allowMovement").default(true).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  status: text("status", { enum: ["waiting", "in_progress", "finished"] }).default("waiting").notNull(),
  maxPlayers: integer("maxPlayers").default(8).notNull(),
  currentPlayers: integer("currentPlayers").default(1).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  startedAt: timestamp("startedAt", { withTimezone: true }),
  finishedAt: timestamp("finishedAt", { withTimezone: true }),
});

export type Lobby = typeof lobbies.$inferSelect;
export type InsertLobby = typeof lobbies.$inferInsert;

// ─── Lobby Players ──────────────────────────────────────────────────
export const lobbyPlayers = pgTable("lobbyPlayers", {
  id: serial("id").primaryKey(),
  lobbyId: integer("lobbyId").references(() => lobbies.id).notNull(),
  userId: integer("userId").references(() => users.id).notNull(),
  isReady: boolean("isReady").default(false).notNull(),
  isHost: boolean("isHost").default(false).notNull(),
  totalScore: integer("totalScore").default(0).notNull(),
  joinedAt: timestamp("joinedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type LobbyPlayer = typeof lobbyPlayers.$inferSelect;
export type InsertLobbyPlayer = typeof lobbyPlayers.$inferInsert;

// ─── Friendships ────────────────────────────────────────────────────
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: integer("requesterId").references(() => users.id).notNull(),
  addresseeId: integer("addresseeId").references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected", "blocked"] }).default("pending").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

// ─── Messages ───────────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("senderId").references(() => users.id).notNull(),
  receiverId: integer("receiverId").references(() => users.id),
  lobbyId: integer("lobbyId").references(() => lobbies.id),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ─── Leaderboard Entries ────────────────────────────────────────────
export const leaderboardEntries = pgTable("leaderboardEntries", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  category: text("category", { enum: ["highest_score", "highest_elo", "most_wins", "best_accuracy"] }).notNull(),
  score: integer("score").notNull(),
  region: text("region"),
  timeframe: text("timeframe", { enum: ["daily", "weekly", "monthly", "all_time"] }).default("all_time").notNull(),
  gameId: integer("gameId").references(() => games.id),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboardEntries.$inferInsert;

// ─── Challenges ─────────────────────────────────────────────────────
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  code: text("code").unique().notNull(),
  creatorId: integer("creatorId").references(() => users.id).notNull(),
  locationIds: jsonb("locationIds").notNull(),
  totalRounds: integer("totalRounds").default(5).notNull(),
  bestScore: integer("bestScore").default(0).notNull(),
  timesPlayed: integer("timesPlayed").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

// ─── Notifications ──────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id).notNull(),
  type: text("type", { enum: ["friend_request", "friend_accepted", "lobby_invite", "challenge_invite", "rank_promotion", "game_complete"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ─── Reports ────────────────────────────────────────────────────────
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporterId").references(() => users.id).notNull(),
  reportedId: integer("reportedId").references(() => users.id).notNull(),
  reason: text("reason", { enum: ["cheating", "harassment", "inappropriate_name", "other"] }).notNull(),
  details: text("details"),
  status: text("status", { enum: ["pending", "reviewed", "resolved", "dismissed"] }).default("pending").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt", { withTimezone: true }),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// ─── Challenge Attempts ─────────────────────────────────────────────
export const challengeAttempts = pgTable("challengeAttempts", {
  id: serial("id").primaryKey(),
  challengeId: integer("challengeId").references(() => challenges.id).notNull(),
  userId: integer("userId").references(() => users.id).notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type ChallengeAttempt = typeof challengeAttempts.$inferSelect;
export type InsertChallengeAttempt = typeof challengeAttempts.$inferInsert;
