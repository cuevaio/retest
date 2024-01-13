"use client";

import { trpc } from "@/lib/trpc";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@retestlabs/ui/table";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { Input } from "@retestlabs/ui/input";
import { Button } from "@retestlabs/ui/button";
import { Title } from "@/components/title";

export const Invitations = () => {
  const params = useParams<{ workspace: string }>();
  let queryClient = useQueryClient();

  let listWorkspaceInvites = trpc.listWorkspaceInvites.useQuery({
    workspaceHandle: params.workspace,
  });

  let listWorkspaceInvitesKeys = getQueryKey(
    trpc.listWorkspaceInvites,
    {
      workspaceHandle: params.workspace,
    },
    "query",
  );

  let inviteUserToWorkspace = trpc.inviteUserToWorkspace.useMutation({
    onSuccess: () => {
      console.log("success");
      queryClient.invalidateQueries(listWorkspaceInvitesKeys);
    },
  });

  return (
    <>
      <Title>Invitations</Title>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Send</TableHead>
            <TableHead>-</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listWorkspaceInvites.data?.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">
                <div>
                  <p className="font-bold">{invite.owner?.name}</p>
                  <p className="text-muted-foreground">{invite.owner?.email}</p>
                </div>
              </TableCell>
              <TableCell>{invite.email}</TableCell>
              <TableCell>
                {invite.xata.updatedAt.toLocaleDateString()}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <form
        className="flex space-x-4 w-max mx-auto mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          let formData = new FormData(event.currentTarget);
          let email = formData.get("email") as string;
          inviteUserToWorkspace.mutate({
            workspaceHandle: params.workspace,
            email,
          });
        }}
      >
        <Input
          required
          name="email"
          type="email"
          placeholder="member@team.com"
        />
        <Button type="submit" disabled={inviteUserToWorkspace.isLoading}>
          Invite
        </Button>
      </form>
    </>
  );
};
