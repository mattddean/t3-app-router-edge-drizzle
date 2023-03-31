import type { FC } from "react";
import SignInButtons from "~/components/sign-in-options";
import { rsc } from "~/shared/server-rsc/trpc";
import CreatePostForm from "./create-post-form";

export const runtime = "edge";
export const revalidate = 0;
export const metadata = {
  title: "Create Post",
  description: "Create a new post.",
};

/* @ts-expect-error Async Server Component */
const CreatePost: FC = async () => {
  const user = await rsc.whoami.fetch();

  return (
    <>
      <div className="h-12" />
      <div className="flex w-full max-w-[600px] flex-col items-center gap-4">
        {!user && <SignInButtons />}

        {!!user ? <CreatePostForm /> : <div>You must sign in to create a post.</div>}
      </div>
    </>
  );
};

export default CreatePost;
