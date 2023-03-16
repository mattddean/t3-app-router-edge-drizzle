export type { DefaultSession, Session } from "@auth/core/types";

/**
 * Module augmentation for `@auth/core/types` types
 * Allows us to add custom properties to the `session` object
 * and keep type safety
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "@auth/core/types" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
