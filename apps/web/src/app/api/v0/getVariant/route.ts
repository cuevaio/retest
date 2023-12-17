import { getXataClient } from "@/lib/xata";

import { type NextRequest } from "next/server";

let xata = getXataClient();

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  // const api_key = searchParams.get("api_key") || undefined;
  const e = searchParams.get("experiment") || undefined;
  if (!e) {
    return Response.json(
      {
        error: "Missing experiment",
      },
      { status: 400 },
    );
  }

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

  let experiment = await xata.db.experiments.filter({ name: e }).getFirst();

  if (!experiment) {
    return Response.json(
      {
        error: "Experiment not found",
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

  let subject_variant = await xata.db.subject_variant_relations
    .select(["id", "subject.id", "variant.id", "variant.name"])
    .filter({
      subject: subject.id,
      "variant.experiment": experiment.id,
    })
    .getFirst();

  if (subject_variant) {
    return Response.json(
      {
        variant: subject_variant.variant?.name,
        experiment: {
          started_at: experiment.startedAt,
          ended_at: experiment.endedAt,
        },
      },
      {
        status: 200,
      },
    );
  } else {
    let variants = await xata.db.variants
      .filter({ experiment: experiment.id })
      .getAll();

    if (variants.length === 0) {
      return Response.json(
        {
          error: "No variants found",
        },
        {
          status: 404,
        },
      );
    }

    let variant = variants.reduce((acc, cur) => {
      if (acc.subjectCounter < cur.subjectCounter) {
        return acc;
      } else {
        return cur;
      }
    });

    if (!variant) {
      return Response.json(
        {
          error: "No variant found",
        },
        {
          status: 404,
        },
      );
    }

    await Promise.all([
      xata.db.subject_variant_relations.create({
        subject: subject.id,
        variant: variant.id,
      }),
      xata.db.variants.update({
        id: variant.id,
        subjectCounter: {
          $increment: 1,
        },
      }),
    ]);

    return Response.json(
      {
        variant: variant?.name,
        experiment: {
          started_at: experiment.startedAt,
          ended_at: experiment.endedAt,
        },
      },
      {
        status: 200,
      },
    );
  }
};
