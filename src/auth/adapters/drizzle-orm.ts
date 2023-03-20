import type { Adapter } from "@auth/core/adapters";
import { createId } from "@paralleldrive/cuid2";
import { and, eq } from "drizzle-orm/expressions";
import { PlanetScaleDatabase } from "drizzle-orm/planetscale-serverless";
import { accounts, sessions, users, verificationTokens } from "../../db/schema";

type ReturnData<T = never> = Record<string, Date | string | T>;

export function DrizzleAdapter(db: PlanetScaleDatabase): Adapter {
  // only supporting mysql on planetscale for now, so we hardcode these values
  // const adapter = db.getExecutor().adapter;
  // const supportsReturning = adapter.supportsReturning;
  const supportsReturning = false;
  // const storeDatesAsISOStrings = adapter instanceof SqliteAdapter;
  const storeDatesAsISOStrings = false;

  /** Helper function to return the passed in object and its specified prop
   * as an ISO string if SQLite is being used.
   **/
  function coerceInputData<T extends Partial<Record<K, Date | null>>, K extends keyof T>(data: T, key: K) {
    const value = data[key];
    return {
      ...data,
      [key]: value && storeDatesAsISOStrings ? value.toISOString() : value,
    };
  }

  /**
   * Helper function to return the passed in object and its specified prop as a date.
   * Necessary because SQLite has no date type so we store dates as ISO strings.
   **/
  function coerceReturnData<T extends Partial<ReturnData>, K extends keyof T>(
    data: T,
    key: K,
  ): Omit<T, K> & Record<K, Date>;
  function coerceReturnData<T extends Partial<ReturnData<null>>, K extends keyof T>(
    data: T,
    key: K,
  ): Omit<T, K> & Record<K, Date | null>;
  function coerceReturnData<T extends Partial<ReturnData<null>>, K extends keyof T>(data: T, key: K) {
    const value = data[key];
    return Object.assign(data, {
      [key]: value && typeof value === "string" ? new Date(value) : value,
    });
  }

  return {
    async createUser(data) {
      const userData = coerceInputData(data, "emailVerified");
      const now = new Date();
      await db.insert(users).values({
        id: createId(),
        created_at: now,
        updated_at: now,
        email: userData.email,
        emailVerified: userData.emailVerified,
        name: userData.name,
        image: userData.image,
      });
      const rows = await db.select().from(users).where(eq(users.email, userData.email)).limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return row;
    },
    async getUser(id) {
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return row;
    },
    async getUserByEmail(email) {
      const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return row;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const rows = await db
        .select()
        .from(users)
        .innerJoin(accounts, eq(users.id, accounts.userId))
        .where(and(eq(accounts.providerAccountId, providerAccountId), eq(accounts.provider, provider)))
        .limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return row.users;
    },
    async updateUser({ id, ...user }) {
      if (!id) throw new Error("User not found");
      const userData = coerceInputData(user, "emailVerified");
      await db.update(users).set(userData).where(eq(users.id, id));
      const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return coerceReturnData(row, "emailVerified");
    },
    async deleteUser(userId) {
      await db.delete(users).where(eq(users.id, userId));
    },
    async linkAccount(account) {
      await db.insert(accounts).values({
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
        .delete(accounts)
        .where(and(eq(accounts.providerAccountId, providerAccountId), eq(accounts.provider, provider)));
    },
    async createSession(data) {
      const sessionData = coerceInputData(data, "expires");
      await db.insert(sessions).values({
        id: createId(),
        expires: data.expires,
        sessionToken: data.sessionToken,
        userId: data.userId,
      });
      const rows = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionData.sessionToken)).limit(1);
      const row = rows[0];
      if (!row) throw new Error("User not found");
      return coerceReturnData(row, "expires");
    },
    async getSessionAndUser(sessionToken) {
      const rows = await db
        .select({
          user: users,
          session: {
            id: sessions.id,
            userId: sessions.userId,
            sessionToken: sessions.sessionToken,
            expires: sessions.expires,
          },
        })
        .from(sessions)
        .innerJoin(users, eq(users.id, sessions.userId))
        .where(eq(sessions.sessionToken, sessionToken))
        .limit(1);
      const row = rows[0];
      if (!row) return null;
      const { user, session } = row;
      return {
        user: coerceReturnData({ ...user }, "emailVerified"),
        session: coerceReturnData(
          { id: session.id, userId: session.userId, sessionToken: session.sessionToken, expires: session.expires },
          "expires",
        ),
      };
    },
    async updateSession(session) {
      const sessionData = coerceInputData(session, "expires");
      await db.update(sessions).set(sessionData).where(eq(sessions.sessionToken, session.sessionToken));
      const rows = await db.select().from(sessions).where(eq(sessions.sessionToken, sessionData.sessionToken)).limit(1);
      const row = rows[0];
      if (!row) throw new Error("Session not found");
      return coerceReturnData(row, "expires");
    },
    async deleteSession(sessionToken) {
      await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },
    async createVerificationToken(verificationToken) {
      const verificationTokenData = coerceInputData(verificationToken, "expires");
      await db.insert(verificationTokens).values({
        expires: verificationToken.expires,
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      });
      const rows = await db
        .select()
        .from(verificationTokens)
        .where(eq(verificationTokens.token, verificationTokenData.token))
        .limit(1);
      const row = rows[0];
      if (!row) throw new Error("Verification token not found");
      return coerceReturnData(row, "expires");
    },
    async useVerificationToken({ identifier, token }) {
      // First get the token while it still exists. TODO: need to add identifier to where clause?
      const rows = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token)).limit(1);
      const row = rows[0];
      // Then delete it.
      await db
        .delete(verificationTokens)
        .where(and(eq(verificationTokens.token, token), eq(verificationTokens.identifier, identifier)));
      // Then return it.
      if (!row) return null;
      return coerceReturnData(row, "expires");
    },
  };
}
