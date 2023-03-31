import type { NextPage } from "next";
import SignInButtons from "~/components/sign-in-options";
import { rsc } from "~/shared/server-rsc/trpc";

export const runtime = "edge";
export const revalidate = 0;
export async function generateMetadata({ params }: Props) {
  const post = await rsc.example.getPost.fetch({ slug: params.slug });
  return {
    title: post.title,
    description: post.text.substring(0, 160),
  };
}

export interface Props {
  params: { slug: string };
}

/* @ts-expect-error Async Server Component */
const PostSlug: NextPage<Props> = async ({ params }) => {
  const user = await rsc.whoami.fetch();
  const post = await rsc.example.getPost.fetch({ slug: params.slug });

  return (
    <>
      <div className="h-12" />

      {!user && <SignInButtons />}

      <div className="flex w-full flex-col items-center gap-8">
        {post && (
          <>
            <div className="w-full max-w-[600px]">
              <div className="grid gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex w-full max-w-sm flex-col gap-4 text-2xl">{post.title}</div>
                </div>
              </div>
            </div>
            <div className="w-full max-w-[600px]">
              <div className="grid gap-4">
                <div className="flex flex-col gap-4">
                  <div className="flex w-full max-w-sm flex-col gap-4">{post.text}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default PostSlug;
