import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { lobbies, lobbyPlayers } from "@db/schema";
import type { InsertLobby, InsertLobbyPlayer } from "@db/schema";

export async function createLobby(data: InsertLobby) {
  const db = getDb();
  const result = await db.insert(lobbies).values(data).returning({ id: lobbies.id });
  return result[0].id;
}

export async function getLobbyByCode(code: string) {
  const db = getDb();
  const found = await db
    .select()
    .from(lobbies)
    .where(eq(lobbies.code, code))
    .limit(1);
  return found[0] || null;
}

export async function getLobbyById(id: number) {
  const db = getDb();
  const found = await db
    .select()
    .from(lobbies)
    .where(eq(lobbies.id, id))
    .limit(1);
  return found[0] || null;
}

export async function updateLobby(id: number, data: Partial<InsertLobby>) {
  const db = getDb();
  await db.update(lobbies).set(data).where(eq(lobbies.id, id));
}

export async function deleteLobby(id: number) {
  const db = getDb();
  await db.delete(lobbies).where(eq(lobbies.id, id));
}

export async function addLobbyPlayer(data: InsertLobbyPlayer) {
  const db = getDb();
  const result = await db.insert(lobbyPlayers).values(data).returning({ id: lobbyPlayers.id });
  return result[0].id;
}

export async function removeLobbyPlayer(lobbyId: number, userId: number) {
  const db = getDb();
  await db
    .delete(lobbyPlayers)
    .where(
      and(
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.userId, userId)
      )
    );
}

export async function getLobbyPlayers(lobbyId: number) {
  const db = getDb();
  return db
    .select()
    .from(lobbyPlayers)
    .where(eq(lobbyPlayers.lobbyId, lobbyId));
}

export async function updateLobbyPlayer(lobbyId: number, userId: number, data: Partial<InsertLobbyPlayer>) {
  const db = getDb();
  await db
    .update(lobbyPlayers)
    .set(data)
    .where(
      and(
        eq(lobbyPlayers.lobbyId, lobbyId),
        eq(lobbyPlayers.userId, userId)
      )
    );
}

export async function listPublicLobbies(region?: string, mode?: string) {
  const db = getDb();
  const conditions = [
    eq(lobbies.isPublic, true),
    eq(lobbies.status, "waiting"),
  ];

  if (region) {
    conditions.push(eq(lobbies.region, region as "worldwide" | "europe" | "asia" | "africa" | "north_america" | "south_america" | "oceania"));
  }
  if (mode) {
    conditions.push(eq(lobbies.mode, mode as "classic" | "country_streak" | "time_attack" | "no_move"));
  }

  return db
    .select()
    .from(lobbies)
    .where(and(...conditions))
    .orderBy(desc(lobbies.createdAt))
    .limit(50);
}

export function generateLobbyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
