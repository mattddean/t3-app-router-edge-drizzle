"use client";

import superjson from "superjson";
import { createHydrateClient } from "~/trpc/@trpc/next-layout";

export const HydrateClient = createHydrateClient({
  transformer: superjson,
});
