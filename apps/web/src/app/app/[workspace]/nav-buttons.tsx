"use client";

import { useParams } from "next/navigation";
import { Button } from "@retestlabs/ui/button";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@retestlabs/ui/avatar";
import { trpc } from "@/lib/trpc";

export const NavButtons = () => {
  const params = useParams<{ workspace: string }>();
  let getWorkspace = trpc.getWorkspace.useQuery({
    workspaceHandle: params.workspace,
  });

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="flex justify-start	w-full py-2 h-16 group"
        asChild
      >
        <Link href="/app">
          <Avatar className="w-12 h-12 group-hover:hidden">
            <AvatarFallback>{params.workspace[0]}</AvatarFallback>
          </Avatar>
          <span className="font-bold text-lg ml-2 group-hover:hidden">
            {getWorkspace.data?.name}
          </span>
          <span className="mx-auto hidden group-hover:block">
            Back to workspaces
          </span>
        </Link>
      </Button>

      <Button variant="ghost" className="w-full" asChild>
        <Link href={`/app/${params.workspace}/`}>Overview</Link>
      </Button>
      <Button variant="ghost" className="w-full" asChild>
        <Link href={`/app/${params.workspace}/experiments`}>Experiments</Link>
      </Button>
      <Button variant="ghost" className="w-full" asChild>
        <Link href={`/app/${params.workspace}/members`}>Members</Link>
      </Button>
    </div>
  );
};
