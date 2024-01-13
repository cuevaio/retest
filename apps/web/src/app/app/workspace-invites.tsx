"use client";

import { Title } from "@/components/title";
import { trpc } from "@/lib/trpc";
import { Button } from "@retestlabs/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@retestlabs/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

export const WorskpaceInvites = () => {
  let queryClient = useQueryClient();

  let listWorkspacesKey = getQueryKey(trpc.listWorkspaces);
  let listUserWorkspaceInvitesKey = getQueryKey(trpc.listUserWorkspaceInvites);

  let listUserWorkspaceInvites = trpc.listUserWorkspaceInvites.useQuery();

  let acceptWorkspaceInvite = trpc.acceptWorkspaceInvite.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(listWorkspacesKey);
      queryClient.invalidateQueries(listUserWorkspaceInvitesKey);
    },
  });
  let rejectWorkspaceInvite = trpc.rejectWorkspaceInvite.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries(listWorkspacesKey);
      queryClient.invalidateQueries(listUserWorkspaceInvitesKey);
    },
  });

  if (!listUserWorkspaceInvites || listUserWorkspaceInvites.data?.length === 0) {
    return (
      <div>
        <Title>Workspace Invites</Title>
        <p className="text-muted-foreground">No invites</p>
      </div>
    );
  }

  return (
    <div>
      <Title>Workspace Invites</Title>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Worskpace</TableHead>
            <TableHead>Invite send</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listUserWorkspaceInvites.data?.map(
            ({ id, workspace, owner, xata: { updatedAt } }) =>
              workspace?.handle &&
              owner && (
                <TableRow key={id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-bold">{owner.name}</p>
                      <p className="text-muted-foreground">{owner.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold">{workspace?.name}</p>
                      <p className="text-muted-foreground">
                        {workspace?.handle}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{updatedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-4">
                      <Button
                        variant="secondary"
                        disabled={
                          acceptWorkspaceInvite.isLoading ||
                          rejectWorkspaceInvite.isLoading
                        }
                        onClick={() => {
                          workspace.handle &&
                            acceptWorkspaceInvite.mutate({
                              workspaceHandle: workspace.handle,
                            });
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        disabled={
                          acceptWorkspaceInvite.isLoading ||
                          rejectWorkspaceInvite.isLoading
                        }
                        onClick={() => {
                          workspace.handle &&
                            rejectWorkspaceInvite.mutate({
                              workspaceHandle: workspace.handle,
                            });
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ),
          )}
        </TableBody>
      </Table>
    </div>
  );
};
