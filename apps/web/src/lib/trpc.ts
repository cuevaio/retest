import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "@/server";

export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> =
  createTRPCReact<AppRouter>({});
