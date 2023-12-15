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
  createMetric: publicProcedure
    .input(
      z.object({
        experimentId: z.string(),
        name: z.string(),
        type: z.enum(["conversion", "duration", "call"]),
      }),
    )
    .mutation(async (opts) => {
      const { input } = opts;
      let metric = await xata.db.metrics.create({
        name: input.name,
        type: input.type,
        experiment: input.experimentId.replace("exp_", "rec_"),
      });
      return metric;
    }),
  listMetrics: publicProcedure
    .input(z.object({ experimentId: z.string() }))
    .query(async (opts) => {
      const { input } = opts;
      let metrics = await xata.db.metrics
        .filter({
          experiment: input.experimentId.replace("exp_", "rec_"),
        })
        .getAll();
      return metrics;
    }),

  renameMetric: publicProcedure
    .input(z.object({ metricId: z.string(), name: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;
      let metric = await xata.db.metrics.update(input.metricId, {
        name: input.name,
      });
      return metric;
    }),

  deleteMetric: publicProcedure
    .input(z.object({ metricId: z.string() }))
    .mutation(async (opts) => {
      const { input } = opts;
      let metric = await xata.db.metrics.delete(input.metricId);
      return metric;
    }),
});
