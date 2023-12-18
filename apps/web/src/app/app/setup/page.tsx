export const dynamic = "force-dynamic";

import { Code } from "bright";

let code = (experiments: string) =>
  `
import { generateRetestClient } from "@retestlabs/nextjs";

export const experiments = ${experiments} as const;

export const { useRetest, Experiment, Variant } =
  generateRetestClient(experiments);
`.trim();
import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

const Page = async () => {
  let activeExperiments = await xata.db.experiments
    .select([
      "*",
      {
        name: "<-variants.experiment",
        as: "variants",
        sort: [{ name: "asc" }],
        columns: ["name"],
      },
      {
        name: "<-events.experiment",
        as: "events",
        sort: [{ name: "asc" }],
        columns: ["name"],
      },
    ])
    .filter({
      endedAt: {
        $ge: new Date(),
      },
      variantCount: {
        $ge: 1,
      },
    })
    .sort("startedAt", "asc")
    .getAll();

  let experiments = activeExperiments.map((experiment) => {
    return {
      name: experiment.name,
      variants: experiment.variants?.records.map((variant) => variant.name),
      events: experiment.events?.records.map((event) => event.name) ?? [],
    };
  });

  return (
    <div className="">
      <h1 className="font-bold">Paste this in your @/lib/retest.ts file</h1>
      <Code className="w-max" lang="ts">
        {code(JSON.stringify(experiments, undefined, 2))}
      </Code>
    </div>
  );
};

export default Page;
