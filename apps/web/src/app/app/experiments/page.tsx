"use client";

import { Button } from "@retestlabs/ui/button";
import Link from "next/link";
import { ExperimentCard } from "./experiment-card";
import { trpc } from "@/lib/trpc";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retestlabs/ui/accordion";

const Page = () => {
  let getActiveExperiements = trpc.getActiveExperiments.useQuery();
  let getInactiveExperiments = trpc.getInactiveExperiments.useQuery();

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h1 className="font-bold">Experiments</h1>
        <Button asChild>
          <Link href="/app/experiments/create">New experiment</Link>
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["running-experiments", "upcoming-experiments"]}
      >
        <AccordionItem value="running-experiments">
          <AccordionTrigger>Running experiments</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4">
              {getActiveExperiements.data
                ?.filter(
                  (experiment) =>
                    experiment.startedAt && experiment.startedAt < new Date(),
                )
                .map((experiment) => (
                  <ExperimentCard
                    variant="active"
                    key={experiment.id}
                    {...experiment}
                  />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="upcoming-experiments">
          <AccordionTrigger>Upcoming experiments</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4">
              {getActiveExperiements.data
                ?.filter(
                  (experiment) =>
                    experiment.startedAt && experiment.startedAt > new Date(),
                )
                .map((experiment) => (
                  <ExperimentCard
                    variant="upcoming"
                    key={experiment.id}
                    {...experiment}
                  />
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="past-experiments">
          <AccordionTrigger>Past experiments</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4">
              {getInactiveExperiments.data?.map((experiment) => (
                <ExperimentCard
                  variant="past"
                  key={experiment.id}
                  {...experiment}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Page;
