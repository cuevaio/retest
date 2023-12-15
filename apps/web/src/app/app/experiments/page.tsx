export const dynamic = "force-dynamic";

import { getXataClient } from "@/lib/xata";

import { Suspense } from "react";
import { PastExperiments } from "./past-experiments";
import { Button } from "@retestlabs/ui/button";
import Link from "next/link";
import { UpcomingExperiments } from "./upcoming-experiments";
import { ExperimentCard } from "./experiment-card";

let xata = getXataClient();

const Page = async () => {
  let experiments = await xata.db.experiments
    .filter({
      $all: [
        {
          startedAt: {
            $le: new Date(),
          },
        },
        {
          endedAt: {
            $ge: new Date(),
          },
        },
      ],
    })
    .sort("endedAt", "asc")
    .getAll();

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <h1 className="font-bold">Experiments</h1>
        <Button asChild>
          <Link href="/app/experiments/create">New experiment</Link>
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {experiments.map((experiment) => (
          <ExperimentCard
            variant="active"
            key={experiment.id}
            {...experiment}
          />
        ))}
      </div>

      <Suspense>
        <UpcomingExperiments />
      </Suspense>

      <Suspense>
        <PastExperiments />
      </Suspense>
    </div>
  );
};

export default Page;
