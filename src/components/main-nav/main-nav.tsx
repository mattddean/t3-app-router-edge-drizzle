import type { FC } from "react";
import { createRsc } from "../../shared/server-rsc/trpc";
import { MainNavInner } from "./main-nav-inner";

/* @ts-expect-error Async Server Component */
export const MainNav: FC = async () => {
  const user = createRsc().whoami.fetch();

  return <MainNavInner user={!!user} />;
};
