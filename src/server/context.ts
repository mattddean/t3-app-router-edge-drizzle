/* eslint-disable @typescript-eslint/no-unused-vars */
import type { inferAsyncReturnType } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { GetUser, User } from "~/shared/server-rsc/get-user";

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(opts: { user: User | null; rsc: boolean }) {
  return {
    user: opts.user,
  };
}

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(
  // HACKs because we can't import `next/cookies` in `/api`-routes
  opts:
    | {
        type: "rsc";
        getUser: GetUser;
      }
    | (FetchCreateContextFnOptions & { type: "api"; getUser: GetUser }),
) {
  // for API-response caching see https://trpc.io/docs/caching

  // RSC
  if (opts.type === "rsc") {
    return {
      type: opts.type,
      user: await opts.getUser(),
    };
  }

  // not RSC
  return {
    type: opts.type,
    user: await opts.getUser(),
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
