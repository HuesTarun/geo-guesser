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

      if (input.category === "highest_elo") {
        const results = await db
          .select({
            id: users.id,
            userId: users.id,
            score: users.eloRating,
            timeframe: sql<string>`'all_time'`,
            createdAt: users.createdAt,
            userName: users.name,
            userUsername: users.username,
            userAvatar: users.avatar,
            userRank: users.rank,
            userCountry: users.country,
          })
          .from(users)
          .where(sql`${users.eloRating} > 0`)
          .orderBy(desc(users.eloRating))
          .limit(input.limit);
        return results;
      }

      if (input.category === "most_wins") {
        const results = await db
          .select({
            id: users.id,
            userId: users.id,
            score: users.wins,
            timeframe: sql<string>`'all_time'`,
            createdAt: users.createdAt,
            userName: users.name,
            userUsername: users.username,
            userAvatar: users.avatar,
            userRank: users.rank,
            userCountry: users.country,
          })
          .from(users)
          .where(sql`${users.wins} > 0`)
          .orderBy(desc(users.wins))
          .limit(input.limit);
        return results;
      }

      if (input.category === "best_accuracy") {
        const results = await db
          .select({
            id: users.id,
            userId: users.id,
            score: users.bestScore,
            timeframe: sql<string>`'all_time'`,
            createdAt: users.createdAt,
            userName: users.name,
            userUsername: users.username,
            userAvatar: users.avatar,
            userRank: users.rank,
            userCountry: users.country,
          })
          .from(users)
          .where(sql`${users.bestScore} > 0`)
          .orderBy(desc(users.bestScore))
          .limit(input.limit);
        return results;
      }

      // Default: highest_score (query leaderboardEntries with dynamic timeframe filtering)
      const conditions = [eq(leaderboardEntries.category, "highest_score")];
      const now = new Date();
      if (input.timeframe === "daily") {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        conditions.push(sql`${leaderboardEntries.createdAt} >= ${oneDayAgo}`);
      } else if (input.timeframe === "weekly") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        conditions.push(sql`${leaderboardEntries.createdAt} >= ${sevenDaysAgo}`);
      } else if (input.timeframe === "monthly") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        conditions.push(sql`${leaderboardEntries.createdAt} >= ${thirtyDaysAgo}`);
      }

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
        .where(and(...conditions))
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

      if (input.category === "highest_elo") {
        const results = await db
          .select({
            id: users.id,
            userId: users.id,
            score: users.eloRating,
            timeframe: sql<string>`'all_time'`,
            createdAt: users.createdAt,
            userName: users.name,
            userUsername: users.username,
            userAvatar: users.avatar,
            userRank: users.rank,
            userCountry: users.country,
          })
          .from(users)
          .where(and(sql`${users.eloRating} > 0`, eq(users.country, input.country)))
          .orderBy(desc(users.eloRating))
          .limit(input.limit);
        return results;
      }

      if (input.category === "most_wins") {
        const results = await db
          .select({
            id: users.id,
            userId: users.id,
            score: users.wins,
            timeframe: sql<string>`'all_time'`,
            createdAt: users.createdAt,
            userName: users.name,
            userUsername: users.username,
            userAvatar: users.avatar,
            userRank: users.rank,
            userCountry: users.country,
          })
          .from(users)
          .where(and(sql`${users.wins} > 0`, eq(users.country, input.country)))
          .orderBy(desc(users.wins))
          .limit(input.limit);
        return results;
      }

      if (input.category === "best_accuracy") {
        const results = await db
          .select({
            id: users.id,
            userId: users.id,
            score: users.bestScore,
            timeframe: sql<string>`'all_time'`,
            createdAt: users.createdAt,
            userName: users.name,
            userUsername: users.username,
            userAvatar: users.avatar,
            userRank: users.rank,
            userCountry: users.country,
          })
          .from(users)
          .where(and(sql`${users.bestScore} > 0`, eq(users.country, input.country)))
          .orderBy(desc(users.bestScore))
          .limit(input.limit);
        return results;
      }

      // Default: highest_score
      const conditions = [
        eq(leaderboardEntries.category, "highest_score"),
        eq(users.country, input.country),
      ];
      const now = new Date();
      if (input.timeframe === "daily") {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        conditions.push(sql`${leaderboardEntries.createdAt} >= ${oneDayAgo}`);
      } else if (input.timeframe === "weekly") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        conditions.push(sql`${leaderboardEntries.createdAt} >= ${sevenDaysAgo}`);
      } else if (input.timeframe === "monthly") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        conditions.push(sql`${leaderboardEntries.createdAt} >= ${thirtyDaysAgo}`);
      }

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
        .where(and(...conditions))
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
