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
import { WrenchIcon } from "lucide-react";
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams<{ workspace: string }>();
  let getActiveExperiements = trpc.getActiveExperiments.useQuery({
    workspaceHandle: params.workspace,
  });
  let getInactiveExperiments = trpc.getInactiveExperiments.useQuery({
    workspaceHandle: params.workspace,
  });

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h1 className="font-bold">Experiments</h1>
        <div className="flex items-center space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/app/setup">
              <WrenchIcon className="mr-2 h-4 w-4" />
              Setup your project
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href={`/app/${params.workspace}/experiments/create`}>
              New experiment
            </Link>
          </Button>
        </div>
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
                    workspaceHandle={params.workspace}
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
                    workspaceHandle={params.workspace}
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
                  workspaceHandle={params.workspace}
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
