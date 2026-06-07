import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let sqlClient: ReturnType<typeof postgres>;

export function getDb() {
  if (!instance) {
    sqlClient = postgres(env.databaseUrl);
    instance = drizzle(sqlClient, {
      schema: fullSchema,
    });
  }
  return instance;
}
