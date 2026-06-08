import { getDb } from "../queries/connection";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { locations } from "../../db/schema";
import { seedLocations } from "../../db/locations-data";
import { sql, eq } from "drizzle-orm";
import { env } from "./env";
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

  // 2. Seed initial and new locations
  try {
    console.log("[DB] Syncing locations database...");
    let addedCount = 0;
    for (const loc of seedLocations) {
      const exists = await db
        .select({ id: locations.id })
        .from(locations)
        .where(
          sql`abs(${locations.lat} - ${loc.lat}) < 0.0001 AND abs(${locations.lng} - ${loc.lng}) < 0.0001`
        )
        .limit(1);

      if (exists.length === 0) {
        await db.insert(locations).values(loc);
        addedCount++;
      }
    }
    if (addedCount > 0) {
      console.log(`[DB] Seeded ${addedCount} new locations successfully.`);
    } else {
      console.log("[DB] Locations database is up-to-date.");
    }

    // 3. Populate streetViewId using Mapillary if token is available
    if (env.mapillaryAccessToken) {
      try {
        console.log("[DB] Populating missing Mapillary streetViewIds...");
        const locationsWithoutStreetView = await db
          .select()
          .from(locations)
          .where(sql`${locations.streetViewId} IS NULL OR ${locations.streetViewId} = ''`);

        if (locationsWithoutStreetView.length > 0) {
          console.log(`[DB] Found ${locationsWithoutStreetView.length} locations without streetViewId.`);
          for (const loc of locationsWithoutStreetView) {
            try {
              const mlyUrl = `https://graph.mapillary.com/images?access_token=${env.mapillaryAccessToken}&lat=${loc.lat}&lng=${loc.lng}&radius=10000&limit=1`;
              const res = await fetch(mlyUrl);
              if (res.ok) {
                const data = (await res.json()) as any;
                if (data && data.data && data.data.length > 0) {
                  const imageId = data.data[0].id;
                  await db
                    .update(locations)
                    .set({ streetViewId: imageId })
                    .where(eq(locations.id, loc.id));
                  console.log(`[DB] Updated location ${loc.city || loc.country} (id: ${loc.id}) with Mapillary image ID: ${imageId}`);
                } else {
                  console.log(`[DB] No Mapillary image found within 10km for location ${loc.city || loc.country} (id: ${loc.id})`);
                }
              } else {
                console.error(`[DB] Mapillary API error: ${res.statusText}`);
              }
              // Sleep for 200ms to respect rate limits
              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (mlyErr) {
              console.error(`[DB] Failed to fetch Mapillary ID for location ${loc.id}:`, mlyErr);
            }
          }
        } else {
          console.log("[DB] All locations already have streetViewIds.");
        }
      } catch (err) {
        console.error("[DB] Error populating streetViewIds:", err);
      }
    } else {
      console.log("[DB] MAPILLARY_ACCESS_TOKEN not set; skipping streetViewId population.");
    }
  } catch (err) {
    console.error("[DB] Error checking/seeding locations:", err);
  }
}
