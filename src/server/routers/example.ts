/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { db } from "~/lib/kysely-db";
import { privateProcedure, publicProcedure, router } from "../trpc";

export const exampleRouter = router({
  createPost: privateProcedure
    .input(
      z.object({
        text: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // TODO: use a db transaction

      const userEmail = ctx.user.email;
      if (!userEmail) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .insertInto("Post")
        .values([
          {
            id: createId(),
            user_id: ctx.user.id,
            slug: createId(),
            title: input.title,
            text: input.text,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ])
        .executeTakeFirstOrThrow();
    }),

  getPost: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const file = await db
      .selectFrom("Post")
      .where("Post.slug", "=", input.slug)
      .select(["Post.title", "Post.text"])
      .executeTakeFirst();

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

      const totalCountQuery = db.selectFrom("Post").select([db.fn.count("Post.id").as("file_count")]);

      const totalCountResult = await totalCountQuery.execute();
      const totalCount = totalCountResult[0].file_count;

      let itemsQuery = db.selectFrom("Post").select(["Post.created_at", "Post.slug", "Post.title"]).limit(input.limit);

      const cursor = input.cursor;
      if (cursor) {
        itemsQuery = itemsQuery.where("Post.created_at", "<=", cursor);
      }

      const items = await itemsQuery.execute();

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > limit) {
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
