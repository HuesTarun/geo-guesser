import { getDb } from "../api/queries/connection";
import { locations } from "./schema";

import { allSeedLocations } from "./locations-data";

async function seed() {
  const db = getDb();
  console.log("Seeding locations...");

  for (const loc of allSeedLocations) {
    await db.insert(locations).values(loc).onConflictDoUpdate({
      target: locations.id,
      set: loc,
    });
  }

  console.log(`Seeded ${allSeedLocations.length} locations.`);
}

seed().catch(console.error);
