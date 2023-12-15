import { getXataClient } from "@/lib/xata";

import { notFound } from "next/navigation";
import { Metrics } from "./metrics";
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
      <Metrics />
    </div>
  );
};

export default Page;
