import { eq, like, or, and, sql, desc, inArray } from "drizzle-orm";
import { getDb } from "./connection";
import { users, friendships, messages } from "@db/schema";
import type { InsertUser } from "@db/schema";

export async function findUserByUnionId(unionId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return rows.at(0) || null;
}

export async function findUserByUsername(username: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return rows.at(0) || null;
}

export async function upsertUser(data: InsertUser) {
  const db = getDb();
  await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.unionId,
      set: data,
    });
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = getDb();
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function searchUsers(query: string, limit: number = 20) {
  const db = getDb();
  return db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      rank: users.rank,
      eloRating: users.eloRating,
      isOnline: users.isOnline,
    })
    .from(users)
    .where(
      or(
        like(users.username, `%${query}%`),
        like(users.name, `%${query}%`)
      )
    )
    .limit(limit);
}

export async function getUserStats(userId: number) {
  const user = await findUserById(userId);
  if (!user) return null;

  return {
    gamesPlayed: user.gamesPlayed,
    wins: user.wins,
    losses: user.losses,
    winRate: user.gamesPlayed > 0 ? ((user.wins / user.gamesPlayed) * 100).toFixed(1) : "0",
    totalScore: user.totalScore,
    bestScore: user.bestScore,
    averageScore: user.gamesPlayed > 0 ? Math.round(user.totalScore / user.gamesPlayed) : 0,
    averageDistance: user.averageDistance ? Math.round(user.averageDistance / 1000) : 0,
    rank: user.rank,
    eloRating: user.eloRating,
  };
}

export async function getFriends(userId: number) {
  const db = getDb();
  
  const sent = await db
    .select({
      id: friendships.id,
      friendId: friendships.addresseeId,
      status: friendships.status,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.requesterId, userId),
        eq(friendships.status, "accepted")
      )
    );

  const received = await db
    .select({
      id: friendships.id,
      friendId: friendships.requesterId,
      status: friendships.status,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "accepted")
      )
    );

  const allFriendIds = [...sent, ...received].map((f) => f.friendId);

  if (allFriendIds.length === 0) return [];

  const friendsList = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      rank: users.rank,
      eloRating: users.eloRating,
      isOnline: users.isOnline,
      lastActiveAt: users.lastActiveAt,
    })
    .from(users)
    .where(inArray(users.id, allFriendIds));

  return friendsList;
}

export async function getFriendRequests(userId: number) {
  const db = getDb();
  return db
    .select({
      id: friendships.id,
      requesterId: friendships.requesterId,
      status: friendships.status,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .where(
      and(
        eq(friendships.addresseeId, userId),
        eq(friendships.status, "pending")
      )
    );
}

export async function getFriendRequestsWithDetails(userId: number) {
  const db = getDb();
  const requests = await getFriendRequests(userId);
  
  if (requests.length === 0) return [];

  const requesterIds = requests.map((r) => r.requesterId);
  const requesters = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      rank: users.rank,
    })
    .from(users)
    .where(inArray(users.id, requesterIds));

  return requests.map((req) => ({
    ...req,
    requester: requesters.find((r) => r.id === req.requesterId),
  }));
}

export async function sendFriendRequest(requesterId: number, addresseeId: number) {
  const db = getDb();
  
  const existing = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, requesterId),
          eq(friendships.addresseeId, addresseeId)
        ),
        and(
          eq(friendships.requesterId, addresseeId),
          eq(friendships.addresseeId, requesterId)
        )
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: false, message: "Friend request already exists" };
  }

  await db.insert(friendships).values({
    requesterId,
    addresseeId,
    status: "pending",
  });

  return { success: true };
}

export async function respondToFriendRequest(requestId: number, accept: boolean) {
  const db = getDb();
  
  if (accept) {
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(eq(friendships.id, requestId));
  } else {
    await db
      .delete(friendships)
      .where(eq(friendships.id, requestId));
  }

  return { success: true };
}

export async function removeFriend(userId: number, friendId: number) {
  const db = getDb();
  
  await db
    .delete(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, userId),
          eq(friendships.addresseeId, friendId)
        ),
        and(
          eq(friendships.requesterId, friendId),
          eq(friendships.addresseeId, userId)
        )
      )
    );

  return { success: true };
}

export async function getChatHistory(userId: number, friendId: number, limit: number = 50) {
  const db = getDb();
  return db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      receiverId: messages.receiverId,
      content: messages.content,
      createdAt: messages.createdAt,
    })
    .from(messages)
    .where(
      or(
        and(
          eq(messages.senderId, userId),
          eq(messages.receiverId, friendId)
        ),
        and(
          eq(messages.senderId, friendId),
          eq(messages.receiverId, userId)
        )
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function sendMessage(senderId: number, receiverId: number, content: string) {
  const db = getDb();
  const result = await db.insert(messages).values({
    senderId,
    receiverId,
    content,
  }).returning({ id: messages.id });
  return result[0].id;
}

export async function getAllUsers(page: number = 1, limit: number = 50, search?: string) {
  const db = getDb();
  const offset = (page - 1) * limit;
  
  let query = db.select().from(users);
  
  if (search) {
    query = query.where(
      or(
        like(users.username, `%${search}%`),
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
    ) as typeof query;
  }
  
  const results = await query.limit(limit).offset(offset).orderBy(desc(users.createdAt));
  
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  
  return {
    users: results,
    total: countResult[0]?.count || 0,
    page,
    limit,
  };
}
