import { getXataClient } from "@/lib/xata";

import { type NextRequest } from "next/server";

let xata = getXataClient();

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  // const api_key = searchParams.get("api_key") || undefined;

  const hashedIpAddress = searchParams.get("hashedIpAddress") || undefined;
  const c = searchParams.get("country") || undefined;
  const b = searchParams.get("browser") || undefined;
  const os = searchParams.get("os") || undefined;

  if (!hashedIpAddress || !c || !os || !b) {
    return Response.json(
      {
        error: "Missing device data",
      },
      { status: 400 },
    );
  }

  let experiments = await xata.db.experiments
    .select(["id"])
    .filter({
      $all: [
        {
          endedAt: {
            $ge: new Date(),
          },
        },
        {
          variantCount: {
            $ge: 1,
          },
        },
      ],
    })
    .getAll();

  if (!experiments) {
    return Response.json(
      {
        error: "Experiments not found",
      },
      {
        status: 404,
      },
    );
  }

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
      hashedIpAddress,
    })
    .getFirst();
  let new_subject = false;

  if (!subject) {
    subject = await xata.db.subjects.create({
      hashedIpAddress,
      country,
    });
    new_subject = true;
  }

  let device =
    !new_subject &&
    (await xata.db.devices
      .filter({
        subject: subject.id,
        operatingSystem: operatingSystem.id,
        browser: browser.id,
      })
      .getFirst());

  if (!device) {
    device = await xata.db.devices.create({
      subject: subject.id,
      operatingSystem: operatingSystem.id,
      browser: browser.id,
    });
  }

  let subject_variants = await xata.db.subject_variant_relations
    .select([
      "id",
      "subject.id",
      "variant.id",
      "variant.name",
      "variant.experiment.id",
      "variant.experiment.name",
      "variant.experiment.startedAt",
      "variant.experiment.endedAt",
    ])
    .filter({
      "subject.id": subject.id,
      "variant.experiment.id": {
        $any: experiments.map((e) => e.id),
      },
    })
    .getAll();

  if (subject_variants.length === experiments.length) {
    return Response.json(
      subject_variants.map((sv) => ({
        variant: sv.variant?.name,
        experiment: sv.variant?.experiment?.name,
        startedAt: sv.variant?.experiment?.startedAt,
        endedAt: sv.variant?.experiment?.endedAt,
      })),
      {
        status: 200,
      },
    );
  } else {
    let experimentsToAssignVariant = experiments.filter((e) => {
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

    let experimentVariantRels = subject_variants.map((sv) => ({
      variant: sv.variant?.name,
      experiment: sv.variant?.experiment?.name,
      startedAt: sv.variant?.experiment?.startedAt,
      endedAt: sv.variant?.experiment?.endedAt,
    }));

    variantsToAssign.forEach((v) => {
      experimentVariantRels.push({
        variant: v?.name,
        experiment: v?.experiment?.name,
        startedAt: v?.experiment?.startedAt,
        endedAt: v?.experiment?.endedAt,
      });
    });

    return Response.json(experimentVariantRels, {
      status: 200,
    });
  }
};
