import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

export async function getWorkspace({
  userId,
  workspaceHandle,
}: {
  userId: string;
  workspaceHandle: string;
}) {
  let rel = await xata.db.workspace_user_relations
    .select(["workspace.id"])
    .filter({
      user: userId,
      workspace: {
        handle: workspaceHandle,
      },
    })
    .getFirst();

  if (!rel?.workspace) {
    throw new Error("Workspace not found");
  }

  let workspace = rel.workspace;
  return workspace;
}
