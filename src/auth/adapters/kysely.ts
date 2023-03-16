import type { Adapter } from "@auth/core/adapters";
import { createId } from "@paralleldrive/cuid2";
import { Kysely, SqliteAdapter } from "kysely";
import type { Database } from "~/lib/kysely-db";

// https://github.com/nextauthjs/next-auth/pull/5464

type ReturnData<T = never> = Record<string, Date | string | T>;

export function KyselyAdapter(db: Kysely<Database>): Adapter {
  const adapter = db.getExecutor().adapter;
  const supportsReturning = adapter.supportsReturning;
  const storeDatesAsISOStrings = adapter instanceof SqliteAdapter;

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
      const query = db.insertInto("User").values([
        {
          id: createId(),
          created_at: now,
          updated_at: now,
          email: userData.email,
          emailVerified: userData.emailVerified,
          name: userData.name,
          image: userData.image,
        },
      ]);
      const result = supportsReturning
        ? await query.returningAll().executeTakeFirstOrThrow()
        : await query.executeTakeFirstOrThrow().then(async () => {
            return await db
              .selectFrom("User")
              .selectAll()
              .where("email", "=", `${userData.email}`)
              .executeTakeFirstOrThrow();
          });
      return coerceReturnData(result, "emailVerified");
    },
    async getUser(id) {
      const result = (await db.selectFrom("User").selectAll().where("id", "=", id).executeTakeFirst()) ?? null;
      if (!result) return null;
      return coerceReturnData(result, "emailVerified");
    },
    async getUserByEmail(email) {
      const result = (await db.selectFrom("User").selectAll().where("email", "=", email).executeTakeFirst()) ?? null;
      if (!result) return null;
      return coerceReturnData(result, "emailVerified");
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const result =
        (await db
          .selectFrom("User")
          .innerJoin("Account", "User.id", "Account.userId")
          .selectAll("User")
          .where("Account.providerAccountId", "=", providerAccountId)
          .where("Account.provider", "=", provider)
          .executeTakeFirst()) ?? null;
      if (!result) return null;
      return coerceReturnData(result, "emailVerified");
    },
    async updateUser({ id, ...user }) {
      if (!id) throw new Error("User not found");
      const userData = coerceInputData(user, "emailVerified");
      const query = db.updateTable("User").set(userData).where("id", "=", id);
      const result = supportsReturning
        ? await query.returningAll().executeTakeFirstOrThrow()
        : await query.executeTakeFirstOrThrow().then(async () => {
            return await db.selectFrom("User").selectAll().where("id", "=", id).executeTakeFirstOrThrow();
          });
      return coerceReturnData(result, "emailVerified");
    },
    async deleteUser(userId) {
      await db.deleteFrom("User").where("User.id", "=", userId).execute();
    },
    async linkAccount(account) {
      const now = new Date();
      await db
        .insertInto("Account")
        .values([
          {
            id: createId(),
            createdAt: now,
            updatedAt: now,
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
          },
        ])
        .executeTakeFirstOrThrow();
    },
    async unlinkAccount({ providerAccountId, provider }) {
      await db
        .deleteFrom("Account")
        .where("Account.providerAccountId", "=", providerAccountId)
        .where("Account.provider", "=", provider)
        .executeTakeFirstOrThrow();
    },
    async createSession(data) {
      const sessionData = coerceInputData(data, "expires");
      const now = new Date();
      const query = db.insertInto("Session").values([
        {
          id: createId(),
          created_at: now,
          updated_at: now,
          expires: data.expires,
          sessionToken: data.sessionToken,
          userId: data.userId,
        },
      ]);
      const result = supportsReturning
        ? await query.returningAll().executeTakeFirstOrThrow()
        : await (async () => {
            await query.executeTakeFirstOrThrow();
            return await db
              .selectFrom("Session")
              .selectAll()
              .where("sessionToken", "=", sessionData.sessionToken)
              .executeTakeFirstOrThrow();
          })();
      return coerceReturnData(result, "expires");
    },
    async getSessionAndUser(sessionTokenArg) {
      const result = await db
        .selectFrom("Session")
        .innerJoin("User", "User.id", "Session.userId")
        .selectAll("User")
        .select(["Session.id as sessionId", "Session.userId", "Session.sessionToken", "Session.expires"])
        .where("Session.sessionToken", "=", sessionTokenArg)
        .executeTakeFirst();
      if (!result) return null;
      const { sessionId: id, userId, sessionToken, expires, ...user } = result;
      return {
        user: coerceReturnData({ ...user }, "emailVerified"),
        session: coerceReturnData({ id, userId, sessionToken, expires }, "expires"),
      };
    },
    async updateSession(session) {
      const sessionData = coerceInputData(session, "expires");
      const query = db.updateTable("Session").set(sessionData).where("Session.sessionToken", "=", session.sessionToken);
      const result = supportsReturning
        ? await query.returningAll().executeTakeFirstOrThrow()
        : await query.executeTakeFirstOrThrow().then(async () => {
            return await db
              .selectFrom("Session")
              .selectAll()
              .where("Session.sessionToken", "=", sessionData.sessionToken)
              .executeTakeFirstOrThrow();
          });
      return coerceReturnData(result, "expires");
    },
    async deleteSession(sessionToken) {
      await db.deleteFrom("Session").where("Session.sessionToken", "=", sessionToken).executeTakeFirstOrThrow();
    },
    async createVerificationToken(verificationToken) {
      const verificationTokenData = coerceInputData(verificationToken, "expires");
      const now = new Date();
      const query = db.insertInto("VerificationToken").values([
        {
          created_at: now,
          updated_at: now,
          expires: verificationToken.expires,
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      ]);
      const result = supportsReturning
        ? await query.returningAll().executeTakeFirstOrThrow()
        : await query.executeTakeFirstOrThrow().then(async () => {
            return await db
              .selectFrom("VerificationToken")
              .selectAll()
              .where("token", "=", verificationTokenData.token)
              .executeTakeFirstOrThrow();
          });
      return coerceReturnData(result, "expires");
    },
    async useVerificationToken({ identifier, token }) {
      const query = db
        .deleteFrom("VerificationToken")
        .where("VerificationToken.token", "=", token)
        .where("VerificationToken.identifier", "=", identifier);
      const result = supportsReturning
        ? (await query.returningAll().executeTakeFirst()) ?? null
        : await db
            .selectFrom("VerificationToken")
            .selectAll()
            .where("token", "=", token)
            .executeTakeFirst()
            .then(async (res) => {
              await query.executeTakeFirst();
              return res;
            });
      if (!result) return null;
      return coerceReturnData(result, "expires");
    },
  };
}

