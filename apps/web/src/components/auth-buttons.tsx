import { Button } from "@retestlabs/ui/button";
import Link from "next/link";

export function SignIn(
  props: React.ComponentPropsWithRef<typeof Button>) {
  return (
    <Button {...props} asChild>
      <Link href="/api/auth/signin">
        Sign In
      </Link>
    </Button>
  )
}

export function SignOut() {
  return (
    <Button variant="ghost" className="w-full justify-start p-2 h-min" asChild>
      <Link href="/api/auth/signout">Sign Out</Link>
    </Button>
  )
}
