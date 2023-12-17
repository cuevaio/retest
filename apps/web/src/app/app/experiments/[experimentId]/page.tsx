import { notFound } from "next/navigation";

import { getXataClient } from "@/lib/xata";

import { Metrics } from "./metrics";
import { Variants } from "./varitants";

let xata = getXataClient();

const Page = async ({ params }: { params: { experimentId: string } }) => {
  const { experimentId } = params;

  const experiment = await xata.db.experiments
    .select(["*"])
    .filter({ id: experimentId.replace("exp_", "rec_") })
    .getFirst();

  if (!experiment) {
    return notFound();
  }

  return (
    <div>
      <h1>{experiment.name}</h1>
      <div className="space-y-8 w-64">
        <Metrics />
        <Variants />
      </div>
    </div>
  );
};

export default Page;
