import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import {
  createLobby,
  getLobbyByCode,
  getLobbyById,
  updateLobby,
  addLobbyPlayer,
  removeLobbyPlayer,
  getLobbyPlayers,
  updateLobbyPlayer,
  listPublicLobbies,
  generateLobbyCode,
} from "../queries/lobbies";
import { TRPCError } from "@trpc/server";

export const lobbyRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        name: z.string().min(1).max(100),
        region: z.enum(["worldwide", "europe", "asia", "africa", "north_america", "south_america", "oceania"]).default("worldwide"),
        mode: z.enum(["classic", "country_streak", "time_attack", "no_move"]).default("classic"),
        totalRounds: z.number().min(1).max(20).default(5),
        roundTime: z.number().min(30).max(300).default(120),
        allowMovement: z.boolean().default(true),
        isPublic: z.boolean().default(true),
        maxPlayers: z.number().min(2).max(16).default(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const code = generateLobbyCode();
      const lobbyId = await createLobby({
        ...input,
        hostId: ctx.user!.id,
        code,
      });

      await addLobbyPlayer({
        lobbyId,
        userId: ctx.user!.id,
        isHost: true,
        isReady: false,
      });

      const lobby = await getLobbyById(lobbyId);
      return { ...lobby, code };
    }),

  getByCode: authedQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const lobby = await getLobbyByCode(input.code);
      if (!lobby) throw new TRPCError({ code: "NOT_FOUND", message: "Lobby not found" });
      const players = await getLobbyPlayers(lobby.id);
      return { ...lobby, players };
    }),

  join: authedQuery
    .input(z.object({ code: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const lobby = await getLobbyByCode(input.code);
      if (!lobby) throw new TRPCError({ code: "NOT_FOUND", message: "Lobby not found" });
      if (lobby.status !== "waiting") throw new TRPCError({ code: "BAD_REQUEST", message: "Game already started" });
      if (lobby.currentPlayers >= lobby.maxPlayers) throw new TRPCError({ code: "BAD_REQUEST", message: "Lobby full" });

      const existingPlayers = await getLobbyPlayers(lobby.id);
      const alreadyJoined = existingPlayers.some((p) => p.userId === ctx.user!.id);
      if (alreadyJoined) return { success: true, lobby };

      await addLobbyPlayer({
        lobbyId: lobby.id,
        userId: ctx.user!.id,
        isHost: false,
        isReady: false,
      });

      await updateLobby(lobby.id, { currentPlayers: lobby.currentPlayers + 1 });

      const updatedLobby = await getLobbyById(lobby.id);
      return { success: true, lobby: updatedLobby };
    }),

  leave: authedQuery
    .input(z.object({ lobbyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const lobby = await getLobbyById(input.lobbyId);
      if (!lobby) return { success: false };

      await removeLobbyPlayer(input.lobbyId, ctx.user!.id);
      await updateLobby(input.lobbyId, { currentPlayers: Math.max(0, lobby.currentPlayers - 1) });

      if (lobby.currentPlayers <= 1) {
        await updateLobby(input.lobbyId, { status: "finished" });
      }

      return { success: true };
    }),

  setReady: authedQuery
    .input(z.object({ lobbyId: z.number(), ready: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await updateLobbyPlayer(input.lobbyId, ctx.user!.id, { isReady: input.ready });
      return { success: true };
    }),

  startGame: authedQuery
    .input(z.object({ lobbyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const lobby = await getLobbyById(input.lobbyId);
      if (!lobby) throw new TRPCError({ code: "NOT_FOUND", message: "Lobby not found" });
      if (lobby.hostId !== ctx.user!.id) throw new TRPCError({ code: "FORBIDDEN", message: "Only host can start" });

      await updateLobby(input.lobbyId, { status: "in_progress", startedAt: new Date() });
      return { success: true };
    }),

  updateSettings: authedQuery
    .input(
      z.object({
        lobbyId: z.number(),
        region: z.enum(["worldwide", "europe", "asia", "africa", "north_america", "south_america", "oceania"]).optional(),
        mode: z.enum(["classic", "country_streak", "time_attack", "no_move"]).optional(),
        totalRounds: z.number().min(1).max(20).optional(),
        roundTime: z.number().min(30).max(300).optional(),
        allowMovement: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const lobby = await getLobbyById(input.lobbyId);
      if (!lobby) throw new TRPCError({ code: "NOT_FOUND", message: "Lobby not found" });
      if (lobby.hostId !== ctx.user!.id) throw new TRPCError({ code: "FORBIDDEN", message: "Only host can change settings" });

      const { lobbyId, ...settings } = input;
      await updateLobby(lobbyId, settings);
      return { success: true };
    }),

  listPublic: authedQuery
    .input(
      z.object({
        region: z.string().optional(),
        mode: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return listPublicLobbies(input?.region, input?.mode);
    }),
});
