import { createTRPCNextLayout } from "@acme/trpc-next-layout";
import { cookies } from "next/headers";
import superjson from "superjson";
import { createContext } from "~/server/context";
import { appRouter } from "~/server/routers/_app";
import { createGetUser } from "./get-user";

export const rsc = createTRPCNextLayout({
  router: appRouter,
  transformer: superjson,
  createContext() {
    return createContext({
      type: "rsc",
      // We seem to be allowed to call cookies() here.
      getUser: createGetUser(cookies()),
    });
  },
});
