import { connect } from "@planetscale/database";
import { drizzle, PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";

/** Module scoped so that it can be reused among the connections */
let db: PlanetScaleDatabase;

/** Getter function to avoid surpassing 200ms Cloudflare Worker function setup limit */
export const getDb = () => {
  if (!db) {
    const connection = connect({
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    });
    db = drizzle(connection);
  }

  return db;
};
