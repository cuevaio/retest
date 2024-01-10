import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../trpc";

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

export const eventsRoutes = {
  createEvent: publicProcedure
    .input(
      z.object({
        experimentId: z.string(),
        name: z.string(),
        type: z.enum(["conversion", "duration", "call"]),
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;
      // CHECK IF EXPERIMENT EXISTS
      let experiment = await xata.db.experiments.read(
        input.experimentId.replace("exp_", "rec_"),
      );

      if (!experiment) {
        throw new Error("Experiment not found");
      }

      // CHECK IF THERE IS AN EVENT WITH THE SAME NAME
      let sameNameEvent = await xata.db.events
        .filter({
          "experiment.id": input.experimentId.replace("exp_", "rec_"),
          name: input.name,
        })
        .getFirst();

      if (sameNameEvent) {
        throw new Error("Event with the same name already exists");
      }

      let [event, updated_experiment] = await Promise.all([
        xata.db.events.create({
          name: input.name,
          type: input.type,
          experiment: input.experimentId.replace("exp_", "rec_"),
        }),

        experiment.update({
          eventCount: {
            $increment: 1,
          },
        }),
      ]);

      return event;
    }),
  listEvents: publicProcedure
    .input(z.object({ experimentId: z.string() }))
    .query(async (opts) => {
      const { input } = opts;
      let events = await xata.db.events
        .filter({
          experiment: input.experimentId.replace("exp_", "rec_"),
        })
        .getAll();
      return events;
    }),

  renameEvent: publicProcedure
    .input(z.object({ eventId: z.string(), name: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;
      let event = await xata.db.events.read(input.eventId);

      if (!event) {
        throw new Error("Event not found");
      }

      if (!event.experiment) {
        throw new Error("Event has no experiment");
      }

      // CHECK IF THERE IS AN EVENT WITH THE SAME NAME
      let sameNameEvent = await xata.db.events
        .filter({
          "experiment.id": event.experiment.id,
          name: input.name,
        })
        .getFirst();

      if (sameNameEvent) {
        throw new Error("Event with the same name already exists");
      }

      await event.update({
        name: input.name,
      });

      return event;
    }),

  deleteEvent: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;

      let event = await xata.db.events.read(input.eventId);

      if (!event) {
        throw new Error("Event not found");
      }

      if (!event.experiment) {
        throw new Error("Event has no experiment");
      }

      let experiment = await xata.db.experiments.read(event.experiment.id);

      if (!experiment) {
        throw new Error("Experiment not found");
      }

      await Promise.all([
        event.delete(),
        experiment.update({
          eventCount: {
            $decrement: 1,
          },
        }),
      ]);

      return event;
    }),
};
