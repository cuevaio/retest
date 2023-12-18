import { type Experiment } from "../types/experiment";
import { getVariantClient } from "../get-variant-client";

type ExperimentToVariantMap<Experiments extends readonly Experiment[]> = {
  [K in Experiments[number]["name"]]: Extract<
    Experiments[number],
    { name: K }
  >["variants"][number];
};

export function generateRetestBlockClient<
  Experiments extends readonly Experiment[],
>(experiments: Experiments) {
  function RetestBlockClient<
    K extends keyof ExperimentToVariantMap<Experiments>,
  >({
    experiment,
    variant,
    children,
  }: {
    experiment: K;
    variant: ExperimentToVariantMap<Experiments>[K];
    children: React.ReactNode;
  }) {
    let { variant: variantToShow } = getVariantClient(experiment);

    if (!variantToShow) {
      return null;
    }

    if (variantToShow !== variant) {
      return null;
    }

    return children;
  }

  return RetestBlockClient;
}
