export const seedLocations = [
  // Europe - Easy
  { lat: 48.8566, lng: 2.3522, country: "France", city: "Paris", region: "europe" as const, difficulty: "easy" as const },
  { lat: 51.5074, lng: -0.1278, country: "United Kingdom", city: "London", region: "europe" as const, difficulty: "easy" as const },
  { lat: 52.5200, lng: 13.4050, country: "Germany", city: "Berlin", region: "europe" as const, difficulty: "easy" as const },
  { lat: 41.9028, lng: 12.4964, country: "Italy", city: "Rome", region: "europe" as const, difficulty: "easy" as const },
  { lat: 40.4168, lng: -3.7038, country: "Spain", city: "Madrid", region: "europe" as const, difficulty: "easy" as const },
  // Europe - Medium
  { lat: 59.3293, lng: 18.0686, country: "Sweden", city: "Stockholm", region: "europe" as const, difficulty: "medium" as const },
  { lat: 55.6761, lng: 12.5683, country: "Denmark", city: "Copenhagen", region: "europe" as const, difficulty: "medium" as const },
  { lat: 47.4979, lng: 19.0402, country: "Hungary", city: "Budapest", region: "europe" as const, difficulty: "medium" as const },
  { lat: 50.0755, lng: 14.4378, country: "Czech Republic", city: "Prague", region: "europe" as const, difficulty: "medium" as const },
  { lat: 37.9838, lng: 23.7275, country: "Greece", city: "Athens", region: "europe" as const, difficulty: "medium" as const },
  // Europe - Hard
  { lat: 64.1466, lng: -21.9426, country: "Iceland", city: "Reykjavik", region: "europe" as const, difficulty: "hard" as const },
  { lat: 42.6977, lng: 23.3219, country: "Bulgaria", city: "Sofia", region: "europe" as const, difficulty: "hard" as const },
  { lat: 44.7866, lng: 20.4489, country: "Serbia", city: "Belgrade", region: "europe" as const, difficulty: "hard" as const },
  { lat: 53.9045, lng: 27.5615, country: "Belarus", city: "Minsk", region: "europe" as const, difficulty: "hard" as const },
  { lat: 41.3275, lng: 19.8187, country: "Albania", city: "Tirana", region: "europe" as const, difficulty: "hard" as const },

  // Asia - Easy
  { lat: 35.6762, lng: 139.6503, country: "Japan", city: "Tokyo", region: "asia" as const, difficulty: "easy" as const },
  { lat: 39.9042, lng: 116.4074, country: "China", city: "Beijing", region: "asia" as const, difficulty: "easy" as const },
  { lat: 28.6139, lng: 77.2090, country: "India", city: "New Delhi", region: "asia" as const, difficulty: "easy" as const },
  { lat: 37.5665, lng: 126.9780, country: "South Korea", city: "Seoul", region: "asia" as const, difficulty: "easy" as const },
  { lat: 1.3521, lng: 103.8198, country: "Singapore", city: "Singapore", region: "asia" as const, difficulty: "easy" as const },
  // Asia - Medium
  { lat: 13.7563, lng: 100.5018, country: "Thailand", city: "Bangkok", region: "asia" as const, difficulty: "medium" as const },
  { lat: 3.1390, lng: 101.6869, country: "Malaysia", city: "Kuala Lumpur", region: "asia" as const, difficulty: "medium" as const },
  { lat: 21.0285, lng: 105.8542, country: "Vietnam", city: "Hanoi", region: "asia" as const, difficulty: "medium" as const },
  { lat: 6.9271, lng: 79.8612, country: "Sri Lanka", city: "Colombo", region: "asia" as const, difficulty: "medium" as const },
  { lat: 34.0522, lng: 118.2437, country: "Philippines", city: "Manila", region: "asia" as const, difficulty: "medium" as const },
  // Asia - Hard
  { lat: 27.4728, lng: 89.6390, country: "Bhutan", city: "Thimphu", region: "asia" as const, difficulty: "hard" as const },
  { lat: 27.7172, lng: 85.3240, country: "Nepal", city: "Kathmandu", region: "asia" as const, difficulty: "hard" as const },
  { lat: 23.8103, lng: 90.4125, country: "Bangladesh", city: "Dhaka", region: "asia" as const, difficulty: "hard" as const },
  { lat: 41.2995, lng: 69.2401, country: "Uzbekistan", city: "Tashkent", region: "asia" as const, difficulty: "hard" as const },
  { lat: 11.5564, lng: 104.9282, country: "Cambodia", city: "Phnom Penh", region: "asia" as const, difficulty: "hard" as const },

  // North America - Easy
  { lat: 40.7128, lng: -74.0060, country: "United States", city: "New York", region: "north_america" as const, difficulty: "easy" as const },
  { lat: 34.0522, lng: -118.2437, country: "United States", city: "Los Angeles", region: "north_america" as const, difficulty: "easy" as const },
  { lat: 43.6532, lng: -79.3832, country: "Canada", city: "Toronto", region: "north_america" as const, difficulty: "easy" as const },
  { lat: 19.4326, lng: -99.1332, country: "Mexico", city: "Mexico City", region: "north_america" as const, difficulty: "easy" as const },
  { lat: 25.7617, lng: -80.1918, country: "United States", city: "Miami", region: "north_america" as const, difficulty: "easy" as const },
  // North America - Medium
  { lat: 45.5017, lng: -73.5673, country: "Canada", city: "Montreal", region: "north_america" as const, difficulty: "medium" as const },
  { lat: 29.7604, lng: -95.3698, country: "United States", city: "Houston", region: "north_america" as const, difficulty: "medium" as const },
  { lat: 47.6062, lng: -122.3321, country: "United States", city: "Seattle", region: "north_america" as const, difficulty: "medium" as const },
  { lat: 20.9674, lng: -89.5926, country: "Mexico", city: "Merida", region: "north_america" as const, difficulty: "medium" as const },
  { lat: 18.1096, lng: -77.2975, country: "Jamaica", city: "Kingston", region: "north_america" as const, difficulty: "medium" as const },
  // North America - Hard
  { lat: 64.8378, lng: -147.7164, country: "United States", city: "Fairbanks", region: "north_america" as const, difficulty: "hard" as const },
  { lat: 17.2510, lng: -88.7590, country: "Belize", city: "Belmopan", region: "north_america" as const, difficulty: "hard" as const },
  { lat: 14.6349, lng: -90.5069, country: "Guatemala", city: "Guatemala City", region: "north_america" as const, difficulty: "hard" as const },
  { lat: 13.6929, lng: -89.2182, country: "El Salvador", city: "San Salvador", region: "north_america" as const, difficulty: "hard" as const },
  { lat: 12.1696, lng: -68.9900, country: "Curacao", city: "Willemstad", region: "north_america" as const, difficulty: "hard" as const },

  // South America - Easy
  { lat: -23.5505, lng: -46.6333, country: "Brazil", city: "Sao Paulo", region: "south_america" as const, difficulty: "easy" as const },
  { lat: -34.6037, lng: -58.3816, country: "Argentina", city: "Buenos Aires", region: "south_america" as const, difficulty: "easy" as const },
  { lat: -33.4489, lng: -70.6693, country: "Chile", city: "Santiago", region: "south_america" as const, difficulty: "easy" as const },
  { lat: -12.0464, lng: -77.0428, country: "Peru", city: "Lima", region: "south_america" as const, difficulty: "easy" as const },
  { lat: 4.7110, lng: -74.0721, country: "Colombia", city: "Bogota", region: "south_america" as const, difficulty: "easy" as const },
  // South America - Medium
  { lat: -0.1807, lng: -78.4678, country: "Ecuador", city: "Quito", region: "south_america" as const, difficulty: "medium" as const },
  { lat: -16.5000, lng: -68.1500, country: "Bolivia", city: "La Paz", region: "south_america" as const, difficulty: "medium" as const },
  { lat: -25.2637, lng: -57.5759, country: "Paraguay", city: "Asuncion", region: "south_america" as const, difficulty: "medium" as const },
  { lat: -34.9011, lng: -56.1645, country: "Uruguay", city: "Montevideo", region: "south_america" as const, difficulty: "medium" as const },
  { lat: 6.8013, lng: -58.1551, country: "Guyana", city: "Georgetown", region: "south_america" as const, difficulty: "medium" as const },
  // South America - Hard
  { lat: 5.8520, lng: -55.2038, country: "Suriname", city: "Paramaribo", region: "south_america" as const, difficulty: "hard" as const },
  { lat: -3.7493, lng: -73.2494, country: "Peru", city: "Iquitos", region: "south_america" as const, difficulty: "hard" as const },
  { lat: -22.9068, lng: -43.1729, country: "Brazil", city: "Rio de Janeiro", region: "south_america" as const, difficulty: "hard" as const },
  { lat: -51.6230, lng: -69.2168, country: "Chile", city: "Punta Arenas", region: "south_america" as const, difficulty: "hard" as const },
  { lat: -54.8019, lng: -68.3029, country: "Argentina", city: "Ushuaia", region: "south_america" as const, difficulty: "hard" as const },

  // Africa - Easy
  { lat: -33.9249, lng: 18.4241, country: "South Africa", city: "Cape Town", region: "africa" as const, difficulty: "easy" as const },
  { lat: 30.0444, lng: 31.2357, country: "Egypt", city: "Cairo", region: "africa" as const, difficulty: "easy" as const },
  { lat: -1.2921, lng: 36.8219, country: "Kenya", city: "Nairobi", region: "africa" as const, difficulty: "easy" as const },
  { lat: 6.5244, lng: 3.3792, country: "Nigeria", city: "Lagos", region: "africa" as const, difficulty: "easy" as const },
  { lat: 33.5731, lng: -7.5898, country: "Morocco", city: "Casablanca", region: "africa" as const, difficulty: "easy" as const },
  // Africa - Medium
  { lat: 5.6037, lng: -0.1870, country: "Ghana", city: "Accra", region: "africa" as const, difficulty: "medium" as const },
  { lat: 36.7538, lng: 3.0588, country: "Algeria", city: "Algiers", region: "africa" as const, difficulty: "medium" as const },
  { lat: -18.8792, lng: 47.5079, country: "Madagascar", city: "Antananarivo", region: "africa" as const, difficulty: "medium" as const },
  { lat: 15.5007, lng: -14.4524, country: "Senegal", city: "Dakar", region: "africa" as const, difficulty: "medium" as const },
  { lat: -22.5609, lng: 17.0658, country: "Namibia", city: "Windhoek", region: "africa" as const, difficulty: "medium" as const },
  // Africa - Hard
  { lat: 0.3476, lng: 32.5825, country: "Uganda", city: "Kampala", region: "africa" as const, difficulty: "hard" as const },
  { lat: 12.3714, lng: -1.5197, country: "Burkina Faso", city: "Ouagadougou", region: "africa" as const, difficulty: "hard" as const },
  { lat: -4.4419, lng: 15.2663, country: "DR Congo", city: "Kinshasa", region: "africa" as const, difficulty: "hard" as const },
  { lat: 11.5721, lng: 43.1456, country: "Djibouti", city: "Djibouti", region: "africa" as const, difficulty: "hard" as const },
  { lat: -24.6282, lng: 25.9231, country: "Botswana", city: "Gaborone", region: "africa" as const, difficulty: "hard" as const },

  // Oceania - Easy
  { lat: -33.8688, lng: 151.2093, country: "Australia", city: "Sydney", region: "oceania" as const, difficulty: "easy" as const },
  { lat: -37.8136, lng: 144.9631, country: "Australia", city: "Melbourne", region: "oceania" as const, difficulty: "easy" as const },
  { lat: -36.8485, lng: 174.7633, country: "New Zealand", city: "Auckland", region: "oceania" as const, difficulty: "easy" as const },
  // Oceania - Medium
  { lat: -27.4698, lng: 153.0251, country: "Australia", city: "Brisbane", region: "oceania" as const, difficulty: "medium" as const },
  { lat: -31.9505, lng: 115.8605, country: "Australia", city: "Perth", region: "oceania" as const, difficulty: "medium" as const },
  { lat: -41.2865, lng: 174.7762, country: "New Zealand", city: "Wellington", region: "oceania" as const, difficulty: "medium" as const },
  // Oceania - Hard
  { lat: -17.7134, lng: 178.0650, country: "Fiji", city: "Suva", region: "oceania" as const, difficulty: "hard" as const },
  { lat: -9.4456, lng: 159.9729, country: "Solomon Islands", city: "Honiara", region: "oceania" as const, difficulty: "hard" as const },
  { lat: -21.1394, lng: -175.2018, country: "Tonga", city: "Nuku'alofa", region: "oceania" as const, difficulty: "hard" as const },
  { lat: -13.8507, lng: -171.7514, country: "Samoa", city: "Apia", region: "oceania" as const, difficulty: "hard" as const },
  { lat: -22.2744, lng: 166.4768, country: "New Caledonia", city: "Noumea", region: "oceania" as const, difficulty: "hard" as const },

  // Expert locations worldwide
  { lat: 78.2232, lng: 15.6267, country: "Svalbard", city: "Longyearbyen", region: "europe" as const, difficulty: "expert" as const },
  { lat: 71.7069, lng: -42.6043, country: "Greenland", city: "Nuuk", region: "north_america" as const, difficulty: "expert" as const },
  { lat: -54.2811, lng: 36.5092, country: "South Georgia", city: "Grytviken", region: "south_america" as const, difficulty: "expert" as const },
  { lat: -25.0667, lng: -130.1000, country: "Pitcairn Islands", city: "Adamstown", region: "oceania" as const, difficulty: "expert" as const },
  { lat: 7.8731, lng: 80.7718, country: "Maldives", city: "Male", region: "asia" as const, difficulty: "expert" as const },
];
