import { localAuthRouter } from "./local-auth-router";
import { userRouter } from "./routers/user";
import { lobbyRouter } from "./routers/lobby";
import { gameRouter } from "./routers/game";
import { challengeRouter } from "./routers/challenge";
import { leaderboardRouter } from "./routers/leaderboard";
import { adminRouter } from "./routers/admin";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  localAuth: localAuthRouter,
  user: userRouter,
  lobby: lobbyRouter,
  game: gameRouter,
  challenge: challengeRouter,
  leaderboard: leaderboardRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
