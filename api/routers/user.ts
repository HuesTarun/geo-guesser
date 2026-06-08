import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import {
  findUserById,
  updateUser,
  searchUsers,
  getUserStats,
  getFriends,
  getFriendRequestsWithDetails,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
  getChatHistory,
  sendMessage,
  getAllUsers,
} from "../queries/users";
import { TRPCError } from "@trpc/server";
import { getDb } from "../queries/connection";
import { friendships } from "@db/schema";
import { eq, or } from "drizzle-orm";

export const userRouter = createRouter({
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const user = await findUserById(input.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        country: user.country,
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

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        avatar: z.string().url().optional(),
        country: z.string().max(100).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user!.id;
      await updateUser(userId, input);
      return { success: true };
    }),

  search: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const usersList = await searchUsers(input.query, input.limit);
      if (!ctx?.user) {
        return usersList.map((u) => ({
          ...u,
          friendshipStatus: "none" as const,
          friendshipRequestId: undefined as number | undefined,
        }));
      }

      const db = getDb();
      const currentUserId = ctx.user.id;

      // Fetch all friendships involving the current user
      const userFriendships = await db
        .select()
        .from(friendships)
        .where(
          or(
            eq(friendships.requesterId, currentUserId),
            eq(friendships.addresseeId, currentUserId)
          )
        );

      return usersList.map((u) => {
        if (u.id === currentUserId) {
          return { ...u, friendshipStatus: "self" as const, friendshipRequestId: undefined as number | undefined };
        }

        const rel = userFriendships.find(
          (f) =>
            (f.requesterId === currentUserId && f.addresseeId === u.id) ||
            (f.requesterId === u.id && f.addresseeId === currentUserId)
        );

        let friendshipStatus: "none" | "friends" | "sent_pending" | "received_pending" = "none";
        if (rel) {
          if (rel.status === "accepted") {
            friendshipStatus = "friends";
          } else if (rel.status === "pending") {
            friendshipStatus = rel.requesterId === currentUserId ? "sent_pending" : "received_pending";
          }
        }

        return {
          ...u,
          friendshipStatus,
          friendshipRequestId: rel?.id,
        };
      });
    }),

  getStats: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const stats = await getUserStats(input.userId);
      if (!stats) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return stats;
    }),

  // Friends
  listFriends: authedQuery.query(async ({ ctx }) => {
    return getFriends(ctx.user!.id);
  }),

  friendRequests: authedQuery.query(async ({ ctx }) => {
    return getFriendRequestsWithDetails(ctx.user!.id);
  }),

  sendFriendRequest: authedQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user!.id === input.userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot add yourself" });
      }
      const result = await sendFriendRequest(ctx.user!.id, input.userId);
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: result.message });
      }
      return result;
    }),

  acceptFriendRequest: authedQuery
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ input }) => {
      return respondToFriendRequest(input.requestId, true);
    }),

  rejectFriendRequest: authedQuery
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ input }) => {
      return respondToFriendRequest(input.requestId, false);
    }),

  removeFriend: authedQuery
    .input(z.object({ friendId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return removeFriend(ctx.user!.id, input.friendId);
    }),

  // Chat
  getChatHistory: authedQuery
    .input(
      z.object({
        friendId: z.number(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return getChatHistory(ctx.user!.id, input.friendId, input.limit);
    }),

  sendMessage: authedQuery
    .input(
      z.object({
        receiverId: z.number(),
        content: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return sendMessage(ctx.user!.id, input.receiverId, input.content);
    }),

  // Admin
  getAll: authedQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user!.role !== "admin" && ctx.user!.role !== "moderator") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      return getAllUsers(input?.page || 1, input?.limit || 50, input?.search);
    }),
});
