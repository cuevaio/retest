"use client";
import useSWR from "swr";

import { ExperimentVariant, Prettify } from "../types/experiment";
import { getExperimentsFromRetestCookies } from "../get-experiments-from-retest-cookies";

/**
 * `getExperiments` is a function that retrieves experiment data from cookies.
 * It reads all cookies that start with "rt-", decodes them using `decodeURIComponent`, and parses their values into an array of `ExperimentVariant` objects.
 * The parsing is done by the `getExperimentsFromRetestCookies` function.
 *

 * @returns {ExperimentVariant[]} An array of `ExperimentVariant` objects representing the experiments. Each `ExperimentVariant` object has the following properties:
 * - `experiment`: The name of the experiment.
 * - `variant`: The name of the variant.
 * - `startedAt`: The start time of the experiment.
 * - `endedAt`: The end time of the experiment.
 * - `status`: The status of the experiment, which can be "scheduled", "running", or "completed".
 *
 * @example
 * ```javascript
 * const experiments = getExperiments();
 * console.log(experiments);
 * // Output: [{ experiment: 'experiment1', variant: 'variant1', startedAt: '2022-01-01T00:00:00Z', endedAt: '2022-01-31T23:59:59Z', status: 'scheduled' }]
 * ```
 */
function getExperiments(): ExperimentVariant[] {
  // `decodeURIComponent` is a global JavaScript function that decodes a URI component.
  // This function reverses the encoding which was performed by `encodeURIComponent` or similar methods.
  // It is commonly used when reading data from a URL that may have been encoded for transmission.
  // It can decode any sequence of characters that have been percent-encoded, except those that correspond to a UTF-16 surrogate pair.
  let retestCookies = decodeURIComponent(document.cookie)
    .split("; ")
    .filter((cookie) => {
      return cookie.startsWith("rt-");
    })
    .map((cookie) => cookie.split("=") as [string, string]);

  let experiments = getExperimentsFromRetestCookies(retestCookies);
  return experiments;
}

/**
 * `useExperiments` is a custom React hook that reads experiment data from cookies using SWR and the `getExperiments` function.
 *
 * SWR is a React Hooks library for data fetching. The name "SWR" is derived from stale-while-revalidate, a cache invalidation strategy.
 * Even though no network request is made in this case, SWR provides benefits like automatic revalidation and caching.
 *
 * @returns {Object} An object containing the following properties:
 * - `data`: An array of `ExperimentVariant` objects representing the experiments. Each `ExperimentVariant` object has the following properties:
 **   - `experiment`: The name of the experiment.
 **   - `variant`: The name of the variant the end user will see.  If the experiment is `completed`, this will be the the best performing variant. If the experiment is `running`, this will be the variant the end user is currently bucketed into. If the experiment is `scheduled`, this will be `undefined`.
 **   - `startedAt`: The start time of the experiment.
 **   - `endedAt`: The end time of the experiment.
 **   - `status`: The status of the experiment, which is one of "scheduled", "running", or "completed".
 * - `isLoading`: A boolean indicating whether the data is currently being read.
 * - `error`: Any error that occurred while reading the data.
 *
 * @example
 * ```jsx
 * import { useExperiments } from './index';
 *
 * function MyComponent() {
 *   const { data, isLoading, error } = useExperiments();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {data.map((experiment, index) => (
 *         <li key={index}>
 *           Experiment: {experiment.experiment}, Variant: {experiment.variant}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useExperiments(): {
  data: Prettify<ExperimentVariant>[] | undefined;
  isLoading: boolean;
  error: any;
} {
  let { data, isLoading, error } = useSWR("experiments", getExperiments);
  return { data, isLoading, error };
}
