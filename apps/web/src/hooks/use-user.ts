import { trpc } from "@/lib/trpc";

export function useUser() {
  let getUser = trpc.getUser.useQuery();

  return {
    isLoading: getUser.isLoading,
    user: getUser.data,
    error: getUser.error,
  };
}
