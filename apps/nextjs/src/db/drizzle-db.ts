import { connect } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

// Create the connection.
const connection = connect({
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

export const db = drizzle(connection);
