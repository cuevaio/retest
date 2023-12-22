"use client";

import { type Experiment } from "../types/experiment";
import { useExperiments } from "../use-experiments";

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
    let { isLoading, error, data } = useExperiments();

    function trackEvent(event: ExperimentToEventMap<Experiments>[K]) {
      fetch(`/api/retest/trackEvent?experiment=${experiment}&event=${event}`, {
        method: "POST",
      });
    }

    if (isLoading || error || !data) {
      return {
        data: undefined,
        error,
        isLoading,
      };
    }

    let exp = data?.find((e) => e.experiment === experiment);
    if (!exp) {
      throw new Error(
        `Experiment ${experiment} not found. It's probably over.`,
      );
    }

    if (exp.status === "scheduled") {
      return {
        data: {
          variant: undefined,
          status: exp.status,
          startedAt: exp.startedAt,
          endedAt: exp.endedAt,
        },
        error,
        isLoading,
        trackEvent,
      };
    }

    return {
      data: {
        variant: exp.variant as ExperimentToVariantMap<Experiments>[K],
        status: exp.status,
        startedAt: exp.startedAt,
        endedAt: exp.endedAt,
      },
      error,
      isLoading,
      trackEvent,
    };
  }

  return useRetestClient;
}
