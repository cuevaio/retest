import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { auth } from "@/auth";

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: CreateNextContextOptions) {
  const session = await auth();

  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
