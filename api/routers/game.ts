import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "../middleware";
import {
  createGame,
  getGameById,
  updateGame,
  createRound,
  getRoundById,
  updateRound,
  getRoundsByGameId,
  getRandomLocation,
  getGameHistory,
  updateUserStats,
  haversineDistance,
  calculateScore,
  addLeaderboardEntry,
} from "../queries/games";
import { TRPCError } from "@trpc/server";
import { getDb } from "../queries/connection";
import { challenges, challengeAttempts, locations } from "@db/schema";
import { eq } from "drizzle-orm";

export const gameRouter = createRouter({
  startSolo: authedQuery
    .input(
      z.object({
        mode: z.enum(["classic", "country_streak", "city_streak", "time_attack", "no_move", "no_pan", "no_zoom", "challenge"]),
        region: z.enum(["worldwide", "europe", "asia", "africa", "north_america", "south_america", "oceania"]).default("worldwide"),
        totalRounds: z.number().min(1).max(20).default(5),
        challengeCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const gameId = await createGame({
        userId: ctx.user!.id,
        mode: input.mode,
        region: input.region,
        totalRounds: input.totalRounds,
        currentRound: 0,
        totalScore: 0,
        maxPossibleScore: input.totalRounds * 5000,
        status: "in_progress",
        isMultiplayer: false,
        challengeCode: input.challengeCode || null,
      });

      // Get first location
      let firstLocationId: number | null = null;
      if (input.challengeCode) {
        const db = getDb();
        const challenge = await db
          .select()
          .from(challenges)
          .where(eq(challenges.code, input.challengeCode))
          .limit(1);

        if (challenge.length > 0) {
          const ch = challenge[0];
          try {
            const ids = typeof ch.locationIds === "string" ? JSON.parse(ch.locationIds) : ch.locationIds;
            if (Array.isArray(ids) && ids.length > 0) {
              firstLocationId = ids[0];
            }
          } catch (e) {
            console.error("Failed to parse challenge locationIds", e);
          }
        }
      }

      let location = null;
      if (firstLocationId !== null) {
        const db = getDb();
        const loc = await db
          .select()
          .from(locations)
          .where(eq(locations.id, firstLocationId))
          .limit(1);
        location = loc[0] || null;
      }

      if (!location) {
        location = await getRandomLocation(input.region);
      }

      if (!location) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No locations available" });

      const roundId = await createRound({
        gameId,
        roundNumber: 1,
        locationId: location.id,
        actualLat: location.lat,
        actualLng: location.lng,
      });

      return {
        gameId,
        roundId,
        roundNumber: 1,
        totalRounds: input.totalRounds,
        location: {
          lat: location.lat,
          lng: location.lng,
          country: location.country,
          city: location.city,
          imageUrl: location.imageUrl,
          difficulty: location.difficulty,
        },
        mode: input.mode,
        region: input.region,
      };
    }),

  getRound: authedQuery
    .input(z.object({ gameId: z.number() }))
    .query(async ({ input }) => {
      const game = await getGameById(input.gameId);
      if (!game) throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });

      const rounds = await getRoundsByGameId(input.gameId);
      const currentRound = rounds.find((r) => r.status === "in_progress");
      if (!currentRound) {
        // All rounds completed
        return { status: "completed", rounds };
      }

      return {
        status: "in_progress",
        round: {
          id: currentRound.id,
          roundNumber: currentRound.roundNumber,
          lat: currentRound.actualLat,
          lng: currentRound.actualLng,
        },
        totalScore: game.totalScore,
        roundNumber: currentRound.roundNumber,
        totalRounds: game.totalRounds,
      };
    }),

  submitGuess: authedQuery
    .input(
      z.object({
        gameId: z.number(),
        roundId: z.number(),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        timeTaken: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const round = await getRoundById(input.roundId);
      if (!round) throw new TRPCError({ code: "NOT_FOUND", message: "Round not found" });
      if (round.status !== "in_progress") throw new TRPCError({ code: "BAD_REQUEST", message: "Round already completed" });

      const distance = haversineDistance(
        input.lat, input.lng,
        round.actualLat, round.actualLng
      );
      const score = calculateScore(distance);

      await updateRound(input.roundId, {
        guessLat: input.lat,
        guessLng: input.lng,
        distance,
        score,
        timeTaken: input.timeTaken || null,
        status: "completed",
        completedAt: new Date(),
      });

      const game = await getGameById(input.gameId);
      if (!game) throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });

      const newTotalScore = game.totalScore + score;
      const newRoundNumber = game.currentRound + 1;

      await updateGame(input.gameId, {
        totalScore: newTotalScore,
        currentRound: newRoundNumber,
      });

      // Check if game is complete
      if (newRoundNumber >= game.totalRounds) {
        await updateGame(input.gameId, {
          status: "completed",
          completedAt: new Date(),
        });

        // Update user stats
        const allRounds = await getRoundsByGameId(input.gameId);
        const totalDistance = allRounds.reduce((sum, r) => sum + (r.distance || 0), 0);
        const avgDistance = totalDistance / allRounds.length;
        const maxPossible = game.totalRounds * 5000;
        const isWin = newTotalScore > maxPossible * 0.5;

        await updateUserStats(ctx.user!.id, newTotalScore, avgDistance, isWin);

        // Add to leaderboard
        await addLeaderboardEntry({
          userId: ctx.user!.id,
          category: "highest_score",
          score: newTotalScore,
          timeframe: "all_time",
          gameId: input.gameId,
        });

        // If it's a challenge, record the attempt
        if (game.challengeCode) {
          const db = getDb();
          const challenge = await db
            .select()
            .from(challenges)
            .where(eq(challenges.code, game.challengeCode))
            .limit(1);

          if (challenge.length > 0) {
            const ch = challenge[0];
            await db.insert(challengeAttempts).values({
              challengeId: ch.id,
              userId: ctx.user!.id,
              score: newTotalScore,
            });

            const updatedTimesPlayed = ch.timesPlayed + 1;
            const updatedBestScore = Math.max(ch.bestScore, newTotalScore);

            await db
              .update(challenges)
              .set({
                bestScore: updatedBestScore,
                timesPlayed: updatedTimesPlayed,
              })
              .where(eq(challenges.id, ch.id));
          }
        }

        return {
          distance: Math.round(distance),
          score,
          totalScore: newTotalScore,
          actualLocation: {
            lat: round.actualLat,
            lng: round.actualLng,
          },
          guessLocation: {
            lat: input.lat,
            lng: input.lng,
          },
          gameComplete: true,
          finalScore: newTotalScore,
        };
      }

      // Create next round
      let nextLocation = null;
      if (game.challengeCode) {
        const db = getDb();
        const challenge = await db
          .select()
          .from(challenges)
          .where(eq(challenges.code, game.challengeCode))
          .limit(1);

        if (challenge.length > 0) {
          const ch = challenge[0];
          try {
            const ids = typeof ch.locationIds === 'string' ? JSON.parse(ch.locationIds) : ch.locationIds;
            if (Array.isArray(ids) && newRoundNumber < ids.length) {
              const nextLocId = ids[newRoundNumber];
              const loc = await db
                .select()
                .from(locations)
                .where(eq(locations.id, nextLocId))
                .limit(1);
              nextLocation = loc[0] || null;
            }
          } catch (e) {
            console.error("Failed to parse challenge locationIds", e);
          }
        }
      }

      if (!nextLocation) {
        nextLocation = await getRandomLocation(game.region);
      }

      if (!nextLocation) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No locations available" });

      const nextRoundId = await createRound({
        gameId: input.gameId,
        roundNumber: newRoundNumber + 1,
        locationId: nextLocation.id,
        actualLat: nextLocation.lat,
        actualLng: nextLocation.lng,
      });

      return {
        distance: Math.round(distance),
        score,
        totalScore: newTotalScore,
        actualLocation: {
          lat: round.actualLat,
          lng: round.actualLng,
        },
        guessLocation: {
          lat: input.lat,
          lng: input.lng,
        },
        gameComplete: false,
        nextRound: {
          roundId: nextRoundId,
          roundNumber: newRoundNumber + 1,
          location: {
            lat: nextLocation.lat,
            lng: nextLocation.lng,
            country: nextLocation.country,
            city: nextLocation.city,
            imageUrl: nextLocation.imageUrl,
            difficulty: nextLocation.difficulty,
          },
        },
      };
    }),

  getResults: authedQuery
    .input(z.object({ gameId: z.number() }))
    .query(async ({ input }) => {
      const game = await getGameById(input.gameId);
      if (!game) throw new TRPCError({ code: "NOT_FOUND", message: "Game not found" });

      const rounds = await getRoundsByGameId(input.gameId);
      return {
        gameId: game.id,
        mode: game.mode,
        region: game.region,
        totalScore: game.totalScore,
        maxPossibleScore: game.maxPossibleScore,
        totalRounds: game.totalRounds,
        status: game.status,
        rounds: rounds.map((r) => ({
          roundNumber: r.roundNumber,
          guessLat: r.guessLat,
          guessLng: r.guessLng,
          actualLat: r.actualLat,
          actualLng: r.actualLng,
          distance: r.distance ? Math.round(r.distance) : null,
          score: r.score,
          timeTaken: r.timeTaken,
        })),
      };
    }),

  getHistory: authedQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      return getGameHistory(ctx.user!.id, input?.page || 1, input?.limit || 20);
    }),

  abandon: authedQuery
    .input(z.object({ gameId: z.number() }))
    .mutation(async ({ input }) => {
      await updateGame(input.gameId, { status: "abandoned" });
      return { success: true };
    }),

  // Challenge game
  startChallenge: publicQuery
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const challenge = await db
        .select()
        .from(challenges)
        .where(eq(challenges.code, input.code))
        .limit(1);

      if (challenge.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found" });
      }

      const ch = challenge[0];
      const locationIds = ch.locationIds as number[];

      // Get first location
      const location = await getRandomLocation();
      if (!location) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No locations available" });

      return {
        challengeCode: ch.code,
        totalRounds: ch.totalRounds,
        locationIds,
        firstLocation: {
          lat: location.lat,
          lng: location.lng,
          country: location.country,
          city: location.city,
        },
      };
    }),
});
