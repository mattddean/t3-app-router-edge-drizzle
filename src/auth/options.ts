import GithubProvider from "@auth/core/providers/github";
import GoogleProvider from "@auth/core/providers/google";
import { getDb } from "~/db/drizzle-db";
import { DrizzleAdapter } from "./adapters/drizzle-orm";
import type { SolidAuthConfig } from "./server";

export const createAuthConfig = (): SolidAuthConfig => {
  return {
    // Configure one or more authentication providers
    adapter: DrizzleAdapter(getDb()),
    providers: [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore growing pains
      GithubProvider({
        clientId: process.env.GITHUB_ID as string,
        clientSecret: process.env.GITHUB_SECRET as string,
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore growing pains
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      }),
    ],
    callbacks: {
      session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
    },
    session: {
      strategy: "database",
    },
  };
};
