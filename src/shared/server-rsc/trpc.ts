import { cookies } from "next/headers";
import superjson from "superjson";
import { createContext } from "~/server/context";
import { createAppRouter } from "~/server/routers/_app";
import { createTRPCNextLayout } from "~/trpc/@trpc/next-layout";
import { createGetUser } from "./get-user";

export const createRsc = () => {
  return createTRPCNextLayout({
    router: createAppRouter(),
    transformer: superjson,
    createContext() {
      return createContext({
        type: "rsc",
        // We seem to be allowed to call cookies() here.
        getUser: createGetUser(cookies()),
      });
    },
  });
};
