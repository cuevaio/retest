import { generateUseRetestHook } from "../useRetestHook";
import { type Experiment } from "../types/experiment";

type ExperimentToVariantMap<Experiments extends readonly Experiment[]> = {
  [K in Experiments[number]["name"]]: Extract<
    Experiments[number],
    { name: K }
  >["variants"][number];
};

export function generateRetestClientComponent<
  Experiments extends readonly Experiment[],
>(experiments: Experiments) {
  const useRetest = generateUseRetestHook(experiments);

  function RetestClient<K extends keyof ExperimentToVariantMap<Experiments>>({
    experiment,
    variant,
    children,
  }: {
    experiment: K;
    variant: ExperimentToVariantMap<Experiments>[K];
    children: React.ReactNode;
  }) {
    let { variant: variantToShow } = useRetest(experiment);

    if (!variantToShow) {
      return null;
    }

    if (variantToShow !== variant) {
      return null;
    }

    return children;
  }

  return RetestClient;
}
