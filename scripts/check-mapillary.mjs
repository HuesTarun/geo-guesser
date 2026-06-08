/**
 * Diagnostic script: checks DB streetViewId status and tests Mapillary API directly.
 * Run: node scripts/check-mapillary.mjs
 */

import { createRequire } from "module";
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

console.log("=== Mapillary Diagnostic ===\n");
console.log(`Token present: ${!!TOKEN}`);
console.log(`Token starts with MLY|: ${TOKEN?.startsWith("MLY|")}`);
console.log(`Token length: ${TOKEN?.length}`);
console.log(`Token: ${TOKEN?.substring(0, 20)}...`);
console.log();

// Test Mapillary API with a known location (Paris, France)
const testLat = 48.8566;
const testLng = 2.3522;
const testUrl = `https://graph.mapillary.com/images?access_token=${TOKEN}&lat=${testLat}&lng=${testLng}&radius=1000&limit=3`;

console.log("Testing Mapillary API with Paris coordinates...");
console.log(`URL: ${testUrl.replace(TOKEN, "MLY|***")}\n`);

try {
  const res = await fetch(testUrl);
  const body = await res.text();
  console.log(`HTTP Status: ${res.status} ${res.statusText}`);
  
  try {
    const json = JSON.parse(body);
    if (json.data && json.data.length > 0) {
      console.log(`✅ SUCCESS: Found ${json.data.length} images near Paris`);
      console.log(`   First image ID: ${json.data[0].id}`);
    } else if (json.error) {
      console.log(`❌ API ERROR: ${json.error.message}`);
      console.log(`   Error type: ${json.error.type}`);
      console.log(`   Full error: ${JSON.stringify(json.error, null, 2)}`);
    } else {
      console.log("⚠️  No images found:", JSON.stringify(json, null, 2));
    }
  } catch (e) {
    console.log("Raw response:", body.substring(0, 500));
  }
} catch (err) {
  console.log(`❌ NETWORK ERROR: ${err.message}`);
}

// Test DB connection
console.log("\n--- Testing Database ---");
try {
  const { default: postgres } = await import("postgres");
  const sql = postgres(DB_URL, { max: 1, connect_timeout: 10 });
  
  const rows = await sql`
    SELECT id, city, country, lat, lng, 
           CASE WHEN "streetViewId" IS NULL OR "streetViewId" = '' THEN 'MISSING' ELSE 'HAS_ID' END as status,
           SUBSTRING("streetViewId", 1, 20) as street_view_preview
    FROM locations 
    ORDER BY id 
    LIMIT 20
  `;
  
  console.log(`Found ${rows.length} locations in DB:\n`);
  for (const row of rows) {
    const preview = row.street_view_preview ? row.street_view_preview + "..." : "none";
    const icon = row.status === "HAS_ID" ? "✅" : "❌";
    console.log(`  ${icon} [${row.id}] ${row.city || "?"}, ${row.country} → ${preview}`);
  }
  
  const [{ count }] = await sql`SELECT COUNT(*) FROM locations WHERE "streetViewId" IS NOT NULL AND "streetViewId" != ''`;
  const [{ total }] = await sql`SELECT COUNT(*) FROM locations`;
  console.log(`\n📊 Summary: ${count}/${total} locations have streetViewId`);
  
  await sql.end();
} catch (err) {
  console.log(`❌ DB ERROR: ${err.message}`);
}
