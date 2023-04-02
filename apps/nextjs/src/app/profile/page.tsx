import type { NextPage } from "next";
import SignInButtons from "~/components/sign-in-options";
import { rsc } from "../../shared/server-rsc/trpc";

export const runtime = "edge";
export const revalidate = 0;
export const metadata = {
  title: "Profile",
  description: "Your profile.",
};

/* @ts-expect-error Async Server Component */
const Home: NextPage = async () => {
  const user = await rsc.whoami.fetch();

  return (
    <>
      <div className="h-12" />

      <div className="flex w-full max-w-[600px] flex-col items-center gap-4">
        {!user && <SignInButtons />}

        {!!user ? (
          <div className="flex w-full max-w-[500px] flex-col gap-4">
            <div id="account-info">
              <h2 className="pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
                Account Information
              </h2>
              <div className="h-2"></div>
              <div className="flex flex-col rounded border border-slate-600 bg-slate-900">
                <div className="flex justify-between border-b-2 border-b-slate-800 p-4">
                  <div>Username</div>
                  <div>{user.name}</div>
                </div>
                <div className="flex justify-between p-4">
                  <div>Email</div>
                  <div>{user.email}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>You must sign in to view your profile.</div>
        )}
      </div>
    </>
  );
};

export default Home;
