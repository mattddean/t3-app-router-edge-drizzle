export interface NavItem {
  title: string;
  href?: "/posts/create";
  disabled?: boolean;
  external?: boolean;
  label?: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export type MainNavItem = NavItem;

export type SidebarNavItem = NavItemWithChildren;

interface DocsConfig {
  sidebarNav: SidebarNavItem[];
}

export const docsConfig: DocsConfig = {
  sidebarNav: [
    {
      title: "Posts",
      items: [
        {
          title: "Create Post",
          href: "/posts/create",
          items: [],
        },
      ],
    },
  ],
};
