import type { FC } from "react";
import { PostsTable } from "~/components/posts-table";
import SignInButtons from "~/components/sign-in-options";
import { rsc } from "~/shared/server-rsc/trpc";
import { HydrateClient } from "~/trpc/client/hydrate-client";

export const runtime = "edge";

export const metadata = {
  title: "Home",
  description: "Home",
};

/* @ts-expect-error Async Server Component */
const Home: FC = async () => {
  const pageSizes: [number, number, number] = [10, 25, 50];
  const initialPageSize = pageSizes[0];

  // Fetch the first page of data that PostsTable will look for so that it
  // can be dehydrated, passed to the client, and instantly retrieved.
  const [user] = await Promise.all([
    rsc.whoami.fetch(),
    rsc.example.getInfinitePosts.fetchInfinite({ limit: initialPageSize }),
  ]);

  const dehydratedState = await rsc.dehydrate();
  return (
    <>
      <div className="h-12" />
      <div className="flex w-full flex-col items-center gap-8">
        {!user && <SignInButtons />}

        {/* Provide dehydrated state to client components. */}
        <HydrateClient state={dehydratedState}>
          <PostsTable pageSizes={pageSizes} initialPageSize={initialPageSize} />
        </HydrateClient>
      </div>
    </>
  );
};

export default Home;
