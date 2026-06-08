import { sql, type SQL } from "drizzle-orm";
import { locations } from "@db/schema";

/** Only locations with a verified Mapillary street-view image. */
export function hasStreetViewCondition(): SQL {
  return sql`${locations.streetViewId} IS NOT NULL AND ${locations.streetViewId} != ''`;
}
