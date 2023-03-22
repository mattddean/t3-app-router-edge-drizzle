/**
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";
import { eq, gte } from "drizzle-orm/expressions";
import { z } from "zod";
import { getDb } from "~/db/drizzle-db";
import { posts } from "~/db/schema";
import { privateProcedure, publicProcedure, router } from "../trpc";

export const createExampleRouter = () => {
  return router({
    createPost: privateProcedure
      .input(
        z.object({
          text: z.string(),
          title: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const userEmail = ctx.user.email;
        if (!userEmail) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await getDb().insert(posts).values({
          id: createId(),
          user_id: ctx.user.id,
          slug: createId(),
          title: input.title,
          text: input.text,
        });
      }),

    getPost: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const files = await getDb()
        .select({ title: posts.title, text: posts.text })
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);
      const file = files[0];

      // NOT_FOUND is fine if the file exists but the user doesn't have access to it. This prevents revealing that the file exists.
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        title: file.title,
        text: file.text,
      };
    }),

    getInfinitePosts: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100),
          cursor: z.date().nullish(), // <-- "cursor" needs to exist to create an infinite query, but can be any type
        }),
      )
      .query(async ({ input }) => {
        const limit = input.limit ?? 50;

        const countRows = await getDb()
          .select({ files_count: sql<number>`count(${posts.id})`.as("files_count") })
          .from(posts);
        const totalCount = countRows[0]?.files_count;
        if (totalCount === undefined) throw new Error("Failed to query total file count");

        let itemsQuery = getDb()
          .select({ created_at: posts.created_at, slug: posts.slug, title: posts.title })
          .from(posts)
          .limit(input.limit);
        const cursor = input.cursor;
        if (cursor) {
          itemsQuery = itemsQuery.where(gte(posts.created_at, cursor));
        }
        const items = await itemsQuery.execute();

        let nextCursor: typeof input.cursor | undefined = undefined;
        if (items.length > limit) {
          // TODO: is this a safe assertion?
          const nextItem = items.pop() as NonNullable<(typeof items)[number]>;
          nextCursor = nextItem.created_at;
        }

        const returnableItems = items.map((item) => {
          return {
            title: item.title,
            created_at: item.created_at,
            slug: item.slug,
          };
        });

        return {
          items: returnableItems,
          nextCursor,
          totalCount,
        };
      }),
  });
};
