"use client";

import { useQuery } from "@tanstack/react-query";

export function getVariantClient(experiment: string) {
  let { isLoading, data } = useQuery<{
    variant: string | undefined;
    startedAt: string | undefined;
    endedAt: string | undefined;
  }>({
    queryKey: ["getVariant", experiment],
    queryFn: async () => {
      let res = await fetch(`/api/retest/getVariant?experiment=${experiment}`);
      return res.json();
    },
  });

  return {
    isLoading,
    variant: data?.variant,
    startedAt: data?.startedAt,
    endedAt: data?.endedAt,
  };
}
