import { getXataClient } from "@/lib/xata";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@retestlabs/ui/accordion";
import { ExperimentCard } from "./experiment-card";

let xata = getXataClient();

export const UpcomingExperiments = async () => {
  let experiments = await xata.db.experiments
    .filter({
      $all: [
        {
          startedAt: {
            $gt: new Date(),
          },
        },
        {
          endedAt: {
            $gt: new Date(),
          },
        },
      ],
    })
    .sort("startedAt", "asc")
    .getAll();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Upcoming experiments</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-3 gap-4">
            {experiments.map((experiment) => (
              <ExperimentCard
                variant="upcoming"
                key={experiment.id}
                {...experiment}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
