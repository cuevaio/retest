"use client";

import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback, AvatarImage } from "@retestlabs/ui/avatar";
import Link from "next/link";

export const WorkspaceList = () => {
  let listWorskpaces = trpc.listWorkspaces.useQuery();

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {listWorskpaces.data?.map((w) => (
          <div key={w.id} className="p-4 rounded border relative">
            <div className="flex items-center justify-start space-x-2">
              <Avatar>
                <AvatarImage src={w?.image?.url || undefined} alt={w?.name || undefined} />
                <AvatarFallback>{w?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="">
                <p className="font-semibold text-sm">{w?.name}</p>
                <p className="text-xs text-muted-foreground">{w?.handle}</p>
              </div>
            </div>
            <Link
              href={`/app/${w.handle}`}
              className="absolute top-0 bottom-0 right-0 left-0"
            ></Link>
          </div>
        ))}
      </div>
    </div>
  );
};
