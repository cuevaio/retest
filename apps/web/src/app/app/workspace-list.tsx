"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";

export const WorkspaceList = () => {
  let listWorskpaces = trpc.listWorkspaces.useQuery();

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {listWorskpaces.data?.map((w) => (
          <div key={w.id} className="p-4 rounded border relative">
            <p>{w?.name}</p>
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
