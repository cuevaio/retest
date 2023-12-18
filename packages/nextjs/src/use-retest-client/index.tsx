import { type Experiment } from "../types/experiment";
import { getVariantClient } from "../get-variant-client";

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

export function generateUseRetestClient<
  Experiments extends readonly Experiment[],
>(experiments: Experiments) {
  function useRetestClient<K extends keyof ExperimentToVariantMap<Experiments>>(
    experiment: K,
  ) {
    let { isLoading, variant, endedAt, startedAt } =
      getVariantClient(experiment);

    function trackEvent(event: ExperimentToEventMap<Experiments>[K]) {
      fetch(`/api/retest/trackEvent?experiment=${experiment}&event=${event}`, {
        method: "POST",
      });
    }

    return {
      isLoading,
      variant: variant as ExperimentToVariantMap<Experiments>[K],
      endedAt,
      startedAt,
      trackEvent,
    };
  }

  return useRetestClient;
}
