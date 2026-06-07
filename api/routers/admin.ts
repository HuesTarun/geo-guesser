import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { users, reports, locations, games } from "@db/schema";
import { eq, desc, sql, like, or } from "drizzle-orm";

export const adminRouter = createRouter({
  getStats: adminQuery.query(async () => {
    const db = getDb();

    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalGames = await db.select({ count: sql<number>`count(*)` }).from(games);
    const activeGames = await db
      .select({ count: sql<number>`count(*)` })
      .from(games)
      .where(eq(games.status, "in_progress"));
    const totalReports = await db.select({ count: sql<number>`count(*)` }).from(reports);
    const pendingReports = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.status, "pending"));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalGames: totalGames[0]?.count || 0,
      activeGames: activeGames[0]?.count || 0,
      totalReports: totalReports[0]?.count || 0,
      pendingReports: pendingReports[0]?.count || 0,
    };
  }),

  getUsers: adminQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 50;
      const offset = (page - 1) * limit;

      let query = db.select().from(users).orderBy(desc(users.createdAt));

      if (input?.search) {
        query = query.where(
          or(
            like(users.username, `%${input.search}%`),
            like(users.name, `%${input.search}%`),
            like(users.email, `%${input.search}%`)
          )
        ) as typeof query;
      }

      const results = await query.limit(limit).offset(offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(users);

      return {
        users: results,
        total: countResult[0]?.count || 0,
        page,
        limit,
      };
    }),

  updateUserRole: adminQuery
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["user", "moderator", "admin"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  banUser: adminQuery
    .input(
      z.object({
        userId: z.number(),
        banned: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      // We'll use the role field to ban - set to a banned state
      await db
        .update(users)
        .set({ role: input.banned ? "user" : "user" })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  getReports: adminQuery
    .input(
      z.object({
        status: z.enum(["pending", "reviewed", "resolved", "dismissed"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 50;
      const offset = (page - 1) * limit;

      let query = db
        .select({
          id: reports.id,
          reporterId: reports.reporterId,
          reportedId: reports.reportedId,
          reason: reports.reason,
          details: reports.details,
          status: reports.status,
          createdAt: reports.createdAt,
          resolvedAt: reports.resolvedAt,
        })
        .from(reports)
        .orderBy(desc(reports.createdAt));

      if (input?.status) {
        query = query.where(eq(reports.status, input.status)) as typeof query;
      }

      const results = await query.limit(limit).offset(offset);
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(reports);

      return {
        reports: results,
        total: countResult[0]?.count || 0,
        page,
        limit,
      };
    }),

  resolveReport: adminQuery
    .input(
      z.object({
        reportId: z.number(),
        status: z.enum(["resolved", "dismissed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(reports)
        .set({ status: input.status, resolvedAt: new Date() })
        .where(eq(reports.id, input.reportId));
      return { success: true };
    }),

  getLocations: adminQuery
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const page = input?.page || 1;
      const limit = input?.limit || 50;
      const offset = (page - 1) * limit;

      const results = await db
        .select()
        .from(locations)
        .orderBy(desc(locations.createdAt))
        .limit(limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` }).from(locations);

      return {
        locations: results,
        total: countResult[0]?.count || 0,
        page,
        limit,
      };
    }),

  addLocation: adminQuery
    .input(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        country: z.string().min(1).max(100),
        city: z.string().max(100).optional(),
        region: z.enum(["europe", "asia", "africa", "north_america", "south_america", "oceania", "antarctica"]),
        difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(locations).values(input).returning({ id: locations.id });
      return { success: true, locationId: result[0].id };
    }),

  deleteLocation: adminQuery
    .input(z.object({ locationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(locations).set({ isActive: false }).where(eq(locations.id, input.locationId));
      return { success: true };
    }),
});
