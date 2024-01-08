import { CreateWorkspace } from "./create-workspace";
import { WorkspaceList } from "./workspace-list";


const Page = () => {
  return (
    <div className="space-y-4 p-4">
      <div>
      <WorkspaceList />
        <div>TODO: list the workspaces sorted by how recently the user has seen it</div>
        <div>TODO: list the workspaces her has been invited to</div>
      </div>
      <CreateWorkspace />
    </div>
  );
};

export default Page;
