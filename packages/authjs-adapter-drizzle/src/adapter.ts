import type { Adapter } from "@auth/core/adapters";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm/expressions";
import type { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import type { Schema } from "./schema";

export function createDrizzleAdapter(db: PlanetScaleDatabase, schema: Schema): Adapter {
  return {
    async createUser(userData) {
      await db.insert(schema.users).values({
        id: createId(),
        email: userData.email,
        emailVerified: userData.emailVerified,
        name: userData.name,
        image: userData.image,
      });
      const rows = await db.select().from(schema.users).where(eq(schema.users.email, userData.email)).limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return row;
    },
    async getUser(id) {
      const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      const row = rows[0];
      return row ?? null;
    },
    async getUserByEmail(email) {
      const rows = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      const row = rows[0];
      return row ?? null;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const rows = await db
        .select()
        .from(schema.users)
        .innerJoin(schema.accounts, eq(schema.users.id, schema.accounts.userId))
        .where(and(eq(schema.accounts.providerAccountId, providerAccountId), eq(schema.accounts.provider, provider)))
        .limit(1);
      const row = rows[0];
      return row?.users ?? null;
    },
    async updateUser({ id, ...userData }) {
      if (!id) throw new Error("User not found");
      await db.update(schema.users).set(userData).where(eq(schema.users.id, id));
      const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return row;
    },
    async deleteUser(userId) {
      await db.delete(schema.users).where(eq(schema.users.id, userId));
    },
    async linkAccount(account) {
      await db.insert(schema.accounts).values({
        id: createId(),
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        type: account.type,
        userId: account.userId,
        // OpenIDTokenEndpointResponse properties
        access_token: account.access_token,
        expires_in: account.expires_in,
        id_token: account.id_token,
        refresh_token: account.refresh_token,
        refresh_token_expires_in: account.refresh_token_expires_in as number, // TODO: why doesn't the account type have this property?
        scope: account.scope,
        token_type: account.token_type,
      });
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await db
        .delete(schema.accounts)
        .where(and(eq(schema.accounts.providerAccountId, providerAccountId), eq(schema.accounts.provider, provider)));
    },
    async createSession(data) {
      await db.insert(schema.sessions).values({
        id: createId(),
        expires: data.expires,
        sessionToken: data.sessionToken,
        userId: data.userId,
      });
      const rows = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.sessionToken, data.sessionToken))
        .limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return row;
    },
    async getSessionAndUser(sessionToken) {
      const rows = await db
        .select({
          user: schema.users,
          session: {
            id: schema.sessions.id,
            userId: schema.sessions.userId,
            sessionToken: schema.sessions.sessionToken,
            expires: schema.sessions.expires,
          },
        })
        .from(schema.sessions)
        .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
        .where(eq(schema.sessions.sessionToken, sessionToken))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      const { user, session } = row;
      return {
        user,
        session: {
          id: session.id,
          userId: session.userId,
          sessionToken: session.sessionToken,
          expires: session.expires,
        },
      };
    },
    async updateSession(session) {
      await db.update(schema.sessions).set(session).where(eq(schema.sessions.sessionToken, session.sessionToken));
      const rows = await db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.sessionToken, session.sessionToken))
        .limit(1);
      const row = rows[0];
      if (!row) throw new Error("Coding bug: updated session not found");
      return row;
    },
    async deleteSession(sessionToken) {
      await db.delete(schema.sessions).where(eq(schema.sessions.sessionToken, sessionToken));
    },
    async createVerificationToken(verificationToken) {
      await db.insert(schema.verificationTokens).values({
        expires: verificationToken.expires,
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      });
      const rows = await db
        .select()
        .from(schema.verificationTokens)
        .where(eq(schema.verificationTokens.token, verificationToken.token))
        .limit(1);
      const row = rows[0];
      if (!row) throw new Error("Coding bug: inserted verification token not found");
      return row;
    },
    async useVerificationToken({ identifier, token }) {
      // First get the token while it still exists. TODO: need to add identifier to where clause?
      const rows = await db
        .select()
        .from(schema.verificationTokens)
        .where(eq(schema.verificationTokens.token, token))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      // Then delete it.
      await db
        .delete(schema.verificationTokens)
        .where(and(eq(schema.verificationTokens.token, token), eq(schema.verificationTokens.identifier, identifier)));
      // Then return it.
      return row;
    },
  };
}
