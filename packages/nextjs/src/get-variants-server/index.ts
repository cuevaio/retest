import { cookies } from "next/headers";

export function getVariantsServer() {
  const cookieStore = cookies();

  const retestCookies = cookieStore.getAll().filter((cookie) => {
    return cookie.name.startsWith("rt-");
  });

  let retestExperiments = new Map<
    number,
    {
      experiment: string;
      variant: string;
      startedAt: string;
      endedAt: string;
    }
  >();

  retestCookies.forEach((cookie) => {
    const [_, idx, type] = cookie.name.split("-");
    const value = cookie.value;
    const index = Number(idx);
    if (!retestExperiments.has(Number(index))) {
      retestExperiments.set(Number(index), {
        experiment: "",
        variant: "",
        startedAt: "",
        endedAt: "",
      });
    }

    if (type === "exp") {
      retestExperiments.get(index)!.experiment = value;
    } else if (type === "var") {
      retestExperiments.get(index)!.variant = value;
    } else if (type === "sta") {
      retestExperiments.get(index)!.startedAt = value;
    } else if (type === "end") {
      retestExperiments.get(index)!.endedAt = value;
    }
  });

  let experiments = Array.from(retestExperiments.values());

  return experiments;
}
