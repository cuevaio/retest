import { getXataClient } from "@/lib/xata";

import { type NextRequest } from "next/server";

let xata = getXataClient();

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  // const api_key = searchParams.get("api_key") || undefined;

  const exps = searchParams.get("experiments") || undefined;

  if (!exps) {
    return Response.json(
      {
        error: "Missing experiments",
      },
      { status: 400 },
    );
  }

  let experiments = await xata.db.experiments
    .select(["id", "name", "startedAt", "endedAt"])
    .filter({
      name: {
        $any: exps.split(",") || [],
      },
    })
    .getAll();

  if (experiments.length === 0 || experiments.length < exps.split(",").length) {
    return Response.json(
      {
        error: "Experiments not found",
      },
      {
        status: 404,
      },
    );
  }

  let now = new Date();
  let invalidExperiments = experiments.some(
    (e) =>
      !e.startedAt || !e.endedAt || !(e.endedAt < now && e.startedAt < now),
  );

  if (invalidExperiments) {
    return Response.json(
      {
        error: "Experiment are not completed",
      },
      { status: 400 },
    );
  }

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

  let variants = await xata.db.variants
    .filter({
      "experiment.id": {
        $any: experiments.map((e) => e.id),
      },
    })
    .getAll();

  // random variant for each experiment
  // TODO: best variant for each experiment

  let bestVariants: {
    experiment: string;
    variant: string;
    endedAt: string;
    startedAt: string;
  }[] = [];

  experiments.forEach((exp) => {
    let expVariants = variants.filter((v) => v.experiment?.id === exp.id);
    let randomVariant =
      expVariants[Math.floor(Math.random() * expVariants.length)];
    if (randomVariant) {
      bestVariants.push({
        experiment: exp.name,
        variant: randomVariant.name,
        endedAt: exp.endedAt?.toISOString() || "",
        startedAt: exp.startedAt?.toISOString() || "",
      });
    }
  });
  return Response.json(bestVariants, {
    status: 200,
  });
};