/**
 * The following is a reference of the database schema that @auth/core requires
 */

import type { Generated } from "kysely";

interface User {
  id: Generated<string>;
  name: string | null;
  email: string | null;
  emailVerified: Date | string | null;
  image: string | null;
}

interface Account {
  id: Generated<string>;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  access_token: string | null;
  expires_in: number | null;
  id_token: string | null;
  refresh_token: string | null;
  refresh_token_expires_in: number | null;
  scope: string | null;
  token_type: string | null;
  /** I don't think this property is actually required by @auth/core */
  // expires_at: number | null;
  /** I don't think this property is actually required by @auth/core */
  // session_state: string | null;
  /** I don't think this property is actually required by @auth/core */
  // oauth_token_secret: string | null;
  /** I don't think this property is actually required by @auth/core */
  // oauth_token: string | null;
}

interface Session {
  id: Generated<string>;
  userId: string;
  sessionToken: string;
  expires: Date | string;
}

interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date | string;
}

interface ReferenceSchema {
  User: User;
  Account: Account;
  Session: Session;
  VerificationToken: VerificationToken;
}

/**
 * Wrapper over the original Kysely class in order to validate the passed in
 * database interface. A regular Kysely instance may also be used, but wrapping
 * it ensures the database interface implements the fields that NextAuth
 * requires. When used with kysely-codegen, the Codegen type can be passed as
 * the second generic argument. The generated types will be used, and
 * AuthedKysely will only verify that the correct fields exist.
 **/
export class AuthedKysely<DB extends T, T = ReferenceSchema> extends Kysely<DB> {}

export type Codegen = {
  [K in keyof ReferenceSchema]: { [J in keyof ReferenceSchema[K]]: unknown };
};
