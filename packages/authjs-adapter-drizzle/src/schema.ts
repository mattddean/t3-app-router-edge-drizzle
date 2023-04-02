import { datetime, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// The simplest way to produce the Schema type containing the required fields is just to
// create an example schema and export the type that Drizzle infers. This represents the minimum fields
// required by Auth.js to produce the right TypeScript types, and is not a good example of a complete schema,
// which should include indexes, and may contain foreign key constraints and more fields.

const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(),
  userId: varchar("userId", { length: 191 }).notNull(),
  type: varchar("type", { length: 191 }).notNull(),
  provider: varchar("provider", { length: 191 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
  access_token: text("access_token"),
  expires_in: int("expires_in"),
  id_token: text("id_token"),
  refresh_token: text("refresh_token"),
  refresh_token_expires_in: int("refresh_token_expires_in"),
  scope: varchar("scope", { length: 191 }),
  token_type: varchar("token_type", { length: 191 }),
  createdAt: timestamp("createdAt").defaultNow().onUpdateNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(),
  sessionToken: varchar("sessionToken", { length: 191 }).notNull(),
  userId: varchar("userId", { length: 191 }).notNull(),
  expires: datetime("expires").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow().onUpdateNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

const users = mysqlTable("users", {
  id: varchar("id", { length: 191 }).primaryKey().notNull(),
  name: varchar("name", { length: 191 }),
  email: varchar("email", { length: 191 }).notNull(),
  emailVerified: timestamp("emailVerified"),
  image: varchar("image", { length: 191 }),
  created_at: timestamp("created_at").notNull().defaultNow().onUpdateNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

const verificationTokens = mysqlTable("verification_tokens", {
  identifier: varchar("identifier", { length: 191 }).primaryKey().notNull(),
  token: varchar("token", { length: 191 }).notNull(),
  expires: datetime("expires").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow().onUpdateNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

const schema = { accounts, sessions, users, verificationTokens };

export type Schema = typeof schema;
