/**
 * Fetches Mapillary IDs for locations missing street view, then marks only
 * street-view locations as playable (isActive=true).
 * Run: npm run db:sync-streetview
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  envVars[key] = value;
}

const TOKEN = envVars.MAPILLARY_ACCESS_TOKEN;
const DB_URL = envVars.DATABASE_URL;

if (!TOKEN) {
  console.error("MAPILLARY_ACCESS_TOKEN not set in .env");
  process.exit(1);
}
if (!DB_URL) {
  console.error("DATABASE_URL not set in .env");
  process.exit(1);
}

const { default: postgres } = await import("postgres");
const sql = postgres(DB_URL, { max: 3 });

console.log("=== Syncing playable street-view locations ===\n");

const missing = await sql`
  SELECT id, city, country, lat, lng
  FROM locations
  WHERE "streetViewId" IS NULL OR "streetViewId" = ''
  ORDER BY id
`;

console.log(`Fetching Mapillary IDs for ${missing.length} locations...\n`);

let updated = 0;
for (const loc of missing) {
  try {
    const url = `https://graph.mapillary.com/images?access_token=${TOKEN}&lat=${loc.lat}&lng=${loc.lng}&limit=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.data?.length > 0) {
        await sql`UPDATE locations SET "streetViewId" = ${data.data[0].id} WHERE id = ${loc.id}`;
        console.log(`  + ${loc.city || loc.country}`);
        updated++;
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  } catch (err) {
    console.warn(`  ! ${loc.city || loc.country}: ${err.message}`);
  }
}

await sql`
  UPDATE locations SET "isActive" = false
  WHERE "streetViewId" IS NULL OR "streetViewId" = ''
`;
await sql`
  UPDATE locations SET "isActive" = true
  WHERE "streetViewId" IS NOT NULL AND "streetViewId" != ''
`;

const [{ playable }] = await sql`
  SELECT COUNT(*)::int AS playable FROM locations
  WHERE "isActive" = true AND "streetViewId" IS NOT NULL AND "streetViewId" != ''
`;
const [{ inactive }] = await sql`
  SELECT COUNT(*)::int AS inactive FROM locations WHERE "isActive" = false
`;

console.log(`\nDone. New Mapillary IDs: ${updated}`);
console.log(`Playable (street view): ${playable}`);
console.log(`Deactivated (no coverage): ${inactive}`);

await sql.end();
