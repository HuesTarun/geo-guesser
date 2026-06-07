import { getDb } from "../api/queries/connection";
import { locations } from "./schema";

import { seedLocations } from "./locations-data";

async function seed() {
  const db = getDb();
  console.log("Seeding locations...");

  for (const loc of seedLocations) {
    await db.insert(locations).values(loc).onConflictDoUpdate({
      target: locations.id,
      set: loc,
    });
  }

  console.log(`Seeded ${seedLocations.length} locations.`);
}

seed().catch(console.error);
