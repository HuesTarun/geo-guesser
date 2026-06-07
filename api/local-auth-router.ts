import { z } from "zod";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.APP_SECRET || "geotag-challenge-secret-key-2024"
);

async function createToken(userId: number, username: string) {
  return new jose.SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyLocalToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });
    return payload as { userId: number; username: string };
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        username: z.string().min(3).max(50),
        email: z.string().email().max(320),
        password: z.string().min(6).max(100),
        country: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      const existingEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingEmail.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);

      const result = await db.insert(users).values({
        username: input.username,
        email: input.email,
        passwordHash,
        name: input.username,
        country: input.country || null,
        role: "user",
        rank: "bronze",
        eloRating: 1000,
      }).returning({ id: users.id });

      const userId = Number(result[0].id);
      const token = await createToken(userId, input.username);

      return { success: true, token, userId };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const found = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (found.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid username or password",
        });
      }

      const user = found[0];

      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please login with OAuth",
        });
      }

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = await createToken(user.id, user.username!);

      await db
        .update(users)
        .set({ lastActiveAt: new Date(), isOnline: true })
        .where(eq(users.id, user.id));

      return { success: true, token, userId: user.id };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const authHeader = ctx.req.headers.get("x-local-auth-token");
    if (!authHeader) return null;

    const payload = await verifyLocalToken(authHeader);
    if (!payload) return null;

    const db = getDb();
    const found = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (found.length === 0) return null;

    const user = found[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      country: user.country,
      role: user.role,
      rank: user.rank,
      eloRating: user.eloRating,
      gamesPlayed: user.gamesPlayed,
      wins: user.wins,
      losses: user.losses,
      totalScore: user.totalScore,
      bestScore: user.bestScore,
      averageDistance: user.averageDistance,
      isOnline: user.isOnline,
      createdAt: user.createdAt,
    };
  }),
});
