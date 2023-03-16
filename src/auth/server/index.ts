/** https://github.com/nextauthjs/next-auth/blob/04791cd57478b64d0ebdfc8fe25779e2f89e2070/packages/frameworks-solid-start/src/index.ts#L1 */

import { Auth } from "@auth/core";
import type { AuthAction, AuthConfig, Session } from "@auth/core/types";
import { serialize } from "cookie";
import { parseString, splitCookiesString, type Cookie } from "set-cookie-parser";

export interface SolidAuthConfig extends AuthConfig {
  /**
   * Defines the base path for the auth routes.
   * @default '/api/auth'
   */
  prefix?: string;
}

const actions: AuthAction[] = [
  "providers",
  "session",
  "csrf",
  "signin",
  "signout",
  "callback",
  "verify-request",
  "error",
];

// currently multiple cookies are not supported, so we keep the next-auth.pkce.code_verifier cookie for now:
// because it gets updated anyways
// src: https://github.com/solidjs/solid-start/issues/293
const getSetCookieCallback = (cook?: string | null): Cookie | undefined => {
  if (!cook) return;
  const splitCookie = splitCookiesString(cook);
  for (const cookName of [
    "__Secure-next-auth.session-token",
    "next-auth.session-token",
    "next-auth.pkce.code_verifier",
    "__Secure-next-auth.pkce.code_verifier",
  ]) {
    const temp = splitCookie.find((e) => e.startsWith(`${cookName}=`));
    if (temp) {
      return parseString(temp);
    }
  }
  return parseString(splitCookie?.[0] ?? ""); // just return the first cookie if no session token is found
};

export async function SolidAuthHandler(request: Request, prefix: string, authOptions: SolidAuthConfig) {
  const url = new URL(request.url);
  const action = url.pathname.slice(prefix.length + 1).split("/")[0] as AuthAction;

  if (!actions.includes(action) || !url.pathname.startsWith(prefix + "/")) {
    return;
  }

  const res = await Auth(request, authOptions);
  if (["callback", "signin", "signout"].includes(action)) {
    const parsedCookie = getSetCookieCallback(res.clone().headers.get("Set-Cookie"));
    if (parsedCookie) {
      res.headers.set("Set-Cookie", serialize(parsedCookie.name, parsedCookie.value, parsedCookie as any));
    }
  }
  return res;
}

export async function getSession(req: Request, options: AuthConfig): Promise<Session | null> {
  options.secret ??= process.env.AUTH_SECRET;
  options.trustHost ??= true;

  const url = new URL("/api/auth/session", req.url);
  const response = await Auth(new Request(url, { headers: req.headers }), options);

  const { status = 200 } = response;

  const data = await response.json();

  if (!data || !Object.keys(data).length) return null;
  if (status === 200) return data;
  throw new Error(data.message);
}
