import { initializeDatabase } from "../api/lib/db-init";

initializeDatabase()
  .then(() => {
    console.log("Database init complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
