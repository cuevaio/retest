"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@retestlabs/ui/table";

const users = [
  {
    name: "Anthony Cueva",
    email: "hi.cuevantn@gmail.com",
    role: "admin",
  },
  {
    name: "Railly Hugo",
    email: "raillyhugo@gmail.com",
    role: "admin",
  },
];

function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>_</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
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
  );
}
const MembersPage = () => {
  return (
    <div>
      <h2 className="text-xl font-bold">Members</h2>
      <TableDemo />
    </div>
  );
};

export default MembersPage;
