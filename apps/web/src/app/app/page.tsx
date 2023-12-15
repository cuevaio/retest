import { Button } from "@retestlabs/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <div>
      <p>/app</p>
      <p>Maybe here we can list organizations the current user belongs to</p>
      <Button>
        <Link href="/app/experiments">Experiments</Link>
      </Button>
    </div>
  );
};

export default Page;
