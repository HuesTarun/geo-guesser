import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { challenges, challengeAttempts, users } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

function generateChallengeCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const challengeRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        locationIds: z.array(z.number()).min(1).max(20),
        totalRounds: z.number().min(1).max(20).default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const code = generateChallengeCode();

      await db.insert(challenges).values({
        code,
        creatorId: ctx.user!.id,
        locationIds: input.locationIds,
        totalRounds: input.totalRounds,
      });

      return { code };
    }),

  getByCode: publicQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const found = await db
        .select()
        .from(challenges)
        .where(eq(challenges.code, input.code))
        .limit(1);

      if (found.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
      }

      const ch = found[0];
      return {
        code: ch.code,
        totalRounds: ch.totalRounds,
        bestScore: ch.bestScore,
        timesPlayed: ch.timesPlayed,
        createdAt: ch.createdAt,
      };
    }),

  submitScore: authedQuery
    .input(
      z.object({
        code: z.string(),
        score: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const found = await db
        .select()
        .from(challenges)
        .where(eq(challenges.code, input.code))
        .limit(1);

      if (found.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
      }

      const ch = found[0];

      await db.insert(challengeAttempts).values({
        challengeId: ch.id,
        userId: ctx.user!.id,
        score: input.score,
      });

      if (input.score > ch.bestScore) {
        await db
          .update(challenges)
          .set({ bestScore: input.score, timesPlayed: ch.timesPlayed + 1 })
          .where(eq(challenges.id, ch.id));
      } else {
        await db
          .update(challenges)
          .set({ timesPlayed: ch.timesPlayed + 1 })
          .where(eq(challenges.id, ch.id));
      }

      return { success: true };
    }),

  getLeaderboard: publicQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const found = await db
        .select()
        .from(challenges)
        .where(eq(challenges.code, input.code))
        .limit(1);

      if (found.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
      }

      const attempts = await db
        .select({
          id: challengeAttempts.id,
          userId: challengeAttempts.userId,
          score: challengeAttempts.score,
          createdAt: challengeAttempts.createdAt,
          userUsername: users.username,
          userName: users.name,
        })
        .from(challengeAttempts)
        .leftJoin(users, eq(challengeAttempts.userId, users.id))
        .where(eq(challengeAttempts.challengeId, found[0].id))
        .orderBy(desc(challengeAttempts.score))
        .limit(50);

      return {
        challenge: found[0],
        leaderboard: attempts,
      };
    }),
});
