"use client";

import { trpc } from "@/lib/trpc";
import { useParams } from "next/navigation";

import { CheckSquareIcon, LineChartIcon } from "lucide-react";

import { AddMetric } from "./add-metric";
import { MetricCard } from "./metric-card";

export const Metrics = () => {
  let { experimentId } = useParams<{ experimentId: string }>();
  let listMetrics = trpc.listMetrics.useQuery({ experimentId });

  if (!listMetrics.data) {
    return null;
  }

  let metrics = listMetrics.data;

  return (
    <div className="w-full rounded border">
      <div className="flex px-4 py-2 items-center text-primary bg-muted">
        <div className="flex-0">
          <LineChartIcon className="w-4 h-4 font-light" />
        </div>
        <p className="flex-grow px-3 font-bold">Metrics</p>
      </div>
      <div className="flex px-4 py-2 items-center border-t text-muted-foreground">
        <div className="flex-0">
          <CheckSquareIcon className="w-4 h-4 font-light" />
        </div>
        <p className="flex-grow px-3 text-sm">impressions</p>
      </div>
      {metrics.map((metric) => (
        <MetricCard key={metric.id} {...metric} />
      ))}
      <AddMetric />
    </div>
  );
};
