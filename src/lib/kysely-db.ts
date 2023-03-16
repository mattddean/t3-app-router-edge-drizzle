import type { Account, Post, Session, User, VerificationToken } from "@prisma/client/edge";
import { PlanetScaleDialect } from "kysely-planetscale";
import { AuthedKysely, Codegen } from "~/auth/adapters/kysely";

export interface Database {
  Account: Account;
  Post: Post;
  Session: Session;
  User: User;
  VerificationToken: VerificationToken;
}

export const db = new AuthedKysely<Database, Codegen>({
  dialect: new PlanetScaleDialect({
    url: process.env.DATABASE_URL,
  }),
});
