import type { FC } from "react";
import { rsc } from "../../shared/server-rsc/trpc";
import { MainNavInner } from "./main-nav-inner";

/* @ts-expect-error Async Server Component */
export const MainNav: FC = async () => {
  const user = await rsc.whoami.fetch();

  return <MainNavInner user={!!user} />;
};
