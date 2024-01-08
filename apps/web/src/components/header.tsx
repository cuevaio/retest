import Link from "next/link";
import { UserButton } from "./user-button";

export const Header = () => {
  return (
    <div className="border-b">
      <div className="container">
        <div className="flex justify-between items-center px-4 my-3">
          <Link href="/" className="font-bold text-xl">
            Retest
          </Link>
          <UserButton />
        </div>
      </div>
    </div>
  );
};
