/**
 * This file makes sure that we can get a storage that is unique to the current request context
 */

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-types */

import type { AsyncLocalStorage } from "async_hooks";

// https://github.com/vercel/next.js/blob/canary/packages/next/client/components/request-async-storage.ts
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
export const asyncStorage: AsyncLocalStorage<any> | {} =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  require("next/dist/client/components/request-async-storage").requestAsyncStorage;

function throwError(msg: string) {
  throw new Error(msg);
}
export function getRequestStorage<T>(): T {
  if ("getStore" in asyncStorage) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return asyncStorage.getStore() ?? throwError("Couldn't get async storage");
  }

  return asyncStorage as T;
}
