import { cookies } from "next/headers";
import { ExperimentVariant } from "../types/experiment";

export function getVariantsServer() {
  const cookieStore = cookies();

  const retestCookies = cookieStore.getAll().filter((cookie) => {
    return cookie.name.startsWith("rt-");
  });

  let _experiments = new Map<string, ExperimentVariant>();

  retestCookies.forEach((cookie) => {
    const value = cookie.value;
    const [_, index, type] = cookie.name.split("-");
    if (!index || !type) return;
    if (!_experiments.has(index)) {
      _experiments.set(index, {
        experiment: "",
        variant: "",
        startedAt: "",
        endedAt: "",
      });
    }

    if (type === "exp") {
      _experiments.get(index)!.experiment = value;
    } else if (type === "var") {
      _experiments.get(index)!.variant = value;
    } else if (type === "sta") {
      _experiments.get(index)!.startedAt = value;
    } else if (type === "end") {
      _experiments.get(index)!.endedAt = value;
    }
  });

  let experiments = Array.from(_experiments.values()).filter(
    (experiment) =>
      experiment.experiment !== "" &&
      experiment.variant !== "" &&
      experiment.startedAt !== "" &&
      experiment.endedAt !== "",
  );

  return experiments;
}
