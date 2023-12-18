import { getVariantServer } from "../get-variant-server";
import { type Experiment } from "../types/experiment";

type ExperimentToVariantMap<Experiments extends readonly Experiment[]> = {
  [K in Experiments[number]["name"]]: Extract<
    Experiments[number],
    { name: K }
  >["variants"][number];
};

export function generateUseRetestServer<
  Experiments extends readonly Experiment[],
>(experiments: Experiments) {
  function useRetestServer<K extends keyof ExperimentToVariantMap<Experiments>>(
    experiment: K,
  ) {
    let { variant } = getVariantServer(experiment);

    return {
      variant: variant as ExperimentToVariantMap<Experiments>[K],
    };
  }

  return useRetestServer;
}
