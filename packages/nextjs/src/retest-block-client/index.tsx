"use client";

import { type Experiment } from "../types/experiment";
import { generateUseRetestClient } from "../use-retest-client";

type ExperimentToVariantMap<Experiments extends readonly Experiment[]> = {
  [K in Experiments[number]["name"]]: Extract<
    Experiments[number],
    { name: K }
  >["variants"][number];
};

export function generateRetestBlockClient<
  Experiments extends readonly Experiment[],
>(experiments: Experiments) {
  const useRetestClient = generateUseRetestClient(experiments);

  /**
   * `RetestBlockClient` is a component that uses the `useRetestClient` hook to fetch experiment data.
   * It then renders different components based on the state of the experiment.
   *
   * @param {Object} props The properties passed to the component.
   * @param {K} props.experiment The name of the experiment to fetch data for. This should be a key in `ExperimentToVariantMap<Experiments>`.
   * @param {Object} props.components An object mapping variant names and experiment states to the components that should be rendered for them.
   * - The keys can be variant names, "isLoading", or "hasEnded". The values should be React nodes.
   * - If the "isLoading" key is present, its value will be rendered while the experiment data is being fetched.
   * - If the "hasEnded" key is present, its value will be rendered if the experiment has ended.
   * - For each variant of the experiment, if a key matching the variant name is present, its value will be rendered if that variant is active.
   * - All keys are optional, but at least one variant name should be provided.
   *
   * @returns {React.ReactNode} The component corresponding to the current state of the experiment, or `null` if no matching component is found.
   *
   * @example
   * ```tsx
   * import { RetestBlockClient } from '@/lib/retest/client';
   *
   * const MyComponent = () => (
   *   <RetestBlockClient
   *     experiment="experiment1"
   *     components={{
   *       variant1: <div>Variant 1 is active</div>,
   *       variant2: <div>Variant 2 is active</div>,
   *       isLoading: <div>Loading...</div>,
   *       hasEnded: <div>Experiment has ended</div>,
   *     }}
   *   />
   * );
   * ```
   */
  function RetestBlockClient<
    K extends keyof ExperimentToVariantMap<Experiments>,
  >({
    experiment,
    components,
  }: {
    experiment: K;
    components: Partial<{
      [V in
        | ExperimentToVariantMap<Experiments>[K]
        | "isLoading"
        | "hasEnded"]: React.ReactNode;
    }>;
  }): React.ReactNode {
    let { data, isLoading, error } = useRetestClient(experiment);
    if (isLoading) return components["isLoading"] || null;
    if (error) return null;

    if (data?.experiment.status === "ended") {
      return components["hasEnded"] || null;
    }

    if (!data?.variant) return null;

    let variantToShow = components[data?.variant];
    if (!variantToShow) return null;

    return variantToShow;
  }

  return RetestBlockClient;
}
