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

import { Title } from "@/components/title";
import { Invitations } from "./invitations";
import { useUser } from "@/hooks/use-user";

const MembersPage = () => {
  const params = useParams<{ workspace: string }>();

  let listWorspaceUsers = trpc.listWorspaceUsers.useQuery({
    workspaceHandle: params.workspace,
  });

  let { user } = useUser();

  let isOwner =
    listWorspaceUsers.data?.find((u) => u.email === user?.email)?.role ===
    "owner";

  return (
    <div>
      <Title>Members</Title>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>_</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {listWorspaceUsers.data?.map((user) => (
            <TableRow key={user.email}>
              <TableCell className="font-medium">
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {isOwner && <Invitations />}
    </div>
  );
};

export default MembersPage;
