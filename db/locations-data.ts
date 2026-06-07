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

  // New Europe - Easy
  { lat: 41.3851, lng: 2.1734, country: "Spain", city: "Barcelona", region: "europe" as const, difficulty: "easy" as const },
  { lat: 52.3676, lng: 4.9041, country: "Netherlands", city: "Amsterdam", region: "europe" as const, difficulty: "easy" as const },
  { lat: 48.2082, lng: 16.3738, country: "Austria", city: "Vienna", region: "europe" as const, difficulty: "easy" as const },
  { lat: 50.8503, lng: 4.3517, country: "Belgium", city: "Brussels", region: "europe" as const, difficulty: "easy" as const },
  { lat: 53.3498, lng: -6.2603, country: "Ireland", city: "Dublin", region: "europe" as const, difficulty: "easy" as const },
  // New Europe - Medium
  { lat: 38.7223, lng: -9.1393, country: "Portugal", city: "Lisbon", region: "europe" as const, difficulty: "medium" as const },
  { lat: 52.2297, lng: 21.0122, country: "Poland", city: "Warsaw", region: "europe" as const, difficulty: "medium" as const },
  { lat: 60.1699, lng: 24.9384, country: "Finland", city: "Helsinki", region: "europe" as const, difficulty: "medium" as const },
  { lat: 59.9139, lng: 10.7522, country: "Norway", city: "Oslo", region: "europe" as const, difficulty: "medium" as const },
  { lat: 46.2044, lng: 6.1432, country: "Switzerland", city: "Geneva", region: "europe" as const, difficulty: "medium" as const },
  // New Europe - Hard
  { lat: 45.8150, lng: 15.9819, country: "Croatia", city: "Zagreb", region: "europe" as const, difficulty: "hard" as const },
  { lat: 48.1486, lng: 17.1077, country: "Slovakia", city: "Bratislava", region: "europe" as const, difficulty: "hard" as const },
  { lat: 46.0569, lng: 14.5058, country: "Slovenia", city: "Ljubljana", region: "europe" as const, difficulty: "hard" as const },
  { lat: 59.4370, lng: 24.7536, country: "Estonia", city: "Tallinn", region: "europe" as const, difficulty: "hard" as const },
  { lat: 56.9496, lng: 24.1052, country: "Latvia", city: "Riga", region: "europe" as const, difficulty: "hard" as const },
  { lat: 54.6872, lng: 25.2797, country: "Lithuania", city: "Vilnius", region: "europe" as const, difficulty: "hard" as const },

  // New Asia - Easy
  { lat: 34.6937, lng: 135.5023, country: "Japan", city: "Osaka", region: "asia" as const, difficulty: "easy" as const },
  { lat: 19.0760, lng: 72.8777, country: "India", city: "Mumbai", region: "asia" as const, difficulty: "easy" as const },
  { lat: 31.2304, lng: 121.4737, country: "China", city: "Shanghai", region: "asia" as const, difficulty: "easy" as const },
  { lat: 35.1796, lng: 129.0756, country: "South Korea", city: "Busan", region: "asia" as const, difficulty: "easy" as const },
  { lat: 22.3193, lng: 114.1694, country: "Hong Kong", city: "Hong Kong", region: "asia" as const, difficulty: "easy" as const },
  { lat: 25.0330, lng: 121.5654, country: "Taiwan", city: "Taipei", region: "asia" as const, difficulty: "easy" as const },
  // New Asia - Medium
  { lat: 35.0116, lng: 135.7681, country: "Japan", city: "Kyoto", region: "asia" as const, difficulty: "medium" as const },
  { lat: 12.9716, lng: 77.5946, country: "India", city: "Bengaluru", region: "asia" as const, difficulty: "medium" as const },
  { lat: -6.2088, lng: 106.8456, country: "Indonesia", city: "Jakarta", region: "asia" as const, difficulty: "medium" as const },
  { lat: 13.3633, lng: 103.8564, country: "Cambodia", city: "Siem Reap", region: "asia" as const, difficulty: "medium" as const },
  { lat: 10.8231, lng: 106.6297, country: "Vietnam", city: "Ho Chi Minh City", region: "asia" as const, difficulty: "medium" as const },
  // New Asia - Hard
  { lat: 47.8864, lng: 106.9057, country: "Mongolia", city: "Ulaanbaatar", region: "asia" as const, difficulty: "hard" as const },
  { lat: 23.5859, lng: 58.4059, country: "Oman", city: "Muscat", region: "asia" as const, difficulty: "hard" as const },
  { lat: 31.9454, lng: 35.9284, country: "Jordan", city: "Amman", region: "asia" as const, difficulty: "hard" as const },
  { lat: 43.2220, lng: 76.8512, country: "Kazakhstan", city: "Almaty", region: "asia" as const, difficulty: "hard" as const },
  { lat: 17.9757, lng: 102.6331, country: "Laos", city: "Vientiane", region: "asia" as const, difficulty: "hard" as const },

  // New North America - Easy
  { lat: 41.8781, lng: -87.6298, country: "United States", city: "Chicago", region: "north_america" as const, difficulty: "easy" as const },
  { lat: 37.7749, lng: -122.4194, country: "United States", city: "San Francisco", region: "north_america" as const, difficulty: "easy" as const },
  { lat: 49.2827, lng: -123.1207, country: "Canada", city: "Vancouver", region: "north_america" as const, difficulty: "easy" as const },
  { lat: 38.9072, lng: -77.0369, country: "United States", city: "Washington D.C.", region: "north_america" as const, difficulty: "easy" as const },
  { lat: 42.3601, lng: -71.0589, country: "United States", city: "Boston", region: "north_america" as const, difficulty: "easy" as const },
  // New North America - Medium
  { lat: 21.1619, lng: -86.8515, country: "Mexico", city: "Cancun", region: "north_america" as const, difficulty: "medium" as const },
  { lat: 20.6597, lng: -103.3496, country: "Mexico", city: "Guadalajara", region: "north_america" as const, difficulty: "medium" as const },
  { lat: 45.4215, lng: -75.6972, country: "Canada", city: "Ottawa", region: "north_america" as const, difficulty: "medium" as const },
  { lat: 51.0447, lng: -114.0719, country: "Canada", city: "Calgary", region: "north_america" as const, difficulty: "medium" as const },
  { lat: 9.9281, lng: -84.0907, country: "Costa Rica", city: "San Jose", region: "north_america" as const, difficulty: "medium" as const },
  // New North America - Hard
  { lat: 61.2181, lng: -149.9003, country: "United States", city: "Anchorage", region: "north_america" as const, difficulty: "hard" as const },
  { lat: 14.0723, lng: -87.1921, country: "Honduras", city: "Tegucigalpa", region: "north_america" as const, difficulty: "hard" as const },
  { lat: 12.1150, lng: -86.2362, country: "Nicaragua", city: "Managua", region: "north_america" as const, difficulty: "hard" as const },
  { lat: 8.9824, lng: -79.5199, country: "Panama", city: "Panama City", region: "north_america" as const, difficulty: "hard" as const },
  { lat: 25.0443, lng: -77.3504, country: "Bahamas", city: "Nassau", region: "north_america" as const, difficulty: "hard" as const },

  // New South America - Easy
  { lat: -15.7975, lng: -47.8919, country: "Brazil", city: "Brasilia", region: "south_america" as const, difficulty: "easy" as const },
  { lat: 6.2442, lng: -75.5812, country: "Colombia", city: "Medellin", region: "south_america" as const, difficulty: "easy" as const },
  { lat: -31.4201, lng: -64.1888, country: "Argentina", city: "Cordoba", region: "south_america" as const, difficulty: "easy" as const },
  { lat: -13.5319, lng: -71.9675, country: "Peru", city: "Cusco", region: "south_america" as const, difficulty: "easy" as const },
  { lat: 10.4806, lng: -66.9036, country: "Venezuela", city: "Caracas", region: "south_america" as const, difficulty: "easy" as const },
  // New South America - Medium
  { lat: -2.1894, lng: -79.8890, country: "Ecuador", city: "Guayaquil", region: "south_america" as const, difficulty: "medium" as const },
  { lat: -32.8895, lng: -68.8458, country: "Argentina", city: "Mendoza", region: "south_america" as const, difficulty: "medium" as const },
  { lat: -12.9777, lng: -38.5016, country: "Brazil", city: "Salvador", region: "south_america" as const, difficulty: "medium" as const },
  { lat: -17.7833, lng: -63.1833, country: "Bolivia", city: "Santa Cruz", region: "south_america" as const, difficulty: "medium" as const },
  { lat: -16.4090, lng: -71.5375, country: "Peru", city: "Arequipa", region: "south_america" as const, difficulty: "medium" as const },
  // New South America - Hard
  { lat: 4.9372, lng: -52.3260, country: "French Guiana", city: "Cayenne", region: "south_america" as const, difficulty: "hard" as const },
  { lat: -3.1190, lng: -60.0217, country: "Brazil", city: "Manaus", region: "south_america" as const, difficulty: "hard" as const },
  { lat: -34.9627, lng: -54.9442, country: "Uruguay", city: "Punta del Este", region: "south_america" as const, difficulty: "hard" as const },
  { lat: -41.1335, lng: -71.3103, country: "Argentina", city: "Bariloche", region: "south_america" as const, difficulty: "hard" as const },
  { lat: -27.1127, lng: -109.3497, country: "Chile", city: "Easter Island", region: "south_america" as const, difficulty: "hard" as const },

  // New Africa - Easy
  { lat: -26.2041, lng: 28.0473, country: "South Africa", city: "Johannesburg", region: "africa" as const, difficulty: "easy" as const },
  { lat: 30.0131, lng: 31.2089, country: "Egypt", city: "Giza", region: "africa" as const, difficulty: "easy" as const },
  { lat: 31.6295, lng: -7.9811, country: "Morocco", city: "Marrakech", region: "africa" as const, difficulty: "easy" as const },
  { lat: 36.8065, lng: 10.1815, country: "Tunisia", city: "Tunis", region: "africa" as const, difficulty: "easy" as const },
  { lat: 9.0192, lng: 38.7469, country: "Ethiopia", city: "Addis Ababa", region: "africa" as const, difficulty: "easy" as const },
  // New Africa - Medium
  { lat: 16.0244, lng: -16.5049, country: "Senegal", city: "Saint-Louis", region: "africa" as const, difficulty: "medium" as const },
  { lat: -8.8390, lng: 13.2894, country: "Angola", city: "Luanda", region: "africa" as const, difficulty: "medium" as const },
  { lat: -6.7924, lng: 39.2083, country: "Tanzania", city: "Dar es Salaam", region: "africa" as const, difficulty: "medium" as const },
  { lat: -15.3875, lng: 28.3228, country: "Zambia", city: "Lusaka", region: "africa" as const, difficulty: "medium" as const },
  { lat: -17.8252, lng: 31.0530, country: "Zimbabwe", city: "Harare", region: "africa" as const, difficulty: "medium" as const },
  // New Africa - Hard
  { lat: -25.9692, lng: 32.5732, country: "Mozambique", city: "Maputo", region: "africa" as const, difficulty: "hard" as const },
  { lat: -22.6784, lng: 14.5268, country: "Namibia", city: "Swakopmund", region: "africa" as const, difficulty: "hard" as const },
  { lat: -18.1492, lng: 49.4023, country: "Madagascar", city: "Toamasina", region: "africa" as const, difficulty: "hard" as const },
  { lat: 0.4162, lng: 9.4673, country: "Gabon", city: "Libreville", region: "africa" as const, difficulty: "hard" as const },
  { lat: -1.9441, lng: 30.0619, country: "Rwanda", city: "Kigali", region: "africa" as const, difficulty: "hard" as const },

  // New Oceania - Easy
  { lat: -34.9285, lng: 138.6007, country: "Australia", city: "Adelaide", region: "oceania" as const, difficulty: "easy" as const },
  { lat: -35.2809, lng: 149.1300, country: "Australia", city: "Canberra", region: "oceania" as const, difficulty: "easy" as const },
  { lat: -43.5321, lng: 172.6362, country: "New Zealand", city: "Christchurch", region: "oceania" as const, difficulty: "easy" as const },
  // New Oceania - Medium
  { lat: -42.8821, lng: 147.3272, country: "Australia", city: "Hobart", region: "oceania" as const, difficulty: "medium" as const },
  { lat: -9.4438, lng: 147.1803, country: "Papua New Guinea", city: "Port Moresby", region: "oceania" as const, difficulty: "medium" as const },
  { lat: -45.0312, lng: 168.6626, country: "New Zealand", city: "Queenstown", region: "oceania" as const, difficulty: "medium" as const },
  // New Oceania - Hard
  { lat: 6.9248, lng: 158.1611, country: "Micronesia", city: "Palikir", region: "oceania" as const, difficulty: "hard" as const },
  { lat: -0.5477, lng: 166.9187, country: "Nauru", city: "Yaren", region: "oceania" as const, difficulty: "hard" as const },
  { lat: -8.5211, lng: 179.1962, country: "Tuvalu", city: "Funafuti", region: "oceania" as const, difficulty: "hard" as const },
  { lat: 7.1190, lng: 171.3650, country: "Marshall Islands", city: "Majuro", region: "oceania" as const, difficulty: "hard" as const },
  { lat: -17.7333, lng: 168.3200, country: "Vanuatu", city: "Port Vila", region: "oceania" as const, difficulty: "hard" as const },

  // New Expert
  { lat: 78.0673, lng: 14.2120, country: "Svalbard", city: "Barentsburg", region: "europe" as const, difficulty: "expert" as const },
  { lat: 64.1743, lng: -51.7373, country: "Greenland", city: "Nuuk", region: "north_america" as const, difficulty: "expert" as const },
  { lat: -54.9341, lng: -67.6109, country: "Chile", city: "Puerto Williams", region: "south_america" as const, difficulty: "expert" as const },
  { lat: -77.8460, lng: 166.6683, country: "Antarctica", city: "McMurdo Station", region: "oceania" as const, difficulty: "expert" as const },
  { lat: -51.6978, lng: -57.8517, country: "Falkland Islands", city: "Stanley", region: "south_america" as const, difficulty: "expert" as const },
  { lat: -15.9277, lng: -5.7175, country: "Saint Helena", city: "Jamestown", region: "africa" as const, difficulty: "expert" as const },
];
