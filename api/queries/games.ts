import { eq, desc, and, sql, notInArray, inArray } from "drizzle-orm";
import { getDb } from "./connection";
import { games, rounds, locations, users, leaderboardEntries } from "@db/schema";
import type { InsertGame, InsertRound } from "@db/schema";
import { hasStreetViewCondition } from "./location-filters";

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
  conditions.push(hasStreetViewCondition());

  const allLocations = await db.select().from(locations).where(and(...conditions));

  if (allLocations.length === 0) return null;

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
  conditions.push(hasStreetViewCondition());

  const allLocations = await db.select().from(locations).where(and(...conditions));

  if (allLocations.length === 0) return [];

  const shuffled = [...allLocations].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, limit);
}

export async function countPlayableLocations(region?: string) {
  const db = getDb();
  const conditions = [eq(locations.isActive, true), hasStreetViewCondition()];

  if (region && region !== "worldwide") {
    conditions.push(
      eq(locations.region, region as "europe" | "asia" | "africa" | "north_america" | "south_america" | "oceania")
    );
  }

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(locations)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
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

export async function updateUserStats(userId: number, score: number, distance: number, isWin: boolean, maxPossibleScore: number = 25000) {
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

  const eloChange = Math.round((score - (maxPossibleScore * 0.5)) / 100);
  const clampedEloChange = Math.max(-50, Math.min(50, eloChange));
  const newElo = Math.max(100, u.eloRating + clampedEloChange);
  const newRank = getRankFromElo(newElo) as "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master" | "grandmaster";

  await db.update(users).set({
    gamesPlayed: newGamesPlayed,
    totalScore: newTotalScore,
    bestScore: newBestScore,
    averageDistance: newAvgDistance,
    wins: newWins,
    losses: newLosses,
    eloRating: newElo,
    rank: newRank,
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

export async function updateMultiplayerGameResults(playerResults: Array<{ userId: number; score: number }>) {
  const db = getDb();
  if (playerResults.length === 0) return;

  const userIds = playerResults.map((p) => p.userId);
  const dbUsers = await db.select().from(users).where(inArray(users.id, userIds));
  const userMap = new Map(dbUsers.map((u) => [u.id, u]));

  const eloChanges = new Map<number, number>();
  for (const userId of userIds) {
    eloChanges.set(userId, 0);
  }

  const N = playerResults.length;
  if (N > 1) {
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const pA = playerResults[i];
        const pB = playerResults[j];
        const uA = userMap.get(pA.userId);
        const uB = userMap.get(pB.userId);
        if (!uA || !uB) continue;

        let scoreA = 0.5;
        if (pA.score > pB.score) scoreA = 1;
        else if (pA.score < pB.score) scoreA = 0;

        let scoreB = 1 - scoreA;

        const kFactor = 32 / (N - 1);
        const changeA = calculateEloChange(uA.eloRating, uB.eloRating, scoreA, kFactor);
        const changeB = calculateEloChange(uB.eloRating, uA.eloRating, scoreB, kFactor);

        eloChanges.set(pA.userId, (eloChanges.get(pA.userId) || 0) + changeA);
        eloChanges.set(pB.userId, (eloChanges.get(pB.userId) || 0) + changeB);
      }
    }
  } else if (N === 1) {
    const p = playerResults[0];
    const u = userMap.get(p.userId);
    if (u) {
      const eloChange = Math.round((p.score - 12500) / 100);
      eloChanges.set(p.userId, Math.max(-50, Math.min(50, eloChange)));
    }
  }

  const winnerUserId = playerResults[0].userId; // Sorted by score desc
  for (const p of playerResults) {
    const u = userMap.get(p.userId);
    if (!u) continue;

    const eloChange = eloChanges.get(p.userId) || 0;
    const newElo = Math.max(100, u.eloRating + eloChange);
    const newRank = getRankFromElo(newElo) as "bronze" | "silver" | "gold" | "platinum" | "diamond" | "master" | "grandmaster";

    const isWin = p.userId === winnerUserId;
    const newWins = isWin ? u.wins + 1 : u.wins;
    const newLosses = !isWin ? u.losses + 1 : u.losses;

    await db
      .update(users)
      .set({
        gamesPlayed: u.gamesPlayed + 1,
        wins: newWins,
        losses: newLosses,
        eloRating: newElo,
        rank: newRank,
        totalScore: u.totalScore + p.score,
        bestScore: Math.max(u.bestScore, p.score),
      })
      .where(eq(users.id, p.userId));
  }
}
