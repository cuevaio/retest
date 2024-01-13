import { Button } from "@retestlabs/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="font-bold text-3xl">
        The A/B testing platform for quick product teams
      </h1>
      <p>Hello friend</p>
      <Button asChild>
        <Link href="/app">Get Started</Link>
      </Button>
    </main>
  );
}
