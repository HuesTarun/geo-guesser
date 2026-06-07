import { getDb } from "../queries/connection";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { locations } from "../../db/schema";
import { seedLocations } from "../../db/locations-data";
import path from "path";

export async function initializeDatabase() {
  console.log("[DB] Starting database initialization...");
  const db = getDb();

  // 1. Run migrations
  try {
    const migrationsFolder = path.resolve(process.cwd(), "db/migrations");
    console.log(`[DB] Running Drizzle migrations from: ${migrationsFolder}`);
    await migrate(db, { migrationsFolder });
    console.log("[DB] Database migrations applied successfully.");
  } catch (err) {
    console.error("[DB] Error applying database migrations:", err);
    throw err;
  }

  // 2. Seed initial locations if empty
  try {
    const existing = await db
      .select({ id: locations.id })
      .from(locations)
      .limit(1);

    if (existing.length === 0) {
      console.log("[DB] No locations found. Seeding initial locations...");
      for (const loc of seedLocations) {
        await db.insert(locations).values(loc).onConflictDoUpdate({
          target: locations.id,
          set: loc,
        });
      }
      console.log(`[DB] Seeded ${seedLocations.length} locations successfully.`);
    } else {
      console.log("[DB] Locations table already populated.");
    }
  } catch (err) {
    console.error("[DB] Error checking/seeding locations:", err);
  }
}
