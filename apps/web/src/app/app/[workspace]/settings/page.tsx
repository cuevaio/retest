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
import { useParams, useRouter } from "next/navigation";


const Page = () => {
  const params = useParams<{ workspace: string }>();
  let router = useRouter();
  let getWorkspace = trpc.getWorkspace.useQuery({
    workspaceHandle: params.workspace,
  });


  let { user } = useUser();
  let workspace = getWorkspace.data;

  let [editNameMode, setEditNameMode] = React.useState(false);

  let queryClient = useQueryClient();

  let getWorkspaceKey = getQueryKey(trpc.getWorkspace);
  let updateWorkspaceName = trpc.updateWorkspaceName.useMutation({
    onSuccess: (data) => {
      queryClient.invalidateQueries(getWorkspaceKey);
      setEditNameMode(false);

      data && router.push(`/app/${data.handle}`);
    }
  });

  if (!user) return <div className="p-4">loading...</div>;
  if (!workspace) return <div className="p-4">loading...</div>;

  return (
    <div>
      <Title>Workspace settings</Title>

      <div className="divide-y divide-border border rounded mt-2">
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="name">Name</Label>
            <Button variant="ghost" onClick={() => setEditNameMode(!editNameMode)}
              className="h-min py-0 hover:bg-background text-muted-foreground"
              disabled={updateWorkspaceName.isLoading}
            >
              {editNameMode ? "Cancel" : "Edit"}
            </Button>
          </div>

          <form className={cn("flex space-x-4", { "hidden": !editNameMode })}
            onSubmit={(event) => {
              event.preventDefault();

              let formData = new FormData(event.currentTarget);
              let name = formData.get("name") as string;

              updateWorkspaceName.mutate({ name, workspaceHandle: params.workspace });
            }}
          >
            <Input id="name" name="name" placeholder="Albert Einstein" defaultValue={workspace.name || undefined} className="w-72" />
            <Button type="submit" disabled={updateWorkspaceName.isLoading}>Save</Button>
          </form>

          <p className={cn("text-sm leading-none text-muted-foreground", { "hidden": editNameMode })}>
            {workspace.name}
          </p>
        </div>
      </div>
    </div>
  );
}


export default Page;

