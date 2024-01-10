import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../trpc";

import { getXataClient } from "@/lib/xata";
import { getWorkspace } from "./utils";
let xata = getXataClient();

export const experimentsRoutes = {
  createExperiment: protectedProcedure
    .input(
      z
        .object({
          name: z.string(),
          description: z.string().optional(),
          startedAt: z.date(),
          endedAt: z.date(),
          sampleSizeAbsolute: z.number().optional(),
          sampleSizeRelative: z.number().max(1).min(0).optional(),
          workspaceHandle: z.string(),
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
      const {
        ctx: { user },
        input,
      } = opts;

      let inputWithoutWorkspaceHandle = {
        ...input,
        workspaceHandle: undefined,
      };
      let workspace = await getWorkspace({
        userId: user.id,
        workspaceHandle: input.workspaceHandle,
      });
      let experiment = await xata.db.experiments.create({
        ...inputWithoutWorkspaceHandle,
        workspace: workspace.id,
        creator: user.id,
      });
      return experiment;
    }),

  getActiveExperiments: protectedProcedure
    .input(z.object({ workspaceHandle: z.string() }))
    .query(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;

      let workspace = await getWorkspace({
        userId: user.id,
        workspaceHandle: input.workspaceHandle,
      });

      let experiments = await xata.db.experiments
        .filter({
          endedAt: {
            $ge: new Date(),
          },
          workspace: workspace.id,
        })
        .sort("startedAt", "asc")
        .getAll();

      return experiments;
    }),

  getInactiveExperiments: protectedProcedure
    .input(z.object({ workspaceHandle: z.string() }))
    .query(async (opts) => {
      const {
        ctx: { user },
        input,
      } = opts;

      let workspace = await getWorkspace({
        userId: user.id,
        workspaceHandle: input.workspaceHandle,
      });

      let experiments = await xata.db.experiments
        .filter({
          endedAt: {
            $lt: new Date(),
          },
          workspace: workspace.id,
        })
        .sort("startedAt", "asc")
        .getAll();

      return experiments;
    }),

  getActiveExperimentsWithVariants: publicProcedure.query(async () => {
    let experiments = await xata.db.experiments
      .select([
        "*",
        {
          name: "<-variants.experiment",
          as: "variants",
          sort: [{ name: "asc" }],
          columns: ["name"],
        },
        {
          name: "<-events.experiment",
          as: "events",
          sort: [{ name: "asc" }],
          columns: ["name"],
        },
      ])
      .filter({
        endedAt: {
          $ge: new Date(),
        },
        variantCount: {
          $ge: 1,
        },
      })
      .sort("startedAt", "asc")
      .getAll();

    return experiments;
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
};
