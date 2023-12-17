"use client";
import * as React from "react";

import { useQuery } from "@tanstack/react-query";
import { Experiment } from "../types/experiment";

export function generateRetestClient<Experiments extends readonly Experiment[]>(
  experiments: Experiments,
) {
  type ExperimentToVariantMap = {
    [K in Experiments[number]["name"]]: Extract<
      Experiments[number],
      { name: K }
    >["variants"][number];
  };

  type ExperimentToEventMap = {
    [K in Experiments[number]["name"]]: Extract<
      Experiments[number],
      { name: K }
    >["events"][number];
  };

  function VariantComponent<K extends keyof ExperimentToVariantMap>({
    name,
    children,
  }: {
    name: ExperimentToVariantMap[K];
    children: React.ReactNode;
  }) {
    return <>{children}</>;
  }

  function ExperimentComponent<K extends keyof ExperimentToVariantMap>({
    name,
    children,
  }: {
    name: K;
    children: React.ReactNode;
  }) {
    let { isLoading, variant } = useRetest(name);

    if (isLoading) {
      return null;
    }

    if (variant === undefined) {
      return null;
    }

    const childrenArray = React.Children.toArray(children);

    let variantToRender = childrenArray.find(
      (child) =>
        React.isValidElement(child) &&
        child.type === VariantComponent &&
        child.props.name === variant,
    );

    if (variantToRender === undefined) {
      return null;
    }

    return variantToRender;
  }

  function useRetest<K extends keyof ExperimentToVariantMap>(experiment: K) {
    let getVariantQuery = useQuery<GetVariantData>({
      queryKey: [experiment],
      queryFn: async () => {
        let res = await fetch(
          `/api/retest/getVariant?experiment=${experiment}`,
        );
        let data = await res.json();
        return data;
      },
    });

    let variant: ExperimentToVariantMap[K] | undefined =
      getVariantQuery.data?.variant;
    if (
      getVariantQuery.data?.experiment.started_at &&
      getVariantQuery.data?.experiment.ended_at
    ) {
      let now = new Date().toISOString();
      if (
        now < getVariantQuery.data.experiment.started_at ||
        now > getVariantQuery.data.experiment.ended_at
      ) {
        variant = undefined;
      }
    }

    function trackEvent(event: ExperimentToEventMap[K]) {
      fetch(`/api/retest/trackEvent?experiment=${experiment}&event=${event}`, {
        method: "POST",
      });
    }

    return { isLoading: getVariantQuery.isLoading, variant, trackEvent };
  }

  return {
    Experiment: ExperimentComponent,
    Variant: VariantComponent,
    useRetest,
  };
}

type GetVariantData = {
  variant: string;
  experiment: {
    started_at: string;
    ended_at: string;
  };
};
