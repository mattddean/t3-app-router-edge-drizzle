/**
 * This file contains the root router of your tRPC-backend
 */
import { publicProcedure, router } from "../trpc";
import { createExampleRouter } from "./example";

export const createAppRouter = () => {
  return router({
    example: createExampleRouter(),
    whoami: publicProcedure.query(({ ctx }) => {
      return ctx.user ?? null;
    }),
  });
};

export type AppRouter = ReturnType<typeof createAppRouter>;
