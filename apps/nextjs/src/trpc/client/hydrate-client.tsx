"use client";

import { createHydrateClient } from "@acme/trpc-next-layout";
import superjson from "superjson";

export const HydrateClient = createHydrateClient({
  transformer: superjson,
});
