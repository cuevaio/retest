import { CreateWorkspace } from "./create-workspace";
import { WorskpaceInvites } from "./workspace-invites";
import { WorkspaceList } from "./workspace-list";


const Page = () => {
  return (
    <div className="space-y-4 p-4">
      <div>
        <WorkspaceList />
      </div>
      <CreateWorkspace />
      <WorskpaceInvites />
    </div>
  );
};

export default Page;
