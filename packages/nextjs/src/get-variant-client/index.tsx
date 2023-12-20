import { useExperiments } from "../use-experiments";

export function getVariantClient(experiment: string) {
  let experiments = useExperiments();

  let exp = experiments.data?.find((e) => e.experiment === experiment);
  if (!exp) return undefined;
  return {
    variant: exp.variant,
    startedAt: exp.startedAt,
    endedAt: exp.endedAt,
  };
}
