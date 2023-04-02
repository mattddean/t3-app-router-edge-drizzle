interface SiteConfig {
  name: string;
  description: string;
  links: {
    twitter: string;
    github: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "T3 App Router (Edge)",
  description: "Example app.",
  links: {
    twitter: "https://twitter.com/matt_d_dean",
    github: "https://github.com/mattddean",
  },
};
