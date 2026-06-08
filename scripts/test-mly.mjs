const TOKEN = 'MLY|27114595088203811|ed160f6c9362a884885593dc661c7d89';

// Test the found Paris image ID
const imageId = '469160327525703';
const verifyRes = await fetch(`https://graph.mapillary.com/${imageId}?access_token=${TOKEN}&fields=id,thumb_256_url,computed_geometry`);
const data = await verifyRes.json();
console.log('Verification:', JSON.stringify(data, null, 2));

// Now test fetching for multiple cities
const cities = [
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Berlin", lat: 52.5200, lng: 13.4050 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Moscow", lat: 55.7558, lng: 37.6173 },
];

console.log("\n=== Fetching image IDs using lat/lng (no radius) ===\n");
for (const city of cities) {
  const url = `https://graph.mapillary.com/images?access_token=${TOKEN}&lat=${city.lat}&lng=${city.lng}&limit=1`;
  const res = await fetch(url);
  const d = await res.json();
  if (d.data && d.data.length > 0) {
    console.log(`✅ ${city.name}: ${d.data[0].id}`);
  } else {
    console.log(`❌ ${city.name}: ${JSON.stringify(d)}`);
  }
  await new Promise(r => setTimeout(r, 200));
}
