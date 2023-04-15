"use client";

import { useState, type FC } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { api } from "../../../trpc/client/trpc-client";

const CreatePostForm: FC = () => {
  const [postTitle, setPostTitle] = useState("");
  const [postText, setPostText] = useState("");
  const createPostMutation = api.example.createPost.useMutation();

  const canCreatePost = postTitle && postText;
  return (
    <form
      className="flex w-full flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canCreatePost) throw new Error("invalid input"); // the ui should have prevented this
        void createPostMutation.mutateAsync({ title: postTitle, text: postText });
      }}
    >
      <div className="flex justify-between">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="password">Title</Label>
          <div className="flex w-full items-center space-x-2">
            <Input
              id="postTitle"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              className="flex-1"
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="password">Content</Label>
          <div className="flex w-full items-center space-x-2">
            <Input
              id="postText"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="flex-1"
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button disabled={!canCreatePost}>Post Publicly</Button>
      </div>
    </form>
  );
};

export default CreatePostForm;
