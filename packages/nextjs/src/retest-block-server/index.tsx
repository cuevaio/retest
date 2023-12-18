import { getVariantServer } from "../get-variant-server";
import { type Experiment } from "../types/experiment";

type ExperimentToVariantMap<Experiments extends readonly Experiment[]> = {
  [K in Experiments[number]["name"]]: Extract<
    Experiments[number],
    { name: K }
  >["variants"][number];
};

export function generateRetestBlockServer<
  Experiments extends readonly Experiment[],
>(experiments: Experiments) {
  function RetestBlockServer<
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
    let { variant: variantToShow } = getVariantServer(experiment);

    if (!variantToShow) {
      return null;
    }

    if (variantToShow !== variant) {
      return null;
    }

    return children;
  }

  return RetestBlockServer;
}
