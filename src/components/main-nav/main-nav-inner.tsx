"use client";

import Link from "next/link";
import { FC, forwardRef } from "react";
import { LogoIcon } from "~/components/icons";
import { cn } from "~/components/ui/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { siteConfig } from "~/config/site";

const ListItem = forwardRef<React.ElementRef<typeof Link>, React.ComponentPropsWithoutRef<typeof Link>>(
  ({ className, title, children, href, ...props }, _ref) => {
    return (
      <li>
        <Link href={href} passHref legacyBehavior {...props}>
          <NavigationMenuLink
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100 dark:hover:bg-slate-700 dark:focus:bg-slate-700",
              className,
            )}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-slate-500 dark:text-slate-400">{children}</p>
          </NavigationMenuLink>
        </Link>
      </li>
    );
  },
);
ListItem.displayName = "ListItem";

export interface Props {
  user: boolean;
}

export const MainNavInner: FC<Props> = ({ user }) => {
  return (
    <div className="hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <LogoIcon className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">{siteConfig.name}</span>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          {user && (
            <NavigationMenuItem>
              <NavigationMenuTrigger className="h-9">Posts</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <Link href="/" passHref legacyBehavior>
                      <NavigationMenuLink
                        className="flex h-full w-full select-none 
                    flex-col justify-end space-y-2 rounded-md bg-gradient-to-b from-rose-500 to-indigo-700 p-6 no-underline outline-none focus:shadow-md"
                      >
                        <div className="text-lg font-medium text-white">{siteConfig.name}</div>
                        <p className="text-sm leading-snug text-white/90">{siteConfig.description}</p>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                  <ListItem href="/posts/create" title="Create Post">
                    Post a new Post.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};
