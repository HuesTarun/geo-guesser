import { getDb } from "../queries/connection";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { locations } from "../../db/schema";
import { allSeedLocations } from "../../db/locations-data";
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

  // 2. Seed initial and new locations, and update streetViewId from seed data
  try {
    console.log("[DB] Syncing locations database...");
    let addedCount = 0;
    let updatedCount = 0;
    for (const loc of allSeedLocations) {
      const exists = await db
        .select({ id: locations.id, streetViewId: locations.streetViewId })
        .from(locations)
        .where(
          sql`abs(${locations.lat} - ${loc.lat}) < 0.0001 AND abs(${locations.lng} - ${loc.lng}) < 0.0001`
        )
        .limit(1);

      if (exists.length === 0) {
        await db.insert(locations).values(loc);
        addedCount++;
      } else if (loc.streetViewId && (!exists[0].streetViewId || exists[0].streetViewId === "")) {
        // Update existing row with streetViewId from seed data if it doesn't have one
        await db
          .update(locations)
          .set({ streetViewId: loc.streetViewId })
          .where(eq(locations.id, exists[0].id));
        updatedCount++;
        console.log(`[DB] Updated streetViewId for ${loc.city || loc.country} from seed data.`);
      }
    }
    if (addedCount > 0) {
      console.log(`[DB] Seeded ${addedCount} new locations successfully.`);
    }
    if (updatedCount > 0) {
      console.log(`[DB] Updated ${updatedCount} existing locations with Mapillary IDs from seed data.`);
    }
    if (addedCount === 0 && updatedCount === 0) {
      console.log("[DB] Locations database is up-to-date.");
    }

    // 3. Populate streetViewId using Mapillary if token is available
    const isPlaceholderToken = env.mapillaryAccessToken === "MLY|your_copied_client_token_here";
    if (env.mapillaryAccessToken && !isPlaceholderToken) {
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
              // Use lat/lng without radius — this is the correct working format.
              // The Mapillary v4 API returns the nearest image to the given coordinates.
              const mlyUrl = `https://graph.mapillary.com/images?access_token=${env.mapillaryAccessToken}&lat=${loc.lat}&lng=${loc.lng}&limit=1`;
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
                  console.log(`[DB] No Mapillary image found near location ${loc.city || loc.country} (id: ${loc.id})`);
                }
              } else {
                const errBody = await res.text().catch(() => "(unreadable)");
                console.error(`[DB] Mapillary API error for ${loc.city || loc.country}: ${res.status} ${res.statusText} — ${errBody.substring(0, 200)}`);
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
    } else if (isPlaceholderToken) {
      console.warn("[DB] WARNING: MAPILLARY_ACCESS_TOKEN is still set to the placeholder ('MLY|your_copied_client_token_here'). Please replace it with your actual Mapillary Client Token to enable interactive 3D street views!");
    } else {
      console.log("[DB] MAPILLARY_ACCESS_TOKEN not set; skipping streetViewId population.");
    }

    // 4. Only locations with street view are playable in games
    await db
      .update(locations)
      .set({ isActive: false })
      .where(sql`${locations.streetViewId} IS NULL OR ${locations.streetViewId} = ''`);

    await db
      .update(locations)
      .set({ isActive: true })
      .where(sql`${locations.streetViewId} IS NOT NULL AND ${locations.streetViewId} != ''`);

    const playableResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(locations)
      .where(
        sql`${locations.isActive} = true AND ${locations.streetViewId} IS NOT NULL AND ${locations.streetViewId} != ''`
      );

    const inactiveResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(locations)
      .where(eq(locations.isActive, false));

    console.log(
      `[DB] Playable locations (street view only): ${playableResult[0]?.count ?? 0}. ` +
        `Deactivated (no coverage): ${inactiveResult[0]?.count ?? 0}.`
    );
  } catch (err) {
    console.error("[DB] Error checking/seeding locations:", err);
  }
}
