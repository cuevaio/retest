import { redirect } from "next/navigation";

import { Button } from "@retestlabs/ui/button";
import { Input } from "@retestlabs/ui/input";

import { auth } from "@/auth";
import { getXataClient } from "@/lib/xata";

let xata = getXataClient();

export const CreateWorkspace = () => {
  return (
    <form
      className="flex space-x-4 w-max mx-auto"
      action={async (formData: FormData) => {
        "use server";

        const session = await auth();
        if (!session?.user?.email) return;

        let name: string | undefined = formData
          .get("workspace-name")
          ?.toString();

        if (!name) {
          return;
        }
        let handle: string =
          name.trim().replace(/\s+/g, "-").toLowerCase() +
          "-" +
          Math.random().toString(36).substring(2, 8);

        let workspace = await xata.db.workspaces.create({
          name,
          handle,
        });

        let user = await xata.db.nextauth_users
          .filter({ email: session.user.email })
          .getFirstOrThrow();

        await xata.db.workspace_user_relations.create({
          workspace: workspace.id,
          user: user.id,
          isCreator: true,
        });

        redirect(`/app/${workspace.handle}`);
      }}
    >
      <Input name="workspace-name" placeholder="New workspace" />
      <Button type="submit" variant="secondary">
        Create
      </Button>
    </form>
  );
};
