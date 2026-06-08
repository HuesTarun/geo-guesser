/**
 * Seeds real Mapillary image IDs for all DB locations using the working lat/lng API.
 * Run: node scripts/seed-mapillary-ids.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
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
  console.error("❌ MAPILLARY_ACCESS_TOKEN not set in .env");
  process.exit(1);
}

console.log("=== Seeding Mapillary Image IDs for All Locations ===\n");
console.log(`Token: ${TOKEN.substring(0, 20)}...`);

try {
  const { default: postgres } = await import("postgres");
  const sql = postgres(DB_URL, { max: 3 });
  
  // Get all locations without streetViewId
  const locations = await sql`
    SELECT id, city, country, lat, lng 
    FROM locations 
    WHERE "streetViewId" IS NULL OR "streetViewId" = ''
    ORDER BY id
  `;
  
  console.log(`\nFound ${locations.length} locations without streetViewId.\n`);
  
  let updated = 0;
  let notFound = 0;
  let errors = 0;
  
  for (const loc of locations) {
    try {
      const url = `https://graph.mapillary.com/images?access_token=${TOKEN}&lat=${loc.lat}&lng=${loc.lng}&limit=1`;
      const res = await fetch(url);
      
      if (!res.ok) {
        const errText = await res.text().catch(() => "(unreadable)");
        console.log(`❌ API Error for ${loc.city || loc.country}: ${res.status} - ${errText.substring(0, 100)}`);
        errors++;
      } else {
        const data = await res.json();
        if (data.data && data.data.length > 0) {
          const imageId = data.data[0].id;
          await sql`
            UPDATE locations 
            SET "streetViewId" = ${imageId}
            WHERE id = ${loc.id}
          `;
          console.log(`✅ ${loc.city || loc.country}, ${loc.country}: ${imageId}`);
          updated++;
        } else {
          console.log(`⚠️  No image found for ${loc.city || loc.country}, ${loc.country}`);
          notFound++;
        }
      }
      
      // Rate limit: 200ms between requests
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.log(`❌ Error for ${loc.city || loc.country}: ${err.message}`);
      errors++;
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Not found: ${notFound}`);
  console.log(`   Errors: ${errors}`);
  
  // Final status
  const rows = await sql`SELECT COUNT(*) as count FROM locations WHERE "streetViewId" IS NOT NULL AND "streetViewId" != ''`;
  const total = await sql`SELECT COUNT(*) as count FROM locations`;
  console.log(`\n📊 DB Summary: ${rows[0].count}/${total[0].count} locations now have streetViewId`);
  
  await sql.end();
} catch (err) {
  console.error(`❌ Error: ${err.message}`);
}
