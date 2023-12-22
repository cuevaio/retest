import { ExperimentVariant, Prettify } from "../types/experiment";

/**
 * `getExperimentsFromRetestCookies` is a function that retrieves experiment data from cookies.
 * It reads all cookies that start with "rt-", and parses their values into an array of `ExperimentVariant` objects.
 *
 * Each cookie should have a key in the format "rt-{index}-{type}", where:
 * - {index} is a unique identifier for the experiment.
 * - {type} is one of "exp", "var", "sta", or "end", representing the experiment name, variant name, start time, and end time, respectively.
 *
 * The function filters out any experiments where any of the properties are empty strings.
 * It also determines the status of each experiment based on its start and end times.
 *
 * @param {Array} retestCookies An array of tuples, where each tuple contains a cookie name and value.
 * @returns {ExperimentVariant[]} An array of `ExperimentVariant` objects representing the experiments. Each `ExperimentVariant` object has the following properties:
 * - `experiment`: The name of the experiment.
 * - `variant`: The name of the variant. If the experiment is `completed`, this will be the the best performing variant. If the experiment is `running`, this will be the variant the end user is currently bucketed into. If the experiment is `scheduled`, this will be `undefined`.
 * - `startedAt`: The start time of the experiment.
 * - `endedAt`: The end time of the experiment.
 * - `status`: The status of the experiment, which can be "scheduled", "running", or "completed".
 *
 * @example
 * ```javascript
 * const retestCookies = [
 *   ['rt-1-exp', 'experiment1'],
 *   ['rt-1-var', 'variant1'],
 *   ['rt-1-sta', '2022-01-01T00:00:00Z'],
 *   ['rt-1-end', '2022-01-31T23:59:59Z'],
 * ];
 * const experiments = getExperimentsFromRetestCookies(retestCookies);
 * console.log(experiments);
 * // Output: [{ experiment: 'experiment1', variant: 'variant1', startedAt: '2022-01-01T00:00:00Z', endedAt: '2022-01-31T23:59:59Z', status: 'scheduled' }]
 * ```
 */
export function getExperimentsFromRetestCookies(
  retestCookies: [string, string][],
): ExperimentVariant[] {
  let _experiments = new Map<string, ExperimentVariant>();
  retestCookies.forEach(([name, value]) => {
    if (!name || !value) return;

    const [_, index, type] = name.split("-");
    if (!index || !type) return;

    if (!_experiments.has(index)) {
      _experiments.set(index, {
        experiment: "",
        variant: undefined,
        startedAt: "",
        endedAt: "",
        status: "scheduled",
      });
    }

    if (type === "exp") {
      _experiments.get(index)!.experiment = value;
    } else if (type === "var") {
      _experiments.get(index)!.variant = value;
    } else if (type === "sta") {
      _experiments.get(index)!.startedAt = value;
    } else if (type === "end") {
      _experiments.get(index)!.endedAt = value;
    }
  });

  // Filter out any experiments where any of the properties are empty strings.
  let __experiments = Array.from(_experiments.values()).filter(
    (experiment) =>
      experiment.experiment !== "" &&
      experiment.startedAt !== "" &&
      experiment.endedAt !== "",
  );
  let experiments: ExperimentVariant[] = [];

  __experiments.forEach((experiment) => {
    // Determine the status of each experiment based on its start and end times.
    let status: typeof experiment.status = "scheduled";
    if (experiment.startedAt < new Date().toISOString()) {
      status = "running";
    } else if (experiment.endedAt < new Date().toISOString()) {
      status = "completed";
    }

    if (status === "scheduled") {
      experiments.push({
        experiment: experiment.experiment,
        startedAt: experiment.startedAt,
        endedAt: experiment.endedAt,
        status,
        variant: undefined,
      });
    } else {
      if (!experiment.variant) return;
      experiments.push({
        experiment: experiment.experiment,
        startedAt: experiment.startedAt,
        endedAt: experiment.endedAt,
        status,
        variant: experiment.variant,
      });
    }
  });

  return experiments;
}
