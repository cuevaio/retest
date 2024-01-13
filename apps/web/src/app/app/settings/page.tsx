"use client";

import * as React from "react";

import { Title } from "@/components/title";
import { useUser } from "@/hooks/use-user";
import { Button } from "@retestlabs/ui/button";
import { Input } from "@retestlabs/ui/input";
import { Label } from "@retestlabs/ui/label";
import { cn } from "@retestlabs/utils/cn";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";


const Page = () => {
  let { user } = useUser();

  let [editNameMode, setEditNameMode] = React.useState(false);

  let queryClient = useQueryClient();

  let getUserKey = getQueryKey(trpc.getUser);
  let updateName = trpc.updateName.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(getUserKey);
      setEditNameMode(false);
    }
  });

  if (!user) return <div className="p-4">loading...</div>;

  return (
    <div className="p-4">
      <Title>Account settings</Title>

      <p className="py-6 text-xs leading-none text-muted-foreground">
        {user.email}
      </p>

      <div className="divide-y divide-border border rounded">
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="name">Name</Label>
            <Button variant="ghost" onClick={() => setEditNameMode(!editNameMode)}
              className="h-min py-0 hover:bg-background text-muted-foreground"
              disabled={updateName.isLoading}
            >
              {editNameMode ? "Cancel" : "Edit"}
            </Button>
          </div>

          <form className={cn("flex space-x-4", { "hidden": !editNameMode })}
            onSubmit={(event) => {
              event.preventDefault();

              let formData = new FormData(event.currentTarget);
              let name = formData.get("name") as string;

              updateName.mutate({ name });
            }}
          >
            <Input id="name" name="name" placeholder="Albert Einstein" defaultValue={user.name || undefined} className="w-72" />
            <Button type="submit" disabled={updateName.isLoading}>Save</Button>
          </form>

          <p className={cn("text-sm leading-none text-muted-foreground", { "hidden": editNameMode })}>
            {user.name}
          </p>
        </div>
        <div className="p-4 space-y-1">
          <Label>Email</Label>
          <p className="text-sm leading-none text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>
    </div>
  );
}


export default Page;

