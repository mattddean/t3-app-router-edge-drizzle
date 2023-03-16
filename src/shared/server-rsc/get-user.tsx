import type { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/app-render";
import { db } from "~/lib/kysely-db";

export interface User {
  id: string;
  email: string;
  name: string | undefined;
}

export type GetUser = () => Promise<User | null>;

export function createGetUser(cookies: RequestCookies | ReadonlyRequestCookies) {
  return async () => {
    const newCookies = cookies.getAll().reduce((cookiesObj, cookie) => {
      cookiesObj[cookie.name] = cookie.value;
      return cookiesObj;
    }, {} as Record<string, string>);

    const sessionToken = newCookies["next-auth.session-token"] ?? newCookies["__Secure-next-auth.session-token"];
    if (!sessionToken) return null;

    const session = await db
      .selectFrom("Session")
      .innerJoin("User", "User.id", "Session.userId")
      .select(["User.email as user_email", "User.name as user_name", "User.id as user_id"])
      .executeTakeFirst();
    if (!session) return null;

    const user: User = {
      id: session.user_id,
      name: session.user_name ?? undefined,
      email: session.user_email,
    };
    return user;
  };
}
