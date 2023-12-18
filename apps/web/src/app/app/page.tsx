import { Button } from "@retestlabs/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <div>
      <p>/app</p>
      <p>Maybe here we can list organizations the current user belongs to</p>
      <div className="flex space-x-6">
        <Button>
          <Link href="/app/experiments">Experiments</Link>
        </Button>
        <Button>
          <Link href="/app/setup">Setup your client</Link>
        </Button>
      </div>
    </div>
  );
};

export default Page;
