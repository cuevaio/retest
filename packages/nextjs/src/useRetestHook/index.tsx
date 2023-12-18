import { type Experiment } from "../types/experiment";

type ExperimentToVariantMap<Experiments extends readonly Experiment[]> = {
  [K in Experiments[number]["name"]]: Extract<
    Experiments[number],
    { name: K }
  >["variants"][number];
};

type ExperimentToEventMap<Experiments extends readonly Experiment[]> = {
  [K in Experiments[number]["name"]]: Extract<
    Experiments[number],
    { name: K }
  > extends { events: infer E }
    ? E extends readonly string[]
      ? E[number]
      : never
    : never;
};

import { useQuery } from "@tanstack/react-query";

export function generateUseRetestHook<
  Experiments extends readonly Experiment[],
>(experiments: Experiments) {
  function useRetest<K extends keyof ExperimentToVariantMap<Experiments>>(
    experiment: K,
  ) {
    let { isLoading, data } = useQuery<{
      variant: string | undefined;
      startedAt: string | undefined;
      endedAt: string | undefined;
    }>({
      queryKey: ["getVariant", experiment],
      queryFn: async () => {
        let res = await fetch(
          `/api/retest/getVariant?experiment=${experiment}`,
        );
        return res.json();
      },
    });

    function trackEvent(event: ExperimentToEventMap<Experiments>[K]) {
      fetch(`/api/retest/trackEvent?experiment=${experiment}&event=${event}`, {
        method: "POST",
      });
    }

    return {
      isLoading,
      variant: data?.variant as ExperimentToVariantMap<Experiments>[K],
      trackEvent,
    };
  }

  return useRetest;
}
