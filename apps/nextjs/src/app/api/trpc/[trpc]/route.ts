import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createContext } from "~/server/context";
import { appRouter } from "~/server/routers/_app";
import { createGetUser } from "~/shared/server-rsc/get-user";

export const runtime = "edge";

const handler = (request: NextRequest) => {
  const req = new Request(request.url, {
    headers: request.headers,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    keepalive: request.keepalive,
    method: request.method,
    mode: request.mode,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    signal: request.signal,
    body: request.body,
  });

  // We have to call cookies() in this file and then pass them in or Next.js's App Router will complain.
  const asyncStorageCookies = cookies();

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext(opts) {
      return createContext({
        type: "api",
        getUser: createGetUser(asyncStorageCookies),
        ...opts,
      });
    },
    onError({ error }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error("Caught TRPC error:", error);
      }
    },
  });
};

export { handler as GET, handler as POST };
