import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/routers/_app";

export type Inputs = inferRouterInputs<AppRouter>;
export type Outputs = inferRouterOutputs<AppRouter>;
