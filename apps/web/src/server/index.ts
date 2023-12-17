import { publicProcedure, router } from "./trpc";

import { z } from "zod";
import { getXataClient } from "@/lib/xata";

let xata = getXataClient();

export type AppRouter = typeof appRouter;

export const appRouter = router({
  getTodos: publicProcedure.query(async () => {
    return [
      { id: "1", text: "Buy milk", done: false },
      { id: "2", text: "Buy eggs", done: false },
    ];
  }),
  createExperiment: publicProcedure
    .input(
      z
        .object({
          name: z.string(),
          description: z.string().optional(),
          startedAt: z.date(),
          endedAt: z.date(),
          sampleSizeAbsolute: z.number().optional(),
          sampleSizeRelative: z.number().max(1).min(0).optional(),
        })
        .refine((data) => {
          const { sampleSizeAbsolute, sampleSizeRelative } = data;
          if (!sampleSizeAbsolute && !sampleSizeRelative) {
            throw new Error(
              "Either sampleSizeAbsolute or sampleSizeRelative must be provided",
            );
          }
          return true;
        }),
    )
    .mutation(async (opts) => {
      const { input } = opts;
      let experiment = await xata.db.experiments.create(input);
      return experiment;
    }),
  deleteExperiment: publicProcedure
    .input(z.object({ experimentId: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;
      let experiment = await xata.db.experiments.read(
        input.experimentId.replace("exp_", "rec_"),
      );

      if (!experiment) {
        throw new Error("Experiment not found");
      }

      await experiment.delete();

      return experiment;
    }),

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

  createVariant: publicProcedure
    .input(
      z.object({
        experimentId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;

      let experiment = await xata.db.experiments.read(
        input.experimentId.replace("exp_", "rec_"),
      );

      if (!experiment) {
        throw new Error("Experiment not found");
      }

      // CHECK IF THERE IS A VARIANT WITH THE SAME NAME
      let sameNameVariant = await xata.db.variants
        .filter({
          "experiment.id": input.experimentId.replace("exp_", "rec_"),
          name: input.name,
        })
        .getFirst();

      if (sameNameVariant) {
        throw new Error("Variant with the same name already exists");
      }

      let [variant, updated_experiment] = await Promise.all([
        xata.db.variants.create({
          name: input.name,
          experiment: input.experimentId.replace("exp_", "rec_"),
        }),

        experiment.update({
          variantCount: {
            $increment: 1,
          },
        }),
      ]);

      return variant;
    }),

  listVariants: publicProcedure
    .input(z.object({ experimentId: z.string() }))
    .query(async (opts) => {
      const { input } = opts;
      let variants = await xata.db.variants
        .filter({
          experiment: input.experimentId.replace("exp_", "rec_"),
        })
        .getAll();
      return variants;
    }),

  renameVariant: publicProcedure
    .input(z.object({ variantId: z.string(), name: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;

      let variant = await xata.db.variants.read(input.variantId);

      if (!variant) {
        throw new Error("Variant not found");
      }

      // CHECK IF THERE IS A VARIANT WITH THE SAME NAME
      let sameNameVariant = await xata.db.variants
        .filter({
          "experiment.id": variant.experiment?.id,
          name: input.name,
        })
        .getFirst();

      if (sameNameVariant) {
        throw new Error("Variant with the same name already exists");
      }

      await variant.update({
        name: input.name,
      });

      return variant;
    }),

  deleteVariant: publicProcedure
    .input(z.object({ variantId: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;
      let variant = await xata.db.variants.read(input.variantId);

      if (!variant) {
        throw new Error("Variant not found");
      }

      if (!variant.experiment) {
        throw new Error("Variant has no experiment");
      }
      let experiment = await xata.db.experiments.read(variant?.experiment?.id);

      if (!experiment) {
        throw new Error("Experiment not found");
      }

      await Promise.all([
        variant.delete(),
        experiment.update({
          variantCount: {
            $decrement: 1,
          },
        }),
      ]);

      return variant;
    }),
});
