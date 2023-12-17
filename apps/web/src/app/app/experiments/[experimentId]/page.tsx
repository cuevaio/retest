import { notFound } from "next/navigation";

import { getXataClient } from "@/lib/xata";

import { Events } from "./events";
import { Variants } from "./varitants";
import { DeleteForm } from "./delete-form";

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
        <Events />
        <Variants />

        <DeleteForm id={experiment.id} name={experiment.name} />
      </div>
    </div>
  );
};

export default Page;
