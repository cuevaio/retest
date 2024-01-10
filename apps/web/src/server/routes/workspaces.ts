import { z } from "zod";

import { protectedProcedure } from "../trpc";

import { WorkspacesRecord, getXataClient } from "@/lib/xata";
let xata = getXataClient();

export const workspacesRoutes = {
  listWorkspaces: protectedProcedure.query(async (opts) => {
    const {
      ctx: { user },
    } = opts;

    let rels = await xata.db.workspace_user_relations
      .select(["workspace.*"])
      .filter({
        user: user.id,
      })
      .getAll();

    let workspaces: WorkspacesRecord[] = [];

    rels.forEach((r) => {
      if (r.workspace) {
        workspaces.push(r.workspace);
      }
    });

    return workspaces;
  }),

  getWorkspace: protectedProcedure
    .input(z.object({ workspaceHandle: z.string() }))
    .query(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;
      let rel = await xata.db.workspace_user_relations
        .select(["workspace.*"])
        .filter({
          user: user.id,
          workspace: {
            handle: input.workspaceHandle,
          },
        })
        .getFirst();
      if (!rel) {
        throw new Error("Workspace not found");
      }
      return rel.workspace as Readonly<WorkspacesRecord>;
    }),
};
