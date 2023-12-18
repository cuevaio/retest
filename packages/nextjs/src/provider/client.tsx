"use client";

import * as React from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 86400000,
    },
  },
});

const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
      <RetestVariants />
    </QueryClientProvider>
  );
};

const RetestVariants = () => {
  let getVariants = useQuery<
    {
      variant: string;
      experiment: string;
      startedAt: string;
      endedAt: string;
    }[]
  >({
    queryFn: async () => {
      const res = await fetch("/api/retest/getVariants");
      return res.json();
    },
    queryKey: ["getVariants"],
  });
  return (
    <div id="retest-variants">
      <pre className="text-xs">
        <code>{JSON.stringify(getVariants?.data, undefined, 2)}</code>
      </pre>
    </div>
  );
};

export { ClientProviders };
