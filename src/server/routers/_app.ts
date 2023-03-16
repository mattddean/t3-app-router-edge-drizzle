/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from "../trpc";
import { exampleRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  whoami: publicProcedure.query(({ ctx }) => {
    return ctx.user ?? null;
  }),
});

export type AppRouter = typeof appRouter;
