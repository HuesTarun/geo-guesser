/**
 * Verifies which streetViewIds in the DB are actually valid Mapillary images,
 * and clears invalid ones so they can be re-fetched.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
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

console.log("=== Verifying and Refreshing All streetViewIds ===\n");

const { default: postgres } = await import("postgres");
const sql = postgres(DB_URL, { max: 3 });

// Get all locations with a streetViewId
const locations = await sql`
  SELECT id, city, country, lat, lng, "streetViewId"
  FROM locations
  WHERE "streetViewId" IS NOT NULL AND "streetViewId" != ''
  ORDER BY id
`;

console.log(`Found ${locations.length} locations with streetViewIds to verify.\n`);

let valid = 0;
let invalid = 0;

for (const loc of locations) {
  // Verify each ID
  const verifyRes = await fetch(`https://graph.mapillary.com/${loc.streetViewId}?access_token=${TOKEN}&fields=id`);
  const d = await verifyRes.json();
  
  if (d.id) {
    console.log(`✅ Valid: ${loc.city || loc.country} → ${loc.streetViewId}`);
    valid++;
  } else {
    // Invalid ID - clear it and fetch a new one
    console.log(`❌ Invalid: ${loc.city || loc.country} → ${loc.streetViewId} (clearing...)`);
    
    // Fetch a new valid ID
    const fetchRes = await fetch(`https://graph.mapillary.com/images?access_token=${TOKEN}&lat=${loc.lat}&lng=${loc.lng}&limit=1`);
    const fetchData = await fetchRes.json();
    
    if (fetchData.data && fetchData.data.length > 0) {
      const newId = fetchData.data[0].id;
      await sql`UPDATE locations SET "streetViewId" = ${newId} WHERE id = ${loc.id}`;
      console.log(`   ↳ Updated to: ${newId}`);
      valid++;
    } else {
      await sql`UPDATE locations SET "streetViewId" = NULL WHERE id = ${loc.id}`;
      console.log(`   ↳ No replacement found, cleared.`);
      invalid++;
    }
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  await new Promise(r => setTimeout(r, 150));
}

const final = await sql`SELECT COUNT(*) as count FROM locations WHERE "streetViewId" IS NOT NULL AND "streetViewId" != ''`;
const total = await sql`SELECT COUNT(*) as count FROM locations`;
console.log(`\n📊 Final: ${final[0].count}/${total[0].count} locations have valid streetViewIds`);
console.log(`   Valid IDs verified: ${valid}`);
console.log(`   Invalid/Not found: ${invalid}`);

await sql.end();
