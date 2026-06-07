import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { leaderboardEntries, users } from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const leaderboardRouter = createRouter({
  global: publicQuery
    .input(
      z.object({
        category: z.enum(["highest_score", "highest_elo", "most_wins", "best_accuracy"]),
        timeframe: z.enum(["daily", "weekly", "monthly", "all_time"]).default("all_time"),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      // Get entries with user info
      const entries = await db
        .select({
          id: leaderboardEntries.id,
          userId: leaderboardEntries.userId,
          score: leaderboardEntries.score,
          timeframe: leaderboardEntries.timeframe,
          createdAt: leaderboardEntries.createdAt,
          userName: users.name,
          userUsername: users.username,
          userAvatar: users.avatar,
          userRank: users.rank,
          userCountry: users.country,
        })
        .from(leaderboardEntries)
        .leftJoin(users, eq(leaderboardEntries.userId, users.id))
        .where(
          and(
            eq(leaderboardEntries.category, input.category),
            eq(leaderboardEntries.timeframe, input.timeframe)
          )
        )
        .orderBy(desc(leaderboardEntries.score))
        .limit(input.limit);

      return entries;
    }),

  country: publicQuery
    .input(
      z.object({
        country: z.string(),
        category: z.enum(["highest_score", "highest_elo", "most_wins", "best_accuracy"]),
        timeframe: z.enum(["daily", "weekly", "monthly", "all_time"]).default("all_time"),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();

      const entries = await db
        .select({
          id: leaderboardEntries.id,
          userId: leaderboardEntries.userId,
          score: leaderboardEntries.score,
          timeframe: leaderboardEntries.timeframe,
          createdAt: leaderboardEntries.createdAt,
          userName: users.name,
          userUsername: users.username,
          userAvatar: users.avatar,
          userRank: users.rank,
          userCountry: users.country,
        })
        .from(leaderboardEntries)
        .leftJoin(users, eq(leaderboardEntries.userId, users.id))
        .where(
          and(
            eq(leaderboardEntries.category, input.category),
            eq(leaderboardEntries.timeframe, input.timeframe),
            eq(users.country, input.country)
          )
        )
        .orderBy(desc(leaderboardEntries.score))
        .limit(input.limit);

      return entries;
    }),

  getRanks: publicQuery.query(async () => {
    const db = getDb();
    const rankCounts = await db
      .select({
        rank: users.rank,
        count: sql<number>`count(*)`,
      })
      .from(users)
      .groupBy(users.rank);

    return rankCounts;
  }),

  topByElo: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select({
          id: users.id,
          username: users.username,
          name: users.name,
          avatar: users.avatar,
          rank: users.rank,
          eloRating: users.eloRating,
          country: users.country,
          gamesPlayed: users.gamesPlayed,
          wins: users.wins,
        })
        .from(users)
        .orderBy(desc(users.eloRating))
        .limit(input?.limit || 50);
    }),
});
