"use client";
import useSWR from "swr";

import { ExperimentVariant } from "../types/experiment";

function getExperiments() {
  let _experiments = new Map<string, ExperimentVariant>();

  decodeURIComponent(document.cookie)
    .split("; ")
    .filter((cookie) => {
      return cookie.startsWith("rt-");
    })
    .forEach((cookie) => {
      const [key, value] = cookie.split("=");
      if (!key || !value) return;

      const [_, index, type] = key.split("-");
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

export function useExperiments() {
  let { data, isLoading, error } = useSWR("experiments", getExperiments);
  return { data, isLoading, error };
}
