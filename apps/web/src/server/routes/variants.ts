import { z } from "zod";

import { protectedProcedure, publicProcedure } from "../trpc";

import { getXataClient } from "@/lib/xata";
let xata = getXataClient();

export const variantsRoutes = {
  createVariant: protectedProcedure
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
};
