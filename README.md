# T3 App Router (Edge)

An experimental attempt at using the fantastic T3 Stack entirely on the Edge runtime, with Next.js's beta App Router.

This is meant to be a place of hacking and learning. We're still learning how to structure apps using Next.js's new App Router, and comments are welcome in Discussions.

If you encounter an error (you will), please create an Issue so that we can fix bugs and learn together.

**This is not intended for production.** For a production-ready full-stack application, use much more most stable [create-t3-app](https://github.com/t3-oss/create-t3-app).

This project is not affiliated with create-t3-app.

## Features

- Type-safe SQL with Kysely (plus Prisma schema management)
  - While create-t3-app uses Prisma, Prisma can't run on the Edge runtime.
- Type-safe API with tRPC
  - App Router implementation is based on [this](https://github.com/trpc/next-13).
  - Fetch data on the server and use it to hydrate react-query's cache on the client. The Posts table on the homepage uses this strategy.
  - The installed tRPC version is currently locked to the experimental App Router tRPC client in `./src/trpc/@trpc`. They specifically format their react-query query keys in a particular way that changed in later versions of tRPC. If you upgrade tRPC, hydration will stop working.
- Owned Authenticate with Auth.js
  - create-t3-app uses NextAuth, which doesn't support the Edge runtime. This project uses NextAuth's successor, Auth.js, which does. Since Auth.js hasn't built support for Next.js yet, their [SolidStart implementation](https://github.com/nextauthjs/next-auth/tree/OrJDev/main/packages/frameworks-solid-start/src) is used and slightly modified.
- Styling with [Tailwind](https://tailwindcss.com/)
  - It's just CSS, so it works just fine in the App Router.
- React components from [shadcn/ui](https://github.com/shadcn/ui)
  - It's also just CSS and Radix, so they work just fine in the App Router.
