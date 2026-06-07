import { relations } from "drizzle-orm";
import {
  users,
  games,
  rounds,
  locations,
  lobbies,
  lobbyPlayers,
  friendships,
  messages,
  leaderboardEntries,
  challenges,
  notifications,
  reports,
  challengeAttempts,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  games: many(games),
  hostedLobbies: many(lobbies),
  lobbyParticipations: many(lobbyPlayers),
  sentFriendRequests: many(friendships, { relationName: "requester" }),
  receivedFriendRequests: many(friendships, { relationName: "addressee" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  leaderboardEntries: many(leaderboardEntries),
  notifications: many(notifications),
  sentReports: many(reports, { relationName: "reporter" }),
  receivedReports: many(reports, { relationName: "reported" }),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  user: one(users, { fields: [games.userId], references: [users.id] }),
  rounds: many(rounds),
  leaderboardEntries: many(leaderboardEntries),
}));

export const roundsRelations = relations(rounds, ({ one }) => ({
  game: one(games, { fields: [rounds.gameId], references: [games.id] }),
  location: one(locations, { fields: [rounds.locationId], references: [locations.id] }),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  rounds: many(rounds),
}));

export const lobbiesRelations = relations(lobbies, ({ one, many }) => ({
  host: one(users, { fields: [lobbies.hostId], references: [users.id] }),
  players: many(lobbyPlayers),
}));

export const lobbyPlayersRelations = relations(lobbyPlayers, ({ one }) => ({
  lobby: one(lobbies, { fields: [lobbyPlayers.lobbyId], references: [lobbies.id] }),
  user: one(users, { fields: [lobbyPlayers.userId], references: [users.id] }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, { fields: [friendships.requesterId], references: [users.id], relationName: "requester" }),
  addressee: one(users, { fields: [friendships.addresseeId], references: [users.id], relationName: "addressee" }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, { fields: [messages.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [messages.receiverId], references: [users.id], relationName: "receiver" }),
  lobby: one(lobbies, { fields: [messages.lobbyId], references: [lobbies.id] }),
}));

export const leaderboardEntriesRelations = relations(leaderboardEntries, ({ one }) => ({
  user: one(users, { fields: [leaderboardEntries.userId], references: [users.id] }),
  game: one(games, { fields: [leaderboardEntries.gameId], references: [games.id] }),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  creator: one(users, { fields: [challenges.creatorId], references: [users.id] }),
  attempts: many(challengeAttempts),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, { fields: [reports.reporterId], references: [users.id], relationName: "reporter" }),
  reported: one(users, { fields: [reports.reportedId], references: [users.id], relationName: "reported" }),
}));

export const challengeAttemptsRelations = relations(challengeAttempts, ({ one }) => ({
  challenge: one(challenges, { fields: [challengeAttempts.challengeId], references: [challenges.id] }),
  user: one(users, { fields: [challengeAttempts.userId], references: [users.id] }),
}));
