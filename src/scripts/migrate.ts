import { config } from "dotenv";
import { migrate } from "drizzle-orm/planetscale-serverless/migrator";
import { db } from "~/db/drizzle-db";

config({ path: ".env" });

const main = async () => {
  await migrate(db, { migrationsFolder: "migrations" });
};

main().catch(console.error);
