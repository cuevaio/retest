import { getXataClient } from "@/lib/xata";

import { type NextRequest } from "next/server";

let xata = getXataClient();

import { z } from "zod";

const RequestBodySchema = z.object({
  ip: z.string(),
  country: z.string(),
  browser: z.string(),
  os: z.string(),
  experiments: z.array(z.string()),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const parsedBody = RequestBodySchema.safeParse(body);
    if (!parsedBody.success) {
      return Response.json(
        {
          error: parsedBody.error,
        },
        { status: 400 },
      );
    }

    const {
      ip,
      country: c,
      browser: b,
      os,
      experiments: exps,
    } = parsedBody.data;

    if (!ip || !c || !b || !os) {
      return Response.json(
        {
          error: "Missing hashed ip address, country or device data",
        },
        { status: 400 },
      );
    }

    let experiments = await xata.db.experiments
      .select(["id", "name", "startedAt", "endedAt"])
      .filter({
        name: {
          $any: exps,
        },
      })
      .getAll();

    if (
      !experiments ||
      experiments.length === 0 ||
      experiments.length !== exps.length
    ) {
      return Response.json(
        {
          error: "Experiments not found",
        },
        {
          status: 404,
        },
      );
    }

    let experimentVariants: {
      experiment: string;
      startedAt: string;
      endedAt: string;
      variant: string | undefined;
    }[] = [];

    let experimentsScheduled = experiments.filter((e) => {
      return e.startedAt && e.startedAt > new Date();
    });

    let experimentsRunning = experiments.filter((e) => {
      return (
        e.startedAt &&
        e.startedAt <= new Date() &&
        e.endedAt &&
        e.endedAt >= new Date()
      );
    });

    let experimentsCompleted = experiments.filter((e) => {
      return e.endedAt && e.endedAt < new Date();
    });

    console.log({
      experimentsScheduled,
      experimentsRunning,
      experimentsCompleted,
    });

    let [country, browser, operatingSystem] = await Promise.all([
      xata.db.countries.filter({ name: c }).getFirst(),
      xata.db.browsers.filter({ name: b }).getFirst(),
      xata.db.operating_systems.filter({ name: os }).getFirst(),
    ]);

    if (!country) {
      country = await xata.db.countries.create({ name: c });
    }

    if (!browser) {
      browser = await xata.db.browsers.create({ name: b });
    }

    if (!operatingSystem) {
      operatingSystem = await xata.db.operating_systems.create({ name: os });
    }

    let subject = await xata.db.subjects
      .filter({
        hashedIpAddress: ip,
      })
      .getFirst();

    if (!subject) {
      subject = await xata.db.subjects.create({
        hashedIpAddress: ip,
        country: country.id,
      });
    }

    let device = await xata.db.devices
      .filter({
        "subject.id": subject.id,
        "operatingSystem.id": operatingSystem.id,
        "browser.id": browser.id,
      })
      .getFirst();

    if (!device) {
      device = await xata.db.devices.create({
        subject: subject.id,
        operatingSystem: operatingSystem.id,
        browser: browser.id,
      });
    }

    // Scheduled experiments
    // push the start and end dates of the scheduled experiments, with no variant
    experimentsScheduled.forEach((experiment) => {
      experimentVariants.push({
        experiment: experiment.name,
        startedAt: experiment.startedAt?.toISOString() || "",
        endedAt: experiment.endedAt?.toISOString() || "",
        variant: undefined,
      });
    });

    // Running experiments
    let subject_variants = await xata.db.subject_variant_relations
      .select(["variant.id", "variant.name", "variant.experiment.id"])
      .filter({
        "subject.id": subject.id,
        "variant.experiment.id": {
          $any: experimentsRunning.map((e) => e.id),
        },
      })
      .getAll();

    if (subject_variants.length === experimentsRunning.length) {
      subject_variants.forEach((sv) => {
        let exp = experimentsRunning.find(
          (e) => e.id === sv.variant?.experiment?.id,
        );
        if (!exp) return;
        experimentVariants.push({
          variant: sv.variant?.name,
          experiment: exp.name,
          startedAt: exp.startedAt?.toISOString() || "",
          endedAt: exp.endedAt?.toISOString() || "",
        });
      });
    } else {
      let experimentsToAssignVariant = experimentsRunning.filter((e) => {
        return !subject_variants.find(
          (sv) => sv.variant?.experiment?.id === e.id,
        );
      });

      let variantsToAssign = await Promise.all(
        experimentsToAssignVariant.map(async (experiment) => {
          let variant = await xata.db.variants
            .select([
              "id",
              "name",
              "experiment.id",
              "experiment.name",
              "experiment.startedAt",
              "experiment.endedAt",
            ])
            .filter({ experiment: experiment.id })
            // get the variant with the least number of subjects
            .sort("subjectCounter", "asc")
            .getFirst();
          return variant;
        }),
      );

      await Promise.all([
        xata.db.subject_variant_relations.create(
          variantsToAssign.map((v) => ({
            subject: subject?.id,
            variant: v?.id,
          })),
        ),
        xata.db.variants.update(
          variantsToAssign.map((v) => ({
            id: v?.id || "",
            subjectCounter: {
              $increment: 1,
            },
          })),
        ),
      ]);

      subject_variants.forEach((sv) => {
        let exp = experimentsRunning.find(
          (e) => e.id === sv.variant?.experiment?.id,
        );
        if (!exp) return;

        experimentVariants.push({
          variant: sv.variant?.name,
          experiment: exp.name,
          startedAt: exp.startedAt?.toISOString() || "",
          endedAt: exp.endedAt?.toISOString() || "",
        });
      });
    }

    // Completed experiments

    // show the variant with most subjects
    await Promise.all(
      experimentsCompleted.map(async (experiment) => {
        let variant = await xata.db.variants
          .select(["id", "name"])
          .filter({ experiment: experiment.id })
          // get the variant with the most number of subjects
          .sort("subjectCounter", "desc")
          .getFirst();

        // TODO: what to do if there are no variants?
        if (!variant) return;

        experimentVariants.push({
          variant: variant?.name,
          experiment: experiment.name,
          startedAt: experiment.startedAt?.toISOString() || "",
          endedAt: experiment.endedAt?.toISOString() || "",
        });
      }),
    );

    return Response.json(experimentVariants, {
      status: 200,
    });
  } catch (error) {
    return Response.json(
      {
        error: JSON.stringify(error),
      },
      { status: 500 },
    );
  }
};

// TODO: FIX: Now, this is retrieving variants for running and upcoming experiments as well.
// We need to only retrieve variants for running experiments.
