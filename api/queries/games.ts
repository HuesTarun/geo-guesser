import { eq, desc, and, sql, notInArray } from "drizzle-orm";
import { getDb } from "./connection";
import { games, rounds, locations, users, leaderboardEntries } from "@db/schema";
import type { InsertGame, InsertRound } from "@db/schema";

export async function createGame(data: InsertGame) {
  const db = getDb();
  const result = await db.insert(games).values(data).returning({ id: games.id });
  return result[0].id;
}

export async function getGameById(id: number) {
  const db = getDb();
  const found = await db.select().from(games).where(eq(games.id, id)).limit(1);
  return found[0] || null;
}

export async function updateGame(id: number, data: Partial<InsertGame>) {
  const db = getDb();
  await db.update(games).set(data).where(eq(games.id, id));
}

export async function createRound(data: InsertRound) {
  const db = getDb();
  const result = await db.insert(rounds).values(data).returning({ id: rounds.id });
  return result[0].id;
}

export async function getRoundById(id: number) {
  const db = getDb();
  const found = await db.select().from(rounds).where(eq(rounds.id, id)).limit(1);
  return found[0] || null;
}

export async function updateRound(id: number, data: Partial<InsertRound>) {
  const db = getDb();
  await db.update(rounds).set(data).where(eq(rounds.id, id));
}

export async function getRoundsByGameId(gameId: number) {
  const db = getDb();
  return db.select().from(rounds).where(eq(rounds.gameId, gameId)).orderBy(rounds.roundNumber);
}

export async function getRandomLocation(region?: string, difficulty?: string, excludeIds?: number[]) {
  const db = getDb();
  const conditions = [];
  
  if (region && region !== "worldwide") {
    conditions.push(eq(locations.region, region as "europe" | "asia" | "africa" | "north_america" | "south_america" | "oceania"));
  }
  if (difficulty) {
    conditions.push(eq(locations.difficulty, difficulty as "easy" | "medium" | "hard" | "expert"));
  }
  if (excludeIds && excludeIds.length > 0) {
    conditions.push(notInArray(locations.id, excludeIds));
  }
  conditions.push(eq(locations.isActive, true));

  const query = conditions.length > 0
    ? db.select().from(locations).where(and(...conditions))
    : db.select().from(locations);

  const allLocations = await query;
  
  if (allLocations.length === 0) {
    // Fallback: return any location
    const fallback = await db.select().from(locations).limit(1);
    return fallback[0] || null;
  }

  const randomIndex = Math.floor(Math.random() * allLocations.length);
  return allLocations[randomIndex];
}

export async function getRandomLocations(region?: string, limit: number = 5, excludeIds?: number[]) {
  const db = getDb();
  const conditions = [];
  
  if (region && region !== "worldwide") {
    conditions.push(eq(locations.region, region as "europe" | "asia" | "africa" | "north_america" | "south_america" | "oceania"));
  }
  if (excludeIds && excludeIds.length > 0) {
    conditions.push(notInArray(locations.id, excludeIds));
  }
  conditions.push(eq(locations.isActive, true));

  const query = conditions.length > 0
    ? db.select().from(locations).where(and(...conditions))
    : db.select().from(locations);

  const allLocations = await query;
  
  if (allLocations.length === 0) {
    // Fallback: return limit locations
    return db.select().from(locations).limit(limit);
  }

  // Shuffle and limit
  const shuffled = [...allLocations].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

export async function getGameHistory(userId: number, page: number = 1, limit: number = 20) {
  const db = getDb();
  const offset = (page - 1) * limit;
  
  const results = await db
    .select()
    .from(games)
    .where(eq(games.userId, userId))
    .orderBy(desc(games.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(games)
    .where(eq(games.userId, userId));

  return {
    games: results,
    total: countResult[0]?.count || 0,
    page,
    limit,
  };
}

export async function addLeaderboardEntry(data: typeof leaderboardEntries.$inferInsert) {
  const db = getDb();
  await db.insert(leaderboardEntries).values(data);
}

export async function updateUserStats(userId: number, score: number, distance: number, isWin: boolean) {
  const db = getDb();
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) return;

  const u = user[0];
  const newGamesPlayed = u.gamesPlayed + 1;
  const newTotalScore = u.totalScore + score;
  const newBestScore = Math.max(u.bestScore, score);
  const newAvgDistance = ((u.averageDistance || 0) * u.gamesPlayed + distance) / newGamesPlayed;
  const newWins = isWin ? u.wins + 1 : u.wins;
  const newLosses = !isWin ? u.losses + 1 : u.losses;

  await db.update(users).set({
    gamesPlayed: newGamesPlayed,
    totalScore: newTotalScore,
    bestScore: newBestScore,
    averageDistance: newAvgDistance,
    wins: newWins,
    losses: newLosses,
  }).where(eq(users.id, userId));
}

// Scoring logic
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateScore(distanceInMeters: number): number {
  const MAX_SCORE = 5000;
  const MAX_DISTANCE = 15000000;

  if (distanceInMeters <= 0) return MAX_SCORE;
  if (distanceInMeters >= MAX_DISTANCE) return 0;

  const score = Math.round(
    MAX_SCORE * Math.exp(-3 * distanceInMeters / MAX_DISTANCE)
  );

  return Math.min(MAX_SCORE, Math.max(0, score));
}

export function getRankFromElo(elo: number): string {
  if (elo >= 3500) return "grandmaster";
  if (elo >= 3000) return "master";
  if (elo >= 2500) return "diamond";
  if (elo >= 2000) return "platinum";
  if (elo >= 1500) return "gold";
  if (elo >= 1000) return "silver";
  return "bronze";
}

export function calculateEloChange(playerElo: number, opponentElo: number, score: number, kFactor: number = 32): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  return Math.round(kFactor * (score - expectedScore));
}
